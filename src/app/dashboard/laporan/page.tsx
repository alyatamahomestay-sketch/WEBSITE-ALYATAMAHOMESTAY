'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Calendar, 
  Filter,
  Eye,
  FileText,
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Layers,
  CheckCircle2,
  Building,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PmsService } from '@/lib/services/pms-service';
import { Reservation, Expense, Room, StaffUser } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';
import ReportPrintTemplate from '@/components/panel/ReportPrintTemplate';

export default function LaporanPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view: 'screen' (interactive dashboard table) or 'print_preview' (A4 document preview)
  const [activeTab, setActiveTab] = useState<'screen' | 'print_preview'>('print_preview');

  // Filter States
  const [datePreset, setDatePreset] = useState<'all' | 'this_month' | 'last_30_days' | 'custom'>('this_month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Report Configuration
  const [printedBy, setPrintedBy] = useState<string>('Admin Operasional');
  const [operationalNotes, setOperationalNotes] = useState<string>(
    'Operasional berjalan tertib dan sesuai SOP homestay syariah. Seluruh catatan kas penerimaan, pengeluaran, serta bukti fisik telah diverifikasi kebenarannya oleh staf bertugas.'
  );

  // Initialize date range on mount (default to current month)
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);

    // Get current logged-in staff username
    if (typeof window !== 'undefined') {
      const sessStr = localStorage.getItem('alyatama_staff_session');
      if (sessStr) {
        try {
          const sess = JSON.parse(sessStr);
          if (sess.full_name) {
            setPrintedBy(sess.full_name);
          } else if (sess.username) {
            setPrintedBy(sess.username.toUpperCase());
          }
        } catch (e) {}
      }
    }
  }, []);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [resData, expData, roomsData, staffData] = await Promise.all([
        PmsService.getReservations(),
        PmsService.getExpenses(),
        PmsService.getRooms(),
        PmsService.getStaffUsers(),
      ]);
      setReservations(resData);
      setExpenses(expData);
      setRooms(roomsData);
      setStaffUsers(staffData);
    } catch (err) {
      console.error('Error loading report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Preset Changes
  const handlePresetChange = (preset: 'all' | 'this_month' | 'last_30_days' | 'custom') => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === 'last_30_days') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setStartDate(past30);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Filter reservations and expenses based on current date range
  const filteredReservations = reservations.filter((r) => {
    if (!startDate && !endDate) return true;
    const rDate = r.checkin_date || r.created_at?.split('T')[0] || '';
    if (startDate && rDate < startDate) return false;
    if (endDate && rDate > endDate) return false;
    return true;
  });

  const filteredExpenses = expenses.filter((e) => {
    if (!startDate && !endDate) return true;
    const eDate = e.expense_date || e.created_at?.split('T')[0] || '';
    if (startDate && eDate < startDate) return false;
    if (endDate && eDate > endDate) return false;
    return true;
  });

  // Summary Metrics
  const validReservations = filteredReservations.filter(
    (r) => r.status !== 'cancelled' && r.status !== 'rejected'
  );
  const totalVerifiedRevenue = validReservations.reduce(
    (sum, r) => sum + Number(r.price_snapshot?.total_paid || 0),
    0
  );
  const totalExpenses = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );
  const netOperationalCashflow = totalVerifiedRevenue - totalExpenses;
  const totalReceivables = validReservations.reduce((sum, r) => {
    return sum + Number(r.price_snapshot?.balance_due || 0);
  }, 0);

  // Trigger Native Browser Print
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Export to Excel XLSX Handler
  const handleExportExcel = () => {
    // Sheet 1: Reservations
    const resRows = filteredReservations.map((r) => ({
      'No. Reservasi': r.reservation_number,
      'Nama Tamu': r.guest?.full_name || '',
      'Telepon / WhatsApp': r.guest?.phone || '',
      'Unit Kamar': r.rooms?.[0]?.name || '',
      'Sumber Booking': r.booking_source || 'online',
      'Tanggal Check-in': r.checkin_date,
      'Tanggal Check-out': r.checkout_date,
      'Durasi Malam': r.price_snapshot?.total_nights || 1,
      'Total Biaya (Rp)': r.price_snapshot?.total_amount || 0,
      'Total Dibayar (Rp)': r.price_snapshot?.total_paid || 0,
      'Sisa Tagihan (Rp)': r.price_snapshot?.balance_due || 0,
      'Status Reservasi': r.status,
      'Status Pembayaran': r.payment_status,
      'Petugas Input': r.staff_name_snapshot || 'Online System',
    }));

    // Sheet 2: Expenses
    const expRows = filteredExpenses.map((e, idx) => ({
      'No.': idx + 1,
      'No. Beban': e.expense_number,
      'Tanggal': e.expense_date,
      'Kategori': e.category,
      'Keterangan': e.description,
      'Vendor / Rekanan': e.vendor || '',
      'Metode Bayar': e.payment_method,
      'Nominal (Rp)': e.amount,
      'Dicatat Oleh': e.recorded_by || 'Admin',
    }));

    // Sheet 3: Summary
    const summaryRows = [
      { 'Indikator Finansial': 'Periode Laporan', 'Nilai': `${startDate || 'Awal'} s/d ${endDate || 'Sekarang'}` },
      { 'Indikator Finansial': 'Total Kas Masuk Terverifikasi', 'Nilai': totalVerifiedRevenue },
      { 'Indikator Finansial': 'Total Pengeluaran Operasional', 'Nilai': totalExpenses },
      { 'Indikator Finansial': 'Estimasi Arus Kas Bersih (Net)', 'Nilai': netOperationalCashflow },
      { 'Indikator Finansial': 'Total Piutang Belum Lunas', 'Nilai': totalReceivables },
      { 'Indikator Finansial': 'Total Transaksi Reservasi', 'Nilai': validReservations.length },
      { 'Indikator Finansial': 'Petugas Pelapor', 'Nilai': printedBy },
      { 'Indikator Finansial': 'Waktu Cetak', 'Nilai': new Date().toLocaleString('id-ID') },
    ];

    const workbook = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    const wsRes = XLSX.utils.json_to_sheet(resRows);
    const wsExp = XLSX.utils.json_to_sheet(expRows);

    XLSX.utils.book_append_sheet(workbook, wsSummary, 'Ringkasan Eksekutif');
    XLSX.utils.book_append_sheet(workbook, wsRes, 'Data Reservasi');
    XLSX.utils.book_append_sheet(workbook, wsExp, 'Data Beban Operasional');

    const fileName = `Laporan_Operasional_ALYATAMA_${startDate || 'All'}_sd_${endDate || 'All'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ============================================================== */}
      {/* TOP HEADER CONTROLS (NON-PRINT)                                */}
      {/* ============================================================== */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#30291F] text-[#F7F4ED]">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
              Laporan Operasional &amp; Keuangan
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Kompilasi rekapitulasi data transaksi homestay, audit performa unit, dan cetak dokumen resmi A4 terstandar.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Data */}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Cetak Laporan Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-[#806044] hover:bg-[#6b5038] text-white inline-flex items-center gap-2 text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen Resmi (A4)
          </button>

          {/* Ekspor Excel */}
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white inline-flex items-center gap-2 text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Ekspor Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FILTER & CONFIGURATION BAR (NON-PRINT)                         */}
      {/* ============================================================== */}
      <div className="no-print bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-stone-700 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              Periode:
            </span>
            <button
              onClick={() => handlePresetChange('this_month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                datePreset === 'this_month'
                  ? 'bg-[#30291F] text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => handlePresetChange('last_30_days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                datePreset === 'last_30_days'
                  ? 'bg-[#30291F] text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              30 Hari Terakhir
            </button>
            <button
              onClick={() => handlePresetChange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                datePreset === 'all'
                  ? 'bg-[#30291F] text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Semua Data (Kumulatif)
            </button>
            <button
              onClick={() => handlePresetChange('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                datePreset === 'custom'
                  ? 'bg-[#30291F] text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Kustom
            </button>
          </div>

          {/* Date Picker Inputs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#806044]"
              />
            </div>
            <span className="text-stone-400 text-xs">-</span>
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <span>Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#806044]"
              />
            </div>
          </div>
        </div>

        {/* Additional Print Options (Petugas & Catatan Khusus) */}
        <div className="pt-3 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Nama Petugas Pelapor (Tanda Tangan Dibuat Oleh):
            </label>
            <input
              type="text"
              value={printedBy}
              onChange={(e) => setPrintedBy(e.target.value)}
              placeholder="Contoh: Rahmat Ramadhan / Admin"
              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#806044] text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Catatan Khusus Operasional (Muncul di Footer Laporan):
            </label>
            <input
              type="text"
              value={operationalNotes}
              onChange={(e) => setOperationalNotes(e.target.value)}
              placeholder="Tulis catatan operasional penting..."
              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#806044] text-xs"
            />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW TABS (NON-PRINT)                                          */}
      {/* ============================================================== */}
      <div className="no-print flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('print_preview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'print_preview'
                ? 'bg-[#806044] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            Format Dokumen Cetak A4 (Sesuai SOP)
          </button>
          <button
            onClick={() => setActiveTab('screen')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'screen'
                ? 'bg-[#30291F] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Tabel Interaktif Layar
          </button>
        </div>

        <span className="text-xs text-stone-500 hidden sm:inline">
          {filteredReservations.length} reservasi &bull; {filteredExpenses.length} beban terfilter
        </span>
      </div>

      {/* ============================================================== */}
      {/* TAB CONTENT: SCREEN VIEW (INTERACTIVE TABLE)                   */}
      {/* ============================================================== */}
      {activeTab === 'screen' && (
        <div className="no-print space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
                Kas Masuk Terverifikasi
              </span>
              <div className="text-xl font-bold text-emerald-700">
                {formatRupiah(totalVerifiedRevenue)}
              </div>
              <span className="text-[10px] text-stone-400">Pembayaran riil tamu</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
                Pengeluaran Operasional
              </span>
              <div className="text-xl font-bold text-rose-700">
                {formatRupiah(totalExpenses)}
              </div>
              <span className="text-[10px] text-stone-400">
                {filteredExpenses.length === 0 ? 'Operasional belum aktif' : 'Total beban tercatat'}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
                Estimasi Arus Kas Bersih
              </span>
              <div className={`text-xl font-bold ${netOperationalCashflow >= 0 ? 'text-stone-900' : 'text-rose-700'}`}>
                {formatRupiah(netOperationalCashflow)}
              </div>
              <span className="text-[10px] text-stone-400">Kas masuk minus beban</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
                Total Piutang Berjalan
              </span>
              <div className="text-xl font-bold text-amber-700">
                {formatRupiah(totalReceivables)}
              </div>
              <span className="text-[10px] text-stone-400">Sisa tagihan tamu</span>
            </div>
          </div>

          {/* Interactive Reservation Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">
                  Daftar Transaksi Pemesanan Terfilter
                </h3>
                <p className="text-xs text-stone-500">
                  Data pemesanan menginap aktual pada rentang periode yang ditentukan.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">No. Reservasi</th>
                    <th className="py-2.5 px-3 font-semibold">Tamu</th>
                    <th className="py-2.5 px-3 font-semibold">Kamar</th>
                    <th className="py-2.5 px-3 font-semibold">Sumber</th>
                    <th className="py-2.5 px-3 font-semibold">Check-in</th>
                    <th className="py-2.5 px-3 font-semibold">Check-out</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Total Biaya</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Terbayar</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Sisa</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-stone-400 italic">
                        Tidak ada transaksi reservasi pada rentang tanggal ini.
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((r) => (
                      <tr key={r.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-3 font-mono font-medium text-stone-900">{r.reservation_number}</td>
                        <td className="py-3 px-3 font-medium">{r.guest?.full_name}</td>
                        <td className="py-3 px-3">{r.rooms?.[0]?.name}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            r.booking_source === 'walk_in'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {r.booking_source || 'online'}
                          </span>
                        </td>
                        <td className="py-3 px-3">{r.checkin_date}</td>
                        <td className="py-3 px-3">{r.checkout_date}</td>
                        <td className="py-3 px-3 text-right font-medium">{formatRupiah(r.price_snapshot?.total_amount)}</td>
                        <td className="py-3 px-3 text-right text-emerald-700 font-medium">{formatRupiah(r.price_snapshot?.total_paid || 0)}</td>
                        <td className="py-3 px-3 text-right text-stone-700">{formatRupiah(r.price_snapshot?.balance_due)}</td>
                        <td className="py-3 px-3 text-center uppercase text-[10px] font-semibold">{r.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB CONTENT: PRINT PREVIEW & THE PRINTABLE DOCUMENT            */}
      {/* Always rendered in the DOM so window.print() prints it!       */}
      {/* When activeTab is 'screen', we keep it visible during print   */}
      {/* via CSS classes.                                              */}
      {/* ============================================================== */}
      <div className={`${activeTab === 'screen' ? 'hidden print:block' : 'block'}`}>
        <ReportPrintTemplate
          reservations={filteredReservations}
          expenses={filteredExpenses}
          rooms={rooms}
          staffUsers={staffUsers}
          startDate={startDate}
          endDate={endDate}
          printedBy={printedBy}
          operationalNotes={operationalNotes}
        />
      </div>
    </div>
  );
}
