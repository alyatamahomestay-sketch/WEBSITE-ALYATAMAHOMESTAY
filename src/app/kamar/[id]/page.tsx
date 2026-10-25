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
  Clock
} from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import { PmsService } from '@/lib/services/pms-service';
import { formatRupiah } from '@/lib/formatters';

interface RoomDetailPageProps {
  params: { id: string };
}

export const revalidate = 0;

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const room = await PmsService.getRoomById(params.id);

  if (!room) {
    notFound();
  }

  const primaryPhoto = room.photos?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';
  const secondaryPhotos = room.photos?.slice(1) || [];

  return (
    <>
      <PublicNavbar />

      <main className="flex-1 bg-stone-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back button */}
          <div className="mb-6">
            <Link
              href="/kamar"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
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
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-stone-200 border border-stone-200 shadow-sm">
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
                        className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-200 border border-stone-200"
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
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-stone-900 text-stone-100 text-xs px-2.5 py-1 rounded-md font-medium">
                      Kamar No. {room.room_number}
                    </span>
                    <span className="bg-brand-50 text-brand-800 border border-brand-200 text-xs font-semibold px-2.5 py-1 rounded-md">
                      {room.room_type}
                    </span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">
                    {room.name}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-6 py-4 border-y border-stone-100 text-xs sm:text-sm text-stone-700">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-600" />
                    <span>Kapasitas: {room.capacity_adults} Dewasa{room.capacity_children > 0 ? `, ${room.capacity_children} Anak` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span>Check-in 14:00 | Check-out 12:00</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-2">
                    Deskripsi Kamar
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                    {room.description}
                  </p>
                </div>

                {/* Amenities List */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-3">
                    Fasilitas Kamar
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {room.amenities.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-stone-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <div>
                  <span className="text-xs text-stone-500 block mb-1">Tarif Menginap</span>
                  <div className="text-2xl sm:text-3xl font-bold text-stone-900">
                    {formatRupiah(room.base_rate)}
                    <span className="text-xs text-stone-500 font-normal"> / malam</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    *Tarif dapat berubah bila terdapat promo aktif atau periode liburan.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-stone-100 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Konfirmasi resmi diverifikasi langsung oleh admin.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Kamar dijamin siap huni dan terinspeksi kebersihannya.</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    href={`/booking?room_id=${room.id}`}
                    className="w-full text-center bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    Pesan Kamar Ini
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/cek-ketersediaan?room_id=${room.id}`}
                    className="w-full text-center bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs py-2.5 px-4 rounded-xl transition-colors block"
                  >
                    Periksa Ketersediaan Tanggal
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
