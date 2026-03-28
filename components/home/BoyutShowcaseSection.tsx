export default function BoyutShowcaseSection() {
  const metrics = [
    '32% faster decision cycle',
    '95% weekly digest coverage',
    '3.2x higher lead qualification',
  ];

  return (
    <section id="boyut-showcase" className="border-t border-[var(--dk-warm-border)] px-5 py-10 md:px-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[var(--dk-indigo)]">Boyut Showcase</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric} className="rounded-xl border border-[var(--dk-line)] bg-[color-mix(in srgb, var(--dk-mint) 32%, white)] px-4 py-3 text-[var(--dk-teal)] font-medium">
            {metric}
          </div>
        ))}
      </div>
    </section>
  );
}
