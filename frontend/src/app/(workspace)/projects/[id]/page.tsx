"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { ProjectResponse, TaskResponse } from "@/types/domain";

type TaskFormState = {
  title: string;
  description: string;
  priority: number;
  status: number;
  dueDate: string;
};

const initialTaskForm: TaskFormState = {
  title: "",
  description: "",
  priority: 1,
  status: 0,
  dueDate: ""
};

export default function ProjectDetailsPage({ params }: { params: { id: string } }): JSX.Element {
  const { token } = useAuth();
  const projectId = params.id;

  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [taskForm, setTaskForm] = useState<TaskFormState>(initialTaskForm);
  const [creating, setCreating] = useState<boolean>(false);

  const canUseApi = Boolean(token);

  async function refresh(): Promise<void> {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const [projects, tasks] = await Promise.all([api.projects.list(token), api.tasks.listByProject(token, projectId)]);
      setProject(projects.find((p) => p.id === projectId) ?? null);
      setTasks(tasks);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando proyecto");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, projectId]);

  const title = useMemo(() => project?.name ?? "Proyecto", [project?.name]);

  async function onCreateTask(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!token) return;

    setCreating(true);
    setError(null);

    try {
      await api.tasks.create(token, {
        projectId,
        title: taskForm.title,
        description: taskForm.description || null,
        priority: taskForm.priority,
        status: taskForm.status,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null
      });

      setTaskForm(initialTaskForm);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear la tarea");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="fancy-in flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-taskpro-teal">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{title}</h1>
          {project?.description ? <p className="mt-2 text-black/70">{project.description}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/projects" className="rounded-xl border border-black/20 px-4 py-2 text-sm font-semibold">
            Volver
          </Link>
          <Link href="/tasks" className="rounded-xl bg-taskpro-ink px-4 py-2 text-sm font-semibold text-white">
            Ver tareas
          </Link>
        </div>
      </header>

      {!canUseApi ? (
        <section className="surface rounded-3xl border border-black/10 p-8 shadow-card">
          <p className="text-black/70">Necesitas iniciar sesión para ver este proyecto.</p>
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
                <h2 className="text-lg font-bold">Crear tarea</h2>
                <p className="mt-1 text-sm text-black/70">Agrega tareas a este proyecto y luego asígnalas.</p>
              </div>
              {loading ? <span className="text-sm text-black/60">Cargando...</span> : null}
            </div>

            <form onSubmit={onCreateTask} className="mt-4 grid gap-3 md:grid-cols-4">
              <input
                className="rounded-lg border border-black/20 bg-white/80 px-3 py-2 md:col-span-2"
                placeholder="Título"
                value={taskForm.title}
                onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
              <select
                className="rounded-lg border border-black/20 bg-white/80 px-3 py-2"
                value={taskForm.priority}
                onChange={(e) => setTaskForm((p) => ({ ...p, priority: Number(e.target.value) }))}
              >
                <option value={0}>Baja</option>
                <option value={1}>Media</option>
                <option value={2}>Alta</option>
              </select>
              <select
                className="rounded-lg border border-black/20 bg-white/80 px-3 py-2"
                value={taskForm.status}
                onChange={(e) => setTaskForm((p) => ({ ...p, status: Number(e.target.value) }))}
              >
                <option value={0}>Todo</option>
                <option value={1}>InProgress</option>
                <option value={2}>Done</option>
              </select>
              <input
                className="rounded-lg border border-black/20 bg-white/80 px-3 py-2 md:col-span-3"
                placeholder="Descripción"
                value={taskForm.description}
                onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
              />
              <input
                className="rounded-lg border border-black/20 bg-white/80 px-3 py-2"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))}
              />
              <div className="flex gap-2 md:col-span-4">
                <button
                  className="rounded-lg bg-taskpro-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  type="submit"
                  disabled={creating}
                >
                  {creating ? "Creando..." : "Crear tarea"}
                </button>
              </div>
            </form>

            {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
            {!loading && !project ? <p className="mt-3 text-sm text-black/70">Proyecto no encontrado.</p> : null}
          </section>

          <section className="surface overflow-hidden rounded-3xl border border-black/10 shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-black/10 px-6 py-4">
              <h2 className="text-lg font-bold">Tareas del proyecto</h2>
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
                      <td className="px-4 py-3 text-black/70">{task.priority}</td>
                      <td className="px-4 py-3 text-black/70">{task.status}</td>
                      <td className="px-4 py-3">
                        <Link href={`/tasks/${task.id}`} className="inline-flex rounded bg-taskpro-teal px-3 py-1 text-white">
                          Ver / Asignar
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!loading && tasks.length === 0 ? (
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
