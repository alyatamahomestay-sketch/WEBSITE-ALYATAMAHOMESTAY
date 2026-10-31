'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Calendar, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  ExternalLink, 
  Eye, 
  RotateCcw,
  Check,
  AlertCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { Room } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';
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

export default function SetupMasaSewaPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<SectionConfig>(DEFAULT_CONFIG);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Active Tab: 'appearance' (teks seksi), 'rooms' (kelola kamar & tarif), 'preview' (pratinjau)
  const [activeTab, setActiveTab] = useState<'appearance' | 'rooms' | 'preview'>('appearance');

  // Room Modal State
  const [showRoomModal, setShowRoomModal] = useState(false);
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

  // Load Rooms and Saved Config
  const loadData = async () => {
    setLoading(true);
    try {
      const roomsData = await PmsService.getRooms();
      setRooms(roomsData);

      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('alyatama_rental_section_config');
        if (saved) {
          try {
            setConfig(JSON.parse(saved));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
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
    showNotification('Pengaturan tampilan seksi Masa Sewa berhasil disimpan!');
  };

  const handleResetConfig = () => {
    if (confirm('Kembalikan teks tampilan ke format standar?')) {
      setConfig(DEFAULT_CONFIG);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('alyatama_rental_section_config');
      }
      showNotification('Pengaturan tampilan dikembalikan ke standar awal.');
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
        ? 'Ruang Kamar Luas, Kamar Mandi Dalam, Water Heater, Smart TV, AC Dingin, Meja Kerja'
        : 'AC di Setiap Kamar, Wi-Fi Gratis, Kamar Mandi Dalam, Lemari Pakaian'
    );
    setPhotoUrl('/images/alyatama-flyer.jpg');
    setShowRoomModal(true);
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
    setShowRoomModal(true);
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
        showNotification(`Kamar No. ${roomNumber} (${name}) berhasil diperbarui.`);
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
        showNotification(`Kamar baru No. ${roomNumber} (${name}) berhasil ditambahkan.`);
      }

      await loadData();
      setShowRoomModal(false);
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
      showNotification(`Kamar No. ${rNum} berhasil dihapus.`);
      await loadData();
    } catch (err: any) {
      alert(`Gagal menghapus kamar: ${err?.message || err}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Top Banner & Heading */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#30291F] text-[#C9A84C]">
              <Settings className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
              Setup Masa Sewa &amp; Tarif Kamar
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Pusat kendali pengaturan seksi "Pilihan Masa Sewa Fleksibel" (Tipe REGULER &amp; VIP), penetapan tarif harian &amp; bulanan, dan manajemen unit kamar untuk halaman pengunjung.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Lihat Halaman Pengunjung
          </Link>
          <button
            onClick={() => openAddRoomModal('REGULER')}
            className="px-4 py-2 rounded-xl bg-[#806044] hover:bg-[#684D36] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Kamar Baru
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Overview Cards: Kamar & Tarif Terpantau */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card REGULER Info */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#30291F] text-white">
              Tipe REGULER
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {regulerRooms.length} Unit Kamar Aktif
            </span>
          </div>
          <h3 className="text-base font-bold text-stone-900">
            {config.regulerTitle}
          </h3>
          <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-stone-50 rounded-xl">
              <span className="text-[10px] text-stone-500 block">Tarif Harian Terpantau:</span>
              <span className="font-bold text-[#806044] text-sm">{regulerDailyDisplay}</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl">
              <span className="text-[10px] text-stone-500 block">Tarif Bulanan Terpantau:</span>
              <span className="font-bold text-[#65715A] text-sm">{regulerMonthlyDisplay}</span>
            </div>
          </div>
        </div>

        {/* Card VIP Info */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#806044]/60 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#806044] text-white flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C9A84C]" />
              Tipe VIP
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {vipRooms.length} Unit Kamar Aktif
            </span>
          </div>
          <h3 className="text-base font-bold text-stone-900">
            {config.vipTitle}
          </h3>
          <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#FAF7F2] rounded-xl">
              <span className="text-[10px] text-stone-500 block">Tarif Harian Terpantau:</span>
              <span className="font-bold text-[#806044] text-sm">{vipDailyDisplay}</span>
            </div>
            <div className="p-2.5 bg-[#FAF7F2] rounded-xl">
              <span className="text-[10px] text-stone-500 block">Tarif Bulanan Terpantau:</span>
              <span className="font-bold text-[#65715A] text-sm">{vipMonthlyDisplay}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'appearance'
              ? 'bg-[#806044] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Setup Teks &amp; Fasilitas Seksi
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'rooms'
              ? 'bg-[#806044] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Kelola Kamar &amp; Tarif ({rooms.length})
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'preview'
              ? 'bg-[#30291F] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Pratinjau Tampilan Pengunjung
        </button>
      </div>

      {/* TAB 1: SETUP KONTEN & FASILITAS */}
      {activeTab === 'appearance' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Pengaturan Teks Seksi "Pilihan Masa Sewa Fleksibel"
            </h3>
            <p className="text-xs text-stone-500">
              Sesuaikan judul, deskripsi, dan rincian fasilitas yang tampil di hadapan tamu pada halaman utama website.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Judul Seksi Utama:
                </label>
                <input
                  type="text"
                  value={config.sectionTitle}
                  onChange={(e) => setConfig({ ...config, sectionTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Deskripsi Sub-Judul:
                </label>
                <textarea
                  rows={2}
                  value={config.sectionSubtitle}
                  onChange={(e) => setConfig({ ...config, sectionSubtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white text-xs"
                />
              </div>
            </div>

            {/* Reguler Config Box */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#30291F] block">
                Konfigurasi Card: Tipe REGULER
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-0.5">Judul Card:</label>
                  <input
                    type="text"
                    value={config.regulerTitle}
                    onChange={(e) => setConfig({ ...config, regulerTitle: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-0.5">Label Badge:</label>
                  <input
                    type="text"
                    value={config.regulerBadge}
                    onChange={(e) => setConfig({ ...config, regulerBadge: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-0.5">Deskripsi Singkat:</label>
                <textarea
                  rows={2}
                  value={config.regulerDescription}
                  onChange={(e) => setConfig({ ...config, regulerDescription: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-0.5">
                  Daftar Fasilitas Reguler (Pisahkan dengan baris baru enter):
                </label>
                <textarea
                  rows={4}
                  value={config.regulerFacilities.join('\n')}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      regulerFacilities: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white font-mono"
                />
              </div>
            </div>

            {/* VIP Config Box */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#806044] block">
                Konfigurasi Card: Tipe VIP
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-0.5">Judul Card:</label>
                  <input
                    type="text"
                    value={config.vipTitle}
                    onChange={(e) => setConfig({ ...config, vipTitle: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-0.5">Label Badge:</label>
                  <input
                    type="text"
                    value={config.vipBadge}
                    onChange={(e) => setConfig({ ...config, vipBadge: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-0.5">Tagline Pita:</label>
                  <input
                    type="text"
                    value={config.vipTagline}
                    onChange={(e) => setConfig({ ...config, vipTagline: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-0.5">Deskripsi Singkat:</label>
                <textarea
                  rows={2}
                  value={config.vipDescription}
                  onChange={(e) => setConfig({ ...config, vipDescription: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-0.5">
                  Daftar Fasilitas VIP (Pisahkan dengan baris baru enter):
                </label>
                <textarea
                  rows={4}
                  value={config.vipFacilities.join('\n')}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      vipFacilities: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={handleResetConfig}
              className="text-xs text-rose-600 hover:text-rose-800 underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Kembalikan ke Teks Standar
            </button>
            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-6 py-2.5 rounded-xl bg-[#806044] hover:bg-[#684D36] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Pengaturan Tampilan
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: KELOLA KAMAR & TARIF */}
      {activeTab === 'rooms' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Daftar Unit Kamar &amp; Penetapan Tarif
              </h3>
              <p className="text-xs text-stone-500">
                Tarif harian dan bulanan yang Anda simpan di sini akan otomatis dihitung dan ditampilkan di kartu REGULER &amp; VIP pada halaman pengunjung.
              </p>
            </div>
            <button
              onClick={() => openAddRoomModal('REGULER')}
              className="px-4 py-2 rounded-xl bg-[#806044] hover:bg-[#684D36] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Kamar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 font-semibold text-center w-16">No.</th>
                  <th className="py-3 px-3 font-semibold">Nama Kamar</th>
                  <th className="py-3 px-3 font-semibold">Tipe Kategori</th>
                  <th className="py-3 px-3 font-semibold text-right">Tarif Harian</th>
                  <th className="py-3 px-3 font-semibold text-right">Tarif Bulanan</th>
                  <th className="py-3 px-3 font-semibold text-center">Kapasitas</th>
                  <th className="py-3 px-3 font-semibold text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rooms.map((rm) => {
                  const isVip = (rm.room_type || '').toUpperCase().includes('VIP') || (rm.name || '').toUpperCase().includes('VIP');
                  return (
                    <tr key={rm.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3 px-3 text-center font-mono font-bold text-stone-900">
                        {rm.room_number}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-stone-900 block">{rm.name}</span>
                        <span className="text-[10px] text-stone-500">{rm.description || 'Tidak ada deskripsi'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            isVip
                              ? 'bg-[#806044] text-white'
                              : 'bg-[#30291F] text-white'
                          }`}
                        >
                          {isVip ? 'Tipe VIP' : 'Tipe REGULER'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#806044]">
                        {formatRupiah(rm.base_rate)}/mlm
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#65715A]">
                        {rm.monthly_rate ? `${formatRupiah(rm.monthly_rate)}/bln` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center text-stone-600">
                        {rm.capacity_adults} Dewasa{rm.capacity_children > 0 ? `, ${rm.capacity_children} Anak` : ''}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditRoomModal(rm)}
                            className="p-1.5 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Edit Data Kamar"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#806044]" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRoom(rm.id, rm.name, rm.room_number)}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-stone-300 hover:border-rose-300 text-rose-600 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Hapus Kamar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRATINJAU LANGSUNG */}
      {activeTab === 'preview' && (
        <div className="bg-[#E7D8C5] border border-[#D4C3AD] p-6 sm:p-10 rounded-3xl space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#806044] block mb-1">
              Pratinjau Halaman Pengunjung
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#392B21]">
              {config.sectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#756A5F] mt-1.5 leading-relaxed">
              {config.sectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Card Reguler Preview */}
            <div className="bg-white rounded-3xl border border-[#D4C3AD] p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[#392B21] text-white">
                    {config.regulerBadge}
                  </span>
                  <span className="text-xs text-[#756A5F] font-medium">
                    {regulerRooms.length} Unit Kamar
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl text-[#392B21]">
                  {config.regulerTitle}
                </h3>
                <p className="text-xs text-[#756A5F] leading-relaxed">
                  {config.regulerDescription}
                </p>

                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E5DCD0] space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[#E5DCD0]/70">
                    <span className="font-semibold text-[#392B21]">Sewa Harian</span>
                    <span className="font-bold text-[#806044]">{regulerDailyDisplay} / malam</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[#E5DCD0]/70">
                    <span className="font-semibold text-[#392B21]">Sewa Bulanan</span>
                    <span className="font-bold text-[#65715A]">{regulerMonthlyDisplay} / bulan</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#756A5F]">
                  {config.regulerFacilities.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#806044] shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E5DCD0]">
                <button
                  type="button"
                  className="w-full bg-[#806044] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-default"
                >
                  Lihat Pilihan Kamar Reguler &rarr;
                </button>
              </div>
            </div>

            {/* Card VIP Preview */}
            <div className="bg-white rounded-3xl border-2 border-[#806044] p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#806044] text-white text-[9px] font-extrabold uppercase px-3 py-1 rounded-bl-xl">
                {config.vipTagline}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[#806044] text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#C9A84C]" />
                    {config.vipBadge}
                  </span>
                  <span className="text-xs text-[#756A5F] font-medium pr-16">
                    {vipRooms.length} Unit Kamar
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl text-[#392B21]">
                  {config.vipTitle}
                </h3>
                <p className="text-xs text-[#756A5F] leading-relaxed">
                  {config.vipDescription}
                </p>

                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E5DCD0] space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[#E5DCD0]/70">
                    <span className="font-semibold text-[#392B21]">Sewa Harian VIP</span>
                    <span className="font-bold text-[#806044]">{vipDailyDisplay} / malam</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[#E5DCD0]/70">
                    <span className="font-semibold text-[#392B21]">Sewa Bulanan VIP</span>
                    <span className="font-bold text-[#65715A]">{vipMonthlyDisplay} / bulan</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#756A5F]">
                  {config.vipFacilities.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#806044] shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E5DCD0]">
                <button
                  type="button"
                  className="w-full bg-[#806044] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-default"
                >
                  Lihat Pilihan Kamar VIP &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT KAMAR */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 my-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif font-bold text-base text-stone-900">
                {editingRoomId ? `Edit Data Kamar No. ${roomNumber}` : 'Tambah Unit Kamar Baru'}
              </h3>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-stone-400 hover:text-stone-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    No. Kamar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 103"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold"
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
                    className="w-full p-2 rounded-xl border border-stone-300 bg-stone-50 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Kategori Tipe Kamar:
                </label>
                <div className="flex gap-2 mb-1.5">
                  <button
                    type="button"
                    onClick={() => setRoomType('REGULER')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                      roomType.toUpperCase().includes('REGULER')
                        ? 'bg-[#30291F] text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    REGULER
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoomType('VIP')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                      roomType.toUpperCase().includes('VIP')
                        ? 'bg-[#806044] text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                    VIP
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ketik REGULER atau VIP"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full p-2 rounded-xl border border-stone-300 bg-stone-50 text-xs font-semibold"
                />
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0] space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#806044] block">
                  Penetapan Tarif Sewa (IDR)
                </span>
                <div className="grid grid-cols-2 gap-3">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Kapasitas Dewasa</label>
                  <input
                    type="number"
                    min="1"
                    value={capacityAdults}
                    onChange={(e) => setCapacityAdults(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Kapasitas Anak</label>
                  <input
                    type="number"
                    min="0"
                    value={capacityChildren}
                    onChange={(e) => setCapacityChildren(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              {/* Image Upload Picker */}
              <div>
                <ImageUploadPicker
                  value={photoUrl}
                  onChange={(url) => setPhotoUrl(url)}
                  label="Foto Kamar (Dari File Explorer)"
                  folder="rooms"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Fasilitas Kamar:</label>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  placeholder="AC, WiFi, Kamar Mandi Dalam, dll."
                  className="w-full p-2 rounded-xl border border-stone-300 bg-stone-50 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Deskripsi:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 rounded-xl border border-stone-300 bg-stone-50 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingRoom}
                  className="px-5 py-2.5 rounded-xl bg-[#806044] hover:bg-[#684D36] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {savingRoom ? 'Menyimpan...' : editingRoomId ? 'Simpan Perubahan' : 'Tambahkan Kamar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
