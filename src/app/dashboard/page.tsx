import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  BedDouble, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  Wrench, 
  ArrowRight,
  LogIn,
  LogOut,
  Calendar
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

export const revalidate = 0;

export default async function DashboardMainPage() {
  const rooms = await PmsService.getRooms(true);
  const reservations = await PmsService.getReservations();
  const expenses = await PmsService.getExpenses();
  const housekeeping = await PmsService.getHousekeepingTasks();
  const maintenance = await PmsService.getMaintenanceTickets();

  const todayStr = new Date().toISOString().split('T')[0];

  // Actual Calculations
  const pendingApprovals = reservations.filter((r) => r.status === 'pending_approval');
  const todayArrivals = reservations.filter((r) => r.checkin_date === todayStr && r.status !== 'cancelled' && r.status !== 'rejected');
  const todayDepartures = reservations.filter((r) => r.checkout_date === todayStr && r.status !== 'cancelled' && r.status !== 'rejected');
  const inHouseGuests = reservations.filter((r) => r.status === 'checked_in');

  // Room Status Counts
  const availableRooms = rooms.filter((r) => !r.is_archived && r.operational_status === 'tersedia');
  const occupiedRooms = rooms.filter((r) => !r.is_archived && r.operational_status === 'ditempati');
  const dirtyRooms = rooms.filter((r) => !r.is_archived && (r.operational_status === 'menunggu_dibersihkan' || r.operational_status === 'sedang_dibersihkan'));
  const maintenanceRooms = rooms.filter((r) => !r.is_archived && r.operational_status === 'dalam_perawatan');

  // Actual Financial Calculations (Payments actually verified received)
  let totalRevenueReceived = 0;
  let totalOutstandingReceivable = 0;

  reservations.forEach((res) => {
    if (res.price_snapshot) {
      totalRevenueReceived += Number(res.price_snapshot.total_paid || 0);
      if (res.status !== 'cancelled' && res.status !== 'rejected') {
        totalOutstandingReceivable += Number(res.price_snapshot.balance_due || 0);
      }
    }
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const estimatedNetCashFlow = totalRevenueReceived - totalExpenses;

  // Pending Tasks
  const pendingCleaning = housekeeping.filter((h) => h.status === 'menunggu' || h.status === 'sedang_dikerjakan');
  const openMaintenance = maintenance.filter((m) => m.status !== 'selesai' && m.status !== 'dibatalkan');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Pending Approvals Urgent Alert Banner */}
      {pendingApprovals.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">
                Ada {pendingApprovals.length} Permintaan Reservasi Menunggu Persetujuan
              </h3>
              <p className="text-xs text-stone-600">
                Calon tamu telah mengajukan pemesanan melalui website. Silakan periksa kamar dan tanggal sebelum menyetujui.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/reservasi?status=pending_approval"
            className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
          >
            Tinjau Permintaan &rarr;
          </Link>
        </div>
      )}

      {/* Primary KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Arrivals Today */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Kedatangan Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900">{todayArrivals.length}</div>
            <p className="text-[11px] text-stone-500 mt-0.5">Tamu dijadwalkan check-in hari ini</p>
          </div>
          <Link
            href="/dashboard/check-in-out"
            className="text-[11px] text-blue-700 hover:text-blue-800 font-medium inline-flex items-center gap-1 pt-1"
          >
            Meja Resepsionis &rarr;
          </Link>
        </div>

        {/* Departures Today */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Keberangkatan Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900">{todayDepartures.length}</div>
            <p className="text-[11px] text-stone-500 mt-0.5">Jadwal check-out maksimal 12:00</p>
          </div>
          <Link
            href="/dashboard/check-in-out"
            className="text-[11px] text-orange-700 hover:text-orange-800 font-medium inline-flex items-center gap-1 pt-1"
          >
            Penyelesaian Pelunasan &rarr;
          </Link>
        </div>

        {/* In-House Guests */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Tamu Sedang Menginap</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900">{inHouseGuests.length}</div>
            <p className="text-[11px] text-stone-500 mt-0.5">Kamar terisi saat ini</p>
          </div>
          <Link
            href="/dashboard/reservasi?status=checked_in"
            className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1 pt-1"
          >
            Daftar Tamu In-House &rarr;
          </Link>
        </div>

        {/* Available Rooms */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Kamar Siap Jual</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900">{availableRooms.length} <span className="text-sm font-normal text-stone-400">/ {rooms.length}</span></div>
            <p className="text-[11px] text-stone-500 mt-0.5">{dirtyRooms.length} kotor, {maintenanceRooms.length} perawatan</p>
          </div>
          <Link
            href="/dashboard/kamar"
            className="text-[11px] text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-1 pt-1"
          >
            Status Fisik Kamar &rarr;
          </Link>
        </div>
      </div>

      {/* Financial Health Snapshot (Actual Cash vs Expense) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
          <div>
            <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Kesehatan Finansial & Kas Aktual
            </h2>
            <p className="text-xs text-stone-500">
              Dihitung murni berdasarkan pembayaran uang yang benar-benar telah diterima dan diverifikasi (Bukan nilai perkiraan tagihan).
            </p>
          </div>

          <Link
            href="/dashboard/keuangan"
            className="text-xs text-brand-700 hover:text-brand-800 font-medium inline-flex items-center gap-1"
          >
            Buka Pembukuan Lengkap &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
            <span className="text-[11px] text-stone-500 block">Total Kas Masuk Diterima</span>
            <div className="text-xl font-bold text-emerald-700">{formatRupiah(totalRevenueReceived)}</div>
            <span className="text-[10px] text-stone-400">Pembayaran terverifikasi</span>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
            <span className="text-[11px] text-stone-500 block">Total Pengeluaran Operasional</span>
            <div className="text-xl font-bold text-rose-700">{formatRupiah(totalExpenses)}</div>
            <span className="text-[10px] text-stone-400">Listrik, laundry, kebersihan, dll</span>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
            <span className="text-[11px] text-stone-500 block">Sisa Piutang Tamu Belum Lunas</span>
            <div className="text-xl font-bold text-amber-700">{formatRupiah(totalOutstandingReceivable)}</div>
            <span className="text-[10px] text-stone-400">Tagihan berjalan</span>
          </div>
        </div>
      </div>

      {/* Operational Columns: Recent Reservations & Housekeeping/Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reservations Table */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-semibold text-stone-900 text-sm">Reservasi Terbaru</h3>
            <Link
              href="/dashboard/reservasi"
              className="text-xs text-brand-700 hover:text-brand-800 font-medium"
            >
              Lihat Semua ({reservations.length})
            </Link>
          </div>

          <div className="divide-y divide-stone-100 overflow-x-auto text-xs">
            {reservations.slice(0, 5).map((res) => (
              <div key={res.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-stone-900 font-mono">{res.reservation_number}</strong>
                    <span className="text-[10px] text-stone-500">• {res.guest?.full_name}</span>
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    {res.rooms?.[0]?.name} • {formatDateIndo(res.checkin_date)} s/d {formatDateIndo(res.checkout_date)}
                  </div>
                </div>

                <div className="text-right space-y-1 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    res.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                    res.status === 'pending_approval' ? 'bg-amber-100 text-amber-800' :
                    res.status === 'checked_in' ? 'bg-teal-100 text-teal-800' : 'bg-stone-100 text-stone-700'
                  }`}>
                    {res.status}
                  </span>
                  <div className="text-[11px] font-semibold text-stone-900">
                    {formatRupiah(res.price_snapshot?.total_amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Tasks (Housekeeping & Maintenance) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-semibold text-stone-900 text-sm">Tugas Kebersihan & Perawatan</h3>
            <Link
              href="/dashboard/housekeeping"
              className="text-xs text-brand-700 hover:text-brand-800 font-medium"
            >
              Kelola Tugas &rarr;
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {pendingCleaning.map((task) => (
              <div key={task.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <div>
                    <strong className="text-stone-900 block">{task.room?.name || 'Kamar'}</strong>
                    <span className="text-stone-500 text-[11px]">{task.task_type} • {task.notes || 'Pembersihan standar'}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium uppercase">
                  {task.status}
                </span>
              </div>
            ))}

            {openMaintenance.map((m) => (
              <div key={m.id} className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-rose-600" />
                  <div>
                    <strong className="text-stone-900 block">{m.room?.name || 'Fasilitas'} - {m.issue_type}</strong>
                    <span className="text-stone-500 text-[11px]">{m.description}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-medium uppercase">
                  {m.priority}
                </span>
              </div>
            ))}

            {pendingCleaning.length === 0 && openMaintenance.length === 0 && (
              <div className="text-center py-6 text-stone-400 text-xs">
                Tidak ada tugas mendesak saat ini. Seluruh kamar dalam kondisi optimal.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
