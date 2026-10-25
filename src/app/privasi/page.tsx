import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';

export default function PrivasiPage() {
  return (
    <>
      <PublicNavbar />

      <main className="flex-1 bg-[#F6F0E7] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-1.5 bg-[#806044]/15 text-[#806044] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Perlindungan Data Pribadi</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#392B21] tracking-tight mb-4">
              Kebijakan Privasi Tamu
            </h1>
            <p className="text-sm text-[#756A5F] leading-relaxed">
              ALYATAMA HOMESTAY menjunjung tinggi amanah dan kerahasiaan data pribadi seluruh tamu serta penyewa properti.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E5DCD0] p-8 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-[#756A5F] leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-serif text-lg font-bold text-[#392B21] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#806044]" />
                1. Data yang Kami Kumpulkan
              </h2>
              <p>
                Ketika Anda mengajukan reservasi melalui situs resmi ALYATAMA HOMESTAY, kami hanya meminta informasi yang diperlukan untuk pemrosesan reservasi dan kepatuhan administrasi:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#392B21]">
                <li>Nama lengkap tamu utama sesuai kartu identitas resmi (KTP/SIM/Paspor).</li>
                <li>Nomor WhatsApp aktif untuk koordinasi kedatangan, konfirmasi admin, dan pengiriman bukti.</li>
                <li>Alamat email (opsional).</li>
                <li>Tanggal menginap, model sewa (Harian, Bulanan, Tahunan), serta jumlah tamu.</li>
                <li>Bukti transfer deposit atau pembayaran yang disimpan dalam sistem penyimpanan terenkripsi.</li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#E5DCD0]">
              <h2 className="font-serif text-lg font-bold text-[#392B21] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#65715A]" />
                2. Kebijakan Pengiriman WhatsApp Manual (Tanpa Spam)
              </h2>
              <p>
                Kami menghormati kenyamanan komunikasi Anda dan <strong>TIDAK PERNAH</strong> melakukan spam atau broadcast promosi tanpa izin:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#392B21]">
                <li>
                  Pengiriman ringkasan reservasi, bukti pembayaran, dan petunjuk lokasi via WhatsApp hanya dilakukan jika Anda secara eksplisit mencentang persetujuan WhatsApp pada formulir pemesanan.
                </li>
                <li>
                  Setiap pesan dikirimkan secara manual dan personal oleh staf pengelola ALYATAMA HOMESTAY yang bertugas di Bangkinang Kota.
                </li>
                <li>
                  Jika Anda tidak menyetujui pengiriman WhatsApp, Anda tetap dapat memantau status pesanan, mengunduh slip, atau mencetak bukti pemesanan langsung melalui situs kami.
                </li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#E5DCD0]">
              <h2 className="font-serif text-lg font-bold text-[#392B21] flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-[#806044]" />
                3. Perlindungan & Keamanan Data
              </h2>
              <p>
                Seluruh data transaksi dan catatan tamu dilindungi oleh sistem otorisasi berlapis (Role-Based Access Control) dan database PostgreSQL Supabase dengan Row Level Security (RLS). Data pribadi Anda tidak pernah diperjualbelikan kepada pihak ketiga manapun.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
