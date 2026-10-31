'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { Reservation } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';
import { showAdminToast } from '@/components/common/AdminToast';

export default function CheckInOutPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'arrivals' | 'departures' | 'inhouse'>('arrivals');
  const [feedback, setFeedback] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const loadData = async () => {
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
    loadData();
  }, []);

  const handleProcessCheckin = async (res: Reservation) => {
    if (!confirm(`Proses check-in untuk tamu ${res.guest?.full_name}?`)) return;
    const updateRes = await PmsService.updateReservationStatus(res.id, 'checked_in');
    if (updateRes.success) {
      // Also update room operational status to 'ditempati'
      if (res.rooms?.[0]?.id) {
        await PmsService.updateRoom(res.rooms[0].id, { operational_status: 'ditempati' });
      }
      showAdminToast('edit', `Check-in berhasil! Kamar No. ${res.rooms?.[0]?.room_number} kini berstatus Ditempati.`);
      setFeedback(`Check-in berhasil! Kamar No. ${res.rooms?.[0]?.room_number} kini berstatus Ditempati.`);
      loadData();
    }
  };

  const handleProcessCheckout = async (res: Reservation) => {
    if (res.price_snapshot?.balance_due && res.price_snapshot.balance_due > 0) {
      const proceed = confirm(`Peringatan: Masih terdapat sisa tagihan sebesar ${formatRupiah(res.price_snapshot.balance_due)}. Lanjutkan check-out?`);
      if (!proceed) return;
    }

    if (!confirm(`Proses check-out untuk ${res.guest?.full_name}?`)) return;

    const updateRes = await PmsService.updateReservationStatus(res.id, 'checked_out');
    if (updateRes.success) {
      // Room becomes 'menunggu_dibersihkan'
      if (res.rooms?.[0]?.id) {
        await PmsService.updateRoom(res.rooms[0].id, { operational_status: 'menunggu_dibersihkan' });
      }
      showAdminToast('edit', `Check-out selesai! Kamar No. ${res.rooms?.[0]?.room_number} otomatis ditandai Menunggu Dibersihkan.`);
      setFeedback(`Check-out selesai! Kamar No. ${res.rooms?.[0]?.room_number} otomatis ditandai Menunggu Dibersihkan.`);
      loadData();
    }
  };

  const arrivalsList = reservations.filter(
    (r) => r.status === 'confirmed' || r.status === 'approved_pending_payment'
  );
  const inHouseList = reservations.filter((r) => r.status === 'checked_in');
  const departuresList = reservations.filter(
    (r) => r.status === 'checked_in' && r.checkout_date <= todayStr
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
          Meja Resepsionis: Check-in & Check-out
        </h2>
        <p className="text-xs text-stone-500">
          Proses penerimaan tamu kedatangan, verifikasi identitas, pelunasan sisa tagihan, dan pembuatan tugas kebersihan pasca check-out.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="font-bold">&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('arrivals')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'arrivals'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Kedatangan Siap Check-in ({arrivalsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inhouse')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'inhouse'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
          <span>Tamu In-House ({inHouseList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('departures')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'departures'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Jadwal Check-out Hari Ini ({departuresList.length})</span>
        </button>
      </div>

      {/* Content based on Active Tab */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {activeTab === 'arrivals' && (
          <div className="divide-y divide-stone-100 text-xs">
            {arrivalsList.map((res) => (
              <div key={res.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-semibold text-stone-900">{res.guest?.full_name}</strong>
                    <span className="font-mono text-stone-500 text-[11px]">• {res.reservation_number}</span>
                  </div>
                  <div className="text-stone-600">
                    Kamar: <strong className="text-stone-900">{res.rooms?.[0]?.name} (No. {res.rooms?.[0]?.room_number})</strong> • {formatDateIndo(res.checkin_date)} s/d {formatDateIndo(res.checkout_date)}
                  </div>
                  <div className="text-stone-500">
                    Sisa Tagihan: <strong className={res.price_snapshot?.balance_due === 0 ? 'text-emerald-700' : 'text-amber-700'}>{formatRupiah(res.price_snapshot?.balance_due)}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/reservasi/${res.id}`}
                    className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                  >
                    Rincian & Bayar
                  </Link>
                  <button
                    onClick={() => handleProcessCheckin(res)}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 shadow-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Proses Check-in
                  </button>
                </div>
              </div>
            ))}

            {arrivalsList.length === 0 && (
              <div className="p-8 text-center text-stone-400 text-xs">
                Tidak ada kedatangan tamu yang menunggu check-in.
              </div>
            )}
          </div>
        )}

        {activeTab === 'inhouse' && (
          <div className="divide-y divide-stone-100 text-xs">
            {inHouseList.map((res) => (
              <div key={res.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-semibold text-stone-900">{res.guest?.full_name}</strong>
                    <span className="text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded text-[10px]">In-House</span>
                  </div>
                  <div className="text-stone-600">
                    Kamar: <strong className="text-stone-900">{res.rooms?.[0]?.name}</strong> • Check-out Dijadwalkan: {formatDateIndo(res.checkout_date)}
                  </div>
                  <div className="text-stone-500">
                    Sisa Tagihan: <strong className={res.price_snapshot?.balance_due === 0 ? 'text-emerald-700' : 'text-rose-700'}>{formatRupiah(res.price_snapshot?.balance_due)}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/reservasi/${res.id}`}
                    className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                  >
                    Rincian Tagihan
                  </Link>
                  <button
                    onClick={() => handleProcessCheckout(res)}
                    className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium flex items-center gap-1.5 shadow-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Check-out Sekarang
                  </button>
                </div>
              </div>
            ))}

            {inHouseList.length === 0 && (
              <div className="p-8 text-center text-stone-400 text-xs">
                Tidak ada tamu yang sedang menginap saat ini.
              </div>
            )}
          </div>
        )}

        {activeTab === 'departures' && (
          <div className="divide-y divide-stone-100 text-xs">
            {departuresList.map((res) => (
              <div key={res.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <strong className="text-sm font-semibold text-stone-900">{res.guest?.full_name}</strong>
                  <div className="text-stone-600">
                    Kamar: <strong className="text-stone-900">{res.rooms?.[0]?.name}</strong> • Sisa Tagihan: {formatRupiah(res.price_snapshot?.balance_due)}
                  </div>
                </div>

                <button
                  onClick={() => handleProcessCheckout(res)}
                  className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium flex items-center gap-1.5 shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Selesaikan Check-out & Bersihkan
                </button>
              </div>
            ))}

            {departuresList.length === 0 && (
              <div className="p-8 text-center text-stone-400 text-xs">
                Tidak ada jadwal check-out yang jatuh tempo hari ini.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
