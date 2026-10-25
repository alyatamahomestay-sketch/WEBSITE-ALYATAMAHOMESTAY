# CATATAN PERUBAHAN (CHANGELOG) — ALYATAMA HOMESTAY

Semua perubahan penting pada sistem **ALYATAMA HOMESTAY** didokumentasikan di sini secara kronologis.

---

## [2.0.0] — 2026-10-26 (Transformasi Total Sesuai Flyer Promosi Resmi)

### Ditambahkan (Added)
- **Model Multi-Masa Sewa (RentalType):** Dukungan resmi untuk sewa **Harian (Daily)**, **Bulanan (Monthly)**, dan **Tahunan (Yearly)** di seluruh layer:
  - Database & TypeScript types: `RentalType = 'daily' | 'monthly' | 'yearly'`, `monthly_rate`, `yearly_rate`, `duration_units`, `unit_rate`.
  - Pricing Engine: `calculateRentalDuration()` untuk kalkulasi durasi bulan/tahun secara otomatis.
  - Formulir Booking publik dengan tombol switcher masa sewa.
  - Modul Kamar PMS: input tarif harian, bulanan, dan tahunan.
- **Kepatuhan Kebijakan Syariah ALYATAMA:**
  - Deklarasi kepatuhan pasangan sah suami-istri / mahram pada formulir booking publik.
  - Penegasan penolakan alkohol, rokok di kamar ber-AC, dan perilaku asusila.
- **Misi Amal & Dakwah Islami:**
  - Slogan resmi flyer: *"Nikmati Kenyamanan, Raih Ibadah Jariyah"*, *"Bersih, Nyaman dan Berkah"*, *"Nyaman di Dunia, Berkah Sampai Akhirat"*.
  - Kutipan sedekah jariyah: *"Investasi terbaik adalah saat manfaatnya terus mengalir, bahkan setelah kita tiada."*
  - Dukungan amal bagi santri yatim di **Panti Asuhan Putra Muhammadiyah Bangkinang**.
- **6 Fasilitas Resmi Terverifikasi Flyer:**
  1. Lingkungan Islami & Nyaman
  2. Aman & Privasi Terjaga
  3. Kamar Bersih & Nyaman
  4. Wi-Fi Gratis Berkecepatan Tinggi
  5. AC di Setiap Kamar
  6. Keamanan 24 Jam
- **Komponen Identitas Brand:**
  - `AlyatamaLogo.tsx`: Lambang geometris vektor murni huruf A kubah hunian Islami.
- **Suite Pengujian Unit Komprehensif:**
  - 17 automated tests pada Vitest (`pricing.test.ts`, `pms-service.test.ts`, `phone.test.ts`, `whatsapp.test.ts`).
- **Dokumentasi Produksi 10 Modul (Section 25):**
  - `AUDIT.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `DATABASE_AND_BUSINESS_RULES.md`, `FEATURE_CHECKLIST.md`, `SECURITY_CHECKLIST.md`, `TEST_REPORT.md`, `DEPLOYMENT.md`, `CHANGELOG.md`, `PRODUCTION_READINESS.md`.

### Diperbaiki & Disesuaikan (Changed & Fixed)
- **Koreksi Lokasi Terverifikasi:** Mengganti seluruh data lokasi placeholder menjadi **Jl. Mayor Ali Rasyid No 19 Bangkinang Kota, Panti Asuhan Putra Muhammadiyah, Kabupaten Kampar, Riau 28411 (Belakang SPBU Bangkinang Kota, Samping RS Norpa Husada)**.
- **Koreksi WhatsApp Resmi:** Mengganti kontak menjadi `0822 8547 2008` (`6282285472008`).
- **Pembaruan Palet Warna Desain:** Mengganti warna generik menjadi palet Modern Islamic Boutique Hospitality: `#F6F0E7`, `#E7D8C5`, `#806044`, `#392B21`, `#65715A`, `#C9A84C`.
- **Aset Flyer Asli:** Mengintegrasikan flyer fisik ke `public/images/alyatama-flyer.jpg`.
- **Suspense Boundary:** Membungkus seluruh pemanggil `useSearchParams()` dengan `<Suspense>` boundary untuk mencegah bailout SSR Next.js.

---

## [1.0.0] — 2026-10-25 (Rilis Awal Full-Stack Foundation)
- Inisialisasi Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase SSR & Admin client.
- Pembuatan 31 rute aplikasi web publik dan PMS dashboard.
- Pengaturan fallback in-memory store dan generator slip reservasi/invoice cetak.
