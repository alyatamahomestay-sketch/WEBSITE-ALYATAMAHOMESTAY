'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  QrCode, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  ShieldAlert, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Building2, 
  RefreshCw, 
  ExternalLink,
  Wallet,
  Sparkles,
  KeyRound,
  Info
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { PaymentMethod } from '@/lib/types';
import ImageUploadPicker from '@/components/common/ImageUploadPicker';
import { showAdminToast } from '@/components/common/AdminToast';

export default function SetupPembayaranPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State - QRIS
  const [qrisActive, setQrisActive] = useState(true);
  const [qrisAccountName, setQrisAccountName] = useState('ALYATAMA HOMESTAY');
  const [qrisUrl, setQrisUrl] = useState('');
  const [qrisInstructions, setQrisInstructions] = useState('');

  // Form State - Bank Transfer
  const [bankActive, setBankActive] = useState(true);
  const [bankName, setBankName] = useState('Bank Syariah Indonesia (BSI)');
  const [bankAccountName, setBankAccountName] = useState('ALYATAMA HOMESTAY');
  const [bankAccountNumber, setBankAccountNumber] = useState('712-854-7200');
  const [bankInstructions, setBankInstructions] = useState('');

  // Form State - Cash
  const [cashActive, setCashActive] = useState(true);
  const [cashInstructions, setCashInstructions] = useState('');

  // Security Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState('');

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      const data = await PmsService.getPaymentMethods();
      setMethods(data);

      // Populate QRIS
      const qris = data.find((m) => m.code === 'qris');
      if (qris) {
        setQrisActive(qris.is_active);
        setQrisAccountName(qris.account_name || 'ALYATAMA HOMESTAY');
        setQrisUrl(qris.qris_image_url || '');
        setQrisInstructions(
          qris.instructions ||
            '1. Scan kode QRIS yang tampil di layar atau bukti pemesanan.\n2. Pastikan nama merchant: ALYATAMA HOMESTAY.\n3. Masukkan nominal tepat dan konfirmasikan ke WhatsApp admin.'
        );
      }

      // Populate Bank
      const bank = data.find((m) => m.code === 'bank_transfer');
      if (bank) {
        setBankActive(bank.is_active);
        setBankAccountName(bank.account_name || 'ALYATAMA HOMESTAY');
        setBankAccountNumber(bank.account_number || '712-854-7200 (BSI)');
        setBankInstructions(
          bank.instructions ||
            'Transfer ke Bank Syariah Indonesia (BSI): 712-854-7200 a.n ALYATAMA HOMESTAY.\nSertakan nomor reservasi resmi pada berita transfer.'
        );
        // Extract bank name if formatted
        if (bank.account_number?.includes('(') && bank.account_number?.includes(')')) {
          const match = bank.account_number.match(/\((.*?)\)/);
          if (match && match[1]) {
            setBankName(match[1]);
          }
        }
      }

      // Populate Cash
      const cash = data.find((m) => m.code === 'cash');
      if (cash) {
        setCashActive(cash.is_active);
        setCashInstructions(
          cash.instructions ||
            'Pembayaran tunai dilakukan secara langsung kepada pengelola homestay saat tiba di lokasi sebelum serah terima kunci.'
        );
      }

      // Auto-fill active admin username if in session
      if (typeof window !== 'undefined') {
        const sess = localStorage.getItem('alyatama_staff_session');
        if (sess) {
          try {
            const parsed = JSON.parse(sess);
            if (parsed.username || parsed.email) {
              setAuthIdentifier(parsed.email || parsed.username);
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Error loading payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentData();
  }, []);

  const handleOpenAuthModal = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setShowAuthModal(true);
  };

  const handleConfirmSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authIdentifier.trim() || !authPassword.trim()) {
      setAuthError('ID Pengguna/Email dan Kata Sandi Admin wajib diisi.');
      return;
    }

    setSubmittingAuth(true);

    try {
      // Prepare full account_number format
      const fullBankNumber = bankName.trim()
        ? `${bankAccountNumber.replace(/\s*\(.*?\)/, '').trim()} (${bankName.trim()})`
        : bankAccountNumber.trim();

      const updatedPayload: Partial<PaymentMethod>[] = [
        {
          code: 'qris',
          name: 'QRIS ALYATAMA HOMESTAY',
          account_name: qrisAccountName.trim(),
          qris_image_url: qrisUrl.trim() || null,
          instructions: qrisInstructions.trim(),
          is_active: qrisActive,
        },
        {
          code: 'bank_transfer',
          name: `Transfer Bank (${bankName.trim() || 'BSI'})`,
          account_name: bankAccountName.trim(),
          account_number: fullBankNumber,
          instructions: bankInstructions.trim(),
          is_active: bankActive,
        },
        {
          code: 'cash',
          name: 'Tunai di Tempat (Cash on Arrival)',
          instructions: cashInstructions.trim(),
          is_active: cashActive,
        },
      ];

      const res = await PmsService.updatePaymentMethodsSecurely({
        identifier: authIdentifier.trim(),
        password: authPassword.trim(),
        methods: updatedPayload,
      });

      setShowAuthModal(false);
      setAuthPassword('');
      showAdminToast('edit', 'Setup Pembayaran & QRIS berhasil diperbarui dan tersimpan aman di Supabase!');
      setFeedback({
        type: 'success',
        message: 'Pengaturan QRIS & Rekening Bank berhasil diperbarui dan terkunci di database Supabase!',
      });

      loadPaymentData();
    } catch (err: any) {
      setAuthError(err.message || 'Gagal menyimpan data pembayaran ke Supabase.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#392B21] via-[#4d3b2e] to-[#2B1F17] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-[#5d493a]">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#C6A47B]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold bg-[#C6A47B] text-[#2B1F17] px-3 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                Proteksi Tingkat Tinggi
              </span>
              <span className="text-[11px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Terkunci di Database Supabase
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#F4EDE4] tracking-tight">
              Setup Sistem Pembayaran Homestay (QRIS &amp; Rekening Bank)
            </h1>
            <p className="text-xs sm:text-sm text-[#E7D8C5] max-w-2xl leading-relaxed">
              Atur gambar QRIS resmi, nama penerima merchant, nama bank, dan nomor rekening pembayaran ALYATAMA HOMESTAY. 
              Penyimpanan perubahan data keuangan ini <strong>wajib diverifikasi dengan ID dan Kata Sandi Administrator Supabase</strong> agar aman dan tidak dapat disalahgunakan.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPaymentData}
            title="Muat ulang data dari server"
            className="self-start md:self-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition backdrop-blur-xs border border-white/10 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-stone-500 hover:text-stone-800 font-bold text-sm px-2"
          >
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleOpenAuthModal} className="space-y-6">
        {/* ===================================================================== */}
        {/* 1. SETUP QRIS RESMI HOMESTAY */}
        {/* ===================================================================== */}
        <div className="bg-white rounded-3xl border border-[#E5DCD0] shadow-sm overflow-hidden">
          <div className="bg-[#FAF7F2] p-5 sm:px-8 border-b border-[#E5DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#806044]/10 text-[#806044] border border-[#806044]/20 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-[#392B21] text-base">
                  1. Konfigurasi Kode QRIS Resmi Homestay
                </h2>
                <p className="text-xs text-[#756A5F]">
                  Gambar QRIS ini otomatis muncul pada bukti pemesanan tamu, invoice cetak, dan pendaftaran kasir walk-in.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E5DCD0] text-xs font-semibold text-[#392B21] cursor-pointer shadow-2xs self-start sm:self-auto">
              <input
                type="checkbox"
                checked={qrisActive}
                onChange={(e) => setQrisActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#806044] focus:ring-[#806044] accent-[#806044]"
              />
              <span>Metode QRIS Aktif</span>
            </label>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
            {/* Form Fields: 7 Cols */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block font-bold text-[#392B21] mb-1.5">
                  Nama Merchant / Pemilik QRIS Resmi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={qrisAccountName}
                  onChange={(e) => setQrisAccountName(e.target.value)}
                  placeholder="Contoh: ALYATAMA HOMESTAY"
                  className="w-full rounded-xl border border-[#E5DCD0] p-3 text-xs font-semibold bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#806044]/30"
                />
                <span className="text-[11px] text-[#756A5F] mt-1 block">
                  Nama ini harus sesuai persis dengan nama akun QRIS yang muncul saat tamu memindai dari m-Banking.
                </span>
              </div>

              <div>
                <ImageUploadPicker
                  label="Upload / Ganti Gambar Barcode QRIS Homestay"
                  value={qrisUrl}
                  onChange={setQrisUrl}
                  folder="payments"
                  helperText="Format gambar JPG, PNG, atau WEBP. Unggah foto barcode QRIS homestay Anda dengan jelas."
                />
              </div>

              <div>
                <label className="block font-bold text-[#392B21] mb-1.5">
                  Petunjuk &amp; Instruksi Pembayaran QRIS untuk Tamu
                </label>
                <textarea
                  rows={3}
                  value={qrisInstructions}
                  onChange={(e) => setQrisInstructions(e.target.value)}
                  placeholder="1. Scan kode QRIS... 2. Masukkan nominal..."
                  className="w-full rounded-xl border border-[#E5DCD0] p-3 text-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#806044]/30"
                />
              </div>
            </div>

            {/* Live QRIS Visual Card: 5 Cols */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full max-w-xs bg-gradient-to-b from-white to-[#FAF7F2] rounded-3xl border-2 border-[#806044]/30 p-5 shadow-sm text-center space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5DCD0] pb-2 text-[10px] uppercase font-bold text-[#756A5F] tracking-wider">
                  <span>Pratinjau Live QRIS</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${qrisActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                    {qrisActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <div className="aspect-square bg-white rounded-2xl border border-stone-200 p-3 flex items-center justify-center overflow-hidden shadow-2xs">
                  {qrisUrl ? (
                    <img
                      src={qrisUrl}
                      alt="Pratinjau QRIS Homestay"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-4 text-stone-400 space-y-2">
                      <QrCode className="w-12 h-12 mx-auto text-stone-300 stroke-1" />
                      <p className="text-[11px] leading-tight text-stone-500">
                        Gambar QRIS belum diunggah.<br />Silakan upload gambar barcode QRIS di samping.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-[#756A5F] uppercase font-medium">Merchant Terdaftar:</span>
                  <p className="text-sm font-bold text-[#392B21] font-mono tracking-tight">
                    {qrisAccountName || 'ALYATAMA HOMESTAY'}
                  </p>
                </div>

                {qrisUrl && (
                  <a
                    href={qrisUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#806044] hover:underline font-semibold pt-1"
                  >
                    <span>Buka Gambar Asli</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 2. SETUP REKENING TRANSFER BANK SYARIAH */}
        {/* ===================================================================== */}
        <div className="bg-white rounded-3xl border border-[#E5DCD0] shadow-sm overflow-hidden">
          <div className="bg-[#FAF7F2] p-5 sm:px-8 border-b border-[#E5DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#806044]/10 text-[#806044] border border-[#806044]/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-[#392B21] text-base">
                  2. Konfigurasi Rekening Transfer Bank Syariah
                </h2>
                <p className="text-xs text-[#756A5F]">
                  Rekening tujuan transfer bank resmi homestay yang ditampilkan kepada tamu dan kwitansi pembayaran.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E5DCD0] text-xs font-semibold text-[#392B21] cursor-pointer shadow-2xs self-start sm:self-auto">
              <input
                type="checkbox"
                checked={bankActive}
                onChange={(e) => setBankActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#806044] focus:ring-[#806044] accent-[#806044]"
              />
              <span>Metode Transfer Aktif</span>
            </label>
          </div>

          <div className="p-6 sm:p-8 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-[#392B21] mb-1.5">
                  Nama Bank <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Contoh: Bank Syariah Indonesia (BSI)"
                  className="w-full rounded-xl border border-[#E5DCD0] p-3 text-xs font-semibold bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#806044]/30"
                />
              </div>

              <div>
                <label className="block font-bold text-[#392B21] mb-1.5">
                  Nomor Rekening Bank <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Contoh: 712-854-7200"
                  className="w-full rounded-xl border border-[#E5DCD0] p-3 text-xs font-mono font-bold bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#806044]/30"
                />
              </div>

              <div>
                <label className="block font-bold text-[#392B21] mb-1.5">
                  Nama Pemilik Rekening <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="Contoh: ALYATAMA HOMESTAY"
                  className="w-full rounded-xl border border-[#E5DCD0] p-3 text-xs font-semibold bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#806044]/30"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#392B21] mb-1.5">
                Petunjuk Lengkap Transfer Bank untuk Tamu
              </label>
              <textarea
                rows={3}
                value={bankInstructions}
                onChange={(e) => setBankInstructions(e.target.value)}
                placeholder="Instruksi nomor rekening dan anjuran konfirmasi struk..."
                className="w-full rounded-xl border border-[#E5DCD0] p-3 text-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#806044]/30"
              />
            </div>

            {/* Rekening Preview Pill */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#806044]" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#756A5F] block">Tampilan Format Transfer Tamu:</span>
                  <span className="text-sm font-mono font-bold text-[#392B21]">
                    {bankName}: {bankAccountNumber} a.n {bankAccountName}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-stone-500 italic">
                * Format ini otomatis terlampir di WhatsApp &amp; Struk
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. METODE PEMBAYARAN TUNAI (CASH) */}
        {/* ===================================================================== */}
        <div className="bg-white rounded-3xl border border-[#E5DCD0] shadow-sm overflow-hidden">
          <div className="bg-[#FAF7F2] p-5 sm:px-8 border-b border-[#E5DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#806044]/10 text-[#806044] border border-[#806044]/20 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-[#392B21] text-base">
                  3. Metode Pembayaran Tunai (Cash di Tempat)
                </h2>
                <p className="text-xs text-[#756A5F]">
                  Konfirmasi pembayaran tunai langsung di meja resepsionis sebelum serah terima kunci.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E5DCD0] text-xs font-semibold text-[#392B21] cursor-pointer shadow-2xs self-start sm:self-auto">
              <input
                type="checkbox"
                checked={cashActive}
                onChange={(e) => setCashActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#806044] focus:ring-[#806044] accent-[#806044]"
              />
              <span>Metode Tunai Aktif</span>
            </label>
          </div>

          <div className="p-6 sm:p-8 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#392B21] mb-1.5">
                Petunjuk Pembayaran Tunai untuk Tamu
              </label>
              <textarea
                rows={2}
                value={cashInstructions}
                onChange={(e) => setCashInstructions(e.target.value)}
                placeholder="Pembayaran tunai dilakukan langsung di meja kasir..."
                className="w-full rounded-xl border border-[#E5DCD0] p-3 text-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#806044]/30"
              />
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SUBMIT BUTTON BAR */}
        {/* ===================================================================== */}
        <div className="bg-gradient-to-r from-stone-900 to-[#392B21] p-5 sm:p-6 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#C6A47B] shrink-0 border border-white/10">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm block text-stone-100">
                Penyimpanan Aman &amp; Terproteksi Kredensial Supabase
              </span>
              <p className="text-xs text-stone-300">
                Data QRIS dan Nomor Rekening tidak dapat diubah oleh sembarang pihak tanpa kata sandi admin.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#C6A47B] hover:bg-[#b5936a] text-[#241B14] font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Kunci &amp; Simpan ke Supabase</span>
          </button>
        </div>
      </form>

      {/* ===================================================================== */}
      {/* MODAL OTORISASI KEAMANAN ADMIN SUPABASE */}
      {/* ===================================================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border-2 border-[#806044]/40 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start gap-3.5 pb-3 border-b border-[#FAF7F2]">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-[#392B21] text-base">
                  Otorisasi Keamanan Admin Supabase
                </h3>
                <p className="text-xs text-[#756A5F] mt-0.5">
                  Verifikasi kredensial wajib untuk mengunci perubahan rekening &amp; QRIS.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Security Notice Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Akses Sensitif Keuangan:</strong> Perubahan nomor rekening dan gambar QRIS akan langsung divalidasi ke <strong>Supabase Authentication</strong>. Data yang sah akan tersimpan terkunci di Supabase Database dan dicatat ke audit log keamanan.
              </div>
            </div>

            {authError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleConfirmSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#392B21] mb-1">
                  ID Pengguna / Email Admin Supabase <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="admin atau alyatamahomestay@gmail.com"
                  value={authIdentifier}
                  onChange={(e) => setAuthIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-[#E5DCD0] p-3 text-xs font-semibold bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#806044]/30"
                />
              </div>

              <div>
                <label className="block font-bold text-[#392B21] mb-1">
                  Kata Sandi Administrator Supabase <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi admin..."
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#E5DCD0] p-3 pr-10 text-xs font-semibold bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#806044]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={submittingAuth}
                  onClick={() => setShowAuthModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer transition disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAuth}
                  className="px-5 py-2.5 rounded-xl bg-[#806044] hover:bg-[#6c5037] text-white font-bold cursor-pointer transition shadow-md inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingAuth ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Memverifikasi ke Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Verifikasi &amp; Simpan ke Supabase</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
