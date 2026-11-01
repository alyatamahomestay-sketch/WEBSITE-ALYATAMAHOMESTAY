import fs from 'fs';
import path from 'path';
import { Reservation, Room } from '@/lib/types';
import { INITIAL_RESERVATIONS, INITIAL_ROOMS } from '@/lib/mock-fallback';

export const RESERVATIONS_FILE_PATH = path.join(process.cwd(), '.server-reservations.json');

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
  return [];
}

export function saveReservationsToFile(reservations: Reservation[]) {
  try {
    fs.writeFileSync(RESERVATIONS_FILE_PATH, JSON.stringify(reservations, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing reservations file:', e);
  }
}
