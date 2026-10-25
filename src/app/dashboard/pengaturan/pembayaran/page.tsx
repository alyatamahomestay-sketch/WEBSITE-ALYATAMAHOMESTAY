'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, CreditCard, Save, Image, CheckCircle2 } from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { PaymentMethod } from '@/lib/types';

export default function PengaturanPembayaranPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Selected QRIS state
  const [qrisUrl, setQrisUrl] = useState('');
  const [qrisAccountName, setQrisAccountName] = useState('ALYATAMA HOMESTAY');
  const [qrisInstructions, setQrisInstructions] = useState('');
  const [qrisActive, setQrisActive] = useState(true);

  // Bank Transfer state
  const [bankInstructions, setBankInstructions] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await PmsService.getPaymentMethods();
      setMethods(data);

      const qris = data.find((m) => m.code === 'qris');
      if (qris) {
        setQrisUrl(qris.qris_image_url || '');
        setQrisAccountName(qris.account_name || 'ALYATAMA HOMESTAY');
        setQrisInstructions(qris.instructions || '');
        setQrisActive(qris.is_active);
      }

      const bank = data.find((m) => m.code === 'bank_transfer');
      if (bank) {
        setBankInstructions(bank.instructions || '');
        setBankAccountName(bank.account_name || '');
        setBankAccountNumber(bank.account_number || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveQRIS = async (e: React.FormEvent) => {
    e.preventDefault();
    const qris = methods.find((m) => m.code === 'qris');
    if (!qris) return;

    try {
      await PmsService.updatePaymentMethod(qris.id, {
        qris_image_url: qrisUrl.trim() || null,
        account_name: qrisAccountName.trim(),
        instructions: qrisInstructions.trim(),
        is_active: qrisActive,
      });
      setFeedback('Pengaturan QRIS berhasil diperbarui!');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    const bank = methods.find((m) => m.code === 'bank_transfer');
    if (!bank) return;

    try {
      await PmsService.updatePaymentMethod(bank.id, {
        instructions: bankInstructions.trim(),
        account_name: bankAccountName.trim(),
        account_number: bankAccountNumber.trim(),
      });
      setFeedback('Pengaturan Transfer Bank berhasil diperbarui!');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
          Metode Pembayaran & Konfigurasi QRIS
        </h2>
        <p className="text-xs text-stone-500">
          Atur gambar QRIS resmi, nama penerima, nomor rekening bank, dan instruksi verifikasi bagi tamu.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="font-bold">&times;</button>
        </div>
      )}

      {/* QRIS Configuration Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-stone-900 text-sm">
              Pengaturan QRIS Resmi Homestay
            </h3>
          </div>
          <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
            <input
              type="checkbox"
              checked={qrisActive}
              onChange={(e) => setQrisActive(e.target.checked)}
              className="rounded border-stone-300 text-brand-600 focus:ring-brand-500"
            />
            <span>Metode QRIS Aktif</span>
          </label>
        </div>

        <form onSubmit={handleSaveQRIS} className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          {/* Left 2 Cols: Form Fields */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Nama Penerima / Merchant QRIS
              </label>
              <input
                type="text"
                required
                value={qrisAccountName}
                onChange={(e) => setQrisAccountName(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                URL Gambar Kode QRIS (Supabase Storage / Web)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={qrisUrl}
                onChange={(e) => setQrisUrl(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5"
              />
              <span className="text-[11px] text-stone-500 mt-0.5 block">
                Gambar ini otomatis tampil di instruksi pembayaran dan invoice slip resmi.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Petunjuk Pembayaran QRIS untuk Tamu
              </label>
              <textarea
                rows={3}
                value={qrisInstructions}
                onChange={(e) => setQrisInstructions(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5"
              />
            </div>

            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Simpan Pengaturan QRIS
            </button>
          </div>

          {/* Right 1 Col: Live Image Preview */}
          <div className="md:col-span-1 space-y-2">
            <span className="font-semibold text-stone-700 block text-[11px] uppercase tracking-wider">
              Pratinjau Gambar QRIS
            </span>
            <div className="aspect-square bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-center p-3 overflow-hidden">
              {qrisUrl ? (
                <img
                  src={qrisUrl}
                  alt="QRIS Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-stone-400 space-y-1">
                  <Image className="w-8 h-8 mx-auto stroke-1" />
                  <span className="text-[11px] block">Gambar belum disetel</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-stone-400 text-center leading-tight">
              Pastikan kode QRIS dapat dipindai dengan jelas dari aplikasi perbankan.
            </p>
          </div>
        </form>
      </div>

      {/* Bank Transfer Configuration Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
          <CreditCard className="w-5 h-5 text-brand-600" />
          <h3 className="font-semibold text-stone-900 text-sm">
            Pengaturan Rekening Transfer Bank
          </h3>
        </div>

        <form onSubmit={handleSaveBank} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Nama Pemilik Rekening
              </label>
              <input
                type="text"
                placeholder="Contoh: ALYATAMA HOMESTAY"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Nomor Rekening Bank & Nama Bank
              </label>
              <input
                type="text"
                placeholder="Contoh: 123-456-7890 (BCA)"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Petunjuk Transfer Bank Lengkap
            </label>
            <textarea
              rows={2}
              value={bankInstructions}
              onChange={(e) => setBankInstructions(e.target.value)}
              className="w-full rounded-lg border border-stone-300 p-2.5"
            />
          </div>

          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Simpan Rekening Bank
          </button>
        </form>
      </div>
    </div>
  );
}
