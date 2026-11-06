import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';
import { Reservation, Room } from '@/lib/types';
import {
  loadReservationsFromFile,
  saveReservationsToFile,
  normalizeReservation,
} from '@/lib/server-reservations-store';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const adminClient = createAdminClient();
  if (adminClient) return adminClient;
  return createClient();
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function transformSupabaseRecord(item: any): Reservation {
  let mappedRooms: Room[] = [];
  if (Array.isArray(item.rooms)) {
    mappedRooms = item.rooms.map((rr: any) => rr?.room || rr).filter(Boolean);
  }

  let mappedSnapshot = item.price_snapshot;
  if (Array.isArray(mappedSnapshot)) {
    mappedSnapshot = mappedSnapshot[0] || null;
  }

  // Jika price snapshot di Supabase belum ada atau null, sediakan fallback kalkulasi aman
  if (!mappedSnapshot) {
    const defaultRoomRate = mappedRooms[0]?.base_rate || 150000;
    mappedSnapshot = {
      id: 'snp-fb-' + item.id,
      reservation_id: item.id,
      total_nights: 1,
      base_subtotal: defaultRoomRate,
      nightly_breakdown: [],
      discount_amount: 0,
      discount_reason: null,
      promo_code: null,
      promo_snapshot: null,
      extra_charges: 0,
      deposit_required: 0,
      total_amount: defaultRoomRate,
      total_paid: item.payment_status === 'paid' ? defaultRoomRate : 0,
      balance_due: item.payment_status === 'paid' ? 0 : defaultRoomRate,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }

  let mappedDeposit = item.deposit;
  if (Array.isArray(mappedDeposit)) {
    mappedDeposit = mappedDeposit[0] || null;
  }

  let mappedGuest = item.guest;
  if (Array.isArray(mappedGuest)) {
    mappedGuest = mappedGuest[0] || null;
  }

  return {
    ...item,
    guest: mappedGuest,
    rooms: mappedRooms,
    price_snapshot: mappedSnapshot,
    deposit: mappedDeposit,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const resNum = searchParams.get('res_num');
    const status = searchParams.get('status');

    let reservations = loadReservationsFromFile().map(normalizeReservation);

    // 1. Fetch from Supabase as primary source of truth
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        let query = supabase
          .from('reservations')
          .select(`
            *,
            guest:guests(*),
            rooms:reservation_rooms(room:rooms(*)),
            price_snapshot:reservation_price_snapshots(*),
            payments:payments(*),
            deposit:deposits(*),
            whatsapp_consent:whatsapp_consents(*)
          `)
          .order('created_at', { ascending: false });

        const searchCode = (id || resNum || '').trim();
        if (searchCode) {
          if (UUID_REGEX.test(searchCode)) {
            query = query.eq('id', searchCode);
          } else {
            query = query.eq('reservation_number', searchCode.toUpperCase());
          }
        } else if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const remoteList = data.map(transformSupabaseRecord);

          // Merge Supabase records with local file cache
          const idMap = new Map<string, Reservation>();
          // Remote data takes precedence
          remoteList.forEach((r) => idMap.set(r.id, r));
          reservations.forEach((r) => {
            if (!idMap.has(r.id)) idMap.set(r.id, r);
          });

          reservations = Array.from(idMap.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          saveReservationsToFile(reservations);
        }
      } catch (e) {
        console.warn('Supabase query warning in GET /api/panel/reservations:', e);
      }
    }

    // If querying specific id or reservation_number
    const targetCode = (id || resNum || '').trim().toUpperCase();
    if (targetCode) {
      const found = reservations.find(
        (r) =>
          (r.id && r.id.toUpperCase() === targetCode) ||
          (r.reservation_number && r.reservation_number.toUpperCase() === targetCode)
      );
      if (found) {
        return NextResponse.json({ success: true, reservation: found });
      }
      return NextResponse.json({ success: false, error: 'Nomor reservasi tidak ditemukan' }, { status: 404 });
    }

    // Filter by status if specified
    if (status && status !== 'all') {
      const filtered = reservations.filter((r) => r.status === status);
      return NextResponse.json({ success: true, reservations: filtered });
    }

    return NextResponse.json({ success: true, reservations });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'approve', id, reason, adminId, status } = body;
    const targetId = (id || body.reservationId || body.reservationNumber || body.res_num || '').trim();

    if (!targetId && action !== 'create') {
      return NextResponse.json({ success: false, error: 'ID Reservasi wajib disertakan' }, { status: 400 });
    }

    let reservations = loadReservationsFromFile().map(normalizeReservation);
    const supabase = getSupabaseClient();
    const isTargetUuid = UUID_REGEX.test(targetId);

    // If reservations cache is empty or target not found, query Supabase directly
    let idx = reservations.findIndex(
      (r) =>
        (r.id && r.id.toLowerCase() === targetId.toLowerCase()) ||
        (r.reservation_number && r.reservation_number.toUpperCase() === targetId.toUpperCase())
    );

    if (idx === -1 && isSupabaseConfigured()) {
      try {
        let fetchQuery = supabase
          .from('reservations')
          .select(`
            *,
            guest:guests(*),
            rooms:reservation_rooms(room:rooms(*)),
            price_snapshot:reservation_price_snapshots(*),
            payments:payments(*),
            deposit:deposits(*),
            whatsapp_consent:whatsapp_consents(*)
          `);

        if (isTargetUuid) {
          fetchQuery = fetchQuery.eq('id', targetId);
        } else {
          fetchQuery = fetchQuery.eq('reservation_number', targetId.toUpperCase());
        }

        const { data } = await fetchQuery.maybeSingle();
        if (data) {
          const norm = transformSupabaseRecord(data);
          reservations.unshift(norm);
          idx = 0;
        }
      } catch (e) {
        console.warn('Supabase fetch query warning in POST:', e);
      }
    }

    if (action === 'approve') {
      const approvedAt = new Date().toISOString();
      const approvedBy = adminId || 'Administrator';

      // 1. Update in Supabase immediately
      if (isSupabaseConfigured()) {
        try {
          const isApprovedByUuid = adminId && UUID_REGEX.test(adminId);
          let updateQuery = supabase
            .from('reservations')
            .update({
              status: 'approved_pending_payment',
              approved_at: approvedAt,
              approved_by: isApprovedByUuid ? adminId : null,
              updated_at: approvedAt,
            });

          if (isTargetUuid) {
            updateQuery = updateQuery.eq('id', targetId);
          } else {
            updateQuery = updateQuery.eq('reservation_number', targetId.toUpperCase());
          }

          const { data: updatedSupabaseData, error: updateError } = await updateQuery
            .select(`
              *,
              guest:guests(*),
              rooms:reservation_rooms(room:rooms(*)),
              price_snapshot:reservation_price_snapshots(*),
              payments:payments(*),
              deposit:deposits(*),
              whatsapp_consent:whatsapp_consents(*)
            `)
            .maybeSingle();

          if (!updateError && updatedSupabaseData) {
            const transformed = transformSupabaseRecord(updatedSupabaseData);
            if (idx !== -1) {
              reservations[idx] = transformed;
            } else {
              reservations.unshift(transformed);
              idx = 0;
            }
          }
        } catch (e) {
          console.warn('Supabase approve update error:', e);
        }
      }

      // 2. Update local file storage
      if (idx !== -1) {
        reservations[idx] = {
          ...reservations[idx],
          status: 'approved_pending_payment',
          approved_at: approvedAt,
          approved_by: approvedBy,
          updated_at: approvedAt,
        };
        saveReservationsToFile(reservations);

        return NextResponse.json({
          success: true,
          message: 'Status reservasi berhasil disetujui! Status kini Menunggu Pembayaran / DP.',
          reservation: reservations[idx],
        });
      }

      // If idx is still -1, check if caller provided reservation object
      if (body.reservation) {
        const newApprovedRes = {
          ...body.reservation,
          status: 'approved_pending_payment',
          approved_at: approvedAt,
          approved_by: approvedBy,
          updated_at: approvedAt,
        };
        reservations.unshift(newApprovedRes);
        saveReservationsToFile(reservations);

        return NextResponse.json({
          success: true,
          message: 'Status reservasi berhasil disetujui! Status kini Menunggu Pembayaran / DP.',
          reservation: newApprovedRes,
        });
      }

      return NextResponse.json({ success: false, error: 'Reservasi tidak ditemukan' }, { status: 404 });
    }

    if (action === 'reject') {
      const rejectedAt = new Date().toISOString();
      const rejReason = reason || 'Kamar penuh pada tanggal yang dipilih';

      if (isSupabaseConfigured()) {
        try {
          let updateQuery = supabase
            .from('reservations')
            .update({
              status: 'rejected',
              rejected_at: rejectedAt,
              rejected_reason: rejReason,
              updated_at: rejectedAt,
            });

          if (isTargetUuid) {
            updateQuery = updateQuery.eq('id', targetId);
          } else {
            updateQuery = updateQuery.eq('reservation_number', targetId.toUpperCase());
          }

          await updateQuery;
        } catch (e) {}
      }

      if (idx !== -1) {
        reservations[idx] = {
          ...reservations[idx],
          status: 'rejected',
          rejected_at: rejectedAt,
          rejected_reason: rejReason,
          updated_at: rejectedAt,
        };
        saveReservationsToFile(reservations);

        return NextResponse.json({
          success: true,
          message: 'Reservasi ditolak.',
          reservation: reservations[idx],
        });
      }

      return NextResponse.json({ success: false, error: 'Reservasi tidak ditemukan' }, { status: 404 });
    }

    if (action === 'create') {
      const rawRes = body.reservation;
      if (!rawRes) {
        return NextResponse.json({ success: false, error: 'Data reservasi tidak lengkap' }, { status: 400 });
      }

      const resId = (rawRes.id && UUID_REGEX.test(rawRes.id)) ? rawRes.id : crypto.randomUUID();
      const guestId = (rawRes.guest?.id && UUID_REGEX.test(rawRes.guest.id)) ? rawRes.guest.id : crypto.randomUUID();

      const newReservation: Reservation = {
        ...rawRes,
        id: resId,
        guest_id: guestId,
        guest: rawRes.guest ? {
          ...rawRes.guest,
          id: guestId,
        } : undefined,
      };

      // 1. Save to local server file store
      reservations.unshift(newReservation);
      saveReservationsToFile(reservations);

      // 2. Persist to Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const adminClient = getSupabaseClient();
          // A. Insert Guest
          if (newReservation.guest) {
            await adminClient.from('guests').insert([{
              id: guestId,
              full_name: newReservation.guest.full_name,
              phone: newReservation.guest.phone,
              normalized_phone: newReservation.guest.normalized_phone || newReservation.guest.phone.replace(/\D/g, ''),
              email: newReservation.guest.email || null,
            }]);
          }

          // B. Insert Reservation
          await adminClient.from('reservations').insert([{
            id: resId,
            reservation_number: newReservation.reservation_number,
            guest_id: guestId,
            checkin_date: newReservation.checkin_date,
            checkout_date: newReservation.checkout_date,
            adults: newReservation.adults || 1,
            children: newReservation.children || 0,
            status: newReservation.status || 'confirmed',
            payment_status: newReservation.payment_status || 'unpaid',
            special_requests: newReservation.special_requests || null,
          }]);

          // C. Insert reservation_rooms
          if (newReservation.rooms && newReservation.rooms[0]?.id) {
            await adminClient.from('reservation_rooms').insert([{
              reservation_id: resId,
              room_id: newReservation.rooms[0].id,
            }]);
          }

          // D. Insert price snapshot
          const snap = newReservation.price_snapshot;
          if (snap) {
            await adminClient.from('reservation_price_snapshots').insert([{
              reservation_id: resId,
              total_nights: snap.total_nights || 1,
              base_subtotal: snap.base_subtotal || 0,
              nightly_breakdown: snap.nightly_breakdown || [],
              discount_amount: snap.discount_amount || 0,
              promo_snapshot: {
                rental_type: snap.rental_type || newReservation.rental_type || 'daily',
                duration_units: snap.duration_units || newReservation.duration_units || 1,
              },
              extra_charges: snap.extra_charges || 0,
              deposit_required: snap.deposit_required || 0,
              total_amount: snap.total_amount || 0,
              total_paid: snap.total_paid || 0,
              balance_due: snap.balance_due || 0,
            }]);
          }

          // E. Insert payments if any
          if (Array.isArray(newReservation.payments) && newReservation.payments.length > 0) {
            for (const p of newReservation.payments) {
              const payId = (p.id && UUID_REGEX.test(p.id)) ? p.id : crypto.randomUUID();
              await adminClient.from('payments').insert([{
                id: payId,
                payment_number: p.payment_number,
                reservation_id: resId,
                amount: p.amount,
                payment_method: p.payment_method || 'cash',
                payment_date: p.payment_date || new Date().toISOString(),
                status: p.status || 'verified',
                notes: p.notes || '',
              }]);
            }
          }
        } catch (e) {
          console.warn('Supabase walk-in insert error:', e);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Reservasi berhasil dibuat dan disimpan permanen.',
        reservation: newReservation,
      });
    }

    if (action === 'update_status') {
      const newStatus = (status || body.newStatus || '').trim();
      if (!newStatus) {
        return NextResponse.json({ success: false, error: 'Status baru wajib ditentukan' }, { status: 400 });
      }

      const now = new Date().toISOString();
      const patch: any = {
        status: newStatus,
        updated_at: now,
      };

      if (newStatus === 'checked_in') {
        patch.checked_in_at = body.checkedInAt || now;
      }
      if (newStatus === 'checked_out') {
        patch.checked_out_at = body.checkedOutAt || now;
      }

      // 1. Update in Supabase
      if (isSupabaseConfigured()) {
        try {
          let updateQuery = supabase.from('reservations').update(patch);
          if (isTargetUuid) {
            updateQuery = updateQuery.eq('id', targetId);
          } else {
            updateQuery = updateQuery.eq('reservation_number', targetId.toUpperCase());
          }
          await updateQuery;

          // If checked in or out, update room operational status
          const targetRes = idx !== -1 ? reservations[idx] : null;
          const roomId = targetRes?.rooms?.[0]?.id;
          if (roomId) {
            if (newStatus === 'checked_in') {
              await supabase.from('rooms').update({ operational_status: 'ditempati', updated_at: now }).eq('id', roomId);
            } else if (newStatus === 'checked_out') {
              await supabase.from('rooms').update({ operational_status: 'tersedia', updated_at: now }).eq('id', roomId);
            }
          }
        } catch (e) {
          console.warn('Supabase status update error:', e);
        }
      }

      // 2. Update in local file store
      if (idx !== -1) {
        reservations[idx] = {
          ...reservations[idx],
          ...patch,
        };
        saveReservationsToFile(reservations);

        return NextResponse.json({
          success: true,
          message: `Status reservasi berhasil diubah menjadi ${newStatus}.`,
          reservation: reservations[idx],
        });
      }

      return NextResponse.json({ success: false, error: 'Reservasi tidak ditemukan' }, { status: 404 });
    }

    if (action === 'add_payment') {
      const { amount, paymentMethod, notes, referenceNumber } = body;
      const numAmount = Number(amount) || 0;
      if (numAmount <= 0) {
        return NextResponse.json({ success: false, error: 'Nominal pembayaran harus lebih besar dari 0' }, { status: 400 });
      }

      const now = new Date().toISOString();
      const payId = crypto.randomUUID();
      const payNum = 'PAY-' + Date.now();

      const newPay: any = {
        id: payId,
        payment_number: payNum,
        reservation_id: targetId,
        amount: numAmount,
        payment_method: paymentMethod || 'cash',
        payment_date: now,
        status: 'verified',
        notes: notes || '',
        reference_number: referenceNumber || '',
        created_at: now,
        updated_at: now,
      };

      // 1. Save to Supabase
      if (isSupabaseConfigured()) {
        try {
          const resUuid = isTargetUuid ? targetId : (idx !== -1 ? reservations[idx].id : targetId);
          newPay.reservation_id = resUuid;

          await supabase.from('payments').insert([newPay]);

          // Calculate new total_paid
          const { data: dbPayments } = await supabase.from('payments').select('amount').eq('reservation_id', resUuid);
          const totalPaid = dbPayments ? dbPayments.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0) : numAmount;

          // Get snapshot total
          const { data: dbSnap } = await supabase.from('reservation_price_snapshots').select('total_amount').eq('reservation_id', resUuid).maybeSingle();
          const totalAmount = dbSnap?.total_amount || (idx !== -1 ? (reservations[idx].price_snapshot?.total_amount || 0) : 0);
          const balanceDue = Math.max(0, totalAmount - totalPaid);

          // Update price snapshot in Supabase
          await supabase.from('reservation_price_snapshots').update({
            total_paid: totalPaid,
            balance_due: balanceDue,
            updated_at: now,
          }).eq('reservation_id', resUuid);

          // Update reservation payment status
          const newPayStatus = balanceDue === 0 ? 'paid' : (totalPaid > 0 ? 'partially_paid' : 'unpaid');
          const resPatch: any = { payment_status: newPayStatus, updated_at: now };
          if (newPayStatus === 'paid' && idx !== -1 && reservations[idx].status === 'approved_pending_payment') {
            resPatch.status = 'confirmed';
          }
          await supabase.from('reservations').update(resPatch).eq('id', resUuid);
        } catch (e) {
          console.warn('Supabase payment insert error:', e);
        }
      }

      // 2. Update local file store
      if (idx !== -1) {
        if (!reservations[idx].payments) reservations[idx].payments = [];
        reservations[idx].payments!.push(newPay);

        if (reservations[idx].price_snapshot) {
          reservations[idx].price_snapshot!.total_paid = (reservations[idx].price_snapshot!.total_paid || 0) + numAmount;
          reservations[idx].price_snapshot!.balance_due = Math.max(0, (reservations[idx].price_snapshot!.total_amount || 0) - reservations[idx].price_snapshot!.total_paid);
          if (reservations[idx].price_snapshot!.balance_due === 0) {
            reservations[idx].payment_status = 'paid';
            if (reservations[idx].status === 'approved_pending_payment') {
              reservations[idx].status = 'confirmed';
            }
          } else {
            reservations[idx].payment_status = 'partially_paid';
          }
        }
        reservations[idx].updated_at = now;
        saveReservationsToFile(reservations);

        return NextResponse.json({
          success: true,
          message: 'Pembayaran berhasil dicatat dan saldo diperbarui.',
          reservation: reservations[idx],
          payment: newPay,
        });
      }

      return NextResponse.json({ success: true, message: 'Pembayaran berhasil disimpan.', payment: newPay });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
