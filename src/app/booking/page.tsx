'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Info,
  Building2,
  BedDouble,
  HeartHandshake,
  Sparkles,
  Banknote,
  CreditCard
} from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import { Room, RentalType, Reservation } from '@/lib/types';
import { evaluateRoomAvailability } from '@/lib/room-availability';
import { PmsService } from '@/lib/services/pms-service';
import { calculateReservationPricing, calculateRentalDuration } from '@/lib/pricing';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';
import { getTodayDateWIB, getDefaultCheckoutWIB } from '@/lib/date-utils';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Rental model selection
  const queryRental = (searchParams.get('rental') as RentalType) || 'daily';
  const [rentalType, setRentalType] = useState<RentalType>(queryRental);

  // Form State with Asia/Jakarta (WIB) default dates
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentPreference, setPaymentPreference] = useState<'cash' | 'transfer'>('cash');
  const initialCheckin = searchParams.get('checkin') || getTodayDateWIB();
  const [checkinDate, setCheckinDate] = useState(initialCheckin);

  const [checkoutDate, setCheckoutDate] = useState(
    searchParams.get('checkout') || getDefaultCheckoutWIB(initialCheckin, queryRental)
  );
  const queryRoomId = searchParams.get('room_id') || searchParams.get('roomId') || '';
  const [roomId, setRoomId] = useState(queryRoomId);
  const [adults, setAdults] = useState(Number(searchParams.get('adults')) || 2);
  const [children, setChildren] = useState(0);
  const [extraBedQty, setExtraBedQty] = useState<number>(0);
  const [extraBedRate, setExtraBedRate] = useState<number>(50000);
  const [marriageConfirmed, setMarriageConfirmed] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [dataConsent, setDataConsent] = useState(false);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchPropertySettings() {
      try {
        if (typeof window !== 'undefined') {
          const localVal = localStorage.getItem('alyatama_extra_bed_rate');
          if (localVal && Number(localVal) >= 0) {
            setExtraBedRate(Number(localVal));
          }
        }

        const res = await fetch('/api/panel/properties', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.property?.extra_bed_rate !== undefined && Number(json.property.extra_bed_rate) >= 0) {
            const rate = Number(json.property.extra_bed_rate);
            setExtraBedRate(rate);
            if (typeof window !== 'undefined') {
              localStorage.setItem('alyatama_extra_bed_rate', String(rate));
            }
            return;
          }
        }
        const prop = await PmsService.getPropertySettings();
        if (prop && prop.extra_bed_rate !== undefined && Number(prop.extra_bed_rate) >= 0) {
          setExtraBedRate(Number(prop.extra_bed_rate));
        }
      } catch (e) {}
    }
    fetchPropertySettings();

    const onRateSync = (e: any) => {
      if (e?.detail) setExtraBedRate(Number(e.detail));
      else fetchPropertySettings();
    };
    window.addEventListener('storage', onRateSync);
    window.addEventListener('extra-bed-updated', onRateSync);
    return () => {
      window.removeEventListener('storage', onRateSync);
      window.removeEventListener('extra-bed-updated', onRateSync);
    };
  }, []);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch('/api/panel/rooms', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.rooms) && json.rooms.length > 0) {
            setRooms(json.rooms);
            if (!roomId) {
              const matched = queryRoomId ? json.rooms.find((r: Room) => r.id === queryRoomId) : null;
              setRoomId(matched ? matched.id : json.rooms[0].id);
            }
            return;
          }
        }
        const data = await PmsService.getRooms();
        setRooms(data);
        if (!roomId && data.length > 0) {
          const matched = queryRoomId ? data.find((r) => r.id === queryRoomId) : null;
          setRoomId(matched ? matched.id : data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRooms(false);
      }
    }
    fetchRooms();

    const onSync = () => fetchRooms();
    window.addEventListener('focus', onSync);
    window.addEventListener('storage', onSync);
    window.addEventListener('rooms-updated', onSync);

    return () => {
      window.removeEventListener('focus', onSync);
      window.removeEventListener('storage', onSync);
      window.removeEventListener('rooms-updated', onSync);
    };
  }, [roomId]);

  // Handle rental type switch
  const handleRentalTypeChange = (type: RentalType) => {
    setRentalType(type);
    setCheckoutDate(getDefaultCheckoutWIB(checkinDate, type));
  };

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const durationInfo = calculateRentalDuration(checkinDate, checkoutDate, rentalType);
  const extraBedTotal = extraBedQty * extraBedRate * Math.max(1, durationInfo.totalNights);

  // Dynamic estimate calculation
  let dynamicPricing = null;
  if (selectedRoom && durationInfo.totalNights > 0) {
    dynamicPricing = calculateReservationPricing({
      checkinDateStr: checkinDate,
      checkoutDateStr: checkoutDate,
      room: selectedRoom,
      rentalType,
      durationUnits: durationInfo.durationUnits,
      extraCharges: extraBedTotal,
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!dataConsent) {
      setErrorMessage('Anda wajib menyetujui pemrosesan data untuk keperluan verifikasi reservasi.');
      return;
    }

    if (durationInfo.totalNights <= 0) {
      setErrorMessage('Tanggal check-out harus setelah tanggal check-in.');
      return;
    }

    if (adults >= 2 && !marriageConfirmed) {
      setErrorMessage('Untuk menginap bersama pasangan, harap berikan konfirmasi kepatuhan Syariah (pasangan sah / mahram).');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/reservasi/public-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          checkinDate,
          checkoutDate,
          roomId,
          rentalType,
          durationUnits: durationInfo.durationUnits,
          adults,
          children,
          extraBedQty,
          extraCharges: extraBedTotal,
          marriageConfirmed,
          paymentPreference,
          specialRequests: extraBedQty > 0 
            ? (specialRequests ? `${specialRequests}\n[Permintaan: +${extraBedQty} Unit Ekstra Bed]` : `[Permintaan: +${extraBedQty} Unit Ekstra Bed]`)
            : specialRequests,
          dataConsent,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(json.message || 'Gagal mengajukan reservasi. Periksa kembali isian formulir.');
        setSubmitting(false);
        return;
      }

      // Simpan backup instan ke browser storage agar langsung terbaca di halaman status
      if (typeof window !== 'undefined' && json.reservation) {
        try {
          localStorage.setItem('last_submitted_reservation', JSON.stringify(json.reservation));
        } catch (e) {}
      }

      // Success! Redirect to status page
      router.push(`/status-reservasi?res_num=${encodeURIComponent(json.reservationNumber)}&status=submitted`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi gangguan jaringan saat mengajukan pemesanan.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      <PublicNavbar />

      <main className="flex-1 bg-[#F6F0E7] py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 bg-[#806044]/15 text-[#806044] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Penginapan Syariah Bangkinang Kota</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#392B21] tracking-tight mb-2">
              Formulir Reservasi Resmi ALYATAMA HOMESTAY
            </h1>
            <p className="text-xs sm:text-sm text-[#756A5F] leading-relaxed">
              Lengkapi formulir di bawah ini untuk sewa <strong className="text-[#392B21]">Harian maupun Bulanan</strong>. Permintaan Anda akan segera diverifikasi oleh admin homestay sebelum konfirmasi resmi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Column (2 Cols) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl border border-[#E5DCD0] p-6 sm:p-8 shadow-sm">
                
                {errorMessage && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block mb-0.5">Perhatian:</strong>
                      <span>{errorMessage}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Step 0: Pilihan Model Sewa */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#392B21] mb-2">
                      Pilih Model Masa Sewa
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleRentalTypeChange('daily')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
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
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
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

                  {/* Bagian 1: Data Tamu */}
                  <div className="pt-2 border-t border-[#E5DCD0]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#392B21] pb-2 border-b border-[#FAF7F2] mb-4">
                      1. Informasi Tamu Pemesan
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#392B21] mb-1">
                          Nama Lengkap Tamu <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Sesuai kartu identitas resmi (KTP / SIM / Paspor)"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#392B21] mb-1">
                          Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="Contoh: 088279927664 atau 081234567890"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                        />
                        <span className="text-[11px] text-[#756A5F] mt-1 block">
                          Digunakan untuk konfirmasi persetujuan reservasi dan koordinasi kedatangan oleh staf homestay.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bagian 2: Tanggal & Kamar */}
                  <div className="pt-2 border-t border-[#E5DCD0]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#392B21] pb-2 border-b border-[#FAF7F2] mb-4">
                      2. Jadwal & Pilihan Kamar
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#392B21] mb-1">
                            Tanggal Check-in <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={checkinDate}
                            onChange={(e) => setCheckinDate(e.target.value)}
                            className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                          />
                          <span className="text-[11px] text-[#756A5F] mt-0.5 block">
                            Waktu check-in mulai pukul 14:00 WIB.
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#392B21] mb-1">
                            Tanggal Check-out <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={checkoutDate}
                            onChange={(e) => setCheckoutDate(e.target.value)}
                            className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                          />
                          <span className="text-[11px] text-[#756A5F] mt-0.5 block">
                            Waktu check-out maksimal pukul 12:00 WIB.
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-semibold text-[#392B21]">
                            Unit Kamar Dipilih <span className="text-rose-500">*</span>
                          </label>
                          <Link
                            href="/kamar"
                            className="text-[11px] font-semibold text-[#806044] hover:underline flex items-center gap-1"
                          >
                            <span>Ganti Pilihan Kamar</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>

                        {selectedRoom ? (
                          <div className="p-3.5 rounded-xl border-2 border-[#806044]/30 bg-[#FAF7F2] flex items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#806044] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                                {selectedRoom.room_number}
                              </div>
                              <div>
                                <div className="text-xs sm:text-sm font-bold text-[#30231A]">
                                  {selectedRoom.name}
                                </div>
                                <div className="text-[11px] text-[#756A5F] flex items-center gap-2">
                                  <span className="font-semibold text-[#806044] uppercase tracking-wider">{selectedRoom.room_type}</span>
                                  <span>•</span>
                                  <span>Kapasitas {selectedRoom.capacity_adults} Dewasa</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs sm:text-sm font-bold text-[#30231A] block">
                                {rentalType === 'monthly' && selectedRoom.monthly_rate
                                  ? `${formatRupiah(selectedRoom.monthly_rate)}/bln`
                                  : `${formatRupiah(selectedRoom.base_rate)}/malam`}
                              </span>
                            </div>
                            <input type="hidden" name="roomId" value={selectedRoom.id} />
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl border border-dashed border-[#D4C3AD] bg-white text-center">
                            <p className="text-xs text-[#756A5F] mb-2">Belum ada unit kamar yang dipilih.</p>
                            <Link
                              href="/kamar"
                              className="inline-flex items-center gap-1 text-xs bg-[#806044] text-white px-3 py-1.5 rounded-lg font-bold"
                            >
                              Pilih Kamar di Halaman Kamar &rarr;
                            </Link>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#392B21] mb-1">
                            Tamu Dewasa
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

                        <div>
                          <label className="block text-xs font-semibold text-[#392B21] mb-1">
                            Tamu Anak (di bawah 12 tahun)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="6"
                            value={children}
                            onChange={(e) => setChildren(Number(e.target.value))}
                            className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                          />
                        </div>
                      </div>

                      {/* Penambahan Ekstra Bed (Kasur Tambahan) */}
                      <div className="bg-[#FAF7F2] border border-[#d4c3ad] p-4 rounded-2xl space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#806044]/10 text-[#806044] flex items-center justify-center shrink-0 mt-0.5">
                              <BedDouble className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-[#392B21] block">
                                Penambahan Ekstra Bed (Kasur Tambahan)
                              </span>
                              <span className="text-[11px] text-[#756A5F] block leading-tight">
                                Biaya resmi: <strong className="text-[#806044]">{formatRupiah(extraBedRate)}/malam</strong> per unit (termasuk bantal &amp; sprei bersih)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <label htmlFor="extraBedSelect" className="text-xs font-semibold text-[#392B21] whitespace-nowrap">
                              Jumlah:
                            </label>
                            <select
                              id="extraBedSelect"
                              value={extraBedQty}
                              onChange={(e) => setExtraBedQty(Number(e.target.value))}
                              className="text-xs font-bold rounded-xl border border-[#d4c3ad] bg-white px-3 py-2 text-[#392B21] focus:outline-none focus:ring-2 focus:ring-[#806044] cursor-pointer"
                            >
                              <option value="0">Tidak Perlu (+Rp 0)</option>
                              <option value="1">+1 Ekstra Bed (+{formatRupiah(extraBedRate)}/malam)</option>
                              <option value="2">+2 Ekstra Bed (+{formatRupiah(extraBedRate * 2)}/malam)</option>
                              <option value="3">+3 Ekstra Bed (+{formatRupiah(extraBedRate * 3)}/malam)</option>
                            </select>
                          </div>
                        </div>

                        {extraBedQty > 0 && (
                          <div className="pt-2.5 border-t border-[#e5dcd0] flex items-center justify-between text-xs bg-white/70 p-2.5 rounded-xl border border-[#e5dcd0]/60">
                            <span className="text-[#756A5F]">
                              Subtotal Ekstra Bed ({extraBedQty} unit × {durationInfo.totalNights} malam):
                            </span>
                            <strong className="text-sm font-bold text-[#806044]">
                              +{formatRupiah(extraBedTotal)}
                            </strong>
                          </div>
                        )}
                      </div>

                      {/* Syariah Marriage Declaration for 2+ adults */}
                      {adults >= 2 && (
                        <div className="bg-[#FAF7F2] border border-[#d4c3ad] p-4 rounded-2xl space-y-2">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="marriageConfirmed"
                              checked={marriageConfirmed}
                              onChange={(e) => setMarriageConfirmed(e.target.checked)}
                              className="mt-1 h-4 w-4 rounded border-stone-300 text-[#806044] focus:ring-[#806044] cursor-pointer"
                            />
                            <label htmlFor="marriageConfirmed" className="text-xs text-[#392B21] leading-relaxed cursor-pointer">
                              <span className="font-bold text-[#806044] block mb-0.5">
                                Kepatuhan Kebijakan Syariah (Pasangan Suami Istri / Mahram):
                              </span>
                              Saya menyatakan bahwa tamu lawan jenis yang menginap bersama adalah pasangan sah suami-istri atau keluarga mahram, dan bersedia menunjukkan identitas sah (Buku Nikah / KTP beralamat sama) saat proses check-in.
                            </label>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-[#392B21] mb-1">
                          Permintaan Khusus (Opsional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Contoh: Perkiraan jam kedatangan larut malam, permohonan sajadah ekstra, dsb."
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian 3: Pilihan Metode Pembayaran */}
                  <div className="pt-2 border-t border-[#E5DCD0]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#392B21] pb-2 border-b border-[#FAF7F2] mb-3">
                      3. Pilihan Metode Pembayaran <span className="text-rose-500">*</span>
                    </h3>

                    {/* Notice Penjelasan Pembayaran */}
                    <div className="p-3.5 mb-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-950">
                      <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong className="block text-amber-900 font-bold mb-0.5">
                          Ketentuan Transaksi Pembayaran:
                        </strong>
                        Seluruh transaksi pembayaran (baik secara <span className="font-semibold underline">Tunai / Cash</span> maupun <span className="font-semibold underline">Transfer Rekening Bank</span>) dilakukan <span className="font-bold">saat sebelum serah terima kunci</span> oleh petugas homestay saat Anda tiba di lokasi.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Opsi 1: Cash */}
                      <label
                        className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                          paymentPreference === 'cash'
                            ? 'bg-[#FAF7F2] border-[#806044] ring-2 ring-[#806044]/30'
                            : 'bg-white border-[#E5DCD0] hover:border-stone-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentPreference"
                          value="cash"
                          checked={paymentPreference === 'cash'}
                          onChange={() => setPaymentPreference('cash')}
                          className="mt-1 text-[#806044] focus:ring-[#806044]"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-[#392B21]">
                            <Banknote className="w-4 h-4 text-[#806044]" />
                            <span>Bayar Tunai / Cash di Tempat</span>
                          </div>
                          <p className="text-[11px] text-[#756A5F] leading-relaxed">
                            Bayar tunai langsung kepada petugas di lokasi homestay sebelum menerima kunci kamar.
                          </p>
                        </div>
                      </label>

                      {/* Opsi 2: Transfer Bank */}
                      <label
                        className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                          paymentPreference === 'transfer'
                            ? 'bg-[#FAF7F2] border-[#806044] ring-2 ring-[#806044]/30'
                            : 'bg-white border-[#E5DCD0] hover:border-stone-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentPreference"
                          value="transfer"
                          checked={paymentPreference === 'transfer'}
                          onChange={() => setPaymentPreference('transfer')}
                          className="mt-1 text-[#806044] focus:ring-[#806044]"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-[#392B21]">
                            <CreditCard className="w-4 h-4 text-[#806044]" />
                            <span>Transfer ke Rekening Homestay</span>
                          </div>
                          <p className="text-[11px] text-[#756A5F] leading-relaxed">
                            Transfer melalui ATM / m-Banking resmi sebelum serah terima kunci kamar saat tiba di lokasi.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Bagian 4: Persetujuan Eksplisit */}
                  <div className="pt-2 border-t border-[#E5DCD0] space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#392B21] mb-2">
                      4. Persetujuan & Kebijakan
                    </h3>

                    {/* Consent: Data Processing (Mandatory) */}
                    <div className="flex items-start gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DCD0]">
                      <input
                        type="checkbox"
                        id="dataConsent"
                        checked={dataConsent}
                        onChange={(e) => setDataConsent(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-stone-300 text-[#806044] focus:ring-[#806044] cursor-pointer"
                      />
                      <label htmlFor="dataConsent" className="text-xs text-[#756A5F] leading-relaxed cursor-pointer">
                        <span className="font-semibold text-[#392B21]">Persetujuan Reservasi:</span> Saya menyatakan bahwa data yang diisi adalah benar, bersedia mematuhi{' '}
                        <Link href="/kebijakan" target="_blank" className="text-[#806044] underline font-medium">
                          Tata Tertib & Kebijakan Syariah Homestay
                        </Link>, dan memahami transaksi pembayaran dilakukan sebelum serah terima kunci.
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#806044] hover:bg-[#6c5037] disabled:bg-stone-400 text-white font-bold text-sm py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? 'Memproses Pengajuan...' : 'Ajukan Permintaan Reservasi Sekarang'}
                    {!submitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </div>

            {/* Summary Column (1 Col) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-[#E5DCD0] p-6 shadow-sm sticky top-28 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-[#806044] font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ringkasan Reservasi</span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#392B21]">
                    Rincian & Estimasi Biaya
                  </h3>
                  <p className="text-xs text-[#756A5F]">
                    Dihitung otomatis sebelum persetujuan admin.
                  </p>
                </div>

                {selectedRoom ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0] space-y-1">
                      <span className="text-[11px] text-[#756A5F] block font-medium">Kamar Pilihan</span>
                      <strong className="text-sm font-bold text-[#392B21] block">
                        {selectedRoom.name}
                      </strong>
                      <div className="flex items-center justify-between text-xs text-[#756A5F] pt-1">
                        <span>{selectedRoom.room_type}</span>
                        <span className="bg-[#806044]/15 text-[#806044] font-semibold px-2 py-0.5 rounded text-[10px] uppercase">
                          Sewa {rentalType === 'daily' ? 'Harian' : 'Bulanan'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 py-3 border-y border-[#E5DCD0] text-[#756A5F]">
                      <div className="flex justify-between">
                        <span>Check-in:</span>
                        <span className="font-semibold text-[#392B21]">{formatDateIndo(checkinDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Check-out:</span>
                        <span className="font-semibold text-[#392B21]">{formatDateIndo(checkoutDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Durasi:</span>
                        <span className="font-bold text-[#806044]">
                          {durationInfo.durationUnits} {durationInfo.unitLabel} ({durationInfo.totalNights} malam)
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-dashed border-[#E5DCD0]">
                        <span>Metode Pembayaran:</span>
                        <span className="font-semibold text-[#392B21]">
                          {paymentPreference === 'cash' ? 'Bayar Tunai (Cash)' : 'Transfer Bank'}
                        </span>
                      </div>
                    </div>

                    {dynamicPricing && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex justify-between text-[#756A5F]">
                          <span>Tarif Satuan:</span>
                          <span className="font-semibold text-[#392B21]">
                            {formatRupiah(dynamicPricing.unitRate)} / {durationInfo.unitLabel}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#756A5F]">
                          <span>Subtotal ({durationInfo.durationUnits} {durationInfo.unitLabel}):</span>
                          <span className="font-semibold text-[#392B21]">
                            {formatRupiah(dynamicPricing.baseSubtotal)}
                          </span>
                        </div>
                        {extraBedQty > 0 && (
                          <div className="flex justify-between text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60 font-medium">
                            <span>Ekstra Bed ({extraBedQty} unit × {durationInfo.totalNights} malam):</span>
                            <span className="font-bold">+{formatRupiah(extraBedTotal)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-[#392B21] text-base pt-3 border-t border-[#E5DCD0]">
                          <span>Total Estimasi:</span>
                          <span className="text-[#806044]">
                            {formatRupiah(dynamicPricing.totalAmount)}
                          </span>
                        </div>
                        
                        <div className="text-[11px] text-[#756A5F] bg-[#FAF7F2] p-3 rounded-xl border border-[#E5DCD0] leading-relaxed space-y-1">
                          <p className="font-semibold text-[#392B21]">
                            Waktu Transaksi Pembayaran:
                          </p>
                          <p className="text-[11px] text-stone-600">
                            Pembayaran diselesaikan sebelum serah terima kunci kamar oleh petugas homestay saat kedatangan.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-stone-400 text-center py-4">
                    Memuat data kamar...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F0E7] flex items-center justify-center text-xs text-[#806044]">Memuat formulir pemesanan...</div>}>
      <BookingContent />
    </Suspense>
  );
}
