'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Phone, Menu, X, KeyRound, ShieldCheck, Heart } from 'lucide-react';
import AlyatamaLogo from '@/components/common/AlyatamaLogo';

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#392B21]/95 backdrop-blur border-b border-[#806044]/30 text-stone-100 shadow-sm">
      {/* Top Banner: Syariah & Charity Mission from Flyer */}
      <div className="bg-[#806044] text-[#F6F0E7] text-[11px] py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Heart className="w-3.5 h-3.5 text-[#E7D8C5]" />
        <span>Penginapan Syariah: <em>&ldquo;Nikmati Kenyamanan, Raih Ibadah Jariyah&rdquo;</em> • Bisa untuk <strong>Harian, Bulanan & Tahunan</strong></span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center group">
            <AlyatamaLogo variant="light" size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-medium text-stone-300">
            <Link href="/" className="hover:text-[#E7D8C5] transition-colors">
              Beranda
            </Link>
            <Link href="/kamar" className="hover:text-[#E7D8C5] transition-colors">
              Pilihan Kamar
            </Link>
            <Link href="/cek-ketersediaan" className="hover:text-[#E7D8C5] transition-colors flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#806044]" />
              Cek Ketersediaan
            </Link>
            <Link href="/tentang" className="hover:text-[#E7D8C5] transition-colors">
              Tentang & Nilai Syariah
            </Link>
            <Link href="/kebijakan" className="hover:text-[#E7D8C5] transition-colors">
              Tata Tertib
            </Link>
            <Link href="/kontak" className="hover:text-[#E7D8C5] transition-colors">
              Lokasi Bangkinang
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://wa.me/6282285472008"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-300 hover:text-stone-100 border border-[#806044]/50 hover:border-[#806044] rounded-lg px-3 py-2 transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#806044]" />
              <span>0822 8547 2008</span>
            </a>

            <Link
              href="/booking"
              className="bg-[#806044] hover:bg-[#6e5239] text-[#F6F0E7] text-xs sm:text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Pesan Sekarang
            </Link>

            <Link
              href="/dashboard"
              title="Akses Portal Staf & Pengelola"
              className="p-2 text-stone-400 hover:text-stone-200 hover:bg-[#806044]/20 rounded-lg transition-colors"
            >
              <KeyRound className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/booking"
              className="bg-[#806044] hover:bg-[#6e5239] text-[#F6F0E7] text-xs font-medium px-3 py-1.5 rounded-md"
            >
              Pesan
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-300 hover:text-stone-100 hover:bg-stone-800"
              aria-label="Buka navigasi menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#392B21] border-b border-[#806044]/40 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-200 hover:text-[#E7D8C5] text-sm"
          >
            Beranda
          </Link>
          <Link
            href="/kamar"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-200 hover:text-[#E7D8C5] text-sm"
          >
            Pilihan Kamar (Harian / Bulanan / Tahunan)
          </Link>
          <Link
            href="/cek-ketersediaan"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-200 hover:text-[#E7D8C5] text-sm"
          >
            Cek Ketersediaan Kamar
          </Link>
          <Link
            href="/tentang"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-200 hover:text-[#E7D8C5] text-sm"
          >
            Tentang Homestay & Nilai Syariah
          </Link>
          <Link
            href="/kebijakan"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-200 hover:text-[#E7D8C5] text-sm"
          >
            Tata Tertib & Kebijakan Tamu
          </Link>
          <Link
            href="/kontak"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-200 hover:text-[#E7D8C5] text-sm"
          >
            Lokasi Bangkinang Kota & Kontak
          </Link>
          <Link
            href="/status-reservasi"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-400 hover:text-stone-200 text-sm"
          >
            Lacak Status Pemesanan
          </Link>
          <div className="pt-2 border-t border-[#806044]/30 flex items-center justify-between">
            <a
              href="https://wa.me/6282285472008"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#E7D8C5] flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              0822 8547 2008
            </a>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Portal Staf PMS
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
