"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  GraduationCap,
  Home,
  LogOut,
  Settings,
  Users,
  Building2,
  LayoutDashboard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types/database";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Student navigation
  {
    title: "Inicio",
    href: "/learn",
    icon: Home,
    roles: ["student", "tenant", "admin"],
  },
  {
    title: "Meus Cursos",
    href: "/learn/courses",
    icon: BookOpen,
    roles: ["student", "tenant", "admin"],
  },
  {
    title: "Preferencias",
    href: "/learn/settings",
    icon: Settings,
    roles: ["student", "tenant", "admin"],
  },
  // Tenant navigation
  {
    title: "Gerenciar",
    href: "/manage",
    icon: LayoutDashboard,
    roles: ["tenant", "admin"],
  },
  {
    title: "Cursos",
    href: "/manage/courses",
    icon: GraduationCap,
    roles: ["tenant", "admin"],
  },
  {
    title: "Alunos",
    href: "/manage/students",
    icon: Users,
    roles: ["tenant", "admin"],
  },
  // Admin navigation
  {
    title: "Admin",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["admin"],
  },
  {
    title: "Organizacoes",
    href: "/admin/orgs",
    icon: Building2,
    roles: ["admin"],
  },
  {
    title: "Usuarios",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
];

interface DashboardNavProps {
  userRole: UserRole;
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  // Group items by section
  const studentItems = filteredItems.filter(
    (item) => item.href.startsWith("/learn")
  );
  const tenantItems = filteredItems.filter(
    (item) => item.href.startsWith("/manage")
  );
  const adminItems = filteredItems.filter(
    (item) => item.href.startsWith("/admin")
  );

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-1 space-y-1 p-2">
        {studentItems.length > 0 && (
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Aprendizado
            </p>
            {studentItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        )}

        {tenantItems.length > 0 && (
          <div className="space-y-1 pt-4">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gestao
            </p>
            {tenantItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        )}

        {adminItems.length > 0 && (
          <div className="space-y-1 pt-4">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Administracao
            </p>
            {adminItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sair
        </button>
      </div>
    </nav>
  );
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
        isActive
          ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/50 dark:text-blue-300"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
      )}
    >
      <item.icon className="h-4 w-4 mr-3" />
      {item.title}
    </Link>
  );
}
