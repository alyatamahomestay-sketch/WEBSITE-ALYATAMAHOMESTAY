'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  X, 
  Save, 
  Eye, 
  Layers, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Room } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';
import { PmsService } from '@/lib/services/pms-service';
import ImageUploadPicker from '@/components/common/ImageUploadPicker';

interface SectionConfig {
  sectionTitle: string;
  sectionSubtitle: string;
  regulerBadge: string;
  regulerTitle: string;
  regulerDescription: string;
  regulerFacilities: string[];
  vipBadge: string;
  vipTagline: string;
  vipTitle: string;
  vipDescription: string;
  vipFacilities: string[];
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
  vipBadge: 'Tipe Kamar VIP',
  vipTagline: 'Prioritas & Nyaman',
  vipTitle: 'Kamar Syariah VIP',
  vipDescription: 'Akomodasi berkelas dengan ruang lebih luas, fasilitas eksklusif, privasi maksimal, dan suasana tenang untuk keluarga maupun penugasan eksekutif.',
  vipFacilities: [
    'Ruang kamar lebih luas dengan tata letak privat & elegan',
    'Kamar mandi dalam luas + Water Heater (Pemanas Air)',
    'AC dingin, Smart TV, dan meja kerja eksklusif',
    'Area parkir mobil luas & dekat unit kamar'
  ]
};

interface RentalSectionProps {
  initialRooms: Room[];
}

