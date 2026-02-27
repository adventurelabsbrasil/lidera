import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

const LIDERA_DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000002";

/**
 * Ensures a profile exists in Lidera for the given Adventure user.
 * Run with Lidera service role so RLS does not apply.
 * Requires migration 20260227000001_lidera_dual_allow_external_profiles.sql on Lidera.
 */
export async function ensureLideraProfile(adventureUser: User): Promise<void> {
  const url = process.env.NEXT_PUBLIC_LIDERA_SUPABASE_URL;
  const serviceRole = process.env.LIDERA_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) return;

  const lideraAdmin = createClient(url, serviceRole, { auth: { persistSession: false } });
  const { data: existing } = await lideraAdmin.from("profiles").select("id").eq("id", adventureUser.id).single();
  if (existing) return;

  const fullName =
    (adventureUser.user_metadata?.full_name as string) ||
    (adventureUser.user_metadata?.name as string) ||
    adventureUser.email?.split("@")[0] ||
    "";

  await lideraAdmin.from("profiles").upsert(
    {
      id: adventureUser.id,
      email: adventureUser.email ?? "",
      full_name: fullName || null,
      avatar_url: adventureUser.user_metadata?.avatar_url ?? null,
      role: "student",
      org_id: LIDERA_DEFAULT_ORG_ID,
    },
    { onConflict: "id" }
  );
}
