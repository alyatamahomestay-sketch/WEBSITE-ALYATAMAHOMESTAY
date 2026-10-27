-- ==============================================================================
-- ALYATAMA HOMESTAY — SUPABASE AUTHENTICATOR SETUP SCRIPT
-- Menghubungkan Autentikasi Pengelola (Admin & Staf) ke Supabase Auth (auth.users)
-- ==============================================================================

-- 1. Pastikan ekstensi pgcrypto tersedia untuk hashing kata sandi
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Fungsi Helper untuk Mendaftarkan Pengelola ke auth.users dan public.staff_users
CREATE OR REPLACE FUNCTION register_alyatama_staff(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_username TEXT,
    p_role TEXT, -- 'admin' atau 'staff'
    p_status TEXT DEFAULT 'ACTIVE' -- 'INVITED', 'ACTIVE', 'INACTIVE', 'SUSPENDED'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Validasi role
    IF p_role NOT IN ('admin', 'staff') THEN
        RAISE EXCEPTION 'Role harus bernilai "admin" atau "staff"';
    END IF;

    -- Periksa apakah user dengan email tersebut sudah ada di auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

    IF v_user_id IS NULL THEN
        -- Insert akun baru ke auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            p_email,
            crypt(p_password, gen_salt('bf')),
            NOW(),
            jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
            jsonb_build_object('full_name', p_full_name, 'username', p_username, 'role', p_role),
            NOW(),
            NOW()
        )
        RETURNING id INTO v_user_id;
    ELSE
        -- Update password dan metadata jika sudah ada
        UPDATE auth.users
        SET 
            encrypted_password = crypt(p_password, gen_salt('bf')),
            raw_user_meta_data = jsonb_build_object('full_name', p_full_name, 'username', p_username, 'role', p_role),
            updated_at = NOW()
        WHERE id = v_user_id;
    END IF;

    -- Sinkronisasi ke tabel staff_users
    INSERT INTO public.staff_users (
        id,
        full_name,
        username,
        email,
        role,
        status,
        password_hash,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        p_full_name,
        p_username,
        p_email,
        p_role,
        p_status,
        p_password,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        username = EXCLUDED.username,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW();

    RETURN v_user_id;
END;
$$;

-- ==============================================================================
-- CONTOH PENDAFTARAN AKUN AWAL KE AUTHENTICATOR SUPABASE:
-- (Jalankan query di bawah ini di SQL Editor dashboard Supabase Anda)
-- ==============================================================================

-- Akun 1: Super Administrator Homestay
SELECT register_alyatama_staff(
    'admin@alyatama.id',         -- Email login Supabase
    'AdminAlyatama2026!',        -- Kata sandi masuk
    'Administrator Utama',       -- Nama lengkap pengelola
    'admin',                     -- Username
    'admin',                     -- Peran (admin)
    'ACTIVE'
);

-- Akun 2: Staf Front Desk Operasional
SELECT register_alyatama_staff(
    'staf@alyatama.id',          -- Email login Supabase
    'StafAlyatama2026!',         -- Kata sandi masuk
    'Rahmat Hidayat (Front Desk)', -- Nama lengkap staf
    'staf',                      -- Username
    'staff',                     -- Peran (staff)
    'ACTIVE'
);
