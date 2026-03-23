"use client";

import { api } from "@/lib/api";
import { storage } from "@/lib/storage";
import { UserResponse } from "@/types/domain";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextValue {
  token: string | null;
  user: UserResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

interface RegisterPayload {
  displayName: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = storage.getToken();
    setToken(savedToken);

    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    api
      .me(savedToken)
      .then((me) => {
        setUser(me);
        storage.setUser(me);
      })
      .catch(() => {
        setToken(null);
        setUser(null);
        storage.removeToken();
        storage.removeUser();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      loading,
      async login(email: string, password: string): Promise<void> {
        const response = await api.auth.login(email, password);
        setToken(response.accessToken);
        storage.setToken(response.accessToken);

        const me = await api.me(response.accessToken);
        setUser(me);
        storage.setUser(me);
      },
      async register(payload: RegisterPayload): Promise<void> {
        const response = await api.auth.register(payload.email, payload.displayName, payload.password);
        setToken(response.accessToken);
        storage.setToken(response.accessToken);

        const me = await api.me(response.accessToken);
        setUser(me);
        storage.setUser(me);
      },
      logout(): void {
        setToken(null);
        setUser(null);
        storage.removeToken();
        storage.removeUser();
      }
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
