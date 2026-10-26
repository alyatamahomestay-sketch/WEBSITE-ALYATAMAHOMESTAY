'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Palette, 
  Save, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Clock, 
  BedDouble, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Megaphone, 
  Plus, 
  Edit,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { PropertySettings, Room } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';

export default function SetupTampilanWebsitePage() {
  const [property, setProperty] = useState<PropertySettings | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Form Fields for Appearance & Public Info
  const [announcementBanner, setAnnouncementBanner] = useState('');
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [tagline, setTagline] = useState('');
  const [secondaryTagline, setSecondaryTagline] = useState('');
  const [missionQuote, setMissionQuote] = useState('');
  const [description, setDescription] = useState('');
  
  // Contacts & Location
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Policies & Times
  const [checkinTime, setCheckinTime] = useState('14:00');
  const [checkoutTime, setCheckoutTime] = useState('12:00');
  const [syariahPolicy, setSyariahPolicy] = useState('');
  const [bookingPolicy, setBookingPolicy] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [propData, roomData] = await Promise.all([
          PmsService.getPropertySettings(),
          PmsService.getRooms(true),
        ]);
        setProperty(propData);
        setRooms(roomData);

        // Populate form
        setAnnouncementBanner(propData.announcement_banner || 'Penginapan Syariah: “Nikmati Kenyamanan, Raih Ibadah Jariyah” • Pilihan Sewa Harian, Bulanan & Tahunan');
        setIsAnnouncementActive(propData.is_announcement_active ?? true);
        setName(propData.name || 'ALYATAMA HOMESTAY');
        setCategory(propData.category || 'Penginapan Syariah');
        setTagline(propData.tagline || 'Nikmati Kenyamanan, Raih Ibadah Jariyah');
        setSecondaryTagline(propData.secondary_tagline || 'Bersih, Nyaman dan Berkah');
        setMissionQuote(propData.mission_quote || 'Investasi terbaik adalah saat manfaatnya terus mengalir, bahkan setelah kita tiada.');
        setDescription(propData.description || '');

        setWhatsappNumber(propData.whatsapp_number || '6282285472008');
        setPhone(propData.phone || '0822-8547-2008');
        setEmail(propData.email || 'kontak@alyatamahomestay.com');
        setAddress(propData.address || 'Jl. Mayor Ali Rasyid No 19 Bangkinang Kota, Panti Asuhan Putra Muhammadiyah');
        setLandmark(propData.landmark || 'Di Belakang SPBU Bangkinang Kota, Samping Rumah Sakit Norpa Husada');
        setGoogleMapsUrl(propData.google_maps_url || 'https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7');

        setCheckinTime(propData.checkin_time || '14:00');
        setCheckoutTime(propData.checkout_time || '12:00');
        setSyariahPolicy(propData.syariah_policy || '');
        setBookingPolicy(propData.booking_policy || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await PmsService.updatePropertySettings({
        name,
        category,
        tagline,
        secondary_tagline: secondaryTagline,
        mission_quote: missionQuote,
        description,
        announcement_banner: announcementBanner,
        is_announcement_active: isAnnouncementActive,
        whatsapp_number: whatsappNumber,
        phone,
        email,
        address,
        landmark,
        google_maps_url: googleMapsUrl,
        checkin_time: checkinTime,
        checkout_time: checkoutTime,
        syariah_policy: syariahPolicy,
        booking_policy: bookingPolicy,
      });

      setFeedback('Pengaturan tampilan website berhasil diperbarui secara langsung!');
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      alert(`Gagal menyimpan pengaturan: ${err?.message || err}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#806044]/10 text-[#806044] px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>Setup Tampilan Website Langsung</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Pengendalian Tampilan Website Publik
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Admin memiliki kontrol penuh atas teks identitas, banner pengumuman atas, informasi kontak, jam operasional, kebijakan syariah, serta konfigurasi kamar yang dilihat oleh calon pengunjung homestay.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-[#806044] hover:text-[#392B21] bg-stone-100 hover:bg-stone-200 px-3.5 py-2.5 rounded-xl font-medium transition"
          >
            <span>Buka Website Pengunjung</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="font-bold text-emerald-900">&times;</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Pengumuman Atas (Top Announcement Bar) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#806044]" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                1. Banner Pengumuman Atas (Top Bar Website)
              </h2>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnnouncementActive}
                onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                className="rounded border-stone-300 text-[#806044] focus:ring-[#806044] w-4 h-4"
              />
              <span>Aktifkan Banner Pengumuman</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Teks Pengumuman Berjalan / Highlight
            </label>
            <input
              type="text"
              value={announcementBanner}
              onChange={(e) => setAnnouncementBanner(e.target.value)}
              placeholder="Contoh: Penginapan Syariah: “Nikmati Kenyamanan, Raih Ibadah Jariyah” • Pilihan Sewa Harian, Bulanan & Tahunan"
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Teks ini muncul di bagian paling atas seluruh halaman website pengunjung publik.
            </p>
          </div>
        </div>

        {/* 2. Identitas & Slogan Branding */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Sparkles className="w-4 h-4 text-[#806044]" />
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              2. Identitas Brand, Slogan & Misi Dakwah
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Brand / Homestay</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori Homestay</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Slogan Utama (Tagline)</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Nikmati Kenyamanan, Raih Ibadah Jariyah"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Slogan Pendukung</label>
              <input
                type="text"
                value={secondaryTagline}
                onChange={(e) => setSecondaryTagline(e.target.value)}
                placeholder="Bersih, Nyaman dan Berkah"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Kutipan Filosofi Amal / Misi Dakwah</label>
            <input
              type="text"
              value={missionQuote}
              onChange={(e) => setMissionQuote(e.target.value)}
              placeholder="Investasi terbaik adalah saat manfaatnya terus mengalir, bahkan setelah kita tiada."
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Deskripsi Lengkap Homestay</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
            />
          </div>
        </div>

        {/* 3. Kontak & Lokasi Resmi Bangkinang */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Phone className="w-4 h-4 text-[#806044]" />
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              3. Kontak Resmi & Lokasi Bangkinang Kota
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">WhatsApp Resmi (Format 62xxx)</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Nomor Telepon Properti</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email Resmi</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Alamat Fisik Properti</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Patokan Lokasi Utama</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Link Google Maps Terverifikasi</label>
            <input
              type="text"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
            />
          </div>
        </div>

        {/* 4. Jam Operasional & Kebijakan Syariah */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Clock className="w-4 h-4 text-[#806044]" />
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              4. Waktu Check-in, Check-out & Ketentuan Syariah
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Waktu Check-in Standar</label>
              <input
                type="text"
                value={checkinTime}
                onChange={(e) => setCheckinTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Waktu Check-out Standar</label>
              <input
                type="text"
                value={checkoutTime}
                onChange={(e) => setCheckoutTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Prinsip & Tata Tertib Syariah (Khusus Pasangan & Suasana)
            </label>
            <textarea
              rows={2}
              value={syariahPolicy}
              onChange={(e) => setSyariahPolicy(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
            />
          </div>
        </div>

        {/* 5. Daftar Kamar, Jenis & Fasilitas Terhubung */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
            <div className="flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-[#806044]" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                5. Manajemen Kamar, Jenis Kamar & Fasilitas Aktif
              </h2>
            </div>
            <Link
              href="/dashboard/kamar"
              className="inline-flex items-center gap-1.5 text-xs text-[#806044] hover:text-[#392B21] font-semibold"
            >
              <span>Buka Menu Kelola Kamar Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs text-stone-500">
            Berikut adalah unit kamar yang sedang aktif di website pengunjung. Anda dapat mengubah nama, jenis/tipe kamar, fasilitas, dan tarif sewa langsung melalui modul kamar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="border border-stone-200 rounded-xl p-4 bg-stone-50 hover:bg-white hover:border-[#806044]/40 transition space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#392B21] text-white">
                        Kamar {room.room_number}
                      </span>
                      <span className="text-[11px] font-semibold text-[#806044] bg-[#806044]/10 px-2 py-0.5 rounded">
                        {room.room_type}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-stone-900 mt-1">{room.name}</h4>
                  </div>
                  <Link
                    href={`/dashboard/kamar`}
                    className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition"
                    title="Edit Kamar Ini"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>

                <div className="text-xs text-stone-600">
                  <span className="font-semibold text-stone-700">Fasilitas: </span>
                  <span>{room.amenities.join(', ')}</span>
                </div>

                <div className="text-[11px] text-stone-700 bg-white p-2 rounded-lg border border-stone-200 grid grid-cols-3 gap-2">
                  <div>
                    <span className="block text-stone-400 text-[10px]">Harian:</span>
                    <strong className="text-[#806044]">{formatRupiah(room.base_rate)}</strong>
                  </div>
                  <div>
                    <span className="block text-stone-400 text-[10px]">Bulanan:</span>
                    <strong className="text-stone-800">{room.monthly_rate ? formatRupiah(room.monthly_rate) : '-'}</strong>
                  </div>
                  <div>
                    <span className="block text-stone-400 text-[10px]">Tahunan:</span>
                    <strong className="text-stone-800">{room.yearly_rate ? formatRupiah(room.yearly_rate) : '-'}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard/kamar"
              className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kamar / Tipe Baru</span>
            </Link>
          </div>
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-4 bg-[#392B21] text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
          <div className="text-xs text-stone-300 hidden sm:block">
            Perubahan yang disimpan akan langsung tampak pada seluruh website pengunjung secara real-time.
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#806044] hover:bg-[#6c5037] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm ml-auto"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Tampilan Website</span>
          </button>
        </div>
      </form>
    </div>
  );
}
