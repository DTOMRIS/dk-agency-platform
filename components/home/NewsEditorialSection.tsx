export default function NewsEditorialSection() {
  return (
    <section id="news-editorial" className="border-t border-[var(--dk-warm-border)] px-5 py-10 md:px-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[var(--dk-indigo)]">News Editorial</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <article className="rounded-2xl border border-[var(--dk-warm-border)] bg-dk-paper p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--dk-teal)]">Featured</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--dk-indigo)]">Distribution-first newsroom layout for multilingual stories.</h3>
          <p className="mt-2 text-[var(--dk-ink-soft)]">Featured lead plus list view for daily publishing rhythm.</p>
        </article>
        <aside className="rounded-2xl border border-[var(--dk-warm-border)] bg-dk-paper p-5">
          <h4 className="font-semibold text-[color-mix(in srgb, var(--dk-red-strong) 68%, black)]">Most Read</h4>
          <ul className="mt-2 space-y-2 text-sm text-[var(--dk-ink-soft)]">
            <li>Food Cost Q1 Benchmark</li>
            <li>Labor Scheduling Playbook</li>
            <li>Supplier Volatility Map</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
