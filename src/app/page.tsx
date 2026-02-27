import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/server";

export default async function Home() {
  const authClient = await createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (user) {
    redirect("/learn");
  } else {
    redirect("/auth/login");
  }
}
