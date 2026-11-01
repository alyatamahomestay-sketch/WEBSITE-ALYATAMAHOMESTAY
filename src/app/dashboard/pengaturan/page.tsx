'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { PropertySettings } from '@/lib/types';
import { showAdminToast } from '@/components/common/AdminToast';

export default function PengaturanPropertiPage() {
  const [property, setProperty] = useState<PropertySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [checkinTime, setCheckinTime] = useState('14:00');
  const [checkoutTime, setCheckoutTime] = useState('12:00');
  const [bookingPolicy, setBookingPolicy] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [pendingExpirationHours, setPendingExpirationHours] = useState(24);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await PmsService.getPropertySettings();
        setProperty(data);
        setName(data.name || 'ALYATAMA HOMESTAY');
        setTagline(data.tagline || 'Nikmati Kenyamanan, Raih Ibadah Jariyah');
        setDescription(data.description || '');
        setAddress(data.address || 'Jl. Mayor Ali Rasyid No 19 Bangkinang Kota, Panti Asuhan Putra Muhammadiyah');
        setCity(data.city || 'Bangkinang Kota, Kabupaten Kampar');
        setProvince(data.province || 'Riau');
        setPostalCode(data.postal_code || '28411');
        setPhone(data.phone || '0822-8547-2008');
        setWhatsappNumber(data.whatsapp_number || '6282285472008');
        setEmail(data.email || 'kontak@alyatamahomestay.com');
        setCheckinTime(data.checkin_time || '14:00');
        setCheckoutTime(data.checkout_time || '12:00');
        setBookingPolicy(data.booking_policy || '');
        setCancellationPolicy(data.cancellation_policy || '');
        setPendingExpirationHours(data.pending_expiration_hours || 24);
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
        tagline,
        description,
        address,
        city,
        province,
        postal_code: postalCode,
        phone,
        whatsapp_number: whatsappNumber,
        email,
        checkin_time: checkinTime,
        checkout_time: checkoutTime,
        booking_policy: bookingPolicy,
        cancellation_policy: cancellationPolicy,
        pending_expiration_hours: Number(pendingExpirationHours),
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('property-updated'));
      }
      showAdminToast('edit', 'Pengaturan profil homestay berhasil disimpan.');
      setFeedback('Pengaturan profil homestay berhasil disimpan.');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pengaturan.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
          Pengaturan Bisnis & Identitas Homestay
        </h2>
        <p className="text-xs text-stone-500">
          Informasi ini ditampilkan pada website publik, slip invoice tamu, dan dokumen operasional.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="font-bold">&times;</button>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6 text-xs">
        {/* Identitas Properti */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-100">
            1. Identitas Homestay
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nama Homestay</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Slogan / Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Deskripsi Ringkas</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-stone-300 p-2.5 text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Alamat & Kontak */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-100">
            2. Alamat & Kontak Terverifikasi
          </h3>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Alamat Fisik</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-stone-300 p-2.5 text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Kota / Kabupaten</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Provinsi</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Kode Pos</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">No. Telepon</label>
              <input
                type="text"
                placeholder="Contoh: +62 812-7890-1234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">No. WhatsApp Resmi</label>
              <input
                type="text"
                placeholder="Contoh: 6281278901234"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Resmi</label>
              <input
                type="email"
                placeholder="kontak@alyatamahomestay.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Waktu & Kebijakan */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-100">
            3. Jam Operasional & Batas Kedaluwarsa
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Jam Check-in</label>
              <input
                type="text"
                value={checkinTime}
                onChange={(e) => setCheckinTime(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Jam Check-out</label>
              <input
                type="text"
                value={checkoutTime}
                onChange={(e) => setCheckoutTime(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Masa Berlaku Tagihan (Jam)</label>
              <input
                type="number"
                min="1"
                value={pendingExpirationHours}
                onChange={(e) => setPendingExpirationHours(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs px-6 py-2.5 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
