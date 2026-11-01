import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ALYATAMA HOMESTAY | Penginapan Syariah Bangkinang Kota, Kampar, Riau',
  description: 'Penginapan Syariah terpercaya di Bangkinang Kota, Kabupaten Kampar, Riau. Sewa Harian dan Bulanan. Fasilitas lengkap, kamar bersih, suasana Islami, dan pelayanan profesional.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth w-full m-0 p-0">
      <body className="min-h-screen flex flex-col font-sans bg-[#F6F0E7] text-[#392B21] w-full m-0 p-0">
        {children}
      </body>
    </html>
  );
}
