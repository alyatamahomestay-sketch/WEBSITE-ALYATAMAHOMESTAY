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
    { label: 'Tentang & Syariah', href: '/tentang' },
    { label: 'Tata Tertib', href: '/kebijakan' },
    { label: 'Lokasi', href: '/kontak' },
  ];

  const isItemActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-[#392B21] border-b border-[#4D3B2E] text-stone-100 shadow-sm">
      {/* Top Banner: Syariah & Charity Slogan */}
      <div className="w-full bg-[#806044] text-[#F6F0E7] text-[11px] sm:text-xs py-1.5 px-4 text-center font-normal flex items-center justify-center gap-2 flex-wrap leading-tight">
        <Heart className="w-3.5 h-3.5 text-[#C9A84C] shrink-0 fill-current opacity-80" />
        <span>
          Penginapan Syariah: <em>&ldquo;Nikmati Kenyamanan, Raih Ibadah Jariyah&rdquo;</em> &bull; Pilihan Sewa <strong>Harian, Bulanan & Tahunan</strong>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-20 gap-3 xl:gap-6">
          {/* Brand Logo: Clean Official Monochromatic Asset */}
          <Link href="/" className="flex items-center shrink-0 py-1" aria-label="Beranda ALYATAMA HOMESTAY">
            <AlyatamaLogo variant="white" size="md" />
          </Link>

          {/* Desktop Navigation: Calm & Clean Typography (No artificial text-shadow glow) */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 text-xs lg:text-[13px] font-normal text-stone-300" aria-label="Navigasi Utama">
            {navItems.map((item) => {
              const active = isItemActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1.5 px-0.5 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    active
                      ? 'text-[#C9A84C] font-semibold'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors ${
                        active ? 'text-[#C9A84C]' : 'text-stone-400'
                      }`}
                    />
                  )}
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A84C] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons: Phone & Clean Reservation CTA */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <a
              href="https://wa.me/6282285472008"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-300 hover:text-white border border-[#4D3B2E] hover:border-[#806044] rounded-xl px-3 py-2 transition-colors flex items-center gap-1.5 whitespace-nowrap bg-[#2A1F17]"
              aria-label="Hubungi WhatsApp Pengelola di 0822 8547 2008"
            >
              <Phone className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span className="hidden lg:inline font-mono">0822 8547 2008</span>
              <span className="lg:hidden">WhatsApp</span>
            </a>

            <Link
              href="/booking"
              className="bg-[#806044] hover:bg-[#684D36] text-[#F6F0E7] text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs whitespace-nowrap border border-[#9C7757]/40"
            >
              Pesan Sekarang
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center gap-2">
            <Link
              href="/booking"
              className="md:hidden bg-[#806044] hover:bg-[#684D36] text-[#F6F0E7] text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xs"
            >
              Pesan
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-[#4D3B2E]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              aria-label={mobileMenuOpen ? 'Tutup navigasi menu' : 'Buka navigasi menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#2A1F17] border-b border-[#4D3B2E] px-4 pt-3 pb-6 space-y-1 shadow-lg">
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
                    ? 'text-[#C9A84C] bg-[#392B21] font-semibold border-l-4 border-[#C9A84C]'
                    : 'text-stone-300 hover:text-white hover:bg-[#392B21]/60'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${active ? 'text-[#C9A84C]' : 'text-stone-400'}`} />}
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3">
            <a
              href="https://wa.me/6282285472008"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2.5 rounded-xl border border-[#806044] text-[#E7D8C5] text-xs font-semibold flex items-center justify-center gap-2 bg-[#806044]/15 hover:bg-[#806044]/25 transition-colors"
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
