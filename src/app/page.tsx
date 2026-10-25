import React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Wifi, 
  Car, 
  Coffee, 
  Wind, 
  CheckCircle2, 
  ArrowRight,
  PhoneCall
} from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import RoomCard from '@/components/public/RoomCard';
import { PmsService } from '@/lib/services/pms-service';

export const revalidate = 0;

export default async function HomePage() {
  const rooms = await PmsService.getRooms();
  const property = await PmsService.getPropertySettings();

  return (
    <>
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative bg-stone-900 text-stone-100 overflow-hidden">
          {/* Subtle Background Backdrop */}
          <div className="absolute inset-0 opacity-25">
            <img
              src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1920&q=80"
              alt="Suasana ALYATAMA HOMESTAY"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-300 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Penginapan Nyaman & Bersih di Jambi</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight">
                {property.name || 'ALYATAMA HOMESTAY'}
              </h1>

              <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                {property.description || 
                  'Akomodasi berstandar bersih dan tenang di Paal Merah, Kota Jambi. Dirancang untuk kenyamanan keluarga, kunjungan dinas, maupun pelancong yang mengutamakan ketenteraman dan kehangatan.'}
              </p>

              {/* Verified Location Pill */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300 pt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Bakung Jaya, Paal Merah, Jambi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Check-in 14:00 | Check-out 12:00</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/booking"
                  className="bg-brand-600 hover:bg-brand-500 text-stone-50 font-medium px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 text-sm"
                >
                  Ajukan Reservasi
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cek-ketersediaan"
                  className="bg-stone-800/80 hover:bg-stone-800 text-stone-200 border border-stone-700 font-medium px-5 py-3 rounded-xl transition-colors inline-flex items-center gap-2 text-sm"
                >
                  <Calendar className="w-4 h-4 text-brand-400" />
                  Cek Ketersediaan Kamar
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK SEARCH & AVAILABILITY BANNER */}
        <section className="bg-stone-100 border-b border-stone-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-stone-900 font-serif font-semibold text-base sm:text-lg">
                  Rencanakan Tanggal Menginap Anda
                </h2>
                <p className="text-xs text-stone-500">
                  Periksa ketersediaan unit dan tarif aktual secara langsung tanpa perantara.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Link
                  href="/cek-ketersediaan"
                  className="w-full sm:w-auto text-center bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs sm:text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                >
                  Pilih Tanggal & Periksa Ketersediaan
                </Link>
                <Link
                  href="/kamar"
                  className="w-full sm:w-auto text-center bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                  Lihat Semua Kamar ({rooms.length})
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ROOMS SHOWCASE */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-700 block mb-1">
                Pilihan Akomodasi
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">
                Pilihan Kamar Nyaman & Terawat
              </h2>
            </div>
            <Link
              href="/kamar"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-brand-700 hover:text-brand-800 font-medium group"
            >
              Lihat seluruh daftar kamar
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.slice(0, 3).map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </section>

        {/* KEY HIGHLIGHTS & VALUES */}
        <section className="bg-white border-y border-stone-200 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-700 block mb-2">
                Nilai & Standar Pelayanan
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mb-4">
                Mengapa Memilih ALYATAMA HOMESTAY?
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Kami berkomitmen memberikan ketenteraman beristirahat layaknya di rumah sendiri dengan fasilitas modern dan kebersihan yang selalu terinspeksi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 rounded-xl border border-stone-100 bg-stone-50/50 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-stone-900">Kebersihan Terstandar</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Linen dicuci bersih dan wangi, kamar mandi steril dan higienis, serta proses disinfeksi rutin setiap tamu selesai menginap.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-stone-100 bg-stone-50/50 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Wifi className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-stone-900">Koneksi Internet Cepat</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  WiFi berkecepatan tinggi tersedia di seluruh area kamar untuk menunjang pekerjaan daring maupun hiburan keluarga.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-stone-100 bg-stone-50/50 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Wind className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-stone-900">Kenyamanan Beristirahat</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Semua kamar dilengkapi pendingin udara (AC) dingin, kasur empuk berkualitas, dan kamar mandi dalam dengan water heater.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-stone-100 bg-stone-50/50 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-stone-900">Lingkungan Aman & Tenang</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Terletak di lingkungan yang aman dan hening, bebas dari kebisingan jalan protokol utama untuk tidur malam yang pulas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* VERIFIED LOCATION SECTION */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 sm:p-12 lg:p-16 border border-stone-800">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-300 px-3 py-1 rounded-full text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                  <span>Lokasi Strategis di Jambi</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
                  Mudah Dijangkau & Dekat dengan Pusat Kota
                </h2>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Homestay beralamat di:
                  <strong className="block text-white font-medium mt-1">
                    Jl. Sultan Hasanuddin, RT 01 / Bakung Jaya, Kec. Paal Merah, Kota Jambi, Jambi 36138, Indonesia.
                  </strong>
                </p>

                <div className="space-y-3 text-xs text-stone-300 border-t border-stone-800 pt-6">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Akses mudah ke Bandara Sultan Thaha Jambi & fasilitas umum.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Tersedia area parkir yang aman untuk kendaraan roda empat dan motor.</span>
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <a
                    href="https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-medium px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm"
                  >
                    Buka Petunjuk Arah di Google Maps
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <Link
                    href="/kontak"
                    className="text-stone-300 hover:text-white text-xs sm:text-sm font-medium underline underline-offset-4"
                  >
                    Halaman Kontak & Jam Operasional &rarr;
                  </Link>
                </div>
              </div>

              {/* Verified Location Card Display */}
              <div className="bg-stone-800/80 border border-stone-700 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-700">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Informasi Verifikasi Lokasi
                  </span>
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-medium">
                    Google Maps Terverifikasi
                  </span>
                </div>
                <div className="space-y-2 text-xs text-stone-300">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Nama Titik Peta</span>
                    <span className="font-semibold text-stone-100">Sentra &quot;Alyatama&quot; Jambi</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Kecamatan & Kelurahan</span>
                    <span className="text-stone-200">Paal Merah, Bakung Jaya</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Kota & Provinsi</span>
                    <span className="text-stone-200">Kota Jambi, Jambi (36138)</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-700">
                  <a
                    href="https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center block bg-stone-700 hover:bg-stone-600 text-stone-100 text-xs font-medium py-2 rounded-lg transition-colors"
                  >
                    Lihat Peta Satelit & Ulasan &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOOKING CALL TO ACTION */}
        <section className="bg-stone-100 py-16 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mb-3">
              Siap Menikmati Istirahat yang Tenang?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mb-8 leading-relaxed">
              Kirimkan formulir pemesanan kamar Anda secara online. Admin kami akan segera memeriksa ketersediaan dan menyiapkan konfirmasi resmi.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/booking"
                className="bg-brand-600 hover:bg-brand-500 text-stone-50 font-medium text-sm px-6 py-3 rounded-xl shadow-sm hover:shadow transition-all"
              >
                Isi Formulir Reservasi Sekarang
              </Link>
              <Link
                href="/status-reservasi"
                className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-medium text-sm px-5 py-3 rounded-xl transition-colors"
              >
                Sudah Memesan? Cek Status Anda
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
