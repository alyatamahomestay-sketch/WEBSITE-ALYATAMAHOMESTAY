import React from 'react';
import Link from 'next/link';
import { Home, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-stone-900 border-t border-stone-800 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Summary */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                <Home className="w-5 h-5 text-brand-300" />
              </div>
              <span className="font-serif tracking-wider font-semibold text-xl text-stone-100">
                ALYATAMA
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Penginapan homestay nyaman, tenang, dan higienis di Jambi. Melayani tamu perjalanan bisnis, liburan keluarga, maupun kunjungan instansi dengan standar keramahan Indonesia.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span>Check-in 14:00 | Check-out 12:00</span>
            </div>
          </div>

          {/* Navigasi Cepat */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-stone-100">
              Navigasi
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/" className="hover:text-stone-200 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/kamar" className="hover:text-stone-200 transition-colors">
                  Daftar & Tarif Kamar
                </Link>
              </li>
              <li>
                <Link href="/cek-ketersediaan" className="hover:text-stone-200 transition-colors">
                  Pemeriksaan Ketersediaan
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-stone-200 transition-colors">
                  Formulir Reservasi
                </Link>
              </li>
              <li>
                <Link href="/status-reservasi" className="hover:text-stone-200 transition-colors">
                  Lacak Pemesanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kebijakan & Privasi */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-stone-100">
              Kebijakan Properti
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/kebijakan" className="hover:text-stone-200 transition-colors">
                  Tata Tertib Menginap
                </Link>
              </li>
              <li>
                <Link href="/kebijakan#pembatalan" className="hover:text-stone-200 transition-colors">
                  Kebijakan Pembatalan & Deposit
                </Link>
              </li>
              <li>
                <Link href="/privasi" className="hover:text-stone-200 transition-colors">
                  Kebijakan Privasi Tamu
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-stone-500 hover:text-stone-300 transition-colors">
                  Portal Staf & Manajemen
                </Link>
              </li>
            </ul>
          </div>

          {/* Lokasi Terverifikasi */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-stone-100 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-400" />
              Lokasi Terverifikasi
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Jl. Sultan Hasanuddin, RT 01 / Bakung Jaya, Kec. Paal Merah, Kota Jambi, Jambi 36138, Indonesia.
            </p>
            <a
              href="https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium underline underline-offset-4"
            >
              Buka di Google Maps &rarr;
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} ALYATAMA HOMESTAY. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Sistem Reservasi Terverifikasi
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
