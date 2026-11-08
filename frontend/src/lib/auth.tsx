import { useCallback, useEffect, useState, type ReactNode } from "react";
import { api, setUnauthorizedHandler, type Session } from "./api";
import { AuthContext, type RegisterInput } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // On load, ask the server whether the cookie is still a valid session.
  useEffect(() => {
    api<Session>("/auth/me")
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setSession(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setSession(await api<Session>("/auth/login", { method: "POST", json: { email, password } }));
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setSession(await api<Session>("/auth/register", { method: "POST", json: input }));
  }, []);

  const logout = useCallback(async () => {
    try { await api("/auth/logout", { method: "POST" }); } finally { setSession(null); }
  }, []);

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, organization: session?.organization ?? null, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
