import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';
import { Room } from '@/lib/types';
import { INITIAL_ROOMS } from '@/lib/mock-fallback';

const ROOMS_FILE_PATH = path.join(process.cwd(), '.server-rooms.json');

function getSupabaseClient() {
  const adminClient = createAdminClient();
  if (adminClient) return adminClient;
  return createClient();
}

function loadRoomsFromFile(): Room[] {
  try {
    if (fs.existsSync(ROOMS_FILE_PATH)) {
      const data = fs.readFileSync(ROOMS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading rooms file:', e);
  }
  saveRoomsToFile(INITIAL_ROOMS);
  return [...INITIAL_ROOMS];
}

function saveRoomsToFile(rooms: Room[]) {
  try {
    fs.writeFileSync(ROOMS_FILE_PATH, JSON.stringify(rooms, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing rooms file:', e);
  }
}

export async function GET() {
  try {
    let rooms = loadRoomsFromFile();

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .order('room_number', { ascending: true });

        if (!error && data && data.length > 0) {
          rooms = data as Room[];
          saveRoomsToFile(rooms);
        }
      } catch (e) {}
    }

    return NextResponse.json({ success: true, rooms });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'create', room, id, updates } = body;
    const supabase = getSupabaseClient();
    let rooms = loadRoomsFromFile();

    if (action === 'delete') {
      const targetId = id || body.id;
      if (!targetId) {
        return NextResponse.json({ success: false, error: 'ID Kamar wajib ditentukan' }, { status: 400 });
      }

      rooms = rooms.filter(r => r.id !== targetId);
      saveRoomsToFile(rooms);

      if (isSupabaseConfigured()) {
        try {
          const { error: delError } = await supabase.from('rooms').delete().eq('id', targetId);
          if (delError) {
            await supabase
              .from('rooms')
              .update({ is_archived: true, updated_at: new Date().toISOString() })
              .eq('id', targetId);
          }
        } catch (e) {}
      }

      return NextResponse.json({ success: true, message: 'Kamar berhasil dihapus permanen.' });
    }

    if (action === 'archive') {
      const targetId = id || body.id;
      const targetStatus = typeof body.is_archived === 'boolean' ? body.is_archived : true;

      const idx = rooms.findIndex(r => r.id === targetId);
      if (idx !== -1) {
        rooms[idx] = { ...rooms[idx], is_archived: targetStatus, updated_at: new Date().toISOString() };
        saveRoomsToFile(rooms);
      }

      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('rooms')
            .update({ is_archived: targetStatus, updated_at: new Date().toISOString() })
            .eq('id', targetId);
        } catch (e) {}
      }

      return NextResponse.json({ success: true, room: idx !== -1 ? rooms[idx] : null });
    }

    if (action === 'update') {
      const targetId = id || body.id;
      const updatePayload = { ...(updates || room), updated_at: new Date().toISOString() };
      delete updatePayload.id;

      const idx = rooms.findIndex(r => r.id === targetId);
      let updatedRoom: Room | null = null;
      if (idx !== -1) {
        rooms[idx] = { ...rooms[idx], ...updatePayload };
        updatedRoom = rooms[idx];
        saveRoomsToFile(rooms);
      }

      if (isSupabaseConfigured()) {
        try {
          let { data, error } = await supabase
            .from('rooms')
            .update(updatePayload)
            .eq('id', targetId)
            .select()
            .single();

          if (error && (error.message.includes('monthly_rate') || error.message.includes('yearly_rate'))) {
            const sanitized = { ...updatePayload };
            delete sanitized.monthly_rate;
            delete sanitized.yearly_rate;
            const retry = await supabase.from('rooms').update(sanitized).eq('id', targetId).select().single();
            if (retry.data && idx !== -1) {
              rooms[idx] = { ...rooms[idx], ...retry.data, monthly_rate: updatePayload.monthly_rate };
              saveRoomsToFile(rooms);
            }
          } else if (data && idx !== -1) {
            rooms[idx] = data as Room;
            saveRoomsToFile(rooms);
          }
        } catch (e) {}
      }

      if (updatedRoom) {
        return NextResponse.json({ success: true, room: updatedRoom });
      }
      return NextResponse.json({ success: false, error: 'Kamar tidak ditemukan' }, { status: 404 });
    }

    // Default: create
    const newRoom: Room = {
      ...(room || body),
      id: (room && room.id) || 'room-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    rooms.push(newRoom);
    saveRoomsToFile(rooms);

    if (isSupabaseConfigured()) {
      try {
        let { data, error } = await supabase.from('rooms').insert([newRoom]).select().single();
        if (error && (error.message.includes('monthly_rate') || error.message.includes('yearly_rate'))) {
          const sanitized = { ...newRoom };
          delete sanitized.monthly_rate;
          delete sanitized.yearly_rate;
          const retry = await supabase.from('rooms').insert([sanitized]).select().single();
          if (retry.data) {
            const idx = rooms.findIndex(r => r.id === newRoom.id);
            if (idx !== -1) rooms[idx] = { ...newRoom, ...retry.data, monthly_rate: newRoom.monthly_rate };
            saveRoomsToFile(rooms);
          }
        } else if (data) {
          const idx = rooms.findIndex(r => r.id === newRoom.id);
          if (idx !== -1) rooms[idx] = data as Room;
          saveRoomsToFile(rooms);
        }
      } catch (e) {}
    }

    return NextResponse.json({ success: true, room: newRoom });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
