# DAFTAR FITUR & STATUS IMPLEMENTASI (FEATURE CHECKLIST)

## Website Publik (Calon Tamu)

| Fitur | Status | Deskripsi Implementasi |
| :--- | :--- | :--- |
| **Beranda (Homepage)** | **SELESAI** | Hero section Islami *"Nikmati Kenyamanan, Raih Ibadah Jariyah"*, flyer asli, model sewa 3 pilar, 6 fasilitas utama, banner dakwah & amal jariyah, patokan lokasi Bangkinang. |
| **Katalog & Detail Kamar** | **SELESAI** | Daftar kamar dengan tarif harian, bulanan, tahunan, foto asli, spesifikasi kapasitas, fasilitas AC & kamar mandi dalam. |
| **Cek Ketersediaan** | **SELESAI** | Simulasi tarif otomatis berdasarkan rentang tanggal dan opsi masa sewa (Harian/Bulanan/Tahunan). |
| **Formulir Reservasi Online** | **SELESAI** | Validasi Zod, pemrosesan no WA Indonesia, deklarasi pasangan Syariah, pilihan sewa, persetujuan data & persetujuan WA terpisah. |
| **Pelacakan Status Reservasi** | **SELESAI** | Lacak nomor `ALY-YYYYMMDD-XXXX`, status approval, petunjuk transfer deposit, dan tombol cetak slip. |
| **Cetak Bukti & Slip** | **SELESAI** | Halaman `/slip/[id]` siap cetak untuk bukti pemesanan, invoice resmi, dan kuitansi pelunasan. |
| **Tentang Properti** | **SELESAI** | Visi dakwah, keterikatan amal jariyah dengan Panti Asuhan Putra Muhammadiyah Bangkinang. |
| **Kebijakan & Syariah** | **SELESAI** | Ketentuan pasangan sah suami-istri, waktu check-in/out, kebijakan deposit & pembatalan H-3. |
| **Kontak & Lokasi Terverifikasi**| **SELESAI** | Jl. Mayor Ali Rasyid No 19 Bangkinang Kota (Belakang SPBU, Samping RS Norpa Husada), tautan Google Maps, tombol direct WhatsApp 0822 8547 2008. |
| **Kebijakan Privasi** | **SELESAI** | Penjelasan perlindungan data tamu dan penegasan WhatsApp manual tanpa spam. |

---

## Dashboard Internal (Property Management System)

| Modul PMS | Status | Deskripsi Operasional |
| :--- | :--- | :--- |
| **1. Ikhtisar Operasional** | **SELESAI** | KPI okupansi, kamar terisi, pendapatan harian/bulanan, piutang, dan kamar kotor. |
| **2. Kalender Okupansi** | **SELESAI** | Tampilan grid matriks ketersediaan unit per hari. |
| **3. Manajemen Reservasi** | **SELESAI** | Approval workflow anti-double booking, penolakan beralasan, filter status, penguncian harga. |
| **4. Check-in & Check-out** | **SELESAI** | Operasional resepsionis, serah terima kunci, verifikasi identitas, dan checklist kebersihan keluar. |
| **5. Kamar & Tarif** | **SELESAI** | Input tarif Harian, Bulanan, Tahunan, status operasional kamar, fasilitas, dan arsip kamar. |
| **6. Promo & Diskon** | **SELESAI** | Manajemen kode promo persentase / nominal dengan batasan min nights dan tanggal berlaku. |
| **7. CRM Tamu** | **SELESAI** | Direktori tamu, klasifikasi (Regular/VIP/Blacklist), riwayat kunjungan, catatan preferensi. |
| **8. Kasir & Pembayaran** | **SELESAI** | Pencatatan pembayaran tunai, transfer, scan QRIS, pelunasan tagihan, dan manajemen deposit jaminan. |
| **9. Keuangan & Laba Rugi**| **SELESAI** | Buku kas operasional, pencatatan biaya listrik/linen/kebersihan, ringkasan laba bersih, piutang. |
| **10. Housekeeping** | **SELESAI** | Penugasan kamar kotor, pembersihan linen, verifikasi inspeksi kamar bersih (siap huni). |
| **11. Inventaris Logistik** | **SELESAI** | Stok sabun, sprei, handuk, sajadah, peringatan stok menipis, log mutasi barang. |
| **12. Pemeliharaan Kerusakan**| **SELESAI** | Tiket perbaikan AC, plumbing, kelistrikan, status pengerjaan teknisi, kamar dinonaktifkan sementara. |
| **13. Laporan & Ekspor** | **SELESAI** | Rekapitulasi pendapatan dan okupansi dengan fitur ekspor Excel (.xlsx) dan PDF. |
