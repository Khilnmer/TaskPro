export default function AuthLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <main className="page-shell auth-shell mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
      <section className="surface auth-card w-full max-w-md rounded-3xl border border-black/10 p-8 shadow-card">{children}</section>
    </main>
  );
}
