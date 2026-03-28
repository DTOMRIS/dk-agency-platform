export default function HizlandirAlternatingSection() {
  return (
    <section id="hizlandir-alternating" className="border-t border-[var(--dk-warm-border)] px-5 py-10 md:px-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[var(--dk-indigo)]">Hizlandir Alternating</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--dk-warm-border)] bg-dk-paper p-5">
          <h3 className="font-semibold text-[color-mix(in srgb, var(--dk-ink) 82%, white)]">Module A</h3>
          <p className="mt-2 text-[var(--dk-ink-soft)]">Revenue pacing and staffing alignment in one frame.</p>
        </article>
        <article className="rounded-2xl border border-[var(--dk-line)] bg-[color-mix(in srgb, var(--dk-mint) 28%, white)] p-5">
          <h3 className="font-semibold text-[var(--dk-teal)]">Module B</h3>
          <p className="mt-2 text-[var(--dk-ink-soft)]">Distribution hooks for newsroom and audience channels.</p>
        </article>
      </div>
    </section>
  );
}
