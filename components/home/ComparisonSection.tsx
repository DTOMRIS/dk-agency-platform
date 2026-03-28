export default function ComparisonSection() {
  return (
    <section id="comparison" className="border-t border-[var(--dk-warm-border)] px-5 py-10 md:px-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[var(--dk-indigo)]">Comparison</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--dk-warm-border)] bg-dk-paper p-5">
          <h3 className="font-semibold text-[color-mix(in srgb, var(--dk-red-strong) 72%, black)]">Legacy</h3>
          <p className="mt-2 text-[var(--dk-ink-soft)]">Patchwork tools, delayed reporting, and disconnected execution threads.</p>
        </article>
        <article className="rounded-2xl border border-[var(--dk-line)] bg-[color-mix(in srgb, var(--dk-mint) 35%, white)] p-5">
          <h3 className="font-semibold text-[var(--dk-teal)]">DK v4.1</h3>
          <p className="mt-2 text-[var(--dk-ink-soft)]">Unified narrative, channel-aware actions, and measurable growth loop.</p>
        </article>
      </div>
    </section>
  );
}
