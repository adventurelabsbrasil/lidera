import { redirect } from "next/navigation";
import { createAuthClient, createDataClient } from "@/lib/supabase/server";
import { DashboardHeader, DashboardSidebar } from "@/components/layouts";
import { ViewSwitcherProvider } from "@/lib/context/view-switcher-context";
import { LideraSessionProvider } from "@/lib/context/lidera-session-context";
import type { UserRole } from "@/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authClient = await createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const dataClient = await createDataClient();
  const { data: profile } = dataClient
    ? await dataClient
        .from("profiles")
        .select("*, organizations(name)")
        .eq("id", user.id)
        .single()
    : { data: null };

  // Default to student if no profile exists yet
  const userRole: UserRole = profile?.role || "student";
  const userName = profile?.full_name || user.email;
  const orgName = (profile?.organizations as { name: string } | null)?.name;

  return (
    <ViewSwitcherProvider userRole={userRole}>
      <LideraSessionProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <DashboardSidebar
          userRole={userRole}
          userName={userName}
          orgName={orgName}
        />
        <DashboardHeader
          userRole={userRole}
          userName={userName}
          orgName={orgName}
        />
        <main className="lg:pl-64">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
        </div>
      </LideraSessionProvider>
    </ViewSwitcherProvider>
  );
}
