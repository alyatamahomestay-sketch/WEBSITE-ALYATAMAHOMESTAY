'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Lock, 
  BedDouble, 
  Wifi, 
  Wind, 
  Shield, 
  Car, 
  Coffee, 
  Tv, 
  Droplet, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Save, 
  ExternalLink, 
  Eye, 
  RotateCcw,
  Layers,
  ArrowUp,
  ArrowDown,
  Settings,
  Clock,
  MapPin,
  Heart
} from 'lucide-react';
import { 
  FacilitiesConfig, 
  FacilityItem, 
  DEFAULT_FACILITIES_CONFIG, 
  renderFacilityIcon 
} from '@/components/public/FacilitiesSection';
import { showAdminToast } from '@/components/common/AdminToast';

const AVAILABLE_ICONS = [
  { value: 'Sparkles', label: 'Bintang / Sparkles' },
  { value: 'Lock', label: 'Gembok / Keamanan Privasi' },
  { value: 'BedDouble', label: 'Tempat Tidur / Kamar' },
  { value: 'Wifi', label: 'Wi-Fi Internet' },
  { value: 'Wind', label: 'AC / Udara Dingin' },
  { value: 'Shield', label: 'Perisai / Keamanan 24 Jam' },
  { value: 'Car', label: 'Parkir Kendaraan / Mobil' },
  { value: 'Coffee', label: 'F&B / Kopi / Minuman' },
  { value: 'Tv', label: 'Smart TV' },
  { value: 'Droplet', label: 'Air / Pemanas Air (Water Heater)' },
  { value: 'Clock', label: 'Jam / Waktu Operasional' },
  { value: 'MapPin', label: 'Lokasi / Posisi Strategis' },
  { value: 'Heart', label: 'Kenyamanan / Dakwah Sosial' },
  { value: 'CheckCircle2', label: 'Ceklis Standar' }
];

