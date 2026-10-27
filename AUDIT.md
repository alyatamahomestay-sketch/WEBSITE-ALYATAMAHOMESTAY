# AUDIT.md — ALYATAMA HOMESTAY
## Comprehensive Codebase & Architecture Audit (Master Spec V3.1)

**Tanggal Audit:** 27 Oktober 2026  
**Auditor:** Principal Software Architect & QA Lead  
**Target:** ALYATAMA HOMESTAY — Premium Syariah Hospitality & Property Management System  

---

### 1. Ringkasan Eksekutif & Temuan Utama

Audit dilakukan secara menyeluruh pada repositori ALYATAMA HOMESTAY dengan fokus pada:
1. **Layout & Tampilan Visual:** Mengidentifikasi dan mengeliminasi akar masalah horizontal overflow / kolom putih kanan pada seluruh breakpoint.
2. **Branding & Design System:** Memperbarui palet warna ke standar *Modern Islamic Luxury — Emerald & Warm Brown* (`#355C46`, `#667B55`, `#806044`, `#C6A47B`, `#F7F4ED`, `#30291F`).
3. **Pemisahan Jalur Publik & Portal:** Menstandarkan rute portal pengelola ke `/panel` dan `/panel/login`.
4. **Restrukturisasi Peran Bisnis:** Menyederhanakan peran menjadi **2 Role Eksklusif**: `ADMIN` dan `STAFF`.
5. **Manajemen Staf Terkendali Admin:** Tidak ada registrasi staf publik; seluruh staf diundang/didaftarkan oleh admin di `/panel/staff`.
6. **Shift Harian & Atribusi Otomatis:** Memastikan setiap tindakan operasional staf mencatat snapshot identitas dan ID shift yang valid.
7. **Pencegahan Double Booking & Walk-in Engine:** Formulir walk-in di `/panel/reservasi/baru` dengan validasi ketersediaan atomik.

---

### 2. Matriks Audit Arsitektur & Teknologi

| Aspek | Kondisi Saat Ini (Baseline) | Kebutuhan Target V3.1 | Status |
| :--- | :--- | :--- | :--- |
| **Framework Frontend** | Next.js 14 (App Router) + React 18 + TypeScript | Pertahankan Next.js App Router | Terpenuhi |
| **Styling & Design Tokens** | Tailwind CSS v3 | Token V3.1: Emerald `#355C46`, Olive `#667B55`, Brown `#806044`, Light Brown `#C6A47B`, Cream `#F7F4ED`, Espresso `#30291F` | Siap Upgrade |
| **Varian Logo** | Logo raster putih & gelap | 3 Varian Resmi Transparan: Putih, Cokelat Muda (`#C6A47B`), Hijau Forest (`#355C46`) | Siap Dibuat |
| **Portal Path** | `/portal` dan `/dashboard` | Standarisasi ke `/panel` dan `/panel/login` | Siap Dimigrasi |
| **Role Matrix** | 5 Role (Owner, Admin, Reception, Finance, Housekeeping) | **Hanya 2 Role**: `ADMIN` (penuh) dan `STAFF` (operasional) | Siap Disederhanakan |
| **Manajemen Staf** | Role switcher berbasis parameter URL | Kontrol penuh Admin di `/panel/staff` (Status: INVITED, ACTIVE, INACTIVE, SUSPENDED) | Siap Diimplementasikan |
| **Shift Kerja Staf** | Belum ada entitas shift | Entitas `staff_shifts` (Mulai Shift, konfirmasi nama, Akhiri Shift, status shift) | Siap Diimplementasikan |
| **Atribusi Petugas** | Belum tercatat otomatis | Field `created_by_user_id`, `created_by_role`, `staff_shift_id`, `staff_name_snapshot`, `booking_source` | Siap Diimplementasikan |
| **Reservasi Walk-in** | Menggunakan form reservasi umum | Halaman khusus `/panel/reservasi/baru` dengan alur walk-in terintegrasi | Siap Diimplementasikan |
| **Pencegahan Double Booking** | Pemeriksaan rentang tanggal di PMS Service | Validasi atomik dengan lock ketersediaan unit | Terpenuhi |

---

### 3. Daftar Temuan Berdasarkan Prioritas

#### [CRITICAL] 1. Penyelarasan Rute Portal ke `/panel`
- **Lokasi:** `src/app/dashboard/*`, `src/app/portal/*`, `src/app/admin/*`
- **Dampak:** Ketidakkonsistenan URL operasional staf. V3.1 mewajibkan portal dipusatkan di `/panel` dan login di `/panel/login`.
- **Solusi:** Buat modul `/panel` terpadu dengan login `/panel/login` dan tambahkan redirect otomatis dari rute lama.

#### [HIGH] 2. Penyederhanaan Role ke `ADMIN` dan `STAFF`
- **Lokasi:** `src/lib/types/index.ts`, `src/components/dashboard/Sidebar.tsx`
- **Dampak:** Terlalu banyak pecahan peran yang mempersulit pencatatan shift dan tanggung jawab operasional lapangan.
- **Solusi:** Sederhanakan tipe `UserRole = 'admin' | 'staff'`. Berikan akses penuh pada Admin dan batasi Staff hanya pada dashboard kerja, check-in/out, walk-in, dan pencatatan kas harian.

#### [HIGH] 3. Implementasi Shift Harian & Konfirmasi Nama Petugas
- **Lokasi:** `src/lib/types/index.ts`, `src/lib/services/pms-service.ts`, `src/app/panel/login/page.tsx`
- **Dampak:** Tanpa shift harian, tidak dapat dibuktikan siapa staf yang bertugas saat transaksi walk-in atau check-in terjadi.
- **Solusi:** Tambahkan entitas `StaffShift`, alur "Mulai Shift" setelah login staf, serta validasi bahwa staf wajib memiliki shift aktif sebelum memproses reservasi.

#### [MEDIUM] 4. Varian Logo Tambahan (Hijau Forest & Cokelat Muda)
- **Lokasi:** `public/images/`, `src/components/common/AlyatamaLogo.tsx`
- **Dampak:** Logo hanya memiliki varian putih dan gelap, belum mendukung tema hijau forest dan cokelat muda V3.1.
- **Solusi:** Bangun aset transparan `alyatama-logo-forest.png` dan `alyatama-logo-lightbrown.png` serta update komponen `AlyatamaLogo`.

---

### 4. Rencana Implementasi Bertahap (Execution Plan)

1. **Fase 1 (Design System & Logo):** Perbarui `tailwind.config.ts` dengan token V3.1 dan buat varian logo putih, cokelat muda, dan hijau forest.
2. **Fase 2 (Data Layer):** Sederhanakan role ke `admin` | `staff`, buat tipe `StaffUser`, `StaffShift`, dan perbarui `Reservation` dengan atribusi petugas.
3. **Fase 3 (Service Layer):** Implementasikan fungsi autentikasi staf, lifecycle shift harian, dan walk-in booking engine.
4. **Fase 4 (Antarmuka Portal /panel):** Bangun layout `/panel`, login `/panel/login`, manajemen staf `/panel/staff`, dan formulir walk-in `/panel/reservasi/baru`.
5. **Fase 5 (Dokumentasi Spesifikasi V3.1):** Hasilkan 5 dokumen spesifikasi teknis lengkap.
6. **Fase 6 (Testing & QA):** Pengujian unit test menyeluruh dan verifikasi tsc.
