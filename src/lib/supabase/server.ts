import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createLideraBridgeToken } from "./lidera-jwt";
import { ensureLideraProfile } from "./lidera-profile-sync";
import type { SupabaseClient } from "@supabase/supabase-js";

const ADVENTURE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ADVENTURE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const LIDERA_URL = process.env.NEXT_PUBLIC_LIDERA_SUPABASE_URL!;
const LIDERA_ANON = process.env.NEXT_PUBLIC_LIDERA_SUPABASE_ANON_KEY!;

/**
 * Auth client (Adventure) – login, session, getUser. Use for all auth operations.
 */
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(ADVENTURE_URL, ADVENTURE_ANON, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // ignore in Server Component
        }
      },
    },
  });
}

/**
 * Data client (Lidera) – tables, RLS, storage. Session is set via bridge JWT from Adventure user.
 * Returns null if not authenticated (no Adventure session).
 */
export async function createDataClient(): Promise<SupabaseClient | null> {
  const authClient = await createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return null;

  await ensureLideraProfile(user);
  const accessToken = await createLideraBridgeToken(user.id);

  const lideraClient = createSupabaseClient(LIDERA_URL, LIDERA_ANON, { auth: { persistSession: false } });
  await lideraClient.auth.setSession({
    access_token: accessToken,
    refresh_token: accessToken,
  });

  return lideraClient;
}

/** Backward compatibility: returns auth client (Adventure). Prefer createAuthClient() / createDataClient(). */
export async function createClient() {
  return createAuthClient();
}
