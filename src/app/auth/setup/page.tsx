'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  ArrowLeft, 
  KeyRound, 
  Server,
  Layers
} from 'lucide-react';
import { getSupabaseConfigStatus } from '@/lib/supabase/check-env';

export default function SetupPage() {
  const [configStatus, setConfigStatus] = useState<{ isConfigured: boolean; missingVars: string[] }>({
    isConfigured: false,
    missingVars: [],
  });

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    const status = getSupabaseConfigStatus();
    setConfigStatus(status);
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard PMS
          </Link>
          <span className="text-xs bg-brand-500/20 text-brand-300 border border-brand-500/30 px-3 py-1 rounded-full font-medium">
            Panduan Konfigurasi Supabase Produksi
          </span>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/30 border border-brand-500/50 flex items-center justify-center text-brand-400">
              <Database className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-50">
              Setup & Integrasi Supabase — ALYATAMA HOMESTAY
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-3xl">
            Sistem ini dirancang untuk produksi dengan backend database PostgreSQL Supabase, autentikasi Supabase Auth, penyimpanan file Supabase Storage, dan perlindungan Supabase Row Level Security (RLS).
          </p>
        </div>

        {/* Current Environment Status */}
        <div className="bg-stone-800/80 border border-stone-700 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-2">
            <Server className="w-4 h-4 text-brand-400" />
            Status Koneksi Lingkungan (Environment Status)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-700/80 space-y-1.5">
              <span className="text-[11px] text-stone-400 block font-mono">NEXT_PUBLIC_SUPABASE_URL</span>
              <div className="flex items-center gap-2">
                {!configStatus.missingVars.includes('NEXT_PUBLIC_SUPABASE_URL') ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">Terkonfigurasi</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">Belum Diisi</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-700/80 space-y-1.5">
              <span className="text-[11px] text-stone-400 block font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <div className="flex items-center gap-2">
                {!configStatus.missingVars.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY') ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">Terkonfigurasi</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">Belum Diisi</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-700/80 space-y-1.5">
              <span className="text-[11px] text-stone-400 block font-mono">SUPABASE_SERVICE_ROLE_KEY</span>
              <div className="flex items-center gap-2">
                {!configStatus.missingVars.includes('SUPABASE_SERVICE_ROLE_KEY') ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">Terkonfigurasi</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">Belum Diisi</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-stone-400 leading-relaxed pt-2 border-t border-stone-700">
            {configStatus.isConfigured ? (
              <span className="text-emerald-400 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Seluruh variabel koneksi Supabase telah terisi! Data akan tersimpan persisten ke database Supabase.
              </span>
            ) : (
              <span>
                Saat ini variabel Supabase belum dihubungkan di file <code>.env.local</code> atau Vercel Environment Variables. Sistem berjalan dalam <strong>Mode Pratinjau Interaktif (Memory PMS)</strong> sehingga Anda tetap dapat menguji seluruh alur kerja, reservasi, pembayaran, dan ekspor tanpa crash!
              </span>
            )}
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-6">
          <h2 className="text-lg font-serif font-semibold text-stone-200">
            4 Langkah Menghubungkan Supabase Produksi
          </h2>

          {/* Langkah 1 */}
          <div className="bg-stone-800/60 border border-stone-700 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs">
                1
              </span>
              Buat Project di Supabase
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Buka <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-brand-400 underline">supabase.com</a>, buat project baru dengan nama <strong>alyatama-homestay</strong>, pilih region terdekat (misal: Singapore), dan simpan password database.
            </p>
          </div>

          {/* Langkah 2 */}
          <div className="bg-stone-800/60 border border-stone-700 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs">
                2
              </span>
              Jalankan Migration SQL
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Buka menu <strong>SQL Editor</strong> di dashboard Supabase Anda, lalu salin dan jalankan file migrasi berikut secara berurutan:
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-stone-900 rounded-lg border border-stone-700 text-stone-300 flex items-center justify-between">
                <span>1. supabase/migrations/20261025000001_initial_schema.sql</span>
                <span className="text-[10px] text-stone-500 font-sans">Skema tabel & relasi</span>
              </div>
              <div className="p-3 bg-stone-900 rounded-lg border border-stone-700 text-stone-300 flex items-center justify-between">
                <span>2. supabase/migrations/20261025000002_rls_and_functions.sql</span>
                <span className="text-[10px] text-stone-500 font-sans">RLS & fungsi atomik approval</span>
              </div>
              <div className="p-3 bg-stone-900 rounded-lg border border-stone-700 text-stone-300 flex items-center justify-between">
                <span>3. supabase/migrations/20261025000003_property_seed.sql</span>
                <span className="text-[10px] text-stone-500 font-sans">Data lokasi terverifikasi</span>
              </div>
              <div className="p-3 bg-stone-900 rounded-lg border border-stone-700 text-stone-300 flex items-center justify-between">
                <span>4. supabase/storage_setup.sql</span>
                <span className="text-[10px] text-stone-500 font-sans">Bucket storage foto & bukti</span>
              </div>
            </div>
          </div>

          {/* Langkah 3 */}
          <div className="bg-stone-800/60 border border-stone-700 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs">
                3
              </span>
              Masukkan Kredensial ke .env.local atau Vercel
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Buka menu <strong>Project Settings &gt; API</strong> di Supabase. Salin URL dan Keys ke file <code>.env.local</code> di komputer lokal atau tambahkan ke menu <strong>Settings &gt; Environment Variables</strong> di project Vercel Anda:
            </p>
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 font-mono text-xs text-brand-300 space-y-1">
              <div>NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
              <div>SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...</div>
            </div>
          </div>

          {/* Langkah 4 */}
          <div className="bg-stone-800/60 border border-stone-700 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs">
                4
              </span>
              Bootstrap Akun Pemilik (Owner) Pertama Secara Aman
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Setelah mendaftar akun staf pertama melalui Supabase Auth (atau form login), berikan role <code>owner</code> pada tabel <code>public.user_roles</code>:
            </p>
            <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 font-mono text-xs text-stone-300">
              INSERT INTO public.user_roles (user_id, role) VALUES (&apos;USER_UUID_DARI_AUTH&apos;, &apos;owner&apos;);
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
