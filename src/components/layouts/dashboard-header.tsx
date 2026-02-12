"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { DashboardNav } from "./dashboard-nav";
import { ViewSwitcher } from "./view-switcher";
import type { UserRole } from "@/types/database";

interface DashboardHeaderProps {
  userRole: UserRole;
  userName?: string | null;
  orgName?: string | null;
}

export function DashboardHeader({ userRole, userName, orgName }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-lg font-semibold text-blue-600">Lidera</span>
        </div>
        <div className="w-10" /> {/* Spacer for balance */}
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-lg font-semibold text-blue-600">Lidera</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {userName && (
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {userName}
                </p>
                {orgName && (
                  <p className="text-xs text-slate-500">{orgName}</p>
                )}
              </div>
            )}
            {userRole === "admin" && (
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <ViewSwitcher />
              </div>
            )}
            <DashboardNav />
          </div>
        </div>
      )}
    </>
  );
}
