interface StatCardProps {
  title: string;
  value: string;
  detail: string;
}

export function StatCard({ title, value, detail }: StatCardProps): JSX.Element {
  return (
    <article className="rounded-2xl border border-black/10 bg-white/70 p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-black/50">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-black/60">{detail}</p>
    </article>
  );
}
