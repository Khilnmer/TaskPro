"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "./app-shell";

export default function ProtectedLayout({ children }: { children: React.ReactNode }): JSX.Element {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [loading, router, token]);

  if (loading) {
    return <main className="status-shell grid min-h-screen place-content-center">Cargando...</main>;
  }

  if (!token) {
    return <main className="status-shell grid min-h-screen place-content-center">Redirigiendo...</main>;
  }

  return <AppShell>{children}</AppShell>;
}
