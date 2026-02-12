import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAuthUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getAuthUserWithProfile(supabase: SupabaseClient) {
  const user = await getAuthUser(supabase);
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organizations(name)")
    .eq("id", user.id)
    .single();

  return { user, profile };
}
