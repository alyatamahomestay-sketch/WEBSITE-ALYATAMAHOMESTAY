'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  DollarSign, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ArrowRight,
  AlertCircle 
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { Reservation, Payment } from '@/lib/types';
import { formatRupiah, formatDateTimeIndo } from '@/lib/formatters';

export default function PembayaranPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'deposits' | 'verified'>('all');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await PmsService.getReservations();
        setReservations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Collect all payments
  const allPayments: Array<{ payment: Payment; res: Reservation }> = [];
  reservations.forEach((res) => {
    if (res.payments) {
      res.payments.forEach((p) => {
        allPayments.push({ payment: p, res });
      } );
    }
  });

  // Calculate totals
  const totalVerifiedPayments = allPayments.reduce((sum, item) => sum + Number(item.payment.amount), 0);
  const totalDepositsHeld = reservations.reduce((sum, res) => {
    if (res.deposit && res.deposit.status === 'received') {
      return sum + Number(res.deposit.received_amount || 0);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
          Penerimaan Pembayaran & Manajemen Deposit
        </h2>
        <p className="text-xs text-stone-500">
          Seluruh mutasi kas masuk, verifikasi bukti pembayaran QRIS/Transfer, dan pencatatan deposit jaminan menginap.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Kas Masuk Terverifikasi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{formatRupiah(totalVerifiedPayments)}</div>
          <p className="text-[11px] text-stone-500">
            Murni penerimaan kas riil (Bukan piutang / bukan estimasi tagihan)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Deposit Menginap Dalam Tanggungan</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-700">{formatRupiah(totalDepositsHeld)}</div>
          <p className="text-[11px] text-stone-500">
            Kewajiban jaminan tamu yang masih dapat dikembalikan saat check-out
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-semibold text-stone-900 text-sm">
            Catatan Transaksi Pembayaran
          </h3>
          <span className="text-xs text-stone-500">
            Total {allPayments.length} transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">No. Transaksi</th>
                <th className="py-3 px-4 font-semibold">Reservasi Terkait</th>
                <th className="py-3 px-4 font-semibold">Tamu</th>
                <th className="py-3 px-4 font-semibold">Metode</th>
                <th className="py-3 px-4 font-semibold text-right">Nominal</th>
                <th className="py-3 px-4 font-semibold text-center">Status Verifikasi</th>
                <th className="py-3 px-4 font-semibold">Waktu Pencatatan</th>
                <th className="py-3 px-4 font-semibold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {allPayments.map((item) => (
                <tr key={item.payment.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                    {item.payment.payment_number}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-brand-700">
                    {item.res.reservation_number}
                  </td>
                  <td className="py-3.5 px-4 text-stone-800">
                    {item.res.guest?.full_name}
                  </td>
                  <td className="py-3.5 px-4 uppercase font-medium text-stone-700">
                    {item.payment.payment_method}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-stone-900">
                    {formatRupiah(item.payment.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800">
                      {item.payment.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">
                    {formatDateTimeIndo(item.payment.payment_date)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/dashboard/reservasi/${item.res.id}`}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 inline-flex items-center gap-1"
                      title="Lihat Detail Reservasi"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}

              {allPayments.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-stone-400">
                    Belum ada catatan mutasi pembayaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