export default function RentalSectionWithAdminSetup({ initialRooms }: RentalSectionProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('Administrator');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'content' | 'add_room' | 'manage_rooms'>('content');
  const [config, setConfig] = useState<SectionConfig>(DEFAULT_CONFIG);
  const [notification, setNotification] = useState<string | null>(null);

  // Form states for adding / editing rooms
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState('REGULER');
  const [description, setDescription] = useState('');
  const [capacityAdults, setCapacityAdults] = useState(2);
  const [capacityChildren, setCapacityChildren] = useState(1);
  const [baseRate, setBaseRate] = useState(200000);
  const [monthlyRate, setMonthlyRate] = useState<number | ''>(2200000);
  const [amenitiesInput, setAmenitiesInput] = useState('AC di Setiap Kamar, Wi-Fi Gratis, Kamar Mandi Dalam');
  const [photoUrl, setPhotoUrl] = useState('');
  const [savingRoom, setSavingRoom] = useState(false);

  // Check admin session and load saved section config on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessStr = localStorage.getItem('alyatama_staff_session');
      if (sessStr) {
        try {
          const sess = JSON.parse(sessStr);
          if (sess && (sess.role === 'admin' || sess.role === 'staff')) {
            setIsAdmin(true);
            setAdminName(sess.full_name || sess.username || 'Admin');
          }
        } catch (e) {}
      }

      const savedConfig = localStorage.getItem('alyatama_rental_section_config');
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (e) {}
      }
    }
  }, []);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const reloadRooms = async () => {
    try {
      const updated = await PmsService.getRooms();
      setRooms(updated);
    } catch (e) {
      console.error('Failed to reload rooms:', e);
    }
  };

  // Group rooms into REGULER and VIP
  const activeRooms = rooms.filter((r) => !r.is_archived);

  const regulerRooms = activeRooms.filter((r) => {
    const type = (r.room_type || '').toUpperCase();
    const rName = (r.name || '').toUpperCase();
    return (
      type.includes('REGULER') ||
      rName.includes('REGULER') ||
      type.includes('STANDARD') ||
      rName.includes('STANDARD') ||
      type.includes('DELUXE') ||
      rName.includes('DELUXE') ||
      type.includes('SINGLE') ||
      (!type.includes('VIP') && !type.includes('EKSEKUTIF') && !type.includes('SUITE') && !type.includes('PAVILIUN'))
    );
  });

  const vipRooms = activeRooms.filter((r) => {
    const type = (r.room_type || '').toUpperCase();
    const rName = (r.name || '').toUpperCase();
    return (
      type.includes('VIP') ||
      rName.includes('VIP') ||
      type.includes('EKSEKUTIF') ||
      rName.includes('EKSEKUTIF') ||
      type.includes('SUITE') ||
      rName.includes('SUITE') ||
      type.includes('PAVILIUN') ||
      rName.includes('PAVILIUN') ||
      !regulerRooms.some((reg) => reg.id === r.id)
    );
  });

  // Rates for REGULER
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

  // Rates for VIP
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

  // Save Content Config
  const handleSaveConfig = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alyatama_rental_section_config', JSON.stringify(config));
    }
    showNotif('Tampilan seksi Pilihan Masa Sewa Fleksibel berhasil diperbarui!');
    setShowAdminModal(false);
  };

  const handleResetConfig = () => {
    if (confirm('Kembalikan teks tampilan ke format standar?')) {
      setConfig(DEFAULT_CONFIG);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('alyatama_rental_section_config');
      }
      showNotif('Tampilan seksi dikembalikan ke standar bawaan.');
    }
  };

  // Open Room Modal
  const openAddRoomModal = (presetType?: string) => {
    setEditingRoomId(null);
    setRoomNumber('');
    setName('');
    setRoomType(presetType || 'REGULER');
    setDescription('');
    setCapacityAdults(2);
    setCapacityChildren(1);
    setBaseRate(presetType === 'VIP' ? 350000 : 200000);
    setMonthlyRate(presetType === 'VIP' ? 3600000 : 2200000);
    setAmenitiesInput(
      presetType === 'VIP'
        ? 'Ruang Luas, Kamar Mandi Dalam, Water Heater, Smart TV, AC Dingin, Meja Kerja'
        : 'AC di Setiap Kamar, Wi-Fi Gratis, Kamar Mandi Dalam, Lemari Pakaian'
    );
    setPhotoUrl('/images/alyatama-flyer.jpg');
    setActiveModalTab('add_room');
    setShowAdminModal(true);
  };

  const openEditRoomModal = (room: Room) => {
    setEditingRoomId(room.id);
    setRoomNumber(room.room_number);
    setName(room.name);
    setRoomType(room.room_type);
    setDescription(room.description);
    setCapacityAdults(room.capacity_adults);
    setCapacityChildren(room.capacity_children);
    setBaseRate(room.base_rate);
    setMonthlyRate(room.monthly_rate ?? '');
    setAmenitiesInput(room.amenities.join(', '));
    setPhotoUrl(room.photos?.[0] || '');
    setActiveModalTab('add_room');
    setShowAdminModal(true);
  };

  // Save Room (Add / Edit)
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRoom(true);

    const amenitiesArr = amenitiesInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const photosArr = photoUrl.trim() ? [photoUrl.trim()] : [];
    const numMonthly = monthlyRate !== '' ? Number(monthlyRate) : undefined;

    try {
      if (editingRoomId) {
        await PmsService.updateRoom(editingRoomId, {
          room_number: roomNumber,
          name,
          room_type: roomType,
          description,
          capacity_adults: capacityAdults,
          capacity_children: capacityChildren,
          base_rate: baseRate,
          monthly_rate: numMonthly,
          amenities: amenitiesArr,
          photos: photosArr,
        });
        showNotif(`Kamar No. ${roomNumber} (${name}) berhasil diperbarui!`);
      } else {
        await PmsService.createRoom({
          room_number: roomNumber,
          name,
          room_type: roomType,
          description,
          capacity_adults: capacityAdults,
          capacity_children: capacityChildren,
          base_rate: baseRate,
          monthly_rate: numMonthly,
          operational_status: 'tersedia',
          amenities: amenitiesArr,
          photos: photosArr,
          is_archived: false,
        });
        showNotif(`Kamar baru No. ${roomNumber} (${name}) berhasil ditambahkan!`);
      }

      await reloadRooms();
      setShowAdminModal(false);
    } catch (err: any) {
      alert(`Gagal menyimpan kamar: ${err?.message || err}`);
    } finally {
      setSavingRoom(false);
    }
  };

  // Delete Room
  const handleDeleteRoom = async (roomId: string, rName: string, rNum: string) => {
    if (!confirm(`Yakin ingin menghapus Kamar No. ${rNum} (${rName})? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      await PmsService.deleteRoom(roomId);
      showNotif(`Kamar No. ${rNum} berhasil dihapus.`);
      await reloadRooms();
    } catch (err: any) {
      alert(`Gagal menghapus kamar: ${err?.message || err}`);
    }
  };

  return (
    <>
      {/* ============================================================== */}
      {/* FLOATING ADMIN QUICK CONTROL BAR                               */}
      {/* ============================================================== */}
      {isAdmin && (
        <aside 
          aria-label="Panel Kontrol Cepat Admin"
          className="fixed bottom-4 right-4 z-40 bg-[#30291F] text-[#F7F4ED] p-3 sm:px-4 sm:py-3 rounded-2xl shadow-2xl border-2 border-[#C9A84C]/80 flex items-center gap-3 backdrop-blur-md animate-fade-in"
        >
          <div className="flex items-center gap-2 pr-2 border-r border-stone-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="text-left hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-[#C9A84C] block leading-none">
                Admin ALYATAMA
              </span>
              <span className="text-xs font-semibold text-white truncate max-w-[120px] block">
                {adminName}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveModalTab('content');
              setShowAdminModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#806044] hover:bg-[#6b5038] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Setup Tampilan Seksi & Tarif"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Setup Masa Sewa</span>
          </button>

          <button
            onClick={() => openAddRoomModal('REGULER')}
            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Tambah Kamar Baru Langsung"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tambah Kamar</span>
          </button>

          <Link
            href="/panel"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium transition flex items-center gap-1"
            title="Buka Portal Dashboard Admin"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panel Admin</span>
          </Link>
        </aside>
      )}

      {/* Floating Notification */}
      {notification && (
        <aside 
          aria-live="polite"
          className="fixed top-6 right-6 z-50 bg-emerald-900 text-emerald-100 px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs font-medium animate-bounce"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </aside>
      )}

      {/* ============================================================== */}
      {/* SECTION: PILIHAN MASA SEWA FLEKSIBEL                           */}
      {/* ============================================================== */}
      <section className="w-full bg-[#E7D8C5] border-b border-[#D4C3AD] py-14 sm:py-18 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          
          {/* Header Section with Admin Setup Button */}
          <div className="text-center max-w-2xl mx-auto mb-10 relative">
            {isAdmin && (
              <div className="mb-3 inline-flex items-center gap-2 bg-[#30291F] text-[#F7F4ED] px-3.5 py-1.5 rounded-full border border-[#C9A84C]/50 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
                <span className="text-[11px] font-semibold">Mode Admin Aktif</span>
                <button
                  onClick={() => {
                    setActiveModalTab('content');
                    setShowAdminModal(true);
                  }}
                  className="ml-1 text-[11px] bg-[#806044] hover:bg-[#684D36] text-white px-2 py-0.5 rounded font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  Edit Tampilan
                </button>
                <button
                  onClick={() => {
                    setActiveModalTab('manage_rooms');
                    setShowAdminModal(true);
                  }}
                  className="text-[11px] bg-stone-700 hover:bg-stone-600 text-white px-2 py-0.5 rounded font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="w-3 h-3" />
                  Kelola Kamar
                </button>
              </div>
            )}

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            
            {/* Card 1: TIPE REGULER */}
            <div className="bg-white rounded-3xl border border-[#D4C3AD] p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between relative group">
              {isAdmin && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openAddRoomModal('REGULER')}
                    className="p-1.5 bg-[#FAF7F2] hover:bg-emerald-50 text-emerald-700 rounded-lg border border-[#E5DCD0] text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                    title="Tambah Unit Kamar Reguler"
                  >
                    <Plus className="w-3 h-3" />
                    Tambah Unit
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#392B21] text-white">
                    {config.regulerBadge}
                  </span>
                  <span className="text-xs text-[#756A5F] font-medium pr-2">
                    {regulerRooms.length > 0 ? `${regulerRooms.length} Unit Kamar` : 'Unit Tersedia'}
                  </span>
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
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#806044] block">
                      Rincian Biaya Sewa (Tarif Resmi):
                    </span>
                    {isAdmin && (
                      <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded">
                        Sinkron Admin
                      </span>
                    )}
                  </div>

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

              {/* Action Button: COKLAT IDENTIK DENGAN CARD VIP SESUAI PERMINTAAN USER */}
              <div className="pt-5 mt-5 border-t border-[#E5DCD0]">
                <Link
                  href="/kamar"
                  className="w-full bg-[#806044] hover:bg-[#684D36] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs"
                >
                  Lihat Pilihan Kamar Reguler
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: TIPE VIP */}
            <div className="bg-white rounded-3xl border-2 border-[#806044] p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between relative group overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#806044] text-white text-[10px] font-extrabold uppercase px-3.5 py-1 rounded-bl-xl tracking-wider">
                {config.vipTagline}
              </div>

              {isAdmin && (
                <div className="absolute top-8 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openAddRoomModal('VIP')}
                    className="p-1.5 bg-[#FAF7F2] hover:bg-emerald-50 text-emerald-700 rounded-lg border border-[#E5DCD0] text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                    title="Tambah Unit Kamar VIP"
                  >
                    <Plus className="w-3 h-3" />
                    Tambah Unit VIP
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#806044] text-white flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#C9A84C]" />
                    {config.vipBadge}
                  </span>
                  <span className="text-xs text-[#756A5F] font-medium pr-24 sm:pr-28">
                    {vipRooms.length > 0 ? `${vipRooms.length} Unit Kamar` : 'Unit Prioritas'}
                  </span>
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
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#806044] block">
                      Rincian Biaya Sewa (Tarif Resmi):
                    </span>
                    {isAdmin && (
                      <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded">
                        Sinkron Admin
                      </span>
                    )}
                  </div>

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

              {/* Action Button: COKLAT */}
              <div className="pt-5 mt-5 border-t border-[#E5DCD0]">
                <Link
                  href="/kamar"
                  className="w-full bg-[#806044] hover:bg-[#684D36] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs"
                >
                  Lihat Pilihan Kamar VIP
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* ADMIN SETUP & CONTROL MODAL                                    */}
      {/* ============================================================== */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 my-auto space-y-5 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#30291F] text-[#C9A84C]">
                  <Settings className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Setup Admin — Halaman Pengunjung
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Kontrol seksi Masa Sewa, tambah kamar baru, edit data, dan hapus unit kamar langsung.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveModalTab('content')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeModalTab === 'content'
                    ? 'bg-[#806044] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Setup Teks &amp; Fasilitas
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingRoomId(null);
                  setActiveModalTab('add_room');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeModalTab === 'add_room' && !editingRoomId
                    ? 'bg-[#806044] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                + Tambah Kamar Baru
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('manage_rooms')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeModalTab === 'manage_rooms'
                    ? 'bg-[#806044] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Daftar Kamar ({rooms.length})
              </button>
            </div>

            {/* TAB 1: SETUP KONTEN & FASILITAS */}
            {activeModalTab === 'content' && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Judul Seksi Utama:
                    </label>
                    <input
                      type="text"
                      value={config.sectionTitle}
                      onChange={(e) => setConfig({ ...config, sectionTitle: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#806044]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Deskripsi Sub-Judul Seksi:
                    </label>
                    <textarea
                      rows={2}
                      value={config.sectionSubtitle}
                      onChange={(e) => setConfig({ ...config, sectionSubtitle: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#806044]"
                    />
                  </div>
                </div>

                {/* Reguler Config */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#30291F] block">
                    Konfigurasi Card: Tipe REGULER
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] text-stone-600 block mb-0.5">Judul Card:</label>
                      <input
                        type="text"
                        value={config.regulerTitle}
                        onChange={(e) => setConfig({ ...config, regulerTitle: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-600 block mb-0.5">Label Badge:</label>
                      <input
                        type="text"
                        value={config.regulerBadge}
                        onChange={(e) => setConfig({ ...config, regulerBadge: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-0.5">Deskripsi Singkat:</label>
                    <textarea
                      rows={2}
                      value={config.regulerDescription}
                      onChange={(e) => setConfig({ ...config, regulerDescription: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-0.5">
                      Fasilitas Reguler (Pisahkan dengan baris baru enter):
                    </label>
                    <textarea
                      rows={3}
                      value={config.regulerFacilities.join('\n')}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          regulerFacilities: e.target.value.split('\n').filter(Boolean),
                        })
                      }
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                </div>

                {/* VIP Config */}
                <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0] space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#806044] block">
                    Konfigurasi Card: Tipe VIP
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] text-stone-600 block mb-0.5">Judul Card:</label>
                      <input
                        type="text"
                        value={config.vipTitle}
                        onChange={(e) => setConfig({ ...config, vipTitle: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-600 block mb-0.5">Label Badge:</label>
                      <input
                        type="text"
                        value={config.vipBadge}
                        onChange={(e) => setConfig({ ...config, vipBadge: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-600 block mb-0.5">Tagline Pita:</label>
                      <input
                        type="text"
                        value={config.vipTagline}
                        onChange={(e) => setConfig({ ...config, vipTagline: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-0.5">Deskripsi Singkat:</label>
                    <textarea
                      rows={2}
                      value={config.vipDescription}
                      onChange={(e) => setConfig({ ...config, vipDescription: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-0.5">
                      Fasilitas VIP (Pisahkan dengan baris baru enter):
                    </label>
                    <textarea
                      rows={3}
                      value={config.vipFacilities.join('\n')}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          vipFacilities: e.target.value.split('\n').filter(Boolean),
                        })
                      }
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleResetConfig}
                    className="text-xs text-rose-600 hover:text-rose-800 underline cursor-pointer"
                  >
                    Kembalikan ke Teks Standar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="px-5 py-2.5 rounded-xl bg-[#806044] hover:bg-[#684D36] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Tampilan Seksi
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: TAMBAH / EDIT KAMAR LANGSUNG */}
            {activeModalTab === 'add_room' && (
              <form onSubmit={handleSaveRoom} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <div className="flex items-center justify-between bg-stone-100 p-2.5 rounded-xl">
                  <span className="text-xs font-bold text-stone-800">
                    {editingRoomId ? `Edit Data Kamar No. ${roomNumber}` : 'Tambah Unit Kamar Baru'}
                  </span>
                  {editingRoomId && (
                    <button
                      type="button"
                      onClick={() => setEditingRoomId(null)}
                      className="text-[11px] text-[#806044] underline"
                    >
                      Beralih ke Tambah Baru
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      Nomor Kamar <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 103"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full p-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      Nama Kamar <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kamar Syariah Deluxe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white text-xs"
                    />
                  </div>
                </div>

                {/* Quick Type Selector (REGULER vs VIP) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-800">
                    Tipe Kategori Kamar:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRoomType('REGULER')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        roomType.toUpperCase().includes('REGULER')
                          ? 'bg-[#30291F] text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      Tipe REGULER
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoomType('VIP')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        roomType.toUpperCase().includes('VIP')
                          ? 'bg-[#806044] text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                      Tipe VIP
                    </button>
                  </div>
                </div>

                {/* Multi-Masa Sewa Rates */}
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0] space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#806044] block">
                    Penetapan Tarif Sewa (IDR)
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Tarif Harian / Malam *</label>
                      <input
                        type="number"
                        required
                        min="50000"
                        step="5000"
                        value={baseRate}
                        onChange={(e) => setBaseRate(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Tarif Bulanan (30 hari)</label>
                      <input
                        type="number"
                        min="500000"
                        step="50000"
                        placeholder="Contoh: 2500000"
                        value={monthlyRate}
                        onChange={(e) => setMonthlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload Picker directly via File Explorer */}
                <div>
                  <ImageUploadPicker
                    value={photoUrl}
                    onChange={(url) => setPhotoUrl(url)}
                    label="Foto Kamar (Jelajahi File Explorer Langsung)"
                    folder="rooms"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Fasilitas Kamar (Pisahkan dengan koma):
                  </label>
                  <input
                    type="text"
                    value={amenitiesInput}
                    onChange={(e) => setAmenitiesInput(e.target.value)}
                    placeholder="Contoh: AC Dingin, Wi-Fi Gratis, Kamar Mandi Dalam, Water Heater"
                    className="w-full p-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Deskripsi Ringkas:
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Keterangan suasana, kasur, dan tata letak kamar..."
                    className="w-full p-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('manage_rooms')}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingRoom}
                    className="px-5 py-2.5 rounded-xl bg-[#806044] hover:bg-[#684D36] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {savingRoom ? 'Menyimpan...' : editingRoomId ? 'Simpan Perubahan Kamar' : 'Tambahkan Kamar Ini'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: KELOLA & HAPUS KAMAR */}
            {activeModalTab === 'manage_rooms' && (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-xs font-bold text-stone-800">
                    Daftar Kamar Terdaftar ({rooms.length} Unit)
                  </span>
                  <button
                    onClick={() => openAddRoomModal('REGULER')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Kamar Baru
                  </button>
                </div>

                <div className="space-y-2">
                  {rooms.map((rm) => {
                    const isVip = (rm.room_type || '').toUpperCase().includes('VIP') || (rm.name || '').toUpperCase().includes('VIP');
                    return (
                      <div
                        key={rm.id}
                        className="p-3 bg-stone-50 hover:bg-stone-100/80 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-10 h-10 rounded-xl bg-[#30291F] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {rm.room_number}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-stone-900 truncate">
                                {rm.name}
                              </h4>
                              <span
                                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                  isVip
                                    ? 'bg-[#806044] text-white'
                                    : 'bg-stone-200 text-stone-800'
                                }`}
                              >
                                {isVip ? 'VIP' : 'REGULER'}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                              <span>Harian: <strong className="text-stone-800">{formatRupiah(rm.base_rate)}</strong></span>
                              <span>&bull;</span>
                              <span>Bulanan: <strong className="text-[#65715A]">{rm.monthly_rate ? formatRupiah(rm.monthly_rate) : '-'}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditRoomModal(rm)}
                            className="p-2 rounded-lg bg-white hover:bg-stone-200 text-stone-700 border border-stone-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Edit Data Kamar"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#806044]" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRoom(rm.id, rm.name, rm.room_number)}
                            className="p-2 rounded-lg bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-stone-300 hover:border-rose-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Hapus Kamar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Hapus</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span>Perubahan kamar otomatis menyinkronkan tarif pada halaman pengunjung.</span>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
