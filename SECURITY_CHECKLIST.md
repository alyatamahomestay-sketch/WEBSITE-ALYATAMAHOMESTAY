# PROTOKOL & CHECKLIST KEAMANAN SISTEM (SECURITY CHECKLIST)

Aplikasi **ALYATAMA HOMESTAY** menerapkan standar keamanan perhotelan modern untuk melindungi kerahasiaan data tamu, integritas transaksi keuangan, serta ketersediaan sistem.

---

## 1. Matriks Akses Pengguna Berbasis Peran (RBAC)

| Peran Pengguna | Izin & Hak Akses |
| :--- | :--- |
| **Owner** | Akses penuh seluruh sistem: keuangan, laba rugi, audit log keamanan, penyesuaian tarif, pengaturan profil homestay, dan operasional. |
| **Admin** | Operasional harian penuh: approval reservasi, check-in/out, manajemen kamar, promo, kasir, housekeeping, dan inventaris. |
| **Reception** | Resepsionis front-desk: check-in, check-out, melihat data reservasi, mencetak invoice/slip, memantau kamar siap huni. |
| **Finance** | Kasir & pembukuan: pencatatan kas, verifikasi mutasi bank & QRIS, pelunasan deposit, laporan keuangan. |
| **Housekeeping**| Staf kebersihan: status kebersihan kamar, inventaris linen/amenities, pelaporan tiket kerusakan fisik. |

---

## 2. Perlindungan Data & Kredensial Sensitif

- **Isolasi Service Role Key:**
  `SUPABASE_SERVICE_ROLE_KEY` hanya berjalan pada proses server-side terpercaya (`src/lib/supabase/admin.ts`). Kunci ini tidak pernah diekspos ke kode frontend, client bundle, local storage browser, atau respons API publik.
- **Normalisasi & Sanitasi Nomor WhatsApp:**
  Seluruh nomor telepon tamu disanitasi menggunakan pustaka regex khusus nomor Indonesia (`src/lib/phone.ts`). Prefiks lokal `08...`, format internasional `+62...`, maupun karakter pemisah secara otomatis dinormalisasi ke format E.164 standar `628...`.
- **Pencegahan Injeksi & XSS:**
  Semua input form publik divalidasi ketat menggunakan skema terpusat **Zod** (`src/app/api/reservasi/public-submit/route.ts`). Input berbahaya di-sanitize sebelum diproses ke database.
- **Row Level Security (RLS) PostgreSQL:**
  Semua tabel Supabase diproteksi kebijakan RLS. Tamu publik hanya dapat membaca data kamar aktif dan menyisipkan reservasi baru tanpa izin membaca data tamu lain.
- **Persetujuan Privasi Eksplisit (Privacy Consents):**
  Persetujuan pemrosesan data identitas dan persetujuan pengiriman bukti WhatsApp dipisahkan menjadi dua kotak centang mandiri, dengan pencatatan audit log timestamp di tabel `whatsapp_consents`.
- **Pengiriman Pesan WhatsApp Bebas Risiko Gateway:**
  Sistem tidak menggunakan API bot pihak ketiga yang rawan pemblokiran nomor. Pengiriman pesan dilakukan secara manual melalui protokol tautan WhatsApp resmi (`https://wa.me/62...`) setelah mendapat persetujuan tamu.
