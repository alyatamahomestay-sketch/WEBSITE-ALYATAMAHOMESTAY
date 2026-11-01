import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';
import { StaffUser, StaffShift, StaffAccountStatus } from '@/lib/types';
import { INITIAL_STAFF_USERS, INITIAL_STAFF_SHIFTS } from '@/lib/mock-fallback';

const STAFF_FILE_PATH = path.join(process.cwd(), '.server-staff.json');
const SHIFTS_FILE_PATH = path.join(process.cwd(), '.server-shifts.json');

function getSupabaseClient() {
  const adminClient = createAdminClient();
  if (adminClient) return adminClient;
  return createClient();
}

// Helper: load server-persisted staff
function loadStaffFromFile(): StaffUser[] {
  try {
    if (fs.existsSync(STAFF_FILE_PATH)) {
      const data = fs.readFileSync(STAFF_FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading staff file:', e);
  }
  // Initialize with initial staff if file doesn't exist
  saveStaffToFile(INITIAL_STAFF_USERS);
  return [...INITIAL_STAFF_USERS];
}

// Helper: save staff to server file
function saveStaffToFile(staff: StaffUser[]) {
  try {
    fs.writeFileSync(STAFF_FILE_PATH, JSON.stringify(staff, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing staff file:', e);
  }
}

// Helper: load server-persisted shifts
function loadShiftsFromFile(): StaffShift[] {
  try {
    if (fs.existsSync(SHIFTS_FILE_PATH)) {
      const data = fs.readFileSync(SHIFTS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading shifts file:', e);
  }
  return [...INITIAL_STAFF_SHIFTS];
}

// Helper: save shifts to server file
function saveShiftsToFile(shifts: StaffShift[]) {
  try {
    fs.writeFileSync(SHIFTS_FILE_PATH, JSON.stringify(shifts, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing shifts file:', e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const staffUserId = searchParams.get('staff_user_id');

    if (type === 'shifts') {
      let shifts = loadShiftsFromFile();
      if (isSupabaseConfigured()) {
        try {
          const supabase = getSupabaseClient();
          let query = supabase.from('staff_shifts').select('*').order('started_at', { ascending: false });
          if (staffUserId) {
            query = query.eq('staff_user_id', staffUserId);
          }
          const { data, error } = await query;
          if (!error && data && data.length > 0) {
            shifts = data as StaffShift[];
            saveShiftsToFile(shifts);
          }
        } catch (e) {}
      }
      if (staffUserId) {
        shifts = shifts.filter(s => s.staff_user_id === staffUserId);
      }
      shifts.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
      return NextResponse.json({ success: true, shifts });
    }

    // Default: fetch staff users
    let staffUsers = loadStaffFromFile();

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from('staff_users').select('*').order('created_at', { ascending: true });
        if (!error && data && data.length > 0) {
          staffUsers = data as StaffUser[];
          saveStaffToFile(staffUsers);
        } else if (error && error.code === 'PGRST205') {
          // Table doesn't exist yet in Supabase, continue with file storage
          console.warn('Supabase staff_users table not found, using server persistent storage');
        }
      } catch (e) {}
    }

    return NextResponse.json({ success: true, users: staffUsers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'create', user, id, updates, shift, shiftId, notes, staffUserId, staffNameSnapshot } = body;
    const supabase = getSupabaseClient();

    // 1. Shift Management Actions
    if (action === 'start_shift') {
      const shifts = loadShiftsFromFile();
      const newShift: StaffShift = {
        id: 'shift-' + Date.now(),
        staff_user_id: staffUserId,
        staff_name_snapshot: staffNameSnapshot || 'Staf Bertugas',
        started_at: new Date().toISOString(),
        ended_at: null,
        status: 'active',
        date_local: new Date().toISOString().split('T')[0],
        notes: notes || 'Shift Operasional Harian',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      shifts.unshift(newShift);
      saveShiftsToFile(shifts);

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('staff_shifts').insert([newShift]);
        } catch (e) {}
      }
      return NextResponse.json({ success: true, shift: newShift });
    }

    if (action === 'end_shift') {
      const shifts = loadShiftsFromFile();
      const targetId = shiftId || id;
      const idx = shifts.findIndex(s => s.id === targetId);
      let updatedShift: StaffShift | null = null;
      if (idx !== -1) {
        shifts[idx] = {
          ...shifts[idx],
          status: 'ended',
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        updatedShift = shifts[idx];
        saveShiftsToFile(shifts);
      }

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('staff_shifts').update({
            status: 'ended',
            ended_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('id', targetId);
        } catch (e) {}
      }

      return NextResponse.json({ success: true, shift: updatedShift });
    }

    // 2. Staff User Actions
    let staffUsers = loadStaffFromFile();

    if (action === 'create') {
      const userData = user || body;
      const existing = staffUsers.find(
        u => u.username.toLowerCase() === userData.username.toLowerCase() || u.email.toLowerCase() === userData.email.toLowerCase()
      );
      if (existing) {
        return NextResponse.json({ success: false, error: 'Username atau Email sudah terdaftar dalam sistem' }, { status: 400 });
      }

      const newUser: StaffUser = {
        id: userData.id || 'staff-' + Date.now(),
        full_name: userData.full_name,
        username: userData.username.toLowerCase(),
        email: userData.email.toLowerCase(),
        role: userData.role || 'staff',
        status: userData.status || 'ACTIVE',
        password_hash: userData.password_hash || '1234',
        invited_by: userData.invited_by || 'admin-panel',
        last_login_at: userData.last_login_at || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      staffUsers.push(newUser);
      saveStaffToFile(staffUsers);

      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.from('staff_users').insert([newUser]).select().single();
          if (!error && data) {
            const idx = staffUsers.findIndex(u => u.id === newUser.id);
            if (idx !== -1) {
              staffUsers[idx] = data as StaffUser;
              saveStaffToFile(staffUsers);
            }
            return NextResponse.json({ success: true, user: data });
          }
        } catch (e) {}
      }

      return NextResponse.json({ success: true, user: newUser });
    }

    if (action === 'update') {
      const targetId = id || body.id;
      const updateData = updates || body.updates || body;
      const idx = staffUsers.findIndex(u => u.id === targetId);

      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Pengguna staf tidak ditemukan' }, { status: 404 });
      }

      const updatedUser: StaffUser = {
        ...staffUsers[idx],
        ...updateData,
        updated_at: new Date().toISOString(),
      };
      staffUsers[idx] = updatedUser;
      saveStaffToFile(staffUsers);

      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('staff_users')
            .update({ ...updateData, updated_at: new Date().toISOString() })
            .eq('id', targetId)
            .select()
            .single();
          if (!error && data) {
            staffUsers[idx] = data as StaffUser;
            saveStaffToFile(staffUsers);
            return NextResponse.json({ success: true, user: data });
          }
        } catch (e) {}
      }

      return NextResponse.json({ success: true, user: updatedUser });
    }

    if (action === 'delete') {
      const targetId = id || body.id;
      staffUsers = staffUsers.filter(u => u.id !== targetId);
      saveStaffToFile(staffUsers);

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('staff_users').delete().eq('id', targetId);
        } catch (e) {}
      }

      return NextResponse.json({ success: true, message: 'Akun staf berhasil dihapus' });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak valid' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
