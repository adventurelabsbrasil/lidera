import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/server";
import { createLideraBridgeToken } from "@/lib/supabase/lidera-jwt";
import { ensureLideraProfile } from "@/lib/supabase/lidera-profile-sync";

export async function GET() {
  const authClient = await createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureLideraProfile(user);
  const access_token = await createLideraBridgeToken(user.id);

  return NextResponse.json({
    access_token,
    expires_in: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}
