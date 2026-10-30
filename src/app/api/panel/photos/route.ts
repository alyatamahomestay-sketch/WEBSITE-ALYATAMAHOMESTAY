import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';
import { AdvertisementPhoto } from '@/lib/types';
import { INITIAL_AD_PHOTOS } from '@/lib/mock-fallback';

// Persistent in-memory cache for serverless runtime
let serverAdPhotos: AdvertisementPhoto[] = [...INITIAL_AD_PHOTOS];
let serverDeletedIds: string[] = [];

function getSupabase() {
  const admin = createAdminClient();
  if (admin) return admin;
  return createClient();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get('active') === 'true';

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      let query = supabase.from('advertisement_photos').select('*').order('display_order', { ascending: true });
      if (onlyActive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (!error && data) {
        // Filter out any IDs that were explicitly deleted
        const filtered = data.filter((p: AdvertisementPhoto) => !serverDeletedIds.includes(p.id));
        return NextResponse.json({ success: true, photos: filtered });
      }
    }

    // Fallback: server cache with deleted IDs excluded
    let list = serverAdPhotos.filter((p) => !serverDeletedIds.includes(p.id));
    if (onlyActive) {
      list = list.filter((p) => p.is_active);
    }
    list.sort((a, b) => a.display_order - b.display_order);

    return NextResponse.json({ success: true, photos: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'create', photo, id, updates } = body;
    const supabase = getSupabase();

    if (action === 'delete') {
      const targetId = id || body.id;
      if (!targetId) {
        return NextResponse.json({ success: false, error: 'ID foto wajib ditentukan.' }, { status: 400 });
      }

      // Add to server deleted IDs
      if (!serverDeletedIds.includes(targetId)) {
        serverDeletedIds.push(targetId);
      }
      serverAdPhotos = serverAdPhotos.filter((p) => p.id !== targetId);

      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('advertisement_photos').delete().eq('id', targetId);
        if (error) {
          console.warn('Supabase delete photo notice:', error.message);
        }
      }

      return NextResponse.json({ success: true, message: 'Foto berhasil dihapus secara permanen.' });
    }

    if (action === 'update' || action === 'toggle') {
      const targetId = id || body.id;
      const patch = { ...(updates || photo), updated_at: new Date().toISOString() };

      const idx = serverAdPhotos.findIndex((p) => p.id === targetId);
      if (idx !== -1) {
        serverAdPhotos[idx] = { ...serverAdPhotos[idx], ...patch };
      }

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('advertisement_photos')
          .update(patch)
          .eq('id', targetId)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, photo: data });
        }
      }

      const updated = serverAdPhotos.find((p) => p.id === targetId);
      return NextResponse.json({ success: true, photo: updated });
    }

    // Default: Create photo
    const newPhoto: AdvertisementPhoto = {
      ...photo,
      id: photo?.id || 'ad-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Remove from deleted list if re-adding with same ID
    serverDeletedIds = serverDeletedIds.filter((dId) => dId !== newPhoto.id);
    serverAdPhotos.push(newPhoto);

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('advertisement_photos')
        .insert([newPhoto])
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, photo: data });
      }
    }

    return NextResponse.json({ success: true, photo: newPhoto });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
