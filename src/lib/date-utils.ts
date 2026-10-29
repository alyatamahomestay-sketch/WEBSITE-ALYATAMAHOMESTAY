/**
 * Utilitas Tanggal Resmi ALYATAMA HOMESTAY
 * Menggunakan zona waktu resmi Asia/Jakarta (WIB, UTC+7)
 * Menghindari pergeseran tanggal kemarin saat pergantian hari di UTC.
 */

/**
 * Mengembalikan tanggal hari ini dalam format 'YYYY-MM-DD' di zona waktu WIB.
 */
export function getTodayDateWIB(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Menghitung tanggal check-out default berdasarkan jenis sewa di zona waktu WIB.
 * - daily: +1 hari
 * - monthly: +1 bulan (30 hari standar)
 * - yearly: +1 tahun
 */
export function getDefaultCheckoutWIB(
  checkinStr: string,
  rentalType: 'daily' | 'monthly' | 'yearly' = 'daily'
): string {
  try {
    const parts = checkinStr.split('-').map(Number);
    if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      return getTodayDateWIB();
    }
    const [y, m, d] = parts;
    const date = new Date(Date.UTC(y, m - 1, d));

    if (rentalType === 'daily') {
      date.setUTCDate(date.getUTCDate() + 1);
    } else if (rentalType === 'monthly') {
      date.setUTCMonth(date.getUTCMonth() + 1);
    } else if (rentalType === 'yearly') {
      date.setUTCFullYear(date.getUTCFullYear() + 1);
    }

    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return getTodayDateWIB();
  }
}
