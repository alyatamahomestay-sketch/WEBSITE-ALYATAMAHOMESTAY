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
  Calendar,
  Download,
  MessageSquare,
  Banknote,
  Building2,
  MapPin,
  Phone,
  User,
  QrCode
} from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import { PmsService } from '@/lib/services/pms-service';
import { Reservation, PropertySettings, PaymentMethod } from '@/lib/types';
import { downloadReservationSlipJpg, getGuestToAdminWhatsAppUrl } from '@/lib/services/slip-image-generator';
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
      await downloadReservationSlipJpg(reservation, propertySettings, paymentMethods);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 7000);
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
    const cleanNum = numToSearch.trim().toUpperCase();
    if (!cleanNum) return;
    setLoading(true);
    setNotFoundMessage('');
    setSearched(true);

    try {
      // 1. Cek langsung endpoint server API
      const res = await fetch(`/api/panel/reservations?id=${encodeURIComponent(cleanNum)}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.reservation) {
          setReservation(json.reservation);
          setLoading(false);
          return;
        }
      }

      // 2. Cek PMS service
      const data = await PmsService.getReservationById(cleanNum);
      if (data) {
        setReservation(data);
        setLoading(false);
        return;
      }

      // 3. Fallback instan jika baru saja dibuat di browser ini
      if (typeof window !== 'undefined') {
        try {
          const lastSub = localStorage.getItem('last_submitted_reservation');
          if (lastSub) {
            const parsed = JSON.parse(lastSub);
            if (
              parsed &&
              (parsed.reservation_number?.toUpperCase() === cleanNum || parsed.id?.toUpperCase() === cleanNum)
            ) {
              setReservation(parsed);
              setLoading(false);
              return;
            }
          }
        } catch (e) {}
      }

      setReservation(null);
      setNotFoundMessage(`Nomor reservasi "${cleanNum}" tidak ditemukan. Pastikan format nomor sudah tepat (contoh: ALY-20261101-001 atau ALY-20261101-4557).`);
    } catch (err: any) {
      setNotFoundMessage('Gagal mencari status reservasi. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryResNum) {
      setReservationNumber(queryResNum);
      handleSearch(queryResNum);
    }
  }, [queryResNum]);

  // Payment preference helper
  const getPaymentPreferenceDisplay = (res: Reservation) => {
    if (res.payment_preference === 'transfer' || res.special_requests?.includes('Transfer')) {
      return {
        label: 'Transfer ke Rekening Homestay',
        type: 'transfer',
        icon: CreditCard,
        color: 'text-blue-800 bg-blue-50 border-blue-200',
      };
    }
    return {
      label: 'Bayar Tunai / Cash di Tempat',
      type: 'cash',
      icon: Banknote,
      color: 'text-amber-900 bg-amber-50 border-amber-200',
    };
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      <PublicNavbar />

      <main className="flex-1 bg-[#F6F0E7] py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 bg-[#806044]/15 text-[#806044] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pelacakan Status & Bukti Pemesanan Resmi</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#392B21] tracking-tight mb-2">
              Pelacakan Status & Bukti Pemesanan
            </h1>
            <p className="text-xs sm:text-sm text-[#756A5F]">
              Cek status persetujuan admin dan unduh bukti pemesanan resmi Anda untuk ditunjukkan saat tiba di ALYATAMA HOMESTAY.
            </p>
          </div>

          {/* Submission Success Banner */}
          {isJustSubmitted && (
            <div className="mb-6 p-5 sm:p-6 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-start gap-4 text-emerald-900 shadow-sm animate-in fade-in">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-emerald-950">
                  Permintaan Reservasi Berhasil Diajukan!
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Permintaan Anda telah tersimpan dengan nomor antrean resmi <strong>{reservationNumber}</strong>. Kartu bukti pemesanan visual Anda telah dibuat di bawah ini. Silakan unduh gambar <strong>.JPG</strong> bukti pemesanan atau kirimkan ke WhatsApp admin.
                </p>
              </div>
            </div>
          )}

          {/* Search Box */}
          <div className="bg-white rounded-3xl border border-[#E5DCD0] p-6 shadow-sm mb-8">
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
                  placeholder="Masukkan Nomor Reservasi (contoh: ALY-20261101-001)"
                  value={reservationNumber}
                  onChange={(e) => setReservationNumber(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-[#E5DCD0] pl-4 pr-10 py-3 uppercase focus:outline-none focus:ring-2 focus:ring-[#806044] font-mono tracking-wider bg-[#FAF7F2]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#806044] hover:bg-[#6c5037] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Mencari...' : 'Cek Status'}
              </button>
            </form>

            {/* Quick Helper */}
            {!reservation && !loading && (
              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-[#756A5F]">
                <span>Contoh nomor antrean aktif:</span>
                <button
                  type="button"
                  onClick={() => {
                    setReservationNumber('ALY-20261101-4557');
                    handleSearch('ALY-20261101-4557');
                  }}
                  className="text-[#806044] font-mono font-bold hover:underline cursor-pointer"
                >
                  ALY-20261101-4557 (Klik untuk Uji Coba)
                </button>
              </div>
            )}
          </div>

          {/* Search Result */}
          {searched && !loading && notFoundMessage && (
            <div className="mb-8 bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center text-xs text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 mx-auto mb-2" />
              <span>{notFoundMessage}</span>
            </div>
          )}

          {/* CARD TAMPILAN BUKTI PEMESANAN RESMI YANG DAPAT DIDOWNLOAD */}
          {reservation && (
            <div className="space-y-6">
              
              {/* Action Buttons Bar */}
              <div className="bg-[#392B21] text-white rounded-3xl p-6 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#C9A84C]/20 text-[#E7D8C5] mb-1.5">
                      <Sparkles className="w-3 h-3 text-[#C9A84C]" />
                      Bukti Pemesanan Resmi ALYATAMA HOMESTAY
                    </span>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                      Unduh & Simpan Bukti Pemesanan Anda
                    </h3>
                    <p className="text-xs text-[#D4C3AD] mt-1 max-w-xl leading-relaxed">
                      Klik tombol di bawah untuk mengunduh gambar bukti reservasi resmi berformat <strong>.JPG</strong> kualitas tinggi atau kirimkan langsung ke WhatsApp admin homestay.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      onClick={handleDownloadJpg}
                      disabled={downloadingJpg}
                      className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b5953e] text-[#231a14] text-xs font-bold px-4 py-3 rounded-xl transition shadow-sm cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloadingJpg ? 'Menyiapkan Gambar...' : 'Download Bukti Pemesanan (.JPG)'}</span>
                    </button>

                    <a
                      href={adminWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-3 rounded-xl transition shadow-sm cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Kirim ke WhatsApp Admin</span>
                    </a>

                    <Link
                      href={`/slip/${reservation.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-3 rounded-xl transition cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Slip PDF</span>
                    </Link>
                  </div>
                </div>

                {downloadSuccess && (
                  <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Gambar <strong>Bukti-Reservasi-{reservation.reservation_number}.jpg</strong> berhasil diunduh ke perangkat Anda!</span>
                  </div>
                )}
              </div>

              {/* VISUAL KARTU BUKTI PEMESANAN (E-TICKET / SLIP HOMESTAY) */}
              <div className="bg-white rounded-3xl border-2 border-[#806044]/30 shadow-md overflow-hidden">
                
                {/* Header Kartu */}
                <div className="bg-gradient-to-r from-[#392B21] via-[#4d3b2e] to-[#392B21] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#806044]/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#FAF7F2]">
                        ALYATAMA HOMESTAY
                      </span>
                      <span className="bg-[#C9A84C] text-[#392B21] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                        Syariah
                      </span>
                    </div>
                    <p className="text-xs text-[#D4C3AD] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
                      Jl. Mayor Ali Rasyid No 19 Bangkinang Kota (Belakang SPBU Bangkinang)
                    </p>
                  </div>

                  <div className="bg-white/10 border border-white/20 rounded-2xl p-3 text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#D4C3AD] block">
                      Nomor Antrean Reservasi
                    </span>
                    <strong className="text-base sm:text-lg font-mono font-bold text-[#FAF7F2]">
                      {reservation.reservation_number}
                    </strong>
                  </div>
                </div>

                {/* Status Badges Row */}
                <div className="bg-[#FAF7F2] px-6 sm:px-8 py-3.5 border-b border-[#E5DCD0] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {(() => {
                      const sMeta = getReservationStatusMeta(reservation.status);
                      const pMeta = getPaymentStatusMeta(reservation.payment_status);
                      return (
                        <>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${sMeta.badgeClass}`}>
                            Status: {sMeta.label}
                          </span>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${pMeta.badgeClass}`}>
                            Pembayaran: {pMeta.label}
                          </span>
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#806044]/15 text-[#806044] border border-[#806044]/30">
                            Sewa {reservation.rental_type === 'monthly' ? 'Bulanan' : 'Harian'}
                          </span>
                        </>
                      );
                    })()}
                  </div>

                  <div className="text-[11px] text-[#756A5F]">
                    Dibuat: {new Date(reservation.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Body Details Grid */}
                <div className="p-6 sm:p-8 space-y-6">
                  
                  {/* Grid 2 Kolom: Tamu & Jadwal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    
                    {/* Kolom Kiri: Tamu & Kamar */}
                    <div className="space-y-3 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0]">
                      <h4 className="font-bold text-[#392B21] uppercase tracking-wider text-[11px] pb-2 border-b border-[#E5DCD0]">
                        Informasi Tamu & Kamar
                      </h4>
                      <div className="space-y-2 text-[#756A5F]">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Nama Tamu:</span>
                          <strong className="text-[#392B21] text-right">{reservation.guest?.full_name || '-'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Nomor WhatsApp:</span>
                          <span className="font-mono font-medium text-[#392B21]">{reservation.guest?.phone || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Unit Kamar:</span>
                          <strong className="text-[#806044]">{reservation.rooms?.[0]?.name || 'Kamar'} ({reservation.rooms?.[0]?.room_type})</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Kapasitas Tamu:</span>
                          <span className="text-[#392B21]">{reservation.adults} Dewasa{reservation.children > 0 ? `, ${reservation.children} Anak` : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Kolom Kanan: Jadwal Menginap */}
                    <div className="space-y-3 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0]">
                      <h4 className="font-bold text-[#392B21] uppercase tracking-wider text-[11px] pb-2 border-b border-[#E5DCD0]">
                        Jadwal & Waktu Menginap
                      </h4>
                      <div className="space-y-2 text-[#756A5F]">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Tanggal Check-in:</span>
                          <strong className="text-[#392B21]">{formatDateIndo(reservation.checkin_date)}</strong>
                        </div>
                        <div className="flex justify-between text-[11px] text-stone-500">
                          <span>Waktu Check-in:</span>
                          <span>Mulai pukul 14:00 WIB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Tanggal Check-out:</span>
                          <strong className="text-[#392B21]">{formatDateIndo(reservation.checkout_date)}</strong>
                        </div>
                        <div className="flex justify-between text-[11px] text-stone-500">
                          <span>Waktu Check-out:</span>
                          <span>Maksimal pukul 12:00 WIB</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-dashed border-[#E5DCD0]">
                          <span className="text-stone-500">Total Durasi:</span>
                          <strong className="text-[#806044]">
                            {reservation.duration_units ? `${reservation.duration_units} ${reservation.rental_type === 'monthly' ? 'Bulan' : 'Malam'}` : `${reservation.price_snapshot?.total_nights || 1} Malam`}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KOTAK METODE PEMBAYARAN & KETENTUAN TRANSAKSI */}
                  {(() => {
                    const payPref = getPaymentPreferenceDisplay(reservation);
                    const PayIcon = payPref.icon;
                    return (
                      <div className={`p-5 rounded-2xl border ${payPref.color} space-y-2`}>
                        <div className="flex items-center gap-2">
                          <PayIcon className="w-5 h-5 text-[#806044] shrink-0" />
                          <h4 className="font-bold text-sm text-[#392B21]">
                            Metode Pembayaran Ditentukan: <span className="underline">{payPref.label}</span>
                          </h4>
                        </div>
                        <p className="text-xs leading-relaxed text-[#756A5F]">
                          <strong className="text-[#392B21]">Ketentuan Transaksi:</strong> Seluruh transaksi pembayaran (baik secara Tunai maupun Transfer Bank) dilakukan <span className="font-bold text-[#806044]">saat sebelum serah terima kunci</span> oleh petugas homestay saat Anda tiba di lokasi ALYATAMA HOMESTAY.
                        </p>
                      </div>
                    );
                  })()}

                  {/* Rincian Biaya */}
                  <div className="p-5 bg-[#392B21] text-[#E7D8C5] rounded-2xl space-y-3 text-xs border border-[#4d3b2e]">
                    <div className="flex justify-between items-center text-stone-300">
                      <span>Total Biaya Sewa ({reservation.duration_units ? `${reservation.duration_units} ${reservation.rental_type === 'monthly' ? 'Bulan' : 'Malam'}` : '1 Periode'}):</span>
                      <span className="font-bold text-white text-base">
                        {formatRupiah(reservation.price_snapshot?.total_amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-stone-300">
                      <span>Uang Muka / Deposit Diperlukan:</span>
                      <span className="font-medium text-[#C9A84C]">
                        {formatRupiah(reservation.price_snapshot?.deposit_required || ((reservation.price_snapshot?.total_amount || 0) * 0.5))}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-[#4d3b2e] flex justify-between items-center text-sm font-bold">
                      <span>Sisa Pembayaran Saat Tiba:</span>
                      <span className={reservation.price_snapshot?.balance_due === 0 ? 'text-emerald-400' : 'text-[#FAF7F2]'}>
                        {formatRupiah(reservation.price_snapshot?.balance_due ?? reservation.price_snapshot?.total_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Footer Kartu Bukti */}
                  <div className="pt-3 border-t border-[#E5DCD0] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#756A5F]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#806044] shrink-0" />
                      <span>Dokumen bukti reservasi resmi sistem ALYATAMA HOMESTAY Bangkinang Kota.</span>
                    </div>
                    <div className="font-mono text-stone-400">
                      ID: {reservation.id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
