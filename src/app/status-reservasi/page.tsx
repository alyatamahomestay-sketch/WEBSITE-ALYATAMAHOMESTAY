'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode
} from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import { PmsService } from '@/lib/services/pms-service';
import { Reservation } from '@/lib/types';
import { 
  formatRupiah, 
  formatDateIndo, 
  formatDateTimeIndo, 
  getReservationStatusMeta, 
  getPaymentStatusMeta 
} from '@/lib/formatters';

function StatusReservasiContent() {
  const searchParams = useSearchParams();
  const queryResNum = searchParams.get('res_num') || '';
  const isJustSubmitted = searchParams.get('status') === 'submitted';

  const [reservationNumber, setReservationNumber] = useState(queryResNum);
  const [loading, setLoading] = useState(false);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [searched, setSearched] = useState(false);
  const [notFoundMessage, setNotFoundMessage] = useState('');

  const handleSearch = async (numToSearch: string) => {
    if (!numToSearch.trim()) return;
    setLoading(true);
    setNotFoundMessage('');
    setSearched(true);

    try {
      const data = await PmsService.getReservationById(numToSearch.trim().toUpperCase());
      if (data) {
        setReservation(data);
      } else {
        setReservation(null);
        setNotFoundMessage('Nomor reservasi tidak ditemukan. Pastikan format nomor sudah tepat (contoh: ALY-20261025-001).');
      }
    } catch (err: any) {
      setNotFoundMessage('Gagal mencari status reservasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryResNum) {
      handleSearch(queryResNum);
    }
  }, [queryResNum]);

  return (
    <>
      <PublicNavbar />

      <main className="flex-1 bg-stone-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-700 block mb-2">
              Pelacakan Status & Bukti Pemesanan
            </span>
            <h1 className="font-serif text-3xl font-semibold text-stone-900 tracking-tight mb-2">
              Lacak Status Reservasi
            </h1>
            <p className="text-xs text-stone-600">
              Masukkan nomor pemesanan Anda untuk memantau status persetujuan admin dan tagihan pembayaran.
            </p>
          </div>

          {/* Submission Success Banner */}
          {isJustSubmitted && (
            <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4 text-emerald-900">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-emerald-900">
                  Permintaan Reservasi Berhasil Diterima!
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Permintaan Anda telah masuk ke sistem dengan nomor <strong>{reservationNumber}</strong>. Admin homestay akan segera memverifikasi ketersediaan kamar. Jika Anda menyetujui pengiriman WhatsApp, staf kami akan menghubungi Anda dengan rincian instruksi pembayaran.
                </p>
              </div>
            </div>
          )}

          {/* Search Box */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm mb-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(reservationNumber);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="Masukkan Nomor Reservasi (contoh: ALY-20261025-001)"
                  value={reservationNumber}
                  onChange={(e) => setReservationNumber(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 pl-4 pr-10 py-3 uppercase focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono tracking-wider"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs sm:text-sm px-6 py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Mencari...' : 'Cek Status'}
              </button>
            </form>
          </div>

          {/* Search Result */}
          {searched && !loading && (
            <>
              {notFoundMessage && (
                <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center text-xs text-rose-800">
                  {notFoundMessage}
                </div>
              )}

              {reservation && (
                <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-8">
                  {/* Status Badges Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                    <div>
                      <span className="text-[11px] text-stone-500 block font-mono">
                        Nomor Reservasi:
                      </span>
                      <strong className="text-lg sm:text-xl font-mono font-bold text-stone-900">
                        {reservation.reservation_number}
                      </strong>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {(() => {
                        const sMeta = getReservationStatusMeta(reservation.status);
                        const pMeta = getPaymentStatusMeta(reservation.payment_status);
                        return (
                          <>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${sMeta.badgeClass}`}>
                              {sMeta.label}
                            </span>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${pMeta.badgeClass}`}>
                              {pMeta.label}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Summary Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-3 p-4 bg-stone-50 rounded-xl border border-stone-100">
                      <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                        Rincian Tamu & Kamar
                      </h4>
                      <div className="space-y-1.5 text-stone-600">
                        <p>
                          <span className="text-stone-400">Nama Tamu:</span>{' '}
                          <strong className="text-stone-900">{reservation.guest?.full_name}</strong>
                        </p>
                        <p>
                          <span className="text-stone-400">Unit Kamar:</span>{' '}
                          <strong className="text-stone-900">{reservation.rooms?.[0]?.name || 'Kamar'}</strong>
                        </p>
                        <p>
                          <span className="text-stone-400">Jumlah Tamu:</span>{' '}
                          {reservation.adults} Dewasa{reservation.children > 0 ? `, ${reservation.children} Anak` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 bg-stone-50 rounded-xl border border-stone-100">
                      <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                        Jadwal Menginap
                      </h4>
                      <div className="space-y-1.5 text-stone-600">
                        <p>
                          <span className="text-stone-400">Check-in:</span>{' '}
                          <strong className="text-stone-900">{formatDateIndo(reservation.checkin_date)}</strong> (Mulai 14:00)
                        </p>
                        <p>
                          <span className="text-stone-400">Check-out:</span>{' '}
                          <strong className="text-stone-900">{formatDateIndo(reservation.checkout_date)}</strong> (Maks 12:00)
                        </p>
                        <p>
                          <span className="text-stone-400">Durasi:</span>{' '}
                          <strong className="text-stone-900">{reservation.price_snapshot?.total_nights || 1} Malam</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Balance Due */}
                  <div className="p-5 bg-stone-900 text-stone-100 rounded-xl space-y-3 text-xs">
                    <div className="flex justify-between items-center text-stone-300">
                      <span>Total Biaya Menginap:</span>
                      <span className="font-semibold text-stone-100 text-sm">
                        {formatRupiah(reservation.price_snapshot?.total_amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-stone-300">
                      <span>Pembayaran Diterima / Diverifikasi:</span>
                      <span className="font-medium text-emerald-400">
                        {formatRupiah(reservation.price_snapshot?.total_paid || 0)}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-stone-800 flex justify-between items-center text-sm font-semibold">
                      <span>Sisa Tagihan:</span>
                      <span className={reservation.price_snapshot?.balance_due === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                        {formatRupiah(reservation.price_snapshot?.balance_due)}
                      </span>
                    </div>
                  </div>

                  {/* Action: Open Printable Document Slip */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
                    <div className="text-xs text-stone-500">
                      Dapatkan bukti pemesanan atau tanda terima pembayaran resmi:
                    </div>

                    <Link
                      href={`/slip/${reservation.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                    >
                      <FileText className="w-4 h-4 text-brand-400" />
                      Buka & Cetak Bukti Reservasi
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </>
  );
}

export default function StatusReservasiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center text-xs text-stone-500">Memuat status reservasi...</div>}>
      <StatusReservasiContent />
    </Suspense>
  );
}
