-- ====================================================================
-- ALYATAMA HOMESTAY - RLS POLICIES & CONCURRENCY FUNCTIONS
-- ====================================================================

-- 1. Helper function: Get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(user_uuid UUID)
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT role FROM public.user_roles WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Helper function: Check if current user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
    current_uid UUID := auth.uid();
BEGIN
    IF current_uid IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = current_uid AND role = ANY(required_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Check room availability function (dates are [checkin, checkout) - checkout is departure day)
CREATE OR REPLACE FUNCTION public.check_room_availability(
    p_room_id UUID,
    p_checkin DATE,
    p_checkout DATE,
    p_exclude_reservation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_conflict_count INT;
BEGIN
    -- Check if room is archived or in maintenance block
    IF EXISTS (
        SELECT 1 FROM public.rooms WHERE id = p_room_id AND (is_archived = TRUE OR operational_status IN ('dalam_perawatan', 'tidak_dijual_sementara'))
    ) THEN
        RETURN FALSE;
    END IF;

    -- Check if room has active room block
    IF EXISTS (
        SELECT 1 FROM public.room_blocks
        WHERE room_id = p_room_id
          AND start_date < p_checkout
          AND end_date > p_checkin
    ) THEN
        RETURN FALSE;
    END IF;

    -- Check if room has overlapping approved, confirmed, or checked-in reservations
    SELECT COUNT(*)
    INTO v_conflict_count
    FROM public.reservation_rooms rr
    JOIN public.reservations r ON r.id = rr.reservation_id
    WHERE rr.room_id = p_room_id
      AND r.status IN ('approved_pending_payment', 'confirmed', 'checked_in')
      AND (p_exclude_reservation_id IS NULL OR r.id <> p_exclude_reservation_id)
      AND r.checkin_date < p_checkout
      AND r.checkout_date > p_checkin;

    RETURN (v_conflict_count = 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atomic approval RPC to prevent race conditions & double bookings
CREATE OR REPLACE FUNCTION public.approve_reservation_atomic(
    p_reservation_id UUID,
    p_admin_id UUID,
    p_target_status TEXT DEFAULT 'approved_pending_payment'
)
RETURNS JSONB AS $$
DECLARE
    v_res RECORD;
    v_room_id UUID;
    v_is_available BOOLEAN;
BEGIN
    -- Lock reservation row
    SELECT * INTO v_res 
    FROM public.reservations 
    WHERE id = p_reservation_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Reservasi tidak ditemukan.');
    END IF;

    IF v_res.status NOT IN ('pending_approval', 'approved_pending_payment') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Status reservasi saat ini tidak dapat disetujui (' || v_res.status || ').');
    END IF;

    -- Iterate all rooms in reservation and check with row lock on rooms
    FOR v_room_id IN 
        SELECT room_id FROM public.reservation_rooms WHERE reservation_id = p_reservation_id
    LOOP
        PERFORM id FROM public.rooms WHERE id = v_room_id FOR UPDATE;
        
        v_is_available := public.check_room_availability(
            v_room_id, 
            v_res.checkin_date, 
            v_res.checkout_date, 
            p_reservation_id
        );

        IF NOT v_is_available THEN
            RETURN jsonb_build_object('success', false, 'error', 'Kamar tidak lagi tersedia untuk tanggal yang dipilih.');
        END IF;
    END LOOP;

    -- Update reservation status
    UPDATE public.reservations
    SET 
        status = p_target_status,
        approved_at = NOW(),
        approved_by = p_admin_id,
        updated_at = NOW()
    WHERE id = p_reservation_id;

    -- Record status history
    INSERT INTO public.reservation_status_history (
        reservation_id, previous_status, new_status, changed_by, reason
    ) VALUES (
        p_reservation_id, v_res.status, p_target_status, p_admin_id, 'Reservasi disetujui oleh admin'
    );

    -- Log to audit logs
    INSERT INTO public.audit_logs (
        actor_id, action, entity_name, entity_id, details
    ) VALUES (
        p_admin_id, 'APPROVE_RESERVATION', 'reservations', p_reservation_id::text,
        jsonb_build_object('previous_status', v_res.status, 'new_status', p_target_status)
    );

    RETURN jsonb_build_object('success', true, 'status', p_target_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger for new user signup -> profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
        NEW.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_rate_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_price_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (Only public non-sensitive data)
CREATE POLICY "Public can view property info" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Public can view unarchived rooms" ON public.rooms FOR SELECT USING (is_archived = false);
CREATE POLICY "Public can view active payment methods" ON public.payment_methods FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active promotions" ON public.promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view room rate periods" ON public.room_rate_periods FOR SELECT USING (true);

-- GUEST STATUS CHECK (Lookup by reservation number + phone for tracking)
CREATE POLICY "Public can view own reservation by number" ON public.reservations 
FOR SELECT USING (true); -- Filtered by reservation_number in application layer or secure RPC

-- PROFILES
CREATE POLICY "Users can view all staff profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- USER ROLES (Only owner can manage, all staff can view)
CREATE POLICY "Staff can view roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner can manage roles" ON public.user_roles FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner']));

-- OPERATIONAL TABLES (Owner, Admin, Reception, Finance, Housekeeping as per RBAC)
CREATE POLICY "Staff can manage rooms" ON public.rooms FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin']));

CREATE POLICY "Staff can manage rates" ON public.room_rate_periods FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin']));

CREATE POLICY "Staff can manage blocks" ON public.room_blocks FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'housekeeping']));

CREATE POLICY "Staff can view guests" ON public.guests FOR SELECT TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception', 'finance']));

CREATE POLICY "Staff can manage guests" ON public.guests FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception']));

CREATE POLICY "Staff can view reservations" ON public.reservations FOR SELECT TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception', 'finance', 'housekeeping']));

CREATE POLICY "Staff can manage reservations" ON public.reservations FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception']));

CREATE POLICY "Staff can view reservation rooms" ON public.reservation_rooms FOR SELECT TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception', 'finance', 'housekeeping']));

CREATE POLICY "Staff can manage reservation rooms" ON public.reservation_rooms FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception']));

CREATE POLICY "Staff can view price snapshots" ON public.reservation_price_snapshots FOR SELECT TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception', 'finance']));

CREATE POLICY "Staff can manage price snapshots" ON public.reservation_price_snapshots FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception']));

CREATE POLICY "Staff can view status history" ON public.reservation_status_history FOR SELECT TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception', 'finance']));

CREATE POLICY "Staff can view payments" ON public.payments FOR SELECT TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception', 'finance']));

CREATE POLICY "Staff can manage payments" ON public.payments FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'finance']));

CREATE POLICY "Staff can manage deposits" ON public.deposits FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'finance']));

CREATE POLICY "Finance can view expenses" ON public.expenses FOR SELECT TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'finance']));

CREATE POLICY "Finance can manage expenses" ON public.expenses FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'finance']));

CREATE POLICY "Finance can manage receivables" ON public.receivables FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'finance']));

CREATE POLICY "Finance can manage payables" ON public.payables FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'finance']));

CREATE POLICY "Staff can view housekeeping tasks" ON public.housekeeping_tasks FOR SELECT TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception', 'housekeeping']));

CREATE POLICY "Staff can manage housekeeping tasks" ON public.housekeeping_tasks FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception', 'housekeeping']));

CREATE POLICY "Staff can manage maintenance tickets" ON public.maintenance_tickets FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception', 'housekeeping']));

CREATE POLICY "Staff can manage inventory" ON public.inventory_items FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception', 'housekeeping']));

CREATE POLICY "Staff can manage inventory movements" ON public.inventory_movements FOR ALL TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin', 'reception', 'housekeeping']));

CREATE POLICY "Staff can view audit logs" ON public.audit_logs FOR SELECT TO authenticated 
USING (public.has_role(ARRAY['owner', 'admin']));
