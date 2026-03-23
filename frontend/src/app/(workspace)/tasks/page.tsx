"use client";

import Link from "next/link";
import { formatTaskPriority, formatTaskStatus } from "@/lib/task-labels";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { ProjectResponse, TaskResponse } from "@/types/domain";

export default function TasksPage(): JSX.Element {
  const { token } = useAuth();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const canUseApi = Boolean(token);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api.projects
      .list(token)
      .then((data) => {
        setProjects(data);
        setSelectedProjectId((prev) => prev || data[0]?.id || "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error cargando proyectos"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || !selectedProjectId) {
      setTasks([]);
      return;
    }

    setLoading(true);
    setError(null);

    api.tasks
      .listByProject(token, selectedProjectId)
      .then(setTasks)
      .catch((e) => setError(e instanceof Error ? e.message : "Error cargando tareas"))
      .finally(() => setLoading(false));
  }, [token, selectedProjectId]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="fancy-in flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-taskpro-teal">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Tareas</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/projects" className="rounded-xl border border-black/20 px-4 py-2 text-sm font-semibold">
            Proyectos
          </Link>
          <Link href="/dashboard" className="rounded-xl bg-taskpro-ink px-4 py-2 text-sm font-semibold text-white">
            Dashboard
          </Link>
        </div>
      </header>

      {!canUseApi ? (
        <section className="surface rounded-3xl border border-black/10 p-8 shadow-card">
          <p className="text-black/70">Necesitas iniciar sesión para ver tareas.</p>
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Proyecto</h2>
                <p className="mt-1 text-sm text-black/70">Selecciona un proyecto para listar sus tareas.</p>
              </div>

              <select
                className="min-w-[240px] rounded-lg border border-black/20 bg-white/80 px-3 py-2"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
          </section>

          <section className="surface overflow-hidden rounded-3xl border border-black/10 shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-black/10 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">Listado</h2>
                <p className="text-sm text-black/60">{selectedProject ? selectedProject.name : "-"}</p>
              </div>
              {loading ? <span className="text-sm text-black/60">Cargando...</span> : null}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-black/5 text-left">
                  <tr>
                    <th className="px-4 py-3">Título</th>
                    <th className="px-4 py-3">Prioridad</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-t border-black/10">
                      <td className="px-4 py-3 font-semibold">
                        <Link className="hover:underline" href={`/tasks/${task.id}`}>
                          {task.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-black/70">{formatTaskPriority(task.priority)}</td>
                      <td className="px-4 py-3 text-black/70">{formatTaskStatus(task.status)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/tasks/${task.id}`} className="inline-flex rounded bg-taskpro-teal px-3 py-1 text-white">
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!loading && selectedProjectId && tasks.length === 0 ? (
                    <tr className="border-t border-black/10">
                      <td className="px-4 py-6 text-center text-black/60" colSpan={4}>
                        No hay tareas para este proyecto.
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
