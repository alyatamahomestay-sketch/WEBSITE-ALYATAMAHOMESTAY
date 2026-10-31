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
  Sparkles,
  Calendar
} from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import { PmsService } from '@/lib/services/pms-service';
import { Reservation, PropertySettings, PaymentMethod } from '@/lib/types';
import { downloadReservationSlipJpg, getGuestToAdminWhatsAppUrl } from '@/lib/services/slip-image-generator';
import { Download, MessageSquare } from 'lucide-react';
import { 
  formatRupiah, 
  formatDateIndo, 
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
  const [propertySettings, setPropertySettings] = useState<PropertySettings | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [downloadingJpg, setDownloadingJpg] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [prop, pm] = await Promise.all([
          PmsService.getPropertySettings(),
          PmsService.getPaymentMethods(),
        ]);
        setPropertySettings(prop);
        setPaymentMethods(pm);
      } catch (e) {}
    }
    loadMeta();
  }, []);

  const handleDownloadJpg = async () => {
    if (!reservation) return;
    setDownloadingJpg(true);
    try {
      const res = await downloadReservationSlipJpg(reservation, propertySettings, paymentMethods);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 6000);
    } catch (err: any) {
      alert(`Gagal mengunduh gambar bukti reservasi: ${err?.message || err}`);
    } finally {
      setDownloadingJpg(false);
    }
  };

  const adminWaUrl = reservation
    ? getGuestToAdminWhatsAppUrl({ reservation, propertySettings })
    : '#';

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
        setNotFoundMessage('Nomor reservasi tidak ditemukan. Pastikan format nomor sudah tepat (contoh: ALY-20261026-001).');
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
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <PublicNavbar />

      <main className="flex-1 bg-[#F6F0E7] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 bg-[#806044]/15 text-[#806044] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pelacakan Status & Bukti Pemesanan</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#392B21] tracking-tight mb-2">
              Lacak Status Reservasi
            </h1>
            <p className="text-xs sm:text-sm text-[#756A5F]">
              Masukkan nomor pemesanan resmi Anda untuk memantau status persetujuan admin dan tagihan pembayaran.
            </p>
          </div>

          {/* Submission Success Banner */}
          {isJustSubmitted && (
            <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-start gap-4 text-emerald-900 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-emerald-950">
                  Permintaan Reservasi Berhasil Diterima!
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Permintaan Anda telah masuk ke antrean admin dengan nomor <strong>{reservationNumber}</strong>. Admin homestay akan segera memverifikasi ketersediaan kamar secara atomik. Jika Anda menyetujui pengiriman WhatsApp, staf kami akan mengirimkan instruksi pembayaran uang muka (deposit).
                </p>
              </div>
            </div>
          )}

          {/* Search Box */}
          <div className="bg-white rounded-3xl border border-[#E5DCD0] p-6 sm:p-8 shadow-sm mb-8">
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
                  placeholder="Masukkan Nomor Reservasi (contoh: ALY-20261026-001)"
                  value={reservationNumber}
                  onChange={(e) => setReservationNumber(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] pl-4 pr-10 py-3 uppercase focus:outline-none focus:ring-2 focus:ring-[#806044] font-mono tracking-wider bg-[#FAF7F2]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#806044] hover:bg-[#6c5037] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
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
                <div className="bg-white rounded-3xl border border-[#E5DCD0] p-6 sm:p-8 shadow-sm space-y-6">
                  {/* Kirim Bukti Pemesanan ke WhatsApp Admin (.JPG) */}
                  <div className="p-6 bg-[#FAF7F2] border-2 border-[#806044]/40 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#806044]/15 text-[#806044] mb-2">
                          <Sparkles className="w-3.5 h-3.5" />
                          Langkah Wajib Pengunjung
                        </span>
                        <h3 className="font-serif font-bold text-lg sm:text-xl text-[#392B21]">
                          Kirimkan Bukti Pemesanan ke WhatsApp Admin
                        </h3>
                        <p className="text-xs text-[#756A5F] mt-1 leading-relaxed max-w-xl">
                          Silakan unduh file bukti pemesanan berformat <strong>.JPG</strong> di bawah ini, lalu klik tombol WhatsApp untuk diarahkan langsung ke WhatsApp admin resmi ALYATAMA dan lampirkan gambar tersebut.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={handleDownloadJpg}
                        disabled={downloadingJpg}
                        className="inline-flex items-center gap-2 bg-[#392B21] hover:bg-[#231a14] text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition shadow-xs cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-[#C9A84C]" />
                        <span>{downloadingJpg ? 'Menyiapkan Gambar...' : 'Download Bukti Pemesanan (.JPG)'}</span>
                      </button>

                      <a
                        href={adminWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition shadow-xs"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Kirim Bukti via WhatsApp Admin</span>
                      </a>

                      <Link
                        href={`/slip/${reservation.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-[#806044] border border-[#D4C3AD] text-xs font-semibold px-4 py-3 rounded-xl transition shadow-2xs"
                      >
                        <FileText className="w-4 h-4 text-[#806044]" />
                        <span>Buka Slip & PDF</span>
                      </Link>
                    </div>

                    {downloadSuccess && (
                      <div className="p-3 bg-emerald-100/90 border border-emerald-300 rounded-xl text-xs text-emerald-950 flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>File <strong>Bukti-Reservasi-{reservation.reservation_number}.jpg</strong> berhasil diunduh! Klik <strong>Kirim Bukti via WhatsApp Admin</strong> untuk mengirimkannya ke pengelola.</span>
                      </div>
                    )}

                    <div className="text-[11px] text-[#756A5F] flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Nomor WhatsApp Admin Resmi: <strong>{propertySettings?.whatsapp_number || propertySettings?.phone || '0822-8547-2008'}</strong> (Terkoneksi langsung ke menu Pengaturan Properti).</span>
                    </div>
                  </div>

                  {/* Status Badges Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#FAF7F2]">
                    <div>
                      <span className="text-[11px] text-[#756A5F] block font-mono">
                        Nomor Reservasi:
                      </span>
                      <strong className="text-lg sm:text-xl font-mono font-bold text-[#392B21]">
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
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#806044]/15 text-[#806044] border border-[#806044]/30">
                              {reservation.rental_type === 'monthly' ? 'Sewa Bulanan' : reservation.rental_type === 'yearly' ? 'Sewa Tahunan' : 'Sewa Harian'}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Summary Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-3 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0]">
                      <h4 className="font-bold text-[#392B21] uppercase tracking-wider text-[11px]">
                        Rincian Tamu & Kamar
                      </h4>
                      <div className="space-y-1.5 text-[#756A5F]">
                        <p>
                          <span className="text-stone-400">Nama Tamu:</span>{' '}
                          <strong className="text-[#392B21]">{reservation.guest?.full_name}</strong>
                        </p>
                        <p>
                          <span className="text-stone-400">Unit Kamar:</span>{' '}
                          <strong className="text-[#392B21]">{reservation.rooms?.[0]?.name || 'Kamar'}</strong> ({reservation.rooms?.[0]?.room_type})
                        </p>
                        <p>
                          <span className="text-stone-400">Jumlah Tamu:</span>{' '}
                          {reservation.adults} Dewasa{reservation.children > 0 ? `, ${reservation.children} Anak` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0]">
                      <h4 className="font-bold text-[#392B21] uppercase tracking-wider text-[11px]">
                        Jadwal Menginap
                      </h4>
                      <div className="space-y-1.5 text-[#756A5F]">
                        <p>
                          <span className="text-stone-400">Check-in:</span>{' '}
                          <strong className="text-[#392B21]">{formatDateIndo(reservation.checkin_date)}</strong> (Mulai 14:00)
                        </p>
                        <p>
                          <span className="text-stone-400">Check-out:</span>{' '}
                          <strong className="text-[#392B21]">{formatDateIndo(reservation.checkout_date)}</strong> (Maks 12:00)
                        </p>
                        <p>
                          <span className="text-stone-400">Durasi:</span>{' '}
                          <strong className="text-[#806044]">
                            {reservation.duration_units ? `${reservation.duration_units} ${reservation.rental_type === 'monthly' ? 'Bulan' : reservation.rental_type === 'yearly' ? 'Tahun' : 'Malam'}` : `${reservation.price_snapshot?.total_nights || 1} Malam`}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Balance Due */}
                  <div className="p-5 bg-[#392B21] text-[#E7D8C5] rounded-2xl space-y-3 text-xs border border-[#4d3b2e]">
                    <div className="flex justify-between items-center text-stone-300">
                      <span>Total Biaya Menginap:</span>
                      <span className="font-bold text-white text-base">
                        {formatRupiah(reservation.price_snapshot?.total_amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-stone-300">
                      <span>Pembayaran Diterima / Diverifikasi:</span>
                      <span className="font-medium text-emerald-400">
                        {formatRupiah(reservation.price_snapshot?.total_paid || 0)}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-[#4d3b2e] flex justify-between items-center text-sm font-bold">
                      <span>Sisa Tagihan:</span>
                      <span className={reservation.price_snapshot?.balance_due === 0 ? 'text-emerald-400' : 'text-[#C9A84C]'}>
                        {formatRupiah(reservation.price_snapshot?.balance_due)}
                      </span>
                    </div>
                  </div>

                  {/* Action: Open Printable Document Slip */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E5DCD0]">
                    <div className="text-xs text-[#756A5F]">
                      Dapatkan bukti pemesanan atau tanda terima pembayaran resmi:
                    </div>

                    <Link
                      href={`/slip/${reservation.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 bg-[#806044] hover:bg-[#6c5037] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
                    >
                      <FileText className="w-4 h-4 text-[#C9A84C]" />
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
    </div>
  );
}

export default function StatusReservasiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F0E7] flex items-center justify-center text-xs text-[#806044]">Memuat status reservasi...</div>}>
      <StatusReservasiContent />
    </Suspense>
  );
}
