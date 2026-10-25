import { createClient } from '@supabase/supabase-js';

/**
 * Server-only client with service role key for trusted administrative routines
 * (e.g. initial owner bootstrap, server-side atomic reservation approval).
 * NEVER import or execute this on the client side.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
