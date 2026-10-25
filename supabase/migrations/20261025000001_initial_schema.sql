-- ====================================================================
-- ALYATAMA HOMESTAY - INITIAL DATABASE SCHEMA MIGRATION
-- Production-ready, idempotent, fully-typed PostgreSQL schema
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER ROLES (RBAC: owner, admin, reception, finance, housekeeping)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'reception', 'finance', 'housekeeping')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 3. PROPERTIES (Property & Business Settings)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'ALYATAMA HOMESTAY',
    tagline TEXT DEFAULT 'Kenyamanan dan Kehangatan Menginap Seperti di Rumah Sendiri',
    description TEXT DEFAULT 'Homestay bersih, tenang, dan nyaman dengan pelayanan prima yang berlokasi strategis di Jambi.',
    address TEXT NOT NULL DEFAULT 'Jl. Sultan Hasanuddin, RT 01 / Bakung Jaya, Kec. Paal Merah',
    city TEXT NOT NULL DEFAULT 'Kota Jambi',
    province TEXT NOT NULL DEFAULT 'Jambi',
    postal_code TEXT DEFAULT '36138',
    country TEXT NOT NULL DEFAULT 'Indonesia',
    google_maps_url TEXT DEFAULT 'https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7',
    phone TEXT DEFAULT '+6281234567890',
    whatsapp_number TEXT DEFAULT '6281234567890',
    email TEXT DEFAULT 'kontak@alyatamahomestay.com',
    checkin_time TEXT NOT NULL DEFAULT '14:00',
    checkout_time TEXT NOT NULL DEFAULT '12:00',
    currency TEXT NOT NULL DEFAULT 'IDR',
    timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    booking_policy TEXT DEFAULT 'Permintaan reservasi diproses oleh admin homestay. Pembayaran deposit atau pelunasan dilakukan setelah konfirmasi persetujuan.',
    cancellation_policy TEXT DEFAULT 'Pembatalan sebelum H-3 check-in bebas biaya. Pembatalan dalam rentang H-2 hingga hari H dikenakan biaya 50% deposit.',
    pending_expiration_hours INT NOT NULL DEFAULT 24,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ROOMS (Master Unit Kamar)
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    room_type TEXT NOT NULL, -- e.g. 'Standard Double', 'Deluxe Queen', 'Family Suite'
    description TEXT NOT NULL,
    capacity_adults INT NOT NULL DEFAULT 2,
    capacity_children INT NOT NULL DEFAULT 1,
    base_rate NUMERIC(12,2) NOT NULL,
    operational_status TEXT NOT NULL DEFAULT 'tersedia' 
        CHECK (operational_status IN (
            'tersedia', 
            'ditempati', 
            'menunggu_dibersihkan', 
            'sedang_dibersihkan', 
            'siap_digunakan', 
            'dalam_perawatan', 
            'tidak_dijual_sementara'
        )),
    amenities JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["AC", "WiFi Cepat", "Kamar Mandi Dalam", "Water Heater", "Smart TV"]
    photos JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of image URLs
    internal_notes TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ROOM RATE PERIODS (Tarif Khusus Berdasarkan Periode / Musim)
CREATE TABLE IF NOT EXISTS public.room_rate_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rate NUMERIC(12,2) NOT NULL,
    label TEXT NOT NULL, -- e.g. 'Libur Lebaran', 'Weekend High Season'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_rate_period_dates CHECK (end_date >= start_date)
);

-- 6. ROOM BLOCKS (Blok Kamar: Perawatan / Ditutup Manual)
CREATE TABLE IF NOT EXISTS public.room_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_block_dates CHECK (end_date >= start_date)
);

