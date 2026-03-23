"use client";

import Link from "next/link";
import { formatTaskPriority, formatTaskStatus } from "@/lib/task-labels";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { TaskAssigneeResponse, TaskCommentDto, TaskResponse, UserResponse } from "@/types/domain";

export default function TaskDetailsPage({ params }: { params: { id: string } }): JSX.Element {
  const taskId = params.id;
  const { token, user } = useAuth();

  const [task, setTask] = useState<TaskResponse | null>(null);
  const [assignees, setAssignees] = useState<TaskAssigneeResponse | null>(null);
  const [comments, setComments] = useState<TaskCommentDto[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);

  const [assignUserId, setAssignUserId] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const userById = useMemo(() => {
    const map = new Map<string, UserResponse>();
    for (const u of users) map.set(u.id, u);
    return map;
  }, [users]);

  const availableUsersForTask = useMemo(() => {
    const assigned = new Set(assignees?.userIds ?? []);
    return users.filter((u) => !assigned.has(u.id));
  }, [assignees?.userIds, users]);

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!token) return;
      setError(null);

      const [taskData, assigneeData, commentData, userData] = await Promise.all([
        api.tasks.get(token, taskId),
        api.assignees.list(token, taskId),
        api.comments.listByTask(token, taskId),
        api.users.list(token)
      ]);

      setTask(taskData);
      setAssignees(assigneeData);
      setComments(commentData);
      setUsers(userData);
    };

    load().catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar la tarea"));
  }, [token, taskId]);

  async function refresh(): Promise<void> {
    if (!token) return;

    const [taskData, assigneeData, commentData] = await Promise.all([
      api.tasks.get(token, taskId),
      api.assignees.list(token, taskId),
      api.comments.listByTask(token, taskId)
    ]);

    setTask(taskData);
    setAssignees(assigneeData);
    setComments(commentData);
  }

  const isAssignedToTask = useMemo(() => {
    if (!user?.id) return false;
    return (assignees?.userIds ?? []).includes(user.id);
  }, [assignees?.userIds, user?.id]);

  const canModifyTask = isAssignedToTask;

  const statusLabel = useMemo(() => (task ? formatTaskStatus(task.status) : ""), [task]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="fancy-in flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-taskpro-teal">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Detalle de tarea</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/tasks" className="rounded-xl border border-black/20 px-4 py-2 text-sm font-semibold">
            Volver
          </Link>
        </div>
      </header>

      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

      <section className="surface rounded-3xl border border-black/10 p-6 shadow-card">
        <h2 className="text-lg font-bold">Detalles</h2>
        {task ? (
          <div className="mt-3 grid gap-2 text-sm">
            <div>
              <span className="font-semibold">Título:</span> {task.title}
            </div>
            <div>
              <span className="font-semibold">Estado:</span> {statusLabel} | <span className="font-semibold">Prioridad:</span>{" "}
              {formatTaskPriority(task.priority)}
            </div>
            <div>
              <span className="font-semibold">Proyecto:</span> {task.projectId}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-black/60">Cargando...</p>
        )}

        <h3 className="mt-6 text-sm font-bold">Cambiar estado</h3>
        <p className="mt-1 text-xs text-black/60">Solo usuarios asignados pueden cambiar el estado de la tarea.</p>

        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
          <select
            className="w-full rounded-xl border border-black/20 bg-white px-3 py-2"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            disabled={!token || !task || !isAssignedToTask}
          >
            <option value="">Selecciona un estado...</option>
            <option value="0">Por hacer</option>
            <option value="1">En progreso</option>
            <option value="2">Hecha</option>
          </select>
          <button
            className="rounded-xl bg-taskpro-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            type="button"
            disabled={!token || !task || !isAssignedToTask || newStatus === ""}
            onClick={async () => {
              if (!token || !task) return;
              setError(null);
              try {
                await api.tasks.updateStatus(token, taskId, Number(newStatus));
                setNewStatus("");
                await refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Update status failed");
              }
            }}
          >
            Actualizar
          </button>
        </div>
      </section>

      <section className="surface rounded-3xl border border-black/10 p-6 shadow-card">
        <h2 className="text-lg font-bold">Assignees</h2>

        <div className="mt-3 text-sm text-black/70">
          {assignees?.userIds?.length ? (
            <ul className="space-y-2">
              {assignees.userIds.map((id) => (
                <li key={id} className="rounded-xl border border-black/10 bg-white/70 px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="break-all">
                      {userById.get(id)?.displayName ?? id}
                      {userById.get(id)?.email ? <span className="text-black/50"> ({userById.get(id)!.email})</span> : null}
                    </span>
                    <button
                      className="rounded bg-taskpro-clay px-3 py-1 text-white"
                      type="button"
                      onClick={async () => {
                        if (!token) return;
                        setError(null);
                        try {
                          await api.assignees.remove(token, taskId, id);
                          await refresh();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "No se pudo quitar la asignación");
                        }
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-black/70">Todavía no hay asignados.</p>
          )}
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
          <select
            className="w-full rounded-xl border border-black/20 bg-white px-3 py-2"
            value={assignUserId}
            onChange={(e) => setAssignUserId(e.target.value)}
            disabled={!token || !task}
          >
            <option value="">Selecciona un usuario...</option>
            {availableUsersForTask.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName} ({u.email})
              </option>
            ))}
          </select>
          <button
            className="rounded-xl bg-taskpro-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            type="button"
            disabled={!token || !assignUserId}
            onClick={async () => {
              if (!token) return;
              setError(null);
              try {
                await api.assignees.add(token, taskId, assignUserId);
                setAssignUserId("");
                await refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "No se pudo asignar el usuario");
              }
            }}
          >
            Asignar
          </button>
        </div>
      </section>

      <section className="surface rounded-3xl border border-black/10 p-6 shadow-card">
        <h2 className="text-lg font-bold">Comentarios</h2>
        <div className="mt-3 grid gap-3">
          {comments.length === 0 ? <p className="text-sm text-black/70">Todavía no hay comentarios.</p> : null}
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-black/10 bg-white p-3">
              <p className="text-sm">{c.content}</p>
              <p className="mt-2 break-all text-xs text-black/50">
                {userById.get(c.authorUserId)?.displayName ?? c.authorUserId} · {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold">Nuevo comentario</label>
          <textarea
            className="mt-1 w-full rounded-xl border border-black/20 bg-white px-3 py-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Escribe algo..."
          />

          <button
            className="mt-3 rounded-xl bg-taskpro-amber px-4 py-2 text-sm font-bold text-black disabled:opacity-60"
            type="button"
            disabled={!token || !content.trim() || !user?.id}
            onClick={async () => {
              if (!token) return;
              setError(null);
              try {
                await api.comments.add(token, { taskId, authorUserId: user!.id, content: content.trim() });
                setContent("");
                await refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Comment failed");
              }
            }}
          >
            Agregar comentario
          </button>
        </div>
      </section>
    </main>
  );
}
