'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Calendar, 
  PlusCircle, 
  AlertCircle,
  FileText,
  UserCheck,
  Printer
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { Reservation, ReservationStatus } from '@/lib/types';
import { 
  formatRupiah, 
  formatDateIndo, 
  getReservationStatusMeta, 
  getPaymentStatusMeta 
} from '@/lib/formatters';

function ReservasiPanelList() {
  const searchParams = useSearchParams();
  const filterFromParam = searchParams.get('status') || 'all';

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(filterFromParam);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'walk_in' | 'online'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await PmsService.getReservations();
      setReservations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await PmsService.approveReservation(id, 'Petugas Bertugas');
      if (res.success) {
        setActionMessage('Permintaan reservasi berhasil disetujui!');
        loadReservations();
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menyetujui reservasi');
    }
  };

  const filteredReservations = reservations.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchSource = sourceFilter === 'all' || (r.booking_source || 'online') === sourceFilter;
    const q = searchQuery.toLowerCase();
    const matchQuery = 
      !q ||
      r.reservation_number.toLowerCase().includes(q) ||
      (r.guest?.full_name || '').toLowerCase().includes(q) ||
      (r.guest?.phone || '').includes(q) ||
      (r.staff_name_snapshot || '').toLowerCase().includes(q);
    return matchStatus && matchSource && matchQuery;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-[#E5DCD0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Data Reservasi & Atribusi Petugas
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Seluruh data reservasi tamu online maupun walk-in langsung. Atribusi petugas mengunci nama staf bertugas secara permanen.
          </p>
        </div>

        <Link
          href="/panel/reservasi/baru"
          className="inline-flex items-center gap-2 bg-[#355C46] hover:bg-[#284635] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-emerald-300" />
          <span>+ Reservasi Walk-in Baru</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="font-bold">&times;</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#E5DCD0] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari no. booking, nama tamu, no. telepon, atau nama staf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-2 rounded-xl border border-stone-200 text-stone-700 bg-stone-50 flex-1 md:flex-none"
            >
              <option value="all">Semua Status</option>
              <option value="pending_approval">Menunggu Persetujuan</option>
              <option value="approved_pending_payment">Disetujui (Belum Bayar)</option>
              <option value="confirmed">Terkonfirmasi</option>
              <option value="checked_in">Check-in</option>
              <option value="checked_out">Check-out</option>
              <option value="cancelled">Dibatalkan</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="text-xs p-2 rounded-xl border border-stone-200 text-stone-700 bg-stone-50 flex-1 md:flex-none"
            >
              <option value="all">Semua Sumber</option>
              <option value="walk_in">Hanya Walk-in</option>
              <option value="online">Hanya Online</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-2xl border border-[#E5DCD0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#FAF7F2] text-stone-600 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4 font-semibold">No. Booking</th>
                <th className="py-3 px-4 font-semibold">Tamu</th>
                <th className="py-3 px-4 font-semibold">Kamar</th>
                <th className="py-3 px-4 font-semibold">Periode Sewa</th>
                <th className="py-3 px-4 font-semibold">Sumber</th>
                <th className="py-3 px-4 font-semibold">Petugas Penerima</th>
                <th className="py-3 px-4 font-semibold">Status Reservasi</th>
                <th className="py-3 px-4 font-semibold">Pembayaran</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-500">
                    Memuat data reservasi...
                  </td>
                </tr>
              ) : filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-500">
                    Tidak ditemukan data reservasi yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => {
                  const statusMeta = getReservationStatusMeta(res.status);
                  const payMeta = getPaymentStatusMeta(res.payment_status);
                  const source = res.booking_source || 'online';
                  const staffName = res.staff_name_snapshot || (res.created_by_role === 'admin' ? 'Administrator' : 'Sistem Online');

                  return (
                    <tr key={res.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        {res.reservation_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">{res.guest?.full_name || 'Tamu'}</div>
                        <div className="text-[11px] text-stone-400 font-mono">{res.guest?.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-stone-800">
                          {res.rooms?.[0] ? `Kamar ${res.rooms[0].room_number}` : 'Kamar Belum Dipilih'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        <div>{res.checkin_date} s/d {res.checkout_date}</div>
                        <span className="text-[10px] text-stone-400 capitalize">Sewa {res.rental_type || 'Harian'}</span>
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
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-[#355C46]" />
                          <span>{staffName}</span>
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {res.created_by_role ? `Role: ${res.created_by_role.toUpperCase()}` : 'Publik'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusMeta.badgeClass}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${payMeta.badgeClass}`}>
                          {payMeta.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {res.status === 'pending_approval' && (
                            <button
                              onClick={() => handleApprove(res.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition"
                            >
                              Setujui
                            </button>
                          )}
                          <Link
                            href={`/slip/${res.id}`}
                            target="_blank"
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded transition"
                            title="Cetak Slip / Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function PanelReservasiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Memuat data reservasi...</div>}>
      <ReservasiPanelList />
    </Suspense>
  );
}
