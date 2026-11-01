import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';
import { Reservation } from '@/lib/types';
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const resNum = searchParams.get('res_num');
    const status = searchParams.get('status');

    let reservations = loadReservationsFromFile().map(normalizeReservation);

    // Merge Supabase data if configured
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

        if (id) {
          query = query.or(`id.eq.${id},reservation_number.eq.${id}`);
        } else if (resNum) {
          query = query.eq('reservation_number', resNum);
        } else if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const remoteList = data.map(normalizeReservation);
          const idMap = new Map<string, Reservation>();
          // Priority to fresh updates from remote
          remoteList.forEach((r) => idMap.set(r.id, r));
          reservations.forEach((r) => {
            if (!idMap.has(r.id)) idMap.set(r.id, r);
          });
          reservations = Array.from(idMap.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          saveReservationsToFile(reservations);
        }
      } catch (e) {}
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
    let idx = reservations.findIndex(
      (r) =>
        (r.id && r.id.toLowerCase() === targetId.toLowerCase()) ||
        (r.reservation_number && r.reservation_number.toUpperCase() === targetId.toUpperCase())
    );

    const supabase = getSupabaseClient();

    // If not found in file, try finding from Supabase
    if (idx === -1 && isSupabaseConfigured()) {
      try {
        const { data } = await supabase
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
          .or(`id.eq.${targetId},reservation_number.eq.${targetId}`)
          .maybeSingle();

        if (data) {
          const norm = normalizeReservation(data);
          reservations.unshift(norm);
          idx = 0;
        }
      } catch (e) {}
    }

    if (action === 'approve') {
      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Reservasi tidak ditemukan' }, { status: 404 });
      }

      reservations[idx] = {
        ...reservations[idx],
        status: 'approved_pending_payment',
        approved_at: new Date().toISOString(),
        approved_by: adminId || 'Administrator',
        updated_at: new Date().toISOString(),
      };
      saveReservationsToFile(reservations);

      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('reservations')
            .update({
              status: 'approved_pending_payment',
              approved_at: new Date().toISOString(),
              approved_by: adminId || 'Administrator',
              updated_at: new Date().toISOString(),
            })
            .eq('id', reservations[idx].id);
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        message: 'Status reservasi berhasil disetujui! Status kini Menunggu Pembayaran / DP.',
        reservation: reservations[idx],
      });
    }

    if (action === 'reject') {
      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Reservasi tidak ditemukan' }, { status: 404 });
      }

      reservations[idx] = {
        ...reservations[idx],
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_reason: reason || 'Kamar penuh pada tanggal yang dipilih',
        updated_at: new Date().toISOString(),
      };
      saveReservationsToFile(reservations);

      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('reservations')
            .update({
              status: 'rejected',
              rejected_at: new Date().toISOString(),
              rejected_reason: reason || 'Kamar penuh pada tanggal yang dipilih',
              updated_at: new Date().toISOString(),
            })
            .eq('id', reservations[idx].id);
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        message: 'Reservasi ditolak.',
        reservation: reservations[idx],
      });
    }

    if (action === 'update_status') {
      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Reservasi tidak ditemukan' }, { status: 404 });
      }

      reservations[idx] = {
        ...reservations[idx],
        status: status || reservations[idx].status,
        updated_at: new Date().toISOString(),
      };
      saveReservationsToFile(reservations);

      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('reservations')
            .update({
              status: status || reservations[idx].status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', reservations[idx].id);
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        message: 'Status reservasi berhasil diperbarui.',
        reservation: reservations[idx],
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