-- 7. GUESTS (Master Tamu)
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    normalized_phone TEXT NOT NULL,
    email TEXT,
    category TEXT NOT NULL DEFAULT 'regular', -- regular, vip, corporate, repeat
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_guests_normalized_phone ON public.guests(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_guests_full_name ON public.guests(full_name);

-- 8. RESERVATIONS (Data Utama Reservasi)
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_number TEXT NOT NULL UNIQUE,
    guest_id UUID NOT NULL REFERENCES public.guests(id),
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    adults INT NOT NULL DEFAULT 1,
    children INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (
        status IN (
            'pending_approval', 
            'approved_pending_payment', 
            'confirmed', 
            'checked_in', 
            'checked_out', 
            'rejected', 
            'cancelled', 
            'expired', 
            'no_show'
        )
    ),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (
        payment_status IN (
            'unpaid', 
            'pending_verification', 
            'partially_paid', 
            'paid', 
            'partially_refunded', 
            'refunded'
        )
    ),
    special_requests TEXT,
    expires_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.profiles(id),
    rejected_at TIMESTAMPTZ,
    rejected_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    cancelled_reason TEXT,
    checked_in_at TIMESTAMPTZ,
    checked_out_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_reservation_dates CHECK (checkout_date > checkin_date)
);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON public.reservations(checkin_date, checkout_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_number ON public.reservations(reservation_number);

-- 9. RESERVATION ROOMS (Mapping Kamar ke Reservasi)
CREATE TABLE IF NOT EXISTS public.reservation_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reservation_rooms_rel ON public.reservation_rooms(reservation_id, room_id);

-- 10. RESERVATION PRICE SNAPSHOTS (Rincian Finansial Bersifat Permanen / Terkunci)
CREATE TABLE IF NOT EXISTS public.reservation_price_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL UNIQUE REFERENCES public.reservations(id) ON DELETE CASCADE,
    total_nights INT NOT NULL,
    base_subtotal NUMERIC(12,2) NOT NULL,
    nightly_breakdown JSONB NOT NULL,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_reason TEXT,
    promo_code TEXT,
    promo_snapshot JSONB,
    extra_charges NUMERIC(12,2) NOT NULL DEFAULT 0,
    extra_charges_breakdown JSONB,
    deposit_required NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL,
    total_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. RESERVATION STATUS HISTORY (Audit Jejak Status Reservasi)
CREATE TABLE IF NOT EXISTS public.reservation_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. PROMOTIONS (Master Diskon & Promo)
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(12,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    applicable_days JSONB NOT NULL DEFAULT '["0","1","2","3","4","5","6"]'::jsonb,
    min_nights INT NOT NULL DEFAULT 1,
    max_nights INT,
    min_spend NUMERIC(12,2) NOT NULL DEFAULT 0,
    usage_limit INT,
    used_count INT NOT NULL DEFAULT 0,
    target_guest_category TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_promo_dates CHECK (end_date >= start_date)
);

-- 13. PROMOTION REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.promotion_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id UUID NOT NULL REFERENCES public.promotions(id),
    reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
    discount_applied NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. PAYMENT METHODS (Konfigurasi Metode Bayar & QRIS)
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE, -- 'qris', 'transfer_bca', 'cash', etc.
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    qris_image_url TEXT,
    account_name TEXT,
    account_number TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. PAYMENTS (Catatan Transaksi Pembayaran)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number TEXT NOT NULL UNIQUE,
    reservation_id UUID NOT NULL REFERENCES public.reservations(id),
    amount NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('pending_verification', 'verified', 'rejected')),
    proof_image_url TEXT,
    reference_number TEXT,
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_reservation ON public.payments(reservation_id);

-- 16. DEPOSITS (Pelacakan Deposit Menginap)
CREATE TABLE IF NOT EXISTS public.deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL UNIQUE REFERENCES public.reservations(id) ON DELETE CASCADE,
    required_amount NUMERIC(12,2) NOT NULL,
    received_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    deducted_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    refunded_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'received', 'partially_refunded', 'fully_refunded', 'forfeited')
    ),
    deduction_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. EXPENSES (Pencatatan Pengeluaran Operasional)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_number TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL, -- 'listrik', 'air', 'laundry', 'kebersihan', 'perbaikan', 'perlengkapan', 'administrasi', 'lainnya'
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method TEXT NOT NULL,
    vendor TEXT,
    receipt_image_url TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. PAYABLES (Utang Kepada Pemasok / Vendor)
