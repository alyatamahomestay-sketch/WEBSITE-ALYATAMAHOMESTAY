# STAFF_SHIFT_SPECIFICATION.md — ALYATAMA HOMESTAY
## Spesifikasi Teknis Shift Kerja Harian & Konfirmasi Nama (Master Spec V3.1)

**Versi:** 3.1  
**Zona Waktu Baku:** `Asia/Jakarta` (WIB)  

---

### 1. Tujuan Bisnis & Akuntabilitas

Di industri perhotelan dan homestay syariah, perputaran petugas front-desk berlangsung dalam shift harian (pagi, sore, malam). Untuk memastikan transparansi keuangan kasir dan kepatuhan terhadap adab pelayanan, **setiap staf wajib memiliki shift aktif** sebelum diizinkan membuat reservasi, mengubah status kamar, atau menerima pembayaran kas.

---

### 2. Alur Kerja Login Staf & Konfirmasi Shift

```
[ Buka /panel/login ]
         │
         ▼
[ Verifikasi Kredensial ] ──(Gagal)──► Tampilkan Pesan Error Netral
         │
      (Sukses)
         │
   [ Cek Role ]
    ├── Role ADMIN ──────────────► Langsung Masuk Dashboard (/panel)
    └── Role STAFF
           │
     [ Cek Shift Aktif ]
      ├── Ada Shift Aktif ──────► Langsung Masuk Dashboard (/panel)
      └── Belum Ada Shift
             │
             ▼
      [ Layar Konfirmasi Identitas ]
      • Nama Lengkap Snapshot: "Rahmat Hidayat"
      • Tanggal Lokal: YYYY-MM-DD (Asia/Jakarta)
      • Catatan Shift (Opsional): "Shift Pagi Front Office"
             │
             ▼
      [ Tekan "Mulai Shift & Masuk Sistem" ]
             │
             ▼
      [ Simpan Record staff_shifts ] ──► Masuk Dashboard (/panel)
```

---

### 3. Struktur Data `staff_shifts`

```typescript
export interface StaffShift {
  id: string;                   // UUID / Unique Shift ID
  staff_user_id: string;        // ID akun staf terdaftar
  staff_name_snapshot: string;  // Snapshot nama lengkap saat shift dimulai
  started_at: string;           // ISO 8601 Timestamp (UTC)
  ended_at?: string | null;     // ISO 8601 Timestamp saat shift ditutup
  status: 'active' | 'ended';   // Status shift
  date_local: string;           // Tanggal lokal operasional (YYYY-MM-DD WIB)
  notes?: string | null;        // Keterangan shift
  created_at: string;
  updated_at: string;
}
```

---

### 4. Penanganan Kasus Khusus (Edge Cases)

1. **Shift Melewati Tengah Malam (Midnight Crossover):**
   - Shift yang dimulai pukul 20:00 WIB dan berakhir pukul 08:00 WIB keesokan harinya dihitung sebagai satu entitas shift berkesinambungan. `date_local` mengacu pada tanggal mulai dinas.
2. **Pencegahan Shift Aktif Ganda (No Double Active Shift):**
   - Sistem memvalidasi bahwa seorang staf tidak dapat membuka shift baru apabila ia masih memiliki shift berstatus `'active'`.
3. **Persistensi Sesi Setelah Refresh Browser:**
   - ID shift dan snapshot identitas disimpan dalam sesi aman client-side dan tervalidasi pada setiap panggilan server. Refresh halaman tidak membatalkan shift yang sedang berjalan.
4. **Penutupan Shift Eksplisit ("Akhiri Shift"):**
   - Staf dapat menutup shift melalui tombol *"Akhiri Shift"* di panel header atau sidebar. Sistem mencatat `ended_at` aktual dan mengubah status menjadi `'ended'`.
