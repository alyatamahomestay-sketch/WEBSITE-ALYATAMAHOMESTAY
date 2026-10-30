import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';
import { Room } from '@/lib/types';

function getSupabaseClient() {
  const adminClient = createAdminClient();
  if (adminClient) return adminClient;
  return createClient();
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, rooms: [] });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rooms: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'create', room, id, updates } = body;
    const supabase = getSupabaseClient();

    if (action === 'delete') {
      const targetId = id || body.id;
      if (!targetId) {
        return NextResponse.json({ success: false, error: 'ID Kamar wajib ditentukan' }, { status: 400 });
      }

      // First try hard delete
      const { error: delError } = await supabase.from('rooms').delete().eq('id', targetId);
      if (delError) {
        // If delete fails due to foreign key constraints, fallback to soft archiving
        const { error: archiveError } = await supabase
          .from('rooms')
          .update({ is_archived: true, updated_at: new Date().toISOString() })
          .eq('id', targetId);

        if (archiveError) {
          return NextResponse.json({ success: false, error: delError.message }, { status: 500 });
        }
        return NextResponse.json({ 
          success: true, 
          message: 'Kamar telah memiliki riwayat reservasi sehingga otomatis diarsipkan agar data tetap aman.',
          archived: true 
        });
      }

      return NextResponse.json({ success: true, message: 'Kamar berhasil dihapus permanen.' });
    }

    if (action === 'archive') {
      const targetId = id || body.id;
      const targetStatus = typeof body.is_archived === 'boolean' ? body.is_archived : true;

      const { data, error } = await supabase
        .from('rooms')
        .update({ is_archived: targetStatus, updated_at: new Date().toISOString() })
        .eq('id', targetId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, room: data });
    }

    if (action === 'update') {
      const targetId = id || body.id;
      const updatePayload = { ...(updates || room), updated_at: new Date().toISOString() };
      delete updatePayload.id; // Prevent updating primary key

      let { data, error } = await supabase
        .from('rooms')
        .update(updatePayload)
        .eq('id', targetId)
        .select()
        .single();

      // Graceful fallback if database schema is missing monthly_rate or yearly_rate columns
      if (error && (error.message.includes('monthly_rate') || error.message.includes('yearly_rate'))) {
        const sanitized = { ...updatePayload };
        delete sanitized.monthly_rate;
        delete sanitized.yearly_rate;

        const retry = await supabase
          .from('rooms')
          .update(sanitized)
          .eq('id', targetId)
          .select()
          .single();

        if (retry.error) {
          return NextResponse.json({ success: false, error: retry.error.message }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          room: retry.data,
          warning: 'Data disimpan tanpa tarif bulanan/tahunan karena kolom belum ada di database Supabase Anda. Silakan jalankan script SQL perbaikan.'
        });
      }

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, room: data });
    }

    // Default: Create Room
    const createPayload = { ...room };
    let { data, error } = await supabase.from('rooms').insert([createPayload]).select().single();

    // Fallback if missing columns on insert
    if (error && (error.message.includes('monthly_rate') || error.message.includes('yearly_rate'))) {
      const sanitized = { ...createPayload };
      delete sanitized.monthly_rate;
      delete sanitized.yearly_rate;

      const retry = await supabase.from('rooms').insert([sanitized]).select().single();
      if (retry.error) {
        return NextResponse.json({ success: false, error: retry.error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        room: retry.data,
        warning: 'Kamar ditambahkan tanpa tarif bulanan/tahunan karena kolom belum ada di database Supabase Anda.'
      });
    }

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, room: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
