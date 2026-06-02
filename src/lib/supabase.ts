import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cloud sync is OPTIONAL. The app works fully offline (localStorage only).
// To enable sync, set these in a .env file (see .env.example):
//   VITE_SUPABASE_URL=...
//   VITE_SUPABASE_ANON_KEY=...
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }) : null;

export function isCloudEnabled(): boolean {
  return supabase !== null;
}
