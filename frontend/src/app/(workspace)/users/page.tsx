"use client";

import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { UserResponse } from "@/types/domain";
import { FormEvent, useEffect, useState } from "react";

interface UserFormState {
  displayName: string;
  email: string;
}

const initialForm: UserFormState = {
  displayName: "",
  email: ""
};

export default function UsersPage(): JSX.Element {
  const { token } = useAuth();
  const [rows, setRows] = useState<UserResponse[]>([]);
  const [form, setForm] = useState<UserFormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setRows([]);
      return;
    }

    api.users.list(token).then(setRows).catch(() => setRows([]));
  }, [token]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!token) {
      return;
    }

    if (editingId) {
      const updated = await api.users.update(token, editingId, form.email, form.displayName);
      setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditingId(null);
      setForm(initialForm);
      return;
    }

    const created = await api.users.create(token, form.email, form.displayName);
    setRows((prev) => [created, ...prev]);
    setForm(initialForm);
  };

  const onEdit = (user: UserResponse): void => {
    setEditingId(user.id);
    setForm({ displayName: user.displayName, email: user.email });
  };

  const onDelete = async (id: string): Promise<void> => {
    if (!token) {
      return;
    }

    await api.users.delete(token, id);
    setRows((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="fancy-in">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-taskpro-teal">Workspace</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Usuarios</h1>
        <p className="mt-1 text-sm text-black/60">Administra miembros del equipo.</p>
      </header>

      <section className="surface rounded-3xl border border-black/10 p-6 shadow-card">
        <h2 className="text-lg font-bold">{editingId ? "Editar usuario" : "Crear usuario"}</h2>

        <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            className="rounded-lg border border-black/20 bg-white/80 px-3 py-2"
            placeholder="Display name"
            value={form.displayName}
            onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
            required
          />
          <input
            className="rounded-lg border border-black/20 bg-white/80 px-3 py-2"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />

          <div className="flex flex-wrap gap-2 md:justify-end">
            <button className="rounded-lg bg-taskpro-ink px-4 py-2 text-sm font-semibold text-white" type="submit">
              {editingId ? "Actualizar" : "Crear"}
            </button>
            {editingId ? (
              <button
                className="rounded-lg border border-black/20 bg-white/70 px-4 py-2 text-sm font-semibold"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="surface overflow-hidden rounded-3xl border border-black/10 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-black/5 text-left">
              <tr>
                <th className="px-4 py-3">Display name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t border-black/10">
                  <td className="px-4 py-3 font-semibold">{u.displayName}</td>
                  <td className="px-4 py-3 text-black/70">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onEdit(u)} className="rounded bg-taskpro-teal px-3 py-1 text-white" type="button">
                        Editar
                      </button>
                      <button onClick={() => onDelete(u.id)} className="rounded bg-taskpro-clay px-3 py-1 text-white" type="button">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {token && rows.length === 0 ? (
                <tr className="border-t border-black/10">
                  <td className="px-4 py-6 text-center text-black/60" colSpan={3}>
                    No hay usuarios.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
