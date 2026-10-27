# RESERVATION_ATTRIBUTION.md — ALYATAMA HOMESTAY
## Spesifikasi Atribusi Otomatis Penerima Reservasi (Master Spec V3.1)

**Versi:** 3.1  
**Klasifikasi:** Audit Jejak Rekam & Integritas Data  

---

### 1. Masalah yang Diselesaikan

Pada sistem lama, transaksi pemesanan tidak mencatat siapa petugas yang menerima tamu walk-in atau memproses pembayaran. Jika terdapat selisih uang kasir atau komplain kamar, manajemen kesulitan menentukan siapa staf yang bertanggung jawab.

Master Spec V3.1 mewajibkan **atribusi otomatis berbasis sesi server-side** pada setiap reservasi.

---

### 2. Atribut Data pada Entitas `Reservation`

Setiap baris data reservasi dilengkapi dengan 5 metadata atribusi:

```typescript
export interface Reservation {
  // ... field reservasi inti ...
  
  // V3.1 Staff Attribution & Booking Source
  booking_source?: 'online' | 'walk_in' | 'phone' | 'admin';
  created_by_user_id?: string | null;     // ID user yang menginput transaksi
  created_by_role?: 'admin' | 'staff' | 'public';
  staff_shift_id?: string | null;         // ID Shift aktif saat transaksi dicatat
  staff_name_snapshot?: string | null;    // Nama lengkap petugas saat transaksi
}
```

---

### 3. Matriks Atribusi Berdasarkan Sumber Pemesanan

| Skenario | `booking_source` | `created_by_role` | `staff_name_snapshot` | `staff_shift_id` |
| :--- | :--- | :--- | :--- | :--- |
| Tamu isi form di website publik `/booking` | `'online'` | `'public'` | `null` (Tidak mengarang staf) | `null` |
| Staf input tamu di kasir `/panel/reservasi/baru` | `'walk_in'` | `'staff'` | Snapshot nama staf bertugas | ID shift aktif staf |
| Staf terima pesanan via telepon di panel | `'phone'` | `'staff'` | Snapshot nama staf bertugas | ID shift aktif staf |
| Administrator input reservasi langsung | `'admin'` | `'admin'` | Snapshot nama Administrator | `null` / ID Admin |

---

### 4. Perlindungan Snapshot Identitas (Identity Snapshot Integrity)

1. **Kekebalan Terhadap Perubahan Nama:**
   - Jika staf bernama "Rahmat Hidayat" berganti nama di kemudian hari, seluruh reservasi yang telah tercatat sebelumnya tetap menampilkan `"Rahmat Hidayat"`.
2. **Kekebalan Terhadap Penonaktifan Akun:**
   - Jika staf tersebut keluar dari homestay dan akunnya diset ke status `'INACTIVE'` atau `'SUSPENDED'`, data riwayat penerimaan reservasi di masa lalu tetap utuh dan sah sebagai bukti audit.
3. **Penyajian pada Slip & Dokumen:**
   - Bukti konfirmasi cetak `/slip/[id]` dan laporan operasional menampilkan kolom *"Petugas Penerima: [staff_name_snapshot]"*.
