'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';
import AlyatamaLogo from '@/components/common/AlyatamaLogo';

export default function PublicFooter() {
  const [property, setProperty] = useState<{
    name: string;
    mission_quote: string;
    description: string;
    address: string;
    landmark: string;
    phone: string;
    whatsapp_number: string;
    checkin_time: string;
    checkout_time: string;
    google_maps_url: string;
  }>({
    name: 'ALYATAMA HOMESTAY',
    mission_quote: 'Investasi terbaik adalah saat manfaatnya terus mengalir, bahkan setelah kita tiada.',
    description: 'Penginapan Syariah terpercaya di Bangkinang Kota, Kampar, Riau. Melayani sewa harian dan bulanan dengan suasana bersih, tenang, aman, dan penuh keberkahan ibadah jariyah.',
    address: 'Jl. Mayor Ali Rasyid No 19 Bangkinang Kota, Panti Asuhan Putra Muhammadiyah, Belakang SPBU Bangkinang Kota, Samping RS Norpa Husada, Kabupaten Kampar, Riau 28411.',
    landmark: 'Belakang SPBU Bangkinang Kota, tepat di samping RS Norpa Husada.',
    phone: '0822-8547-2008',
    whatsapp_number: '6282285472008',
    checkin_time: '14:00',
    checkout_time: '12:00',
    google_maps_url: 'https://maps.google.com/?q=Jl.+Mayor+Ali+Rasyid+No+19+Bangkinang+Kota+Kampar+Riau',
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch('/api/panel/properties', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.property) {
            setProperty({
              name: json.property.name || 'ALYATAMA HOMESTAY',
              mission_quote: json.property.mission_quote || 'Investasi terbaik adalah saat manfaatnya terus mengalir, bahkan setelah kita tiada.',
              description: json.property.description || 'Penginapan Syariah terpercaya di Bangkinang Kota, Kampar, Riau. Melayani sewa harian dan bulanan dengan suasana bersih, tenang, aman, dan penuh keberkahan ibadah jariyah.',
              address: json.property.address || 'Jl. Mayor Ali Rasyid No 19 Bangkinang Kota, Panti Asuhan Putra Muhammadiyah, Belakang SPBU Bangkinang Kota, Samping RS Norpa Husada, Kabupaten Kampar, Riau 28411.',
              landmark: json.property.landmark || 'Belakang SPBU Bangkinang Kota, tepat di samping RS Norpa Husada.',
              phone: json.property.phone || '0822-8547-2008',
              whatsapp_number: json.property.whatsapp_number || '6282285472008',
              checkin_time: json.property.checkin_time || '14:00',
              checkout_time: json.property.checkout_time || '12:00',
              google_maps_url: json.property.google_maps_url || 'https://maps.google.com/?q=Jl.+Mayor+Ali+Rasyid+No+19+Bangkinang+Kota+Kampar+Riau',
            });
          }
        }
      } catch (e) {}
    };

    fetchProperty();

    const onSync = () => fetchProperty();
    window.addEventListener('focus', onSync);
    window.addEventListener('storage', onSync);
    window.addEventListener('property-updated', onSync);

    return () => {
      window.removeEventListener('focus', onSync);
      window.removeEventListener('storage', onSync);
      window.removeEventListener('property-updated', onSync);
    };
  }, []);

  const cleanWa = (property.whatsapp_number || '6282285472008').replace(/[^0-9]/g, '');
  const displayPhone = property.phone || '0822 8547 2008';

  return (
    <footer className="w-full bg-[#392B21] border-t border-[#4d3b2e] text-[#E7D8C5] overflow-hidden">
      {/* Islamic Mission & Charity Banner */}
      <div className="w-full bg-[#2e231b] border-b border-[#4d3b2e] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs w-full">
          <div className="flex items-center gap-2 text-[#C9A84C]">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="font-medium tracking-wide">
              &ldquo;{property.mission_quote}&rdquo;
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-300">
            <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Mendukung Dakwah & Pendidikan Islam — Panti Asuhan Putra Muhammadiyah Bangkinang</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Summary */}
          <div className="md:col-span-1 space-y-4">
            <div className="space-y-2">
              <AlyatamaLogo variant="white" size="lg" />
              <span className="text-[10px] tracking-widest uppercase text-[#C9A84C] font-semibold block">
                Penginapan Syariah Bangkinang Kota
              </span>
            </div>
            <p className="text-xs text-[#d1bfab] leading-relaxed">
              {property.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#C9A84C]">
              <Clock className="w-3.5 h-3.5" />
              <span>Check-in {property.checkin_time} WIB | Check-out {property.checkout_time} WIB</span>
            </div>
            <div className="pt-1">
              <a
                href={`https://wa.me/${cleanWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs bg-[#806044] hover:bg-[#6c5037] text-white px-3 py-2 rounded-lg font-medium transition shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp: {displayPhone}</span>
              </a>
            </div>
          </div>

          {/* Model Sewa & Layanan */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#F6F0E7]">
              Pilihan Masa Sewa
            </h4>
            <ul className="space-y-2 text-xs text-[#d1bfab]">
              <li>
                <Link href="/kamar?rental=daily" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Sewa Harian (Transit & Wisata)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4d3b2e] text-[#C9A84C]">Harian</span>
                </Link>
              </li>
              <li>
                <Link href="/kamar?rental=monthly" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Sewa Bulanan (Dinas / Proyek)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4d3b2e] text-[#C9A84C]">Bulanan</span>
                </Link>
              </li>
              <li className="pt-2 border-t border-[#4d3b2e]">
                <Link href="/cek-ketersediaan" className="hover:text-white transition-colors">
                  Cek Ketersediaan Kamar
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-white transition-colors">
                  Formulir Reservasi Online
                </Link>
              </li>
              <li>
                <Link href="/status-reservasi" className="hover:text-white transition-colors">
                  Lacak Permintaan Reservasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Kebijakan Syariah & Privasi */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#F6F0E7]">
              Kebijakan Properti
            </h4>
            <ul className="space-y-2 text-xs text-[#d1bfab]">
              <li>
                <Link href="/kebijakan" className="hover:text-white transition-colors">
                  Prinsip & Tata Tertib Syariah
                </Link>
              </li>
              <li>
                <Link href="/kebijakan#pasangan" className="hover:text-white transition-colors">
                  Ketentuan Pasangan Suami Istri
                </Link>
              </li>
              <li>
                <Link href="/kebijakan#pembatalan" className="hover:text-white transition-colors">
                  Kebijakan Pembatalan & Deposit
                </Link>
              </li>
              <li>
                <Link href="/privasi" className="hover:text-white transition-colors">
                  Kebijakan Privasi Tamu
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="hover:text-white transition-colors">
                  Galeri & Iklan Homestay
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-white transition-colors">
                  Kontak & Bantuan Tamu
                </Link>
              </li>
            </ul>
          </div>

          {/* Lokasi Terverifikasi */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#F6F0E7] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C9A84C]" />
              Lokasi Bangkinang Kota
            </h4>
            <p className="text-xs text-[#d1bfab] leading-relaxed">
              {property.address}
            </p>
            <a
              href={property.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#C9A84C] hover:text-[#e4cf8d] font-medium underline underline-offset-4"
            >
              Buka Google Maps &rarr;
            </a>
            <div className="pt-2 text-[11px] text-stone-300 bg-[#2e231b] p-2.5 rounded-lg border border-[#4d3b2e]">
              <span className="font-semibold text-white block mb-0.5">Patokan Lokasi:</span>
              {property.landmark}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#4d3b2e] flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} ALYATAMA HOMESTAY — Penginapan Syariah Bangkinang Kota. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-stone-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Sistem Reservasi Terverifikasi & Bersertifikat Syariah
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
