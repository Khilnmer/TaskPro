"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { TaskResponse } from "@/types/domain";
import { useEffect, useState } from "react";

interface DashboardStats {
  users: number;
  projects: number;
  tasks: number;
  doneTasks: number;
}

export default function DashboardPage(): JSX.Element {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ users: 0, projects: 0, tasks: 0, doneTasks: 0 });

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!token) {
        return;
      }

      const [users, projects] = await Promise.all([api.users.list(token), api.projects.list(token)]);

      const tasksByProject = await Promise.all(projects.map((p) => api.tasks.listByProject(token, p.id)));
      const tasks: TaskResponse[] = tasksByProject.flat();

      setStats({
        users: users.length,
        projects: projects.length,
        tasks: tasks.length,
        doneTasks: tasks.filter((task) => task.status === 2).length
      });
    };

    load().catch(() => {
      setStats({ users: 0, projects: 0, tasks: 0, doneTasks: 0 });
    });
  }, [token]);

  const progress = stats.tasks > 0 ? Math.round((stats.doneTasks / stats.tasks) * 100) : 0;

  return (
    <div className="fancy-in space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-black/45">Panel Ejecutivo</p>
        <h1 className="mt-2 text-3xl font-bold">Hola, {user?.displayName}</h1>
        <p className="mt-1 text-sm text-black/60">Resumen operativo de TaskPro en tiempo real.</p>
      </header>

      <section className="card-grid">
        <StatCard title="Usuarios" value={String(stats.users)} detail="Equipo registrado" />
        <StatCard title="Proyectos" value={String(stats.projects)} detail="Iniciativas activas" />
        <StatCard title="Tareas" value={String(stats.tasks)} detail="Total planificado" />
        <StatCard title="Avance" value={`${progress}%`} detail="Tareas completadas" />
      </section>

    </div>
  );
}
