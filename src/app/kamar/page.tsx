import React from 'react';
import Link from 'next/link';
import { Home, Sparkles, Filter, ArrowRight } from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import RoomCard from '@/components/public/RoomCard';
import { PmsService } from '@/lib/services/pms-service';

export const revalidate = 0;

export default async function KamarPage() {
  const rooms = await PmsService.getRooms();

  return (
    <>
      <PublicNavbar />

      <main className="flex-1 bg-stone-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-700 block mb-2">
              Daftar Unit & Fasilitas
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight mb-4">
              Pilihan Kamar ALYATAMA HOMESTAY
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Seluruh kamar dilengkapi dengan penyejuk udara (AC), kasur empuk berstandar kebersihan tinggi, kamar mandi dalam dengan pemanas air (water heater), serta akses internet WiFi tanpa batas.
            </p>
          </div>

          {/* Quick Notice on Availability */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-amber-900">
              <strong className="font-semibold block sm:inline mr-1">Catatan Pemesanan:</strong>
              Tarif yang tertera adalah tarif dasar per malam. Tarif promo atau diskon otomatis dihitung saat Anda mengajukan tanggal menginap.
            </div>
            <Link
              href="/cek-ketersediaan"
              className="text-xs bg-amber-900 hover:bg-amber-800 text-white font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Cek Tanggal Menginap &rarr;
            </Link>
          </div>

          {/* Grid Rooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          {rooms.length === 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto">
              <p className="text-sm text-stone-600 mb-4">Belum ada kamar yang terdaftar.</p>
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
