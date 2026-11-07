import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Halaman Cek Ketersediaan telah dialihkan ke Halaman Pilihan Kamar (/kamar),
 * di mana status ketersediaan unit kamar (Tersedia / Tidak Tersedia)
 * telah ditampilkan secara langsung dan realtime.
 */
export default function CekKetersediaanRedirectPage() {
  redirect('/kamar');
}
