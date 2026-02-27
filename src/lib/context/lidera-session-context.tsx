"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createAuthClient, createDataClient } from "@/lib/supabase/client";

type LideraSessionContextValue = {
  isReady: boolean;
  error: string | null;
};

const LideraSessionContext = createContext<LideraSessionContextValue>({
  isReady: false,
  error: null,
});

export function useLideraSession() {
  return useContext(LideraSessionContext);
}

export function LideraSessionProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLideraSession = useCallback(async () => {
    const authClient = createAuthClient();
    const {
      data: { session },
    } = await authClient.auth.getSession();
    if (!session?.user) {
      setIsReady(true);
      return;
    }

    try {
      const res = await fetch("/api/auth/lidera-session");
      if (!res.ok) {
        setError("Failed to get Lidera session");
        setIsReady(true);
        return;
      }
      const { access_token } = await res.json();
      const dataClient = createDataClient();
      await dataClient.auth.setSession({
        access_token,
        refresh_token: access_token,
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    refreshLideraSession();
  }, [refreshLideraSession]);

  return (
    <LideraSessionContext.Provider value={{ isReady, error }}>
      {children}
    </LideraSessionContext.Provider>
  );
}
