import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PreferencesForm } from "./preferences-form";

export const metadata: Metadata = {
  title: "Preferencias",
  description: "Configure suas preferencias",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Preferencias
        </h1>
        <p className="text-slate-500">
          Configure suas preferencias de perfil e aprendizado
        </p>
      </div>

      <PreferencesForm
        userId={user!.id}
        initialData={{
          full_name: profile?.full_name || "",
          email: user!.email || "",
          preferences: (profile?.preferences as Record<string, unknown>) || {},
        }}
      />
    </div>
  );
}
