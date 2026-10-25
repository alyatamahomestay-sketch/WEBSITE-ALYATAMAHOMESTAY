-- ====================================================================
-- ALYATAMA HOMESTAY - SUPABASE STORAGE BUCKETS & POLICIES
-- ====================================================================

-- 1. Create public bucket for property images (photos, rooms, QRIS)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-assets', 'property-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create private bucket for payment proofs & confidential operational receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('secure-receipts', 'secure-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for property-assets (Public can read, staff can upload/modify)
CREATE POLICY "Public can view property assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-assets');

CREATE POLICY "Staff can upload property assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'property-assets' 
    AND public.has_role(ARRAY['owner', 'admin'])
);

CREATE POLICY "Staff can update/delete property assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'property-assets' 
    AND public.has_role(ARRAY['owner', 'admin'])
);

-- Storage Policies for secure-receipts (Private, only authenticated staff can view/upload)
CREATE POLICY "Staff can view confidential receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'secure-receipts'
    AND public.has_role(ARRAY['owner', 'admin', 'reception', 'finance'])
);

CREATE POLICY "Staff can upload confidential receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'secure-receipts'
    AND public.has_role(ARRAY['owner', 'admin', 'reception', 'finance'])
);
