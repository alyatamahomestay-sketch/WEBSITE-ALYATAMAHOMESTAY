import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';
import { PropertySettings } from '@/lib/types';
import { INITIAL_PROPERTY_SETTINGS } from '@/lib/mock-fallback';

export const dynamic = 'force-dynamic';

const PROPERTY_FILE_PATH = path.join(process.cwd(), '.server-property.json');
const EXTRA_BED_FILE_PATH = path.join(process.cwd(), '.server-extra-bed.json');

function getSupabaseClient() {
  const adminClient = createAdminClient();
  if (adminClient) return adminClient;
  return createClient();
}

function loadExtraBedRateFromFile(): number {
  try {
    if (fs.existsSync(EXTRA_BED_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(EXTRA_BED_FILE_PATH, 'utf8'));
      if (data && typeof data.extra_bed_rate === 'number' && data.extra_bed_rate >= 0) {
        return Number(data.extra_bed_rate);
      }
    }
  } catch (e) {}
  return 50000;
}

function saveExtraBedRateToFile(rate: number) {
  try {
    fs.writeFileSync(
      EXTRA_BED_FILE_PATH,
      JSON.stringify({ extra_bed_rate: rate, updated_at: new Date().toISOString() }, null, 2),
      'utf8'
    );
  } catch (e) {
    console.error('Error writing extra bed file:', e);
  }
}

function loadPropertyFromFile(): PropertySettings {
  const persistentRate = loadExtraBedRateFromFile();
  try {
    if (fs.existsSync(PROPERTY_FILE_PATH)) {
      const data = fs.readFileSync(PROPERTY_FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object' && parsed.name) {
        return { 
          ...INITIAL_PROPERTY_SETTINGS, 
          ...parsed,
          extra_bed_rate: parsed.extra_bed_rate !== undefined && parsed.extra_bed_rate !== null 
            ? Number(parsed.extra_bed_rate) 
            : persistentRate
        };
      }
    }
  } catch (e) {
    console.error('Error reading property file:', e);
  }
  const initial = { ...INITIAL_PROPERTY_SETTINGS, extra_bed_rate: persistentRate };
  savePropertyToFile(initial);
  return initial;
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
    const serverRate = loadExtraBedRateFromFile();

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from('properties').select('*').limit(1).maybeSingle();
        if (!error && data) {
          // CRITICAL: Supabase properties table might not have extra_bed_rate column.
          // Never let it wipe out our persistent rate!
          const activeRate = data.extra_bed_rate !== undefined && data.extra_bed_rate !== null
            ? Number(data.extra_bed_rate)
            : (property.extra_bed_rate ?? serverRate);

          property = { ...property, ...data, extra_bed_rate: activeRate };
          savePropertyToFile(property);
          saveExtraBedRateToFile(activeRate);
        }
      } catch (e) {}
    }

    if (property.extra_bed_rate === undefined || property.extra_bed_rate === null) {
      property.extra_bed_rate = serverRate;
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

    // 1. Immediately persist extra bed rate if provided
    let newExtraBedRate = currentProperty.extra_bed_rate ?? loadExtraBedRateFromFile();
    if (updates.extra_bed_rate !== undefined && Number(updates.extra_bed_rate) >= 0) {
      newExtraBedRate = Number(updates.extra_bed_rate);
      saveExtraBedRateToFile(newExtraBedRate);
    }

    const updatedProperty: PropertySettings = {
      ...currentProperty,
      ...updates,
      extra_bed_rate: newExtraBedRate,
      updated_at: new Date().toISOString(),
    };

    savePropertyToFile(updatedProperty);

    // 2. Persist to Supabase safely
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        // First try update directly with all fields
        const { data, error } = await supabase
          .from('properties')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', updatedProperty.id)
          .select()
          .maybeSingle();

        if (error) {
          // If error occurs (e.g. extra_bed_rate column not in Supabase properties table),
          // update without extra_bed_rate so remaining fields save successfully
          const { extra_bed_rate, ...cleanUpdates } = updates;
          if (Object.keys(cleanUpdates).length > 0) {
            await supabase
              .from('properties')
              .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
              .eq('id', updatedProperty.id);
          }
        } else if (data) {
          savePropertyToFile({ ...updatedProperty, ...data, extra_bed_rate: newExtraBedRate });
        }
      } catch (e) {
        console.error('Supabase property update error:', e);
      }
    }

    return NextResponse.json({ success: true, property: updatedProperty });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
