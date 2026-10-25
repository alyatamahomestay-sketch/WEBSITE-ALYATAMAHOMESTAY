import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink } from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import { PmsService } from '@/lib/services/pms-service';

export const revalidate = 0;

export default async function KontakPage() {
  const property = await PmsService.getPropertySettings();

  return (
    <>
      <PublicNavbar />

      <main className="flex-1 bg-stone-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-700 block mb-2">
              Hubungi Kami & Lokasi
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight mb-4">
              Kontak & Lokasi ALYATAMA HOMESTAY
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Kami siap melayani kebutuhan akomodasi dan menjawab pertanyaan Anda seputar ketersediaan kamar, fasilitas, maupun rute perjalanan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-serif font-semibold text-lg text-stone-900 pb-3 border-b border-stone-100">
                Informasi Kontak
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-stone-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block">Nomor Telepon</span>
                    <strong className="text-stone-900">{property.phone || 'Tersedia di dashboard'}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block">Layanan WhatsApp</span>
                    <strong className="text-stone-900">{property.whatsapp_number || property.phone || '-'}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block">Email Resmi</span>
                    <span className="text-stone-900">{property.email || 'kontak@alyatamahomestay.com'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block">Jam Operasional Pelayanan</span>
                    <span className="text-stone-900">07:00 - 22:00 WIB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address & Navigation Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-serif font-semibold text-lg text-stone-900 pb-3 border-b border-stone-100">
                Alamat Terverifikasi
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-stone-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block">Alamat Fisik Homestay</span>
                    <strong className="text-stone-900 leading-relaxed block">
                      {property.address}
                    </strong>
                    <span className="text-stone-600 block mt-0.5">
                      {property.city}, {property.province} {property.postal_code}, {property.country}
                    </span>
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2">
                  <span className="font-semibold text-stone-900 block text-[11px] uppercase tracking-wider">
                    Titik Google Maps:
                  </span>
                  <p className="leading-relaxed">
                    Sentra &quot;Alyatama&quot; Jambi, Jl. Sultan Hasanuddin, RT 01 / Bakung Jaya, Paal Merah.
                  </p>
                  <a
                    href="https://maps.app.goo.gl/M2HcHTp2wSDMNyfj7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800 font-semibold underline underline-offset-4 pt-1"
                  >
                    Buka Peta & Rute di Google Maps
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
