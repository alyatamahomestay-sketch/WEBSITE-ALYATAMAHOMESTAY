'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calendar, Users, Search, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Building2, BedDouble } from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import { Room, RentalType } from '@/lib/types';
import { PmsService } from '@/lib/services/pms-service';
import { calculateRentalDuration, calculateReservationPricing } from '@/lib/pricing';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

function CekKetersediaanContent() {
  const searchParams = useSearchParams();
  const initialRoomId = searchParams.get('room_id') || '';
  const initialRental = (searchParams.get('rental') as RentalType) || 'daily';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [rentalType, setRentalType] = useState<RentalType>(initialRental);
  const [checkin, setCheckin] = useState(new Date().toISOString().split('T')[0]);
  
  const getDefaultCheckout = (type: RentalType) => {
    const d = new Date();
    if (type === 'daily') d.setDate(d.getDate() + 1);
    else if (type === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (type === 'yearly') d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  const [checkout, setCheckout] = useState(getDefaultCheckout(initialRental));
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [adults, setAdults] = useState(2);

  // Result state
  const [checked, setChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [durationInfo, setDurationInfo] = useState<any>(null);
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

  const handleRentalTypeChange = (type: RentalType) => {
    setRentalType(type);
    setCheckout(getDefaultCheckout(type));
    setChecked(false);
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = calculateRentalDuration(checkin, checkout, rentalType);
    if (duration.totalNights <= 0) {
      alert('Tanggal check-out harus setelah tanggal check-in.');
      return;
    }

    const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
    if (!selectedRoom) return;

    // Check if room operational status allows booking
    const available = selectedRoom.operational_status !== 'dalam_perawatan' && selectedRoom.operational_status !== 'tidak_dijual_sementara';
    setIsAvailable(available);

    const quote = calculateReservationPricing({
      checkinDateStr: checkin,
      checkoutDateStr: checkout,
      room: selectedRoom,
      rentalType,
      durationUnits: duration.durationUnits,
    });
    setDurationInfo(duration);
    setPricingQuote(quote);
    setChecked(true);
  };

  const selectedRoomObj = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="min-h-screen flex flex-col w-full">
      <PublicNavbar />

      <main className="flex-1 bg-[#F6F0E7] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 bg-[#806044]/15 text-[#806044] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pemeriksaan Ketersediaan & Simulasi Tarif</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#392B21] tracking-tight mb-2">
              Cek Ketersediaan Kamar ALYATAMA
            </h1>
            <p className="text-xs sm:text-sm text-[#756A5F]">
              Pilih model sewa (Harian dan Bulanan), tanggal, dan tipe kamar untuk simulasi tarif resmi.
            </p>
          </div>

          {/* Search Form Card */}
          <div className="bg-white rounded-3xl border border-[#E5DCD0] p-6 sm:p-8 shadow-sm mb-8">
            <form onSubmit={handleCheck} className="space-y-6">
              
              {/* Rental Model Switch */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#392B21] mb-2">
                  1. Pilih Model Sewa
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRentalTypeChange('daily')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      rentalType === 'daily'
                        ? 'bg-[#806044] text-white border-[#806044] shadow-sm'
                        : 'bg-[#FAF7F2] text-[#392B21] border-[#E5DCD0] hover:border-[#806044]'
                    }`}
                  >
                    <span className="block text-xs font-bold">Harian</span>
                    <span className={`text-[10px] block mt-0.5 ${rentalType === 'daily' ? 'text-white/80' : 'text-[#756A5F]'}`}>
                      Per malam
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRentalTypeChange('monthly')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      rentalType === 'monthly'
                        ? 'bg-[#806044] text-white border-[#806044] shadow-sm'
                        : 'bg-[#FAF7F2] text-[#392B21] border-[#E5DCD0] hover:border-[#806044]'
                    }`}
                  >
                    <span className="block text-xs font-bold">Bulanan</span>
                    <span className={`text-[10px] block mt-0.5 ${rentalType === 'monthly' ? 'text-white/80' : 'text-[#756A5F]'}`}>
                      30 hari
                    </span>
                  </button>
                </div>
              </div>

              {/* Dates & Room Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#392B21] mb-2">
                  2. Tanggal & Pilihan Kamar
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#392B21] mb-1">
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
                      className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#392B21] mb-1">
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
                      className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#392B21] mb-1">
                      Pilihan Kamar
                    </label>
                    <select
                      value={selectedRoomId}
                      onChange={(e) => {
                        setSelectedRoomId(e.target.value);
                        setChecked(false);
                      }}
                      className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                    >
                      {rooms.map((r) => {
                        let rateLabel = `${formatRupiah(r.base_rate)}/malam`;
                        if (rentalType === 'monthly' && r.monthly_rate) rateLabel = `${formatRupiah(r.monthly_rate)}/bulan`;
                        if (rentalType === 'yearly' && r.yearly_rate) rateLabel = `${formatRupiah(r.yearly_rate)}/tahun`;
                        return (
                          <option key={r.id} value={r.id}>
                            {r.name} - {r.room_type} ({rateLabel})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#392B21] mb-1">
                      Jumlah Tamu
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#806044] hover:bg-[#6c5037] text-white font-bold text-sm py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Periksa Ketersediaan & Hitung Biaya
              </button>
            </form>
          </div>

          {/* Result Card */}
          {checked && selectedRoomObj && (
            <div className="bg-white rounded-3xl border border-[#E5DCD0] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5DCD0]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#806044] block mb-1">
                    Hasil Pemeriksaan
                  </span>
                  <h3 className="font-serif font-bold text-xl text-[#392B21]">
                    {selectedRoomObj.name} ({selectedRoomObj.room_type})
                  </h3>
                  <p className="text-xs text-[#756A5F]">
                    {formatDateIndo(checkin)} s.d. {formatDateIndo(checkout)} ({durationInfo?.durationUnits} {durationInfo?.unitLabel} / {durationInfo?.totalNights} malam)
                  </p>
                </div>

                <div>
                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      Kamar Tersedia untuk Dipesan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <AlertCircle className="w-4 h-4" />
                      Kamar Sedang Dalam Perawatan
                    </span>
                  )}
                </div>
              </div>

              {/* Rincian Tarif */}
              {isAvailable && pricingQuote && (
                <div className="py-6 space-y-4">
                  <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E5DCD0] space-y-3">
                    <div className="flex justify-between text-xs text-[#756A5F]">
                      <span>Model Masa Sewa:</span>
                      <span className="font-bold text-[#392B21] uppercase">
                        Sewa {rentalType === 'daily' ? 'Harian' : rentalType === 'monthly' ? 'Bulanan' : 'Tahunan'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-[#756A5F]">
                      <span>Tarif Satuan:</span>
                      <span className="font-bold text-[#392B21]">
                        {formatRupiah(pricingQuote.unitRate)} / {durationInfo?.unitLabel}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-[#756A5F]">
                      <span>Durasi Menginap:</span>
                      <span className="font-bold text-[#392B21]">
                        {durationInfo?.durationUnits} {durationInfo?.unitLabel}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#E5DCD0] flex justify-between text-sm sm:text-base font-bold text-[#392B21]">
                      <span>Total Estimasi Biaya:</span>
                      <span className="text-[#806044]">{formatRupiah(pricingQuote.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#756A5F]">
                      <span>Deposit yang Diperlukan (50%):</span>
                      <span className="font-semibold text-[#806044]">{formatRupiah(pricingQuote.depositRequired)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/booking?room_id=${selectedRoomObj.id}&rental=${rentalType}&checkin=${checkin}&checkout=${checkout}&adults=${adults}`}
                      className="w-full bg-[#806044] hover:bg-[#6c5037] text-white font-bold text-sm py-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      Lanjutkan ke Formulir Reservasi Resmi
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

export default function CekKetersediaanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F0E7] flex items-center justify-center text-xs text-[#806044]">Memuat data ketersediaan...</div>}>
      <CekKetersediaanContent />
    </Suspense>
  );
}
