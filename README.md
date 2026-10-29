# ALYATAMA HOMESTAY
### Public Booking Website & Integrated Homestay Property Management System (PMS)

Sistem web produksi full-stack terintegrasi untuk **ALYATAMA HOMESTAY**, yang mencakup website publik untuk calon tamu dan dashboard operasional Property Management System (PMS) internal untuk pengelolaan satu properti homestay secara menyeluruh.

---

## 1. Identitas & Informasi Terverifikasi

* **Nama Properti:** ALYATAMA HOMESTAY
* **Lokasi Terverifikasi (Google Maps):** Sentra "Alyatama" Jambi, Jl. Sultan Hasanuddin, RT 01 / Bakung Jaya, Kec. Paal Merah, Kota Jambi, Jambi 36138, Indonesia.
* **Tautan Google Maps:** [https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7](https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7)
* **Default Mata Uang:** Rupiah Indonesia (IDR)
* **Default Zona Waktu:** `Asia/Jakarta` (WIB)
* **Default Jadwal Menginap:** Check-in 14:00 WIB | Check-out 12:00 WIB

---

## 2. Arsitektur Teknologi

* **Frontend & Framework:** Next.js 14 (App Router) dengan TypeScript.
* **Styling & Desain:** Tailwind CSS dengan palet warna *Professional Hospitality Operations* (Warm White, Stone, Charcoal, Terracotta/Brand accent), tanpa AI-slop generik.
* **Ikon:** Lucide React.
* **Backend Database:** Supabase PostgreSQL dengan relasi foreign key, check constraints, dan stored procedures / atomic RPCs.
* **Autentikasi & Otorisasi:** Supabase Auth + Role-Based Access Control (RBAC: `owner`, `admin`, `reception`, `finance`, `housekeeping`).
* **Keamanan Data:** Supabase Row Level Security (RLS) aktif pada seluruh tabel.
* **Penyimpanan File:** Supabase Storage (`property-assets` untuk foto publik dan QRIS; `secure-receipts` untuk bukti transfer privat).
* **Validasi Skema:** Zod & pemeriksaan data server-side.
* **Pengujian Otomatis:** Vitest untuk unit test kalkulasi tarif, promo, nomor telepon, dan pengiriman WhatsApp manual berizin.
* **Ekspor Data:** SheetJS (XLSX) untuk laporan operasional dan keuangan Excel `.xlsx`, serta CSS print layout untuk invoice dan bukti reservasi.

---

## 3. Fitur & Modul yang Tersedia

### A. Website Publik Calon Tamu
1. **Beranda (`/`):** Hero section identitas homestay, ringkasan fasilitas higienis terinspeksi, daftar kamar pilihan, informasi lokasi terverifikasi, dan CTA reservasi.
2. **Daftar Kamar (`/kamar`):** Katalog kamar lengkap beserta spesifikasi kapasitas, fasilitas, dan tarif dasar.
3. **Detail Kamar (`/kamar/[id]`):** Galeri foto, rincian tempat tidur, kebijakan check-in/out, dan tautan formulir pemesanan.
4. **Cek Ketersediaan (`/cek-ketersediaan`):** Kalkulator interaktif ketersediaan unit dan simulasi rincian biaya menginap per malam.
5. **Formulir Reservasi (`/booking`):**
   * Data tamu (Nama lengkap, WhatsApp aktif, email opsional).
   * Pemilihan tanggal menginap dan unit kamar.
   * Kode promo opsional dengan validasi server.
   * Permintaan khusus.
   * **Persetujuan eksplisit 1:** Pemrosesan data reservasi (wajib).
   * **Persetujuan eksplisit 2:** Pengiriman bukti melalui WhatsApp (terpisah & opsional).
   * Nomor reservasi unik otomatis: `ALY-YYYYMMDD-XXXX`.
6. **Lacak Status Reservasi (`/status-reservasi`):** Pemeriksaan status pengajuan reservasi, tagihan, dan tautan bukti dokumen.
7. **Tentang Homestay (`/tentang`):** Visi ketenteraman menginap dan standar keramahan.
8. **Kebijakan Menginap (`/kebijakan`):** Ketentuan check-in/out, tata tertib, larangan, serta aturan pembatalan & deposit.
9. **Kontak & Lokasi (`/kontak`):** Titik lokasi fisik terverifikasi, tautan petunjuk arah Google Maps, nomor WhatsApp, dan jam operasional.
10. **Kebijakan Privasi (`/privasi`):** Ketentuan perlindungan data tamu dan transparansi komunikasi WhatsApp.
11. **Dokumen Cetak / Slip Resmi (`/slip/[id]`):** Tampilan cetak profesional untuk Bukti Permintaan, Invoice Konfirmasi, atau Tanda Terima Pembayaran Lunas dengan gambar QRIS dan rincian breakdown harga.

