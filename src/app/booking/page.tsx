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
  Info
} from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import { Room } from '@/lib/types';
import { PmsService } from '@/lib/services/pms-service';
import { calculateNights, calculateReservationPricing } from '@/lib/pricing';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [checkinDate, setCheckinDate] = useState(
    searchParams.get('checkin') || new Date().toISOString().split('T')[0]
  );
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [checkoutDate, setCheckoutDate] = useState(
    searchParams.get('checkout') || tomorrow.toISOString().split('T')[0]
  );
  const [roomId, setRoomId] = useState(searchParams.get('room_id') || '');
  const [adults, setAdults] = useState(Number(searchParams.get('adults')) || 2);
  const [children, setChildren] = useState(0);
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

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const totalNights = calculateNights(checkinDate, checkoutDate);

  // Dynamic estimate calculation
  let dynamicPricing = null;
  if (selectedRoom && totalNights > 0) {
    dynamicPricing = calculateReservationPricing({
      checkinDateStr: checkinDate,
      checkoutDateStr: checkoutDate,
      room: selectedRoom,
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!dataConsent) {
      setErrorMessage('Anda wajib menyetujui pemrosesan data untuk keperluan reservasi.');
      return;
    }

    if (totalNights <= 0) {
      setErrorMessage('Tanggal check-out harus setelah tanggal check-in (minimal 1 malam menginap).');
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
          adults,
          children,
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
    <>
      <PublicNavbar />

      <main className="flex-1 bg-stone-50 py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-700 block mb-1">
              Formulir Reservasi Resmi
            </span>
            <h1 className="font-serif text-3xl font-semibold text-stone-900 tracking-tight mb-2">
              Pengajuan Reservasi ALYATAMA HOMESTAY
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Silakan lengkapi formulir di bawah ini. Permintaan Anda akan segera diverifikasi oleh admin homestay untuk memastikan ketersediaan kamar secara akurat sebelum konfirmasi pembayaran.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Column (2 Cols) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
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
                  {/* Bagian 1: Data Tamu */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-100 mb-4">
                      1. Informasi Tamu Utama
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Nama Lengkap Tamu <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Sesuai kartu identitas resmi"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="Contoh: 081234567890"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          <span className="text-[11px] text-stone-500 mt-0.5 block">
                            Untuk konfirmasi persetujuan & instruksi check-in.
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Alamat Email (Opsional)
                          </label>
                          <input
                            type="email"
                            placeholder="email@contoh.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bagian 2: Tanggal & Kamar */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-100 mb-4">
                      2. Jadwal Menginap & Pilihan Kamar
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Tanggal Check-in <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={checkinDate}
                            onChange={(e) => setCheckinDate(e.target.value)}
                            className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          <span className="text-[11px] text-stone-500 mt-0.5 block">
                            Waktu check-in mulai 14:00 WIB.
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Tanggal Check-out <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={checkoutDate}
                            onChange={(e) => setCheckoutDate(e.target.value)}
                            className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          <span className="text-[11px] text-stone-500 mt-0.5 block">
                            Waktu check-out maksimal 12:00 WIB.
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Pilih Unit Kamar <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={roomId}
                          onChange={(e) => setRoomId(e.target.value)}
                          className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                        >
                          {rooms.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} - {r.room_type} ({formatRupiah(r.base_rate)}/mlm)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Tamu Dewasa
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="8"
                            value={adults}
                            onChange={(e) => setAdults(Number(e.target.value))}
                            className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Tamu Anak (di bawah 12 tahun)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="6"
                            value={children}
                            onChange={(e) => setChildren(Number(e.target.value))}
                            className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Kode Promo (Opsional)
                        </label>
                        <input
                          type="text"
                          placeholder="Masukkan kode promo jika ada (contoh: HEMAT3)"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Permintaan Khusus (Opsional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Contoh: Estimasi check-in terlambat pada malam hari, ranjang tambahan, dsb."
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian 3: Persetujuan Eksplisit */}
                  <div className="pt-2 border-t border-stone-100 space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900 mb-2">
                      3. Persetujuan & Kebijakan
                    </h3>

                    {/* Consent 1: Data Processing (Mandatory) */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="dataConsent"
                        checked={dataConsent}
                        onChange={(e) => setDataConsent(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                      />
                      <label htmlFor="dataConsent" className="text-xs text-stone-700 leading-relaxed">
                        <span className="font-semibold text-stone-900">Persetujuan Pemrosesan Data:</span> Saya menyatakan data yang diberikan adalah benar dan menyetujui pemrosesan data untuk keperluan verifikasi reservasi sesuai{' '}
                        <Link href="/kebijakan" target="_blank" className="text-brand-700 underline font-medium">
                          Tata Tertib & Kebijakan Homestay
                        </Link>.
                      </label>
                    </div>

                    {/* Consent 2: WhatsApp Sending (Separate Consent) */}
                    <div className="flex items-start gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                      <input
                        type="checkbox"
                        id="whatsappConsent"
                        checked={whatsappConsent}
                        onChange={(e) => setWhatsappConsent(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                      />
                      <label htmlFor="whatsappConsent" className="text-xs text-stone-700 leading-relaxed">
                        <span className="font-semibold text-stone-900">Persetujuan Pengiriman Bukti via WhatsApp:</span> Saya setuju menerima ringkasan pemesanan, tautan bukti reservasi, dan instruksi pembayaran secara manual melalui nomor WhatsApp yang saya daftarkan.
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-stone-400 text-white font-medium text-sm py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Memproses Pengajuan...' : 'Ajukan Permintaan Reservasi Sekarang'}
                    {!submitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </div>

            {/* Summary Column (1 Col) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm sticky top-28 space-y-6">
                <div>
                  <h3 className="font-serif font-semibold text-base text-stone-900 mb-1">
                    Ringkasan Pemesanan
                  </h3>
                  <p className="text-xs text-stone-500">
                    Estimasi biaya sebelum persetujuan admin.
                  </p>
                </div>

                {selectedRoom ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
                      <span className="text-[11px] text-stone-500 block">Kamar Pilihan</span>
                      <strong className="text-sm font-semibold text-stone-900 block">
                        {selectedRoom.name}
                      </strong>
                      <span className="text-stone-600">{selectedRoom.room_type}</span>
                    </div>

                    <div className="space-y-2 py-2 border-y border-stone-100 text-stone-600">
                      <div className="flex justify-between">
                        <span>Check-in:</span>
                        <span className="font-medium text-stone-900">{formatDateIndo(checkinDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Check-out:</span>
                        <span className="font-medium text-stone-900">{formatDateIndo(checkoutDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Durasi:</span>
                        <span className="font-medium text-stone-900">{totalNights} Malam</span>
                      </div>
                    </div>

                    {dynamicPricing && (
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between text-stone-600">
                          <span>Subtotal Kamar:</span>
                          <span className="font-medium text-stone-900">
                            {formatRupiah(dynamicPricing.baseSubtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold text-stone-900 text-sm pt-2 border-t border-stone-100">
                          <span>Total Estimasi:</span>
                          <span className="text-brand-700">
                            {formatRupiah(dynamicPricing.totalAmount)}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-200 leading-relaxed">
                          *Setelah admin menyetujui ketersediaan kamar, Anda akan menerima instruksi untuk pembayaran deposit/uang muka sebesar 50% ({formatRupiah(dynamicPricing.depositRequired)}) guna mengunci reservasi.
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
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center text-xs text-stone-500">Memuat formulir pemesanan...</div>}>
      <BookingContent />
    </Suspense>
  );
}
