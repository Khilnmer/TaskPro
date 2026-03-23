"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/users", label: "Usuarios" },
  { href: "/projects", label: "Proyectos" },
  { href: "/tasks", label: "Tareas" }
];

export function AppShell({ children }: { children: React.ReactNode }): JSX.Element {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="app-shell mx-auto grid min-h-screen w-full max-w-7xl gap-4 p-4 md:grid-cols-[240px_1fr] md:p-6">
      <aside className="surface nav-panel rounded-3xl border border-black/10 p-4 shadow-card md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-black/50">TaskPro</p>
        <h1 className="mt-2 text-2xl font-bold">Workspace</h1>

        <nav className="mt-8 space-y-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link block rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  active ? "sidebar-link-active bg-taskpro-ink text-white" : "hover:bg-black/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-user mt-12 rounded-xl border border-black/10 p-3 text-sm">
          <p className="font-semibold">{user?.displayName}</p>
          <p className="text-black/60">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="logout-button mt-3 rounded-lg bg-taskpro-clay px-3 py-2 text-xs font-semibold text-white"
          >
            Cerrar sesion
          </button>
        </div>
      </aside>

      <section className="surface content-panel rounded-3xl border border-black/10 p-4 shadow-card md:p-8">{children}</section>
    </div>
  );
}
