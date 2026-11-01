import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';
import { PropertySettings } from '@/lib/types';
import { INITIAL_PROPERTY_SETTINGS } from '@/lib/mock-fallback';

const PROPERTY_FILE_PATH = path.join(process.cwd(), '.server-property.json');

function getSupabaseClient() {
  const adminClient = createAdminClient();
  if (adminClient) return adminClient;
  return createClient();
}

function loadPropertyFromFile(): PropertySettings {
  try {
    if (fs.existsSync(PROPERTY_FILE_PATH)) {
      const data = fs.readFileSync(PROPERTY_FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object' && parsed.name) {
        return { ...INITIAL_PROPERTY_SETTINGS, ...parsed };
      }
    }
  } catch (e) {
    console.error('Error reading property file:', e);
  }
  savePropertyToFile(INITIAL_PROPERTY_SETTINGS);
  return { ...INITIAL_PROPERTY_SETTINGS };
}

function savePropertyToFile(property: PropertySettings) {
  try {
    fs.writeFileSync(PROPERTY_FILE_PATH, JSON.stringify(property, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing property file:', e);
  }
}

export async function GET() {
  try {
    let property = loadPropertyFromFile();

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from('properties').select('*').limit(1).maybeSingle();
        if (!error && data) {
          property = { ...property, ...data };
          savePropertyToFile(property);
        }
      } catch (e) {}
    }

    return NextResponse.json({ success: true, property });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updates = body.updates || body;
    let currentProperty = loadPropertyFromFile();

    const updatedProperty: PropertySettings = {
      ...currentProperty,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    savePropertyToFile(updatedProperty);

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('properties')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', updatedProperty.id)
          .select()
          .maybeSingle();

        if (!error && data) {
          savePropertyToFile({ ...updatedProperty, ...data });
          return NextResponse.json({ success: true, property: data });
        }
      } catch (e) {}
    }

    return NextResponse.json({ success: true, property: updatedProperty });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
