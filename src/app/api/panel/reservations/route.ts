import { NextRequest, NextResponse } from 'next/server';
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
    const targetId = (id || body.reservationId || '').trim();

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

          const { data: updatedSupabaseData, error: updateError } = await updateQuery.select().maybeSingle();
          if (!updateError && updatedSupabaseData) {
            if (idx !== -1) {
              reservations[idx] = {
                ...reservations[idx],
                status: 'approved_pending_payment',
                approved_at: approvedAt,
                approved_by: approvedBy,
                updated_at: approvedAt,
              };
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

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
