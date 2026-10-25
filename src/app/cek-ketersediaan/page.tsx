'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calendar, Users, Search, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import { Room } from '@/lib/types';
import { PmsService } from '@/lib/services/pms-service';
import { calculateNights, calculateReservationPricing } from '@/lib/pricing';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

function CekKetersediaanContent() {
  const searchParams = useSearchParams();
  const initialRoomId = searchParams.get('room_id') || '';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [checkin, setCheckin] = useState(new Date().toISOString().split('T')[0]);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [checkout, setCheckout] = useState(tomorrow.toISOString().split('T')[0]);
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [adults, setAdults] = useState(2);

  // Result state
  const [checked, setChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [pricingQuote, setPricingQuote] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await PmsService.getRooms();
        setRooms(data);
        if (!selectedRoomId && data.length > 0) {
          setSelectedRoomId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedRoomId]);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const nights = calculateNights(checkin, checkout);
    if (nights <= 0) {
      alert('Tanggal check-out harus setelah tanggal check-in (minimal 1 malam menginap).');
      return;
    }

    const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
    if (!selectedRoom) return;

    // Concurrency / availability verification logic
    // Check if room operational status allows booking
    const available = selectedRoom.operational_status !== 'dalam_perawatan' && selectedRoom.operational_status !== 'tidak_dijual_sementara';
    setIsAvailable(available);

    const quote = calculateReservationPricing({
      checkinDateStr: checkin,
      checkoutDateStr: checkout,
      room: selectedRoom,
    });
    setPricingQuote(quote);
    setChecked(true);
  };

  const selectedRoomObj = rooms.find((r) => r.id === selectedRoomId);

  return (
    <>
      <PublicNavbar />

      <main className="flex-1 bg-stone-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-700 block mb-2">
              Pemeriksaan Ketersediaan
            </span>
            <h1 className="font-serif text-3xl font-semibold text-stone-900 tracking-tight mb-2">
              Cek Ketersediaan Kamar & Simulasi Tarif
            </h1>
            <p className="text-xs text-stone-600">
              Pilih tanggal menginap dan kamar untuk mengetahui estimasi biaya serta status ketersediaan.
            </p>
          </div>

          {/* Search Form Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm mb-8">
            <form onSubmit={handleCheck} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Tanggal Check-in
                  </label>
                  <input
                    type="date"
                    required
                    value={checkin}
                    onChange={(e) => {
                      setCheckin(e.target.value);
                      setChecked(false);
                    }}
                    className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Tanggal Check-out
                  </label>
                  <input
                    type="date"
                    required
                    value={checkout}
                    onChange={(e) => {
                      setCheckout(e.target.value);
                      setChecked(false);
                    }}
                    className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Pilihan Unit Kamar
                  </label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => {
                      setSelectedRoomId(e.target.value);
                      setChecked(false);
                    }}
                    className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.room_type}) - {formatRupiah(r.base_rate)}/mlm
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Jumlah Tamu Dewasa
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Periksa Ketersediaan & Hitung Biaya
              </button>
            </form>
          </div>

          {/* Results Display */}
          {checked && pricingQuote && selectedRoomObj && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  {isAvailable ? (
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-stone-900 text-base">
                      {isAvailable ? 'Kamar Tersedia untuk Dipesan!' : 'Kamar Tidak Tersedia'}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {selectedRoomObj.name} • {pricingQuote.totalNights} Malam ({formatDateIndo(checkin)} - {formatDateIndo(checkout)})
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isAvailable ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {isAvailable ? 'Siap Dipesan' : 'Penuh / Dirawat'}
                </span>
              </div>

              {isAvailable ? (
                <>
                  {/* Nightly Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                      Rincian Biaya Menginap
                    </h4>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-2 text-xs">
                      {pricingQuote.nightlyBreakdown.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-stone-700">
                          <span>Malam {idx + 1} ({formatDateIndo(item.date)})</span>
                          <span className="font-medium text-stone-900">{formatRupiah(item.rate)}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-sm font-semibold text-stone-900">
                        <span>Total Estimasi ({pricingQuote.totalNights} Malam)</span>
                        <span className="text-brand-700">{formatRupiah(pricingQuote.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                    <Link
                      href={`/booking?room_id=${selectedRoomObj.id}&checkin=${checkin}&checkout=${checkout}&adults=${adults}`}
                      className="w-full sm:w-auto flex-1 bg-brand-600 hover:bg-brand-500 text-white text-center font-medium text-sm py-3 px-6 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      Lanjutkan Pengisian Formulir Reservasi
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-xs text-rose-700 bg-rose-50 p-4 rounded-xl border border-rose-100">
                  Unit kamar ini sedang dalam jadwal perawatan atau tidak dijual pada rentang waktu yang dipilih. Silakan pilih unit kamar lain atau ubah tanggal menginap.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </>
  );
}

export default function CekKetersediaanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center text-xs text-stone-500">Memuat kalkulator ketersediaan...</div>}>
      <CekKetersediaanContent />
    </Suspense>
  );
}
