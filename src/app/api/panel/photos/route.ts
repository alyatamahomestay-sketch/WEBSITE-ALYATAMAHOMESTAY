import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';
import { AdvertisementPhoto } from '@/lib/types';
import { INITIAL_AD_PHOTOS } from '@/lib/mock-fallback';

const PHOTOS_FILE_PATH = path.join(process.cwd(), '.server-photos.json');

function getSupabase() {
  const admin = createAdminClient();
  if (admin) return admin;
  return createClient();
}

function loadPhotosFromFile(): AdvertisementPhoto[] {
  try {
    if (fs.existsSync(PHOTOS_FILE_PATH)) {
      const data = fs.readFileSync(PHOTOS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading photos file:', e);
  }
  savePhotosToFile(INITIAL_AD_PHOTOS);
  return [...INITIAL_AD_PHOTOS];
}

function savePhotosToFile(photos: AdvertisementPhoto[]) {
  try {
    fs.writeFileSync(PHOTOS_FILE_PATH, JSON.stringify(photos, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing photos file:', e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get('active') === 'true';

    let photos = loadPhotosFromFile();

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        let query = supabase.from('advertisement_photos').select('*').order('display_order', { ascending: true });
        if (onlyActive) {
          query = query.eq('is_active', true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          photos = data as AdvertisementPhoto[];
          savePhotosToFile(photos);
        }
      } catch (e) {}
    }

    if (onlyActive) {
      photos = photos.filter(p => p.is_active);
    }
    photos.sort((a, b) => a.display_order - b.display_order);

    return NextResponse.json({ success: true, photos });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'create', photo, id, updates } = body;
    const supabase = getSupabase();

    let photos = loadPhotosFromFile();

    if (action === 'delete') {
      const targetId = id || body.id;
      if (!targetId) {
        return NextResponse.json({ success: false, error: 'ID foto wajib ditentukan.' }, { status: 400 });
      }

      photos = photos.filter(p => p.id !== targetId);
      savePhotosToFile(photos);

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('advertisement_photos').delete().eq('id', targetId);
        } catch (e) {}
      }

      return NextResponse.json({ success: true, message: 'Foto berhasil dihapus secara permanen.' });
    }

    if (action === 'update' || action === 'toggle') {
      const targetId = id || body.id;
      const patch = { ...(updates || photo), updated_at: new Date().toISOString() };

      const idx = photos.findIndex(p => p.id === targetId);
      let updatedPhoto: AdvertisementPhoto | null = null;
      if (idx !== -1) {
        photos[idx] = { ...photos[idx], ...patch };
        updatedPhoto = photos[idx];
        savePhotosToFile(photos);
      }

      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('advertisement_photos')
            .update(patch)
            .eq('id', targetId)
            .select()
            .single();

          if (!error && data) {
            if (idx !== -1) {
              photos[idx] = data as AdvertisementPhoto;
              savePhotosToFile(photos);
            }
            return NextResponse.json({ success: true, photo: data });
          }
        } catch (e) {}
      }

      if (updatedPhoto) {
        return NextResponse.json({ success: true, photo: updatedPhoto });
      }
      return NextResponse.json({ success: false, error: 'Foto tidak ditemukan.' }, { status: 404 });
    }

    // Default: create
    const newPhoto: AdvertisementPhoto = {
      ...(photo || body),
      id: (photo && photo.id) || 'ad-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    photos.push(newPhoto);
    savePhotosToFile(photos);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('advertisement_photos')
          .insert([newPhoto])
          .select()
          .single();

        if (!error && data) {
          const idx = photos.findIndex(p => p.id === newPhoto.id);
          if (idx !== -1) {
            photos[idx] = data as AdvertisementPhoto;
            savePhotosToFile(photos);
          }
          return NextResponse.json({ success: true, photo: data });
        }
      } catch (e) {}
    }

    return NextResponse.json({ success: true, photo: newPhoto });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
