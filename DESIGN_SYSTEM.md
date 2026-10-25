# SISTEM DESAIN VISUAL — ALYATAMA HOMESTAY
**Tema:** Modern Islamic Boutique Hospitality  
**Filosofi Desain:** Tenang, Matang, Hangat, Bersih, dan Penuh Berkah. Dilarang menghasilkan AI Slop (tanpa gradien ungu-biru neon, tanpa glassmorphism berlebihan, tanpa border-radius raksasa tanpa fungsi).

---

## 1. Palet Warna Resmi (Brand Design Tokens)

Palet warna diturunkan secara harmonis dari identitas homestay Syariah dan flyer promosi resmi:

| Token Warna | Nilai Hex | Peran & Penggunaan |
| :--- | :--- | :--- |
| **Primary Background** | `#F6F0E7` | Latar belakang utama website publik, lembut dan ramah di mata. |
| **Secondary Background** | `#E7D8C5` | Latar belakang seksi aksen, pemisah konten, dan banner sewa. |
| **Primary Brand Brown** | `#806044` | Tombol aksi utama (CTA), header aksen, badge pilihan masa sewa. |
| **Dark Espresso** | `#392B21` | Warna navbar, sidebar PMS, kartu hero, teks headline utama. |
| **Olive Green Accent** | `#65715A` | Simbol keteduhan Islami, lencana fasilitas, tarif tahunan. |
| **Gold / Sand Accent** | `#C9A84C` | Aksen emas kaligrafi, bintang, kutipan hadits / sedekah jariyah. |
| **Pure White** | `#FFFFFF` | Permukaan kartu kamar, formulir, tabel dashboard. |
| **Text Muted** | `#756A5F` | Teks sekunder, deskripsi fasilitas, keterangan kebijakan. |
| **Border Neutral** | `#E5DCD0` | Garis batas kartu, tabel, dan formulir dengan kontras halus. |

---

## 2. Tipografi

Sistem tipografi menggunakan perpaduan **Playfair Display / Serif Klasik** untuk tajuk utama dan **Inter / Sans-Serif Modern** untuk teks tubuh dan data tabular:

- **Display & Headings:** `font-serif` (Playfair Display)
  - Memberikan kesan elegan, terpercaya, dan keramahan boutique perhotelan.
  - Skala ukuran: `text-4xl` s/d `text-6xl` (Hero Headline), `text-2xl` s/d `text-3xl` (Section Title), `text-lg` s/d `text-xl` (Card Title).
- **Body & Tabular Data:** `font-sans` (Inter / System Sans)
  - Mengutamakan keterbacaan tinggi pada tabel operasional, tanggal, nomor telepon, dan angka Rupiah.
  - Skala ukuran: `text-xs` (12px - data tabel & badge), `text-sm` (14px - isi artikel & formulir), `text-base` (16px - subheadline).
- **Nomor Identifikasi & Monospace:** `font-mono`
  - Digunakan untuk Nomor Reservasi (`ALY-YYYYMMDD-XXXX`), Nomor Kamar (`101`, `102`), dan Kode Promo.

---

## 3. Komponen Brand & Lambang

### Lambang Geometris ALYATAMA (`AlyatamaLogo.tsx`)
- Logo berbasis SVG vektor murni dengan perpaduan warna Dark Espresso (`#392B21`), Primary Brown (`#806044`), dan aksen Gold (`#C9A84C`).
- Menggabungkan siluet kubah/atap hunian dengan huruf geometris **A** yang melambangkan ALYATAMA, hunian aman, dan nilai ketauhidan.

---

## 4. Status Operasional & Pembayaran Berstandar Hospitality

### Status Reservasi
- **`pending_approval`:** Badge Kuning/Amber (`bg-amber-100 text-amber-800 border-amber-200`) — Menunggu Persetujuan Admin.
- **`confirmed`:** Badge Zamrud/Hijau (`bg-emerald-100 text-emerald-800 border-emerald-200`) — Terkonfirmasi & Kamar Terkunci.
- **`checked_in`:** Badge Biru Lembut (`bg-sky-100 text-sky-800 border-sky-200`) — Tamu Sudah di Kamar.
- **`checked_out`:** Badge Slate/Abu (`bg-stone-100 text-stone-800 border-stone-200`) — Selesai Menginap.
- **`cancelled` / `rejected`:** Badge Mawar/Merah (`bg-rose-100 text-rose-800 border-rose-200`) — Dibatalkan / Ditolak.

### Status Kamar (Housekeeping)
- **Tersedia (Siap Digunakan):** Hijau Lembut.
- **Ditempati (Occupied):** Biru.
- **Menunggu Dibersihkan:** Kuning/Oranye.
- **Sedang Dibersihkan:** Biru Muda.
- **Dalam Perawatan / Perbaikan:** Merah/Mawar.

---

## 5. Tata Letak Responsif & Aksesibilitas
- **Desktop:** Sidebar sticky yang dapat diciutkan, grid 3 kolom untuk kamar, tabel data dengan scroll horizontal yang nyaman.
- **Mobile & Tablet:** Drawer navigasi off-canvas, form satu kolom ramah sentuhan, padding ergonomis (minimal 44px tinggi area sentuh).
