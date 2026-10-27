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
    <header className="w-full sticky top-0 z-50 bg-[#35251C]/95 backdrop-blur border-b border-[#2B4C38]/40 text-stone-100 shadow-md">
      {/* Top Banner: Syariah & Charity Mission from Flyer with Balanced Islamic Forest Green & Warm Brown Touch */}
      <div className="w-full bg-[#675039] border-b border-[#4A3827] text-[#F7F4ED] text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 flex-wrap leading-tight">
        <Heart className="w-3.5 h-3.5 text-emerald-400 shrink-0 fill-emerald-500/20" />
        <span>
          Penginapan Syariah: <em>&ldquo;Nikmati Kenyamanan, Raih Ibadah Jariyah&rdquo;</em> - Pilihan Sewa <strong>Harian, Bulanan & Tahunan</strong>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-20 gap-3 xl:gap-5">
          {/* Brand Logo with Pure White Solid Monochrome Image */}
          <Link href="/" className="flex items-center shrink-0 group py-1">
            <AlyatamaLogo variant="white" size="md" />
          </Link>

          {/* Desktop Navigation with Aesthetic Emerald Glow Effect on Active Page */}
          <nav className="hidden xl:flex items-center gap-3.5 2xl:gap-5 text-xs lg:text-[13px] font-medium text-stone-200">
            {navItems.map((item) => {
              const active = isItemActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1.5 px-1 flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 ${
                    active
                      ? 'text-emerald-300 font-semibold [text-shadow:0_0_12px_rgba(52,211,153,0.9),0_0_3px_rgba(16,185,129,0.9)]'
                      : 'text-stone-300 hover:text-emerald-200 hover:[text-shadow:0_0_8px_rgba(52,211,153,0.5)]'
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors ${
                        active
                          ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                          : 'text-[#D4AF37] group-hover:text-emerald-300'
                      }`}
                    />
                  )}
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons: Phone & CTA with Balanced Warm Brown & Forest Green */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <a
              href="https://wa.me/6282285472008"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-200 hover:text-white border border-[#5A4533] hover:border-emerald-500/60 rounded-xl px-3 py-2 transition-all flex items-center gap-2 whitespace-nowrap bg-[#251A14]/70 hover:bg-[#251A14] hover:[text-shadow:0_0_6px_rgba(52,211,153,0.5)]"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline font-mono font-medium tracking-tight">0822 8547 2008</span>
              <span className="lg:hidden">WhatsApp</span>
            </a>

            <Link
              href="/booking"
              className="bg-[#785437] hover:bg-[#64442A] active:bg-[#533720] text-[#F7F4ED] text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-black/20 border border-[#9A704E]/50 whitespace-nowrap"
            >
              Pesan Sekarang
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center gap-2">
            <Link
              href="/booking"
              className="md:hidden bg-[#785437] hover:bg-[#64442A] text-[#F7F4ED] text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xs"
            >
              Pesan
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-300 hover:text-emerald-300 hover:bg-stone-800/60 focus:outline-none transition-colors"
              aria-label="Buka navigasi menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer with Aesthetic Green Glow */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#241913] border-b border-[#3D2C20] px-4 pt-3 pb-6 space-y-2 shadow-2xl">
          {navItems.map((item) => {
            const active = isItemActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-sm border-b border-[#36261A] transition-all ${
                  active
                    ? 'text-emerald-300 bg-emerald-950/30 font-semibold [text-shadow:0_0_10px_rgba(52,211,153,0.8)] border-l-4 border-l-emerald-400'
                    : 'text-stone-300 hover:text-emerald-200 hover:bg-stone-900/40'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${active ? 'text-emerald-300' : 'text-[#D4AF37]'}`} />}
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3">
            <a
              href="https://wa.me/6282285472008"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2.5 rounded-xl border border-emerald-600/40 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 bg-emerald-950/20 hover:bg-emerald-950/40 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp: 0822 8547 2008</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
