import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';

export default function TentangPage() {
  return (
    <>
      <PublicNavbar />

      <main className="flex-1 bg-stone-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-700 block mb-2">
              Tentang Kami
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight mb-4">
              ALYATAMA HOMESTAY
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Sebuah hunian peristirahatan di Kota Jambi yang memadukan kehangatan pelayanan khas rumah sendiri dengan standar kebersihan dan fasilitas modern.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 shadow-sm space-y-8">
            <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <h2 className="font-serif text-xl font-semibold text-stone-900">
                Komitmen Kenyamanan & Kebersihan
              </h2>
              <p>
                ALYATAMA HOMESTAY didirikan dengan prinsip sederhana: setiap tamu berhak mendapatkan tempat beristirahat yang bersih, tenang, aman, dan menyegarkan kembali energi mereka. Baik Anda yang berkunjung ke Jambi untuk keperluan dinas instansi, menghadiri acara keluarga, maupun liburan santai, kami memastikan setiap kamar siap huni dengan standar tertinggi.
              </p>
              <p>
                Seluruh kamar kami dilengkapi pendingin udara (AC) berkualitas, tempat tidur empuk berstandar hotel, kamar mandi dalam dengan pemanas air (water heater), serta koneksi internet berkecepatan tinggi yang stabil.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-stone-100">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-stone-900 text-sm">Higienis & Terinspeksi</h3>
                <p className="text-xs text-stone-600">
                  Pembersihan menyeluruh, sanitasi linen, dan inspeksi rutin sebelum kamar diserahkan kepada tamu.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-stone-900 text-sm">Keramahan Personal</h3>
                <p className="text-xs text-stone-600">
                  Staf homestay siap membantu kebutuhan tamu dengan sopan, ramah, dan tanggap.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-stone-900 text-sm">Lokasi Bebas Bising</h3>
                <p className="text-xs text-stone-600">
                  Terletak di lingkungan yang asri dan hening di Paal Merah, menjamin kualitas istirahat tanpa gangguan suara bising jalan.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-stone-500">
                Tertarik menginap di ALYATAMA HOMESTAY?
              </p>
              <Link
                href="/booking"
                className="bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
              >
                Ajukan Reservasi Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
