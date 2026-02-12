import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader, DashboardSidebar } from "@/components/layouts";
import { ViewSwitcherProvider } from "@/lib/context/view-switcher-context";
import type { UserRole } from "@/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organizations(name)")
    .eq("id", user.id)
    .single();

  // Default to student if no profile exists yet
  const userRole: UserRole = profile?.role || "student";
  const userName = profile?.full_name || user.email;
  const orgName = (profile?.organizations as { name: string } | null)?.name;

  return (
    <ViewSwitcherProvider userRole={userRole}>
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
    </ViewSwitcherProvider>
  );
}
