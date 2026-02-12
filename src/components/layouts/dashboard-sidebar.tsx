import { DashboardNav } from "./dashboard-nav";
import { ViewSwitcher } from "./view-switcher";
import type { UserRole } from "@/types/database";

interface DashboardSidebarProps {
  userRole: UserRole;
  userName?: string | null;
  orgName?: string | null;
}

export function DashboardSidebar({ userRole, userName, orgName }: DashboardSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-700">
        <span className="text-xl font-bold text-blue-600">Lidera</span>
      </div>
      {userName && (
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
            {userName}
          </p>
          {orgName && (
            <p className="text-xs text-slate-500 truncate">{orgName}</p>
          )}
        </div>
      )}
      {userRole === "admin" && (
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <ViewSwitcher />
        </div>
      )}
      <DashboardNav />
    </aside>
  );
}
