"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { UserRole } from "@/types/database";

const STORAGE_KEY = "lidera-view-as-role";

interface ViewSwitcherContextValue {
  viewAsRole: UserRole;
  setViewAsRole: (role: UserRole) => void;
  userRole: UserRole;
}

const ViewSwitcherContext = createContext<ViewSwitcherContextValue | null>(
  null
);

export function ViewSwitcherProvider({
  userRole,
  children,
}: {
  userRole: UserRole;
  children: React.ReactNode;
}) {
  const [viewAsRole, setViewAsRoleState] = useState<UserRole>(userRole);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (userRole !== "admin") {
      setViewAsRoleState(userRole);
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as UserRole | null;
      if (stored && ["admin", "tenant", "student"].includes(stored)) {
        setViewAsRoleState(stored);
      } else {
        setViewAsRoleState(userRole);
      }
    } catch {
      setViewAsRoleState(userRole);
    }
  }, [mounted, userRole]);

  const setViewAsRole = useCallback(
    (role: UserRole) => {
      if (userRole !== "admin") return;
      setViewAsRoleState(role);
      try {
        localStorage.setItem(STORAGE_KEY, role);
      } catch {
        // ignore
      }
    },
    [userRole]
  );

  const effectiveViewAsRole = userRole === "admin" ? viewAsRole : userRole;

  return (
    <ViewSwitcherContext.Provider
      value={{
        viewAsRole: effectiveViewAsRole,
        setViewAsRole,
        userRole,
      }}
    >
      {children}
    </ViewSwitcherContext.Provider>
  );
}

export function useViewSwitcher(): ViewSwitcherContextValue {
  const ctx = useContext(ViewSwitcherContext);
  if (!ctx) {
    throw new Error("useViewSwitcher must be used within ViewSwitcherProvider");
  }
  return ctx;
}
