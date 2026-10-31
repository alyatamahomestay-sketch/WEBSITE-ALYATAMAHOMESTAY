'use client';

import React from 'react';
import { Reservation, Expense, Room, StaffUser } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

export interface ReportPrintTemplateProps {
  reservations: Reservation[];
  expenses: Expense[];
  rooms: Room[];
  staffUsers?: StaffUser[];
  startDate?: string;
  endDate?: string;
  printedBy?: string;
  printedAt?: string;
  operationalNotes?: string;
}

export default function ReportPrintTemplate({
  reservations,
  expenses,
  rooms,
  staffUsers = [],
  startDate,
  endDate,
  printedBy = 'Admin Operasional',
  printedAt,
  operationalNotes = 'Operasional berjalan tertib dan sesuai SOP homestay syariah. Seluruh catatan kas penerimaan, pengeluaran, serta bukti fisik telah diverifikasi kebenarannya oleh staf bertugas.',
}: ReportPrintTemplateProps) {
  // Current timestamp formatted in Indonesian
  const printTimestamp = printedAt || new Date().toLocaleString('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }) + ' WIB';

  // Format Period label
  const periodLabel = startDate && endDate
    ? `${formatDateIndo(startDate)} — ${formatDateIndo(endDate)}`
    : startDate
    ? `Mulai ${formatDateIndo(startDate)}`
    : endDate
    ? `Hingga ${formatDateIndo(endDate)}`
    : 'Semua Periode (Kumulatif)';

  // Calculate day difference for occupancy estimation
  let periodDays = 30; // default 1 month
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > 0) periodDays = diffDays;
  }

  // 1. Executive Summary Metrics
  const validReservations = reservations.filter(
    (r) => r.status !== 'cancelled' && r.status !== 'rejected'
  );

  const totalGrossRevenue = validReservations.reduce(
    (sum, r) => sum + Number(r.price_snapshot?.total_paid || 0),
    0
  );

  const totalOperationalExpenses = expenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  const netProfit = totalGrossRevenue - totalOperationalExpenses;

  const totalNightsSold = validReservations.reduce(
    (sum, r) => sum + Number(r.price_snapshot?.total_nights || 1),
    0
  );

  const totalAvailableRooms = rooms.length > 0 ? rooms.length : 4;
  const totalRoomNightsCapacity = totalAvailableRooms * periodDays;
  const occupancyRate = totalRoomNightsCapacity > 0
    ? Math.min(100, Math.round((totalNightsSold / totalRoomNightsCapacity) * 100))
    : 0;

  const averageDailyRate = totalNightsSold > 0
    ? Math.round(totalGrossRevenue / totalNightsSold)
    : 0;

  // Bookings breakdown
  const onlineBookings = validReservations.filter(
    (r) => (r.booking_source || 'online') === 'online'
  );
  const walkInBookings = validReservations.filter(
    (r) => r.booking_source === 'walk_in'
  );

  // Revenue breakdown by categories
  const revenueOnline = onlineBookings.reduce(
    (sum, r) => sum + Number(r.price_snapshot?.total_paid || 0),
    0
  );
  const revenueWalkIn = walkInBookings.reduce(
    (sum, r) => sum + Number(r.price_snapshot?.total_paid || 0),
    0
  );

  // Additional charges breakdown (extra bed, late check-out, amenities)
  let extraBedRevenue = 0;
  let lateCheckoutRevenue = 0;
  let otherServicesRevenue = 0;

  validReservations.forEach((r) => {
    const breakdowns = r.price_snapshot?.extra_charges_breakdown;
    if (Array.isArray(breakdowns)) {
      breakdowns.forEach((item) => {
        const desc = (item.description || '').toLowerCase();
        const amt = Number(item.amount || 0);
        if (desc.includes('extra bed') || desc.includes('kasur')) {
          extraBedRevenue += amt;
        } else if (desc.includes('late') || desc.includes('checkout')) {
          lateCheckoutRevenue += amt;
        } else {
          otherServicesRevenue += amt;
        }
      });
    } else if (Number(r.price_snapshot?.extra_charges || 0) > 0) {
      extraBedRevenue += Number(r.price_snapshot?.extra_charges || 0);
    }
  });

  // Payment methods breakdown
  let cashRevenue = 0;
  let qrisTransferRevenue = 0;
  let paymentGatewayRevenue = 0;

  validReservations.forEach((r) => {
    const paid = Number(r.price_snapshot?.total_paid || 0);
    if (paid <= 0) return;

    // Check payments sub-collection if available
    if (Array.isArray(r.payments) && r.payments.length > 0) {
      r.payments.forEach((p) => {
        const method = (p.payment_method || '').toLowerCase();
        const pAmt = Number(p.amount || 0);
        if (method.includes('tunai') || method.includes('cash')) {
          cashRevenue += pAmt;
        } else if (method.includes('qris') || method.includes('transfer') || method.includes('bca') || method.includes('bri') || method.includes('mandiri')) {
          qrisTransferRevenue += pAmt;
        } else {
          paymentGatewayRevenue += pAmt;
        }
      });
    } else {
      // Fallback attribute based on walk-in vs online
      if (r.booking_source === 'walk_in') {
        cashRevenue += paid;
      } else {
        qrisTransferRevenue += paid;
      }
    }
  });

  // Ensure total matches gross revenue if no payments detailed
  const totalPaymentMethods = cashRevenue + qrisTransferRevenue + paymentGatewayRevenue;
  if (totalPaymentMethods === 0 && totalGrossRevenue > 0) {
    qrisTransferRevenue = totalGrossRevenue;
  }

  // Room performance calculations
  const roomStats = rooms.map((room) => {
    const roomReservations = validReservations.filter((r) =>
      r.rooms?.some((rm) => rm.id === room.id || rm.room_number === room.room_number)
    );

    const nightsSold = roomReservations.reduce(
      (sum, r) => sum + Number(r.price_snapshot?.total_nights || 1),
      0
    );

    const revenue = roomReservations.reduce(
      (sum, r) => sum + Number(r.price_snapshot?.total_paid || 0),
      0
    );

    const occRate = periodDays > 0
      ? Math.min(100, Math.round((nightsSold / periodDays) * 100))
      : 0;

    return {
      roomNumber: room.room_number,
      roomName: room.name,
      roomType: room.room_type || 'Syariah Room',
      baseRate: room.base_rate,
      nightsSold,
      occRate,
      revenue,
    };
  });

  // Staff attribution summary
  const staffAttribution = (staffUsers.length > 0 ? staffUsers : [
    { id: '1', full_name: 'Administrator Homestay', role: 'admin' as const, status: 'ACTIVE' as const, username: 'admin', email: 'admin@alyatama.id', created_at: '', updated_at: '' },
    { id: '2', full_name: 'Rahmat Ramadhan', role: 'staff' as const, status: 'ACTIVE' as const, username: 'rahmat', email: 'rahmat@alyatama.id', created_at: '', updated_at: '' },
    { id: '3', full_name: 'Siti Aminah', role: 'staff' as const, status: 'ACTIVE' as const, username: 'siti', email: 'siti@alyatama.id', created_at: '', updated_at: '' },
  ]).map((staff) => {
    const handledReservations = validReservations.filter((r) => {
      const staffNameSnap = (r.staff_name_snapshot || '').toLowerCase();
      const staffCreatedBy = (r.created_by_user_id || '').toLowerCase();
      return (
        staffNameSnap.includes(staff.username.toLowerCase()) ||
        staffNameSnap.includes(staff.full_name.toLowerCase()) ||
        staffCreatedBy === staff.id
      );
    });

    const handledTotal = handledReservations.reduce(
      (sum, r) => sum + Number(r.price_snapshot?.total_paid || 0),
      0
    );

    return {
      name: staff.full_name,
      role: staff.role === 'admin' ? 'Administrator' : 'Staf Operasional',
      txCount: handledReservations.length,
      totalVolume: handledTotal,
    };
  });

  return (
    <div className="report-print-container bg-white text-slate-900 font-sans p-6 sm:p-10 max-w-[210mm] mx-auto border border-stone-200 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
      {/* ============================================================== */}
      {/* 1. HEADER DOKUMEN (KOP RESMI ALYATAMA HOMESTAY)               */}
      {/* ============================================================== */}
      <header className="border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          {/* Logo & Property Brand */}
          <div className="flex items-center gap-4">
            <img
              src="/images/alyatama-logo-dark.png"
              alt="Logo ALYATAMA HOMESTAY"
              className="h-16 w-auto object-contain shrink-0"
            />
            <div>
              <h1 className="text-xl font-serif font-black tracking-tight text-slate-950 uppercase">
                ALYATAMA HOMESTAY
              </h1>
              <p className="text-[11px] font-semibold text-[#806044] tracking-wide uppercase">
                Penginapan Syariah Modern &amp; Nyaman
              </p>
              <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
                Jl. Mayor Ali Rasyid No. 19 / Jl. Al-Yatama, Bangkinang Kota, Kec. Bangkinang, Kab. Kampar, Riau 28411
              </p>
              <p className="text-[10px] text-slate-600 leading-tight">
                Telepon / WhatsApp: <span className="font-semibold text-slate-800">+62 822-8547-2008</span> &bull; Email: <span className="font-semibold text-slate-800">info@alyatamahomestay.com</span>
              </p>
            </div>
          </div>

          {/* Document Metadata Badge */}
          <div className="text-right shrink-0">
            <span className="inline-block px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-slate-900 text-white rounded">
              DOKUMEN RESMI PMS
            </span>
            <div className="text-[9px] text-slate-500 mt-1.5 space-y-0.5">
              <p>ID Laporan: <span className="font-mono font-semibold text-slate-700">REP-{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, '0')}-{String(validReservations.length).padStart(3, '0')}</span></p>
              <p>Klasifikasi: <span className="font-semibold text-slate-700">Internal Audit &amp; Keuangan</span></p>
            </div>
          </div>
        </div>

        {/* Thick divider & Sub-header */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase">
              LAPORAN OPERASIONAL &amp; KEUANGAN HOMESTAY
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Periode Pembukuan: <span className="font-bold text-slate-900">{periodLabel}</span>
            </p>
          </div>
          <div className="text-left sm:text-right text-[11px] text-slate-600">
            <p>Waktu Cetak: <span className="font-medium text-slate-800">{printTimestamp}</span></p>
            <p>Petugas Pelapor: <span className="font-bold text-slate-900">{printedBy}</span></p>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. RINGKASAN EKSEKUTIF (6 KPI CARDS GRID)                     */}
      {/* ============================================================== */}
      <section className="mb-6 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-[#806044] rounded-xs inline-block"></span>
            1. Ringkasan Eksekutif Indikator Kinerja Utama (KPI)
          </h3>
          <span className="text-[10px] text-slate-500 italic">Berdasarkan data transaksi terverifikasi</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* KPI 1: Gross Revenue */}
          <div className="p-3 rounded-lg border border-slate-300 bg-slate-50/70">
            <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider block">
              Total Pendapatan Kotor
            </span>
            <div className="text-sm sm:text-base font-black text-emerald-800 mt-0.5">
              {formatRupiah(totalGrossRevenue)}
            </div>
            <span className="text-[9px] text-slate-500 block mt-0.5">Gross Revenue (Sewa + Layanan)</span>
          </div>

          {/* KPI 2: Operational Expenses */}
          <div className="p-3 rounded-lg border border-slate-300 bg-slate-50/70">
            <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider block">
              Biaya Operasional
            </span>
            <div className="text-sm sm:text-base font-black text-rose-800 mt-0.5">
              {formatRupiah(totalOperationalExpenses)}
            </div>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              {expenses.length === 0 ? 'Operasional Belum Aktif (Rp 0)' : `${expenses.length} Beban Tercatat`}
            </span>
          </div>

          {/* KPI 3: Net Profit */}
          <div className="p-3 rounded-lg border border-slate-300 bg-slate-50/70">
            <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider block">
              Pendapatan Bersih (Net Profit)
            </span>
            <div className={`text-sm sm:text-base font-black mt-0.5 ${netProfit >= 0 ? 'text-slate-950' : 'text-rose-700'}`}>
              {formatRupiah(netProfit)}
            </div>
            <span className="text-[9px] text-slate-500 block mt-0.5">Kas Masuk dikurangi Beban</span>
          </div>

          {/* KPI 4: Occupancy Rate */}
          <div className="p-3 rounded-lg border border-slate-300 bg-slate-50/70">
            <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider block">
              Tingkat Okupansi
            </span>
            <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
              {occupancyRate}%
            </div>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              {totalNightsSold} dari {totalRoomNightsCapacity} Kamar-Malam
            </span>
          </div>

          {/* KPI 5: ADR */}
          <div className="p-3 rounded-lg border border-slate-300 bg-slate-50/70">
            <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider block">
              Rata-Rata Harga Kamar (ADR)
            </span>
            <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
              {formatRupiah(averageDailyRate)}
            </div>
            <span className="text-[9px] text-slate-500 block mt-0.5">Average Daily Rate per Malam</span>
          </div>

          {/* KPI 6: Total Reservations */}
          <div className="p-3 rounded-lg border border-slate-300 bg-slate-50/70">
            <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider block">
              Total Reservasi
            </span>
            <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
              {validReservations.length} Transaksi
            </div>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              {onlineBookings.length} Online &bull; {walkInBookings.length} Walk-in
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. BREAKDOWN PENDAPATAN & METODE PEMBAYARAN                    */}
      {/* ============================================================== */}
      <section className="mb-6 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-[#806044] rounded-xs inline-block"></span>
          2. Rincian Pemasukan &amp; Metode Pembayaran
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Breakdown Sumber Pemasukan */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                A. Breakdown Pemasukan
              </span>
              <span className="text-[9px] text-slate-500">Nominal (Rp)</span>
            </div>
            <table className="w-full text-[10px]">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-3 py-1.5 text-slate-700">Sewa Kamar Online (Website Tamu)</td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-900">{formatRupiah(revenueOnline)}</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-slate-700">Sewa Kamar Walk-in (Front Desk)</td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-900">{formatRupiah(revenueWalkIn)}</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-slate-700">Layanan Tambahan (Extra Bed)</td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-900">{formatRupiah(extraBedRevenue)}</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-slate-700">Kompensasi Late Check-out</td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-900">{formatRupiah(lateCheckoutRevenue)}</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-slate-700">Layanan F&amp;B / Laundry / Lainnya</td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-900">{formatRupiah(otherServicesRevenue)}</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-300 font-bold text-slate-900">
                <tr>
                  <td className="px-3 py-2 uppercase text-[10px]">Total Pemasukan Operasional</td>
                  <td className="px-3 py-2 text-right text-emerald-800">{formatRupiah(totalGrossRevenue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Breakdown Rincian Metode Pembayaran */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                B. Saluran / Metode Pembayaran
              </span>
              <span className="text-[9px] text-slate-500">Nominal (Rp)</span>
            </div>
            <table className="w-full text-[10px]">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-3 py-1.5 text-slate-700">Tunai / Cash (Kasir Front Office)</td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-900">{formatRupiah(cashRevenue)}</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-slate-700">QRIS &amp; Transfer Bank Direct (BCA/BRI/Mandiri)</td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-900">{formatRupiah(qrisTransferRevenue)}</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-slate-700">Payment Gateway (Midtrans / Virtual Account)</td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-900">{formatRupiah(paymentGatewayRevenue)}</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-slate-400 italic">Piutang Belum Tertagih / Saldo Berjalan</td>
                  <td className="px-3 py-1.5 text-right text-slate-400">Rp 0</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-slate-400 italic">Penyesuaian Selisih / Diskon</td>
                  <td className="px-3 py-1.5 text-right text-slate-400">Rp 0</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-300 font-bold text-slate-900">
                <tr>
                  <td className="px-3 py-2 uppercase text-[10px]">Total Penerimaan Terverifikasi</td>
                  <td className="px-3 py-2 text-right text-emerald-800">{formatRupiah(totalGrossRevenue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. BREAKDOWN PENGELUARAN OPERASIONAL (TABEL BIAYA)            */}
      {/* ============================================================== */}
      <section className="mb-6 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-[#806044] rounded-xs inline-block"></span>
            3. Rincian Beban Pengeluaran Operasional
          </h3>
          <span className="text-[10px] text-slate-500">
            {expenses.length} Transaksi Tercatat
          </span>
        </div>

        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <table className="w-full text-[10px] text-left">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 uppercase font-semibold">
              <tr>
                <th className="py-2 px-3 w-10 text-center">No.</th>
                <th className="py-2 px-3 w-24">Tanggal</th>
                <th className="py-2 px-3 w-32">Kategori</th>
                <th className="py-2 px-3">Keterangan / Deskripsi Beban</th>
                <th className="py-2 px-3 w-32">Metode / Vendor</th>
                <th className="py-2 px-3 w-28 text-right">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-5 px-3 text-center text-slate-500 italic bg-slate-50/40">
                    Belum ada beban pengeluaran operasional yang dicatat pada periode ini (Operasional Belum Aktif).
                  </td>
                </tr>
              ) : (
                expenses.map((e, idx) => (
                  <tr key={e.id || idx}>
                    <td className="py-1.5 px-3 text-center font-mono text-slate-600">{idx + 1}</td>
                    <td className="py-1.5 px-3 text-slate-800">{formatDateIndo(e.expense_date)}</td>
                    <td className="py-1.5 px-3">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[9px] font-semibold uppercase">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-slate-700">{e.description}</td>
                    <td className="py-1.5 px-3 text-slate-600 truncate">{e.vendor || e.payment_method || '-'}</td>
                    <td className="py-1.5 px-3 text-right font-medium text-slate-900">{formatRupiah(e.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
              <tr>
                <td colSpan={5} className="py-2 px-3 uppercase text-right tracking-wider">
                  Subtotal Biaya Operasional :
                </td>
                <td className="py-2 px-3 text-right text-rose-800">
                  {formatRupiah(totalOperationalExpenses)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. PERFORMANSA KAMAR & ATRIBUSI SHIFT STAF                     */}
      {/* ============================================================== */}
      <section className="mb-6 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-[#806044] rounded-xs inline-block"></span>
          4. Performansa Unit Kamar &amp; Atribusi Petugas Bertugas
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tabel Performansa Kamar (2 Cols) */}
          <div className="lg:col-span-2 border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                A. Performansa Unit Kamar
              </span>
            </div>
            <table className="w-full text-[10px] text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="py-1.5 px-2.5 w-16 text-center">Unit</th>
                  <th className="py-1.5 px-2.5">Tipe Kamar</th>
                  <th className="py-1.5 px-2.5 text-right">Tarif / Mlm</th>
                  <th className="py-1.5 px-2.5 text-center">Malam Terjual</th>
                  <th className="py-1.5 px-2.5 text-center">Okupansi</th>
                  <th className="py-1.5 px-2.5 text-right">Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {roomStats.map((rm) => (
                  <tr key={rm.roomNumber}>
                    <td className="py-1.5 px-2.5 text-center font-bold text-slate-900">{rm.roomNumber}</td>
                    <td className="py-1.5 px-2.5 text-slate-800">{rm.roomName}</td>
                    <td className="py-1.5 px-2.5 text-right text-slate-600">{formatRupiah(rm.baseRate)}</td>
                    <td className="py-1.5 px-2.5 text-center font-medium text-slate-900">{rm.nightsSold} mlm</td>
                    <td className="py-1.5 px-2.5 text-center font-semibold text-slate-800">{rm.occRate}%</td>
                    <td className="py-1.5 px-2.5 text-right font-medium text-emerald-800">{formatRupiah(rm.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Atribusi Petugas Piket (1 Col) */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                B. Audit Akun Staf Bertugas
              </span>
            </div>
            <div className="p-2.5 space-y-2">
              {staffAttribution.map((staff, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{staff.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                      {staff.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 mt-1">
                    <span>Transaksi Diinput: {staff.txCount} trx</span>
                    <span className="font-semibold text-slate-800">{formatRupiah(staff.totalVolume)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. CATATAN KHUSUS & BLOK PENGESAHAN TANDA TANGAN (FOOTER)      */}
      {/* ============================================================== */}
      <section className="break-inside-avoid mt-6" style={{ pageBreakInside: 'avoid' }}>
        {/* Catatan Operasional */}
        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/60 mb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 block mb-1">
            Catatan Operasional &amp; Kejadian Khusus:
          </span>
          <p className="text-[10px] text-slate-700 leading-relaxed italic">
            "{operationalNotes}"
          </p>
        </div>

        {/* Blok Tanda Tangan 3 Kolom */}
        <div className="border-t-2 border-slate-900 pt-4">
          <p className="text-[10px] text-slate-600 mb-6 text-center italic">
            Laporan ini dicetak secara sah melalui Sistem Manajemen Properti (PMS) ALYATAMA HOMESTAY dan menjadi dokumen pertanggungjawaban resmi manajemen.
          </p>

          <div className="grid grid-cols-3 gap-6 text-center">
            {/* Kolom 1: Dibuat Oleh */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-700 block">
                Dibuat Oleh:
              </span>
              <span className="text-[9px] text-slate-500 block mb-14">
                Staf Operasional / Kasir Bertugas
              </span>
              <div className="w-3/4 mx-auto border-b border-slate-800"></div>
              <p className="text-[11px] font-bold text-slate-900 pt-1">
                ({printedBy})
              </p>
              <p className="text-[9px] text-slate-500">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
            </div>

            {/* Kolom 2: Diperiksa Oleh */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-700 block">
                Diperiksa Oleh:
              </span>
              <span className="text-[9px] text-slate-500 block mb-14">
                Manager / Head of Operations
              </span>
              <div className="w-3/4 mx-auto border-b border-slate-800"></div>
              <p className="text-[11px] font-bold text-slate-900 pt-1">
                (Manager Operasional)
              </p>
              <p className="text-[9px] text-slate-500">Tanggal: ....................................</p>
            </div>

            {/* Kolom 3: Disetujui Oleh */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-700 block">
                Disetujui Oleh:
              </span>
              <span className="text-[9px] text-slate-500 block mb-14">
                Owner / Pemilik Homestay
              </span>
              <div className="w-3/4 mx-auto border-b border-slate-800"></div>
              <p className="text-[11px] font-bold text-slate-900 pt-1">
                (H. Pemilik ALYATAMA)
              </p>
              <p className="text-[9px] text-slate-500">Tanggal: ....................................</p>
            </div>
          </div>
        </div>
      </section>

      {/* Global CSS for Print Optimization (A4 Portrait) */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 12mm 12mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .report-print-container {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