CREATE TABLE IF NOT EXISTS public.payables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payable_number TEXT NOT NULL UNIQUE,
    vendor TEXT NOT NULL,
    description TEXT NOT NULL,
    initial_amount NUMERIC(12,2) NOT NULL,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. RECEIVABLES (Piutang Tamu / Corporate)
CREATE TABLE IF NOT EXISTS public.receivables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receivable_number TEXT NOT NULL UNIQUE,
    guest_id UUID NOT NULL REFERENCES public.guests(id),
    reservation_id UUID REFERENCES public.reservations(id),
    description TEXT NOT NULL,
    initial_amount NUMERIC(12,2) NOT NULL,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. INVENTORY ITEMS (Master Stok Barang)
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'amenities', 'linen', 'pembersih', 'snack_minuman', 'elektronik', 'perlengkapan_kamar'
    current_stock INT NOT NULL DEFAULT 0,
    unit TEXT NOT NULL, -- 'pcs', 'botol', 'set', 'pack'
    min_stock_alert INT NOT NULL DEFAULT 5,
    storage_location TEXT,
    condition TEXT NOT NULL DEFAULT 'baik',
    purchase_price NUMERIC(12,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. INVENTORY MOVEMENTS (Riwayat Masuk/Keluar Stok)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity INT NOT NULL,
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. MAINTENANCE TICKETS (Tiket Perawatan & Kerusakan)
CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number TEXT NOT NULL UNIQUE,
    room_id UUID REFERENCES public.rooms(id),
    issue_type TEXT NOT NULL, -- 'AC', 'Plumbing', 'Listrik', 'Furniture', 'Lainnya'
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'sedang' CHECK (priority IN ('rendah', 'sedang', 'tinggi', 'darurat')),
    affects_room_availability BOOLEAN NOT NULL DEFAULT FALSE,
    estimated_cost NUMERIC(12,2),
    actual_cost NUMERIC(12,2),
    status TEXT NOT NULL DEFAULT 'dilaporkan' CHECK (
        status IN ('dilaporkan', 'ditinjau', 'dikerjakan', 'menunggu_sparepart', 'selesai', 'dibatalkan')
    ),
    photo_url TEXT,
    reported_by UUID REFERENCES public.profiles(id),
    assigned_to TEXT,
    resolved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. HOUSEKEEPING TASKS (Tugas Pembersihan Kamar)
CREATE TABLE IF NOT EXISTS public.housekeeping_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL DEFAULT 'pembersihan_rutin' CHECK (
        task_type IN ('pembersihan_rutin', 'pembersihan_checkout', 'deep_cleaning', 'pergantian_linen')
    ),
    status TEXT NOT NULL DEFAULT 'menunggu' CHECK (
        status IN ('menunggu', 'sedang_dikerjakan', 'selesai', 'dibatalkan')
    ),
    assigned_to UUID REFERENCES public.profiles(id),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    damage_reported BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. WHATSAPP CONSENTS (Persetujuan Terpisah Pengiriman WhatsApp)
CREATE TABLE IF NOT EXISTS public.whatsapp_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL UNIQUE REFERENCES public.reservations(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    has_consented BOOLEAN NOT NULL DEFAULT FALSE,
    consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. MESSAGE ACTIVITY (Log Tindakan WhatsApp Manual)
CREATE TABLE IF NOT EXISTS public.message_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    prepared_by UUID REFERENCES public.profiles(id),
    prepared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    message_preview TEXT NOT NULL,
    is_marked_sent BOOLEAN NOT NULL DEFAULT FALSE,
    marked_sent_at TIMESTAMPTZ,
    notes TEXT
);

-- 26. AUDIT LOGS (Riwayat Perubahan Penting & Keamanan)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_name, entity_id);
