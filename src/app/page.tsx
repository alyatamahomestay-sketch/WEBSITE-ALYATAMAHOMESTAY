import React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Clock, 
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
  Phone,
  HelpCircle
} from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import RoomCard from '@/components/public/RoomCard';
import RentalSectionWithAdminSetup from '@/components/public/RentalSectionWithAdminSetup';
import AlyatamaLogo from '@/components/common/AlyatamaLogo';
import { PmsService } from '@/lib/services/pms-service';
import { formatRupiah } from '@/lib/formatters';

export const revalidate = 0;

export default async function HomePage() {
  const rooms = await PmsService.getRooms();

  // Group rooms into REGULER and VIP
  const activeRooms = rooms.filter((r) => !r.is_archived);

  const regulerRooms = activeRooms.filter((r) => {
    const type = (r.room_type || '').toUpperCase();
    const name = (r.name || '').toUpperCase();
    return (
      type.includes('REGULER') ||
      name.includes('REGULER') ||
      type.includes('STANDARD') ||
      name.includes('STANDARD') ||
      type.includes('DELUXE') ||
      name.includes('DELUXE') ||
      type.includes('SINGLE') ||
      (!type.includes('VIP') && !type.includes('EKSEKUTIF') && !type.includes('SUITE') && !type.includes('PAVILIUN'))
    );
  });

  const vipRooms = activeRooms.filter((r) => {
    const type = (r.room_type || '').toUpperCase();
    const name = (r.name || '').toUpperCase();
    return (
      type.includes('VIP') ||
      name.includes('VIP') ||
      type.includes('EKSEKUTIF') ||
      name.includes('EKSEKUTIF') ||
      type.includes('SUITE') ||
      name.includes('SUITE') ||
      type.includes('PAVILIUN') ||
      name.includes('PAVILIUN') ||
      !regulerRooms.some((reg) => reg.id === r.id)
    );
  });

  // Dynamic pricing for REGULER directly from admin rooms
  const regulerDailyRates = regulerRooms.map((r) => r.base_rate).filter(Boolean);
  const regulerMonthlyRates = regulerRooms.map((r) => r.monthly_rate).filter(Boolean) as number[];

  const regulerDailyMin = regulerDailyRates.length > 0 ? Math.min(...regulerDailyRates) : 200000;
  const regulerDailyMax = regulerDailyRates.length > 0 ? Math.max(...regulerDailyRates) : 275000;
  const regulerMonthlyMin = regulerMonthlyRates.length > 0 ? Math.min(...regulerMonthlyRates) : 2200000;
  const regulerMonthlyMax = regulerMonthlyRates.length > 0 ? Math.max(...regulerMonthlyRates) : 2900000;

  const regulerDailyDisplay = regulerDailyMin === regulerDailyMax
    ? formatRupiah(regulerDailyMin)
    : `${formatRupiah(regulerDailyMin)} - ${formatRupiah(regulerDailyMax)}`;

  const regulerMonthlyDisplay = regulerMonthlyMin === regulerMonthlyMax
    ? formatRupiah(regulerMonthlyMin)
    : `${formatRupiah(regulerMonthlyMin)} - ${formatRupiah(regulerMonthlyMax)}`;

  // Dynamic pricing for VIP directly from admin rooms
  const vipDailyRates = vipRooms.map((r) => r.base_rate).filter(Boolean);
  const vipMonthlyRates = vipRooms.map((r) => r.monthly_rate).filter(Boolean) as number[];

  const vipDailyMin = vipDailyRates.length > 0 ? Math.min(...vipDailyRates) : 350000;
  const vipDailyMax = vipDailyRates.length > 0 ? Math.max(...vipDailyRates) : 450000;
  const vipMonthlyMin = vipMonthlyRates.length > 0 ? Math.min(...vipMonthlyRates) : 3600000;
  const vipMonthlyMax = vipMonthlyRates.length > 0 ? Math.max(...vipMonthlyRates) : 4500000;

  const vipDailyDisplay = vipDailyMin === vipDailyMax
    ? formatRupiah(vipDailyMin)
    : `${formatRupiah(vipDailyMin)} - ${formatRupiah(vipDailyMax)}`;

  const vipMonthlyDisplay = vipMonthlyMin === vipMonthlyMax
    ? formatRupiah(vipMonthlyMin)
    : `${formatRupiah(vipMonthlyMin)} - ${formatRupiah(vipMonthlyMax)}`;

  const faqs = [
    {
      q: 'Apa ketentuan bagi tamu pasangan lawan jenis?',
      a: 'Sesuai prinsip Syariah, tamu pria dan wanita yang menginap dalam satu kamar wajib merupakan pasangan suami-istri yang sah atau keluarga mahram. Petugas berhak meminta bukti sah (seperti Buku Nikah atau KTP beralamat sama) saat check-in.',
    },
    {
      q: 'Kapan waktu check-in dan check-out?',
      a: 'Waktu check-in dimulai pukul 14:00 WIB dan waktu check-out maksimal pukul 12:00 WIB. Koordinasikan terlebih dahulu kepada pengelola apabila Anda membutuhkan fleksibilitas kedatangan.',
    },
    {
      q: 'Bagaimana cara mengajukan sewa bulanan?',
      a: 'Anda dapat memilih jenis masa sewa (Harian atau Bulanan) langsung pada formulir reservasi online, atau menghubungi staf pengelola via WhatsApp untuk survei unit dan penyesuaian akad sewa.',
    },
    {
      q: 'Apakah pemesanan online di website ini langsung terkonfirmasi?',
      a: 'Formulir website adalah pengajuan permintaan reservasi. Petugas front desk kami akan memverifikasi ketersediaan unit kamar secara teliti dan mengirimkan konfirmasi resmi serta panduan pembayaran melalui WhatsApp.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden font-sans bg-[#F6F0E7]">
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO SECTION — CALM, ELEGANT, HIGH CONTRAST (NO BLURRED BACKGROUND) */}
        <section className="relative w-full bg-[#392B21] text-[#F6F0E7] py-16 sm:py-20 lg:py-24 border-b border-[#4D3B2E]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Column: Headline, Value Proposition & Direct CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#2A1F17] border border-[#806044]/60 text-[#C9A84C] px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>Penginapan Syariah Bangkinang Kota</span>
                </div>

                <div className="space-y-3">
                  <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                    Kenyamanan Istirahat, <br />
                    <span className="text-[#C9A84C] italic font-serif">Ketenangan Ibadah.</span>
                  </h1>
                  <p className="text-sm sm:text-base text-[#E7D8C5] leading-relaxed max-w-2xl">
                    Akomodasi berprinsip Syariah di jantung Bangkinang Kota, Kabupaten Kampar, Riau. Menyediakan pilihan sewa 
                    <strong className="text-white font-semibold"> Harian dan Bulanan</strong> dengan tipe kamar <strong className="text-white font-semibold">REGULER &amp; VIP</strong>, suasana bersih, tenang, aman, dan menjaga adab Islami.
                  </p>
                </div>

                {/* Key Facts Pill */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-[#E7D8C5] pt-1">
                  <div className="flex items-center gap-2 bg-[#2A1F17] px-3.5 py-2 rounded-xl border border-[#4D3B2E]">
                    <MapPin className="w-4 h-4 text-[#C9A84C] shrink-0" />
                    <span>Jl. Mayor Ali Rasyid No. 19, Bangkinang Kota</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#2A1F17] px-3.5 py-2 rounded-xl border border-[#4D3B2E]">
                    <Clock className="w-4 h-4 text-[#C9A84C] shrink-0" />
                    <span>Check-in 14:00 &bull; Check-out 12:00 WIB</span>
                  </div>
                </div>

                {/* Clear CTAs */}
                <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                  <Link
                    href="/kamar"
                    className="bg-[#806044] hover:bg-[#684D36] text-white font-medium px-6 py-3.5 rounded-xl transition-colors shadow-xs inline-flex items-center gap-2 text-sm border border-[#9C7757]/40"
                  >
                    Lihat Pilihan Kamar
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href="https://wa.me/6282285472008"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#2A1F17] hover:bg-[#221912] text-[#F6F0E7] text-sm px-5 py-3.5 rounded-xl inline-flex items-center gap-2 transition-colors border border-[#806044]/60"
                  >
                    <Phone className="w-4 h-4 text-[#C9A84C]" />
                    <span>WhatsApp: 0822 8547 2008</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Clean Authentic Property Flyer Card */}
              <div className="lg:col-span-5 w-full">
                <div className="bg-[#2A1F17] border border-[#806044]/50 rounded-2xl p-5 shadow-sm max-w-md mx-auto lg:max-w-none">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#4D3B2E]">
                    <div className="flex items-center gap-2.5">
                      <AlyatamaLogo variant="white" size="sm" />
                    </div>
                    <span className="text-[11px] bg-[#392B21] border border-[#806044]/60 text-[#C9A84C] px-2.5 py-0.5 rounded-full font-medium">
                      Brosur Resmi
                    </span>
                  </div>

                  <div className="rounded-xl overflow-hidden aspect-[4/3] relative mb-4 border border-[#4D3B2E] bg-[#392B21]">
                    <img
                      src="/images/alyatama-flyer.jpg"
                      alt="Materi Promosi Resmi ALYATAMA HOMESTAY Bangkinang Kota"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between bg-[#392B21] px-3.5 py-2.5 rounded-xl border border-[#4D3B2E] text-[#E7D8C5]">
                      <span className="font-medium text-white">Masa Sewa:</span>
                      <span className="text-[#C9A84C] font-semibold">Harian &bull; Bulanan &bull; Tahunan</span>
                    </div>
                    <p className="text-[11px] text-[#CFBBA2] text-center pt-1">
                      Lokasi strategis di samping RS Norpa Husada & belakang SPBU Bangkinang Kota.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PILIHAN MASA SEWA FLEKSIBEL DENGAN SETUP ADMIN KHUSUS */}
        <RentalSectionWithAdminSetup initialRooms={rooms} />

        {/* ROOMS SHOWCASE */}
        <section className="w-full py-16 sm:py-20 bg-[#F6F0E7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#806044] block mb-1">
                  Pilihan Kamar
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#392B21]">
                  Kamar Bersih, Tenang, dan Terawat
                </h2>
              </div>
              <Link
                href="/kamar"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#806044] hover:text-[#392B21] font-semibold"
              >
                Lihat semua unit kamar & tarif
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {rooms.slice(0, 3).map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        </section>

        {/* 6 CORE FACILITIES (FROM OFFICIAL FLYER) */}
        <section className="w-full py-16 sm:py-20 bg-white border-y border-[#E5DCD0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#806044] block mb-2">
                Fasilitas Homestay
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#392B21] mb-2">
                Fasilitas Nyaman Berstandar Syariah
              </h2>
              <p className="text-xs sm:text-sm text-[#756A5F] leading-relaxed">
                Dirancang untuk mendukung istirahat yang berkualitas dan menjaga kenyamanan ibadah selama menginap.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-2xl border border-[#E5DCD0] bg-[#FAF7F2] space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#65715A]/15 text-[#65715A] flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-semibold text-base text-[#392B21]">
                  1. Lingkungan Islami & Nyaman
                </h3>
                <p className="text-xs text-[#756A5F] leading-relaxed">
                  Suasana tenang dan tertib, bebas dari kebisingan serta aktivitas yang bertentangan dengan norma kesusilaan.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#E5DCD0] bg-[#FAF7F2] space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#806044]/15 text-[#806044] flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-semibold text-base text-[#392B21]">
                  2. Aman & Privasi Terjaga
                </h3>
                <p className="text-xs text-[#756A5F] leading-relaxed">
                  Akses teratur yang menjamin privasi keluarga maupun tamu perorangan sesuai adab menginap yang santun.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#E5DCD0] bg-[#FAF7F2] space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#65715A]/15 text-[#65715A] flex items-center justify-center mb-3">
                  <BedDouble className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-semibold text-base text-[#392B21]">
                  3. Kamar Bersih & Nyaman
                </h3>
                <p className="text-xs text-[#756A5F] leading-relaxed">
                  Kasur empuk, sprei higienis yang rutin disterilisasi, kamar mandi dalam bersih, serta sirkulasi udara baik.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#E5DCD0] bg-[#FAF7F2] space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#806044]/15 text-[#806044] flex items-center justify-center mb-3">
                  <Wifi className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-semibold text-base text-[#392B21]">
                  4. Wi-Fi Gratis di Setiap Area
                </h3>
                <p className="text-xs text-[#756A5F] leading-relaxed">
                  Koneksi internet nirkabel stabil untuk bekerja daring, koordinasi tugas kantor, maupun komunikasi keluarga.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#E5DCD0] bg-[#FAF7F2] space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#65715A]/15 text-[#65715A] flex items-center justify-center mb-3">
                  <Wind className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-semibold text-base text-[#392B21]">
                  5. AC di Setiap Kamar
                </h3>
                <p className="text-xs text-[#756A5F] leading-relaxed">
                  Setiap unit kamar dilengkapi pendingin udara (AC) yang terawat untuk kenyamanan istirahat maksimal.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#E5DCD0] bg-[#FAF7F2] space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#806044]/15 text-[#806044] flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-semibold text-base text-[#392B21]">
                  6. Keamanan Lingkungan 24 Jam
                </h3>
                <p className="text-xs text-[#756A5F] leading-relaxed">
                  Pengawasan lingkungan homestay terpadu dengan area parkir kendaraan yang aman bagi mobil dan motor tamu.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SOCIAL MISSION & CHARITY */}
        <section className="w-full bg-[#392B21] text-[#F6F0E7] py-14 border-b border-[#4D3B2E]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="bg-[#2A1F17] border border-[#806044]/60 rounded-2xl p-8 sm:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="inline-flex items-center gap-2 bg-[#392B21] border border-[#806044]/50 text-[#C9A84C] text-xs font-medium px-3 py-1 rounded-full">
                    <HeartHandshake className="w-4 h-4" />
                    <span>Misi Sosial & Dakwah Pendidikan</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug">
                    Menginap Nyaman Sekaligus Mengalirkan Kebaikan
                  </h3>
                  <p className="text-xs sm:text-sm text-[#E7D8C5] leading-relaxed">
                    Setiap pemesanan kamar di ALYATAMA HOMESTAY turut berkontribusi dalam mendukung kelangsungan pembinaan santri dan kegiatan sosial di <strong>Panti Asuhan Putra Muhammadiyah Bangkinang</strong>.
                  </p>
                </div>
                <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-[#392B21] rounded-xl border border-[#4D3B2E]">
                  <AlyatamaLogo variant="white" size="md" className="mb-2" />
                  <span className="text-xs text-[#C9A84C] mb-4 font-medium">Penginapan Syariah Bangkinang</span>
                  <Link
                    href="/tentang"
                    className="text-xs bg-[#806044] hover:bg-[#684D36] text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    Tentang Misi Kami &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOCATION & LANDMARKS */}
        <section className="w-full py-16 sm:py-20 bg-white border-b border-[#E5DCD0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E5DCD0] text-[#806044] px-3.5 py-1 rounded-full text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#806044]" />
                  <span>Lokasi di Pusat Kota Bangkinang</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#392B21] leading-tight">
                  Akses Mudah dan Strategis
                </h2>

                <p className="text-xs sm:text-sm text-[#756A5F] leading-relaxed">
                  Alamat lengkap homestay:
                  <strong className="block text-[#392B21] font-semibold mt-1">
                    Jl. Mayor Ali Rasyid No 19 Bangkinang Kota, Panti Asuhan Putra Muhammadiyah, Kabupaten Kampar, Riau 28411.
                  </strong>
                </p>

                <div className="space-y-2.5 text-xs text-[#756A5F] pt-1">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#65715A] shrink-0 mt-0.5" />
                    <span><strong>Patokan Utama:</strong> Tepat di belakang SPBU Bangkinang Kota dan berdampingan dengan Rumah Sakit Norpa Husada.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#65715A] shrink-0 mt-0.5" />
                    <span><strong>Aksesibilitas:</strong> Jalan aspal lebar, mudah dijangkau mobil maupun motor, serta tersedia area parkir aman.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#65715A] shrink-0 mt-0.5" />
                    <span><strong>Fasilitas Terdekat:</strong> Dekat masjid, rumah sakit, SPBU 24 jam, minimarket, sentra kuliner halal, dan kantor pemerintahan Kabupaten Kampar.</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href="https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#806044] hover:bg-[#684D36] text-white text-xs sm:text-sm font-medium px-5 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
                  >
                    Buka Google Maps
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="https://wa.me/6282285472008"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-[#806044] text-[#806044] hover:bg-[#FAF7F2] text-xs sm:text-sm font-medium px-4 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Telepon / WA: 0822 8547 2008
                  </a>
                </div>
              </div>

              {/* Summary Card Map */}
              <div className="lg:col-span-5">
                <div className="bg-[#FAF7F2] border border-[#E5DCD0] p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5DCD0]">
                    <span className="text-xs font-semibold text-[#806044] uppercase tracking-wider">
                      Informasi Lokasi
                    </span>
                    <span className="text-[11px] bg-white border border-[#E5DCD0] text-[#65715A] px-2 py-0.5 rounded font-medium">
                      Terverifikasi
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[#756A5F] block text-[11px]">Nama Penginapan</span>
                      <strong className="text-[#392B21]">ALYATAMA HOMESTAY</strong>
                    </div>
                    <div>
                      <span className="text-[#756A5F] block text-[11px]">Alamat</span>
                      <span className="text-[#392B21]">Jl. Mayor Ali Rasyid No 19 Bangkinang Kota</span>
                    </div>
                    <div>
                      <span className="text-[#756A5F] block text-[11px]">Landmark</span>
                      <span className="text-[#392B21]">Belakang SPBU Bangkinang Kota / Samping RS Norpa Husada</span>
                    </div>
                    <div>
                      <span className="text-[#756A5F] block text-[11px]">Daerah</span>
                      <span className="text-[#392B21]">Kabupaten Kampar, Riau 28411</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5DCD0]">
                    <a
                      href="https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center block bg-[#392B21] hover:bg-[#2A1F17] text-white text-xs font-medium py-2.5 rounded-xl transition-colors"
                    >
                      Petunjuk Arah Maps &rarr;
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FAQ SECTION (TAHAP 4 & 5) */}
        <section className="w-full py-16 sm:py-20 bg-[#F6F0E7] border-b border-[#E5DCD0]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#806044] block mb-2">
                Tanya Jawab
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#392B21] mb-2">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-xs sm:text-sm text-[#756A5F]">
                Informasi penting seputar kebijakan dan tata cara menginap di ALYATAMA HOMESTAY.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-[#E5DCD0] p-5 shadow-xs space-y-2">
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-[#806044] shrink-0 mt-0.5" />
                    <h3 className="font-semibold text-sm sm:text-base text-[#392B21]">
                      {faq.q}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#756A5F] pl-6.5 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RESERVATION CTA */}
        <section className="w-full bg-[#E7D8C5] py-16 text-center">
          <div className="max-w-2xl mx-auto px-4 w-full space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#392B21]">
              Rencanakan Menginap Anda Bersama Kami
            </h2>
            <p className="text-xs sm:text-sm text-[#756A5F] leading-relaxed">
              Ajukan permintaan reservasi kamar pilihan Anda untuk sewa Harian, Bulanan, maupun Tahunan. Petugas kami akan segera memverifikasi ketersediaan dan menghubungi Anda.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/booking"
                className="bg-[#806044] hover:bg-[#684D36] text-white font-medium text-sm px-6 py-3.5 rounded-xl transition-colors shadow-xs"
              >
                Isi Formulir Reservasi
              </Link>
              <Link
                href="/status-reservasi"
                className="bg-white hover:bg-stone-50 text-[#392B21] border border-[#D4C3AD] font-medium text-sm px-5 py-3.5 rounded-xl transition-colors"
              >
                Cek Status Reservasi
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
