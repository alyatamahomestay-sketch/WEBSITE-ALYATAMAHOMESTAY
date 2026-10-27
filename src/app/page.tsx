import React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Wifi, 
  Wind, 
  CheckCircle2, 
  ArrowRight,
  PhoneCall,
  HeartHandshake,
  Lock,
  Building2,
  BedDouble,
  Shield,
  Phone
} from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import RoomCard from '@/components/public/RoomCard';
import AlyatamaLogo from '@/components/common/AlyatamaLogo';
import { PmsService } from '@/lib/services/pms-service';

export const revalidate = 0;

export default async function HomePage() {
  const rooms = await PmsService.getRooms();
  const property = await PmsService.getPropertySettings();

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden font-sans">
      <PublicNavbar />

      <main className="flex-1 bg-[#F9F7F2]">
        {/* HERO SECTION WITH BALANCED ISLAMIC EMERALD & WARM BROWN */}
        <section className="relative w-full bg-[#30231A] text-[#F7F4ED] overflow-hidden">
          {/* Subtle Background Pattern & Flyer Backdrop */}
          <div className="absolute inset-0 opacity-15 mix-blend-luminosity">
            <img
              src="/images/alyatama-flyer.jpg"
              alt="Alyatama Homestay Bangkinang"
              className="w-full h-full object-cover object-center filter blur-[1px]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#211711] via-[#2F2117]/95 to-[#1D3225]/85" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
              
              {/* Left Column: Headlines & Call to Action */}
              <div className="lg:col-span-7 space-y-6 min-w-0">
                <div className="inline-flex items-center gap-2 bg-[#1C3627]/80 border border-emerald-500/40 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Penginapan Syariah — Bersih, Nyaman dan Berkah</span>
                </div>

                <div className="space-y-3">
                  <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                    Nikmati Kenyamanan, <br />
                    <span className="text-[#E7C794] italic font-serif">Raih Ibadah Jariyah.</span>
                  </h1>
                  <p className="text-sm sm:text-base text-stone-300 leading-relaxed pt-1 max-w-2xl">
                    Akomodasi berprinsip Syariah di jantung Bangkinang Kota, Kampar, Riau. Menyediakan pilihan sewa 
                    <strong className="text-emerald-300 font-semibold"> Harian, Bulanan, dan Tahunan</strong>. Setiap pemesanan Anda turut mendukung kegiatan dakwah dan pendidikan santri yatim.
                  </p>
                </div>

                {/* Verified Location & Contact Pill */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-stone-300 pt-1">
                  <div className="flex items-center gap-2 bg-[#20150F]/80 px-3.5 py-2 rounded-xl border border-[#443123]">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Jl. Mayor Ali Rasyid No. 19, Bangkinang Kota</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#20150F]/80 px-3.5 py-2 rounded-xl border border-[#443123]">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Check-in 14:00 | Check-out 12:00 WIB</span>
                  </div>
                </div>

                {/* CTAs with Balanced Islamic Forest Green & Warm Luxury Brown */}
                <div className="pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                  <Link
                    href="/booking"
                    className="bg-[#24523B] hover:bg-[#1D4330] text-white font-medium px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 text-sm border border-emerald-500/30"
                  >
                    Ajukan Reservasi Kamar
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/cek-ketersediaan"
                    className="bg-transparent hover:bg-emerald-950/30 text-stone-200 hover:text-white border border-emerald-600/40 font-medium px-5 py-3.5 rounded-xl transition-colors inline-flex items-center gap-2 text-sm"
                  >
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Cek Ketersediaan Kamar
                  </Link>
                  <a
                    href="https://wa.me/6282285472008"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#6B4B31] hover:bg-[#5A3E28] text-white text-xs px-4 py-3.5 rounded-xl inline-flex items-center gap-2 transition shadow-xs border border-[#8C6343]/40"
                  >
                    <Phone className="w-4 h-4 text-emerald-300" />
                    <span>WA: 0822 8547 2008</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Authentic Preview Card with Solid White Logo */}
              <div className="lg:col-span-5 min-w-0 w-full">
                <div className="bg-[#251A13] border-2 border-emerald-800/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden w-full max-w-md mx-auto lg:max-w-none">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#3D2B1F] gap-2">
                    <div className="flex items-center gap-2.5">
                      <AlyatamaLogo variant="white" size="sm" />
                      <span className="text-[10px] text-emerald-400 font-semibold tracking-wide border-l border-[#4A3526] pl-2.5">
                        Bangkinang Kota
                      </span>
                    </div>
                    <span className="text-[11px] bg-emerald-900/60 border border-emerald-600/50 text-emerald-200 px-2.5 py-0.5 rounded-full font-medium shrink-0">
                      Prinsip Syariah
                    </span>
                  </div>

                  <div className="rounded-xl overflow-hidden aspect-[4/3] relative mb-4 border border-[#3D2B1F]">
                    <img
                      src="/images/alyatama-flyer.jpg"
                      alt="Flyer Resmi Alyatama Homestay"
                      className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between bg-[#1C130E] px-3.5 py-2.5 rounded-xl border border-[#332318] text-stone-300">
                      <span className="font-medium text-stone-200">Pilihan Model Sewa:</span>
                      <span className="text-emerald-300 font-semibold">Harian • Bulanan • Tahunan</span>
                    </div>
                    <p className="text-[11px] text-stone-400 italic text-center pt-1">
                      &ldquo;Mendukung Dakwah & Pendidikan Islam — Mari Jadi Bagian dari Kebaikan yang Terus Mengalir.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3 RENTAL MODELS WITH ELEGANT GREEN & WARM ACCENTS */}
        <section className="w-full bg-[#F3EDE2] border-y border-[#DECFC0] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 rounded-2xl border border-[#DECFC0] shadow-xs hover:border-emerald-600/50 transition-all flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-serif font-bold text-base text-[#30231A]">Sewa Harian</h3>
                  <p className="text-xs text-[#6B5E52] leading-relaxed">
                    Sangat cocok untuk keluarga, wali santri, pelancong wisata Kampar, dan perjalanan dinas singkat di Bangkinang.
                  </p>
                  <div className="pt-1">
                    <Link href="/kamar?rental=daily" className="text-xs font-semibold text-emerald-800 hover:text-emerald-700 inline-flex items-center gap-1">
                      Mulai dari Rp 250.000 / malam &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#DECFC0] shadow-xs hover:border-emerald-600/50 transition-all flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#6B4B31]/10 text-[#6B4B31] border border-[#6B4B31]/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-serif font-bold text-base text-[#30231A]">Sewa Bulanan</h3>
                  <p className="text-xs text-[#6B5E52] leading-relaxed">
                    Solusi praktis dan hemat untuk staf kantor, pegawai BUMN, tenaga medis RS Norpa Husada, dan pekerja dinas.
                  </p>
                  <div className="pt-1">
                    <Link href="/kamar?rental=monthly" className="text-xs font-semibold text-[#6B4B31] hover:text-[#5A3E28] inline-flex items-center gap-1">
                      Mulai dari Rp 2.500.000 / bulan &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#DECFC0] shadow-xs hover:border-emerald-600/50 transition-all flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-serif font-bold text-base text-[#30231A]">Sewa Tahunan</h3>
                  <p className="text-xs text-[#6B5E52] leading-relaxed">
                    Hunian tahunan eksklusif berfasilitas lengkap dengan privasi terjamin, lingkungan aman, dan akad Syariah tenang.
                  </p>
                  <div className="pt-1">
                    <Link href="/kamar?rental=yearly" className="text-xs font-semibold text-emerald-800 hover:text-emerald-700 inline-flex items-center gap-1">
                      Mulai dari Rp 24.000.000 / tahun &rarr;
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 6 CORE FACILITIES */}
        <section className="w-full py-16 sm:py-24 bg-[#F9F7F2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 block mb-2">
                Fasilitas Unggulan Properti
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#30231A] mb-3">
                Fasilitas Nyaman Berstandar Syariah
              </h2>
              <p className="text-xs sm:text-sm text-[#6B5E52] leading-relaxed">
                Semua fasilitas dirancang agar Anda dapat beristirahat dengan tenang, menjaga ibadah, dan merasa aman selama menginap di Bangkinang Kota.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Facility 1 */}
              <div className="bg-white p-6 rounded-2xl border border-[#DECFC0] shadow-xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-100">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-semibold text-base text-[#30231A] mb-2">
                  1. Lingkungan Islami & Nyaman
                </h3>
                <p className="text-xs text-[#6B5E52] leading-relaxed">
                  Suasana syiar yang menenangkan, dekat dengan sarana ibadah, bebas dari kebisingan dan hal-hal maksiat yang mengganggu kekhusyukan.
                </p>
              </div>

              {/* Facility 2 */}
              <div className="bg-white p-6 rounded-2xl border border-[#DECFC0] shadow-xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-[#6B4B31]/10 text-[#6B4B31] flex items-center justify-center mb-4 border border-[#6B4B31]/20">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-semibold text-base text-[#30231A] mb-2">
                  2. Aman & Privasi Terjaga
                </h3>
                <p className="text-xs text-[#6B5E52] leading-relaxed">
                  Akses teratur dan terjaga, menjamin privasi tamu keluarga dan perorangan sesuai adab menginap yang santun dan terhormat.
                </p>
              </div>

              {/* Facility 3 */}
              <div className="bg-white p-6 rounded-2xl border border-[#DECFC0] shadow-xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-100">
                  <BedDouble className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-semibold text-base text-[#30231A] mb-2">
                  3. Kamar Bersih & Nyaman
                </h3>
                <p className="text-xs text-[#6B5E52] leading-relaxed">
                  Kasur berkualitas, sprei higienis yang rutin disterilisasi, kamar mandi dalam bersih, serta sirkulasi udara yang sehat.
                </p>
              </div>

              {/* Facility 4 */}
              <div className="bg-white p-6 rounded-2xl border border-[#DECFC0] shadow-xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-[#6B4B31]/10 text-[#6B4B31] flex items-center justify-center mb-4 border border-[#6B4B31]/20">
                  <Wifi className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-semibold text-base text-[#30231A] mb-2">
                  4. Wi-Fi Gratis Berkecepatan Tinggi
                </h3>
                <p className="text-xs text-[#6B5E52] leading-relaxed">
                  Koneksi internet nirkabel lancar di setiap sudut homestay untuk kebutuhan bekerja daring, koordinasi tugas, atau komunikasi keluarga.
                </p>
              </div>

              {/* Facility 5 */}
              <div className="bg-white p-6 rounded-2xl border border-[#DECFC0] shadow-xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-100">
                  <Wind className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-semibold text-base text-[#30231A] mb-2">
                  5. AC di Setiap Kamar
                </h3>
                <p className="text-xs text-[#6B5E52] leading-relaxed">
                  Setiap unit kamar dilengkapi pendingin ruangan (AC) dingin dan terawat demi kenyamanan istirahat maksimal siang dan malam.
                </p>
              </div>

              {/* Facility 6 */}
              <div className="bg-white p-6 rounded-2xl border border-[#DECFC0] shadow-xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-[#6B4B31]/10 text-[#6B4B31] flex items-center justify-center mb-4 border border-[#6B4B31]/20">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-semibold text-base text-[#30231A] mb-2">
                  6. Keamanan 24 Jam
                </h3>
                <p className="text-xs text-[#6B5E52] leading-relaxed">
                  Pengawasan lingkungan terpadu dan keamanan 24 jam dengan area parkir kendaraan yang aman untuk mobil dan motor Anda.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CHARITY & DAKWAH ISLAMI BANNER IN NOBLE ISLAMIC FOREST GREEN */}
        <section className="w-full bg-gradient-to-br from-[#1A3325] via-[#214331] to-[#152B1F] text-[#F7F4ED] py-14 border-y border-emerald-800/40 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="bg-[#14261C]/90 border border-emerald-600/40 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
                <div className="lg:col-span-8 space-y-4 min-w-0">
                  <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
                    <HeartHandshake className="w-4 h-4 text-emerald-400" />
                    <span>Mendukung Dakwah & Pendidikan Islam</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug">
                    &ldquo;Investasi terbaik adalah saat manfaatnya terus mengalir, bahkan setelah kita tiada.&rdquo;
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                    Setiap pemesanan yang Anda lakukan di ALYATAMA HOMESTAY bukan sekadar sewa kamar, melainkan wujud nyata kontribusi Anda dalam mendukung operasional pembinaan santri dan kegiatan sosial di <strong>Panti Asuhan Putra Muhammadiyah Bangkinang</strong>. Mari menjadi bagian dari kebaikan yang terus mengalir.
                  </p>
                </div>
                <div className="lg:col-span-4 min-w-0 flex flex-col items-center justify-center text-center p-6 bg-[#0E1B13] rounded-2xl border border-emerald-800/50">
                  <AlyatamaLogo variant="white" size="lg" className="mb-2" />
                  <span className="text-xs text-emerald-400 mb-4 font-semibold">Penginapan Syariah Pilihan Umat</span>
                  <Link
                    href="/tentang"
                    className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm border border-emerald-500/40"
                  >
                    Pelajari Misi Kami &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROOMS SHOWCASE */}
        <section className="w-full py-16 sm:py-24 bg-[#F9F7F2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 block mb-1">
                  Pilihan Kamar & Tarif
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#30231A]">
                  Kamar Bersih, Tenang, dan Higienis
                </h2>
              </div>
              <Link
                href="/kamar"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-emerald-800 hover:text-emerald-950 font-semibold group"
              >
                Lihat seluruh daftar kamar & harga
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {rooms.slice(0, 3).map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        </section>

        {/* VERIFIED LOCATION BANGKINANG KOTA */}
        <section className="w-full py-16 sm:py-24 bg-white border-y border-[#DECFC0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Lokasi Terverifikasi Bangkinang Kota</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#30231A] leading-tight">
                  Lokasi Strategis di Pusat Kota Bangkinang, Kampar
                </h2>

                <p className="text-xs sm:text-sm text-[#6B5E52] leading-relaxed">
                  Homestay beralamat resmi di:
                  <strong className="block text-[#30231A] font-semibold mt-1">
                    Jl. Mayor Ali Rasyid No 19 Bangkinang Kota, Panti Asuhan Putra Muhammadiyah, Daerah Kampar, Kabupaten Kampar, Riau 28411, Indonesia.
                  </strong>
                </p>

                <div className="space-y-3 text-xs text-[#6B5E52] pt-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Patokan Mudah:</strong> Tepat di belakang SPBU Bangkinang Kota dan di samping Rumah Sakit Norpa Husada.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Akses Kendaraan:</strong> Jalan aspal lebar, mudah diakses kendaraan roda empat maupun roda dua, dilengkapi parkir aman.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Fasilitas Sekitar:</strong> Dekat masjid, rumah sakit, SPBU 24 jam, sentra kuliner halal, dan pusat perkantoran Kabupaten Kampar.</span>
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <a
                    href="https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#24523B] hover:bg-[#1D4330] text-white text-xs sm:text-sm font-medium px-5 py-3 rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm border border-emerald-600/30"
                  >
                    Petunjuk Arah Google Maps
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="https://wa.me/6282285472008"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-[#785437] text-[#785437] hover:bg-[#785437]/10 text-xs sm:text-sm font-medium px-4 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Hubungi Pengelola: 0822 8547 2008
                  </a>
                </div>
              </div>

              {/* Card Summary Map */}
              <div className="lg:col-span-5">
                <div className="bg-[#FAF7F2] border border-[#DECFC0] p-6 rounded-3xl space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DECFC0]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#785437]">
                      Koordinat Titik Lokasi
                    </span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-medium border border-emerald-200">
                      Aktif & Terverifikasi
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-stone-500 block text-[11px]">Nama Properti</span>
                      <span className="font-bold text-[#30231A]">ALYATAMA HOMESTAY</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[11px]">Alamat Lengkap</span>
                      <span className="text-stone-700">Jl. Mayor Ali Rasyid No 19 Bangkinang Kota</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[11px]">Landmark Penting</span>
                      <span className="text-stone-700 font-medium">Belakang SPBU Bangkinang Kota / Samping RS Norpa Husada</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[11px]">Kabupaten & Provinsi</span>
                      <span className="text-stone-700">Kabupaten Kampar, Riau 28411</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DECFC0]">
                    <a
                      href="https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center block bg-[#30231A] hover:bg-[#20150F] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
                    >
                      Buka Koordinat Maps Langsung &rarr;
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* BOOKING CALL TO ACTION IN HARMONIOUS GREEN & WARM PALETTE */}
        <section className="w-full bg-[#EFE8DC] py-16 text-center border-t border-[#DECFC0]">
          <div className="max-w-3xl mx-auto px-4 w-full">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#30231A] mb-3">
              Rencanakan Menginap Bersama ALYATAMA
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5E52] mb-8 leading-relaxed">
              Ajukan permintaan reservasi untuk sewa Harian, Bulanan, maupun Tahunan. Petugas front desk kami akan segera memeriksa ketersediaan dan mengirimkan konfirmasi resmi.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/booking"
                className="bg-[#24523B] hover:bg-[#1D4330] text-white font-semibold text-sm px-7 py-3.5 rounded-xl shadow-md transition-all border border-emerald-600/30"
              >
                Isi Formulir Reservasi Sekarang
              </Link>
              <Link
                href="/status-reservasi"
                className="bg-white hover:bg-stone-50 text-[#30231A] border border-[#DECFC0] font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors shadow-xs"
              >
                Lacak Status Reservasi Anda
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