### B. Dashboard Operasional Internal (PMS)
1. **Ikhtisar Dashboard (`/dashboard`):**
   * Metrik aktual kedatangan hari ini (*Arrivals*).
   * Keberangkatan hari ini (*Departures*).
   * Tamu sedang menginap (*In-House*).
   * Permintaan menunggu persetujuan (*Pending Approval*).
   * Kesiapan fisik kamar (Tersedia, Ditempati, Menunggu dibersihkan, Dalam perawatan).
   * Kas masuk aktual terverifikasi vs pengeluaran operasional vs piutang berjalan.
2. **Data Reservasi (`/dashboard/reservasi`):**
   * Filter status (`pending_approval`, `approved_pending_payment`, `confirmed`, `checked_in`, `checked_out`, `rejected`, `cancelled`).
   * Tindakan persetujuan atomik (mencegah *race condition* dan *double booking*).
   * Penolakan dengan alasan tercatat.
3. **Detail Reservasi (`/dashboard/reservasi/[id]`):**
   * Snapshot rincian harga terkunci (*Price Snapshot*).
   * Pencatatan pembayaran masuk bertahap (DP / pelunasan) dengan metode QRIS, Transfer Bank, atau Tunai.
   * Pemantauan deposit jaminan menginap.
   * **Pengiriman WhatsApp Manual Berizin (Prompt Section 10):**
     * Validasi status persetujuan tamu. Jika tidak setuju, tindakan kirim diblokir.
     * Jika setuju, sistem membuat draft pesan resmi lengkap dengan tautan bukti dan membuka `wa.me` resmi untuk ditinjau dan dikirim manual oleh staf.
4. **Kalender Okupansi (`/dashboard/kalender`):** Matriks timeline kamar (baris) vs tanggal (kolom), navigasi periode, dan pewarnaan status yang konsisten.
5. **Check-in & Check-out Desk (`/dashboard/check-in-out`):**
   * Verifikasi identitas dan pelunasan saat kedatangan (status kamar otomatis menjadi `ditempati`).
   * Penyelesaian tagihan saat keberangkatan (status kamar otomatis menjadi `menunggu_dibersihkan`).
6. **Kamar & Tarif (`/dashboard/kamar`):** Tambah kamar baru, edit tarif, kelola fasilitas, arsip kamar, dan pembaruan status fisik operasional.
7. **Sistem Promo & Diskon (`/dashboard/promo`):** Pengaturan diskon persentase (%) atau nominal Rupiah (Rp), tanggal berlaku, batas minimal malam, dan kupon promo.
8. **Manajemen Tamu / CRM (`/dashboard/tamu`):** Normalisasi nomor telepon Indonesia, riwayat total menginap, dan catatan preferensi pelayanan tamu.
9. **Penerimaan Pembayaran (`/dashboard/pembayaran`):** Pencatatan riwayat transaksi kas masuk dan deposit jaminan.
10. **Keuangan & Beban Operasional (`/dashboard/keuangan`):**
    * Pencatatan pengeluaran per kategori (Listrik PLN, Air PDAM, Laundry, Kebersihan, Perbaikan, Perlengkapan, Administrasi).
    * Penjelasan transparan perbedaan arus kas riil vs laporan akuntansi formal.
11. **Kebersihan / Housekeeping (`/dashboard/housekeeping`):** Papan tugas pembersihan harian dan sterilisasi pasca check-out.
12. **Inventaris Stok (`/dashboard/inventaris`):** Master stok linen, amenities, sabun, dan peringatan dini stok menipis (*Low Stock Alert*).
13. **Pemeliharaan & Kerusakan (`/dashboard/pemeliharaan`):** Tiket kendala fasilitas (AC, plumbing, listrik) dan pemblokiran ketersediaan kamar jika sedang diperbaiki.
14. **Laporan & Ekspor (`/dashboard/laporan`):**
    * Ringkasan eksekutif operasional dan finansial.
    * Ekspor file Excel `.xlsx` multi-sheet (Ringkasan, Data Reservasi, Data Pengeluaran).
    * Mode cetak ramah kertas.
15. **Pengaturan Bisnis (`/dashboard/pengaturan`):** Profil properti, alamat, kontak WhatsApp, jam operasional, dan kebijakan pembatalan.
16. **Pengaturan QRIS & Rekening (`/dashboard/pengaturan/pembayaran`):** Upload URL gambar QRIS resmi, instruksi pembayaran, dan nomor rekening transfer.
17. **Audit Log Keamanan (`/dashboard/pengaturan/audit`):** Log aktivitas penting bersifat permanen (*read-only*).

