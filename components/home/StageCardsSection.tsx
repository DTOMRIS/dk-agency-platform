export default function StageCardsSection() {
  const items = [
    { title: 'Stage 1', text: 'Diagnose margin leaks and bottlenecks.' },
    { title: 'Stage 2', text: 'Simulate scenarios before execution.' },
    { title: 'Stage 3', text: 'Ship actions through modular ops routes.' },
  ];

  return (
    <section id="stage-cards" className="border-t border-[var(--dk-warm-border)] px-5 py-10 md:px-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[var(--dk-indigo)]">Stage Cards</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-2xl border border-[var(--dk-line)] bg-[color-mix(in srgb, var(--dk-mint) 22%, white)] p-5">
            <h3 className="text-lg font-semibold text-[var(--dk-teal)]">{item.title}</h3>
            <p className="mt-2 text-[var(--dk-ink-soft)]">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
