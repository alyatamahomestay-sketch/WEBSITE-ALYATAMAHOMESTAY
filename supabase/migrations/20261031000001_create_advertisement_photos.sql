-- ====================================================================
-- ALYATAMA HOMESTAY - TABEL FOTO IKLAN & GALERI DOKUMENTASI
-- Eksekusi query ini pada Supabase SQL Editor:
-- Dashboard Supabase -> SQL Editor -> New Query -> Salin teks ini -> Klik 'Run'
-- (Query ini aman dan TIDAK MENGUBAH / MENGHAPUS data kamar atau reservasi Anda)
-- ====================================================================

-- 1. Buat tabel foto iklan & galeri jika belum ada
CREATE TABLE IF NOT EXISTS public.advertisement_photos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'brosur_flyer',
    image_url TEXT NOT NULL,
    description TEXT,
    badge TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Berikan izin akses operasi penuh pada tabel advertisement_photos
GRANT ALL ON TABLE public.advertisement_photos TO postgres, anon, authenticated, service_role;

-- 3. Konfigurasi Row Level Security (RLS)
ALTER TABLE public.advertisement_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active photos" ON public.advertisement_photos;
CREATE POLICY "Public can view active photos" 
ON public.advertisement_photos FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow all access to advertisement_photos" ON public.advertisement_photos;
CREATE POLICY "Allow all access to advertisement_photos" 
ON public.advertisement_photos FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Reload skema cache Supabase (PostgREST)
NOTIFY pgrst, 'reload schema';
