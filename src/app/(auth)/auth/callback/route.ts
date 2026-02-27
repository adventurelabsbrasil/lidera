import { createAuthClient, createDataClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/learn";

  if (code) {
    const authClient = await createAuthClient();
    const { data, error } = await authClient.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const dataClient = await createDataClient();
      if (dataClient) {
        await dataClient.rpc("process_pending_invites", {
          p_user_id: data.user.id,
        });
      }
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_error`);
}
