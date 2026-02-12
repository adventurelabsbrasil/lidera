import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { getAuthUserWithProfile } from "@/lib/supabase/auth-helpers";
import { PreferencesForm } from "./preferences-form";

export const metadata: Metadata = {
  title: "Preferências",
  description: "Configure suas preferências",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const auth = await getAuthUserWithProfile(supabase);
  if (!auth) redirect("/auth/login");
  const { user, profile } = auth;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Preferências"
        description="Configure suas preferências de perfil e aprendizado"
      />

      <PreferencesForm
        userId={user.id}
        initialData={{
          full_name: profile?.full_name || "",
          email: user.email || "",
          preferences: (profile?.preferences as Record<string, unknown>) || {},
        }}
      />
    </div>
  );
}
