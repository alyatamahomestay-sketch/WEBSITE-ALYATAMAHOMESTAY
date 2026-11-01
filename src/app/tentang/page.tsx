import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Sparkles, MapPin, ArrowRight, HeartHandshake, BookOpen, Clock, Building2 } from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import AlyatamaLogo from '@/components/common/AlyatamaLogo';

export default function TentangPage() {
  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <PublicNavbar />

      <main className="flex-1 bg-[#F6F0E7] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-1.5 bg-[#806044]/15 text-[#806044] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Profil & Visi Dakwah</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#392B21] tracking-tight mb-4">
              Tentang ALYATAMA HOMESTAY
            </h1>
            <p className="text-sm text-[#756A5F] leading-relaxed">
              Penginapan Syariah di Bangkinang Kota, Kabupaten Kampar, Riau. Menghadirkan kenyamanan istirahat bernuansa Islami sekaligus sarana ibadah jariyah yang mengalirkan keberkahan.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E5DCD0] p-8 sm:p-12 shadow-sm space-y-8">
            
            {/* Tagline & Core Philosophy */}
            <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-2xl border border-[#E5DCD0] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E5DCD0]">
                <AlyatamaLogo variant="dark" size="lg" />
                <div className="sm:text-right">
                  <span className="text-xs bg-[#806044]/15 text-[#806044] px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block">
                    Bersih, Nyaman dan Berkah
                  </span>
                </div>
              </div>
              <h2 className="font-serif font-bold text-xl text-[#392B21]">
                &ldquo;Nikmati Kenyamanan, Raih Ibadah Jariyah&rdquo;
              </h2>
              <p className="text-xs sm:text-sm text-[#756A5F] leading-relaxed">
                &ldquo;Investasi terbaik adalah saat manfaatnya terus mengalir, bahkan setelah kita tiada.&rdquo; Setiap reservasi yang Anda lakukan bukan semata-mata transaksi komersial, tetapi merupakan kontribusi nyata bagi kelangsungan operasional dan pendidikan santri di <strong>Panti Asuhan Putra Muhammadiyah Bangkinang</strong>.
              </p>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs sm:text-sm text-[#392B21] leading-relaxed">
              <h2 className="font-serif text-xl font-bold text-[#392B21]">
                Akomodasi Fleksibel: Harian dan Bulanan
              </h2>
              <p className="text-[#756A5F]">
                ALYATAMA HOMESTAY berlokasi strategis di <strong>Jl. Mayor Ali Rasyid No 19 Bangkinang Kota</strong>, tepat di belakang SPBU Bangkinang Kota dan bersebelahan dengan Rumah Sakit Norpa Husada. Posisi ini memberikan kemudahan mobilitas baik bagi Anda yang bertugas dinas, keluarga yang berkunjung atau menjenguk kerabat di rumah sakit, maupun profesional yang membutuhkan hunian jangka panjang.
              </p>
              <p className="text-[#756A5F]">
                Kami menyediakan fleksibilitas sistem sewa:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#392B21]">
                <li><strong>Sewa Harian:</strong> Tarif terjangkau untuk kebutuhan transit, kunjungan keluarga, dan pelancong wisata Kampar.</li>
                <li><strong>Sewa Bulanan:</strong> Solusi hemat dan nyaman bagi staf instansi pemerintah, pegawai BUMN, tenaga kesehatan, atau pekerja proyek di Bangkinang.</li>
              </ul>
            </div>

            {/* Core Values */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#E5DCD0]">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#65715A]/15 text-[#65715A] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#392B21] text-sm">Prinsip & Adab Syariah</h3>
                <p className="text-xs text-[#756A5F]">
                  Menjaga adab bertamu, lingkungan bebas alkohol dan rokok di kamar, serta mengharuskan ikatan sah bagi pasangan suami-istri.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#806044]/15 text-[#806044] flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#392B21] text-sm">Ibadah Jariyah Mengalir</h3>
                <p className="text-xs text-[#756A5F]">
                  Mendukung kegiatan dakwah, santri yatim, dan pendidikan Islami di bawah binaan Persyarikatan Muhammadiyah Bangkinang.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/25 text-[#806044] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#392B21] text-sm">Fasilitas Modern & Terawat</h3>
                <p className="text-xs text-[#756A5F]">
                  AC dingin di seluruh kamar, kasur bersih berstandar, kamar mandi higienis, WiFi cepat, dan keamanan 24 jam.
                </p>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="pt-6 border-t border-[#E5DCD0] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#756A5F]">
                <span>Alamat: Jl. Mayor Ali Rasyid No 19 Bangkinang Kota, Kampar, Riau.</span>
              </div>
              <Link
                href="/booking"
                className="bg-[#806044] hover:bg-[#6c5037] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-md inline-flex items-center gap-2"
              >
                Pesan Kamar Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
