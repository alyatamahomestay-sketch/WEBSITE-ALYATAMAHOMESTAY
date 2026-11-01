import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { PmsService } from '@/lib/services/pms-service';
import { calculateReservationPricing, calculateNights } from '@/lib/pricing';
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

    // Server-side safe price calculation according to rentalType
    const pricing = calculateReservationPricing({
      checkinDateStr: data.checkinDate,
      checkoutDateStr: data.checkoutDate,
      room,
      rentalType: data.rentalType,
      durationUnits: data.durationUnits,
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

    const newResId = 'res-' + Date.now();
    const guestId = 'gst-' + Date.now();

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
        promo_snapshot: null,
        extra_charges: pricing.extraCharges,
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
          const { data: dbGuest } = await adminClient
            .from('guests')
            .insert([{
              full_name: data.fullName,
              phone: data.phone,
              normalized_phone: normalizedPhone,
              email: data.email || null,
            }])
            .select('id')
            .maybeSingle();

          const finalGuestId = dbGuest?.id || guestId;

          // B. Insert Reservation
          const { data: dbRes } = await adminClient
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
              payment_preference: data.paymentPreference,
              special_requests: combinedRequests.trim(),
            }])
            .select('id')
            .maybeSingle();

          const finalResId = dbRes?.id || newResId;

          // C. Insert reservation_rooms
          await adminClient.from('reservation_rooms').insert([{
            reservation_id: finalResId,
            room_id: room.id,
          }]);

          // D. Insert price snapshot
          await adminClient.from('reservation_price_snapshots').insert([{
            reservation_id: finalResId,
            rental_type: data.rentalType,
            duration_units: pricing.durationUnits,
            unit_rate: pricing.unitRate,
            total_nights: pricing.totalNights,
            base_subtotal: pricing.baseSubtotal,
            nightly_breakdown: pricing.nightlyBreakdown,
            discount_amount: 0,
            discount_reason: null,
            promo_code: null,
            promo_snapshot: null,
            extra_charges: pricing.extraCharges,
            deposit_required: pricing.depositRequired,
            total_amount: pricing.totalAmount,
            total_paid: 0,
            balance_due: pricing.totalAmount,
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
