export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-black">{title}</h1>
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/40">
        Dernière mise à jour : {updated}
      </p>        <div className="card-glass mt-8 rounded-2xl p-6 sm:p-8">
        <div className="space-y-3 text-sm leading-relaxed text-white/70">
          {children}
        </div>
      </div>
    </div>
  );
}

export function LegalH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-6 border-l-2 border-[var(--magenta)] pl-3 text-base font-bold text-white first:mt-2">
      {children}
    </h2>
  );
}