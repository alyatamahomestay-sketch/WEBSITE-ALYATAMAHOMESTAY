'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  User, 
  ArrowRight, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Home,
  Sparkles,
  Building2,
  Users
} from 'lucide-react';
import AlyatamaLogo from '@/components/common/AlyatamaLogo';
import { PmsService } from '@/lib/services/pms-service';
import { StaffUser } from '@/lib/types';

export default function PanelLoginPage() {
  const router = useRouter();
  
  // Step 1 = Login credentials, Step 2 = Shift confirmation for STAFF
  const [step, setStep] = useState<'credentials' | 'shift_confirmation'>('credentials');
  
  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Authenticated user state
  const [authenticatedUser, setAuthenticatedUser] = useState<StaffUser | null>(null);
  const [shiftNotes, setShiftNotes] = useState('Shift Operasional Standar');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await PmsService.verifyStaffLogin(identifier, pin);
      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'Kredensial tidak valid');
        setLoading(false);
        return;
      }

      const user = res.user;
      setAuthenticatedUser(user);

      // Save user session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('alyatama_staff_session', JSON.stringify({
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          email: user.email,
        }));
      }

      if (user.role === 'admin') {
        // Admin directly enters panel
        router.push('/panel?role=admin');
      } else {
        // Check if staff already has an active shift
        const activeShift = await PmsService.getActiveShift(user.id);
        if (activeShift) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('alyatama_active_shift', JSON.stringify(activeShift));
          }
          router.push('/panel?role=staff');
        } else {
          // Transition to Shift Confirmation Step
          setStep('shift_confirmation');
          setLoading(false);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat memproses login');
      setLoading(false);
    }
  };

  const handleStartShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedUser) return;
    setLoading(true);

    try {
      const shift = await PmsService.startShift(
        authenticatedUser.id,
        authenticatedUser.full_name,
        shiftNotes
      );

      if (typeof window !== 'undefined') {
        localStorage.setItem('alyatama_active_shift', JSON.stringify(shift));
      }

      router.push('/panel?role=staff');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memulai shift kerja');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#30291F] text-stone-100 flex flex-col justify-between overflow-x-hidden selection:bg-[#355C46] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#44382c] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlyatamaLogo variant="white" size="sm" />
          <div className="hidden sm:block border-l border-stone-700 pl-3">
            <span className="text-[11px] font-semibold text-[#C6A47B] uppercase tracking-wider block">
              Sistem Manajemen Properti Terpadu (PMS)
            </span>
            <span className="text-[10px] text-stone-400">Portal Akses Khusus Admin & Staf (/panel)</span>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs text-stone-400 hover:text-white flex items-center gap-1.5 transition px-3 py-1.5 rounded-lg border border-stone-800 hover:border-stone-700"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Website Tamu</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 my-6">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Branding & Security Policy */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#355C46]/30 border border-[#355C46]/50 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Portal Resmi /panel</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                Portal Manajemen Operasional
              </h1>
              <p className="text-xs sm:text-sm text-stone-400 mt-3 leading-relaxed">
                Akses terpadu yang memisahkan operasional staf dari pengunjung publik. Seluruh hak akses ditentukan dan dikendalikan langsung oleh Administrator Homestay.
              </p>
            </div>

            <div className="bg-[#241e17] border border-[#44382c] p-4 rounded-2xl space-y-3 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Dua Peran Utama (Admin & Staf)</strong>
                  <span className="text-[11px] text-stone-400">Hanya <strong>ADMIN</strong> (kontrol penuh) dan <strong>STAFF</strong> (operasional & walk-in).</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#C6A47B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Atribusi Shift Otomatis</strong>
                  <span className="text-[11px] text-stone-400">Setiap pemesanan walk-in & check-in mengunci nama petugas bertugas secara akurat.</span>
                </div>
              </div>
            </div>

            {/* Security & Supabase Authenticator Notice */}
            <div className="bg-[#1C2C22]/60 border border-emerald-800/40 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Terhubung ke Supabase Authenticator</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Akses akun pengelola (Admin & Staf) diverifikasi melalui enkripsi aman Supabase Authenticator. Penambahan user dan pengaturan peran dilakukan langsung oleh Super Administrator.
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Form */}
          <div className="lg:col-span-7 bg-[#241e17] border border-[#44382c] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* STEP 1: CREDENTIALS */}
            {step === 'credentials' && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-[#C6A47B]" />
                    <span>Masuk ke Portal Operasional</span>
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Gunakan kredensial yang telah diterbitkan atau diundang oleh Administrator.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Username atau Email Staf
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Contoh: admin atau rahmat"
                        className="w-full bg-[#1b1611] border border-[#44382c] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      PIN Akses / Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Masukkan PIN..."
                        className="w-full bg-[#1b1611] border border-[#44382c] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#355C46] hover:bg-[#284635] text-white py-3 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Memverifikasi Akun...</span>
                    ) : (
                      <>
                        <span>Masuk ke Sistem (/panel)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* STEP 2: SHIFT CONFIRMATION FOR STAFF */}
            {step === 'shift_confirmation' && authenticatedUser && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-[#44382c] pb-3">
                  <div className="inline-flex items-center gap-1.5 bg-[#C6A47B]/20 text-[#C6A47B] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Langkah Wajib Mulai Shift</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Konfirmasi Identitas Petugas & Shift Harian
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Sesuai SOP ALYATAMA HOMESTAY, staf wajib mengonfirmasi identitas nama sebelum memproses transaksi tamu.
                  </p>
                </div>

                <div className="bg-[#1b1611] border border-[#355C46]/40 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#30291F]">
                    <span className="text-xs text-stone-400">Nama Petugas Bertugas:</span>
                    <strong className="text-white text-sm">{authenticatedUser.full_name}</strong>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#30291F]">
                    <span className="text-xs text-stone-400">Peran Akun:</span>
                    <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-[#355C46] text-white">
                      STAFF OPERASIONAL
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400">Tanggal & Zona Waktu:</span>
                    <span className="text-xs text-[#C6A47B] font-mono">
                      {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })} (WIB)
                    </span>
                  </div>
                </div>

                <form onSubmit={handleStartShiftSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Catatan Shift (Opsional)
                    </label>
                    <input
                      type="text"
                      value={shiftNotes}
                      onChange={(e) => setShiftNotes(e.target.value)}
                      placeholder="Contoh: Shift Pagi - Siang Front Office"
                      className="w-full bg-[#1b1611] border border-[#44382c] rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                    />
                  </div>

                  <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl text-[11px] text-amber-200/90 leading-relaxed">
                    Setiap reservasi walk-in, persetujuan booking, dan pembayaran yang Anda catat akan otomatis ditautkan ke nama <strong>{authenticatedUser.full_name}</strong>.
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('credentials')}
                      className="px-4 py-2.5 rounded-xl border border-stone-700 text-stone-400 hover:text-white text-xs font-semibold transition"
                    >
                      Batal / Ganti Akun
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#355C46] hover:bg-[#284635] text-white py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg"
                    >
                      {loading ? (
                        <span>Membuka Sesi Shift...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>Mulai Shift & Masuk Sistem</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="pt-3 border-t border-[#44382c] flex items-center justify-between text-[11px] text-stone-400">
              <span>Bukan pengelola atau staf?</span>
              <Link href="/" className="text-[#C6A47B] hover:underline">
                Pesan Kamar di Website Pengunjung &rarr;
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#44382c] py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} ALYATAMA HOMESTAY — Sistem Manajemen Properti Terpadu (PMS). Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}
