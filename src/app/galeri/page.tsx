'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  Layers, 
  Maximize2, 
  X, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Tag, 
  ArrowRight,
  ShieldCheck,
  Megaphone,
  Loader2
} from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import { PmsService } from '@/lib/services/pms-service';
import { AdvertisementPhoto, AdCategory } from '@/lib/types';

const CATEGORY_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'Semua Koleksi' },
  { key: 'brosur_flyer', label: 'Brosur & Flyer Resmi' },
  { key: 'kamar_fasilitas', label: 'Kamar & Fasilitas' },
  { key: 'kegiatan_dakwah', label: 'Kegiatan Dakwah & Amal' },
  { key: 'promo_khusus', label: 'Promo Khusus' },
];

export default function GaleriIklanPage() {
  const [photos, setPhotos] = useState<AdvertisementPhoto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePhoto, setActivePhoto] = useState<AdvertisementPhoto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Live server fetch
        const res = await fetch('/api/panel/photos?active=true', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.photos)) {
            setPhotos(json.photos);
            return;
          }
        }
        const data = await PmsService.getAdvertisementPhotos(true);
        setPhotos(data);
      } catch (err) {
        console.error('Gagal memuat galeri iklan:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const onSync = () => loadData();
    window.addEventListener('focus', onSync);
    window.addEventListener('storage', onSync);
    window.addEventListener('photos-updated', onSync);

    return () => {
      window.removeEventListener('focus', onSync);
      window.removeEventListener('storage', onSync);
      window.removeEventListener('photos-updated', onSync);
    };
  }, []);

  const matchesCategory = (itemCategory: string, tabKey: string) => {
    if (tabKey === 'all') return true;
    if (tabKey === 'brosur_flyer') return itemCategory === 'brosur_flyer' || itemCategory === 'flyer';
    if (tabKey === 'kamar_fasilitas') return itemCategory === 'kamar_fasilitas' || itemCategory === 'room' || itemCategory === 'facility';
    if (tabKey === 'kegiatan_dakwah') return itemCategory === 'kegiatan_dakwah' || itemCategory === 'activity';
    if (tabKey === 'promo_khusus') return itemCategory === 'promo_khusus' || itemCategory === 'promo';
    return itemCategory === tabKey;
  };

  const filteredPhotos = selectedCategory === 'all'
    ? photos
    : photos.filter((p) => matchesCategory(p.category, selectedCategory));

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'brosur_flyer':
      case 'flyer': 
        return 'Brosur & Flyer Resmi';
      case 'kamar_fasilitas':
      case 'room': 
        return 'Kamar & Interior';
      case 'facility': 
        return 'Fasilitas Properti';
      case 'kegiatan_dakwah':
      case 'activity': 
        return 'Dakwah & Amal Santri';
      case 'promo_khusus':
      case 'promo': 
        return 'Promo Khusus';
      default: 
        return cat;
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#F6F0E7]">
      <PublicNavbar />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-1.5 bg-[#806044]/15 text-[#806044] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Publikasi & Galeri Promosi Resmi</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#392B21] tracking-tight mb-4">
              Galeri Foto Iklan & Informasi Resmi
            </h1>
            <p className="text-sm sm:text-base text-[#756A5F] leading-relaxed">
              Koleksi materi promosi, brosur resmi, dokumentasi fasilitas, dan informasi kegiatan ALYATAMA HOMESTAY Bangkinang Kota. Seluruh materi ini diperbarui dan dikendalikan langsung oleh tim manajemen properti.
            </p>
          </div>

          {/* Official Management Notice Banner */}
          <div className="bg-white rounded-2xl border border-emerald-900/20 p-4 sm:p-5 mb-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#30231A]">
                  Publikasi & Brosur Resmi Properti
                </h4>
                <p className="text-xs text-[#6B5E52]">
                  Foto iklan, brosur, dan dokumentasi fasilitas di bawah ini merupakan informasi terverifikasi langsung dari pengelola ALYATAMA HOMESTAY.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <a
                href="https://wa.me/6282285472008?text=Halo%20Pengelola%20ALYATAMA%20HOMESTAY,%20saya%20ingin%20menanyakan%20informasi%20brosur%20dan%20ketersediaan%20kamar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs bg-[#24523B] hover:bg-[#1D4330] text-white px-4 py-2.5 rounded-xl font-medium transition shadow-xs border border-emerald-600/30"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-300" />
                <span>Konsultasi via WA</span>
              </a>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab.key;
              const count = tab.key === 'all' 
                ? photos.length 
                : photos.filter((p) => p.category === tab.key).length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-[#24523B] text-white shadow-sm border border-emerald-600/40'
                      : 'bg-white text-[#6B5E52] hover:bg-emerald-50 hover:text-emerald-900 border border-[#E5DCD0]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#756A5F] gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#806044]" />
              <p className="text-sm font-medium">Memuat galeri foto iklan...</p>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E5DCD0] p-12 text-center max-w-md mx-auto my-8">
              <Layers className="w-12 h-12 text-stone-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#392B21] mb-1">Belum Ada Foto untuk Kategori Ini</h3>
              <p className="text-xs text-[#756A5F] mb-6">
                Admin belum menambahkan materi iklan pada kategori terpilih. Silakan periksa kategori lainnya.
              </p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-semibold bg-[#806044] text-white px-4 py-2 rounded-xl hover:bg-[#6c5037] transition"
              >
                Tampilkan Semua Foto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPhotos.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-[#E5DCD0] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  {/* Image Container with Badges */}
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setActivePhoto(item)}>
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback image if local file fails
                        (e.target as HTMLImageElement).src = '/images/alyatama-flyer.jpg';
                      }}
                    />
                    
                    {/* Dark gradient for badge readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#392B21]/90 text-[#F6F0E7] backdrop-blur-xs border border-white/10">
                        {getCategoryLabel(item.category)}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-700/90 text-white backdrop-blur-xs shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Expand Zoom Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <span className="inline-flex items-center gap-1.5 bg-white/90 text-[#392B21] text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-xs">
                        <Maximize2 className="w-3.5 h-3.5" />
                        Perbesar Foto
                      </span>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#392B21] mb-2 leading-snug group-hover:text-[#806044] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#756A5F] line-clamp-3 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                      <a
                        href={`https://wa.me/6282285472008?text=Halo%20Admin%20ALYATAMA,%20saya%20tertarik%20dengan%20info%20iklan:%20*${encodeURIComponent(item.title)}*`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#806044] hover:text-[#392B21] font-semibold transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Tanya Admin</span>
                      </a>

                      <Link
                        href="/booking"
                        className="inline-flex items-center gap-1 text-xs bg-[#FAF7F2] hover:bg-[#806044] hover:text-white text-[#392B21] font-semibold px-3 py-1.5 rounded-lg border border-[#E5DCD0] transition"
                      >
                        <span>Pesan</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Info Banner */}
          <div className="mt-16 bg-[#392B21] text-[#E7D8C5] rounded-3xl p-8 sm:p-10 border border-[#4d3b2e] shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-2">
                <span className="text-xs text-[#C9A84C] font-semibold uppercase tracking-wider block">
                  Penginapan Syariah Bangkinang Kota
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Ingin Memesan Kamar atau Bertanya Ketersediaan?
                </h3>
                <p className="text-xs sm:text-sm text-[#d1bfab] leading-relaxed">
                  Kami melayani sewa harian (transit & wisata) dan bulanan (dinas / proyek) dengan fasilitas lengkap, bersih, dan lingkungan nyaman di pusat Bangkinang Kota.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-end">
                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center gap-2 bg-[#806044] hover:bg-[#6c5037] text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm text-center"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Formulir Reservasi Online</span>
                </Link>
                <a
                  href="https://wa.me/6282285472008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-stone-200 border border-white/20 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition text-center"
                >
                  <Phone className="w-4 h-4 text-[#C9A84C]" />
                  <span>Hubungi 0822 8547 2008</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Lightbox Popup */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setActivePhoto(null)}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col md:flex-row my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition shadow-lg"
              aria-label="Tutup foto"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo View */}
            <div className="md:w-3/5 bg-stone-900 flex items-center justify-center relative min-h-[300px] md:min-h-[480px]">
              <img
                src={activePhoto.image_url}
                alt={activePhoto.title}
                className="max-h-[75vh] w-auto max-w-full object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/alyatama-flyer.jpg';
                }}
              />
            </div>

            {/* Photo Info & Actions */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between bg-white">
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#392B21] text-white">
                    {getCategoryLabel(activePhoto.category)}
                  </span>
                  {activePhoto.badge && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-700 text-white">
                      {activePhoto.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#392B21] leading-tight">
                  {activePhoto.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#756A5F] leading-relaxed whitespace-pre-line">
                  {activePhoto.description}
                </p>

                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DCD0] text-[11px] text-[#756A5F] space-y-1">
                  <div className="font-semibold text-[#392B21] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Materi Publikasi Resmi Homestay</span>
                  </div>
                  <p>Dikelola langsung oleh manajemen ALYATAMA HOMESTAY Bangkinang Kota.</p>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-6 border-t border-stone-100 space-y-2 mt-6">
                <a
                  href={`https://wa.me/6282285472008?text=Halo%20Admin%20ALYATAMA,%20saya%20tertarik%20dengan%20info%20iklan:%20*${encodeURIComponent(activePhoto.title)}*`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#806044] hover:bg-[#6c5037] text-white text-xs font-semibold py-3 rounded-xl transition shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Tanya Info Ini via WhatsApp</span>
                </a>

                <Link
                  href="/booking"
                  onClick={() => setActivePhoto(null)}
                  className="w-full flex items-center justify-center gap-2 bg-[#FAF7F2] hover:bg-stone-200 text-[#392B21] text-xs font-semibold py-2.5 rounded-xl border border-[#E5DCD0] transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#806044]" />
                  <span>Pesan Kamar Sekarang</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}
