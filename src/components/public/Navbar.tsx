'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Calendar, Info, Phone, ShieldCheck, Menu, X, KeyRound } from 'lucide-react';

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur border-b border-stone-800 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/30 transition-colors">
              <Home className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <span className="font-serif tracking-wider font-semibold text-lg sm:text-xl text-stone-50 block leading-tight">
                ALYATAMA
              </span>
              <span className="text-[10px] tracking-widest text-stone-400 uppercase font-medium block">
                HOMESTAY JAMBI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-300">
            <Link href="/" className="hover:text-brand-300 transition-colors">
              Beranda
            </Link>
            <Link href="/kamar" className="hover:text-brand-300 transition-colors">
              Daftar Kamar
            </Link>
            <Link href="/cek-ketersediaan" className="hover:text-brand-300 transition-colors flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-400" />
              Cek Ketersediaan
            </Link>
            <Link href="/tentang" className="hover:text-brand-300 transition-colors">
              Tentang Kami
            </Link>
            <Link href="/kebijakan" className="hover:text-brand-300 transition-colors">
              Kebijakan
            </Link>
            <Link href="/kontak" className="hover:text-brand-300 transition-colors">
              Kontak & Lokasi
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/status-reservasi"
              className="text-xs text-stone-400 hover:text-stone-200 border border-stone-700 hover:border-stone-500 rounded-md px-3 py-1.5 transition-colors"
            >
              Cek Status Reservasi
            </Link>
            <Link
              href="/booking"
              className="bg-brand-600 hover:bg-brand-500 text-stone-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Pesan Kamar
            </Link>
            <Link
              href="/dashboard"
              title="Akses Dashboard Staf Homestay"
              className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
            >
              <KeyRound className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/booking"
              className="bg-brand-600 hover:bg-brand-500 text-stone-50 text-xs font-medium px-3 py-1.5 rounded-md"
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
        <div className="md:hidden bg-stone-900 border-b border-stone-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-200 hover:text-brand-300 text-sm"
          >
            Beranda
          </Link>
          <Link
            href="/kamar"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-200 hover:text-brand-300 text-sm"
          >
            Daftar Kamar
          </Link>
          <Link
            href="/cek-ketersediaan"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-200 hover:text-brand-300 text-sm"
          >
            Cek Ketersediaan
          </Link>
          <Link
            href="/tentang"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-200 hover:text-brand-300 text-sm"
          >
            Tentang Kami
          </Link>
          <Link
            href="/kebijakan"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-200 hover:text-brand-300 text-sm"
          >
            Kebijakan Menginap
          </Link>
          <Link
            href="/kontak"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-200 hover:text-brand-300 text-sm"
          >
            Kontak & Lokasi
          </Link>
          <Link
            href="/status-reservasi"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-400 hover:text-stone-200 text-sm"
          >
            Lacak Status Pemesanan
          </Link>
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Akses Staf PMS
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
