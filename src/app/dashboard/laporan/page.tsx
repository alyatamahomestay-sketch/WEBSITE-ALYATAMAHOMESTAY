'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PmsService } from '@/lib/services/pms-service';
import { Reservation, Expense } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

export default function LaporanPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const resData = await PmsService.getReservations();
        const expData = await PmsService.getExpenses();
        setReservations(resData);
        setExpenses(expData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Summary Metrics
  const totalVerifiedRevenue = reservations.reduce((sum, r) => sum + Number(r.price_snapshot?.total_paid || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netOperationalCashflow = totalVerifiedRevenue - totalExpenses;
  const totalReceivables = reservations.reduce((sum, r) => {
    if (r.status !== 'cancelled' && r.status !== 'rejected') {
      return sum + Number(r.price_snapshot?.balance_due || 0);
    }
    return sum;
  }, 0);

  // Export to Excel XLSX Handler
  const handleExportExcel = () => {
    // Sheet 1: Reservations
    const resRows = reservations.map((r) => ({
      'No. Reservasi': r.reservation_number,
      'Nama Tamu': r.guest?.full_name || '',
      'Telepon / WhatsApp': r.guest?.phone || '',
      'Unit Kamar': r.rooms?.[0]?.name || '',
      'Tanggal Check-in': r.checkin_date,
      'Tanggal Check-out': r.checkout_date,
      'Durasi Malam': r.price_snapshot?.total_nights || 1,
      'Total Biaya (Rp)': r.price_snapshot?.total_amount || 0,
      'Total Dibayar (Rp)': r.price_snapshot?.total_paid || 0,
      'Sisa Tagihan (Rp)': r.price_snapshot?.balance_due || 0,
      'Status Reservasi': r.status,
      'Status Pembayaran': r.payment_status,
    }));

    // Sheet 2: Expenses
    const expRows = expenses.map((e) => ({
      'No. Pengeluaran': e.expense_number,
      'Kategori': e.category,
      'Deskripsi': e.description,
      'Nominal (Rp)': e.amount,
      'Tanggal': e.expense_date,
      'Metode Bayar': e.payment_method,
      'Vendor': e.vendor || '',
    }));

    // Sheet 3: Summary
    const summaryRows = [
      { 'Indikator Finansial': 'Total Kas Masuk Terverifikasi', 'Nilai (Rp)': totalVerifiedRevenue },
      { 'Indikator Finansial': 'Total Pengeluaran Operasional', 'Nilai (Rp)': totalExpenses },
      { 'Indikator Finansial': 'Estimasi Arus Kas Bersih', 'Nilai (Rp)': netOperationalCashflow },
      { 'Indikator Finansial': 'Total Piutang Belum Terbayar', 'Nilai (Rp)': totalReceivables },
    ];

    const workbook = XLSX.utils.book_new();

    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    const wsRes = XLSX.utils.json_to_sheet(resRows);
    const wsExp = XLSX.utils.json_to_sheet(expRows);

    XLSX.utils.book_append_sheet(workbook, wsSummary, 'Ringkasan Eksekutif');
    XLSX.utils.book_append_sheet(workbook, wsRes, 'Data Reservasi');
    XLSX.utils.book_append_sheet(workbook, wsExp, 'Data Pengeluaran');

    const fileName = `Laporan_Operasional_ALYATAMA_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            Laporan Operasional & Keuangan
          </h2>
          <p className="text-xs text-stone-500">
            Kompilasi data transaksi aktual homestay yang dapat diunduh ke format Excel (.xlsx) atau dicetak.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
            className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 inline-flex items-center gap-1.5 text-xs font-medium shadow-sm"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            Cetak Laporan
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white inline-flex items-center gap-2 text-xs font-medium shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Ekspor ke Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
            Kas Masuk Terverifikasi
          </span>
          <div className="text-xl font-bold text-emerald-700">
            {formatRupiah(totalVerifiedRevenue)}
          </div>
          <span className="text-[10px] text-stone-400">Pembayaran riil tamu</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
            Pengeluaran Operasional
          </span>
          <div className="text-xl font-bold text-rose-700">
            {formatRupiah(totalExpenses)}
          </div>
          <span className="text-[10px] text-stone-400">Total belanja & tagihan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
            Estimasi Arus Kas Bersih
          </span>
          <div className={`text-xl font-bold ${netOperationalCashflow >= 0 ? 'text-stone-900' : 'text-rose-700'}`}>
            {formatRupiah(netOperationalCashflow)}
          </div>
          <span className="text-[10px] text-stone-400">Kas masuk minus beban</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
            Total Piutang Belum Lunas
          </span>
          <div className="text-xl font-bold text-amber-700">
            {formatRupiah(totalReceivables)}
          </div>
          <span className="text-[10px] text-stone-400">Sisa tagihan tamu</span>
        </div>
      </div>

      {/* Printable Report Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-stone-900 text-sm">
            Tabel Ringkasan Pemesanan Menginap
          </h3>
          <p className="text-xs text-stone-500">
            Laporan ini mencerminkan database aktual ALYATAMA HOMESTAY.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3 font-semibold">No. Reservasi</th>
                <th className="py-2.5 px-3 font-semibold">Tamu</th>
                <th className="py-2.5 px-3 font-semibold">Kamar</th>
                <th className="py-2.5 px-3 font-semibold">Check-in</th>
                <th className="py-2.5 px-3 font-semibold">Check-out</th>
                <th className="py-2.5 px-3 font-semibold text-right">Total Biaya</th>
                <th className="py-2.5 px-3 font-semibold text-right">Terbayar</th>
                <th className="py-2.5 px-3 font-semibold text-right">Sisa Tagihan</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-3 font-mono font-medium text-stone-900">{r.reservation_number}</td>
                  <td className="py-3 px-3">{r.guest?.full_name}</td>
                  <td className="py-3 px-3">{r.rooms?.[0]?.name}</td>
                  <td className="py-3 px-3">{r.checkin_date}</td>
                  <td className="py-3 px-3">{r.checkout_date}</td>
                  <td className="py-3 px-3 text-right font-medium">{formatRupiah(r.price_snapshot?.total_amount)}</td>
                  <td className="py-3 px-3 text-right text-emerald-700 font-medium">{formatRupiah(r.price_snapshot?.total_paid || 0)}</td>
                  <td className="py-3 px-3 text-right text-stone-700">{formatRupiah(r.price_snapshot?.balance_due)}</td>
                  <td className="py-3 px-3 text-center uppercase text-[10px] font-semibold">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
