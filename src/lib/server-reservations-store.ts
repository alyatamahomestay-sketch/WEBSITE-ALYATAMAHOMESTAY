import fs from 'fs';
import path from 'path';
import { Reservation, Room } from '@/lib/types';
import { INITIAL_RESERVATIONS, INITIAL_ROOMS } from '@/lib/mock-fallback';

export const RESERVATIONS_FILE_PATH = path.join(process.cwd(), '.server-reservations.json');

export function extractPaymentPreference(r: any): 'cash' | 'transfer' {
  if (r.payment_preference === 'transfer' || r.payment_preference === 'cash') {
    return r.payment_preference;
  }
  const snapPromo = r.price_snapshot?.promo_snapshot;
  if (snapPromo && (snapPromo.payment_preference === 'transfer' || snapPromo.payment_preference === 'cash')) {
    return snapPromo.payment_preference;
  }
  const spec = String(r.special_requests || '').toLowerCase();
  if (spec.includes('transfer')) return 'transfer';
  if (spec.includes('cash') || spec.includes('tunai')) return 'cash';

  if (Array.isArray(r.payments) && r.payments.length > 0) {
    const pm = String(r.payments[0]?.payment_method || '').toLowerCase();
    if (pm.includes('transfer') || pm.includes('bank') || pm.includes('qris')) return 'transfer';
  }
  return 'cash';
}

export function normalizeReservation(r: any): Reservation {
  let mappedRooms: Room[] = [];
  if (Array.isArray(r.rooms)) {
    mappedRooms = r.rooms.map((rm: any) => {
      if (rm && rm.room) return rm.room;
      return rm;
    });
  } else if (r.rooms && typeof r.rooms === 'object' && !Array.isArray(r.rooms)) {
    mappedRooms = [r.rooms];
  }

  const pref = extractPaymentPreference(r);

  return {
    ...r,
    rooms: mappedRooms,
    payment_preference: pref,
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
  return [];
}

export function saveReservationsToFile(reservations: Reservation[]) {
  try {
    fs.writeFileSync(RESERVATIONS_FILE_PATH, JSON.stringify(reservations, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing reservations file:', e);
  }
}
