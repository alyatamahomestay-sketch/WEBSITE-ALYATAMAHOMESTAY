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
  Plus, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { Reservation, ReservationStatus } from '@/lib/types';
import { 
  formatRupiah, 
  formatDateIndo, 
  getReservationStatusMeta, 
  getPaymentStatusMeta 
} from '@/lib/formatters';

function ReservasiListContent() {
  const searchParams = useSearchParams();
  const filterFromParam = searchParams.get('status') || 'all';

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(filterFromParam);
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
    if (!confirm('Setujui permintaan reservasi ini? Sistem akan memeriksa ketersediaan kamar secara atomik.')) return;
    try {
      const res = await PmsService.approveReservation(id);
      if (res.success) {
        setActionMessage('Reservasi berhasil disetujui! Status kini Menunggu Pembayaran / DP.');
        loadReservations();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menyetujui reservasi');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Masukkan alasan penolakan reservasi:');
    if (!reason) return;
    try {
      const res = await PmsService.rejectReservation(id, reason);
      if (res.success) {
        setActionMessage('Reservasi telah ditolak.');
        loadReservations();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menolak reservasi');
    }
  };

  const filtered = reservations.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      !query ||
      r.reservation_number.toLowerCase().includes(query) ||
      (r.guest?.full_name && r.guest.full_name.toLowerCase().includes(query)) ||
      (r.guest?.phone && r.guest.phone.includes(query));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            Manajemen Reservasi Homestay
          </h2>
          <p className="text-xs text-stone-500">
            Daftar seluruh pemesanan masuk, persetujuan admin, dan status pembayaran.
          </p>
        </div>

        <Link
          href="/booking"
          target="_blank"
          className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Input Reservasi Baru
        </Link>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-emerald-950 font-bold">&times;</button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 text-xs">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'pending_approval', label: 'Menunggu Persetujuan' },
            { id: 'approved_pending_payment', label: 'Menunggu Bayar' },
            { id: 'confirmed', label: 'Terkonfirmasi' },
            { id: 'checked_in', label: 'In-House' },
            { id: 'checked_out', label: 'Selesai' },
            { id: 'rejected', label: 'Ditolak' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                statusFilter === tab.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor / nama tamu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">No. Reservasi</th>
                <th className="py-3 px-4 font-semibold">Tamu</th>
                <th className="py-3 px-4 font-semibold">Kamar</th>
                <th className="py-3 px-4 font-semibold">Periode Menginap</th>
                <th className="py-3 px-4 font-semibold text-right">Total Biaya</th>
                <th className="py-3 px-4 font-semibold text-center">Status Reservasi</th>
                <th className="py-3 px-4 font-semibold text-center">Pembayaran</th>
                <th className="py-3 px-4 font-semibold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((res) => {
                const sMeta = getReservationStatusMeta(res.status);
                const pMeta = getPaymentStatusMeta(res.payment_status);

                return (
                  <tr key={res.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                      {res.reservation_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-stone-900 block">{res.guest?.full_name}</strong>
                      <span className="text-[11px] text-stone-500">{res.guest?.phone}</span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-800">
                      {res.rooms?.[0]?.name || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      <div>{formatDateIndo(res.checkin_date)} s/d</div>
                      <div>{formatDateIndo(res.checkout_date)}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-semibold text-stone-900">
                        {formatRupiah(res.price_snapshot?.total_amount)}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Sisa: {formatRupiah(res.price_snapshot?.balance_due)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${sMeta.badgeClass}`}>
                        {sMeta.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${pMeta.badgeClass}`}>
                        {pMeta.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {res.status === 'pending_approval' && (
                          <>
                            <button
                              onClick={() => handleApprove(res.id)}
                              title="Setujui Reservasi"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(res.id)}
                              title="Tolak Reservasi"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <Link
                          href={`/dashboard/reservasi/${res.id}`}
                          title="Lihat Rincian Reservasi"
                          className="p-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/slip/${res.id}`}
                          target="_blank"
                          title="Cetak Bukti / Invoice"
                          className="p-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-stone-400">
                    Tidak ada data reservasi yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ReservasiListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-400">Memuat data reservasi...</div>}>
      <ReservasiListContent />
    </Suspense>
  );
}
