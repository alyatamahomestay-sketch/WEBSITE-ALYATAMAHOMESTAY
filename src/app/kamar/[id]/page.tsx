import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Users, 
  Wifi, 
  Wind, 
  Bath, 
  CheckCircle2, 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Clock,
  Sparkles,
  Building2,
  BedDouble,
  HeartHandshake
} from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import { PmsService } from '@/lib/services/pms-service';
import { formatRupiah } from '@/lib/formatters';
import { evaluateRoomAvailability } from '@/lib/room-availability';
import { XCircle } from 'lucide-react';

interface RoomDetailPageProps {
  params: { id: string };
}

export const revalidate = 0;

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const [room, reservations] = await Promise.all([
    PmsService.getRoomById(params.id),
    PmsService.getReservations(),
  ]);

  if (!room) {
    notFound();
  }

  const availability = evaluateRoomAvailability(room, reservations);
  const isAvail = availability.isAvailable;
  const primaryPhoto = room.photos?.[0] || '/images/alyatama-flyer.jpg';
  const secondaryPhotos = room.photos?.slice(1) || [];

  return (
    <>
      <PublicNavbar />

      <main className="flex-1 bg-[#F6F0E7] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb / Back button */}
          <div className="mb-6">
            <Link
              href="/kamar"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#806044] hover:text-[#392B21] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Daftar Kamar
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left 2 Cols: Photos & Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Photo Gallery */}
              <div className="space-y-3">
                <div className="aspect-[16/10] rounded-3xl overflow-hidden bg-stone-200 border border-[#E5DCD0] shadow-sm">
                  <img
                    src={primaryPhoto}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {secondaryPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {secondaryPhotos.map((photoUrl, idx) => (
                      <div
                        key={idx}
                        className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200 border border-[#E5DCD0]"
                      >
                        <img
                          src={photoUrl}
                          alt={`${room.name} - foto ${idx + 2}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Specs */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DCD0] space-y-6 shadow-sm">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#392B21] text-[#F6F0E7] text-xs px-2.5 py-1 rounded-md font-medium">
                      Kamar No. {room.room_number}
                    </span>
                    <span className="bg-[#806044]/15 text-[#806044] border border-[#806044]/30 text-xs font-semibold px-2.5 py-1 rounded-md">
                      {room.room_type}
                    </span>
                    {isAvail ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border-2 border-emerald-500 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                        Tersedia
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border-2 border-rose-500 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        Tidak Tersedia
                      </span>
                    )}
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Prinsip Syariah
                    </span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#392B21]">
                    {room.name}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-6 py-4 border-y border-[#E5DCD0] text-xs sm:text-sm text-[#756A5F]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#806044]" />
                    <span>Kapasitas: {room.capacity_adults} Dewasa{room.capacity_children > 0 ? `, ${room.capacity_children} Anak` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#806044]" />
                    <span>Check-in 14:00 | Check-out 12:00 WIB</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#392B21] mb-2">
                    Deskripsi Kamar
                  </h3>
                  <p className="text-xs sm:text-sm text-[#756A5F] leading-relaxed whitespace-pre-line">
                    {room.description}
                  </p>
                </div>

                {/* Amenities List */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#392B21] mb-3">
                    Fasilitas Kamar
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {room.amenities.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#392B21] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5DCD0]/60">
                        <CheckCircle2 className="w-4 h-4 text-[#65715A] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Syariah Note */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#d4c3ad] text-xs text-[#392B21] flex items-start gap-3">
                  <HeartHandshake className="w-5 h-5 text-[#806044] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-[#806044] mb-0.5">Adab Menginap Syariah ALYATAMA:</strong>
                    Tamu pasangan pria dan wanita wajib merupakan pasangan sah suami-istri (siap menunjukkan identitas/Buku Nikah). Kamar dan lingkungan dijaga dari rokok di dalam ruangan dan hal-hal yang melanggar syariat.
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Booking Card with 3 Rental Types */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white p-6 rounded-3xl border border-[#E5DCD0] shadow-sm space-y-6">
                
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#806044] block mb-1">
                    Pilihan Tarif Menginap
                  </span>
                  
                  {/* Rates Stack */}
                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DCD0]">
                      <span className="text-[11px] text-[#756A5F] block">Sewa Harian</span>
                      <div className="text-xl font-bold text-[#392B21]">
                        {formatRupiah(room.base_rate)}
                        <span className="text-xs text-[#756A5F] font-normal"> / malam</span>
                      </div>
                    </div>

                    {room.monthly_rate && (
                      <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DCD0]">
                        <span className="text-[11px] text-[#756A5F] block">Sewa Bulanan (Hemat)</span>
                        <div className="text-xl font-bold text-[#806044]">
                          {formatRupiah(room.monthly_rate)}
                          <span className="text-xs text-[#756A5F] font-normal"> / bulan</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#E5DCD0] text-xs text-[#756A5F]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#65715A] shrink-0" />
                    <span>Konfirmasi resmi diverifikasi langsung oleh admin homestay.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#65715A] shrink-0" />
                    <span>Linen & kamar mandi terstandarisasi kebersihannya.</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    href={`/booking?room_id=${room.id}&rental=daily`}
                    className="w-full text-center bg-[#806044] hover:bg-[#6c5037] text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    Pesan Sewa Harian
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {room.monthly_rate && (
                    <Link
                      href={`/booking?room_id=${room.id}&rental=monthly`}
                      className="w-full text-center bg-[#FAF7F2] hover:bg-[#E5DCD0] text-[#392B21] font-bold text-xs py-2.5 px-4 rounded-xl border border-[#E5DCD0] transition block"
                    >
                      Ajukan Sewa Bulanan &rarr;
                    </Link>
                  )}

                  <Link
                    href={`/cek-ketersediaan?room_id=${room.id}`}
                    className="w-full text-center bg-white hover:bg-stone-50 text-[#756A5F] font-semibold text-xs py-2 px-4 rounded-xl border border-[#E5DCD0] transition block"
                  >
                    Cek Tanggal & Ketersediaan
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
