-- ====================================================================
-- ALYATAMA HOMESTAY - DEMO SEED DATA FOR TESTING & QA
-- (Gunakan hanya untuk testing atau demonstrasi fitur, bukan di produksi)
-- ====================================================================

-- 1. Demo Rooms
INSERT INTO public.rooms (id, room_number, name, room_type, description, capacity_adults, capacity_children, base_rate, operational_status, amenities, photos)
VALUES
(
    'c1111111-1111-1111-1111-111111111101',
    '101',
    'Kamar Melati',
    'Standard Queen Room',
    'Kamar nyaman di lantai satu dengan tempat tidur Queen size, suasana hening, pencahayaan alami yang hangat, dan kamar mandi dalam.',
    2,
    1,
    250000.00,
    'tersedia',
    '["AC Dingin", "WiFi Berkecepatan Tinggi", "Kamar Mandi Dalam", "Water Heater", "Meja Kerja", "Air Mineral Gratis"]'::jsonb,
    '["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"]'::jsonb
),
(
    'c1111111-1111-1111-1111-111111111102',
    '102',
    'Kamar Mawar',
    'Deluxe Double Room',
    'Kamar luas dengan jendela taman, kasur empuk berstandar hotel, Smart TV, dan fasilitas lengkap untuk relaksasi maksimal.',
    2,
    1,
    300000.00,
    'tersedia',
    '["AC Dingin", "WiFi Berkecepatan Tinggi", "Kamar Mandi Dalam", "Water Heater", "Smart TV", "Lemari Pakaian", "Teko Listrik & Teh/Kopi"]'::jsonb,
    '["https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"]'::jsonb
),
(
    'c1111111-1111-1111-1111-111111111103',
    '201',
    'Kamar Anggrek',
    'Family Suite Room',
    'Pilihan ideal untuk keluarga atau rombongan kecil dengan 2 tempat tidur nyaman (Queen + Single), area duduk santai, dan balkon.',
    3,
    2,
    450000.00,
    'tersedia',
    '["AC Dingin", "WiFi Berkecepatan Tinggi", "Kamar Mandi Dalam Luas", "Water Heater", "Balkon Pribadi", "Smart TV 43 inch", "Kulkas Mini", "Sofa Santai"]'::jsonb,
    '["https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"]'::jsonb
),
(
    'c1111111-1111-1111-1111-111111111104',
    '202',
    'Kamar Cempaka',
    'Standard Twin Room',
    'Dua tempat tidur single yang terpisah, cocok untuk rekan kerja atau perjalanan bisnis dengan kenyamanan dan privasi masing-masing.',
    2,
    0,
    275000.00,
    'siap_digunakan',
    '["AC Dingin", "WiFi Berkecepatan Tinggi", "Kamar Mandi Dalam", "Water Heater", "2 Ranjang Single", "Meja Kerja"]'::jsonb,
    '["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"]'::jsonb
)
ON CONFLICT (room_number) DO NOTHING;

-- 2. Demo Promotions
INSERT INTO public.promotions (id, name, code, description, discount_type, discount_value, start_date, end_date, min_nights, min_spend, is_active)
VALUES
(
    'd1111111-1111-1111-1111-111111111101',
    'Promo Menginap Hemat 3 Malam',
    'HEMAT3',
    'Dapatkan diskon 10% untuk pemesanan minimal 3 malam.',
    'percentage',
    10.00,
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '60 days',
    3,
    500000.00,
    true
),
(
    'd1111111-1111-1111-1111-111111111102',
    'Potongan Spesial Rp 50.000',
    'ALYATAMA50',
    'Potongan langsung Rp 50.000 untuk pelanggan baru.',
    'fixed',
    50000.00,
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '60 days',
    1,
    250000.00,
    true
)
ON CONFLICT (code) DO NOTHING;

-- 3. Demo Inventory Items
INSERT INTO public.inventory_items (name, category, current_stock, unit, min_stock_alert, storage_location, condition, purchase_price)
VALUES
('Handuk Mandi Putih Tebal', 'linen', 24, 'pcs', 10, 'Gudang Linen Lt. 1', 'baik', 65000.00),
('Sprei Queen Katun 160x200', 'linen', 12, 'set', 6, 'Gudang Linen Lt. 1', 'baik', 120000.00),
('Sabun Cair Mandi 500ml', 'pembersih', 8, 'botol', 4, 'Ruang Housekeeping', 'baik', 25000.00),
('Shampoo Botol 500ml', 'pembersih', 7, 'botol', 4, 'Ruang Housekeeping', 'baik', 28000.00),
('Air Mineral Botol 600ml', 'snack_minuman', 48, 'botol', 24, 'Dapur Tamu', 'baik', 3500.00),
('Sachet Kopi & Teh', 'snack_minuman', 60, 'pcs', 30, 'Dapur Tamu', 'baik', 2000.00),
('Lampu LED 12W', 'elektronik', 4, 'pcs', 5, 'Kotak Perkakas Resepsionis', 'baik', 35000.00)
ON CONFLICT DO NOTHING;
