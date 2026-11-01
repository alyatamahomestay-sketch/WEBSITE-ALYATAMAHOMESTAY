import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock, AlertTriangle, CreditCard, CheckCircle2, HeartHandshake, Sparkles, Building2 } from 'lucide-react';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';

export default function KebijakanPage() {
  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <PublicNavbar />

      <main className="flex-1 bg-[#F6F0E7] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-1.5 bg-[#806044]/15 text-[#806044] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tata Tertib & Kepatuhan Syariah</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#392B21] tracking-tight mb-4">
              Kebijakan Menginap ALYATAMA HOMESTAY
            </h1>
            <p className="text-sm text-[#756A5F] leading-relaxed">
              Demi kenyamanan bersama, ketertiban lingkungan, dan keberkahan menginap berlandaskan nilai-nilai Syariah di Bangkinang Kota, mohon seluruh calon tamu mematuhi ketentuan operasional berikut.
            </p>
          </div>

          <div className="space-y-8">
            
            {/* Kebijakan Syariah & Pasangan */}
            <div id="pasangan" className="bg-white rounded-3xl border border-[#d4c3ad] p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-[#392B21] font-bold text-base pb-3 border-b border-[#FAF7F2]">
                <HeartHandshake className="w-5 h-5 text-[#806044]" />
                <span>1. Prinsip Syariah & Ketentuan Tamu Pasangan</span>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-[#756A5F] leading-relaxed">
                <p>
                  • <strong>Pasangan Lawan Jenis:</strong> Tamu pria dan wanita yang menginap dalam satu kamar wajib merupakan pasangan sah suami-istri atau mahram keluarga.
                </p>
                <p>
                  • <strong>Verifikasi Dokumen:</strong> Petugas homestay berhak meminta bukti pernikahan yang sah (seperti Buku Nikah resmi atau KTP suami-istri beralamat sama) saat proses check-in.
                </p>
                <p>
                  • <strong>Larangan Keras:</strong> Dilarang keras membawa minuman beralkohol, zat terlarang (narkotika), perjudian, dan aktivitas yang bertentangan dengan norma kesusilaan serta hukum Islam.
                </p>
              </div>
            </div>

            {/* Waktu Check-in & Check-out */}
            <div className="bg-white rounded-3xl border border-[#E5DCD0] p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-[#392B21] font-bold text-base pb-3 border-b border-[#FAF7F2]">
                <Clock className="w-5 h-5 text-[#806044]" />
                <span>2. Waktu Check-in dan Check-out</span>
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-[#756A5F] leading-relaxed">
                <p>
                  • <strong>Waktu Check-in:</strong> Mulai pukul <strong>14:00 WIB</strong>. Bila Anda tiba lebih awal, penitipan bagasi dapat dikoordinasikan terlebih dahulu kepada pengelola.
                </p>
                <p>
                  • <strong>Waktu Check-out:</strong> Maksimal pukul <strong>12:00 WIB</strong>. Keterlambatan check-out tanpa konfirmasi dapat dikenakan biaya penyesuaian operasional.
                </p>
                <p>
                  • Seluruh tamu dewasa wajib menunjukkan kartu identitas resmi (KTP/SIM/Paspor) saat check-in.
                </p>
              </div>
            </div>

            {/* Model Sewa: Harian dan Bulanan */}
            <div className="bg-white rounded-3xl border border-[#E5DCD0] p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-[#392B21] font-bold text-base pb-3 border-b border-[#FAF7F2]">
                <Building2 className="w-5 h-5 text-[#65715A]" />
                <span>3. Ketentuan Masa Sewa (Harian dan Bulanan)</span>
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-[#756A5F] leading-relaxed">
                <p>
                  • <strong>Sewa Harian:</strong> Pembayaran deposit 50% saat reservasi disetujui, dan pelunasan sisa tagihan dilakukan saat check-in.
                </p>
                <p>
                  • <strong>Sewa Bulanan:</strong> Berlaku untuk durasi minimal 1 bulan (30 hari). Termasuk biaya kebersihan berkala dan fasilitas standar. Uang jaminan (security deposit) dikembalikan saat masa sewa berakhir setelah kamar diinspeksi.
                </p>
                <p>
                </p>
              </div>
            </div>

            {/* Kebijakan Pembatalan & Refund */}
            <div id="pembatalan" className="bg-white rounded-3xl border border-[#E5DCD0] p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-[#392B21] font-bold text-base pb-3 border-b border-[#FAF7F2]">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>4. Kebijakan Pembatalan & Pengembalian Dana</span>
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-[#756A5F] leading-relaxed">
                <p>
                  • <strong>Pembatalan H-3:</strong> Pembatalan yang diajukan selambat-lambatnya 3 hari kalender sebelum tanggal check-in bebas potongan biaya administrasi penuh.
                </p>
                <p>
                  • <strong>Pembatalan H-2 hingga Hari H:</strong> Dikenakan potongan biaya 50% dari uang muka (deposit) yang telah dibayarkan.
                </p>
                <p>
                  • <strong>Ketidakhadiran (No-Show):</strong> Apabila tamu tidak hadir tanpa pemberitahuan resmi hingga pukul 22:00 WIB pada hari kedatangan, pemesanan dianggap batal demi membuka kesempatan bagi tamu lain yang membutuhkan akomodasi darurat.
                </p>
              </div>
            </div>

            {/* Larangan Merokok & Kebersihan */}
            <div className="bg-white rounded-3xl border border-[#E5DCD0] p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-[#392B21] font-bold text-base pb-3 border-b border-[#FAF7F2]">
                <ShieldCheck className="w-5 h-5 text-[#806044]" />
                <span>5. Larangan Merokok di Kamar & Kebersihan</span>
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-[#756A5F] leading-relaxed">
                <p>• <strong>Bebas Asap Rokok di Dalam Kamar:</strong> Seluruh unit kamar tidur ber-AC adalah zona bebas rokok demi menjaga aroma segar dan kesehatan para santri serta tamu berikutnya. Area merokok khusus disediakan di luar ruangan.</p>
                <p>• Dilarang membawa hewan peliharaan.</p>
                <p>• Jam tenang malam hari berlaku mulai pukul 22:00 WIB guna menjaga kekhusyukan istirahat dan ketenangan lingkungan santri.</p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
