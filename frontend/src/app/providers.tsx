"use client";

import { AuthProvider } from "@/context/auth-context";

export default function Providers({ children }: { children: React.ReactNode }): JSX.Element {
  return <AuthProvider>{children}</AuthProvider>;
}
