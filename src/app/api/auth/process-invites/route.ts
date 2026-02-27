import { NextResponse } from "next/server";
import { createAuthClient, createDataClient } from "@/lib/supabase/server";

export async function POST() {
  const authClient = await createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dataClient = await createDataClient();
  if (!dataClient) {
    return NextResponse.json({ error: "Data client unavailable" }, { status: 500 });
  }

  const { error } = await dataClient.rpc("process_pending_invites", {
    p_user_id: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
