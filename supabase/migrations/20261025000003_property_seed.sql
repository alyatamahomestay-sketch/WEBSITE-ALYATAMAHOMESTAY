-- ====================================================================
-- ALYATAMA HOMESTAY - INITIAL VERIFIED BUSINESS SETTINGS
-- Berisi data lokasi terverifikasi dan template pengaturan awal
-- ====================================================================

-- 1. Insert or update verified property identity
INSERT INTO public.properties (
    id,
    name,
    tagline,
    description,
    address,
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
    booking_policy,
    cancellation_policy,
    pending_expiration_hours
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'ALYATAMA HOMESTAY',
    'Kenyamanan dan Kehangatan Menginap Seperti di Rumah Sendiri',
    'Akomodasi homestay berlokasi strategis di Bakung Jaya, Paal Merah, Jambi. Menawarkan ketenangan, kebersihan, dan kenyamanan menginap.',
    'Jl. Sultan Hasanuddin, RT 01 / Bakung Jaya, Kec. Paal Merah',
    'Kota Jambi',
    'Jambi',
    '36138',
    'Indonesia',
    'https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7',
    '', -- Diisi oleh pemilik homestay melalui dashboard
    '', -- Diisi oleh pemilik homestay melalui dashboard
    '', -- Diisi oleh pemilik homestay melalui dashboard
    '14:00',
    '12:00',
    'IDR',
    'Asia/Jakarta',
    'Setiap pemesanan yang diajukan akan diverifikasi ketersediaannya oleh admin homestay terlebih dahulu. Calon tamu akan menerima notifikasi konfirmasi dan rincian pembayaran setelah disetujui.',
    'Pembatalan sebelum 3 hari dari tanggal check-in tidak dikenakan biaya. Pembatalan mendadak dapat dikenakan potongan deposit sesuai kebijakan operasional.',
    24
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert standard payment methods templates (QRIS, Bank Transfer, Cash)
INSERT INTO public.payment_methods (code, name, description, instructions, is_active) VALUES
('qris', 'QRIS (Semua E-Wallet & Mobile Banking)', 'Scan kode QRIS resmi ALYATAMA HOMESTAY menggunakan BCA, Mandiri, BRI, GoPay, OVO, Dana, ShopeePay, dsb.', 'Silakan scan kode QRIS yang tercantum pada instruksi pembayaran, pastikan nominal sesuai, lalu konfirmasi pembayaran kepada admin.', true),
('bank_transfer', 'Transfer Bank', 'Transfer manual antar bank ke rekening resmi homestay.', 'Lakukan transfer ke rekening bank resmi ALYATAMA HOMESTAY dan simpan bukti transfer untuk verifikasi admin.', true),
('cash', 'Tunai di Tempat (Cash on Arrival)', 'Pembayaran tunai langsung di meja resepsionis saat kedatangan.', 'Pembayaran tunai dilakukan secara langsung kepada petugas resepsionis saat proses check-in.', true)
ON CONFLICT (code) DO NOTHING;