export default function SetupFasilitasPage() {
  const [config, setConfig] = useState<FacilitiesConfig>(DEFAULT_FACILITIES_CONFIG);
  const [activeTab, setActiveTab] = useState<'cards' | 'header' | 'preview'>('cards');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alyatama_facilities_section_config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.items)) {
            setConfig(parsed);
          }
        } catch (e) {}
      }
    }
  }, []);

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alyatama_facilities_section_config', JSON.stringify(config));
      window.dispatchEvent(new Event('storage'));
    }
    showAdminToast('edit', 'Seluruh perubahan fasilitas homestay berhasil disimpan dan langsung aktif di homepage.');
    showNotification('Berhasil Diubah: Seluruh perubahan fasilitas berhasil disimpan dan langsung aktif di halaman pengunjung!');
  };

  const handleReset = () => {
    if (confirm('Kembalikan seluruh teks dan susunan kartu Fasilitas Homestay ke format standar awal?')) {
      setConfig(DEFAULT_FACILITIES_CONFIG);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('alyatama_facilities_section_config');
        window.dispatchEvent(new Event('storage'));
      }
      showAdminToast('edit', 'Pengaturan Fasilitas Homestay berhasil dikembalikan ke standar awal.');
      showNotification('Berhasil Diubah: Pengaturan Fasilitas Homestay berhasil dikembalikan ke standar awal.');
    }
  };

  // Card list operations
  const handleItemChange = (index: number, field: keyof FacilityItem, value: string) => {
    const updated = [...config.items];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, items: updated });
  };

  const handleAddItem = () => {
    const nextNum = config.items.length + 1;
    const newItem: FacilityItem = {
      id: `fac-${Date.now()}`,
      icon: 'CheckCircle2',
      title: `${nextNum}. Fasilitas Baru`,
      description: 'Tuliskan deskripsi keunggulan fasilitas homestay di sini.'
    };
    setConfig({ ...config, items: [...config.items, newItem] });
    showAdminToast('add', `Kartu fasilitas baru "${newItem.title}" berhasil ditambahkan.`);
    showNotification('Berhasil Menambahkan: Kartu fasilitas baru berhasil ditambahkan di urutan terbawah.');
  };

  const handleDeleteItem = (index: number, title: string) => {
    if (confirm(`Yakin ingin menghapus kartu fasilitas "${title}"?`)) {
      const updated = config.items.filter((_, idx) => idx !== index);
      setConfig({ ...config, items: updated });
      showAdminToast('delete', `Kartu fasilitas "${title}" berhasil dihapus.`);
      showNotification(`Berhasil Dihapus: Kartu fasilitas "${title}" berhasil dihapus.`);
    }
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= config.items.length) return;

    const updated = [...config.items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setConfig({ ...config, items: updated });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans pb-16">
      
      {/* Top Banner & Heading */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#30291F] text-[#C9A84C]">
              <Settings className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
              Setup Fasilitas Homestay (Halaman Pengunjung)
            </h1>
          </div>
          <p className="text-xs text-stone-500">
            Pusat kendali pengaturan seksi "Fasilitas Homestay" berstandar syariah. Anda dapat mengubah judul, deskripsi setiap kartu, memilih ikon, menambah atau menghapus fasilitas yang tampil di website utama.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Buka Halaman Pengunjung
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-[#806044] hover:bg-[#684D36] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
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

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
            Total Kartu Fasilitas
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#806044]">{config.items.length}</span>
            <span className="text-xs text-stone-500">Fasilitas Aktif</span>
          </div>
          <p className="text-[11px] text-stone-400">Tampil dalam format grid di homepage</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
            Judul Seksi Terpantau
          </span>
          <p className="text-sm font-bold text-stone-900 truncate">{config.title}</p>
          <span className="text-[11px] text-[#806044] font-medium block truncate">
            Badge: {config.badge || 'FASILITAS HOMESTAY'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
            Status Sinkronisasi
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-700">Terhubung Langsung</span>
          </div>
          <p className="text-[11px] text-stone-400">Pengunjung melihat hasil simpan tanpa refresh</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('cards')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'cards'
              ? 'bg-[#806044] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Kelola Kartu Fasilitas ({config.items.length})
        </button>

        <button
          onClick={() => setActiveTab('header')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'header'
              ? 'bg-[#806044] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Pengaturan Judul &amp; Deskripsi Seksi
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
          Pratinjau Halaman Pengunjung
        </button>
      </div>

      {/* TAB 1: KELOLA KARTU FASILITAS */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 font-serif">
                Daftar Kartu Fasilitas Homestay
              </h2>
              <p className="text-xs text-stone-500">
                Ubah teks judul dan deskripsi setiap kartu secara langsung, tentukan ikon yang paling sesuai, atau atur urutan tampilannya.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 rounded-xl bg-[#806044] hover:bg-[#684D36] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Kartu Baru
              </button>
            </div>
          </div>

          {/* Cards Grid Editor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.items.map((item, index) => {
              const isEven = index % 2 === 0;
              const iconAccentClass = isEven ? 'bg-[#65715A]/15 text-[#65715A]' : 'bg-[#806044]/15 text-[#806044]';

              return (
                <div
                  key={item.id || index}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-[#806044]/50 transition space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Row: Index Badge & Ordering Buttons */}
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#30291F] text-white font-mono font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-stone-700">
                          Kartu #{index + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveItem(index, 'up')}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Geser ke Atas / Kiri"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === config.items.length - 1}
                          onClick={() => handleMoveItem(index, 'down')}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Geser ke Bawah / Kanan"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(index, item.title)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition ml-1"
                          title="Hapus Kartu Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Icon Selection with Visual Preview */}
                    <div className="flex items-center gap-3 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5DCD0]">
                      <div className={`w-10 h-10 rounded-xl ${iconAccentClass} flex items-center justify-center shrink-0`}>
                        {renderFacilityIcon(item.icon, "w-5 h-5")}
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">
                          Pilih Ikon Fasilitas:
                        </label>
                        <select
                          value={item.icon}
                          onChange={(e) => handleItemChange(index, 'icon', e.target.value)}
                          className="w-full text-xs font-semibold p-1.5 rounded-lg border border-stone-300 bg-white text-stone-800"
                        >
                          {AVAILABLE_ICONS.map((ic) => (
                            <option key={ic.value} value={ic.value}>
                              {ic.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Title Input */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Judul Fasilitas:
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                        placeholder="Contoh: 1. Lingkungan Islami & Nyaman"
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white text-[#392B21] focus:ring-1 focus:ring-[#806044]"
                      />
                    </div>

                    {/* Description Textarea */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Deskripsi Penjelasan:
                      </label>
                      <textarea
                        rows={3}
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Tuliskan penjelasan fasilitas yang dirasakan oleh tamu..."
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white text-stone-700 leading-relaxed focus:ring-1 focus:ring-[#806044]"
                      />
                    </div>
                  </div>

                  {/* Card Footer Live Preview Info */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span>ID: {item.id}</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Aktif di Pengunjung
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-800 underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Kembalikan Seluruh Fasilitas ke Standar Flyer
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Kartu Baru
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-[#806044] hover:bg-[#684D36] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Simpan Seluruh Pengaturan Fasilitas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENGATURAN JUDUL & DESKRIPSI SEKSI */}
      {activeTab === 'header' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <div>
            <h2 className="font-serif font-bold text-base text-stone-900">
              Pengaturan Judul &amp; Deskripsi Seksi "Fasilitas Homestay"
            </h2>
            <p className="text-xs text-stone-500">
              Ubah teks tajuk atas yang berada tepat di atas kartu-kartu fasilitas pada halaman depan website.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Badge / Kategori Kecil (Huruf Kapital):
              </label>
              <input
                type="text"
                value={config.badge}
                onChange={(e) => setConfig({ ...config, badge: e.target.value })}
                placeholder="FASILITAS HOMESTAY"
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white uppercase tracking-wider text-[#806044]"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Tampil sebagai label kecil di bagian paling atas seksi fasilitas.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Judul Utama Seksi:
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Fasilitas Nyaman Berstandar Syariah"
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white text-[#392B21]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Sub-Judul / Deskripsi Pendukung:
              </label>
              <textarea
                rows={3}
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                placeholder="Dirancang untuk mendukung istirahat yang berkualitas dan menjaga kenyamanan ibadah selama menginap."
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white text-stone-700 leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-800 underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset ke Teks Standar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-[#806044] hover:bg-[#684D36] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Judul Seksi
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PRATINJAU LANGSUNG */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="bg-stone-100 p-4 rounded-2xl border border-stone-300 text-stone-700 text-xs flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#806044]" />
              Pratinjau Tampilan Pengunjung (Seksi Fasilitas Homestay):
            </span>
            <Link
              href="/"
              target="_blank"
              className="underline text-[#806044] font-bold flex items-center gap-1"
            >
              Lihat di Website Publik <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Section Render Preview (Exact Replica) */}
          <div className="w-full py-16 sm:py-20 bg-white border border-[#E5DCD0] rounded-3xl shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-[#806044] block mb-2">
                  {config.badge || 'Fasilitas Homestay'}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#392B21] mb-2">
                  {config.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#756A5F] leading-relaxed">
                  {config.subtitle}
                </p>
              </div>

              {/* Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {config.items.map((item, idx) => {
                  const isEven = idx % 2 === 0;
                  const iconBg = isEven ? 'bg-[#65715A]/15 text-[#65715A]' : 'bg-[#806044]/15 text-[#806044]';

                  return (
                    <div 
                      key={item.id || idx} 
                      className="p-6 rounded-2xl border border-[#E5DCD0] bg-[#FAF7F2] space-y-2 hover:border-[#806044]/40 hover:shadow-xs transition duration-200"
                    >
                      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3 shrink-0`}>
                        {renderFacilityIcon(item.icon, "w-5 h-5")}
                      </div>
                      <h3 className="font-serif font-semibold text-base text-[#392B21]">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#756A5F] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
