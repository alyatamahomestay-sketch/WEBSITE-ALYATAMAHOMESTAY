'use client';

import React, { useState, useEffect } from 'react';
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
  Clock,
  MapPin,
  Heart
} from 'lucide-react';

export interface FacilityItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface FacilitiesConfig {
  badge: string;
  title: string;
  subtitle: string;
  items: FacilityItem[];
}

export const DEFAULT_FACILITIES_CONFIG: FacilitiesConfig = {
  badge: 'FASILITAS HOMESTAY',
  title: 'Fasilitas Nyaman Berstandar Syariah',
  subtitle: 'Dirancang untuk mendukung istirahat yang berkualitas dan menjaga kenyamanan ibadah selama menginap.',
  items: [
    {
      id: 'fac-1',
      icon: 'Sparkles',
      title: '1. Lingkungan Islami & Nyaman',
      description: 'Suasana tenang dan tertib, bebas dari kebisingan serta aktivitas yang bertentangan dengan norma kesusilaan.'
    },
    {
      id: 'fac-2',
      icon: 'Lock',
      title: '2. Aman & Privasi Terjaga',
      description: 'Akses teratur yang menjamin privasi keluarga maupun tamu perorangan sesuai adab menginap yang santun.'
    },
    {
      id: 'fac-3',
      icon: 'BedDouble',
      title: '3. Kamar Bersih & Nyaman',
      description: 'Kasur empuk, sprei higienis yang rutin disterilisasi, kamar mandi dalam bersih, serta sirkulasi udara baik.'
    },
    {
      id: 'fac-4',
      icon: 'Wifi',
      title: '4. Wi-Fi Gratis di Setiap Area',
      description: 'Koneksi internet nirkabel stabil untuk bekerja daring, koordinasi tugas kantor, maupun komunikasi keluarga.'
    },
    {
      id: 'fac-5',
      icon: 'Wind',
      title: '5. AC di Setiap Kamar',
      description: 'Setiap unit kamar dilengkapi pendingin udara (AC) yang terawat untuk kenyamanan istirahat maksimal.'
    },
    {
      id: 'fac-6',
      icon: 'Shield',
      title: '6. Keamanan Lingkungan 24 Jam',
      description: 'Pengawasan lingkungan homestay terpadu dengan area parkir kendaraan yang aman bagi mobil dan motor tamu.'
    }
  ]
};

export const renderFacilityIcon = (iconName: string, className = "w-5 h-5") => {
  switch (iconName) {
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Lock':
      return <Lock className={className} />;
    case 'BedDouble':
      return <BedDouble className={className} />;
    case 'Wifi':
      return <Wifi className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'Shield':
      return <Shield className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'Coffee':
      return <Coffee className={className} />;
    case 'Tv':
      return <Tv className={className} />;
    case 'Droplet':
      return <Droplet className={className} />;
    case 'Clock':
      return <Clock className={className} />;
    case 'MapPin':
      return <MapPin className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    default:
      return <CheckCircle2 className={className} />;
  }
};

export default function FacilitiesSection() {
  const [config, setConfig] = useState<FacilitiesConfig>(DEFAULT_FACILITIES_CONFIG);

  useEffect(() => {
    const readConfig = () => {
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
    };

    readConfig();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'alyatama_facilities_section_config') {
        readConfig();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <section className="w-full py-16 sm:py-20 bg-white border-y border-[#E5DCD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header Seksi */}
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

        {/* Grid Card Fasilitas */}
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
    </section>
  );
}
