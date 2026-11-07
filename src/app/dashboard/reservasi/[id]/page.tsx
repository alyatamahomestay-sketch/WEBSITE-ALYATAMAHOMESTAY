'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Printer, 
  MessageSquare, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  DollarSign,
  Building2,
  Copy,
  Check
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { Reservation, PaymentMethod, Promotion } from '@/lib/types';
import { 
  formatRupiah, 
  formatDateIndo, 
  formatDateTimeIndo, 
  getReservationStatusMeta, 
  getPaymentStatusMeta 
} from '@/lib/formatters';
import { prepareManualWhatsAppMessage } from '@/lib/whatsapp';
import { showAdminToast } from '@/components/common/AdminToast';

interface Props {
  params: { id: string };
}

export default function ReservationDetailPage({ params }: Props) {
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Payment form state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState('qris');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [qrisVerified, setQrisVerified] = useState(false);
  const [transferVerified, setTransferVerified] = useState(false);
  const [copiedRekening, setCopiedRekening] = useState(false);

  // Promo state
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromoId, setSelectedPromoId] = useState<string>('');
  const [calculatedDiscount, setCalculatedDiscount] = useState<number>(0);

  // Status message
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Payment method derivations
  const isQrisSelected = payMethod.toLowerCase().includes('qris');
  const isTransferSelected = payMethod.toLowerCase().includes('transfer') || payMethod.toLowerCase().includes('bank');

  const qrisMethod = paymentMethods.find((m) => m.code === 'qris' || m.name?.toLowerCase().includes('qris'));
  const qrisImageUrl = qrisMethod?.qris_image_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80';
  const qrisMerchantName = qrisMethod?.account_name || 'ALYATAMA HOMESTAY';

  const bankMethod = paymentMethods.find((m) => m.code === 'bank_transfer' || m.code?.includes('transfer') || m.name?.toLowerCase().includes('transfer'));
  const bankAccountName = bankMethod?.account_name || 'ALYATAMA HOMESTAY';
  const bankAccountNumber = bankMethod?.account_number || '712-854-7200 (BSI)';
  const bankName = bankMethod?.name || 'Bank Syariah Indonesia (BSI)';
  const bankInstructions = bankMethod?.instructions || 'Transfer ke rekening resmi Bank Syariah Indonesia (BSI): 712-854-7200 a.n ALYATAMA HOMESTAY.\nSertakan nomor reservasi resmi pada berita transfer.';

  const handleCopyRekening = () => {
    const cleanNumber = bankAccountNumber.replace(/\s*\(.*?\)/g, '').trim();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(cleanNumber || bankAccountNumber);
      setCopiedRekening(true);
      setTimeout(() => setCopiedRekening(false), 2000);
    }
  };

  const getBaseSubtotal = (res: Reservation | null): number => {
    if (!res) return 0;
    const snap = res.price_snapshot;
    if (snap?.base_subtotal && snap.base_subtotal > 0) {
      return snap.base_subtotal;
    }
    if (snap?.total_amount && snap.total_amount > 0) {
      return snap.total_amount + (snap.discount_amount || 0);
    }
    const rate = res.rooms?.[0]?.base_rate || 150000;
    const nights = res.duration_units || snap?.total_nights || 1;
    return rate * nights;
  };

  const handlePromoSelect = (promoId: string) => {
    setSelectedPromoId(promoId);
    if (!reservation) return;
    const baseSubtotal = getBaseSubtotal(reservation);
    if (!promoId) {
      setCalculatedDiscount(0);
      setPayAmount(baseSubtotal);
      return;
    }
    const promo = promotions.find((p) => p.id === promoId);
    if (!promo) {
      setCalculatedDiscount(0);
      setPayAmount(baseSubtotal);
      return;
    }

    let discount = 0;
    if (promo.discount_type === 'percentage') {
      discount = Math.round((baseSubtotal * promo.discount_value) / 100);
    } else {
      discount = Math.min(baseSubtotal, promo.discount_value);
    }
    setCalculatedDiscount(discount);
    const netAmount = Math.max(0, baseSubtotal - discount);
    setPayAmount(netAmount);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const resData = await PmsService.getReservationById(params.id);
      setReservation(resData);
      if (resData?.price_snapshot) {
        setPayAmount(resData.price_snapshot.balance_due || 0);
      }
      const methods = await PmsService.getPaymentMethods();
      setPaymentMethods(methods);
      const promos = await PmsService.getPromotions();
      setPromotions(promos.filter((p) => (p as any).is_active !== false));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  if (loading || !reservation) {
    return (
      <div className="text-center py-16 text-stone-400 text-xs">
        Memuat detail reservasi...
      </div>
    );
  }

  const sMeta = getReservationStatusMeta(reservation.status);
  const pMeta = getPaymentStatusMeta(reservation.payment_status);

  // Manual WhatsApp calculation
  const waPayload = prepareManualWhatsAppMessage({
    reservation,
    propertySettings: { name: 'ALYATAMA HOMESTAY' },
    documentSlipUrl: typeof window !== 'undefined' ? `${window.location.origin}/slip/${reservation.id}` : `/slip/${reservation.id}`,
    messageType: reservation.status === 'confirmed' ? 'payment_confirmed' : 'approval_payment_request',
  });

  const handleApprove = async () => {
    if (!confirm('Setujui pemesanan ini?')) return;
    const res = await PmsService.approveReservation(reservation.id);
    if (res.success) {
      showAdminToast('edit', 'Pemesanan telah disetujui.');
      setFeedbackMessage('Pemesanan telah disetujui.');
      loadData();
    } else {
      alert(res.message);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;
    const res = await PmsService.rejectReservation(reservation.id, reason);
    if (res.success) {
      showAdminToast('edit', 'Pemesanan telah ditolak.');
      setFeedbackMessage('Pemesanan telah ditolak.');
      loadData();
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      alert('Nominal pembayaran harus lebih dari 0.');
      return;
    }
    const hasExisting = (reservation.payments && reservation.payments.length > 0) || reservation.payment_status === 'paid';
    if (hasExisting) {
      alert('Pembayaran untuk reservasi ini sudah pernah dicatat sebelumnya. Sistem membatasi pencatatan hanya satu kali transaksi.');
      return;
    }

    if (isQrisSelected && !qrisVerified) {
      alert('Wajib mencentang kotak konfirmasi bahwa pembayaran QRIS tamu telah berhasil masuk / diverifikasi.');
      return;
    }
    if (isTransferSelected && !transferVerified) {
      alert('Wajib mencentang kotak konfirmasi bahwa mutasi / struk transfer bank tamu telah berhasil diverifikasi masuk ke rekening resmi ALYATAMA HOMESTAY.');
      return;
    }

    const selectedPromo = promotions.find((p) => p.id === selectedPromoId);
    let finalNotes = payNotes.trim();
    if (isQrisSelected) {
      finalNotes = finalNotes ? `${finalNotes} [Terverifikasi via QRIS]` : '[Terverifikasi via QRIS]';
    } else if (isTransferSelected) {
      finalNotes = finalNotes ? `${finalNotes} [Terverifikasi via Transfer Bank]` : '[Terverifikasi via Transfer Bank]';
    }

    const res = await PmsService.addPayment({
      reservationId: reservation.id,
      amount: Number(payAmount),
      paymentMethod: payMethod,
      referenceNumber: payRef,
      notes: finalNotes,
      promoId: selectedPromo ? selectedPromo.id : undefined,
      promoCode: selectedPromo ? (selectedPromo.code || selectedPromo.name) : undefined,
      promoName: selectedPromo ? selectedPromo.name : undefined,
      discountAmount: calculatedDiscount > 0 ? calculatedDiscount : undefined,
    });
    if (res.success) {
      setShowPaymentModal(false);
      setQrisVerified(false);
      setTransferVerified(false);
      showAdminToast('add', res.message || 'Pembayaran berhasil dicatat.');
      setFeedbackMessage(res.message);
      loadData();
    } else {
      alert(res.message);
    }
  };

  const handleStatusTransition = async (newStatus: Reservation['status']) => {
    if (!confirm(`Ubah status reservasi menjadi ${newStatus}?`)) return;
    const res = await PmsService.updateReservationStatus(reservation.id, newStatus);
    if (res.success) {
      showAdminToast('edit', res.message || `Status diubah menjadi ${newStatus}`);
      setFeedbackMessage(res.message);
      loadData();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/panel/reservasi"
            className="p-2 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-mono font-bold text-stone-900">
                {reservation.reservation_number}
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${sMeta.badgeClass}`}>
                {sMeta.label}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${pMeta.badgeClass}`}>
                {pMeta.label}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Dibuat pada {formatDateTimeIndo(reservation.created_at)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {reservation.status === 'pending_approval' && (
            <>
              <button
                onClick={handleApprove}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Setujui Pemesanan
              </button>
              <button
                onClick={handleReject}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Tolak
              </button>
            </>
          )}

          {reservation.status === 'confirmed' && (
            <button
              onClick={() => handleStatusTransition('checked_in')}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Proses Check-in Tamu
            </button>
          )}

          {reservation.status === 'checked_in' && (
            <button
              onClick={() => handleStatusTransition('checked_out')}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Proses Check-out Tamu
            </button>
          )}

          <Link
            href={`/slip/${reservation.id}`}
            target="_blank"
            className="bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium px-3.5 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            Cetak Bukti / Invoice
          </Link>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage('')} className="font-bold">&times;</button>
        </div>
      )}

      {/* Main Grid: Details & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details & Pricing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Informasi Tamu & Pemesan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-stone-500 block">Nama Tamu:</span>
                <strong className="text-stone-900 text-sm">{reservation.guest?.full_name}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Nomor WhatsApp:</span>
                <strong className="text-stone-900 text-sm">{reservation.guest?.phone}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Email:</span>
                <span className="text-stone-800">{reservation.guest?.email || '-'}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Kategori Pelanggan:</span>
                <span className="capitalize font-medium text-stone-800">{reservation.guest?.category}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Sistem Pembayaran Dipilih:</span>
                <span className="font-bold text-[#806044]">
                  {reservation.payment_preference === 'transfer' ||
                   (reservation.price_snapshot as any)?.promo_snapshot?.payment_preference === 'transfer' ||
                   String(reservation.special_requests || '').toLowerCase().includes('transfer')
                    ? 'Transfer ke Rekening Homestay'
                    : 'Bayar Tunai / Cash di Tempat'}
                </span>
              </div>
            </div>

            {reservation.special_requests && (
              <div className="pt-3 border-t border-stone-100 text-xs">
                <span className="text-stone-500 font-semibold block mb-0.5">Permintaan Khusus Tamu:</span>
                <p className="text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-100 italic">
                  &ldquo;{reservation.special_requests}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Stay & Room Details */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Unit Kamar & Jadwal Menginap
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-stone-500 block">Unit Kamar:</span>
                <strong className="text-stone-900 text-sm">{reservation.rooms?.[0]?.name}</strong>
                <span className="text-stone-500 text-[11px] block">{reservation.rooms?.[0]?.room_type}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Check-in:</span>
                <strong className="text-stone-900 text-sm">{formatDateIndo(reservation.checkin_date)}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Check-out:</span>
                <strong className="text-stone-900 text-sm">{formatDateIndo(reservation.checkout_date)}</strong>
              </div>
            </div>
          </div>

          {/* Locked Pricing Snapshot Table */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Rincian Finansial Terkunci (Price Snapshot)
              </h3>
              <span className="text-[11px] text-stone-500 font-medium">
                {reservation.price_snapshot?.total_nights} Malam
              </span>
            </div>

            <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Malam Ke- / Tanggal</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Tarif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reservation.price_snapshot?.nightly_breakdown.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3">
                        Malam {idx + 1} ({formatDateIndo(item.date)})
                        {item.is_override && <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">{item.label || 'Tarif Khusus'}</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        {formatRupiah(item.rate)}
                      </td>
                    </tr>
                  ))}
                  {reservation.price_snapshot?.discount_amount ? (
                    <tr className="text-emerald-700 bg-emerald-50/50">
                      <td className="py-2 px-3">Potongan Diskon ({reservation.price_snapshot.discount_reason})</td>
                      <td className="py-2 px-3 text-right font-medium">-{formatRupiah(reservation.price_snapshot.discount_amount)}</td>
                    </tr>
                  ) : null}
                  <tr className="bg-stone-50 font-semibold text-stone-900 border-t border-stone-200">
                    <td className="py-2.5 px-3">Total Biaya Reservasi</td>
                    <td className="py-2.5 px-3 text-right text-brand-700">{formatRupiah(reservation.price_snapshot?.total_amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Balances */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
              <div>
                <span className="text-stone-500">Total Pembayaran Masuk:</span>{' '}
                <strong className="text-emerald-700">{formatRupiah(reservation.price_snapshot?.total_paid || 0)}</strong>
              </div>
              <div>
                <span className="text-stone-500">Sisa Tagihan:</span>{' '}
                <strong className={reservation.price_snapshot?.balance_due === 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  {formatRupiah(reservation.price_snapshot?.balance_due)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Payments & Manual WhatsApp Hub */}
        <div className="lg:col-span-1 space-y-6">
          {/* Payment Actions Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                Pencatatan Pembayaran
              </h3>
              {(reservation.payments && reservation.payments.length > 0) || reservation.payment_status === 'paid' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  1x Transaksi Tercatat (Lunas)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const snap = Array.isArray(reservation.price_snapshot) ? reservation.price_snapshot[0] : reservation.price_snapshot;
                    const defaultAmt = snap?.balance_due != null && snap.balance_due > 0 ? snap.balance_due : (snap?.total_amount || 0);
                    setPayAmount(defaultAmt);
                    setSelectedPromoId('');
                    setCalculatedDiscount(0);
                    setShowPaymentModal(true);
                  }}
                  className="bg-[#355C46] hover:bg-[#284635] text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Catat Pembayaran
                </button>
              )}
            </div>

            {reservation.payments && reservation.payments.length > 0 ? (
              <div className="space-y-2 text-xs">
                {reservation.payments.map((p) => (
                  <div key={p.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-stone-900">{formatRupiah(p.amount)}</strong>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase font-medium">
                        {p.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Metode: {p.payment_method} • {p.reference_number || 'Tanpa Ref'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-stone-400 py-3 text-center">
                Belum ada transaksi pembayaran yang dicatat.
              </div>
            )}
          </div>

          {/* MANUAL WHATSAPP COMMUNICATION CARD (Prompt Section 10) */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Pengiriman WhatsApp Manual
              </h3>
            </div>

            {/* Strict Check on Customer Consent */}
            {waPayload.canSend ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                  <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    Persetujuan Pelanggan Terverifikasi
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-tight">
                    Tamu mencentang izin penerimaan pesan saat reservasi.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-stone-500 text-[11px] font-semibold block">Pratinjau Pesan yang Disiapkan:</span>
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px] text-stone-800 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                    {waPayload.messageText}
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={waPayload.waDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2.5 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-center"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Buka WhatsApp & Kirim Pesan
                  </a>
                  <p className="text-[10px] text-stone-400 text-center mt-2 leading-tight">
                    *Membuka tautan tidak mengklaim otomatis terkirim. Admin memeriksa dan mengirimkan sendiri di aplikasi WhatsApp.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Pengiriman WhatsApp Tidak Diizinkan
                </div>
                <p className="leading-relaxed">
                  {waPayload.reasonIfNotAllowed}
                </p>
                <div className="pt-1 text-[11px] text-stone-500">
                  Sesuai kebijakan privasi, jangan mengirimkan pesan ke nomor pelanggan tanpa persetujuan. Tamu tetap dapat mengakses bukti pemesanan melalui tautan web atau unduhan PDF.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl my-auto flex flex-col max-h-[92vh] overflow-hidden border border-stone-100">
            {/* Header (Fixed) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100 bg-white shrink-0">
              <h3 className="font-semibold text-stone-900 text-sm">Catat Penerimaan Pembayaran</h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleRecordPayment} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl text-[11px] leading-relaxed">
                  <strong>Aturan Transaksi:</strong> Pencatatan pembayaran tamu dibatasi hanya 1 kali transaksi untuk setiap reservasi guna mencegah duplikasi atau pencatatan berlebih.
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    KODE PROMO
                  </label>
                  <select
                    value={selectedPromoId}
                    onChange={(e) => handlePromoSelect(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5 bg-white font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">TIDAK ADA PROMO</option>
                    {promotions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code ? `[${p.code}] ` : ''}{p.name} - Diskon {p.discount_type === 'percentage' ? `${p.discount_value}%` : formatRupiah(p.discount_value)}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Pilihan promo diambil dari data resmi pada menu &quot;Sistem Promo &amp; Diskon Fleksibel&quot;.
                  </p>
                </div>

                {selectedPromoId && calculatedDiscount > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center text-stone-600">
                      <span>Harga Normal (Subtotal):</span>
                      <span className="font-semibold text-stone-800">{formatRupiah(getBaseSubtotal(reservation))}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-700">
                      <span>Potongan Promo:</span>
                      <span className="font-bold">-{formatRupiah(calculatedDiscount)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-emerald-200 font-bold text-emerald-950 text-xs">
                      <span>Total Bersih yang Harus Dibayar:</span>
                      <span>{formatRupiah(getBaseSubtotal(reservation) - calculatedDiscount)}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nominal Pembayaran (Rp)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-stone-300 p-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {calculatedDiscount > 0 && (
                    <p className="text-[10px] text-emerald-700 font-medium mt-1">
                      *Nominal pembayaran otomatis dikalkulasi sesuai potongan harga promo yang ditentukan.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Metode Pembayaran</label>
                  <select
                    value={payMethod}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPayMethod(val);
                      if (!val.toLowerCase().includes('qris')) {
                        setQrisVerified(false);
                      }
                      if (!val.toLowerCase().includes('transfer') && !val.toLowerCase().includes('bank')) {
                        setTransferVerified(false);
                      }
                    }}
                    className="w-full rounded-lg border border-stone-300 p-2.5 bg-white font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="qris">QRIS ALYATAMA HOMESTAY</option>
                    <option value="bank_transfer">Transfer Bank (BSI / BCA / Mandiri)</option>
                    <option value="cash">Tunai (Cash di Resepsionis)</option>
                  </select>
                </div>

                {/* QRIS Image & Verification Checklist (Tampil jika Metode QRIS Dipilih) */}
                {isQrisSelected && (
                  <div className="p-4 bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl space-y-3.5 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-[#355C46] text-white">
                        <CreditCard className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                          Pindai QRIS Resmi ALYATAMA HOMESTAY
                        </h4>
                        <p className="text-[11px] text-stone-600">
                          Tunjukkan gambar QRIS kepada tamu dan pastikan nominal pembayaran tepat sebesar {formatRupiah(payAmount)}.
                        </p>
                      </div>
                    </div>

                    {/* QRIS Display Container */}
                    <div className="bg-white p-4 rounded-xl border border-emerald-200 max-w-xs mx-auto text-center space-y-2 shadow-xs">
                      <img
                        src={qrisImageUrl}
                        alt="QRIS ALYATAMA HOMESTAY"
                        className="w-52 h-52 object-contain mx-auto rounded-lg border border-stone-100 shadow-2xs"
                      />
                      <div className="text-[11px] text-stone-600 font-mono font-medium">
                        NMID / Merchant: {qrisMerchantName}
                      </div>
                      <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200">
                        Nominal: {formatRupiah(payAmount)}
                      </div>
                    </div>

                    {/* Checklist Konfirmasi QRIS (Wajib Dicentang) */}
                    <div className="p-3.5 bg-white border-2 border-emerald-500/60 rounded-xl flex items-start gap-3 shadow-2xs">
                      <input
                        type="checkbox"
                        id="qrisVerifiedCheckboxModal"
                        checked={qrisVerified}
                        onChange={(e) => setQrisVerified(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#355C46] focus:ring-[#355C46] cursor-pointer shrink-0"
                      />
                      <label htmlFor="qrisVerifiedCheckboxModal" className="text-xs text-stone-800 font-semibold leading-relaxed cursor-pointer select-none">
                        Saya mengonfirmasi bahwa tamu telah memindai QRIS dan pembayaran sejumlah <span className="text-[#355C46] font-bold">{formatRupiah(payAmount)}</span> telah berhasil masuk dan terverifikasi pada rekening kasir ALYATAMA HOMESTAY. <span className="text-rose-600">*</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Details & Verification Checklist (Tampil jika Metode Transfer Dipilih) */}
                {isTransferSelected && (
                  <div className="p-4 bg-blue-50/70 border-2 border-blue-300 rounded-2xl space-y-3.5 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-blue-700 text-white">
                        <Building2 className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                          Rekening Resmi Transfer Bank ALYATAMA HOMESTAY
                        </h4>
                        <p className="text-[11px] text-stone-600">
                          Pastikan bukti transfer tamu ditujukan ke nomor rekening resmi homestay dan nominal tepat {formatRupiah(payAmount)}.
                        </p>
                      </div>
                    </div>

                    {/* Bank Account Display Container */}
                    <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-3 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">
                            Nomor Rekening Tujuan ({bankName})
                          </span>
                          <span className="text-base sm:text-lg font-mono font-bold text-stone-900 select-all tracking-wide">
                            {bankAccountNumber}
                          </span>
                          <span className="text-[11px] text-stone-600 block mt-0.5">
                            Atas Nama: <strong className="text-stone-800 font-semibold">{bankAccountName}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyRekening}
                          className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-white border border-blue-300 hover:bg-blue-50 text-blue-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                        >
                          {copiedRekening ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin No. Rek</span>
                            </>
                          )}
                        </button>
                      </div>

                      {bankInstructions && (
                        <div className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200 leading-relaxed whitespace-pre-line">
                          <span className="font-semibold text-stone-700 block mb-0.5">Petunjuk Transfer:</span>
                          {bankInstructions}
                        </div>
                      )}

                      <div className="text-center">
                        <div className="inline-block px-3 py-1 bg-blue-50 text-blue-900 font-bold text-xs rounded-full border border-blue-200">
                          Nominal Transfer: {formatRupiah(payAmount)}
                        </div>
                      </div>
                    </div>

                    {/* Checklist Konfirmasi Transfer Bank (Wajib Dicentang) */}
                    <div className="p-3.5 bg-white border-2 border-blue-500/60 rounded-xl flex items-start gap-3 shadow-2xs">
                      <input
                        type="checkbox"
                        id="transferVerifiedCheckboxModal"
                        checked={transferVerified}
                        onChange={(e) => setTransferVerified(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-stone-300 text-blue-700 focus:ring-blue-700 cursor-pointer shrink-0"
                      />
                      <label htmlFor="transferVerifiedCheckboxModal" className="text-xs text-stone-800 font-semibold leading-relaxed cursor-pointer select-none">
                        Saya mengonfirmasi bahwa tamu telah mentransfer pembayaran sejumlah <span className="text-blue-800 font-bold">{formatRupiah(payAmount)}</span> dan mutasi / struk transfer telah berhasil diverifikasi masuk ke rekening resmi ALYATAMA HOMESTAY. <span className="text-rose-600">*</span>
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nomor Referensi Transaksi (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: QRIS-BCA-987123"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Catatan Staf</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pembayaran deposit 50%"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Sticky Footer Action Buttons */}
              <div className="p-3 sm:p-4 border-t border-stone-100 bg-stone-50/90 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="text-[11px] text-stone-500 text-center sm:text-left">
                  {isQrisSelected && !qrisVerified ? (
                    <span className="text-amber-700 font-medium">*Centang konfirmasi pembayaran QRIS untuk mengaktifkan tombol simpan.</span>
                  ) : isTransferSelected && !transferVerified ? (
                    <span className="text-amber-700 font-medium">*Centang konfirmasi mutasi transfer bank untuk mengaktifkan tombol simpan.</span>
                  ) : (
                    <span>Pencatatan pembayaran akan langsung memperbarui status reservasi.</span>
                  )}
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-700 font-medium transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={(isQrisSelected && !qrisVerified) || (isTransferSelected && !transferVerified)}
                    className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Simpan Pembayaran
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
