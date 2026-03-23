"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage(): JSX.Element {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("ana@taskpro.dev");
  const [password, setPassword] = useState("TaskPro123*");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo iniciar sesion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Iniciar sesion</h1>
      <p className="mt-2 text-sm text-black/60">Accede a tu workspace para gestionar proyectos y tareas.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm font-semibold">
          Correo
          <input
            className="mt-1 w-full rounded-xl border border-black/20 bg-white px-3 py-2"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
        </label>

        <label className="block text-sm font-semibold">
          Contrasena
          <input
            className="mt-1 w-full rounded-xl border border-black/20 bg-white px-3 py-2"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
          />
        </label>

        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-taskpro-ink px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-4 text-sm text-black/60">
        No tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-taskpro-teal">
          Registrate
        </Link>
      </p>
    </>
  );
}
