'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Calendar, 
  Users, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  PlusCircle, 
  Sparkles,
  BedDouble,
  UserCheck,
  AlertCircle,
  Phone
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { Room, Reservation, StaffShift, StaffUser } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

export default function PanelOverviewPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [staffShifts, setStaffShifts] = useState<StaffShift[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Current user info
  const [userRole, setUserRole] = useState<'admin' | 'staff'>('admin');
  const [userName, setUserName] = useState('Petugas ALYATAMA');
  const [activeShift, setActiveShift] = useState<StaffShift | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [rData, resData, shiftData] = await Promise.all([
          PmsService.getRooms(),
          PmsService.getReservations(),
          PmsService.getStaffShifts(),
        ]);
        setRooms(rData);
        setReservations(resData);
        setStaffShifts(shiftData);

        if (typeof window !== 'undefined') {
          const sessStr = localStorage.getItem('alyatama_staff_session');
          if (sessStr) {
            try {
              const sess = JSON.parse(sessStr);
              setUserRole(sess.role || 'admin');
              setUserName(sess.full_name || sess.username);
            } catch (e) {}
          }

          const shiftStr = localStorage.getItem('alyatama_active_shift');
          if (shiftStr) {
            try {
              setActiveShift(JSON.parse(shiftStr));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // KPIs
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.operational_status === 'tersedia').length;
  const occupiedRooms = rooms.filter((r) => r.operational_status === 'ditempati').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  const pendingApprovals = reservations.filter((r) => r.status === 'pending_approval').length;
  const todayCheckins = reservations.filter((r) => r.status === 'confirmed').length;
  const activeStaffOnDuty = staffShifts.filter((s) => s.status === 'active');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Shift & Duty Banner */}
      <div className="bg-white rounded-2xl border border-[#E5DCD0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-[#355C46]/10 text-[#355C46] px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistem Operasional V3.1 — Bangkinang Kota</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Selamat Bertugas, {userName}
          </h2>
          <p className="text-xs text-stone-500">
            {userRole === 'admin' 
              ? 'Administrator memiliki kewenangan penuh atas inventaris kamar, tarif, akun staf, dan audit operasional.' 
              : 'Staf bertugas menangani tamu harian, pemesanan walk-in langsung, dan proses check-in / check-out.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/panel/reservasi/baru"
            className="inline-flex items-center gap-2 bg-[#355C46] hover:bg-[#284635] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>+ Reservasi Walk-in Baru</span>
          </Link>

          {userRole === 'admin' && (
            <Link
              href="/panel/staff"
              className="inline-flex items-center gap-2 bg-[#806044] hover:bg-[#684d36] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>Kelola Akun Staf</span>
            </Link>
          )}
        </div>
      </div>

      {/* Quick KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5DCD0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Okupansi Kamar</span>
            <BedDouble className="w-4 h-4 text-[#806044]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">{occupancyRate}%</span>
            <span className="text-xs text-stone-500">({occupiedRooms} / {totalRooms} unit terisi)</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            {availableRooms} kamar siap dihuni hari ini
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5DCD0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Menunggu Verifikasi</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">{pendingApprovals}</span>
            <span className="text-xs text-stone-500">permintaan online</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Perlu persetujuan admin/staf
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5DCD0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Check-in Terjadwal</span>
            <Users className="w-4 h-4 text-[#355C46]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">{todayCheckins}</span>
            <span className="text-xs text-stone-500">reservasi terkonfirmasi</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Siapkan kunci dan kebersihan kamar
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5DCD0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Staf Bertugas (Shift)</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">{activeStaffOnDuty.length}</span>
            <span className="text-xs text-stone-500">petugas aktif</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium truncate">
            {activeStaffOnDuty.length > 0 ? activeStaffOnDuty[0].staff_name_snapshot : 'Shift tersimpan'}
          </div>
        </div>
      </div>

      {/* Recent Reservations Table with Staff Attribution */}
      <div className="bg-white rounded-2xl border border-[#E5DCD0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-stone-900">
              Daftar Reservasi Terbaru & Atribusi Petugas
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Setiap transaksi mencatat identitas pembuat (Online / Staf yang bertugas saat shift).
            </p>
          </div>

          <Link
            href="/panel/reservasi"
            className="text-xs font-semibold text-[#806044] hover:text-[#355C46] flex items-center gap-1 transition"
          >
            <span>Lihat Semua Reservasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#FAF7F2] text-stone-600 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4 font-semibold">No. Booking</th>
                <th className="py-3 px-4 font-semibold">Tamu</th>
                <th className="py-3 px-4 font-semibold">Tanggal Menginap</th>
                <th className="py-3 px-4 font-semibold">Model Sewa</th>
                <th className="py-3 px-4 font-semibold">Sumber</th>
                <th className="py-3 px-4 font-semibold">Petugas Penerima</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reservations.slice(0, 6).map((res) => {
                const source = res.booking_source || 'online';
                const staffAttribution = res.staff_name_snapshot || (res.created_by_role === 'admin' ? 'Administrator' : 'Sistem Online');

                return (
                  <tr key={res.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-stone-900">
                      {res.reservation_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-900">
                      <div>{res.guest?.full_name || 'Tamu'}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{res.guest?.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      <div>{res.checkin_date} s/d {res.checkout_date}</div>
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-stone-600">
                      {res.rental_type || 'daily'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        source === 'walk_in'
                          ? 'bg-[#355C46]/15 text-[#355C46]'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {source === 'walk_in' ? 'Walk-in' : 'Online'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-700">
                      <div className="font-semibold text-stone-900 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-[#355C46]" />
                        <span>{staffAttribution}</span>
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {res.created_by_role ? `Role: ${res.created_by_role.toUpperCase()}` : 'Publik'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        res.status === 'confirmed' || res.status === 'checked_in'
                          ? 'bg-emerald-100 text-emerald-800'
                          : res.status === 'pending_approval'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {res.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900 text-right">
                      {res.price_snapshot?.total_amount ? formatRupiah(res.price_snapshot.total_amount) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
