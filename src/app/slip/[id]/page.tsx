import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck, QrCode, CreditCard } from 'lucide-react';
import AlyatamaLogo from '@/components/common/AlyatamaLogo';
import SlipActionButtons from '@/components/public/SlipActionButtons';
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

  const priceSnapshot = Array.isArray(reservation.price_snapshot) ? reservation.price_snapshot[0] : reservation.price_snapshot;
  const isPaid = reservation.payment_status === 'paid';
  const isApproved = reservation.status === 'confirmed' || reservation.status === 'approved_pending_payment' || reservation.status === 'checked_in' || reservation.status === 'checked_out';

  const room = reservation.rooms?.[0];
  const roomName = room?.name || 'Unit Kamar Homestay';
  const roomNumber = room?.room_number ? ` (No. ${room.room_number})` : '';
  const roomType = room?.room_type || 'Standar';

  const nights = reservation.duration_units || priceSnapshot?.total_nights || 1;
  const unitLabel = reservation.rental_type === 'monthly' ? 'Bulan' : reservation.rental_type === 'yearly' ? 'Tahun' : 'Malam';

  const baseSubtotal = Number(priceSnapshot?.base_subtotal) || ((room?.base_rate || 200000) * nights);
  const extraCharges = Number(priceSnapshot?.extra_charges) || 0;
  const extraBreakdown = Array.isArray(priceSnapshot?.extra_charges_breakdown) ? priceSnapshot.extra_charges_breakdown : [];
  const discountAmt = Number(priceSnapshot?.discount_amount) || 0;
  const totalAmount = Number(priceSnapshot?.total_amount) || ((baseSubtotal - discountAmt) + extraCharges);
  const totalPaid = Number(priceSnapshot?.total_paid) || (isPaid ? totalAmount : 0);
  const balanceDue = isPaid ? 0 : (priceSnapshot?.balance_due != null ? Number(priceSnapshot.balance_due) : Math.max(0, totalAmount - totalPaid));

  return (
    <div className="min-h-screen bg-stone-100 py-6 sm:py-12 print:bg-white print:py-0 text-stone-900 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <SlipActionButtons
          reservation={reservation}
          propertySettings={property}
          paymentMethods={paymentMethods}
        />

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
                Telp/WA: {property.phone || '0882-7992-7664'} | Syariah & Berkah
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
                Unit: <strong className="text-stone-900">{roomName}{roomNumber}</strong> ({roomType})
              </div>
              <div className="text-stone-700">
                Pilihan Masa Sewa: <strong className="text-stone-900">{reservation.rental_type === 'monthly' ? 'Sewa Bulanan' : reservation.rental_type === 'yearly' ? 'Sewa Tahunan' : 'Sewa Harian'}</strong>
              </div>
              <div className="text-stone-700">
                Check-in: <strong className="text-stone-900">{formatDateIndo(reservation.checkin_date)}</strong> (14:00)
              </div>
              <div className="text-stone-700">
                Check-out: <strong className="text-stone-900">{formatDateIndo(reservation.checkout_date)}</strong> (12:00)
              </div>
              <div className="text-stone-700">
                Durasi: <strong>{nights} {unitLabel}</strong> • Tamu: {reservation.adults} Dws{reservation.children > 0 ? `, ${reservation.children} Anak` : ''}
              </div>
            </div>
          </div>

          {/* Pricing Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Deskripsi Layanan &amp; Pemesanan</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Durasi</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Tarif Satuan</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {/* 1. Sewa Kamar Pokok */}
                <tr>
                  <td className="py-3 px-4">
                    <strong className="text-stone-900 block">{roomName}{roomNumber} ({roomType})</strong>
                    <span className="text-stone-500 text-[11px]">
                      Sewa Pokok Homestay • Periode {formatDateIndo(reservation.checkin_date)} s/d {formatDateIndo(reservation.checkout_date)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">{nights} {unitLabel}</td>
                  <td className="py-3 px-4 text-right">
                    {formatRupiah(Math.round(baseSubtotal / Math.max(1, nights)))} / {unitLabel}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-stone-900">
                    {formatRupiah(baseSubtotal)}
                  </td>
                </tr>

                {/* 2. Rincian Ekstra Bed / Kasur Tambahan jika memesan */}
                {extraCharges > 0 && (
                  <tr className="bg-amber-50/40">
                    <td className="py-3 px-4">
                      <strong className="text-stone-900 block">
                        {extraBreakdown[0]?.description || 'Penambahan Ekstra Bed (Kasur Tambahan)'}
                      </strong>
                      <span className="text-stone-500 text-[11px]">
                        Layanan kasur tambahan resmi ALYATAMA (termasuk bantal empuk &amp; sprei bersih)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">{nights} {unitLabel}</td>
                    <td className="py-3 px-4 text-right text-stone-700">
                      +{formatRupiah(Math.round(extraCharges / Math.max(1, nights)))} / {unitLabel}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#806044]">
                      +{formatRupiah(extraCharges)}
                    </td>
                  </tr>
                )}

                {/* 3. Potongan Diskon Promo jika ada */}
                {discountAmt > 0 && (
                  <tr className="text-emerald-700 bg-emerald-50/40">
                    <td colSpan={3} className="py-2 px-4 text-left font-medium">
                      Potongan Diskon Promo ({priceSnapshot?.discount_reason || priceSnapshot?.promo_code || 'Promo Homestay'})
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-emerald-700">
                      -{formatRupiah(discountAmt)}
                    </td>
                  </tr>
                )}
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
                Tamu wajib mematuhi waktu check-in (14:00) dan check-out (12:00). Pembayaran penuh (Tunai/Transfer/QRIS) diselesaikan di tempat sebelum serah terima kunci. Dokumen ini diterbitkan resmi oleh sistem ALYATAMA HOMESTAY.
              </p>
            </div>

            <div className="w-full sm:w-80 space-y-2 text-xs bg-stone-50/70 p-4 rounded-xl border border-stone-200">
              <div className="flex justify-between py-1 text-stone-600">
                <span>Subtotal Sewa Kamar:</span>
                <span className="font-semibold text-stone-900">
                  {formatRupiah(baseSubtotal)}
                </span>
              </div>

              {extraCharges > 0 && (
                <div className="flex justify-between py-1 text-[#806044]">
                  <span>Tambahan Ekstra Bed:</span>
                  <span className="font-bold">
                    +{formatRupiah(extraCharges)}
                  </span>
                </div>
              )}

              {discountAmt > 0 && (
                <div className="flex justify-between py-1 text-emerald-700 bg-emerald-50 px-2 rounded-lg border border-emerald-200/60">
                  <span>Diskon Promo:</span>
                  <span className="font-bold">-{formatRupiah(discountAmt)}</span>
                </div>
              )}

              <div className="flex justify-between py-1.5 border-t border-stone-200 font-bold text-stone-900 text-sm">
                <span>Total Biaya yang Harus Dibayar:</span>
                <span className="text-[#806044]">{formatRupiah(totalAmount)}</span>
              </div>

              <div className="flex justify-between py-1 text-stone-600 text-[11px]">
                <span>Pembayaran Diterima Kasir:</span>
                <span className="font-medium text-emerald-700">{formatRupiah(totalPaid)}</span>
              </div>

              <div className="flex justify-between py-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                <span>Sisa Tagihan Saat Kedatangan:</span>
                <span className={balanceDue === 0 ? 'text-emerald-700' : 'text-[#806044]'}>
                  {formatRupiah(balanceDue)}
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
