import type { SupabaseClient } from "@supabase/supabase-js";

/** Use with Adventure auth client. */
export async function getAuthUser(authClient: SupabaseClient) {
  const {
    data: { user },
  } = await authClient.auth.getUser();
  return user;
}

/** Use with Adventure auth client (user) and Lidera data client (profile). */
export async function getAuthUserWithProfile(
  authClient: SupabaseClient,
  dataClient: SupabaseClient | null
) {
  const user = await getAuthUser(authClient);
  if (!user) return null;
  if (!dataClient) return { user, profile: null };

  const { data: profile } = await dataClient
    .from("profiles")
    .select("*, organizations(name)")
    .eq("id", user.id)
    .single();

  return { user, profile };
}
