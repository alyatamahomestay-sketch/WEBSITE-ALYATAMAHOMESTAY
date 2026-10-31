import { Room, Reservation } from './types';
import { getTodayDateWIB } from './date-utils';

export interface RoomAvailabilityInfo {
  isAvailable: boolean;
  statusLabel: 'Tersedia' | 'Tidak Tersedia';
  statusColor: 'green' | 'red';
  reason?: string;
}

/**
 * Evaluates whether a room is available for new guests right now.
 * A room is considered "Tidak Tersedia" (Red) if:
 * 1. Admin/Staff explicitly marked operational_status as 'ditempati', 'dalam_perawatan', 'tidak_dijual_sementara', or cleaning.
 * 2. An active approved/confirmed/checked_in reservation occupies the room today.
 * 3. The room is archived.
 */
export function evaluateRoomAvailability(
  room: Room,
  reservations: Reservation[] = [],
  currentDateStr: string = getTodayDateWIB()
): RoomAvailabilityInfo {
  // 1. Check archive status
  if (room.is_archived) {
    return {
      isAvailable: false,
      statusLabel: 'Tidak Tersedia',
      statusColor: 'red',
      reason: 'Kamar Tidak Dijual (Diarsipkan)',
    };
  }

  // 2. Check admin/staff explicit operational status
  if (room.operational_status === 'ditempati') {
    return {
      isAvailable: false,
      statusLabel: 'Tidak Tersedia',
      statusColor: 'red',
      reason: 'Kamar Sedang Ditempati Tamu',
    };
  }

  if (room.operational_status === 'dalam_perawatan') {
    return {
      isAvailable: false,
      statusLabel: 'Tidak Tersedia',
      statusColor: 'red',
      reason: 'Kamar Sedang Dalam Perawatan / Maintenance',
    };
  }

  if (room.operational_status === 'tidak_dijual_sementara') {
    return {
      isAvailable: false,
      statusLabel: 'Tidak Tersedia',
      statusColor: 'red',
      reason: 'Kamar Tidak Dijual Sementara oleh Pengelola',
    };
  }

  if (room.operational_status === 'menunggu_dibersihkan' || room.operational_status === 'sedang_dibersihkan') {
    return {
      isAvailable: false,
      statusLabel: 'Tidak Tersedia',
      statusColor: 'red',
      reason: 'Kamar Sedang Disterilisasi & Dibersihkan',
    };
  }

  // 3. Check active approved reservations that overlap with today
  const activeReservation = reservations.find((res) => {
    // Only count approved bookings
    if (res.status !== 'confirmed' && res.status !== 'approved_pending_payment' && res.status !== 'checked_in') {
      return false;
    }
    const matchRoom = res.rooms?.some((r) => r.id === room.id);
    if (!matchRoom) return false;

    // Check date interval: checkin_date <= currentDateStr && checkout_date > currentDateStr
    return res.checkin_date <= currentDateStr && res.checkout_date > currentDateStr;
  });

  if (activeReservation) {
    return {
      isAvailable: false,
      statusLabel: 'Tidak Tersedia',
      statusColor: 'red',
      reason: 'Kamar Sudah Dipesan & Ditempati (Belum Check-out)',
    };
  }

  // Otherwise, the room is available
  return {
    isAvailable: true,
    statusLabel: 'Tersedia',
    statusColor: 'green',
  };
}
