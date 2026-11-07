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
    let serverRate = loadExtraBedRateFromFile();

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from('properties').select('*').limit(1).maybeSingle();
        if (!error && data) {
          // 1. Check if Supabase properties table has extra_bed_rate column natively
          if (data.extra_bed_rate !== undefined && data.extra_bed_rate !== null) {
            serverRate = Number(data.extra_bed_rate);
          } 
          // 2. Check if embedded in booking_policy tag [EXTRA_BED_RATE:xxx]
          else if (data.booking_policy && data.booking_policy.includes('[EXTRA_BED_RATE:')) {
            const match = data.booking_policy.match(/\[EXTRA_BED_RATE:(\d+)\]/);
            if (match && match[1]) {
              serverRate = parseInt(match[1], 10);
            }
          }
          // 3. Fallback: Check inventory_items for 'Tarif Ekstra Bed Resmi'
          else {
            try {
              const { data: inv } = await supabase
                .from('inventory_items')
                .select('purchase_price')
                .eq('name', 'Tarif Ekstra Bed Resmi')
                .maybeSingle();
              if (inv && typeof inv.purchase_price === 'number' && inv.purchase_price >= 0) {
                serverRate = inv.purchase_price;
              }
            } catch (e) {}
          }

          // Clean human-facing booking_policy text
          const cleanBookingPolicy = data.booking_policy 
            ? data.booking_policy.replace(/\s*\[EXTRA_BED_RATE:\d+\]/g, '').trim()
            : (property.booking_policy || '');

          property = { 
            ...property, 
            ...data, 
            booking_policy: cleanBookingPolicy,
            extra_bed_rate: serverRate 
          };
          savePropertyToFile(property);
          saveExtraBedRateToFile(serverRate);
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

    // 2. Persist to Supabase across all available storage vectors
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        
        // Base booking policy to preserve
        let basePolicy = updates.booking_policy || currentProperty.booking_policy || '';
        basePolicy = basePolicy.replace(/\s*\[EXTRA_BED_RATE:\d+\]/g, '').trim();
        const taggedBookingPolicy = `${basePolicy}\n[EXTRA_BED_RATE:${newExtraBedRate}]`;

        // Vector A: Try native update on properties table
        const payloadToTry = {
          ...updates,
          booking_policy: taggedBookingPolicy,
          extra_bed_rate: newExtraBedRate,
          updated_at: new Date().toISOString(),
        };

        const { error: nativeError } = await supabase
          .from('properties')
          .update(payloadToTry)
          .eq('id', updatedProperty.id);

        if (nativeError) {
          // If properties table doesn't have extra_bed_rate column yet,
          // save with tagged booking_policy so it is permanently in Supabase!
          const { extra_bed_rate, ...safePayload } = payloadToTry;
          await supabase
            .from('properties')
            .update(safePayload)
            .eq('id', updatedProperty.id);
        }

        // Vector B: Store in inventory_items in Supabase for additional resilience
        try {
          const { data: existingInv } = await supabase
            .from('inventory_items')
            .select('id')
            .eq('name', 'Tarif Ekstra Bed Resmi')
            .maybeSingle();

          if (existingInv) {
            await supabase
              .from('inventory_items')
              .update({
                purchase_price: newExtraBedRate,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingInv.id);
          } else {
            await supabase
              .from('inventory_items')
              .insert([{
                name: 'Tarif Ekstra Bed Resmi',
                category: 'perlengkapan_kamar',
                purchase_price: newExtraBedRate,
                current_stock: 10,
                unit: 'unit',
                min_stock_alert: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }]);
          }
        } catch (invErr) {
          console.warn('Inventory sync error:', invErr);
        }
      } catch (e) {
        console.error('Supabase property update error:', e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      property: {
        ...updatedProperty,
        booking_policy: updatedProperty.booking_policy?.replace(/\s*\[EXTRA_BED_RATE:\d+\]/g, '').trim()
      } 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
