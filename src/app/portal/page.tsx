'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  Lock, 
  ArrowRight, 
  Building2, 
  Users, 
  DollarSign, 
  BedDouble, 
  Sparkles,
  Home,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import AlyatamaLogo from '@/components/common/AlyatamaLogo';
import { UserRole } from '@/lib/types';

interface RoleOption {
  role: UserRole;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  icon: React.ElementType;
}

const ROLES: RoleOption[] = [
  {
    role: 'owner',
    title: 'Owner / Pemilik Homestay',
    badge: 'Akses Utama',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Pemantauan laporan keuangan komprehensif, laba rugi, audit log, dan kebijakan strategis properti.',
    icon: Building2,
  },
  {
    role: 'admin',
    title: 'Admin Homestay',
    badge: 'Kendali Penuh',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Pengendalian website publik, foto iklan, manajemen kamar, tarif harian/bulanan/tahunan, dan persetujuan reservasi.',
    icon: ShieldCheck,
  },
  {
    role: 'reception',
    title: 'Resepsionis & Front Office',
    badge: 'Operasional Harian',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    description: 'Penerimaan tamu, verifikasi pembayaran, check-in, check-out, WhatsApp consent, dan pantauan status kamar.',
    icon: Users,
  },
  {
    role: 'finance',
    title: 'Staf Keuangan & Kasir',
    badge: 'Finansial',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    description: 'Pencatatan pemasukan, pengeluaran operasional, deposit jaminan, pelunasan sewa, dan piutang.',
    icon: DollarSign,
  },
  {
    role: 'housekeeping',
    title: 'Housekeeping & Fasilitas',
    badge: 'Kebersihan',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    description: 'Pembersihan kamar berkala, rotasi linen, pemeriksaan kelengkapan amenities, dan laporan perbaikan fasilitas.',
    icon: Sparkles,
  },
];

export default function PortalLoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [pin, setPin] = useState('1234');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // PIN check simulator (standard internal access: 1234 or any 4 digits)
    if (!pin || pin.length < 4) {
      setErrorMsg('Masukkan PIN akses minimal 4 digit.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      // Navigate to internal PMS dashboard with the selected role
      router.push(`/dashboard?role=${selectedRole}`);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#1F1712] text-stone-100 flex flex-col justify-between selection:bg-[#806044] selection:text-white">
      {/* Top Bar with Security Notice */}
      <header className="border-b border-[#3d2f25] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlyatamaLogo variant="white" size="sm" />
          <div className="hidden sm:block border-l border-stone-700 pl-3">
            <span className="text-[11px] font-semibold text-[#C9A84C] uppercase tracking-wider block">
              Internal Property Management System
            </span>
            <span className="text-[10px] text-stone-400">Portal Khusus Pengelola & Staf</span>
          </div>
        </div>

        <div>
          <Link
            href="/"
            className="text-xs text-stone-400 hover:text-white flex items-center gap-1.5 transition px-3 py-1.5 rounded-lg border border-stone-800 hover:border-stone-700"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Kembali ke Website Pengunjung</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 my-6">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Brand & Security Information */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#806044]/30 border border-[#806044]/50 text-[#E7D8C5] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                <Lock className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>Area Terbatas Pengelola</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                Portal Manajemen ALYATAMA
              </h1>
              <p className="text-xs sm:text-sm text-stone-400 mt-3 leading-relaxed">
                Akses terpadu bagi Pemilik (Owner), Admin, Resepsionis, Staf Keuangan, dan Tim Housekeeping untuk mengelola seluruh aspek operasional homestay.
              </p>
            </div>

            <div className="bg-[#291F18] border border-[#443326] p-4 rounded-2xl space-y-3 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Sistem Terpisah dari Pengunjung</strong>
                  <span className="text-[11px] text-stone-400">Website tamu dan portal admin beroperasi secara independen demi keamanan dan privasi.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Kontrol Penuh Tampilan & Iklan</strong>
                  <span className="text-[11px] text-stone-400">Admin memiliki wewenang mengunggah brosur, mengatur nama/tipe kamar, dan tarif sewa.</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-stone-500">
              Untuk bantuan teknis atau reset hak akses, hubungi administrator sistem ALYATAMA HOMESTAY.
            </div>
          </div>

          {/* Right Column: Role Selector & Login Form */}
          <div className="lg:col-span-7 bg-[#2A1F18] border border-[#4D3B2E] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                Pilih Peran Akses & Masuk Sistem
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Pilih jabatan operasional Anda untuk disesuaikan dengan izin modul yang berhak diakses.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Role Selection Radio Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Peran / Jabatan Operasional
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ROLES.map((r) => {
                    const isSelected = selectedRole === r.role;
                    const Icon = r.icon;

                    return (
                      <button
                        type="button"
                        key={r.role}
                        onClick={() => setSelectedRole(r.role)}
                        className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#3E2D21] border-[#C9A84C] shadow-md ring-1 ring-[#C9A84C]'
                            : 'bg-[#221812] border-[#443326] hover:border-stone-600 text-stone-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 w-full mb-1.5">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-[#C9A84C]' : 'text-stone-500'}`} />
                            <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-stone-300'}`}>
                              {r.title.split('/')[0]}
                            </span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border ${r.badgeColor}`}>
                            {r.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed">
                          {r.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PIN / Access Key */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-300">
                    PIN Akses Staf (Default Demo: 1234)
                  </label>
                  <span className="text-[10px] text-stone-500">Mode Cepat Terverifikasi</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    maxLength={8}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Masukkan PIN staf..."
                    className="w-full bg-[#1C140F] border border-[#443326] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#806044] hover:bg-[#6c5037] text-white py-3 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Memverifikasi Akses...</span>
                ) : (
                  <>
                    <span>Buka Sistem Operasional ({selectedRole.toUpperCase()})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-[#443326] flex items-center justify-between text-[11px] text-stone-400">
              <span>Bukan staf atau admin?</span>
              <Link href="/" className="text-[#C9A84C] hover:underline">
                Pesan Kamar di Website Pengunjung &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#3d2f25] py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} ALYATAMA HOMESTAY — Sistem Manajemen Properti Terpadu (PMS). Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}
