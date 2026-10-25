export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    anonKey &&
    !url.includes('placeholder') &&
    !url.includes('your-project-id') &&
    url.startsWith('https://')
  );
}

export function getSupabaseConfigStatus(): {
  isConfigured: boolean;
  missingVars: string[];
} {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('...')) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes('...')) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  return {
    isConfigured: missing.length === 0,
    missingVars: missing,
  };
}
