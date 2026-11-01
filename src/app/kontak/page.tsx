import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink, Sparkles, Navigation } from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import { PmsService } from '@/lib/services/pms-service';

export const revalidate = 0;

export default async function KontakPage() {
  const property = await PmsService.getPropertySettings();

  return (
    <div className="min-h-screen flex flex-col w-full">
      <PublicNavbar />

      <main className="flex-1 bg-[#F6F0E7] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-1.5 bg-[#806044]/15 text-[#806044] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Layanan Pelanggan & Lokasi</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#392B21] tracking-tight mb-4">
              Kontak & Lokasi ALYATAMA HOMESTAY
            </h1>
            <p className="text-sm text-[#756A5F] leading-relaxed">
              Kami siap melayani kebutuhan akomodasi Harian maupun Bulanan. Jangan ragu menghubungi pengelola untuk konfirmasi ketersediaan kamar, survey lokasi, atau petunjuk jalan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Contact Card */}
            <div className="bg-white rounded-3xl border border-[#E5DCD0] p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-serif font-bold text-lg text-[#392B21] pb-3 border-b border-[#FAF7F2]">
                Informasi Kontak Resmi
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-[#756A5F]">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 block">WhatsApp Resmi (Fast Response)</span>
                    <strong className="text-[#392B21] text-base block">0822 8547 2008</strong>
                    <a
                      href="https://wa.me/6282285472008"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1 mt-0.5"
                    >
                      Chat WhatsApp Pengelola &rarr;
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#806044]/15 text-[#806044] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 block">Telepon Kantor</span>
                    <strong className="text-[#392B21]">0822 8547 2008</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#65715A]/15 text-[#65715A] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 block">Email Layanan</span>
                    <span className="text-[#392B21]">alyatamahomestay@gmail.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#392B21] border border-[#E5DCD0] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 block">Jam Operasional Layanan Tamu</span>
                    <span className="text-[#392B21] font-medium">07:00 - 22:00 WIB (Keamanan Standby 24 Jam)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address & Navigation Card */}
            <div className="bg-white rounded-3xl border border-[#E5DCD0] p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-serif font-bold text-lg text-[#392B21] pb-3 border-b border-[#FAF7F2]">
                Alamat Fisik Bangkinang Kota
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-[#756A5F]">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#806044]/15 text-[#806044] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 block">Alamat Homestay</span>
                    <strong className="text-[#392B21] leading-relaxed block">
                      Jl. Mayor Ali Rasyid No 19 Bangkinang Kota, Panti Asuhan Putra Muhammadiyah, Daerah Kampar
                    </strong>
                    <span className="text-stone-600 block mt-0.5">
                      Kabupaten Kampar, Riau 28411, Indonesia
                    </span>
                  </div>
                </div>

                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E5DCD0] text-xs space-y-1">
                  <span className="font-bold text-[#806044] block">Patokan Lokasi Penting:</span>
                  <p className="text-[#392B21]">
                    Tepat di belakang SPBU Bangkinang Kota, di samping Rumah Sakit Norpa Husada.
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href="https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#392B21] hover:bg-[#2a1f17] text-white font-bold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Navigation className="w-4 h-4 text-[#C9A84C]" />
                    Buka Panduan Arah di Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Notice */}
          <div className="bg-white rounded-3xl border border-[#E5DCD0] p-6 sm:p-8 text-xs text-[#756A5F] space-y-3 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-[#392B21]">
              Informasi Penting Sebelum Berkunjung:
            </h4>
            <p>
              1. <strong>Waktu Check-in:</strong> Mulai pukul 14:00 WIB, dan waktu check-out maksimal pukul 12:00 WIB.
            </p>
            <p>
              2. <strong>Kebijakan Tamu Pasangan:</strong> Tamu pasangan pria dan wanita wajib merupakan pasangan sah suami-istri (siap menunjukkan identitas/Buku Nikah).
            </p>
            <p>
              3. <strong>Sewa Jangka Panjang:</strong> Untuk sewa bulanan, Anda dapat menghubungi admin terlebih dahulu untuk menjadwalkan survey kamar.
            </p>
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
