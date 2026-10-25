'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, KeyRound, Lock, Mail, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message || 'Login gagal. Periksa kembali email dan password Anda.');
          setLoading(false);
          return;
        }

        router.push('/dashboard');
      } catch (err: any) {
        setErrorMessage(err.message || 'Terjadi kesalahan sistem saat otentikasi.');
        setLoading(false);
      }
    } else {
      // In development / preview mode before Supabase credentials are input
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    }
  };

  const handleDemoLogin = (role: string) => {
    // Quick demo login to explore roles
    router.push(`/dashboard?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-3 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/30 transition-colors">
            <Home className="w-5 h-5 text-brand-300" />
          </div>
          <span className="font-serif tracking-wider font-semibold text-2xl text-stone-50">
            ALYATAMA
          </span>
        </Link>

        <h2 className="text-center text-xl font-serif font-semibold text-stone-100">
          Masuk ke Portal Operasional Homestay
        </h2>
        <p className="mt-1 text-center text-xs text-stone-400">
          Khusus staf terdaftar: Owner, Admin, Reception, Finance, & Housekeeping.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-stone-800/90 border border-stone-700/80 py-8 px-6 sm:px-10 rounded-2xl shadow-xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Alamat Email Staf
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@alyatamahomestay.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs sm:text-sm py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              <KeyRound className="w-4 h-4" />
              {loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
            </button>
          </form>

          {/* Quick Demo Role Selector (Allows immediate inspection of all 5 roles) */}
          <div className="pt-4 border-t border-stone-700 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block text-center">
              Akses Cepat Pengujian Peran (Demo Roles)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('owner')}
                className="p-2 rounded-lg bg-stone-900 hover:bg-stone-700 border border-stone-700 text-stone-200 text-center font-medium"
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="p-2 rounded-lg bg-stone-900 hover:bg-stone-700 border border-stone-700 text-stone-200 text-center font-medium"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('reception')}
                className="p-2 rounded-lg bg-stone-900 hover:bg-stone-700 border border-stone-700 text-stone-200 text-center font-medium"
              >
                Reception
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('finance')}
                className="p-2 rounded-lg bg-stone-900 hover:bg-stone-700 border border-stone-700 text-stone-200 text-center font-medium"
              >
                Finance
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('housekeeping')}
                className="p-2 rounded-lg bg-stone-900 hover:bg-stone-700 border border-stone-700 text-stone-200 text-center font-medium"
              >
                Housekeeping
              </button>
              <Link
                href="/auth/setup"
                className="p-2 rounded-lg bg-brand-900/40 hover:bg-brand-900/60 border border-brand-700/60 text-brand-300 text-center font-medium flex items-center justify-center gap-1"
              >
                Setup DB
              </Link>
            </div>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs text-stone-400 hover:text-stone-200 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Halaman Depan Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
