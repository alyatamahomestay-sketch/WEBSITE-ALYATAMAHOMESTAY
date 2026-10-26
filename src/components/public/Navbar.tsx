'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Phone, Menu, X, Heart, Image as ImageIcon } from 'lucide-react';
import AlyatamaLogo from '@/components/common/AlyatamaLogo';

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#392B21]/95 backdrop-blur border-b border-[#806044]/30 text-stone-100 shadow-sm">
      {/* Top Banner: Syariah & Charity Mission from Flyer */}
      <div className="bg-[#806044] text-[#F6F0E7] text-[11px] py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 flex-wrap leading-tight">
        <Heart className="w-3.5 h-3.5 text-[#E7D8C5] shrink-0" />
        <span>Penginapan Syariah: <em>&ldquo;Nikmati Kenyamanan, Raih Ibadah Jariyah&rdquo;</em> • Pilihan Sewa <strong>Harian, Bulanan & Tahunan</strong></span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo with Official Monochrome White Image */}
          <Link href="/" className="flex items-center shrink-0 group py-1">
            <AlyatamaLogo variant="white" size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs sm:text-sm font-medium text-stone-300">
            <Link href="/" className="hover:text-[#E7D8C5] transition-colors whitespace-nowrap">
              Beranda
            </Link>
            <Link href="/kamar" className="hover:text-[#E7D8C5] transition-colors whitespace-nowrap">
              Pilihan Kamar
            </Link>
            <Link href="/galeri" className="hover:text-[#E7D8C5] transition-colors flex items-center gap-1.5 whitespace-nowrap">
              <ImageIcon className="w-3.5 h-3.5 text-[#C9A84C]" />
              Galeri & Iklan
            </Link>
            <Link href="/cek-ketersediaan" className="hover:text-[#E7D8C5] transition-colors flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-[#C9A84C]" />
              Cek Ketersediaan
            </Link>
            <Link href="/tentang" className="hover:text-[#E7D8C5] transition-colors whitespace-nowrap">
              Tentang & Nilai Syariah
            </Link>
            <Link href="/kebijakan" className="hover:text-[#E7D8C5] transition-colors whitespace-nowrap">
              Tata Tertib
            </Link>
            <Link href="/kontak" className="hover:text-[#E7D8C5] transition-colors whitespace-nowrap">
              Lokasi Bangkinang
            </Link>
          </nav>

          {/* Action Buttons (Strictly for Public Visitors - No Admin Keys/Buttons Here!) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/6282285472008"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-300 hover:text-stone-100 border border-[#806044]/60 hover:border-[#806044] rounded-xl px-3 py-2 transition-colors flex items-center gap-1.5 whitespace-nowrap bg-[#2a1f17]/40"
            >
              <Phone className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>0822 8547 2008</span>
            </a>

            <Link
              href="/booking"
              className="bg-[#806044] hover:bg-[#6e5239] text-[#F6F0E7] text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm whitespace-nowrap"
            >
              Pesan Sekarang
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/booking"
              className="bg-[#806044] hover:bg-[#6e5239] text-[#F6F0E7] text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xs"
            >
              Pesan
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-300 hover:text-stone-100 hover:bg-stone-800 focus:outline-none"
              aria-label="Buka navigasi menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#2a1f17] border-b border-[#806044]/40 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-stone-200 hover:text-white border-b border-[#4d3b2e]"
          >
            Beranda
          </Link>
          <Link
            href="/kamar"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-stone-200 hover:text-white border-b border-[#4d3b2e]"
          >
            Daftar & Tarif Kamar
          </Link>
          <Link
            href="/galeri"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-stone-200 hover:text-white border-b border-[#4d3b2e]"
          >
            Galeri & Foto Iklan
          </Link>
          <Link
            href="/cek-ketersediaan"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-stone-200 hover:text-white border-b border-[#4d3b2e]"
          >
            Pemeriksaan Ketersediaan
          </Link>
          <Link
            href="/tentang"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-stone-200 hover:text-white border-b border-[#4d3b2e]"
          >
            Tentang ALYATAMA & Misi Dakwah
          </Link>
          <Link
            href="/kebijakan"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-stone-200 hover:text-white border-b border-[#4d3b2e]"
          >
            Tata Tertib & Kebijakan Syariah
          </Link>
          <Link
            href="/kontak"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-stone-200 hover:text-white border-b border-[#4d3b2e]"
          >
            Kontak & Lokasi Bangkinang
          </Link>

          <div className="pt-2">
            <a
              href="https://wa.me/6282285472008"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2.5 rounded-xl border border-[#806044] text-[#E7D8C5] text-xs font-semibold flex items-center justify-center gap-2 bg-[#806044]/15"
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
