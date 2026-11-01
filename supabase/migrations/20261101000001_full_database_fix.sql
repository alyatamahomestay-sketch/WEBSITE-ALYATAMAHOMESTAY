-- ====================================================================
-- ALYATAMA HOMESTAY - FULL DATABASE MIGRATION & PERMISSION REPAIR
-- File: 20261101000001_full_database_fix.sql
-- 
-- CARA EKSEKUSI PADA SUPABASE:
-- 1. Buka dashboard Supabase (https://supabase.com/dashboard)
-- 2. Pilih project ALYATAMA HOMESTAY
-- 3. Masuk ke menu "SQL Editor" pada sidebar sebelah kiri
-- 4. Klik "New Query" (atau simbol '+')
-- 5. Salin dan tempel (paste) seluruh isi file ini ke dalam editor
-- 6. Klik tombol hijau "Run" (atau tekan Ctrl + Enter)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL: STAFF USERS (Akun Pengelola & Staf)
CREATE TABLE IF NOT EXISTS public.staff_users (
    id TEXT PRIMARY KEY DEFAULT ('staff-' || replace(uuid_generate_v4()::text, '-', '')),
    full_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('INVITED', 'ACTIVE', 'INACTIVE', 'SUSPENDED')),
    password_hash TEXT DEFAULT '1234',
    invited_by TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABEL: STAFF SHIFTS (Riwayat & Sesi Shift Staf)
CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id TEXT PRIMARY KEY DEFAULT ('shift-' || replace(uuid_generate_v4()::text, '-', '')),
    staff_user_id TEXT NOT NULL,
    staff_name_snapshot TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    date_local TEXT NOT NULL DEFAULT to_char(CURRENT_DATE, 'YYYY-MM-DD'),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PERBAIKI KOLOM-KOLOM PADA TABEL PROPERTIES
ALTER TABLE public.properties 
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Penginapan Syariah',
    ADD COLUMN IF NOT EXISTS secondary_tagline TEXT DEFAULT 'Bersih, Nyaman dan Berkah',
    ADD COLUMN IF NOT EXISTS mission_quote TEXT DEFAULT 'Investasi terbaik adalah saat manfaatnya terus mengalir, bahkan setelah kita tiada.',
    ADD COLUMN IF NOT EXISTS announcement_banner TEXT DEFAULT 'Penginapan Syariah: “Nikmati Kenyamanan, Raih Ibadah Jariyah” • Pilihan Sewa Harian & Bulanan',
    ADD COLUMN IF NOT EXISTS is_announcement_active BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS landmark TEXT DEFAULT 'Di Belakang SPBU Bangkinang Kota, Samping Rumah Sakit Norpa Husada',
    ADD COLUMN IF NOT EXISTS syariah_policy TEXT DEFAULT 'Sebagai penginapan syariah, pasangan yang menginap dalam satu kamar wajib menunjukkan bukti identitas pernikahan yang sah (KTP beralamat sama / Buku Nikah). Tamu wajib menjaga adab, kesopanan, dan ketenangan lingkungan Islami.';

-- 5. PERBAIKI KOLOM-KOLOM PADA TABEL ROOMS
ALTER TABLE public.rooms 
    ADD COLUMN IF NOT EXISTS monthly_rate NUMERIC(12,2),
    ADD COLUMN IF NOT EXISTS yearly_rate NUMERIC(12,2);

-- 5B. PERBAIKI KOLOM-KOLOM PADA TABEL RESERVATIONS
ALTER TABLE public.reservations 
    ADD COLUMN IF NOT EXISTS payment_preference TEXT DEFAULT 'cash';
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_approved_by_fkey;
ALTER TABLE public.reservations ALTER COLUMN approved_by TYPE TEXT;

-- 6. SEED / UPDATE DATA IDENTITAS HOMESTAY RESMI
INSERT INTO public.properties (
    id,
    name,
    category,
    tagline,
    secondary_tagline,
    mission_quote,
    description,
    address,
    landmark,
    city,
    province,
    postal_code,
    country,
    google_maps_url,
    phone,
    whatsapp_number,
    email,
    checkin_time,
    checkout_time,
    currency,
    timezone,
    syariah_policy,
    booking_policy,
    cancellation_policy,
    pending_expiration_hours,
    is_announcement_active
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'ALYATAMA HOMESTAY',
    'Penginapan Syariah',
    'Nikmati Kenyamanan, Raih Ibadah Jariyah',
    'Bersih, Nyaman dan Berkah',
    'Investasi terbaik adalah saat manfaatnya terus mengalir, bahkan setelah kita tiada.',
    'Penginapan syariah yang memberikan kenyamanan, kebersihan, privasi, keamanan, dan suasana Islami dengan pelayanan profesional di Bangkinang Kota, Kabupaten Kampar. Tersedia untuk sewa Harian dan Bulanan.',
    'Jl. Mayor Ali Rasyid No 19 Bangkinang Kota, Panti Asuhan Putra Muhammadiyah',
    'Di Belakang SPBU Bangkinang Kota, Samping Rumah Sakit Norpa Husada',
    'Bangkinang Kota, Kabupaten Kampar',
    'Riau',
    '28411',
    'Indonesia',
    'https://maps.google.com/?q=Jl.+Mayor+Ali+Rasyid+No+19+Bangkinang+Kota+Kampar+Riau',
    '0822-8547-2008',
    '6282285472008',
    'kontak@alyatamahomestay.com',
    '14:00',
    '12:00',
    'IDR',
    'Asia/Jakarta',
    'Sebagai penginapan syariah, pasangan yang menginap dalam satu kamar wajib menunjukkan bukti identitas pernikahan yang sah (KTP beralamat sama / Buku Nikah). Tamu wajib menjaga adab, kesopanan, dan ketenangan lingkungan Islami.',
    'Permintaan sewa harian maupun bulanan diproses oleh pengelola. Konfirmasi ketersediaan dan rincian instruksi pembayaran akan disampaikan setelah disetujui.',
    'Pembatalan sewa harian sebelum H-3 bebas biaya potongan. Untuk sewa bulanan, deposit keamanan diatur sesuai perjanjian sewa syariah.',
    24,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    tagline = EXCLUDED.tagline,
    secondary_tagline = EXCLUDED.secondary_tagline,
    mission_quote = EXCLUDED.mission_quote,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    landmark = EXCLUDED.landmark,
    city = EXCLUDED.city,
    province = EXCLUDED.province,
    postal_code = EXCLUDED.postal_code,
    phone = EXCLUDED.phone,
    whatsapp_number = EXCLUDED.whatsapp_number,
    email = EXCLUDED.email,
    syariah_policy = EXCLUDED.syariah_policy,
    updated_at = NOW();

-- 7. SEED AKUN PENGELOLA & STAF TERDAFTAR (JIKA BELUM ADA)
INSERT INTO public.staff_users (
    id,
    full_name,
    username,
    email,
    role,
    status,
    password_hash,
    invited_by
) VALUES 
(
    'staff-admin-001',
    'Administrator Utama',
    'admin',
    'admin@alyatamahomestay.com',
    'admin',
    'ACTIVE',
    '1234',
    'system'
),
(
    'staff-user-002',
    'Rahmat Hidayat',
    'rahmat',
    'rahmat@alyatamahomestay.com',
    'staff',
    'ACTIVE',
    '1234',
    'staff-admin-001'
),
(
    'staff-user-003',
    'Siti Nurhaliza',
    'siti',
    'siti@alyatamahomestay.com',
    'staff',
    'ACTIVE',
    '1234',
    'staff-admin-001'
),
(
    'staff-user-004',
    'Ahmad Fauzi',
    'ahmad',
    'ahmad@alyatamahomestay.com',
    'staff',
    'INACTIVE',
    '1234',
    'staff-admin-001'
)
ON CONFLICT (id) DO NOTHING;

-- 8. GRANT HAK AKSES OPERASIONAL PENUH KE POSTGRES, ANON, AUTHENTICATED, DAN SERVICE_ROLE
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 9. PENGATURAN ROW LEVEL SECURITY (RLS) SECARA KOMPREHENSIF
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'properties',
        'rooms',
        'staff_users',
        'staff_shifts',
        'reservations',
        'reservation_rooms',
        'reservation_price_snapshots',
        'reservation_status_history',
        'guests',
        'payments',
        'deposits',
        'advertisement_photos',
        'promotions',
        'promotion_redemptions',
        'payment_methods',
        'expenses',
        'payables',
        'receivables',
        'inventory_items',
        'inventory_movements',
        'maintenance_tickets',
        'housekeeping_tasks',
        'whatsapp_consents',
        'audit_logs'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
            EXECUTE format('DROP POLICY IF EXISTS "Public select policy for %I" ON public.%I;', t, t);
            EXECUTE format('DROP POLICY IF EXISTS "Full access policy for %I" ON public.%I;', t, t);
            EXECUTE format('DROP POLICY IF EXISTS "Allow all for %I" ON public.%I;', t, t);
            
            EXECUTE format('CREATE POLICY "Allow all for %I" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t, t);
        END IF;
    END LOOP;
END $$;

-- 10. REFRESH SCHEMA CACHE POSTGREST
NOTIFY pgrst, 'reload schema';
