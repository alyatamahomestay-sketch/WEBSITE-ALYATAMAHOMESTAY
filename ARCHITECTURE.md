# ARSITEKTUR TEKNIS SISTEM — ALYATAMA HOMESTAY

## 1. Ikhtisar Arsitektur

ALYATAMA HOMESTAY dirancang dengan pendekatan modular berbasis **Next.js 14 (App Router)**, **React 18**, **TypeScript**, dan **Supabase PostgreSQL**. Sistem terdiri atas dua zona aplikasi terpadu:

1. **Public Hospitality Website:** Portal publik ramah pengunjung untuk reservasi kamar harian, bulanan, dan tahunan, pengecekan ketersediaan, pelacakan status reservasi, dan profil properti Syariah.
2. **Integrated Property Management System (PMS):** Dashboard back-office untuk pengelolaan kamar, tarif bertingkat, verifikasi persetujuan reservasi anti-double booking, kasir & deposit, housekeeping, inventaris stok, pemeliharaan fisik, dan laporan operasional.

```mermaid
flowchart TD
    subgraph Public Portal
        A[Calon Tamu] -->|Akses Web / Booking / Cek Ketersediaan| B[Public Website UI]
        B -->|Submit Reservasi| C[/api/reservasi/public-submit]
    end

    subgraph Core Engine
        C -->|Validasi Zod & Normalisasi HP| D[Pricing Engine Multi-Rental]
        D -->|Kalkulasi Tarif H/B/T| E[PMS Service Layer]
    end

    subgraph Data Persistence
        E -->|Primary: PostgREST| F[(Supabase PostgreSQL)]
        E -->|Fallback: In-Memory / Local| G[(Interactive Mock PMS Store)]
        F --> H[Row Level Security & RBAC]
    end

    subgraph Internal PMS Dashboard
        I[Staff / Resepsionis / Owner] -->|RBAC Guarded Access| J[PMS Dashboard]
        J -->|Persetujuan Atomik| E
        J -->|Pengiriman Pesan Manual| K[WhatsApp Web Protocol]
        J -->|Cetak Invoice / Bukti| L[Slip Generator & Print View]
    end
```

---

## 2. Struktur Direktori Proyek

```
ALYATAMA HOMESTAY/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx               # Homepage Resmi Bangkinang Kota
│   │   │   ├── kamar/                 # Katalog Kamar & Rincian
│   │   │   ├── cek-ketersediaan/      # Simulasi Tarif & Ketersediaan
│   │   │   ├── booking/               # Formulir Reservasi Multi-Model
│   │   │   ├── status-reservasi/      # Pelacakan Reservasi Mandiri
│   │   │   ├── kebijakan/             # Tata Tertib & Aturan Syariah
│   │   │   ├── tentang/               # Profil & Misi Dakwah Muhammadiyah
│   │   │   ├── kontak/                # Lokasi Bangkinang Kota & WhatsApp
│   │   │   └── privasi/               # Kebijakan Privasi Tamu
│   │   ├── slip/[id]/                 # Bukti Reservasi & Invoice Cetak
│   │   ├── dashboard/                 # 13 Modul Property Management System
│   │   │   ├── page.tsx               # Ikhtisar Metrik Operasional
│   │   │   ├── kalender/              # Kalender Okupansi Grid
│   │   │   ├── reservasi/             # Approval & Daftar Reservasi
│   │   │   ├── check-in-out/          # Front-desk Reception
│   │   │   ├── kamar/                 # Tarif Harian, Bulanan, Tahunan
│   │   │   ├── promo/                 # Kode Promo & Diskon
│   │   │   ├── tamu/                  # CRM & Riwayat Tamu
│   │   │   ├── pembayaran/            # Kasir, QRIS & Deposit
│   │   │   ├── keuangan/              # Buku Kas, Laba Rugi & Piutang
│   │   │   ├── housekeeping/          # Manajemen Kebersihan & Inspeksi
│   │   │   ├── inventaris/            # Stok Logistik Linen & Amenities
│   │   │   ├── pemeliharaan/          # Tiket Kerusakan & Work Order
│   │   │   ├── laporan/               # Rekapitulasi & Ekspor Excel/PDF
│   │   │   └── pengaturan/            # Profil Homestay & Audit Log
│   │   └── api/                       # REST Endpoints (Submit, Export, Sync)
│   ├── components/
│   │   ├── common/                    # AlyatamaLogo, Badges, Icons
│   │   ├── public/                    # Navbar, Footer, RoomCard
│   │   └── dashboard/                 # Sidebar RBAC, Header, MetricCard
│   └── lib/
│       ├── types/                     # TypeScript Interfaces
│       ├── pricing.ts                 # Pricing Engine (Harian, Bulanan, Tahunan)
│       ├── formatters.ts              # Rupiah, Tanggal Indonesia, Status Meta
│       ├── phone.ts                   # Normalisasi WhatsApp Indonesia
│       ├── services/                  # PMS Service Data Layer
│       ├── supabase/                  # Client, Admin Client, Check Env
│       └── mock-fallback.ts           # Authentic Seed Data Bangkinang
├── tests/                             # Vitest Test Suites
└── public/
    └── images/                        # Flyer Asli & Aset Media
```

---

## 3. Pricing Engine & Aturan Sewa

Sistem mendukung tiga skema sewa dengan durasi satuan otomatis:
- **Harian (`daily`):** Dihitung per malam dengan formula $\text{Subtotal} = \text{Malam} \times \text{Tarif Dasar}$.
- **Bulanan (`monthly`):** Dihitung per periode 30 hari dengan formula $\text{Subtotal} = \text{Bulan} \times \text{Tarif Bulanan}$.
- **Tahunan (`yearly`):** Dihitung per periode 365 hari dengan formula $\text{Subtotal} = \text{Tahun} \times \text{Tarif Tahunan}$.

---

## 4. Mekanisme Concurrency-Safe & Anti-Double Booking

Pada saat admin menyetujui reservasi:
1. Sistem mengeksekusi pemeriksaan ketersediaan ulang secara atomik.
2. Melakukan query rentang tanggal terhadap seluruh reservasi berstatus `confirmed`, `checked_in`, dan `held`.
3. Memastikan tidak ada tumpang tindih unit kamar.
4. Apabila terjadi konflik ketersediaan, sistem menolak persetujuan secara aman dan memberikan umpan balik operasional.

---

## 5. Komunikasi WhatsApp Manual Sesuai Persetujuan Tamu

Sesuai prinsip etika privasi:
1. Tidak ada SMS/WA gateway massal tanpa izin.
2. Pengiriman ringkasan reservasi hanya disiapkan setelah tamu mencentang persetujuan WhatsApp.
3. Admin memicu pengiriman pesan melalui tombol *Siapkan Pesan WhatsApp*, yang membuka format pesan ramah dan profesional via `https://wa.me/62...`.
