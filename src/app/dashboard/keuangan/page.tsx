'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  FileSpreadsheet, 
  AlertCircle, 
  Calendar,
  Layers 
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { Expense, Reservation } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';
import { showAdminToast } from '@/components/common/AdminToast';

export default function KeuanganPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields
  const [category, setCategory] = useState<Expense['category']>('listrik');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(100000);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const expData = await PmsService.getExpenses();
      const resData = await PmsService.getReservations();
      setExpenses(expData);
      setReservations(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await PmsService.createExpense({
        category,
        description,
        amount: Number(amount),
        expense_date: expenseDate,
        payment_method: paymentMethod,
        vendor: vendor.trim() || null,
        notes: notes.trim() || null,
      });
      setShowAddModal(false);
      showAdminToast('add', `Catatan pengeluaran "${description}" (${formatRupiah(amount)}) berhasil ditambahkan.`);
      setFeedback(`Berhasil Menambahkan: Pengeluaran "${description}" berhasil dicatat.`);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Calculations
  let totalRevenueReceived = 0;
  let totalOutstandingReceivable = 0;

  reservations.forEach((r) => {
    if (r.price_snapshot) {
      totalRevenueReceived += Number(r.price_snapshot.total_paid || 0);
      if (r.status !== 'cancelled' && r.status !== 'rejected') {
        totalOutstandingReceivable += Number(r.price_snapshot.balance_due || 0);
      }
    }
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netOperatingCashflow = totalRevenueReceived - totalExpenses;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            Pencatatan Keuangan & Arus Kas
          </h2>
          <p className="text-xs text-stone-500">
            Penerimaan kas riil, beban operasional per kategori, dan estimasi arus kas bersih.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Catat Pengeluaran Baru
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="font-bold">&times;</button>
        </div>
      )}

      {/* Accounting Clarification Notice (Prompt Section 14) */}
      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 space-y-1">
        <strong className="text-stone-900 block font-semibold">
          Definisi Metrik Arus Kas:
        </strong>
        <p className="leading-relaxed">
          Angka arus kas bersih di bawah merupakan selisih kas masuk riil yang telah diverifikasi dengan pengeluaran operasional yang telah dibayarkan. Nilai ini tidak menggantikan laporan audit akuntansi formal (neraca / laba rugi komprehensif akrual).
        </p>
      </div>

      {/* Financial Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
            Kas Masuk Riil
          </span>
          <div className="text-2xl font-bold text-emerald-700">
            {formatRupiah(totalRevenueReceived)}
          </div>
          <span className="text-[10px] text-stone-400">Pembayaran terverifikasi</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
            Pengeluaran Operasional
          </span>
          <div className="text-2xl font-bold text-rose-700">
            {formatRupiah(totalExpenses)}
          </div>
          <span className="text-[10px] text-stone-400">Listrik, laundry, kebersihan, dll</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
            Estimasi Arus Kas Bersih
          </span>
          <div className={`text-2xl font-bold ${netOperatingCashflow >= 0 ? 'text-stone-900' : 'text-rose-700'}`}>
            {formatRupiah(netOperatingCashflow)}
          </div>
          <span className="text-[10px] text-stone-400">Penerimaan dikurangi pengeluaran</span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-semibold text-stone-900 text-sm">
            Riwayat Beban Pengeluaran Operasional
          </h3>
          <span className="text-xs text-stone-500">
            {expenses.length} data tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">No. Pengeluaran</th>
                <th className="py-3 px-4 font-semibold">Kategori</th>
                <th className="py-3 px-4 font-semibold">Deskripsi</th>
                <th className="py-3 px-4 font-semibold">Vendor / Penerima</th>
                <th className="py-3 px-4 font-semibold">Metode Bayar</th>
                <th className="py-3 px-4 font-semibold">Tanggal</th>
                <th className="py-3 px-4 font-semibold text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-stone-300 stroke-[1.5]" />
                    <p className="font-semibold text-stone-600 text-xs">Belum Ada Riwayat Beban Pengeluaran Operasional</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Riwayat beban pengeluaran masih dikosongkan karena homestay belum beroperasi aktif.
                    </p>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                    {exp.expense_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-stone-100 text-stone-800">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-800 font-medium">
                    {exp.description}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {exp.vendor || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {exp.payment_method}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {formatDateIndo(exp.expense_date)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-rose-700">
                    {formatRupiah(exp.amount)}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-semibold text-stone-900 text-sm">Catat Pengeluaran Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-600 font-bold">&times;</button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Kategori Beban</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-stone-300 p-2.5 bg-white"
                >
                  <option value="listrik">Listrik (PLN)</option>
                  <option value="air">Air (PDAM)</option>
                  <option value="laundry">Laundry & Cuci Linen</option>
                  <option value="kebersihan">Kebersihan & Sanitasi</option>
                  <option value="perbaikan">Perbaikan & Perawatan Gedung</option>
                  <option value="perlengkapan">Perlengkapan Kamar & Dapur</option>
                  <option value="administrasi">Administrasi & Operasional</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Deskripsi Pengeluaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli token listrik meteran utama"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-stone-300 p-2.5 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Metode Bayar</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5 bg-white"
                  >
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="Tunai">Tunai</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Vendor / Penerima</label>
                  <input
                    type="text"
                    placeholder="Contoh: PLN Jambi"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
