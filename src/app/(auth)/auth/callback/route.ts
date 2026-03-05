import { createAuthClient, createDataClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectPath = searchParams.get("redirect") || "/learn";

  const appOrigin =
    process.env.NEXT_PUBLIC_APP_URL?.trim()
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
      : origin;

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
      return NextResponse.redirect(`${appOrigin}${redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`}`);
    }
  }

  return NextResponse.redirect(`${appOrigin}/auth/login?error=auth_error`);
}
