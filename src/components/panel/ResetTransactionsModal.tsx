'use client';

import React, { useState } from 'react';
import { AlertTriangle, Lock, ShieldAlert, UserCheck, X, Loader2, CheckCircle2 } from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { showAdminToast } from '@/components/common/AdminToast';

interface ResetTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ResetTransactionsModal({
  isOpen,
  onClose,
  onSuccess,
}: ResetTransactionsModalProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Harap masukkan ID/Username dan Kata Sandi akun Admin terdaftar di Supabase.');
      return;
    }

    if (!confirmation) {
      setErrorMessage('Harap centang kotak persetujuan konfirmasi penghapusan data.');
      return;
    }

    setLoading(true);

    try {
      const res = await PmsService.resetAllTransactions({
        identifier: identifier.trim(),
        password: password.trim(),
        confirmation,
      });

      if (res.success) {
        setSuccessMessage(res.message);
        showAdminToast('delete', res.message);
        setTimeout(() => {
          setIdentifier('');
          setPassword('');
          setConfirmation(false);
          setSuccessMessage('');
          onClose();
          onSuccess?.();
        }, 1500);
      } else {
        setErrorMessage(res.message || 'Otentikasi gagal. Pastikan ID dan Kata Sandi benar.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem saat memproses reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-stone-200 relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Reset Seluruh Data Transaksi
              </h3>
              <p className="text-[11px] text-stone-500">
                Fitur proteksi keamanan tingkat tinggi dengan otentikasi Supabase
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-800">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>PERINGATAN SISTEM: TINDAKAN BERSIFAT PERMANEN</span>
          </div>
          <p className="text-[11px] text-rose-700 leading-relaxed">
            Tindakan ini akan <strong>menghapus seluruh data reservasi, bukti pembayaran, dan riwayat pesanan</strong> dari database Supabase dan penyimpanan server, serta mengembalikan seluruh kamar menjadi berstatus <strong>TERSEDIA</strong>.
          </p>
          <p className="text-[11px] text-stone-600 bg-white/70 p-2 rounded-xl border border-rose-100">
            &bull; Data master kamar, daftar akun staf/admin, dan pengaturan homestay <strong>tetap utuh dan aman</strong>.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-rose-100 border border-rose-300 text-rose-900 p-3 rounded-xl text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              ID Pengguna / Username Admin Terdaftar di Supabase <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                disabled={loading}
                placeholder="Contoh: admin"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-xl border border-stone-300 pl-9 pr-3.5 py-2.5 text-xs text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Gunakan ID/Username akun Administrator aktif yang terkait pada database Supabase.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              Kata Sandi Akun Terkait di Supabase <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                disabled={loading}
                placeholder="Masukkan kata sandi admin..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-stone-300 pl-9 pr-3.5 py-2.5 text-xs text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                disabled={loading}
                checked={confirmation}
                onChange={(e) => setConfirmation(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-stone-300 mt-0.5"
              />
              <span className="text-[11px] text-stone-700 leading-snug">
                Saya mengonfirmasi untuk <strong>mereset dan menghapus seluruh transaksi secara permanen</strong> dan bertanggung jawab penuh atas tindakan ini.
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold transition"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading || !confirmation}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-bold transition shadow-xs cursor-pointer disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
              <span>{loading ? 'Memproses Reset...' : 'Hapus & Reset Seluruh Transaksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
