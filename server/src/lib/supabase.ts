import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

// Anonymous base client (for token validation)
export const baseSupabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Admin client (service role or anon fallback for server tasks like registry lookup)
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Creates a per-request Supabase client scoped with the user's JWT token.
 * This guarantees that Postgres RLS policies are enforced directly at the database layer.
 */
export function createUserSupabase(jwtToken: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
  });
}
