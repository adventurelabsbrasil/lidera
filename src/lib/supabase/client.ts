"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const ADVENTURE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ADVENTURE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const LIDERA_URL = process.env.NEXT_PUBLIC_LIDERA_SUPABASE_URL!;
const LIDERA_ANON = process.env.NEXT_PUBLIC_LIDERA_SUPABASE_ANON_KEY!;

let lideraClientInstance: SupabaseClient | null = null;

/**
 * Auth client (Adventure) – use for signIn, signUp, signOut, getUser, onAuthStateChange.
 */
export function createAuthClient() {
  return createBrowserClient(ADVENTURE_URL, ADVENTURE_ANON);
}

/**
 * Data client (Lidera) – use for .from(), storage, rpc(). Session must be set via
 * LideraSessionProvider (calls /api/auth/lidera-session and setSession). Returns singleton.
 */
export function createDataClient(): SupabaseClient {
  if (!lideraClientInstance) {
    lideraClientInstance = createBrowserClient(LIDERA_URL, LIDERA_ANON);
  }
  return lideraClientInstance;
}

/** Backward compatibility: returns auth client. Prefer createAuthClient() / createDataClient(). */
export function createClient() {
  return createAuthClient();
}
