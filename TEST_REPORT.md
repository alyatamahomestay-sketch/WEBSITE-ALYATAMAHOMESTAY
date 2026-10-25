# LAPORAN PENGUJIAN SISTEM (TEST REPORT)
**Hasil Pengujian:** 100% PASSED (17 dari 17 Test Berhasil)  
**Framework Pengujian:** Vitest v2.1.9  
**Waktu Eksekusi:** 5.78 detik  
**Tanggal:** 26 Oktober 2026

---

## 1. Ringkasan Eksekusi Test Suite

| Test Suite | File Pengujian | Jumlah Test | Hasil | Deskripsi Cakupan |
| :--- | :--- | :--- | :--- | :--- |
| **Pricing Engine** | `tests/pricing.test.ts` | 7 | **PASSED** | Validasi perhitungan malam, perhitungan sewa harian/bulanan/tahunan, diskon kode promo, pencegahan diskon negatif, dan perhitungan uang muka deposit. |
| **PMS Data Service** | `tests/pms-service.test.ts` | 5 | **PASSED** | Validasi CRUD kamar, status operasional, filter reservasi, dan fallback in-memory store. |
| **Phone Sanitization** | `tests/phone.test.ts` | 3 | **PASSED** | Normalisasi nomor telepon WhatsApp Indonesia (`08...`, `+62...`, karakter pemisah). |
| **WhatsApp Builder** | `tests/whatsapp.test.ts` | 2 | **PASSED** | Pembuatan pesan konfirmasi persetujuan ramah privasi dan pengodean URI tautan WA. |

**Total:** 4 Test Suites, 17 Unit Tests, 0 Failed.

---

## 2. Rincian Uji Logika Bisnis Kunci

1. **Hospitality Night Standard:**
   - Check-in `2026-10-10`, Check-out `2026-10-12` menghasilkan tepat 2 malam.
   - Check-in sama dengan Check-out atau tanggal mundur menghasilkan 0 malam (menolak pemesanan tidak valid).
2. **Multi-Model Duration Calculation:**
   - Sewa Harian (3 malam) $\rightarrow$ 3 satuan malam.
   - Sewa Bulanan (Oct 01 s/d Dec 01) $\rightarrow$ 2 satuan bulan (61 malam).
   - Sewa Tahunan (Jan 01 s/d Jan 01 tahun berikutnya) $\rightarrow$ 1 satuan tahun (365 malam).
3. **Multi-Model Pricing & Deposit Calculation:**
   - Harian: 2 malam $\times$ Rp 300.000 = Rp 600.000, diskon Rp 50.000 $\rightarrow$ Total Rp 550.000, Deposit 50% = Rp 275.000.
   - Bulanan: 1 bulan dengan tarif Rp 2.500.000 $\rightarrow$ Total Rp 2.500.000, Deposit 50% = Rp 1.250.000.
   - Tahunan: 1 tahun dengan tarif Rp 24.000.000 $\rightarrow$ Total Rp 24.000.000, Deposit 50% = Rp 12.000.000.
4. **Phone Formatting:**
   - `0822-8547-2008` dinormalisasi menjadi `6282285472008`.
   - `+62 822 8547 2008` dinormalisasi menjadi `6282285472008`.
