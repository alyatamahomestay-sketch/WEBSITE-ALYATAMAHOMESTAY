import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ALYATAMA HOMESTAY | Penginapan Nyaman & Bersih di Jambi',
  description: 'Penginapan homestay resmi ALYATAMA HOMESTAY di Paal Merah, Kota Jambi. Fasilitas lengkap, kamar bersih, suasana hening, dan pelayanan ramah.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen flex flex-col font-sans bg-stone-50 text-stone-850">
        {children}
      </body>
    </html>
  );
}
