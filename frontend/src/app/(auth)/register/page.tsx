"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage(): JSX.Element {
  const { register } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await register({ displayName, email, password });
      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Crear cuenta</h1>
      <p className="mt-2 text-sm text-black/60">Registra usuarios para comenzar a colaborar en TaskPro.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm font-semibold">
          Nombre a mostrar
          <input
            className="mt-1 w-full rounded-xl border border-black/20 bg-white px-3 py-2"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
        </label>

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
          Contraseña
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
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-4 text-sm text-black/60">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-taskpro-teal">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
