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
  Sparkles
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
  const [email, setEmail] = useState('');
  const initialCheckin = searchParams.get('checkin') || getTodayDateWIB();
  const [checkinDate, setCheckinDate] = useState(initialCheckin);

  const [checkoutDate, setCheckoutDate] = useState(
    searchParams.get('checkout') || getDefaultCheckoutWIB(initialCheckin, queryRental)
  );
  const [roomId, setRoomId] = useState(searchParams.get('room_id') || '');
  const [adults, setAdults] = useState(Number(searchParams.get('adults')) || 2);
  const [children, setChildren] = useState(0);
  const [marriageConfirmed, setMarriageConfirmed] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [dataConsent, setDataConsent] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(false);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchRooms() {
      try {
        const data = await PmsService.getRooms();
        setRooms(data);
        if (!roomId && data.length > 0) {
          setRoomId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRooms(false);
      }
    }
    fetchRooms();
  }, [roomId]);

  // Handle rental type switch
  const handleRentalTypeChange = (type: RentalType) => {
    setRentalType(type);
    setCheckoutDate(getDefaultCheckoutWIB(checkinDate, type));
  };

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const durationInfo = calculateRentalDuration(checkinDate, checkoutDate, rentalType);

  // Dynamic estimate calculation
  let dynamicPricing = null;
  if (selectedRoom && durationInfo.totalNights > 0) {
    dynamicPricing = calculateReservationPricing({
      checkinDateStr: checkinDate,
      checkoutDateStr: checkoutDate,
      room: selectedRoom,
      rentalType,
      durationUnits: durationInfo.durationUnits,
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!dataConsent) {
      setErrorMessage('Anda wajib menyetujui pemrosesan data untuk keperluan reservasi.');
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
          email,
          checkinDate,
          checkoutDate,
          roomId,
          rentalType,
          durationUnits: durationInfo.durationUnits,
          adults,
          children,
          marriageConfirmed,
          promoCode,
          specialRequests,
          dataConsent,
          whatsappConsent,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(json.message || 'Gagal mengajukan reservasi. Periksa kembali isian formulir.');
        setSubmitting(false);
        return;
      }

      // Success! Redirect to status page
      router.push(`/status-reservasi?res_num=${json.reservationNumber}&status=submitted`);
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
                          placeholder="Sesuai kartu identitas resmi (KTP/SIM/Paspor)"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#392B21] mb-1">
                            Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="Contoh: 082285472008"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                          />
                          <span className="text-[11px] text-[#756A5F] mt-0.5 block">
                            Untuk konfirmasi persetujuan & pengiriman bukti pemesanan.
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#392B21] mb-1">
                            Alamat Email (Opsional)
                          </label>
                          <input
                            type="email"
                            placeholder="email@contoh.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                          />
                        </div>
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
                        <label className="block text-xs font-semibold text-[#392B21] mb-1">
                          Pilih Unit Kamar <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={roomId}
                          onChange={(e) => setRoomId(e.target.value)}
                          className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                        >
                          {rooms.map((r) => {
                            let rateDisplay = `${formatRupiah(r.base_rate)}/malam`;
                            if (rentalType === 'monthly' && r.monthly_rate) {
                              rateDisplay = `${formatRupiah(r.monthly_rate)}/bulan`;
                            } else if (rentalType === 'yearly' && r.yearly_rate) {
                              rateDisplay = `${formatRupiah(r.yearly_rate)}/tahun`;
                            }
                            return (
                              <option key={r.id} value={r.id}>
                                {r.name} - {r.room_type} ({rateDisplay})
                              </option>
                            );
                          })}
                        </select>
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

                      {/* Syariah Marriage Declaration for 2+ adults */}
                      {adults >= 2 && (
                        <div className="bg-[#FAF7F2] border border-[#d4c3ad] p-4 rounded-2xl space-y-2">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="marriageConfirmed"
                              checked={marriageConfirmed}
                              onChange={(e) => setMarriageConfirmed(e.target.checked)}
                              className="mt-1 h-4 w-4 rounded border-stone-300 text-[#806044] focus:ring-[#806044]"
                            />
                            <label htmlFor="marriageConfirmed" className="text-xs text-[#392B21] leading-relaxed">
                              <span className="font-bold text-[#806044] block mb-0.5">
                                Kepatuhan Kebijakan Syariah (Pasangan Suami Istri / Keluarga):
                              </span>
                              Saya menyatakan bahwa tamu lawan jenis yang menginap bersama adalah pasangan sah suami-istri atau keluarga mahram, dan bersedia menunjukkan identitas / bukti sah (Buku Nikah / KTP beralamat sama) saat proses check-in.
                            </label>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-[#392B21] mb-1">
                          Kode Promo (Opsional)
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: HEMAT3"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2] uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#392B21] mb-1">
                          Permintaan Khusus (Opsional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Contoh: Jam kedatangan diperkirakan larut malam, permohonan sajadah ekstra, dsb."
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#806044] bg-[#FAF7F2]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian 3: Persetujuan Eksplisit */}
                  <div className="pt-2 border-t border-[#E5DCD0] space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#392B21] mb-2">
                      3. Persetujuan & Kebijakan
                    </h3>

                    {/* Consent 1: Data Processing (Mandatory) */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="dataConsent"
                        checked={dataConsent}
                        onChange={(e) => setDataConsent(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-stone-300 text-[#806044] focus:ring-[#806044]"
                      />
                      <label htmlFor="dataConsent" className="text-xs text-[#756A5F] leading-relaxed">
                        <span className="font-semibold text-[#392B21]">Persetujuan Pemrosesan Data:</span> Saya menyatakan data yang diberikan adalah benar dan menyetujui pemrosesan data untuk keperluan verifikasi reservasi sesuai{' '}
                        <Link href="/kebijakan" target="_blank" className="text-[#806044] underline font-medium">
                          Tata Tertib & Kebijakan Syariah Homestay
                        </Link>.
                      </label>
                    </div>

                    {/* Consent 2: WhatsApp Sending (Separate Consent) */}
                    <div className="flex items-start gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DCD0]">
                      <input
                        type="checkbox"
                        id="whatsappConsent"
                        checked={whatsappConsent}
                        onChange={(e) => setWhatsappConsent(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-stone-300 text-[#806044] focus:ring-[#806044]"
                      />
                      <label htmlFor="whatsappConsent" className="text-xs text-[#392B21] leading-relaxed">
                        <span className="font-bold text-[#806044]">Persetujuan Pengiriman Bukti via WhatsApp:</span> Saya setuju menerima ringkasan pemesanan, tautan bukti reservasi, dan instruksi pembayaran secara manual melalui nomor WhatsApp yang saya daftarkan.
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#806044] hover:bg-[#6c5037] disabled:bg-stone-400 text-white font-bold text-sm py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
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
                          Sewa {rentalType === 'daily' ? 'Harian' : rentalType === 'monthly' ? 'Bulanan' : 'Tahunan'}
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
                        {dynamicPricing.discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Diskon:</span>
                            <span className="font-semibold">
                              -{formatRupiah(dynamicPricing.discountAmount)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-[#392B21] text-base pt-3 border-t border-[#E5DCD0]">
                          <span>Total Estimasi:</span>
                          <span className="text-[#806044]">
                            {formatRupiah(dynamicPricing.totalAmount)}
                          </span>
                        </div>
                        
                        <div className="text-[11px] text-[#756A5F] bg-[#FAF7F2] p-3 rounded-xl border border-[#E5DCD0] leading-relaxed space-y-1">
                          <p>
                            <strong>Deposit / Uang Muka:</strong> {formatRupiah(dynamicPricing.depositRequired)} (50%).
                          </p>
                          <p className="text-[10px] text-stone-500">
                            *Setelah admin menyetujui ketersediaan kamar, Anda akan menerima instruksi penguncian jadwal dan transfer deposit.
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
