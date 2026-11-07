import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PmsService } from '@/lib/services/pms-service';
import { calculateReservationPricing, calculateNights } from '@/lib/pricing';
import { formatRupiah } from '@/lib/formatters';
import { normalizeIndonesianPhone, isValidIndonesianPhone } from '@/lib/phone';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';
import { createAdminClient } from '@/lib/supabase/admin';
import { Reservation, RentalType } from '@/lib/types';
import { getTodayDateWIB } from '@/lib/date-utils';
import { loadReservationsFromFile, saveReservationsToFile } from '@/lib/server-reservations-store';

// Validation Schema
const bookingFormSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap wajib diisi'),
  phone: z.string().min(9, 'Nomor WhatsApp wajib diisi'),
  email: z.string().optional().or(z.literal('')),
  checkinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal check-in tidak valid'),
  checkoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal check-out tidak valid'),
  roomId: z.string().min(1, 'Pilihan kamar wajib ditentukan'),
  rentalType: z.enum(['daily', 'monthly', 'yearly']).default('daily'),
  durationUnits: z.number().int().min(1).optional(),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  extraBedQty: z.number().int().min(0).default(0).optional(),
  extraCharges: z.number().min(0).default(0).optional(),
  marriageConfirmed: z.boolean().optional().default(false),
  promoCode: z.string().optional(),
  specialRequests: z.string().max(500).optional(),
  paymentPreference: z.enum(['cash', 'transfer']).default('cash'),
  dataConsent: z.boolean().refine((val) => val === true, {
    message: 'Anda harus menyetujui pemrosesan data reservasi',
  }),
  whatsappConsent: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Validate phone number
    if (!isValidIndonesianPhone(data.phone)) {
      return NextResponse.json(
        { success: false, message: 'Nomor WhatsApp harus nomor Indonesia yang valid (contoh: 081234567890 atau 082285472008).' },
        { status: 400 }
      );
    }

    // Validate stay duration
    const nights = calculateNights(data.checkinDate, data.checkoutDate);
    if (nights <= 0) {
      return NextResponse.json(
        { success: false, message: 'Tanggal check-out harus lebih besar dari tanggal check-in.' },
        { status: 400 }
      );
    }

    // Retrieve Room
    const room = await PmsService.getRoomById(data.roomId);
    if (!room || room.is_archived) {
      return NextResponse.json(
        { success: false, message: 'Kamar yang dipilih tidak tersedia atau tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (room.operational_status === 'dalam_perawatan' || room.operational_status === 'tidak_dijual_sementara' || room.operational_status === 'ditempati') {
      return NextResponse.json(
        { success: false, message: 'Kamar saat ini berstatus Tidak Tersedia (sedang ditempati tamu atau dalam perawatan) dan belum dapat dipesan sampai tamu check-out.' },
        { status: 400 }
      );
    }

    // Server-side safe price calculation according to rentalType & extra bed
    let extraBedRate = 50000;
    try {
      const extraBedFile = path.join(process.cwd(), '.server-extra-bed.json');
      if (fs.existsSync(extraBedFile)) {
        const extraData = JSON.parse(fs.readFileSync(extraBedFile, 'utf8'));
        if (extraData && typeof extraData.extra_bed_rate === 'number' && extraData.extra_bed_rate >= 0) {
          extraBedRate = Number(extraData.extra_bed_rate);
        }
      } else {
        const propFilePath = path.join(process.cwd(), '.server-property.json');
        if (fs.existsSync(propFilePath)) {
          const propData = JSON.parse(fs.readFileSync(propFilePath, 'utf8'));
          if (propData && propData.extra_bed_rate !== undefined && Number(propData.extra_bed_rate) >= 0) {
            extraBedRate = Number(propData.extra_bed_rate);
          }
        }
      }
    } catch (e) {}

    const extraBedCount = data.extraBedQty || 0;
    const calculatedExtraCharges = extraBedCount > 0 ? (extraBedCount * extraBedRate * nights) : (data.extraCharges || 0);

    const pricing = calculateReservationPricing({
      checkinDateStr: data.checkinDate,
      checkoutDateStr: data.checkoutDate,
      room,
      rentalType: data.rentalType,
      durationUnits: data.durationUnits,
      extraCharges: calculatedExtraCharges,
      promotion: null,
    });

    const normalizedPhone = normalizeIndonesianPhone(data.phone);

    // =====================================================================
    // 5. GENERATE NOMOR ANTREAN RESERVASI TERSTRUKTUR & BERURUTAN (SEQUENTIAL)
    // Format: ALY-YYYYMMDD-001, ALY-YYYYMMDD-002, dst. (berdasarkan tanggal WIB)
    // =====================================================================
    const dateStamp = getTodayDateWIB().replace(/-/g, '');
    const prefix = `ALY-${dateStamp}-`;

    const currentReservations = loadReservationsFromFile();
    let maxSequence = 0;
    currentReservations.forEach((r) => {
      if (r.reservation_number && r.reservation_number.startsWith(prefix)) {
        const parts = r.reservation_number.split('-');
        if (parts.length >= 3) {
          const seq = parseInt(parts[2], 10);
          if (!isNaN(seq) && seq > maxSequence) {
            maxSequence = seq;
          }
        }
      }
    });

    // Periksa juga nomor sequence yang ada di Supabase agar nomor selalu berurutan
    if (isSupabaseConfigured()) {
      try {
        const adminClient = createAdminClient();
        if (adminClient) {
          const { data: dbResList } = await adminClient
            .from('reservations')
            .select('reservation_number')
            .like('reservation_number', `${prefix}%`);
          if (dbResList) {
            dbResList.forEach((r) => {
              if (r.reservation_number) {
                const parts = r.reservation_number.split('-');
                if (parts.length >= 3) {
                  const seq = parseInt(parts[2], 10);
                  if (!isNaN(seq) && seq > maxSequence) {
                    maxSequence = seq;
                  }
                }
              }
            });
          }
        }
      } catch (e) {
        console.warn('Error checking supabase sequences:', e);
      }
    }

    const nextSeqNumber = maxSequence + 1;
    const reservationNumber = `${prefix}${String(nextSeqNumber).padStart(3, '0')}`;

    // Payment preference label
    const paymentLabel = data.paymentPreference === 'transfer'
      ? 'Transfer Rekening Bank Resmi ALYATAMA'
      : 'Bayar Tunai (Cash di Tempat)';

    const paymentNotice = `[Metode Pembayaran: ${paymentLabel} - Pembayaran dilakukan sebelum serah terima kunci]`;

    let combinedRequests = '';
    if (data.specialRequests && data.specialRequests.trim()) {
      combinedRequests += data.specialRequests.trim() + ' ';
    }
    if (data.marriageConfirmed) {
      combinedRequests += '[Status Pasangan Suami Istri Terkonfirmasi Syariah] ';
    }
    combinedRequests += paymentNotice;

    const newResId = crypto.randomUUID();
    const guestId = crypto.randomUUID();

    // Full reservation entity
    const newReservation: Reservation = {
      id: newResId,
      reservation_number: reservationNumber,
      guest_id: guestId,
      payment_preference: data.paymentPreference,
      checkin_date: data.checkinDate,
      checkout_date: data.checkoutDate,
      adults: data.adults,
      children: data.children,
      rental_type: data.rentalType,
      duration_units: pricing.durationUnits,
      status: 'pending_approval',
      payment_status: 'unpaid',
      special_requests: combinedRequests.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      guest: {
        id: guestId,
        full_name: data.fullName,
        phone: data.phone,
        normalized_phone: normalizedPhone,
        email: data.email || null,
        category: 'regular',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      rooms: [room],
      price_snapshot: {
        id: 'snp-' + Date.now(),
        reservation_id: newResId,
        rental_type: data.rentalType,
        duration_units: pricing.durationUnits,
        unit_rate: pricing.unitRate,
        total_nights: pricing.totalNights,
        base_subtotal: pricing.baseSubtotal,
        nightly_breakdown: pricing.nightlyBreakdown,
        discount_amount: 0,
        discount_reason: null,
        promo_code: null,
        promo_snapshot: {
          rental_type: data.rentalType,
          duration_units: pricing.durationUnits,
          unit_rate: pricing.unitRate,
          payment_preference: data.paymentPreference,
        },
        extra_charges: pricing.extraCharges,
        extra_charges_breakdown: extraBedCount > 0 ? [{
          description: `Ekstra Bed / Kasur Tambahan (${extraBedCount} Unit x ${nights} Malam @ ${formatRupiah(extraBedRate)})`,
          amount: calculatedExtraCharges,
        }] : [],
        deposit_required: pricing.depositRequired,
        total_amount: pricing.totalAmount,
        total_paid: 0,
        balance_due: pricing.totalAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      deposit: {
        id: 'dep-' + Date.now(),
        reservation_id: newResId,
        required_amount: pricing.depositRequired,
        received_amount: 0,
        deducted_amount: 0,
        refunded_amount: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      whatsapp_consent: {
        id: 'wac-' + Date.now(),
        reservation_id: newResId,
        phone: normalizedPhone,
        has_consented: true,
        consent_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    };

    // 1. Save immediately to persistent server storage so it is NEVER lost
    currentReservations.unshift(newReservation);
    saveReservationsToFile(currentReservations);

    // 2. Also try inserting into Supabase via admin client
    if (isSupabaseConfigured()) {
      try {
        const adminClient = createAdminClient();
        if (adminClient) {
          // A. Insert Guest
          const { data: dbGuest, error: guestErr } = await adminClient
            .from('guests')
            .insert([{
              id: guestId,
              full_name: data.fullName,
              phone: data.phone,
              normalized_phone: normalizedPhone,
              email: data.email || null,
            }])
            .select('id')
            .maybeSingle();

          if (guestErr) {
            console.error('Guest insert error in Supabase:', guestErr);
          }

          const finalGuestId = dbGuest?.id || guestId;

          // B. Insert Reservation
          const { data: dbRes, error: resErr } = await adminClient
            .from('reservations')
            .insert([{
              id: newResId,
              reservation_number: reservationNumber,
              guest_id: finalGuestId,
              checkin_date: data.checkinDate,
              checkout_date: data.checkoutDate,
              adults: data.adults,
              children: data.children,
              status: 'pending_approval',
              payment_status: 'unpaid',
              special_requests: combinedRequests.trim(),
            }])
            .select('id')
            .maybeSingle();

          if (resErr) {
            console.error('Reservation insert error in Supabase:', resErr);
          }

          const finalResId = dbRes?.id || newResId;

          // C. Insert reservation_rooms
          const { error: rrErr } = await adminClient.from('reservation_rooms').insert([{
            reservation_id: finalResId,
            room_id: room.id,
          }]);
          if (rrErr) {
            console.error('reservation_rooms insert error in Supabase:', rrErr);
          }

          // D. Insert price snapshot (storing rental_type and duration_units inside promo_snapshot)
          const { error: priceErr } = await adminClient.from('reservation_price_snapshots').insert([{
            reservation_id: finalResId,
            total_nights: pricing.totalNights,
            base_subtotal: pricing.baseSubtotal,
            nightly_breakdown: pricing.nightlyBreakdown,
            discount_amount: 0,
            discount_reason: null,
            promo_code: null,
            promo_snapshot: {
              rental_type: data.rentalType,
              duration_units: pricing.durationUnits,
              unit_rate: pricing.unitRate,
              payment_preference: data.paymentPreference,
            },
            extra_charges: pricing.extraCharges,
            extra_charges_breakdown: extraBedCount > 0 ? [{
              description: `Ekstra Bed / Kasur Tambahan (${extraBedCount} Unit x ${nights} Malam @ ${formatRupiah(extraBedRate)})`,
              amount: calculatedExtraCharges,
            }] : [],
            deposit_required: pricing.depositRequired,
            total_amount: pricing.totalAmount,
            total_paid: 0,
            balance_due: pricing.totalAmount,
          }]);
          if (priceErr) {
            console.error('price_snapshot insert error in Supabase:', priceErr);
          }

          // E. Insert deposit if required
          if (pricing.depositRequired > 0) {
            await adminClient.from('deposits').insert([{
              reservation_id: finalResId,
              required_amount: pricing.depositRequired,
              received_amount: 0,
              deducted_amount: 0,
              refunded_amount: 0,
              status: 'pending',
            }]);
          }

          // F. Insert whatsapp_consent
          await adminClient.from('whatsapp_consents').insert([{
            reservation_id: finalResId,
            phone: normalizedPhone,
            has_consented: true,
            consent_timestamp: new Date().toISOString(),
          }]);
        }
      } catch (err: any) {
        console.warn('Supabase reservation sync warning (local persistent file saved):', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      reservationNumber,
      reservationId: newResId,
      reservation: newReservation,
      message: 'Permintaan reservasi berhasil diajukan dan sedang menunggu persetujuan admin.',
    });
  } catch (error: any) {
    console.error('Error submitting booking:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan sistem saat memproses pemesanan.' },
      { status: 500 }
    );
  }
}
