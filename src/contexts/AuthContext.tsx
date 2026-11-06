import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { STORAGE_KEYS } from "@/constants/storage";
import type { User } from "@/types/api";
import { api, fetcher, setUnauthorizedHandler } from "@/utils/api/client";
import { logger } from "@/utils/logger";
import { clearToken, getToken, setToken } from "@/utils/secureStore";
import { getItem, removeItem, setItem } from "@/utils/storage";

type AuthStatus = "booting" | "signedOut" | "signedIn";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  /** Called by the auth flow after a successful verify: stores the token, caches the user. */
  completeSignIn: (token: string, user: User) => Promise<void>;
  refreshUser: () => Promise<User | null>;
  setUser: (user: User) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Session = "a token exists in expo-secure-store". The user object is a non-credential cache
 * (AsyncStorage) refreshed from GET /me on boot; a 401 anywhere clears the token, the cache
 * and the Query cache, and the route guards redirect to sign-in. Must sit inside QueryProvider.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("booting");
  const [user, setUserState] = useState<User | null>(null);

  const clearSession = useCallback(async () => {
    await clearToken();
    await removeItem(STORAGE_KEYS.cachedUser);
    setUserState(null);
    setStatus("signedOut");
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(() => void clearSession());
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const fresh = await fetcher<User>("me");
      setUserState(fresh);
      await setItem(STORAGE_KEYS.cachedUser, fresh);
      return fresh;
    } catch (error) {
      logger.debug("refreshUser failed; keeping cached user", error);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const token = await getToken();
      if (!token) {
        if (active) setStatus("signedOut");
        return;
      }
      const cached = await getItem<User>(STORAGE_KEYS.cachedUser);
      if (active && cached) setUserState(cached);
      if (active) setStatus("signedIn");
      // Hydrate in the background; a 401 here routes through the interceptor → clearSession.
      void refreshUser();
    })();
    return () => {
      active = false;
    };
  }, [refreshUser]);

  const completeSignIn = useCallback(async (token: string, nextUser: User) => {
    await setToken(token);
    await setItem(STORAGE_KEYS.cachedUser, nextUser);
    setUserState(nextUser);
    setStatus("signedIn");
  }, []);

  const setUser = useCallback((nextUser: User) => {
    setUserState(nextUser);
    void setItem(STORAGE_KEYS.cachedUser, nextUser);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.post("auth/logout");
    } catch (error) {
      logger.debug("logout request failed; clearing locally anyway", error);
    } finally {
      await clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, completeSignIn, refreshUser, setUser, signOut }),
    [status, user, completeSignIn, refreshUser, setUser, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
