import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock, AlertTriangle, CreditCard, CheckCircle2 } from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';

export default function KebijakanPage() {
  return (
    <>
      <PublicNavbar />

      <main className="flex-1 bg-stone-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-700 block mb-2">
              Tata Tertib & Ketentuan
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight mb-4">
              Kebijakan Menginap ALYATAMA HOMESTAY
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Demi kenyamanan, keamanan, dan ketertiban seluruh tamu, mohon perhatikan ketentuan operasional berikut ini.
            </p>
          </div>

          <div className="space-y-8">
            {/* Waktu Check-in & Check-out */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-stone-900 font-semibold text-base pb-3 border-b border-stone-100">
                <Clock className="w-5 h-5 text-brand-600" />
                <span>1. Waktu Check-in dan Check-out</span>
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                <p>
                  • <strong>Waktu Check-in:</strong> Mulai pukul <strong>14:00 WIB</strong>. Apabila Anda tiba lebih awal, penitipan bagasi dapat dilayani sesuai ketersediaan staf resepsionis.
                </p>
                <p>
                  • <strong>Waktu Check-out:</strong> Maksimal pukul <strong>12:00 WIB</strong>. Keterlambatan check-out tanpa konfirmasi dapat dikenakan biaya perpanjangan atau penyesuaian tarif setengah hari.
                </p>
                <p>
                  • Tamu diwajibkan menunjukkan kartu identitas resmi (KTP / Paspor) yang sah saat proses check-in.
                </p>
              </div>
            </div>

            {/* Alur Reservasi & Verifikasi */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-stone-900 font-semibold text-base pb-3 border-b border-stone-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>2. Alur Persetujuan & Masa Berlaku Pemesanan</span>
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                <p>
                  • Seluruh pemesanan yang diajukan melalui website berstatus <strong>Menunggu Persetujuan Admin (Pending Approval)</strong>.
                </p>
                <p>
                  • Admin akan memeriksa ketersediaan fisik kamar sebelum menyetujui pemesanan guna mencegah tumpang tindih reservasi.
                </p>
                <p>
                  • Setelah disetujui, tamu memiliki tenggat waktu 24 jam untuk melakukan pembayaran uang muka (deposit) atau pelunasan. Permintaan yang tidak dibayarkan hingga batas waktu kedaluwarsa akan dibatalkan otomatis agar kamar dapat dialokasikan kepada tamu lain.
                </p>
              </div>
            </div>

            {/* Kebijakan Pembatalan & Refund */}
            <div id="pembatalan" className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-stone-900 font-semibold text-base pb-3 border-b border-stone-100">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>3. Kebijakan Pembatalan & Pengembalian Dana</span>
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                <p>
                  • <strong>Pembatalan Bebas Biaya:</strong> Pembatalan yang diajukan selambat-lambatnya <strong>3 hari (H-3)</strong> sebelum tanggal check-in bebas potongan biaya administrasi.
                </p>
                <p>
                  • <strong>Pembatalan H-2 hingga Hari H:</strong> Dikenakan potongan biaya sebesar 50% dari uang muka (deposit) yang telah dibayarkan.
                </p>
                <p>
                  • <strong>Tidak Datang (No-Show):</strong> Apabila tamu tidak hadir tanpa pemberitahuan hingga pukul 22:00 WIB pada hari kedatangan, pemesanan dianggap batal dan deposit tidak dapat dikembalikan.
                </p>
              </div>
            </div>

            {/* Larangan & Ketertiban */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-stone-900 font-semibold text-base pb-3 border-b border-stone-100">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span>4. Ketertiban Lingkungan & Larangan</span>
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                <p>• Dilarang merokok di dalam kamar ber-AC. Area merokok khusus telah disediakan di luar ruangan.</p>
                <p>• Dilarang membawa hewan peliharaan tanpa izin tertulis dari manajemen.</p>
                <p>• Dilarang membawa senjata tajam, obat-obatan terlarang, narkotika, atau barang berbahaya yang melanggar hukum Republik Indonesia.</p>
                <p>• Jam tenang malam hari berlaku mulai pukul 22:00 WIB guna menjaga ketenteraman seluruh penghuni homestay.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
