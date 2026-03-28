export default function StatsBarSection() {
  return (
    <section id="stats-bar" className="border-t border-[var(--dk-warm-border)] px-5 py-10 md:px-8">
      <div className="grid gap-3 md:grid-cols-4">
        {['6.7M monthly impressions', '41% deeper sessions', '94s RSS->channel push', '99.9% route availability'].map((item) => (
          <p key={item} className="rounded-xl border border-[var(--dk-line)] bg-[color-mix(in srgb, var(--dk-mint) 32%, white)] px-4 py-3 text-sm font-semibold text-[var(--dk-teal)]">
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}
