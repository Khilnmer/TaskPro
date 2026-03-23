import Link from "next/link";

export default function HomePage(): JSX.Element {
  return (
    <main className="page-shell landing-shell mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <header className="fancy-in hero-header flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-taskpro-teal">SaaS Project Ops</p>
          <h1 className="mt-2 text-4xl font-bold md:text-6xl">TaskPro</h1>
        </div>
        <Link
          href="/login"
          className="primary-action rounded-full bg-taskpro-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
        >
          Iniciar sesion
        </Link>
      </header>

      <section className="fancy-in hero-grid mt-14 grid gap-8 md:grid-cols-[1.3fr_1fr]">
        <article className="surface hero-panel rounded-3xl border border-black/10 p-8 shadow-card">
          <h2 className="text-2xl font-bold md:text-3xl">Gestiona proyectos y tareas con trazabilidad real</h2>
          <p className="mt-4 max-w-xl text-lg text-black/70">
            Frontend listo para integrar con API .NET 8, JWT, SQL Server y MongoDB. Incluye modulos CRUD para
            usuarios, proyectos y tareas con experiencia responsive.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="primary-action accent rounded-xl bg-taskpro-amber px-5 py-3 text-sm font-bold text-black transition hover:translate-y-[-1px]"
            >
              Crear cuenta
            </Link>
            <Link
              href="/dashboard"
              className="secondary-action rounded-xl border border-black/20 px-5 py-3 text-sm font-semibold transition hover:bg-white"
            >
              Ver dashboard
            </Link>
          </div>
        </article>

        <article className="surface stack-panel rounded-3xl border border-black/10 p-8 shadow-card">
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Stack tecnico</p>
          <ul className="mt-4 space-y-3 text-sm md:text-base">
            <li>React + Next.js (SSR/SPA)</li>
            <li>JWT, roles y rutas protegidas</li>
            <li>CRUD de usuarios, proyectos y tareas</li>
            <li>API layer preparada para .NET 8</li>
            <li>Responsive design para demo en vivo</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
