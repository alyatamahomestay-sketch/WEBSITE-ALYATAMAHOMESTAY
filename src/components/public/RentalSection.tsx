'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  XCircle,
  BedDouble,
  ShieldCheck
} from 'lucide-react';
import { Room, Reservation } from '@/lib/types';
import { evaluateRoomAvailability } from '@/lib/room-availability';
import { formatRupiah } from '@/lib/formatters';

interface SectionConfig {
  sectionTitle: string;
  sectionSubtitle: string;
  regulerBadge: string;
  regulerTitle: string;
  regulerDescription: string;
  regulerFacilities: string[];
  regulerDailyRate?: number;
  regulerMonthlyRate?: number;
  vipBadge: string;
  vipTagline: string;
  vipTitle: string;
  vipDescription: string;
  vipFacilities: string[];
  vipDailyRate?: number;
  vipMonthlyRate?: number;
}

const DEFAULT_CONFIG: SectionConfig = {
  sectionTitle: 'Pilihan Kamar REGULER & VIP',
  sectionSubtitle: 'Tersedia 2 kategori pilihan kamar dengan opsi masa sewa Harian dan Bulanan. Rincian tarif transparan dan otomatis mengikuti harga resmi yang ditentukan manajemen.',
  regulerBadge: 'Tipe Kamar Reguler',
  regulerTitle: 'Kamar Syariah Reguler',
  regulerDescription: 'Pilihan hemat dan nyaman untuk transit perjalanan, wali santri, kunjungan keluarga, dan agenda dinas di Bangkinang Kota.',
  regulerFacilities: [
    'Pendingin Ruangan (AC) di setiap kamar',
    'Kamar mandi dalam bersih & higienis',
    'Akses Wi-Fi gratis berkecepatan tinggi',
    'Lingkungan Islami, aman & privasi terjaga 24 jam'
  ],
  regulerDailyRate: 200000,
  regulerMonthlyRate: 2200000,
  vipBadge: 'Tipe Kamar VIP',
  vipTagline: 'Prioritas & Nyaman',
  vipTitle: 'Kamar Syariah VIP',
  vipDescription: 'Akomodasi berkelas dengan ruang lebih luas, fasilitas eksklusif, privasi maksimal, dan suasana tenang untuk keluarga maupun penugasan eksekutif.',
  vipFacilities: [
    'Ruang kamar lebih luas dengan tata letak privat & elegan',
    'Kamar mandi dalam luas + Water Heater (Pemanas Air)',
    'AC dingin, Smart TV, dan meja kerja eksklusif',
    'Area parkir mobil luas & dekat unit kamar'
  ],
  vipDailyRate: 350000,
  vipMonthlyRate: 3600000
};

interface RentalSectionProps {
  initialRooms: Room[];
  reservations?: Reservation[];
}

