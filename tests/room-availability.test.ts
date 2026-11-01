import { describe, it, expect } from 'vitest';
import { evaluateRoomAvailability } from '../src/lib/room-availability';
import { getGuestToAdminWhatsAppUrl } from '../src/lib/services/slip-image-generator';
import { Room, Reservation } from '../src/lib/types';

describe('Room Availability Evaluation', () => {
  const baseRoom: Room = {
    id: 'room-test-1',
    room_number: '101',
    name: 'Kamar Syariah Standard',
    room_type: 'Reguler',
    description: 'Kamar nyaman dan bersih standar syariah.',
    capacity_adults: 2,
    capacity_children: 1,
    base_rate: 200000,
    operational_status: 'tersedia',
    amenities: ['AC', 'WiFi'],
    photos: [],
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('marks room as Tersedia (green) when operational_status is tersedia and no active booking', () => {
    const result = evaluateRoomAvailability(baseRoom, [], '2026-11-01');
    expect(result.isAvailable).toBe(true);
    expect(result.statusLabel).toBe('Tersedia');
    expect(result.statusColor).toBe('green');
  });

  it('marks room as Tidak Tersedia (red) when operational_status is ditempati', () => {
    const occupiedRoom: Room = { ...baseRoom, operational_status: 'ditempati' };
    const result = evaluateRoomAvailability(occupiedRoom, [], '2026-11-01');
    expect(result.isAvailable).toBe(false);
    expect(result.statusLabel).toBe('Tidak Tersedia');
    expect(result.statusColor).toBe('red');
  });

  it('marks room as Tidak Tersedia (red) when operational_status is dalam_perawatan', () => {
    const maintRoom: Room = { ...baseRoom, operational_status: 'dalam_perawatan' };
    const result = evaluateRoomAvailability(maintRoom, [], '2026-11-01');
    expect(result.isAvailable).toBe(false);
    expect(result.statusLabel).toBe('Tidak Tersedia');
    expect(result.statusColor).toBe('red');
  });

  it('marks room as Tidak Tersedia (red) when an approved reservation overlaps with today', () => {
    const activeReservation: Reservation = {
      id: 'res-1',
      reservation_number: 'ALY-20261101-001',
      guest_id: 'guest-1',
      status: 'confirmed',
      payment_status: 'paid',
      checkin_date: '2026-11-01',
      checkout_date: '2026-11-03',
      rental_type: 'daily',
      adults: 2,
      children: 0,
      rooms: [baseRoom],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = evaluateRoomAvailability(baseRoom, [activeReservation], '2026-11-01');
    expect(result.isAvailable).toBe(false);
    expect(result.statusLabel).toBe('Tidak Tersedia');
    expect(result.statusColor).toBe('red');
  });

  it('marks room as Tersedia (green) after reservation check-out date has passed', () => {
    const pastReservation: Reservation = {
      id: 'res-2',
      reservation_number: 'ALY-20261025-001',
      guest_id: 'guest-2',
      status: 'confirmed',
      payment_status: 'paid',
      checkin_date: '2026-10-25',
      checkout_date: '2026-10-28',
      rental_type: 'daily',
      adults: 2,
      children: 0,
      rooms: [baseRoom],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = evaluateRoomAvailability(baseRoom, [pastReservation], '2026-11-01');
    expect(result.isAvailable).toBe(true);
    expect(result.statusLabel).toBe('Tersedia');
  });
});

describe('Guest to Admin WhatsApp URL', () => {
  it('generates correct wa.me link with admin property phone and prefilled text', () => {
    const reservation: Reservation = {
      id: 'res-10',
      reservation_number: 'ALY-20261101-777',
      guest_id: 'g-1',
      status: 'pending_approval',
      payment_status: 'unpaid',
      checkin_date: '2026-11-05',
      checkout_date: '2026-11-07',
      rental_type: 'daily',
      adults: 2,
      children: 0,
      guest: {
        id: 'g-1',
        full_name: 'Ahmad Fauzi',
        phone: '081234567890',
        normalized_phone: '+6281234567890',
        category: 'regular',
        created_at: '',
        updated_at: '',
      },
      rooms: [{
        id: 'r-1',
        room_number: '101',
        name: 'Kamar Reguler A',
        room_type: 'Reguler',
        description: 'Kamar Reguler standar',
        capacity_adults: 2,
        capacity_children: 0,
        base_rate: 200000,
        operational_status: 'tersedia',
        amenities: [],
        photos: [],
        is_archived: false,
        created_at: '',
        updated_at: '',
      }],
      created_at: '',
      updated_at: '',
    };

    const url = getGuestToAdminWhatsAppUrl({
      reservation,
      propertySettings: {
        name: 'ALYATAMA HOMESTAY',
        whatsapp_number: '0822-8547-2008',
      } as any,
    });

    expect(url).toContain('https://wa.me/6282285472008?text=');
    expect(url).toContain('ALY-20261101-777');
    expect(url).toContain('Ahmad%20Fauzi');
  });
});
