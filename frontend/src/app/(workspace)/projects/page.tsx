
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { ProjectResponse } from "@/types/domain";

type FormState = {
  name: string;
  description: string;
};

export default function ProjectsPage(): JSX.Element {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", description: "" });

  const canUseApi = Boolean(token);

  async function refresh(): Promise<void> {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.projects.list(token);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando proyectos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const ownerUserId = useMemo(() => user?.id ?? "", [user?.id]);

  async function onSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!token) return;

    setError(null);

    try {
      if (editingId) {
        await api.projects.update(token, editingId, form.name, form.description || null);
        setEditingId(null);
      } else {
        if (!ownerUserId) {
          throw new Error("No se pudo determinar el usuario owner. Inicia sesión de nuevo.");
        }
        await api.projects.create(token, form.name, form.description || null, ownerUserId);
      }

      setForm({ name: "", description: "" });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error guardando proyecto");
    }
  }

  function onEdit(project: ProjectResponse): void {
    setEditingId(project.id);
    setForm({ name: project.name, description: project.description ?? "" });
  }

  async function onDelete(projectId: string): Promise<void> {
    if (!token) return;

    setError(null);

    try {
      await api.projects.delete(token, projectId);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error eliminando proyecto");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="fancy-in flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-taskpro-teal">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Proyectos</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard" className="rounded-xl border border-black/20 px-4 py-2 text-sm font-semibold">
            Dashboard
          </Link>
          <Link href="/tasks" className="rounded-xl bg-taskpro-ink px-4 py-2 text-sm font-semibold text-white">
            Tareas
          </Link>
        </div>
      </header>

      {!canUseApi ? (
        <section className="surface rounded-3xl border border-black/10 p-8 shadow-card">
          <p className="text-black/70">Necesitas iniciar sesión para ver proyectos.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-xl bg-taskpro-ink px-5 py-3 text-sm font-semibold text-white"
          >
            Ir a login
          </Link>
        </section>
      ) : (
        <>
          <section className="surface rounded-3xl border border-black/10 p-6 shadow-card">
            <h2 className="text-lg font-bold">{editingId ? "Editar proyecto" : "Crear proyecto"}</h2>
            <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-3">
              <input
                className="rounded-lg border border-black/20 bg-white/80 px-3 py-2"
                placeholder="Nombre"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
              <input
                className="rounded-lg border border-black/20 bg-white/80 px-3 py-2 md:col-span-2"
                placeholder="Descripción"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
              <div className="flex flex-wrap gap-2 md:col-span-3">
                <button className="rounded-lg bg-taskpro-ink px-4 py-2 text-sm font-semibold text-white" type="submit">
                  {editingId ? "Actualizar" : "Crear"}
                </button>
                {editingId ? (
                  <button
                    className="rounded-lg border border-black/20 bg-white/70 px-4 py-2 text-sm font-semibold"
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ name: "", description: "" });
                    }}
                  >
                    Cancelar
                  </button>
                ) : null}
              </div>

              {error ? <p className="md:col-span-3 text-sm font-semibold text-red-700">{error}</p> : null}
            </form>
          </section>

          <section className="surface overflow-hidden rounded-3xl border border-black/10 shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-black/10 px-6 py-4">
              <h2 className="text-lg font-bold">Listado</h2>
              {loading ? <span className="text-sm text-black/60">Cargando...</span> : null}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-black/5 text-left">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Descripción</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((project) => (
                    <tr key={project.id} className="border-t border-black/10">
                      <td className="px-4 py-3 font-semibold">
                        <Link className="hover:underline" href={`/projects/${project.id}`}>
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-black/70">{project.description ?? "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => onEdit(project)}
                            className="rounded bg-taskpro-teal px-3 py-1 text-white"
                            type="button"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => onDelete(project.id)}
                            className="rounded bg-taskpro-clay px-3 py-1 text-white"
                            type="button"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && rows.length === 0 ? (
                    <tr className="border-t border-black/10">
                      <td className="px-4 py-6 text-center text-black/60" colSpan={3}>
                        No hay proyectos.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
