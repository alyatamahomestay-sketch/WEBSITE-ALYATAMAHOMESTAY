import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';

function getSupabaseClient() {
  const adminClient = createAdminClient();
  if (adminClient) return adminClient;
  return createClient();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada berkas file gambar yang diunggah.' },
        { status: 400 }
      );
    }

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Berkas harus berupa gambar (JPG, PNG, WEBP, GIF, dll).' },
        { status: 400 }
      );
    }

    // Limit size to 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Ukuran berkas gambar terlalu besar (maksimal 10MB).' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize file name
    const ext = file.name.split('.').pop() || 'jpg';
    const cleanBase = file.name
      .substring(0, file.name.lastIndexOf('.'))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const fileName = `${folder}/${Date.now()}-${cleanBase}.${ext}`;

    // Try Supabase Storage first if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();

        // Ensure bucket exists
        try {
          const { data: buckets } = await supabase.storage.listBuckets();
          const hasBucket = buckets?.some(b => b.name === 'property-assets' || b.id === 'property-assets');
          if (!hasBucket) {
            await supabase.storage.createBucket('property-assets', { public: true });
          }
        } catch (bucketErr) {
          console.warn('Could not auto-create bucket, attempting direct upload:', bucketErr);
        }

        // Upload to bucket
        const { error: uploadError } = await supabase.storage
          .from('property-assets')
          .upload(fileName, buffer, {
            contentType: file.type || 'image/jpeg',
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('property-assets')
            .getPublicUrl(fileName);

          return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            fileName: file.name,
            size: file.size,
          });
        }

        console.warn('Supabase storage upload error, falling back to base64:', uploadError);
      } catch (storageErr) {
        console.warn('Supabase storage exception, falling back to base64:', storageErr);
      }
    }

    // Fallback: Return Base64 data URL if storage is not configured or failed
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type || 'image/jpeg'};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName: file.name,
      size: file.size,
      isBase64: true,
    });
  } catch (err: any) {
    console.error('File upload fatal error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal memproses unggah berkas gambar.' },
      { status: 500 }
    );
  }
}