---

## 4. Panduan Menjalankan Secara Lokal

### Prasyarat
* Node.js versi 18+ (disarankan Node.js v20+)
* NPM versi 9+

### Langkah-langkah
1. Clone atau buka direktori project di terminal.
2. Salin template variabel lingkungan:
   ```bash
   cp .env.example .env.local
   ```
3. Install dependensi:
   ```bash
   npm install
   ```
4. Jalankan pengujian otomatis untuk memverifikasi logika bisnis:
   ```bash
   npm test
   ```
5. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
   Akses aplikasi di browser pada: `http://localhost:3000`

---

## 5. Panduan Konfigurasi Supabase Produksi

Jika Anda siap menghubungkan database Supabase produksi:

### 1. Buat Project Baru di Supabase
* Buka [https://supabase.com](https://supabase.com), buat organisasi/project baru bernama `alyatama-homestay`.
* Pilih region terdekat (misal: `Singapore (ap-southeast-1)`).

### 2. Jalankan Script Migrasi SQL
Buka menu **SQL Editor** pada dashboard Supabase, kemudian jalankan file SQL di repository ini secara berurutan:
1. `supabase/migrations/20261025000001_initial_schema.sql` (Skema 26 tabel database inti, constraints, dan index).
2. `supabase/migrations/20261025000002_rls_and_functions.sql` (Kebijakan RLS per tabel dan fungsi atomik `approve_reservation_atomic`).
3. `supabase/migrations/20261025000003_property_seed.sql` (Inisialisasi informasi properti terverifikasi di Jambi dan metode bayar default).
4. `supabase/storage_setup.sql` (Pembuatan bucket `property-assets` dan `secure-receipts` serta kebijakan otorisasi storage).

*(Opsional untuk data demonstrasi awal: Anda dapat menjalankan `supabase/demo_seed.sql`)*

### 3. Masukkan Kredensial ke `.env.local`
Buka menu **Project Settings > API** di Supabase, lalu masukkan:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Bootstrap Akun Owner Pertama
* Daftarkan akun email pertama Anda melalui Supabase Auth (atau form login).
* Di SQL Editor Supabase, berikan hak akses role `owner`:
  ```sql
  INSERT INTO public.user_roles (user_id, role)
  VALUES ('UUID_USER_DARI_AUTH', 'owner');
  ```

---

## 6. Panduan Deployment Produksi di Vercel

1. Push repository ke GitHub (atau Git provider pilihan Anda).
2. Masuk ke [https://vercel.com](https://vercel.com), klik **Add New Project**, dan pilih repository `alyatama-homestay`.
3. Framework Preset: **Next.js** (terdeteksi otomatis).
4. Masukkan **Environment Variables** di Vercel:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY` (Hanya untuk server runtime)
   * `NEXT_PUBLIC_APP_URL` (Domain produksi Vercel, contoh: `https://alyatama-homestay.vercel.app`)
5. Klik **Deploy**.
6. Setelah build selesai, perbarui **Site URL** dan **Redirect URLs** di Supabase Dashboard (`Authentication > URL Configuration`) agar mengarah ke domain Vercel produksi Anda.

---

## 7. Hasil Pengujian Otomatis (QA Verification)

Semua pengujian otomatis berhasil dijalankan dan lolos 100%:
* `tests/pricing.test.ts` (5 pengujian): Kalkulasi malam standar perhotelan, override tarif musiman, evaluasi promo persentase, batas maksimal diskon, dan perhitungan sisa tagihan.
* `tests/phone.test.ts` (3 pengujian): Normalisasi nomor telepon Indonesia `08xx`/`+628xx` menjadi standar E.164 `628xx` dan validasi format.
* `tests/whatsapp.test.ts` (2 pengujian): Pengujian ketat persetujuan pelanggan (*consent*). Pembuatan draft diblokir jika tamu menolak WhatsApp, dan berhasil dibuat jika tamu mengizinkan.
* `tests/pms-service.test.ts` (5 pengujian): Manajemen kamar, persetujuan atomik status reservasi, pencatatan mutasi kas masuk, siklus housekeeping, dan pencatatan beban pengeluaran operasional.
* **Production Build Test (`npm run build`):** Seluruh 31 rute aplikasi berhasil terkompilasi dan teroptimasi tanpa error.
#   W E B S I T E - A L Y A T A M A H O M E S T A Y  
 