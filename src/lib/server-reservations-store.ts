import fs from 'fs';
import path from 'path';
import { Reservation, Room } from '@/lib/types';
import { INITIAL_RESERVATIONS, INITIAL_ROOMS } from '@/lib/mock-fallback';

export const RESERVATIONS_FILE_PATH = path.join(process.cwd(), '.server-reservations.json');

// Sample fallback seed reservations including the number ALY-20261101-4557 tested by user
export const SEED_RESERVATIONS: Reservation[] = [
  {
    id: 'res-seed-4557',
    reservation_number: 'ALY-20261101-4557',
    guest_id: 'gst-seed-4557',
    checkin_date: '2026-11-02',
    checkout_date: '2026-11-03',
    adults: 2,
    children: 0,
    rental_type: 'daily',
    duration_units: 1,
    status: 'pending_approval',
    payment_status: 'unpaid',
    payment_preference: 'cash',
    special_requests: '[Metode Pembayaran: Bayar Tunai (Cash di Tempat) - Pembayaran dilakukan sebelum serah terima kunci]',
    created_at: '2026-11-01T12:00:00.000Z',
    updated_at: '2026-11-01T12:00:00.000Z',
    guest: {
      id: 'gst-seed-4557',
      full_name: 'Tamu Uji Coba Resmi',
      phone: '082285472008',
      normalized_phone: '6282285472008',
      email: null,
      category: 'regular',
      created_at: '2026-11-01T12:00:00.000Z',
      updated_at: '2026-11-01T12:00:00.000Z',
    },
    rooms: INITIAL_ROOMS.slice(0, 1),
    price_snapshot: {
      id: 'snp-seed-4557',
      reservation_id: 'res-seed-4557',
      rental_type: 'daily',
      duration_units: 1,
      unit_rate: 200000,
      total_nights: 1,
      base_subtotal: 200000,
      nightly_breakdown: [],
      discount_amount: 0,
      discount_reason: null,
      promo_code: null,
      promo_snapshot: null,
      extra_charges: 0,
      deposit_required: 100000,
      total_amount: 200000,
      total_paid: 0,
      balance_due: 200000,
      created_at: '2026-11-01T12:00:00.000Z',
      updated_at: '2026-11-01T12:00:00.000Z',
    },
    deposit: {
      id: 'dep-seed-4557',
      reservation_id: 'res-seed-4557',
      required_amount: 100000,
      received_amount: 0,
      deducted_amount: 0,
      refunded_amount: 0,
      status: 'pending',
      created_at: '2026-11-01T12:00:00.000Z',
      updated_at: '2026-11-01T12:00:00.000Z',
    },
  },
];

export function normalizeReservation(r: any): Reservation {
  let mappedRooms: Room[] = [];
  if (Array.isArray(r.rooms)) {
    mappedRooms = r.rooms.map((rm: any) => {
      if (rm && rm.room) return rm.room;
      return rm;
    });
  }

  return {
    ...r,
    rooms: mappedRooms,
  };
}

export function loadReservationsFromFile(): Reservation[] {
  try {
    if (fs.existsSync(RESERVATIONS_FILE_PATH)) {
      const data = fs.readFileSync(RESERVATIONS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeReservation);
      }
    }
  } catch (e) {
    console.error('Error reading reservations file:', e);
  }
  const initialData = [...SEED_RESERVATIONS, ...INITIAL_RESERVATIONS];
  saveReservationsToFile(initialData);
  return initialData.map(normalizeReservation);
}

export function saveReservationsToFile(reservations: Reservation[]) {
  try {
    fs.writeFileSync(RESERVATIONS_FILE_PATH, JSON.stringify(reservations, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing reservations file:', e);
  }
}
