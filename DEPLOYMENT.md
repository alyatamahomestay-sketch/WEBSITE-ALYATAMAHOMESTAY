# PANDUAN DEPLOYMENT PRODUKSI (DEPLOYMENT GUIDE)

Aplikasi **ALYATAMA HOMESTAY** siap dideploy ke platform cloud hosting modern seperti **Vercel** atau **Netlify** dengan backend database di **Supabase Cloud**.

---

## 1. Persyaratan Lingkungan (Environment Variables)

Siapkan variabel lingkungan berikut pada dashboard hosting produksi:

```bash
# Public Supabase URL & Anon Key (Aman untuk frontend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Supabase Service Role Key (Hanya untuk server-side tepercaya, rahasia)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Base URL Domain Produksi
NEXT_PUBLIC_APP_URL=https://alyatamahomestay.com
```

> [!CAUTION]
> Jangan pernah membagikan atau mempublikasikan `SUPABASE_SERVICE_ROLE_KEY` ke repository publik atau bundle browser.

---

## 2. Langkah Setup Database Supabase

1. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
2. Jalankan skrip DDL SQL yang tersedia di halaman `/auth/setup` aplikasi, atau eksekusi file migrasi skema tabel:
   - `guests`
   - `rooms`
   - `reservations`
   - `reservation_rooms`
   - `reservation_price_snapshots`
   - `deposits`
   - `payments`
   - `whatsapp_consents`
   - `property_settings`
   - `room_rate_periods`
   - `promotions`
   - `housekeeping_tasks`
   - `inventory_items`
   - `maintenance_tickets`
   - `finance_transactions`
   - `audit_logs`
3. Buat bucket storage publik di Supabase Storage bernama `homestay-assets` untuk upload foto kamar, QRIS, dan kuitansi pembayaran.

---

## 3. Langkah Deployment ke Vercel

1. Hubungkan repository GitHub ALYATAMA HOMESTAY ke Vercel.
2. Konfigurasikan Environment Variables sesuai daftar di atas.
3. Atur build settings:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
4. Klik **Deploy**.
5. Setelah build selesai, atur custom domain (misalnya `alyatamahomestay.com`) dan pastikan sertifikat SSL/HTTPS aktif.

---

## 4. Mekanisme Zero Downtime Fallback

Aplikasi ALYATAMA HOMESTAY dilengkapi dengan **Smart Resilient Architecture**:
- Apabila kredensial Supabase belum diisi atau database sedang mengalami maintenance jaringan, sistem secara otomatis beralih ke *Interactive Mock PMS In-Memory Store* dengan data terverifikasi Bangkinang Kota.
- Pengunjung web publik tetap dapat menjelajahi kamar, menghitung tarif sewa Harian/Bulanan/Tahunan, dan mengajukan reservasi tanpa mengalami crash (Zero Downtime).
