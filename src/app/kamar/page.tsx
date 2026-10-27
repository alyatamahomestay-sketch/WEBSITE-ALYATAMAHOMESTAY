import React from 'react';
import Link from 'next/link';
import { Home, Sparkles, Filter, ArrowRight, Calendar, Building2, BedDouble } from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import RoomCard from '@/components/public/RoomCard';
import { PmsService } from '@/lib/services/pms-service';

export const revalidate = 0;

export default async function KamarPage() {
  const rooms = await PmsService.getRooms();

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <PublicNavbar />

      <main className="flex-1 bg-[#F6F0E7] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Daftar Unit & Tarif Resmi</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#30231A] tracking-tight mb-3">
              Pilihan Kamar ALYATAMA HOMESTAY
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5E52] leading-relaxed">
              Seluruh kamar berstandar Syariah, dilengkapi pendingin ruangan (AC), kasur empuk higienis, kamar mandi dalam bersih, WiFi gratis, serta lingkungan aman 24 jam. Melayani masa sewa <strong className="text-emerald-900">Harian, Bulanan, dan Tahunan</strong> di Bangkinang Kota.
            </p>
          </div>

          {/* 3 Model Sewa Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white p-4 rounded-2xl border border-[#DECFC0] shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#30231A] block">Sewa Harian</span>
                <span className="text-[11px] text-[#6B5E52]">Cocok untuk wisata, keluarga, transit singkat</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#DECFC0] shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6B4B31]/10 text-[#6B4B31] border border-[#6B4B31]/20 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#30231A] block">Sewa Bulanan</span>
                <span className="text-[11px] text-[#6B5E52]">Ideal untuk dinas, staf BUMN, pekerja proyek</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#DECFC0] shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                <BedDouble className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#30231A] block">Sewa Tahunan</span>
                <span className="text-[11px] text-[#6B5E52]">Pilihan hunian jangka panjang eksklusif & tenang</span>
              </div>
            </div>
          </div>

          {/* Quick Notice on Availability */}
          <div className="bg-[#FAF7F2] border border-emerald-700/20 rounded-2xl p-4 sm:p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="text-xs text-[#30231A]">
              <strong className="font-bold text-emerald-800 block sm:inline mr-1">Catatan Pemesanan:</strong>
              Tarif harian dihitung per malam. Untuk sewa bulanan dan tahunan, Anda dapat langsung memilih opsi masa sewa pada formulir pemesanan online.
            </div>
            <Link
              href="/cek-ketersediaan"
              className="text-xs bg-[#24523B] hover:bg-[#1D4330] text-white font-semibold px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap border border-emerald-600/30"
            >
              Cek Ketersediaan Kamar &rarr;
            </Link>
          </div>

          {/* Grid Rooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          {rooms.length === 0 && (
            <div className="bg-white rounded-3xl border border-[#E5DCD0] p-12 text-center max-w-md mx-auto">
              <p className="text-sm text-[#756A5F] mb-4">Belum ada kamar yang terdaftar.</p>
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
