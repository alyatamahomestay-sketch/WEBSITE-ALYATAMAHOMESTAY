# STAFF_ACCESS_MANAGEMENT.md — ALYATAMA HOMESTAY
## Kebijakan Manajemen Akses Staf Terkendali Admin (Master Spec V3.1)

**Versi:** 3.1  
**Otoritas:** Administrator Utama ALYATAMA HOMESTAY  

---

### 1. Prinsip Utama: Larangan Self-Registration Publik

Sistem ALYATAMA HOMESTAY menerapkan prinsip **Closed-Access Enterprise**:
- Tidak tersedia formulir registrasi staf di website publik.
- Hak untuk membuat, mengundang, mengaktifkan, menonaktifkan, atau menghapus akun staf **100% berada di bawah kendali Administrator** melalui modul `/panel/staff`.

---

### 2. Siklus Hidup Akun Staf (Account Lifecycle State Machine)

Setiap akun staf memiliki salah satu dari 4 status operasional:

```
        ┌──────────────────────────────────────────────┐
        │                                              ▼
  [ Admin Buat Akun ] ──► (INVITED) ──► (ACTIVE) ◄──► (INACTIVE)
                                │          │
                                ▼          ▼
                           (SUSPENDED) ◄───┘
```

| Status | Hak Login | Akses Operasional | Keterangan Bisnis |
| :--- | :--- | :--- | :--- |
| **`INVITED`** | Ditolak | Ditolak | Akun baru dibuat oleh admin, menunggu aktivasi pertama. |
| **`ACTIVE`** | **Diizinkan** | **Diizinkan** | Staf aktif dapat login, memulai shift, dan melayani tamu. |
| **`INACTIVE`** | Ditolak | Ditolak | Staf sedang cuti panjang atau non-aktif sementara. Riwayat tetap utuh. |
| **`SUSPENDED`** | Ditolak | Ditolak | Akses dicabut seketika karena investigasi atau pelanggaran SOP. |

---

### 3. Dua Peran Bisnis Final: ADMIN vs STAFF

Sesuai ketetapan Master Spec V3.1, sistem menyederhanakan izin menjadi **hanya dua peran**:

| Modul / Kemampuan | Peran `ADMIN` | Peran `STAFF` |
| :--- | :---: | :---: |
| Dashboard Ikhtisar Kerja | Ya | Ya |
| Kalender Okupansi | Ya | Ya |
| Data Reservasi & Status | Ya | Ya |
| Pendaftaran Tamu Walk-in (`/panel/reservasi/baru`) | Ya | Ya |
| Check-in & Check-out Tamu | Ya | Ya |
| Pencatatan Pembayaran Kasir | Ya | Ya |
| Database Tamu (CRM) | Ya | Ya |
| Mulai & Akhiri Shift Kerja | Ya | **Wajib** |
| Tambah / Edit / Suspend Akun Staf (`/panel/staff`) | **Ya** | **Dilarang** |
| Reset PIN / Password Staf Lain | **Ya** | **Dilarang** |
| Ubah Harga Dasar & Kamar (`/panel/kamar`) | **Ya** | **Dilarang** |
| Akses Laporan Keuangan Strategis & Laba | **Ya** | **Dilarang** |
| Ekspor Laporan CSV | **Ya** | **Dilarang** |
| Kontrol Setup Tampilan Website & Foto Iklan | **Ya** | **Dilarang** |
| Audit Log Sistem | **Ya** | **Dilarang** |

---

### 4. Prosedur Pencabutan Akses Seketika (Revocation)

Apabila admin mengubah status akun staf menjadi `INACTIVE` atau `SUSPENDED`:
1. Database mengunci status akun secara atomik.
2. Setiap permintaan transaksi berikutnya (misal walk-in, pembayaran, update reservasi) yang menggunakan ID staf tersebut akan **langsung ditolak server-side**.
3. Riwayat shift historis, data reservasi terdahulu, dan catatan pembayaran yang pernah dibuat oleh staf tersebut **tetap tersimpan rapi** berkat mekanisme snapshot identitas.
