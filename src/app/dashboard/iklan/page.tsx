'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { AdvertisementPhoto, AdCategory } from '@/lib/types';
import ImageUploadPicker from '@/components/common/ImageUploadPicker';

const CATEGORIES: { value: AdCategory; label: string }[] = [
  { value: 'brosur_flyer', label: 'Brosur & Flyer Resmi' },
  { value: 'kamar_fasilitas', label: 'Kamar & Fasilitas' },
  { value: 'kegiatan_dakwah', label: 'Kegiatan Dakwah & Amal' },
  { value: 'promo_khusus', label: 'Promo Khusus' },
];

const PRESET_IMAGES = [
  { label: 'Brosur Resmi (Flyer Asli)', url: '/images/alyatama-flyer.jpg' },
  { label: 'Logo Putih Resmi', url: '/images/alyatama-logo-white.png' },
  { label: 'Logo Cokelat Resmi', url: '/images/alyatama-logo-dark.png' },
  { label: 'Foto Kamar Deluxe', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Foto Kamar Standar', url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Foto Kamar Keluarga', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80' },
];

export default function AdminIklanPage() {
  const [photos, setPhotos] = useState<AdvertisementPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<AdCategory | 'all'>('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AdCategory>('brosur_flyer');
  const [imageUrl, setImageUrl] = useState('/images/alyatama-flyer.jpg');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      // Pass false to get both active and inactive photos for admin management
      const data = await PmsService.getAdvertisementPhotos(false);
      setPhotos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('brosur_flyer');
    setImageUrl('/images/alyatama-flyer.jpg');
    setDescription('');
    setBadge('');
    setIsActive(true);
    setDisplayOrder(photos.length + 1);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (item: AdvertisementPhoto) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setImageUrl(item.image_url);
    setDescription(item.description || '');
    setBadge(item.badge || '');
    setIsActive(item.is_active);
    setDisplayOrder(item.display_order);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim() || !description.trim()) {
      alert('Mohon lengkapi Judul, URL Gambar, dan Deskripsi.');
      return;
    }

    try {
      if (editingId) {
        await PmsService.updateAdvertisementPhoto(editingId, {
          title,
          category,
          image_url: imageUrl,
          description,
          badge: badge.trim() || undefined,
          is_active: isActive,
          display_order: Number(displayOrder),
        });
        setFeedback('Foto iklan berhasil diperbarui!');
      } else {
        await PmsService.createAdvertisementPhoto({
          title,
          category,
          image_url: imageUrl,
          description,
          badge: badge.trim() || undefined,
          is_active: isActive,
          display_order: Number(displayOrder),
        });
        setFeedback('Foto iklan baru berhasil ditambahkan dan siap tayang!');
      }

      setShowModal(false);
      resetForm();
      await loadPhotos();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      alert(`Gagal menyimpan foto iklan: ${err?.message || err}`);
    }
  };

  const handleToggleActive = async (item: AdvertisementPhoto) => {
    try {
      await PmsService.updateAdvertisementPhoto(item.id, {
        is_active: !item.is_active,
      });
      await loadPhotos();
      setFeedback(`Status foto "${item.title}" diubah menjadi ${!item.is_active ? 'Aktif (Tayang)' : 'Nonaktif (Disembunyikan)'}.`);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err?.message || err}`);
    }
  };

  const handleDelete = async (item: AdvertisementPhoto) => {
    if (!confirm(`Hapus foto iklan "${item.title}" dari sistem? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      await PmsService.deleteAdvertisementPhoto(item.id);
      await loadPhotos();
      setFeedback('Foto iklan telah berhasil dihapus.');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err: any) {
      alert(`Gagal menghapus foto iklan: ${err?.message || err}`);
    }
  };

  const filteredPhotos = selectedFilter === 'all'
    ? photos
    : photos.filter((p) => p.category === selectedFilter);

  const getCategoryLabel = (cat: AdCategory) => {
    const found = CATEGORIES.find((c) => c.value === cat);
    return found ? found.label : cat;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#806044]/10 text-[#806044] px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Kontrol Eksklusif Admin & Manajemen</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Manajemen Foto Iklan & Galeri Publik
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Kelola foto brosur, flyer resmi, dokumentasi kamar, fasilitas, dan kegiatan dakwah yang ditampilkan pada halaman website publik <code>/galeri</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/galeri"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-[#806044] hover:text-[#392B21] bg-stone-100 hover:bg-stone-200 px-3.5 py-2.5 rounded-xl font-medium transition"
          >
            <span>Pratinjau Publik</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-[#806044] hover:bg-[#6c5037] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Foto Iklan</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
            selectedFilter === 'all'
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Semua ({photos.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = photos.filter((p) => p.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedFilter(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedFilter === cat.value
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] px-1 py-0.2 rounded-full bg-stone-100 text-stone-700">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Photos Grid & Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs text-stone-500">
          Memuat daftar foto iklan...
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto">
          <ImageIcon className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800 mb-1">Belum Ada Foto Iklan</h3>
          <p className="text-xs text-stone-500 mb-4">
            Tambahkan brosur resmi atau foto fasilitas untuk ditampilkan pada halaman publik website.
          </p>
          <button
            onClick={handleOpenAdd}
            className="text-xs font-semibold bg-[#806044] text-white px-4 py-2 rounded-xl hover:bg-[#6c5037] transition"
          >
            Tambah Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all flex flex-col justify-between ${
                item.is_active ? 'border-stone-200 shadow-xs' : 'border-stone-300 opacity-75 bg-stone-50'
              }`}
            >
              <div>
                {/* Image Preview with Status */}
                <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/alyatama-flyer.jpg';
                    }}
                  />
                  
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900/80 text-white backdrop-blur-xs">
                      {getCategoryLabel(item.category)}
                    </span>
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs transition ${
                        item.is_active 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-stone-600 text-stone-200'
                      }`}
                      title="Klik untuk mengubah status tayang"
                    >
                      {item.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{item.is_active ? 'Tayang Publik' : 'Disembunyikan'}</span>
                    </button>
                  </div>

                  {item.badge && (
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-600 text-white shadow-xs">
                        {item.badge}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/60 text-white">
                      Urutan: #{item.display_order}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-stone-900 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-[10px] text-stone-400 truncate">
                    Sumber: {item.image_url}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleActive(item)}
                  className="text-xs text-stone-600 hover:text-stone-900 font-medium inline-flex items-center gap-1"
                >
                  {item.is_active ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                      <span>Sembunyikan</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tayangkan</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition"
                    title="Edit Foto Iklan"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                    title="Hapus Foto Iklan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h2 className="text-lg font-bold text-stone-900">
                {editingId ? 'Edit Materi Iklan / Galeri' : 'Tambah Foto Iklan / Brosur Baru'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Judul Iklan / Dokumentasi *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Brosur Resmi Homestay ALYATAMA 2026"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
                />
              </div>

              {/* Category & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Kategori Tayang *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AdCategory)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Urutan Tampilan (Angka)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
                  />
                </div>
              </div>

              {/* Badge Promo */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Badge Promosi (Opsional)
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Misal: Resmi Terverifikasi, Sewa Bulanan Hemat, Amal Jariyah"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
                />
              </div>

              {/* Image Upload with Direct File Explorer Picker */}
              <div className="space-y-2">
                <ImageUploadPicker
                  label="Berkas Foto Iklan / Galeri"
                  value={imageUrl}
                  onChange={setImageUrl}
                  folder="advertisements"
                  required
                  helperText="Pilih foto flyer, brosur, atau dokumentasi kegiatan dari File Explorer Anda"
                />

                {/* Preset quick suggestions */}
                <div className="pt-1">
                  <span className="text-[11px] text-stone-500 font-medium block mb-1">Atau Gunakan Aset Bawaan Resmi:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 transition cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Deskripsi / Keterangan Iklan *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan rincian brosur, keunggulan homestay, atau ketentuan penawaran..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-stone-300 text-[#806044] focus:ring-[#806044] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  Tayangkan langsung pada halaman website publik (/galeri)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#806044] hover:bg-[#6c5037] text-white transition shadow-xs"
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambahkan Iklan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
