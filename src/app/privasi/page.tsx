import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2 } from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';

export default function PrivasiPage() {
  return (
    <>
      <PublicNavbar />

      <main className="flex-1 bg-stone-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-700 block mb-2">
              Perlindungan Data Pribadi
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight mb-4">
              Kebijakan Privasi Tamu
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              ALYATAMA HOMESTAY berkomitmen menjaga kerahasiaan dan keamanan data pribadi setiap calon tamu serta pelanggan kami.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-600" />
                1. Data yang Kami Kumpulkan
              </h2>
              <p>
                Ketika Anda mengajukan reservasi melalui situs web ALYATAMA HOMESTAY, kami hanya meminta informasi yang diperlukan untuk pemrosesan reservasi dan administrasi perhotelan:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>Nama lengkap tamu utama sesuai kartu identitas.</li>
                <li>Nomor WhatsApp / telepon aktif untuk koordinasi kedatangan dan pengiriman bukti.</li>
                <li>Alamat email (opsional).</li>
                <li>Tanggal menginap serta jumlah tamu.</li>
                <li>Bukti transfer pembayaran atau screenshot scan QRIS (disimpan secara privat dalam storage berkeamanan tinggi).</li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-stone-100">
              <h2 className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                2. Kebijakan Komunikasi & WhatsApp Manual
              </h2>
              <p>
                Kami sangat menghargai privasi Anda dan <strong>TIDAK</strong> melakukan spam atau pengiriman pesan massal otomatis tanpa persetujuan:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>
                  Pengiriman ringkasan reservasi atau bukti pembayaran melalui WhatsApp hanya dilakukan jika Anda secara eksplisit mencentang persetujuan penerimaan WhatsApp pada formulir pemesanan.
                </li>
                <li>
                  Setiap pesan dikirimkan secara manual oleh staf resepsionis atau admin kami yang bertugas.
                </li>
                <li>
                  Apabila Anda tidak memberikan persetujuan WhatsApp, bukti pemesanan tetap dapat diakses, diunduh, atau dicetak langsung melalui halaman pelacakan status di situs kami.
                </li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-stone-100">
              <h2 className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-purple-600" />
                3. Perlindungan & Batasan Akses Data
              </h2>
              <p>
                Data transaksi, bukti pembayaran, dan identitas tamu dilindungi oleh sistem otorisasi berbasis peran (Role-Based Access Control) serta Supabase Row Level Security (RLS). Data pribadi Anda tidak akan pernah dijual atau dialihkan kepada pihak ketiga untuk kepentingan komersial di luar operasional homestay.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
