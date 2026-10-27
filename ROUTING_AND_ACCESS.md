# ROUTING_AND_ACCESS.md — ALYATAMA HOMESTAY
## Pemisahan Rute Publik & Portal Operasional (Master Spec V3.1)

**Versi:** 3.1  
**Klasifikasi:** Dokumen Arsitektur & Keamanan  
**Domain Target:** Properti Tunggal ALYATAMA HOMESTAY, Bangkinang Kota  

---

### 1. Prinsip Pemisahan Jalur (Two-Door Architecture)

Sistem ALYATAMA HOMESTAY beroperasi pada **satu domain terpadu** dengan pemisahan jalur akses yang mutlak antara calon pengunjung publik dan pengelola operasional:

```
[ Domain Utama Properti ]
       │
       ├── / (Website Publik) ───────────► Tamu / Calon Pengunjung (Tanpa Login)
       │                                   • Beranda, Kamar, Galeri Iklan, Cek Jadwal, Booking Online
       │                                   • Bebas dari ikon kunci, tombol login, atau pintu masuk staf
       │
       └── /panel (Portal Pengelola) ────► Login Terproteksi di /panel/login
                                           • Role ADMIN: Akses Penuh Sistem & Kelola Staf
                                           • Role STAFF: Operasional Harian, Shift, & Walk-in
```

---

### 2. Matriks Rute Lengkap

#### A. Rute Publik (Calon Tamu)
| Rute | Deskripsi | Otorisasi |
| :--- | :--- | :--- |
| `/` | Beranda utama, hero section, keunggulan syariah, lokasi | Publik |
| `/kamar` | Daftar seluruh kamar & rincian tarif (Harian/Bulanan/Tahunan) | Publik |
| `/galeri` | Galeri foto iklan, brosur flyer resmi, dan kegiatan dakwah | Publik |
| `/cek-ketersediaan`| Pemeriksaan ketersediaan unit kamar real-time | Publik |
| `/booking` | Formulir pengajuan reservasi online | Publik |
| `/status-reservasi` | Pelacakan status permohonan reservasi via nomor booking | Publik |
| `/tentang` | Profil properti & komitmen jariyah santri Muhammadiyah | Publik |
| `/kebijakan` | Tata tertib syariah & ketentuan pasangan suami-istri | Publik |
| `/kontak` | Alamat fisik Jl. Mayor Ali Rasyid No 19 & Google Maps | Publik |
| `/privasi` | Kebijakan perlindungan data pribadi tamu | Publik |

#### B. Rute Portal Pengelola (`/panel`)
| Rute | Deskripsi | Peran Minimum |
| :--- | :--- | :--- |
| `/panel/login` | Pintu masuk autentikasi staf & konfirmasi shift | Publik Terproteksi |
| `/panel` | Dashboard ikhtisar kerja, status okupansi, & shift aktif | STAFF / ADMIN |
| `/panel/reservasi/baru` | Formulir pendaftaran reservasi walk-in langsung di kasir | STAFF / ADMIN |
| `/panel/reservasi` | Data reservasi dengan atribusi nama staf penerima | STAFF / ADMIN |
| `/panel/check-in-out` | Operasional check-in dan check-out tamu harian | STAFF / ADMIN |
| `/panel/kalender` | Kalender okupansi visual seluruh unit | STAFF / ADMIN |
| `/panel/pembayaran` | Pencatatan pembayaran kasir & verifikasi bukti transfer | STAFF / ADMIN |
| `/panel/tamu` | Database tamu CRM & riwayat kunjungan | STAFF / ADMIN |
| `/panel/staff` | **Kelola akun staf, reset PIN, & riwayat shift** | **ADMIN Saja** |
| `/panel/kamar` | Modifikasi unit kamar, fasilitas, dan tarif dasar | **ADMIN Saja** |
| `/panel/promo` | Pengaturan diskon & promosi musiman | **ADMIN Saja** |
| `/panel/keuangan` | Laporan laba rugi & pengeluaran operasional | **ADMIN Saja** |
| `/panel/laporan` | Ekspor rekapitulasi data format CSV | **ADMIN Saja** |
| `/panel/iklan` | Kendali foto iklan & brosur pada galeri publik | **ADMIN Saja** |
| `/panel/pengaturan` | Profil bisnis, kontak, & kebijakan syariah | **ADMIN Saja** |
| `/panel/pengaturan/tampilan` | Pengendalian langsung elemen visual website publik | **ADMIN Saja** |

---

### 3. Kebijakan Keamanan Rute & SEO

1. **Robots.txt & Meta Tags:**
   - Seluruh rute di bawah `/panel/*` wajib memiliki header HTTP `X-Robots-Tag: noindex, nofollow, noarchive`.
   - Mesin pencari (Google, Bing) dilarang mengindeks halaman operasional staf maupun data tamu.
2. **Peralihan Rute Warisan (Legacy Redirects):**
   - URL `/admin` dialihkan secara otomatis ke `/panel/login` (Status 307/308).
   - URL `/portal` dialihkan secara otomatis ke `/panel/login`.
   - URL `/dashboard/*` dialihkan atau dilayani melalui wrapper `/panel/*`.
