# MIGRATION_PLAN.md — ALYATAMA HOMESTAY
## Rencana Migrasi Skema Basis Data & Kompatibilitas Data (Master Spec V3.1)

**Versi:** 3.1  
**Target Database:** Supabase PostgreSQL + Fallback State In-Memory  

---

### 1. Prinsip Keamanan Data: Non-Destructive Migration

1. **Dilarang Menghapus Tabel atau Reset Produksi:** Seluruh perubahan skema dilakukan dengan `ALTER TABLE` atau pembuatan tabel pelengkap baru tanpa menghapus data historis.
2. **Penanganan Reservasi Lama (Historical Data Compatibility):**
   - Reservasi yang dibuat sebelum V3.1 tidak memiliki data staf penerima.
   - Field `staff_name_snapshot` dan `created_by_user_id` pada data lama dibiarkan bernilai `NULL` (ditampilkan di antarmuka sebagai *"Sistem Online / Tidak Tercatat"*), dan **tidak boleh diisi dengan data fiktif**.

---

### 2. DDL Skema PostgreSQL Baru (Supabase Migration Script)

```sql
-- ============================================================
-- 1. TABEL PENGGUNA STAF (ADMIN & STAFF)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.staff_users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('INVITED', 'ACTIVE', 'INACTIVE', 'SUSPENDED')),
    password_hash VARCHAR(255) NOT NULL,
    invited_by VARCHAR(64),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_staff_users_username ON public.staff_users (username);
CREATE INDEX IF NOT EXISTS idx_staff_users_status ON public.staff_users (status);

-- ============================================================
-- 2. TABEL SHIFT KERJA STAF (STAFF SHIFTS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id VARCHAR(64) PRIMARY KEY,
    staff_user_id VARCHAR(64) NOT NULL REFERENCES public.staff_users(id) ON DELETE RESTRICT,
    staff_name_snapshot VARCHAR(150) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ended_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    date_local DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_staff_shifts_user_id ON public.staff_shifts (staff_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_status ON public.staff_shifts (status);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_date_local ON public.staff_shifts (date_local);

-- ============================================================
-- 3. EKSTENSI TABEL RESERVASI UNTUK ATRIBUSI
-- ============================================================
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS booking_source VARCHAR(20) DEFAULT 'online' CHECK (booking_source IN ('online', 'walk_in', 'phone', 'admin')),
ADD COLUMN IF NOT EXISTS created_by_user_id VARCHAR(64),
ADD COLUMN IF NOT EXISTS created_by_role VARCHAR(20) DEFAULT 'public' CHECK (created_by_role IN ('admin', 'staff', 'public')),
ADD COLUMN IF NOT EXISTS staff_shift_id VARCHAR(64),
ADD COLUMN IF NOT EXISTS staff_name_snapshot VARCHAR(150);

CREATE INDEX IF NOT EXISTS idx_reservations_booking_source ON public.reservations (booking_source);
CREATE INDEX IF NOT EXISTS idx_reservations_staff_shift_id ON public.reservations (staff_shift_id);
```

---

### 3. Prosedur Rollback & Backup

1. **Backup Sebelum Eksekusi:** Jalankan `pg_dump` atau ekspor snapshot database di dashboard Supabase sebelum menerapkan migrasi skema.
2. **Rollback DDL:** Jika diperlukan rollback, hapus kolom tambahan tanpa merusak integritas tabel utama:
   ```sql
   ALTER TABLE public.reservations DROP COLUMN IF EXISTS staff_name_snapshot;
   ALTER TABLE public.reservations DROP COLUMN IF EXISTS staff_shift_id;
   ALTER TABLE public.reservations DROP COLUMN IF EXISTS created_by_role;
   ALTER TABLE public.reservations DROP COLUMN IF EXISTS created_by_user_id;
   ALTER TABLE public.reservations DROP COLUMN IF EXISTS booking_source;
   ```
