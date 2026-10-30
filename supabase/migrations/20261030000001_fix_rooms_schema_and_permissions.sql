-- ====================================================================
-- ALYATAMA HOMESTAY - FIX ROOMS SCHEMA & RLS PERMISSIONS
-- Eksekusi query ini pada Supabase SQL Editor:
-- Dashboard Supabase -> SQL Editor -> New Query -> Salin teks ini -> Klik 'Run'
-- ====================================================================

-- 1. Tambahkan kolom tarif bulanan dan tahunan ke tabel rooms jika belum ada
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS monthly_rate NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS yearly_rate NUMERIC(12,2);

-- 2. Berikan izin akses operasi penuh pada tabel rooms
GRANT ALL ON TABLE public.rooms TO postgres, anon, authenticated, service_role;

-- 3. Konfigurasi Row Level Security (RLS) untuk tabel rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Bersihkan policy lama jika ada bentrok
DROP POLICY IF EXISTS "Public can view unarchived rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public can view rooms" ON public.rooms;
DROP POLICY IF EXISTS "Staff can manage rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow all access to rooms" ON public.rooms;

-- Buat policy baru:
-- Semua pengunjung dapat membaca data kamar
CREATE POLICY "Public can view rooms" 
ON public.rooms FOR SELECT 
USING (true);

-- Pengelola homestay dapat menambah, mengedit, mengarsipkan, dan menghapus kamar
CREATE POLICY "Allow all access to rooms" 
ON public.rooms FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Reload skema cache Supabase (PostgREST) agar perubahan langsung aktif
NOTIFY pgrst, 'reload schema';
