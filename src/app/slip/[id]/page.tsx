import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck, QrCode, CreditCard } from 'lucide-react';
import AlyatamaLogo from '@/components/common/AlyatamaLogo';
import { PmsService } from '@/lib/services/pms-service';
import { 
  formatRupiah, 
  formatDateIndo, 
  formatDateTimeIndo, 
  getReservationStatusMeta, 
  getPaymentStatusMeta 
} from '@/lib/formatters';

interface SlipPageProps {
  params: { id: string };
}

export const revalidate = 0;

export default async function SlipPage({ params }: SlipPageProps) {
  const reservation = await PmsService.getReservationById(params.id);
  const property = await PmsService.getPropertySettings();
  const paymentMethods = await PmsService.getPaymentMethods();

  if (!reservation) {
    notFound();
  }

  const qrisMethod = paymentMethods.find((pm) => pm.code === 'qris' && pm.is_active);
  const bankMethod = paymentMethods.find((pm) => pm.code === 'bank_transfer' && pm.is_active);

  const priceSnapshot = reservation.price_snapshot;
  const isPaid = reservation.payment_status === 'paid';
  const isApproved = reservation.status === 'confirmed' || reservation.status === 'approved_pending_payment' || reservation.status === 'checked_in' || reservation.status === 'checked_out';

  return (
    <div className="min-h-screen bg-stone-100 py-6 sm:py-12 print:bg-white print:py-0 text-stone-900 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Print & Back Controls (Hidden in Print) */}
        <div className="no-print mb-6 flex items-center justify-between gap-4">
          <Link
            href={`/status-reservasi?res_num=${reservation.reservation_number}`}
            className="text-xs text-stone-600 hover:text-stone-900 font-medium inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Status Reservasi
          </Link>

          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
            className="bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4 text-brand-400" />
            Cetak / Simpan PDF
          </button>
        </div>

        {/* Official Document Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 sm:p-12 print:border-none print:shadow-none print:p-0 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-stone-200">
            <div>
              <AlyatamaLogo variant="dark" size="lg" className="mb-2" />
              <p className="text-xs text-stone-600 max-w-sm leading-relaxed mt-1">
                Jl. Mayor Ali Rasyid No 19 Bangkinang Kota, Panti Asuhan Putra Muhammadiyah, Kabupaten Kampar, Riau 28411
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Telp/WA: 0822 8547 2008 | Syariah & Berkah
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-xs uppercase font-semibold px-2.5 py-1 rounded bg-stone-100 text-stone-800 inline-block">
                {isPaid ? 'BUKTI PEMBAYARAN LUNAS' : isApproved ? 'INVOICE & KONFIRMASI' : 'BUKTI PERMINTAAN RESERVASI'}
              </span>
              <div className="text-xs text-stone-500 pt-1">
                No. Reservasi: <strong className="font-mono text-stone-900">{reservation.reservation_number}</strong>
              </div>
              <div className="text-[11px] text-stone-400">
                Diterbitkan: {formatDateTimeIndo(new Date())}
              </div>
            </div>
          </div>

          {/* Guest & Reservation Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                Ditujukan Kepada Tamu:
              </span>
              <strong className="text-sm font-semibold text-stone-900 block">
                {reservation.guest?.full_name}
              </strong>
              <div className="text-stone-600">WhatsApp: {reservation.guest?.phone}</div>
              {reservation.guest?.email && (
                <div className="text-stone-600">Email: {reservation.guest.email}</div>
              )}
            </div>

            <div className="space-y-1.5 sm:text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                Detail Menginap:
              </span>
              <div className="text-stone-700">
                Unit: <strong className="text-stone-900">{reservation.rooms?.[0]?.name || 'Kamar'}</strong> ({reservation.rooms?.[0]?.room_type})
              </div>
              <div className="text-stone-700">
                Check-in: <strong className="text-stone-900">{formatDateIndo(reservation.checkin_date)}</strong> (14:00)
              </div>
              <div className="text-stone-700">
                Check-out: <strong className="text-stone-900">{formatDateIndo(reservation.checkout_date)}</strong> (12:00)
              </div>
              <div className="text-stone-700">
                Durasi: <strong>{priceSnapshot?.total_nights || 1} Malam</strong> • Tamu: {reservation.adults} Dws{reservation.children > 0 ? `, ${reservation.children} Anak` : ''}
              </div>
            </div>
          </div>

          {/* Pricing Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Deskripsi Layanan</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Durasi</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Tarif Rata-Rata</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="py-3 px-4">
                    <strong className="text-stone-900 block">{reservation.rooms?.[0]?.name || 'Sewa Kamar Homestay'}</strong>
                    <span className="text-stone-500 text-[11px]">
                      Periode {formatDateIndo(reservation.checkin_date)} s/d {formatDateIndo(reservation.checkout_date)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">{priceSnapshot?.total_nights || 1} Malam</td>
                  <td className="py-3 px-4 text-right">
                    {formatRupiah(priceSnapshot?.base_subtotal ? priceSnapshot.base_subtotal / (priceSnapshot.total_nights || 1) : 0)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatRupiah(priceSnapshot?.base_subtotal)}
                  </td>
                </tr>

                {priceSnapshot?.discount_amount ? (
                  <tr className="text-emerald-700 bg-emerald-50/40">
                    <td colSpan={3} className="py-2 px-4 text-left">
                      Potongan Diskon ({priceSnapshot.discount_reason || 'Promo'})
                    </td>
                    <td className="py-2 px-4 text-right font-medium">
                      -{formatRupiah(priceSnapshot.discount_amount)}
                    </td>
                  </tr>
                ) : null}

                {priceSnapshot?.extra_charges ? (
                  <tr>
                    <td colSpan={3} className="py-2 px-4 text-left text-stone-600">
                      Biaya Tambahan Lainnya
                    </td>
                    <td className="py-2 px-4 text-right font-medium text-stone-900">
                      +{formatRupiah(priceSnapshot.extra_charges)}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            <div className="space-y-2 text-xs text-stone-600 max-w-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                Catatan Penting:
              </span>
              <p className="leading-relaxed">
                Tamu wajib mematuhi waktu check-in (14:00) dan check-out (12:00). Dokumen ini diterbitkan oleh sistem ALYATAMA HOMESTAY.
              </p>
              {reservation.deposit && reservation.deposit.required_amount > 0 && (
                <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-[11px]">
                  <strong>Uang Muka / Deposit:</strong> {formatRupiah(reservation.deposit.required_amount)} (Status: {reservation.deposit.status})
                </div>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between py-1 text-stone-600">
                <span>Total Biaya:</span>
                <span className="font-semibold text-stone-900">{formatRupiah(priceSnapshot?.total_amount)}</span>
              </div>
              <div className="flex justify-between py-1 text-stone-600">
                <span>Pembayaran Diterima:</span>
                <span className="font-medium text-emerald-700">{formatRupiah(priceSnapshot?.total_paid || 0)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                <span>Sisa Tagihan:</span>
                <span className={priceSnapshot?.balance_due === 0 ? 'text-emerald-700' : 'text-stone-900'}>
                  {formatRupiah(priceSnapshot?.balance_due)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Instructions & QRIS (If balance remains) */}
          {!isPaid && (
            <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-brand-600" />
                Instruksi Pembayaran Resmi
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-stone-700">
                {/* QRIS Instructions */}
                {qrisMethod && (
                  <div className="space-y-3 p-4 bg-white rounded-lg border border-stone-200">
                    <strong className="font-semibold text-stone-900 block flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-brand-700" />
                      1. Scan QRIS Resmi ALYATAMA
                    </strong>
                    {qrisMethod.qris_image_url ? (
                      <div className="w-40 h-40 bg-white border border-stone-300 p-2 rounded-lg mx-auto overflow-hidden">
                        <img
                          src={qrisMethod.qris_image_url}
                          alt="QRIS ALYATAMA HOMESTAY"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <p className="text-[11px] text-stone-500 italic">
                        Gambar QRIS sedang disiapkan oleh admin.
                      </p>
                    )}
                    <p className="text-[11px] text-stone-500 text-center leading-tight">
                      Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay.
                    </p>
                  </div>
                )}

                {/* Bank Transfer Instructions */}
                {bankMethod && (
                  <div className="space-y-3 p-4 bg-white rounded-lg border border-stone-200">
                    <strong className="font-semibold text-stone-900 block">
                      2. Transfer Rekening Bank
                    </strong>
                    <div className="p-3 bg-stone-50 rounded border border-stone-200 font-mono text-[11px] text-stone-800 whitespace-pre-line leading-relaxed">
                      {bankMethod.instructions || 'Bank BCA: 123-456-7890 a.n ALYATAMA HOMESTAY'}
                    </div>
                    <p className="text-[11px] text-stone-500 leading-tight">
                      Mohon cantumkan No. Reservasi <strong>{reservation.reservation_number}</strong> pada berita transfer.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer signature / verification stamp */}
          <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Dokumen sah terdaftar pada sistem Property Management System ALYATAMA HOMESTAY</span>
            </div>
            <div className="text-right">
              <span>Manajemen ALYATAMA HOMESTAY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
