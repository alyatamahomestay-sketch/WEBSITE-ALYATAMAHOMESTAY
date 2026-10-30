'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  KeyRound, 
  User, 
  ArrowRight, 
  AlertTriangle, 
  Sparkles,
  Eye,
  EyeOff
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
  const [showPassword, setShowPassword] = useState(false);
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
        setErrorMsg(res.error || 'Kredensial staf tidak valid atau akun tidak terdaftar');
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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden select-none bg-[#1C140E]">
      {/* Background Ambience: Warm Hotel Suite & Wooden Door Key Tag */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/panel-login-bg.png')`,
        }}
      />
      {/* Dark warm overlay to enhance focus and contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/70 backdrop-blur-[2px]" />

      {/* Main Center Content */}
      <div className="relative z-10 w-full max-w-[480px] flex flex-col items-center text-center my-auto">
        
        {/* Brand Logo & Titles (Exact match to reference image) */}
        <div className="mb-6 flex flex-col items-center">
          <AlyatamaLogo variant="white" size="lg" className="mb-3 drop-shadow-md" />
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#D4AF37] tracking-[0.2em] uppercase mb-1">
            SISTEM MANAJEMEN PROPERTI TERPADU (PMS)
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-wide leading-tight drop-shadow-sm">
            Portal Manajemen<br />Operasional
          </h1>
        </div>

        {/* Glassmorphism Login Card */}
        <div className="w-full bg-[#1F1710]/75 backdrop-blur-md border border-[#806044]/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
          
          {step === 'credentials' && (
            <>
              {/* Card Header */}
              <div className="mb-5 pb-3 border-b border-[#4D3B2E]/60">
                <div className="flex items-center gap-2.5 text-[#E7D8C5]">
                  <div className="w-8 h-8 rounded-full bg-[#806044]/30 border border-[#C6A47B]/40 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-[#C6A47B]" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                      Masuk ke Portal Operasional
                    </h2>
                    <p className="text-[11px] text-stone-300">
                      Gunakan kredensial yang telah didaftarkan oleh Administrator.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message Pill */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Input */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-200 mb-1.5">
                    Username atau Email Staf
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Contoh: admin atau rahmat"
                      className="w-full bg-[#140E0A]/80 border border-[#5E4532] rounded-xl pl-10 pr-3 py-3 text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C6A47B] focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-200 mb-1.5">
                    PIN Akses / Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Masukkan PIN..."
                      className="w-full bg-[#140E0A]/80 border border-[#5E4532] rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C6A47B] focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-200 focus:outline-none"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button (Exact pill style from reference image) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-[#C6A47B] hover:bg-[#B38F64] active:bg-[#9E7D56] text-[#221811] py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Memverifikasi Akun...</span>
                  ) : (
                    <>
                      <span>Masuk ke Sistem (panel)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Card Footer: Back to public website */}
              <div className="mt-5 pt-4 border-t border-[#4D3B2E]/60 flex items-center justify-between text-[11px] text-stone-300">
                <span>Bukan pengelola atau staf?</span>
                <Link
                  href="/"
                  className="text-[#C6A47B] hover:text-white font-medium transition inline-flex items-center gap-1"
                >
                  Pesan Kamar di Website Pengunjung &rarr;
                </Link>
              </div>
            </>
          )}

          {/* STEP 2: SHIFT CONFIRMATION FOR STAFF */}
          {step === 'shift_confirmation' && authenticatedUser && (
            <div className="space-y-4">
              <div className="border-b border-[#4D3B2E]/60 pb-3">
                <div className="inline-flex items-center gap-1.5 bg-[#C6A47B]/20 text-[#C6A47B] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Konfirmasi Shift Harian</span>
                </div>
                <h2 className="text-base font-bold text-white">
                  Mulai Shift Bertugas
                </h2>
                <p className="text-xs text-stone-300 mt-0.5">
                  Konfirmasi nama staf sebelum melayani reservasi dan transaksi tamu.
                </p>
              </div>

              <div className="bg-[#140E0A]/90 border border-[#806044]/40 p-3.5 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Petugas Bertugas:</span>
                  <strong className="text-white">{authenticatedUser.full_name}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Peran:</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#355C46] text-white">
                    STAFF OPERASIONAL
                  </span>
                </div>
              </div>

              <form onSubmit={handleStartShiftSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-200 mb-1">
                    Catatan Shift (Opsional)
                  </label>
                  <input
                    type="text"
                    value={shiftNotes}
                    onChange={(e) => setShiftNotes(e.target.value)}
                    placeholder="Contoh: Shift Pagi - Siang Front Office"
                    className="w-full bg-[#140E0A]/80 border border-[#5E4532] rounded-xl px-3 py-2.5 text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C6A47B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#C6A47B] hover:bg-[#B38F64] text-[#221811] py-3 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? 'Memulai Shift...' : 'Mulai Shift & Buka Panel'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