export default function RentalSection({ initialRooms, reservations = [] }: RentalSectionProps) {
  const [rooms] = useState<Room[]>(initialRooms);
  const [config, setConfig] = useState<SectionConfig>(DEFAULT_CONFIG);

  // Load custom content config set by admin in panel if available
  useEffect(() => {
    const readConfig = () => {
      if (typeof window !== 'undefined') {
        const savedConfig = localStorage.getItem('alyatama_rental_section_config');
        if (savedConfig) {
          try {
            setConfig(JSON.parse(savedConfig));
          } catch (e) {}
        }
      }
    };

    readConfig();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'alyatama_rental_section_config') {
        readConfig();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Clean partitioning between VIP and REGULER (Exactly matches admin setup)
  const activeRooms = rooms.filter((r) => !r.is_archived);

  const isVipRoom = (r: Room) => {
    const type = (r.room_type || '').toUpperCase().trim();
    const name = (r.name || '').toUpperCase().trim();
    return (
      type === 'VIP' ||
      type.includes('VIP') ||
      name.includes('VIP') ||
      type.includes('EKSEKUTIF') ||
      name.includes('EKSEKUTIF') ||
      type.includes('PAVILIUN') ||
      name.includes('PAVILIUN')
    );
  };

  const vipRooms = activeRooms.filter(isVipRoom);
  const regulerRooms = activeRooms.filter((r) => !isVipRoom(r));

  // Calculate live availability for each category
  const regulerAvailableUnits = regulerRooms.filter(
    (r) => evaluateRoomAvailability(r, reservations).isAvailable
  );
  const isRegulerAvailable = regulerAvailableUnits.length > 0;

  const vipAvailableUnits = vipRooms.filter(
    (r) => evaluateRoomAvailability(r, reservations).isAvailable
  );
  const isVipAvailable = vipAvailableUnits.length > 0;

  const totalAvailableCount = regulerAvailableUnits.length + vipAvailableUnits.length;
  const totalOccupiedCount = activeRooms.length - totalAvailableCount;

  // Rates for REGULER: Admin explicit setting takes highest priority
  const regulerDailyRates = regulerRooms.map((r) => r.base_rate).filter(Boolean);
  const regulerMonthlyRates = regulerRooms.map((r) => r.monthly_rate).filter(Boolean) as number[];

  const regulerDailyMin = regulerDailyRates.length > 0 ? Math.min(...regulerDailyRates) : 200000;
  const regulerDailyMax = regulerDailyRates.length > 0 ? Math.max(...regulerDailyRates) : 275000;
  const regulerMonthlyMin = regulerMonthlyRates.length > 0 ? Math.min(...regulerMonthlyRates) : 2200000;
  const regulerMonthlyMax = regulerMonthlyRates.length > 0 ? Math.max(...regulerMonthlyRates) : 2900000;

  const regulerDailyDisplay = (config.regulerDailyRate && config.regulerDailyRate > 0)
    ? formatRupiah(config.regulerDailyRate)
    : (regulerDailyMin === regulerDailyMax
        ? formatRupiah(regulerDailyMin)
        : `${formatRupiah(regulerDailyMin)} - ${formatRupiah(regulerDailyMax)}`);

  const regulerMonthlyDisplay = (config.regulerMonthlyRate && config.regulerMonthlyRate > 0)
    ? formatRupiah(config.regulerMonthlyRate)
    : (regulerMonthlyMin === regulerMonthlyMax
        ? formatRupiah(regulerMonthlyMin)
        : `${formatRupiah(regulerMonthlyMin)} - ${formatRupiah(regulerMonthlyMax)}`);

  // Rates for VIP: Admin explicit setting takes highest priority
  const vipDailyRates = vipRooms.map((r) => r.base_rate).filter(Boolean);
  const vipMonthlyRates = vipRooms.map((r) => r.monthly_rate).filter(Boolean) as number[];

  const vipDailyMin = vipDailyRates.length > 0 ? Math.min(...vipDailyRates) : 350000;
  const vipDailyMax = vipDailyRates.length > 0 ? Math.max(...vipDailyRates) : 450000;
  const vipMonthlyMin = vipMonthlyRates.length > 0 ? Math.min(...vipMonthlyRates) : 3600000;
  const vipMonthlyMax = vipMonthlyRates.length > 0 ? Math.max(...vipMonthlyRates) : 4500000;

  const vipDailyDisplay = (config.vipDailyRate && config.vipDailyRate > 0)
    ? formatRupiah(config.vipDailyRate)
    : (vipDailyMin === vipDailyMax
        ? formatRupiah(vipDailyMin)
        : `${formatRupiah(vipDailyMin)} - ${formatRupiah(vipDailyMax)}`);

  const vipMonthlyDisplay = (config.vipMonthlyRate && config.vipMonthlyRate > 0)
    ? formatRupiah(config.vipMonthlyRate)
    : (vipMonthlyMin === vipMonthlyMax
        ? formatRupiah(vipMonthlyMin)
        : `${formatRupiah(vipMonthlyMin)} - ${formatRupiah(vipMonthlyMax)}`);

  return (
    <section className="w-full bg-[#E7D8C5] border-b border-[#D4C3AD] py-14 sm:py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#806044] block mb-1.5">
            Pilihan Masa Sewa Fleksibel
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#392B21]">
            {config.sectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#756A5F] mt-2 leading-relaxed">
            {config.sectionSubtitle}
          </p>
        </div>

        {/* KOLOM KHUSUS RINGKASAN TOTAL KETERSEDIAAN UNIT (DIBAGIAN ATAS ANTARA CARD) */}
        <div className="max-w-5xl mx-auto mb-8 bg-white/95 rounded-3xl border-2 border-[#806044]/30 p-5 sm:p-6 shadow-sm backdrop-blur-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5DCD0]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#806044] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#806044] block">
                  Informasi Resmi Kapasitas &amp; Ketersediaan Unit
                </span>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#392B21]">
                  Total Kapasitas Homestay: <span className="text-[#806044] font-black">{activeRooms.length || 8} Unit Kamar</span>
                </h3>
              </div>
            </div>

            {/* Badges Total Tersedia vs Terisi */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-800 border-2 border-emerald-500 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {totalAvailableCount} Unit Tersedia (Siap Huni)
              </span>
              {totalOccupiedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-rose-50 text-rose-700 border-2 border-rose-400 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  {totalOccupiedCount} Unit Ditempati
                </span>
              )}
            </div>
          </div>

          {/* 2 Kolom Breakdown: Reguler (4 Unit) & VIP (4 Unit) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
            {/* Kolom Khusus 1: Kamar Tipe REGULER */}
            <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#392B21] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  R
                </div>
                <div>
                  <span className="text-xs font-bold text-[#392B21] block">Kamar Tipe REGULER</span>
                  <span className="text-[11px] text-[#756A5F]">
                    Total Kapasitas: <strong className="text-[#392B21] font-bold">{regulerRooms.length} Unit Kamar</strong>
                  </span>
                </div>
              </div>
              <div>
                {isRegulerAvailable ? (
                  <span className="inline-block px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-400 shadow-2xs">
                    {regulerAvailableUnits.length} Unit Siap Huni
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 rounded-xl text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-400 shadow-2xs">
                    Semua Terisi Penuh
                  </span>
                )}
              </div>
            </div>

            {/* Kolom Khusus 2: Kamar Tipe VIP */}
            <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#806044] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  VIP
                </div>
                <div>
                  <span className="text-xs font-bold text-[#392B21] block">Kamar Tipe VIP</span>
                  <span className="text-[11px] text-[#756A5F]">
                    Total Kapasitas: <strong className="text-[#392B21] font-bold">{vipRooms.length} Unit Kamar</strong>
                  </span>
                </div>
              </div>
              <div>
                {isVipAvailable ? (
                  <span className="inline-block px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-400 shadow-2xs">
                    {vipAvailableUnits.length} Unit Siap Huni
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 rounded-xl text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-400 shadow-2xs">
                    Semua Terisi Penuh
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2 CARDS UTAMA: REGULER & VIP (Total Unit Dihapus dari Dalam Card) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: TIPE REGULER */}
          <div className="bg-white rounded-3xl border border-[#D4C3AD] p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header Card REGULER (Hanya Badge Tipe dan Label Status, Tanpa Tulisan Total Unit) */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#392B21] text-white shadow-2xs">
                  {config.regulerBadge}
                </span>
                {isRegulerAvailable ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border-2 border-emerald-500 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Tersedia
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border-2 border-rose-500 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Tidak Tersedia
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-serif font-bold text-2xl text-[#392B21]">
                  {config.regulerTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#756A5F] mt-1.5 leading-relaxed">
                  {config.regulerDescription}
                </p>
              </div>

              {/* Rincian Biaya Sewa (Harian & Bulanan) */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DCD0] space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#806044] block">
                  Rincian Biaya Sewa (Tarif Resmi):
                </span>

                <div className="space-y-2.5">
                  {/* Sewa Harian */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E5DCD0]/70">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#806044]/15 text-[#806044] flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#392B21] block">Sewa Harian</span>
                        <span className="text-[10px] text-[#756A5F]">Per malam (Check-in 14:00)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-black text-[#806044]">
                        {regulerDailyDisplay}
                      </span>
                      <span className="text-[10px] text-[#756A5F] block font-normal">/ malam</span>
                    </div>
                  </div>

                  {/* Sewa Bulanan */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E5DCD0]/70">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#65715A]/15 text-[#65715A] flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#392B21] block">Sewa Bulanan</span>
                        <span className="text-[10px] text-[#756A5F]">Masa sewa 30 hari (Lebih Hemat)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-black text-[#65715A]">
                        {regulerMonthlyDisplay}
                      </span>
                      <span className="text-[10px] text-[#756A5F] block font-normal">/ bulan</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fasilitas Kamar Reguler */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold text-[#392B21] block">Fasilitas Termasuk:</span>
                <ul className="text-xs text-[#756A5F] space-y-1.5">
                  {config.regulerFacilities.map((fac, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#806044] shrink-0" />
                      <span>{fac}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tombol COKLAT Identik dengan Card VIP */}
            <div className="pt-5 mt-5 border-t border-[#E5DCD0] space-y-2">
              {isRegulerAvailable ? (
                <Link
                  href="/kamar"
                  className="w-full bg-[#806044] hover:bg-[#684D36] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs"
                >
                  Lihat Pilihan Kamar Reguler
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs py-3 px-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 opacity-90"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Seluruh Kamar Reguler Penuh (Tidak Tersedia)
                </button>
              )}
              {!isRegulerAvailable && (
                <p className="text-[11px] text-rose-600 text-center font-medium">
                  Seluruh unit tipe Reguler sedang ditempati/dipesan sampai jadwal check-out tamu.
                </p>
              )}
            </div>
          </div>

          {/* Card 2: TIPE VIP */}
          <div className="bg-white rounded-3xl border-2 border-[#806044] p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#806044] text-white text-[10px] font-extrabold uppercase px-3.5 py-1 rounded-bl-xl tracking-wider">
              {config.vipTagline}
            </div>

            <div className="space-y-4">
              {/* Header Card VIP (Hanya Badge Tipe dan Label Status, Tanpa Tulisan Total Unit) */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#806044] text-white flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                  {config.vipBadge}
                </span>
                {isVipAvailable ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border-2 border-emerald-500 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Tersedia
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border-2 border-rose-500 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Tidak Tersedia
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-serif font-bold text-2xl text-[#392B21]">
                  {config.vipTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#756A5F] mt-1.5 leading-relaxed">
                  {config.vipDescription}
                </p>
              </div>

              {/* Rincian Biaya Sewa (Harian & Bulanan) */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DCD0] space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#806044] block">
                  Rincian Biaya Sewa (Tarif Resmi):
                </span>

                <div className="space-y-2.5">
                  {/* Sewa Harian */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E5DCD0]/70">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#806044]/20 text-[#806044] flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#392B21] block">Sewa Harian VIP</span>
                        <span className="text-[10px] text-[#756A5F]">Per malam (Fasilitas VIP Lengkap)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-black text-[#806044]">
                        {vipDailyDisplay}
                      </span>
                      <span className="text-[10px] text-[#756A5F] block font-normal">/ malam</span>
                    </div>
                  </div>

                  {/* Sewa Bulanan */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E5DCD0]/70">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#65715A]/20 text-[#65715A] flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#392B21] block">Sewa Bulanan VIP</span>
                        <span className="text-[10px] text-[#756A5F]">Masa sewa 30 hari (Paket Eksklusif)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-black text-[#65715A]">
                        {vipMonthlyDisplay}
                      </span>
                      <span className="text-[10px] text-[#756A5F] block font-normal">/ bulan</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fasilitas Kamar VIP */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold text-[#392B21] block">Fasilitas Eksklusif Termasuk:</span>
                <ul className="text-xs text-[#756A5F] space-y-1.5">
                  {config.vipFacilities.map((fac, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#806044] shrink-0" />
                      <span>{fac}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tombol COKLAT */}
            <div className="pt-5 mt-5 border-t border-[#E5DCD0] space-y-2">
              {isVipAvailable ? (
                <Link
                  href="/kamar"
                  className="w-full bg-[#806044] hover:bg-[#684D36] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs"
                >
                  Lihat Pilihan Kamar VIP
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs py-3 px-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 opacity-90"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Seluruh Kamar VIP Penuh (Tidak Tersedia)
                </button>
              )}
              {!isVipAvailable && (
                <p className="text-[11px] text-rose-600 text-center font-medium">
                  Seluruh unit tipe VIP sedang ditempati/dipesan sampai jadwal check-out tamu.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
