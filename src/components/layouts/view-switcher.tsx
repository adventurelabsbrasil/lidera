"use client";

import { useViewSwitcher } from "@/lib/context/view-switcher-context";
import type { UserRole } from "@/types/database";
import { ChevronDown, Eye, LayoutDashboard, GraduationCap, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Ver como Admin",
  tenant: "Ver como Tenant",
  student: "Ver como Estudante",
};

const ROLE_ICONS: Record<UserRole, React.ElementType> = {
  admin: LayoutDashboard,
  tenant: GraduationCap,
  student: User,
};

export function ViewSwitcher() {
  const { userRole, viewAsRole, setViewAsRole } = useViewSwitcher();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (userRole !== "admin") return null;

  const Icon = ROLE_ICONS[viewAsRole];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
      >
        <Eye className="h-4 w-4 shrink-0" />
        <span className="truncate flex-1 text-left">{ROLE_LABELS[viewAsRole]}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-50">
          {(["admin", "tenant", "student"] as const).map((role) => {
            const RoleIcon = ROLE_ICONS[role];
            return (
              <button
                key={role}
                onClick={() => {
                  setViewAsRole(role);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  viewAsRole === role
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <RoleIcon className="h-4 w-4" />
                {ROLE_LABELS[role]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
