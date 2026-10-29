'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Phone, Menu, X, Heart, Image as ImageIcon } from 'lucide-react';
import AlyatamaLogo from '@/components/common/AlyatamaLogo';

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'Beranda', href: '/', exact: true },
    { label: 'Pilihan Kamar', href: '/kamar' },
    { label: 'Galeri & Iklan', href: '/galeri', icon: ImageIcon },
    { label: 'Cek Ketersediaan', href: '/cek-ketersediaan', icon: Calendar },
    { label: 'Tentang & Nilai Syariah', href: '/tentang' },
    { label: 'Tata Tertib', href: '/kebijakan' },
    { label: 'Lokasi Bangkinang', href: '/kontak' },
  ];

  const isItemActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-[#36281E] border-b border-[#4D392B] text-stone-100 shadow-sm">
      {/* Top Banner: Syariah & Charity Slogan (Exact match to reference image) */}
      <div className="w-full bg-[#78593F] text-[#F6F0E7] text-[11px] sm:text-xs py-1.5 px-3 text-center font-normal flex items-center justify-center gap-2 flex-wrap leading-tight">
        <Heart className="w-3.5 h-3.5 text-[#E7D8C5] shrink-0 fill-none stroke-[1.5]" />
        <span>
          Penginapan Syariah: <em>&ldquo;Nikmati Kenyamanan, Raih Ibadah Jariyah&rdquo;</em> &bull; Pilihan Sewa <strong>Harian, Bulanan & Tahunan</strong>
        </span>
      </div>

      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 lg:px-6 w-full">
        <div className="flex items-center justify-between h-20 gap-2 lg:gap-3 xl:gap-5">
          {/* Brand Logo with Official White Monochromatic Image */}
          <Link href="/" className="flex items-center shrink-0 py-1" aria-label="Beranda ALYATAMA HOMESTAY">
            <AlyatamaLogo variant="white" size="md" />
          </Link>

          {/* Desktop Navigation: Visible directly on all laptops and desktop screens (lg:flex) */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-3.5 2xl:gap-5 text-[11px] xl:text-xs 2xl:text-[13px] font-normal text-stone-200" aria-label="Navigasi Utama">
            {navItems.map((item) => {
              const active = isItemActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-1.5 px-0.5 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    active
                      ? 'text-[#C9A84C] font-semibold border-b-2 border-[#C9A84C]'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        active ? 'text-[#C9A84C]' : 'text-[#C9A84C]'
                      }`}
                    />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons: Contact Phone Pill & CTA (Visible on lg:flex) */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            <a
              href="https://wa.me/6282285472008"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] xl:text-xs text-stone-200 hover:text-white border border-[#5E4532] hover:border-[#806044] rounded-xl px-2.5 xl:px-3 py-2 transition-colors flex items-center gap-1.5 whitespace-nowrap bg-[#2A1F17]/60"
              aria-label="Hubungi Telepon / WhatsApp Pengelola: 0822 8547 2008"
            >
              <Phone className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span className="font-mono">0822 8547 2008</span>
            </a>

            <Link
              href="/booking"
              className="bg-[#806044] hover:bg-[#6C5037] text-white text-[11px] xl:text-xs 2xl:text-sm font-semibold px-3.5 xl:px-4 py-2.5 rounded-xl transition-colors shadow-xs whitespace-nowrap border border-[#9C7757]/40"
            >
              Pesan Sekarang
            </Link>
          </div>

          {/* Mobile Only: Button shown exclusively on screens below lg (<1024px) */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/booking"
              className="bg-[#806044] hover:bg-[#6C5037] text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap"
            >
              Pesan Sekarang
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-[#4D392B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              aria-label={mobileMenuOpen ? 'Tutup navigasi menu' : 'Buka navigasi menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Only for smartphones below lg breakpoint) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#2A1F17] border-b border-[#4D392B] px-4 pt-3 pb-6 space-y-1 shadow-xl">
          {navItems.map((item) => {
            const active = isItemActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-sm transition-colors ${
                  active
                    ? 'text-[#C9A84C] bg-[#36281E] font-semibold border-l-4 border-[#C9A84C]'
                    : 'text-stone-300 hover:text-white hover:bg-[#36281E]/60'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-[#C9A84C]" />}
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3">
            <a
              href="https://wa.me/6282285472008"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2.5 rounded-xl border border-[#806044] text-[#E7D8C5] text-xs font-semibold flex items-center justify-center gap-2 bg-[#806044]/20 hover:bg-[#806044]/30 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>WhatsApp: 0822 8547 2008</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
