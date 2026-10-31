import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PmsService } from '@/lib/services/pms-service';
import { calculateReservationPricing, calculateNights } from '@/lib/pricing';
import { normalizeIndonesianPhone, isValidIndonesianPhone } from '@/lib/phone';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';
import { createAdminClient } from '@/lib/supabase/admin';
import { Reservation, RentalType } from '@/lib/types';

// Validation Schema
const bookingFormSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap wajib diisi'),
  phone: z.string().min(9, 'Nomor WhatsApp wajib diisi'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
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

    // Optional promo code evaluation
    let matchedPromo = null;
    if (data.promoCode && data.promoCode.trim()) {
      const allPromos = await PmsService.getPromotions();
      matchedPromo = allPromos.find(
        (p) => p.is_active && p.code?.toUpperCase() === data.promoCode?.trim().toUpperCase()
      ) || null;
    }

    // Server-side safe price calculation according to rentalType
    const pricing = calculateReservationPricing({
      checkinDateStr: data.checkinDate,
      checkoutDateStr: data.checkoutDate,
      room,
      rentalType: data.rentalType,
      durationUnits: data.durationUnits,
      promotion: matchedPromo,
    });

    const normalizedPhone = normalizeIndonesianPhone(data.phone);

    // Generate unique, unpredictable reservation number: ALY-YYYYMMDD-XXXX
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const reservationNumber = `ALY-${dateStamp}-${randomHex}`;

    // If Supabase is configured, insert to Supabase via admin client
    if (isSupabaseConfigured()) {
      const adminClient = createAdminClient();
      if (adminClient) {
        // 1. Upsert or find Guest
        const { data: existingGuest } = await adminClient
          .from('guests')
          .select('id')
          .eq('normalized_phone', normalizedPhone)
          .maybeSingle();

        let guestId = existingGuest?.id;
        if (!guestId) {
          const { data: newGuest, error: guestErr } = await adminClient
            .from('guests')
            .insert([{
              full_name: data.fullName,
              phone: data.phone,
              normalized_phone: normalizedPhone,
              email: data.email || null,
            }])
            .select('id')
            .single();

          if (guestErr) throw new Error(guestErr.message);
          guestId = newGuest.id;
        }

        // 2. Insert Reservation
        const { data: newRes, error: resErr } = await adminClient
          .from('reservations')
          .insert([{
            reservation_number: reservationNumber,
            guest_id: guestId,
            checkin_date: data.checkinDate,
            checkout_date: data.checkoutDate,
            adults: data.adults,
            children: data.children,
            status: 'pending_approval',
            payment_status: 'unpaid',
            special_requests: data.specialRequests ? `${data.specialRequests}${data.marriageConfirmed ? ' [Status Pasangan Suami Istri Terkonfirmasi Syariah]' : ''}` : (data.marriageConfirmed ? '[Status Pasangan Suami Istri Terkonfirmasi Syariah]' : null),
          }])
          .select('id')
          .single();

        if (resErr) throw new Error(resErr.message);

        // 3. Insert reservation_rooms mapping
        await adminClient.from('reservation_rooms').insert([{
          reservation_id: newRes.id,
          room_id: room.id,
        }]);

        // 4. Insert locked price snapshot
        await adminClient.from('reservation_price_snapshots').insert([{
          reservation_id: newRes.id,
          rental_type: data.rentalType,
          duration_units: pricing.durationUnits,
          unit_rate: pricing.unitRate,
          total_nights: pricing.totalNights,
          base_subtotal: pricing.baseSubtotal,
          nightly_breakdown: pricing.nightlyBreakdown,
          discount_amount: pricing.discountAmount,
          discount_reason: pricing.discountReason,
          promo_code: data.promoCode || null,
          promo_snapshot: pricing.promoSnapshot,
          extra_charges: pricing.extraCharges,
          deposit_required: pricing.depositRequired,
          total_amount: pricing.totalAmount,
          total_paid: 0,
          balance_due: pricing.totalAmount,
        }]);

        // 5. Insert separate WhatsApp consent record
        await adminClient.from('whatsapp_consents').insert([{
          reservation_id: newRes.id,
          phone: normalizedPhone,
          has_consented: Boolean(data.whatsappConsent),
          consent_timestamp: new Date().toISOString(),
        }]);

        return NextResponse.json({
          success: true,
          reservationNumber,
          reservationId: newRes.id,
          message: 'Permintaan reservasi berhasil diajukan dan sedang menunggu persetujuan admin.',
        });
      }
    }

    // Fallback: save to interactive memory PMS store
    const memResId = 'res-' + Date.now();
    const fallbackReservation: Reservation = {
      id: memResId,
      reservation_number: reservationNumber,
      guest_id: 'gst-' + Date.now(),
      checkin_date: data.checkinDate,
      checkout_date: data.checkoutDate,
      adults: data.adults,
      children: data.children,
      rental_type: data.rentalType,
      duration_units: pricing.durationUnits,
      status: 'pending_approval',
      payment_status: 'unpaid',
      special_requests: data.specialRequests ? `${data.specialRequests}${data.marriageConfirmed ? ' [Status Pasangan Suami Istri Terkonfirmasi Syariah]' : ''}` : (data.marriageConfirmed ? '[Status Pasangan Suami Istri Terkonfirmasi Syariah]' : null),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      guest: {
        id: 'gst-' + Date.now(),
        full_name: data.fullName,
        phone: data.phone,
        normalized_phone: normalizedPhone,
        email: data.email,
        category: 'regular',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      rooms: [room],
      price_snapshot: {
        id: 'snp-' + Date.now(),
        reservation_id: memResId,
        rental_type: data.rentalType,
        duration_units: pricing.durationUnits,
        unit_rate: pricing.unitRate,
        total_nights: pricing.totalNights,
        base_subtotal: pricing.baseSubtotal,
        nightly_breakdown: pricing.nightlyBreakdown,
        discount_amount: pricing.discountAmount,
        discount_reason: pricing.discountReason,
        promo_code: data.promoCode,
        promo_snapshot: pricing.promoSnapshot,
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
        reservation_id: memResId,
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
        reservation_id: memResId,
        phone: normalizedPhone,
        has_consented: Boolean(data.whatsappConsent),
        consent_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    };

    // Store into in-memory store
    const existingList = await PmsService.getReservations();
    existingList.unshift(fallbackReservation);

    return NextResponse.json({
      success: true,
      reservationNumber,
      reservationId: memResId,
      message: 'Permintaan reservasi berhasil diajukan.',
    });
  } catch (error: any) {
    console.error('Error submitting booking:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan sistem saat memproses pemesanan.' },
      { status: 500 }
    );
  }
}
