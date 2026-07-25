import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getToken, setToken } from "@/lib/api";
import { authService, type LoginPayload, type RegisterPayload } from "@/services/auth";
import type { User } from "@/types";

const USER_KEY = "miva_user";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (!getToken()) return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Empty deps: this hydrates the session once from a stored token on mount,
  // not on every `user` change.
  useEffect(() => {
    if (getToken() && !user) {
      authService
        .fetchMe()
        .then((u) => {
          localStorage.setItem(USER_KEY, JSON.stringify(u));
          setUser(u);
        })
        .catch(() => {
          setToken(null);
          localStorage.removeItem(USER_KEY);
          setUser(null);
        });
    }
  }, []);

  const persist = useCallback((nextUser: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setLoading(true);
      setError(null);
      try {
        const { access_token } = await authService.login(payload);
        setToken(access_token);
        const me = await authService.fetchMe();
        persist(me);
      } catch (e) {
        setToken(null);
        setError(e instanceof Error ? e.message : "Unable to sign in");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setLoading(true);
      setError(null);
      try {
        await authService.register(payload);
        const { access_token } = await authService.login({ email: payload.email, password: payload.password });
        setToken(access_token);
        const me = await authService.fetchMe();
        persist(me);
      } catch (e) {
        setToken(null);
        setError(e instanceof Error ? e.message : "Unable to create account");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, loading, error, login, register, logout, clearError }),
    [user, loading, error, login, register, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
