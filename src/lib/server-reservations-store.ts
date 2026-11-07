import fs from 'fs';
import path from 'path';
import { Reservation, Room } from '@/lib/types';
import { INITIAL_RESERVATIONS, INITIAL_ROOMS } from '@/lib/mock-fallback';
import { formatRupiah } from '@/lib/formatters';

export const RESERVATIONS_FILE_PATH = path.join(process.cwd(), '.server-reservations.json');

function getActiveExtraBedRate(): number {
  try {
    const extraBedFile = path.join(process.cwd(), '.server-extra-bed.json');
    if (fs.existsSync(extraBedFile)) {
      const extraData = JSON.parse(fs.readFileSync(extraBedFile, 'utf8'));
      if (extraData && typeof extraData.extra_bed_rate === 'number' && extraData.extra_bed_rate >= 0) {
        return Number(extraData.extra_bed_rate);
      }
    }
  } catch (e) {}
  return 30000;
}

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
    }).filter(Boolean);
  } else if (r.rooms && typeof r.rooms === 'object' && !Array.isArray(r.rooms)) {
    mappedRooms = [r.rooms?.room || r.rooms];
  }

  let mappedSnapshot = r.price_snapshot;
  if (Array.isArray(mappedSnapshot)) {
    mappedSnapshot = mappedSnapshot[0] || null;
  }

  // Extract extra bed information from special_requests if not explicitly broken down
  let extraBedCount = 0;
  const specReq = String(r.special_requests || '');
  const extraBedMatch = specReq.match(/\[(?:Permintaan:\s*)?\+(\d+)\s*Unit\s*Ekstra\s*Bed\]/i) || specReq.match(/\[Ekstra\s*Bed:\s*\+(\d+)\s*Unit/i);
  if (extraBedMatch && extraBedMatch[1]) {
    extraBedCount = parseInt(extraBedMatch[1], 10);
  }

  const defaultRoomRate = mappedRooms[0]?.base_rate || 200000;
  const nights = r.duration_units || mappedSnapshot?.total_nights || 1;

  const activeExtraRate = getActiveExtraBedRate();

  if (!mappedSnapshot) {
    const extraTotal = extraBedCount * activeExtraRate * nights;
    const baseSubtotal = defaultRoomRate * nights;
    const totalAmount = baseSubtotal + extraTotal;
    mappedSnapshot = {
      id: 'snp-fb-' + (r.id || Date.now()),
      reservation_id: r.id,
      total_nights: nights,
      base_subtotal: baseSubtotal,
      nightly_breakdown: [],
      discount_amount: 0,
      discount_reason: null,
      promo_code: null,
      promo_snapshot: null,
      extra_charges: extraTotal,
      extra_charges_breakdown: extraBedCount > 0 ? [{
        description: `Ekstra Bed / Kasur Tambahan (${extraBedCount} Unit x ${nights} Malam @ ${formatRupiah(activeExtraRate)})`,
        amount: extraTotal,
      }] : [],
      deposit_required: Math.round(totalAmount * 0.5),
      total_amount: totalAmount,
      total_paid: r.payment_status === 'paid' ? totalAmount : 0,
      balance_due: r.payment_status === 'paid' ? 0 : totalAmount,
      created_at: r.created_at || new Date().toISOString(),
      updated_at: r.updated_at || new Date().toISOString(),
    };
  } else {
    // If snapshot exists, ensure all numbers are properly typed
    const baseSubtotal = Number(mappedSnapshot.base_subtotal) || (defaultRoomRate * nights);
    let extraCharges = Number(mappedSnapshot.extra_charges) || 0;
    let extraBreakdown = Array.isArray(mappedSnapshot.extra_charges_breakdown) ? mappedSnapshot.extra_charges_breakdown : [];

    if (extraCharges === 0 && extraBedCount > 0) {
      extraCharges = extraBedCount * activeExtraRate * nights;
      extraBreakdown = [{
        description: `Ekstra Bed / Kasur Tambahan (${extraBedCount} Unit x ${nights} Malam @ ${formatRupiah(activeExtraRate)})`,
        amount: extraCharges,
      }];
    } else if (extraCharges > 0 && extraBedCount > 0) {
      // Ensure description reflects the actual unit rate accurately without stale hardcoded values
      const calculatedUnitRate = Math.round(extraCharges / (extraBedCount * nights));
      extraBreakdown = [{
        description: `Ekstra Bed / Kasur Tambahan (${extraBedCount} Unit x ${nights} Malam @ ${formatRupiah(calculatedUnitRate)})`,
        amount: extraCharges,
      }];
    }

    const discountAmount = Number(mappedSnapshot.discount_amount) || 0;
    const computedTotal = (baseSubtotal - discountAmount) + extraCharges;
    const totalAmount = Number(mappedSnapshot.total_amount) || computedTotal;
    const totalPaid = Number(mappedSnapshot.total_paid) || (r.payment_status === 'paid' ? totalAmount : 0);
    const balanceDue = r.payment_status === 'paid' ? 0 : (mappedSnapshot.balance_due != null ? Number(mappedSnapshot.balance_due) : Math.max(0, totalAmount - totalPaid));

    mappedSnapshot = {
      ...mappedSnapshot,
      base_subtotal: baseSubtotal,
      extra_charges: extraCharges,
      extra_charges_breakdown: extraBreakdown,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      total_paid: totalPaid,
      balance_due: balanceDue,
    };
  }

  let mappedDeposit = r.deposit;
  if (Array.isArray(mappedDeposit)) {
    mappedDeposit = mappedDeposit[0] || null;
  }

  let mappedGuest = r.guest;
  if (Array.isArray(mappedGuest)) {
    mappedGuest = mappedGuest[0] || null;
  }

  const pref = extractPaymentPreference({
    ...r,
    price_snapshot: mappedSnapshot,
  });

  return {
    ...r,
    guest: mappedGuest,
    rooms: mappedRooms,
    price_snapshot: mappedSnapshot,
    deposit: mappedDeposit,
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
