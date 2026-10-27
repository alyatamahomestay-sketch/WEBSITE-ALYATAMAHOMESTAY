import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { ReservationStatus, PaymentStatus, RoomOperationalStatus } from './types';

/**
 * Format currency to Indonesian Rupiah standard (IDR)
 */
export function formatRupiah(amount: number | null | undefined): string {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format date to Indonesian standard e.g. "25 Okt 2026"
 */
export function formatDateIndo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return format(d, 'dd MMMM yyyy', { locale: id });
  } catch (err) {
    return String(dateInput);
  }
}

export const formatTanggalIndo = formatDateIndo;

/**
 * Format short date e.g. "25/10/2026"
 */
export function formatShortDateIndo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return format(d, 'dd/MM/yyyy');
  } catch (err) {
    return String(dateInput);
  }
}

/**
 * Format date & time e.g. "25 Okt 2026, 14:30 WIB"
 */
export function formatDateTimeIndo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return `${format(d, 'dd MMM yyyy, HH:mm', { locale: id })} WIB`;
  } catch (err) {
    return String(dateInput);
  }
}

/**
 * UI Badges for Reservation Status
 */
export function getReservationStatusMeta(status: ReservationStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case 'pending_approval':
      return {
        label: 'Menunggu Persetujuan',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    case 'approved_pending_payment':
      return {
        label: 'Disetujui (Menunggu Pembayaran)',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
      };
    case 'confirmed':
      return {
        label: 'Terkonfirmasi',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    case 'checked_in':
      return {
        label: 'Sedang Menginap (Check-in)',
        badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
      };
    case 'checked_out':
      return {
        label: 'Selesai (Check-out)',
        badgeClass: 'bg-stone-100 text-stone-800 border-stone-300',
      };
    case 'rejected':
      return {
        label: 'Ditolak Admin',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      };
    case 'cancelled':
      return {
        label: 'Dibatalkan',
        badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',
      };
    case 'expired':
      return {
        label: 'Kedaluwarsa',
        badgeClass: 'bg-neutral-100 text-neutral-600 border-neutral-300',
      };
    case 'no_show':
      return {
        label: 'No-Show (Tidak Datang)',
        badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
      };
  }
}

/**
 * UI Badges for Payment Status
 */
export function getPaymentStatusMeta(status: PaymentStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case 'unpaid':
      return {
        label: 'Belum Dibayar',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      };
    case 'pending_verification':
      return {
        label: 'Menunggu Verifikasi',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    case 'partially_paid':
      return {
        label: 'Dibayar Sebagian (DP)',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      };
    case 'paid':
      return {
        label: 'Lunas',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    case 'partially_refunded':
      return {
        label: 'Pengembalian Sebagian',
        badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
      };
    case 'refunded':
      return {
        label: 'Dikembalikan Penuh (Refund)',
        badgeClass: 'bg-stone-100 text-stone-700 border-stone-300',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
      };
  }
}

/**
 * UI Badges for Room Operational Status
 */
export function getRoomOperationalStatusMeta(status: RoomOperationalStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case 'tersedia':
      return {
        label: 'Tersedia',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    case 'ditempati':
      return {
        label: 'Ditempati Tamu',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      };
    case 'menunggu_dibersihkan':
      return {
        label: 'Menunggu Dibersihkan',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    case 'sedang_dibersihkan':
      return {
        label: 'Sedang Dibersihkan',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
      };
    case 'siap_digunakan':
      return {
        label: 'Siap Digunakan (Inspected)',
        badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
      };
    case 'dalam_perawatan':
      return {
        label: 'Dalam Perawatan / Rusak',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      };
    case 'tidak_dijual_sementara':
      return {
        label: 'Tidak Dijual Sementara',
        badgeClass: 'bg-stone-100 text-stone-800 border-stone-300',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
      };
  }
}
