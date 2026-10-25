'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle2, XCircle, Calendar, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { Promotion } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

export default function PromoManagementPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);
  const [endDate, setEndDate] = useState(nextMonth.toISOString().split('T')[0]);
  const [minNights, setMinNights] = useState(1);
  const [minSpend, setMinSpend] = useState(0);

  const loadPromos = async () => {
    setLoading(true);
    try {
      const data = await PmsService.getPromotions();
      setPromotions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleToggle = async (promo: Promotion) => {
    try {
      const newState = await PmsService.togglePromotionActive(promo.id);
      setFeedback(`Promo ${promo.name} kini ${newState ? 'AKTIF' : 'NONAKTIF'}.`);
      loadPromos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await PmsService.createPromotion({
        name,
        code: code.trim().toUpperCase() || null,
        description,
        discount_type: discountType,
        discount_value: Number(discountValue),
        start_date: startDate,
        end_date: endDate,
        applicable_days: ['0', '1', '2', '3', '4', '5', '6'],
        min_nights: Number(minNights),
        min_spend: Number(minSpend),
        is_active: true,
        priority: 1,
      });
      setFeedback(`Promo baru ${name} berhasil dibuat.`);
      setShowModal(false);
      loadPromos();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan promo');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            Sistem Promo & Diskon Fleksibel
          </h2>
          <p className="text-xs text-stone-500">
            Atur aturan diskon persentase atau potongan Rupiah tetap berdasarkan durasi menginap dan kode promo.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Buat Promo Baru
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="font-bold">&times;</button>
        </div>
      )}

      {/* Promos List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama Promo</th>
                <th className="py-3 px-4 font-semibold">Kode Promo</th>
                <th className="py-3 px-4 font-semibold">Besaran Diskon</th>
                <th className="py-3 px-4 font-semibold">Periode Berlaku</th>
                <th className="py-3 px-4 font-semibold">Syarat Min. Menginap</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {promotions.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <strong className="text-stone-900 block">{p.name}</strong>
                    <span className="text-[11px] text-stone-500">{p.description}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-brand-700">
                    {p.code || '(Auto Diskon)'}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-stone-900">
                    {p.discount_type === 'percentage'
                      ? `${p.discount_value}%`
                      : formatRupiah(p.discount_value)}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {formatDateIndo(p.start_date)} s/d {formatDateIndo(p.end_date)}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    Min. {p.min_nights} Malam {p.min_spend > 0 ? `(Min Rp ${p.min_spend.toLocaleString('id-ID')})` : ''}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        p.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {p.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggle(p)}
                      className={`text-xs px-3 py-1 rounded-lg border font-medium transition-colors ${
                        p.is_active
                          ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {p.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-semibold text-stone-900 text-sm">Buat Promo Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600 font-bold">&times;</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Promo</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Promo Akhir Pekan Spesial"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Kode Kupon Promo (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: WEEKENDHEMAT"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 p-2.5 uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tipe Diskon</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full rounded-lg border border-stone-300 p-2.5 bg-white"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal Rupiah (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nilai ({discountType === 'percentage' ? '%' : 'Rp'})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full rounded-lg border border-stone-300 p-2.5 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Minimal Malam</label>
                  <input
                    type="number"
                    min="1"
                    value={minNights}
                    onChange={(e) => setMinNights(Number(e.target.value))}
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Minimal Belanja (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={minSpend}
                    onChange={(e) => setMinSpend(Number(e.target.value))}
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Deskripsi Ringkas</label>
                <input
                  type="text"
                  placeholder="Keterangan singkat ketentuan promo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 p-2.5"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium"
                >
                  Simpan Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
