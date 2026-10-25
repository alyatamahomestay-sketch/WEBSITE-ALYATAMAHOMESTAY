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
    <>
      <PublicNavbar />

      <main className="flex-1 bg-[#F6F0E7]">
        {/* HERO SECTION */}
        <section className="relative bg-[#392B21] text-[#F6F0E7] overflow-hidden">
          {/* Subtle Background Pattern & Flyer Backdrop */}
          <div className="absolute inset-0 opacity-15 mix-blend-luminosity">
            <img
              src="/images/alyatama-flyer.jpg"
              alt="Alyatama Homestay Bangkinang"
              className="w-full h-full object-cover object-center filter blur-[1px]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#2a1f17] via-[#392B21]/95 to-[#392B21]/80" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Headlines & Call to Action */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#806044]/30 border border-[#C9A84C]/40 text-[#C9A84C] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>Penginapan Syariah — Bersih, Nyaman dan Berkah</span>
                </div>

                <div className="space-y-2">
                  <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                    Nikmati Kenyamanan, <br />
                    <span className="text-[#C9A84C] italic font-serif">Raih Ibadah Jariyah.</span>
                  </h1>
                  <p className="text-sm sm:text-base text-[#E7D8C5] leading-relaxed pt-2">
                    Akomodasi berprinsip Syariah di jantung Bangkinang Kota, Kampar, Riau. Menyediakan pilihan sewa 
                    <strong className="text-white font-semibold"> Harian, Bulanan, dan Tahunan</strong>. Setiap pemesanan Anda turut mendukung kegiatan dakwah dan pendidikan santri yatim.
                  </p>
                </div>

                {/* Verified Location & Contact Pill */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-[#E7D8C5] pt-1">
                  <div className="flex items-center gap-1.5 bg-[#2a1f17]/80 px-3 py-1.5 rounded-lg border border-[#4d3b2e]">
                    <MapPin className="w-4 h-4 text-[#C9A84C] shrink-0" />
                    <span>Jl. Mayor Ali Rasyid No. 19, Bangkinang Kota</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#2a1f17]/80 px-3 py-1.5 rounded-lg border border-[#4d3b2e]">
                    <Clock className="w-4 h-4 text-[#C9A84C] shrink-0" />
                    <span>Check-in 14:00 | Check-out 12:00 WIB</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <Link
                    href="/booking"
                    className="bg-[#806044] hover:bg-[#6c5037] text-white font-medium px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 text-sm"
                  >
                    Ajukan Reservasi Kamar
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/cek-ketersediaan"
                    className="bg-transparent hover:bg-white/10 text-white border border-[#E7D8C5]/40 font-medium px-5 py-3.5 rounded-xl transition-colors inline-flex items-center gap-2 text-sm"
                  >
                    <Calendar className="w-4 h-4 text-[#C9A84C]" />
                    Cek Ketersediaan Kamar
                  </Link>
                  <a
                    href="https://wa.me/6282285472008"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs px-4 py-3.5 rounded-xl inline-flex items-center gap-2 transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>WA: 0822 8547 2008</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Authentic Flyer Preview Card */}
              <div className="lg:col-span-5">
                <div className="bg-[#2a1f17] border-2 border-[#806044]/60 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#4d3b2e]">
                    <div className="flex items-center gap-2">
                      <AlyatamaLogo className="w-8 h-8" />
                      <div>
                        <span className="font-serif font-bold text-white text-sm block">ALYATAMA HOMESTAY</span>
                        <span className="text-[10px] text-[#C9A84C]">Bangkinang Kota — Kampar, Riau</span>
                      </div>
                    </div>
                    <span className="text-[11px] bg-[#806044] text-white px-2.5 py-0.5 rounded-full font-medium">
                      Syariah
                    </span>
                  </div>

                  <div className="rounded-xl overflow-hidden aspect-[4/3] relative mb-4 border border-[#4d3b2e]">
                    <img
                      src="/images/alyatama-flyer.jpg"
                      alt="Flyer Resmi Alyatama Homestay"
                      className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between bg-[#392B21] px-3 py-2 rounded-lg text-[#E7D8C5]">
                      <span className="font-medium text-white">Pilihan Model Sewa:</span>
                      <span className="text-[#C9A84C] font-semibold">Harian • Bulanan • Tahunan</span>
                    </div>
                    <p className="text-[11px] text-stone-300 italic text-center pt-1">
                      &ldquo;Mendukung Dakwah & Pendidikan Islam — Mari Jadi Bagian dari Kebaikan yang Terus Mengalir.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3 RENTAL MODELS SELECTOR BANNER */}
        <section className="bg-[#E7D8C5] border-y border-[#d4c3ad] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white p-5 rounded-2xl border border-[#d4c3ad] shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#806044]/15 text-[#806044] flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base text-[#392B21]">Sewa Harian</h3>
                  <p className="text-xs text-[#756A5F] leading-relaxed">
                    Sangat cocok untuk keluarga, wali santri, pelancong wisata Kampar, dan perjalanan dinas singkat di Bangkinang.
                  </p>
                  <div className="pt-1">
                    <Link href="/kamar?rental=daily" className="text-xs font-semibold text-[#806044] hover:underline">
                      Mulai dari Rp 250.000 / malam &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#d4c3ad] shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#65715A]/15 text-[#65715A] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base text-[#392B21]">Sewa Bulanan</h3>
                  <p className="text-xs text-[#756A5F] leading-relaxed">
                    Solusi praktis dan hemat untuk staf kantor, pegawai BUMN, tenaga medis RS Norpa Husada, dan pekerja proyek.
                  </p>
                  <div className="pt-1">
                    <Link href="/kamar?rental=monthly" className="text-xs font-semibold text-[#65715A] hover:underline">
                      Mulai dari Rp 2.500.000 / bulan &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#d4c3ad] shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/20 text-[#806044] flex items-center justify-center shrink-0">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base text-[#392B21]">Sewa Tahunan</h3>
                  <p className="text-xs text-[#756A5F] leading-relaxed">
                    Hunian tahunan eksklusif berfasilitas lengkap dengan privasi terjamin, lingkungan aman, dan akad Syariah tenang.
                  </p>
                  <div className="pt-1">
                    <Link href="/kamar?rental=yearly" className="text-xs font-semibold text-[#806044] hover:underline">
                      Mulai dari Rp 24.000.000 / tahun &rarr;
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 6 CORE FACILITIES (FROM FLYER) */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#806044] block mb-2">
              Fasilitas Unggulan Terverifikasi
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#392B21] mb-3">
              Fasilitas Nyaman Berstandar Syariah
            </h2>
            <p className="text-xs sm:text-sm text-[#756A5F] leading-relaxed">
              Semua fasilitas dirancang agar Anda dapat beristirahat dengan tenang, menjaga ibadah, dan merasa aman selama menginap di Bangkinang Kota.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Facility 1 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5DCD0] shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-[#65715A]/15 text-[#65715A] flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-semibold text-base text-[#392B21] mb-2">
                1. Lingkungan Islami & Nyaman
              </h3>
              <p className="text-xs text-[#756A5F] leading-relaxed">
                Suasana syiar yang menenangkan, dekat dengan sarana ibadah, bebas dari hal-hal maksiat dan kebisingan yang mengganggu kekhusyukan.
              </p>
            </div>

            {/* Facility 2 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5DCD0] shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-[#806044]/15 text-[#806044] flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-semibold text-base text-[#392B21] mb-2">
                2. Aman & Privasi Terjaga
              </h3>
              <p className="text-xs text-[#756A5F] leading-relaxed">
                Akses teratur dan terjaga, menjamin privasi tamu keluarga dan perorangan sesuai adab menginap yang santun dan terhormat.
              </p>
            </div>

            {/* Facility 3 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5DCD0] shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-[#65715A]/15 text-[#65715A] flex items-center justify-center mb-4">
                <BedDouble className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-semibold text-base text-[#392B21] mb-2">
                3. Kamar Bersih & Nyaman
              </h3>
              <p className="text-xs text-[#756A5F] leading-relaxed">
                Kasur berkualitas, sprei higienis yang rutin disterilisasi, kamar mandi dalam bersih, serta sirkulasi udara yang sehat.
              </p>
            </div>

            {/* Facility 4 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5DCD0] shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-[#806044]/15 text-[#806044] flex items-center justify-center mb-4">
                <Wifi className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-semibold text-base text-[#392B21] mb-2">
                4. Wi-Fi Gratis Berkecepatan Tinggi
              </h3>
              <p className="text-xs text-[#756A5F] leading-relaxed">
                Koneksi internet nirkabel lancar di setiap sudut homestay untuk kebutuhan bekerja daring, koordinasi tugas, atau komunikasi keluarga.
              </p>
            </div>

            {/* Facility 5 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5DCD0] shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-[#65715A]/15 text-[#65715A] flex items-center justify-center mb-4">
                <Wind className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-semibold text-base text-[#392B21] mb-2">
                5. AC di Setiap Kamar
              </h3>
              <p className="text-xs text-[#756A5F] leading-relaxed">
                Setiap unit kamar dilengkapi dengan pendingin ruangan (AC) dingin dan terawat demi kenyamanan istirahat maksimal siang dan malam.
              </p>
            </div>

            {/* Facility 6 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5DCD0] shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-[#806044]/15 text-[#806044] flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-semibold text-base text-[#392B21] mb-2">
                6. Keamanan 24 Jam
              </h3>
              <p className="text-xs text-[#756A5F] leading-relaxed">
                Pengawasan lingkungan terpadu dan keamanan 24 jam dengan area parkir kendaraan yang aman untuk mobil dan motor Anda.
              </p>
            </div>

          </div>
        </section>

        {/* CHARITY & DAKWAH ISLAMI BANNER */}
        <section className="bg-[#392B21] text-[#F6F0E7] py-14 border-y border-[#4d3b2e]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#2a1f17] border border-[#C9A84C]/40 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="inline-flex items-center gap-2 bg-[#806044]/40 text-[#C9A84C] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                    <HeartHandshake className="w-4 h-4" />
                    <span>Mendukung Dakwah & Pendidikan Islam</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug">
                    &ldquo;Investasi terbaik adalah saat manfaatnya terus mengalir, bahkan setelah kita tiada.&rdquo;
                  </h3>
                  <p className="text-xs sm:text-sm text-[#E7D8C5] leading-relaxed">
                    Setiap pemesanan yang Anda lakukan di ALYATAMA HOMESTAY bukan sekadar sewa kamar, melainkan wujud nyata kontribusi Anda dalam mendukung operasional pembinaan santri dan kegiatan sosial di <strong>Panti Asuhan Putra Muhammadiyah Bangkinang</strong>. Mari menjadi bagian dari kebaikan yang terus mengalir.
                  </p>
                </div>
                <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-[#392B21] rounded-2xl border border-[#4d3b2e]">
                  <AlyatamaLogo className="w-16 h-16 mb-3" />
                  <span className="font-serif font-bold text-lg text-white">ALYATAMA HOMESTAY</span>
                  <span className="text-xs text-[#C9A84C] mb-4">Penginapan Syariah Pilihan Umat</span>
                  <Link
                    href="/tentang"
                    className="text-xs bg-[#806044] hover:bg-[#6c5037] text-white px-4 py-2.5 rounded-xl font-medium transition"
                  >
                    Pelajari Misi Kami &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROOMS SHOWCASE */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#806044] block mb-1">
                Pilihan Kamar & Tarif
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#392B21]">
                Kamar Bersih, Tenang, dan Higienis
              </h2>
            </div>
            <Link
              href="/kamar"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#806044] hover:text-[#392B21] font-semibold group"
            >
              Lihat seluruh daftar kamar & harga
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.slice(0, 3).map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </section>

        {/* VERIFIED LOCATION SECTION BANGKINANG KOTA */}
        <section className="py-16 sm:py-24 bg-white border-y border-[#E5DCD0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#806044]/10 text-[#806044] px-3.5 py-1 rounded-full text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Lokasi Terverifikasi Bangkinang Kota</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#392B21] leading-tight">
                  Lokasi Strategis di Pusat Kota Bangkinang, Kampar
                </h2>

                <p className="text-xs sm:text-sm text-[#756A5F] leading-relaxed">
                  Homestay beralamat resmi di:
                  <strong className="block text-[#392B21] font-semibold mt-1">
                    Jl. Mayor Ali Rasyid No 19 Bangkinang Kota, Panti Asuhan Putra Muhammadiyah, Daerah Kampar, Kabupaten Kampar, Riau 28411, Indonesia.
                  </strong>
                </p>

                <div className="space-y-3 text-xs text-[#756A5F] pt-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#65715A] shrink-0 mt-0.5" />
                    <span><strong>Patokan Mudah:</strong> Tepat di belakang SPBU Bangkinang Kota dan di samping Rumah Sakit Norpa Husada.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#65715A] shrink-0 mt-0.5" />
                    <span><strong>Akses Kendaraan:</strong> Jalan aspal lebar, mudah diakses kendaraan roda empat maupun roda dua, dilengkapi parkir aman.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#65715A] shrink-0 mt-0.5" />
                    <span><strong>Fasilitas Sekitar:</strong> Dekat masjid, rumah sakit, SPBU 24 jam, sentra kuliner halal, dan pusat pemerintahan Kabupaten Kampar.</span>
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <a
                    href="https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#806044] hover:bg-[#6c5037] text-white text-xs sm:text-sm font-medium px-5 py-3 rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm"
                  >
                    Petunjuk Arah Google Maps
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="https://wa.me/6282285472008"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-[#806044] text-[#806044] hover:bg-[#806044]/10 text-xs sm:text-sm font-medium px-4 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Hubungi Pengelola: 0822 8547 2008
                  </a>
                </div>
              </div>

              {/* Card Summary Map */}
              <div className="lg:col-span-5">
                <div className="bg-[#FAF7F2] border border-[#E5DCD0] p-6 rounded-3xl space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5DCD0]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#806044]">
                      Verifikasi Titik Google Maps
                    </span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                      Aktif & Terverifikasi
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-stone-500 block text-[11px]">Nama Properti</span>
                      <span className="font-bold text-[#392B21]">ALYATAMA HOMESTAY</span>
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

                  <div className="pt-3 border-t border-[#E5DCD0]">
                    <a
                      href="https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center block bg-[#392B21] hover:bg-[#2a1f17] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
                    >
                      Buka Koordinat Maps Langsung &rarr;
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* BOOKING CALL TO ACTION */}
        <section className="bg-[#E7D8C5] py-16 text-center border-t border-[#d4c3ad]">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#392B21] mb-3">
              Rencanakan Menginap Bersama ALYATAMA
            </h2>
            <p className="text-xs sm:text-sm text-[#756A5F] mb-8 leading-relaxed">
              Ajukan permintaan reservasi untuk sewa Harian, Bulanan, maupun Tahunan. Staf kami akan memverifikasi ketersediaan kamar dan mengirimkan konfirmasi resmi.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/booking"
                className="bg-[#806044] hover:bg-[#6c5037] text-white font-semibold text-sm px-7 py-3.5 rounded-xl shadow-md transition-all"
              >
                Isi Formulir Reservasi Sekarang
              </Link>
              <Link
                href="/status-reservasi"
                className="bg-white hover:bg-stone-50 text-[#392B21] border border-[#d4c3ad] font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors shadow-sm"
              >
                Lacak Status Reservasi Anda
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
