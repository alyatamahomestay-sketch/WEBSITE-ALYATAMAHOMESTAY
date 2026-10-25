import { describe, it, expect } from 'vitest';
import { prepareManualWhatsAppMessage } from '../src/lib/whatsapp';
import { Reservation } from '../src/lib/types';

describe('Manual WhatsApp Preparation with Strict Consent', () => {
  const baseReservation: Reservation = {
    id: 'res-test-1',
    reservation_number: 'ALY-20261025-999',
    guest_id: 'gst-1',
    checkin_date: '2026-10-25',
    checkout_date: '2026-10-27',
    adults: 2,
    children: 0,
    status: 'approved_pending_payment',
    payment_status: 'unpaid',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    guest: {
      id: 'gst-1',
      full_name: 'Ahmad Fauzi',
      phone: '081299887766',
      normalized_phone: '6281299887766',
      category: 'regular',
      created_at: '',
      updated_at: '',
    },
    rooms: [
      {
        id: 'room-1',
        room_number: '101',
        name: 'Kamar Melati',
        room_type: 'Standard Queen',
        description: '',
        capacity_adults: 2,
        capacity_children: 0,
        base_rate: 250000,
        operational_status: 'tersedia',
        amenities: [],
        photos: [],
        is_archived: false,
        created_at: '',
        updated_at: '',
      },
    ],
    price_snapshot: {
      id: 'snp-1',
      reservation_id: 'res-test-1',
      total_nights: 2,
      base_subtotal: 500000,
      nightly_breakdown: [],
      discount_amount: 0,
      extra_charges: 0,
      deposit_required: 250000,
      total_amount: 500000,
      total_paid: 0,
      balance_due: 500000,
      created_at: '',
      updated_at: '',
    },
    whatsapp_consent: {
      id: 'wac-1',
      reservation_id: 'res-test-1',
      phone: '6281299887766',
      has_consented: true,
      consent_timestamp: new Date().toISOString(),
      created_at: '',
    },
  };

  it('allows message generation when customer has explicitly consented', () => {
    const result = prepareManualWhatsAppMessage({
      reservation: baseReservation,
      propertySettings: { name: 'ALYATAMA HOMESTAY' },
      documentSlipUrl: 'http://localhost:3000/slip/res-test-1',
      messageType: 'approval_payment_request',
    });

    expect(result.canSend).toBe(true);
    expect(result.recipientPhone).toBe('6281299887766');
    expect(result.messageText).toContain('Ahmad Fauzi');
    expect(result.messageText).toContain('ALY-20261025-999');
    expect(result.messageText).toContain('Kamar Melati');
    expect(result.waDirectUrl).toContain('wa.me/6281299887766');
  });

  it('strictly blocks message generation if customer did not consent', () => {
    const noConsentRes: Reservation = {
      ...baseReservation,
      whatsapp_consent: {
        id: 'wac-2',
        reservation_id: 'res-test-1',
        phone: '6281299887766',
        has_consented: false, // Refused WhatsApp
        consent_timestamp: new Date().toISOString(),
        created_at: '',
      },
    };

    const result = prepareManualWhatsAppMessage({
      reservation: noConsentRes,
      documentSlipUrl: 'http://localhost:3000/slip/res-test-1',
      messageType: 'approval_payment_request',
    });

    expect(result.canSend).toBe(false);
    expect(result.reasonIfNotAllowed).toContain('tidak memberikan persetujuan');
    expect(result.waDirectUrl).toBe('');
  });
});
