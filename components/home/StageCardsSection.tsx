export default function StageCardsSection() {
  const items = [
    { title: 'Stage 1', text: 'Diagnose margin leaks and bottlenecks.' },
    { title: 'Stage 2', text: 'Simulate scenarios before execution.' },
    { title: 'Stage 3', text: 'Ship actions through modular ops routes.' },
  ];

  return (
    <section id="stage-cards" className="border-t border-[#e3d8c8] px-5 py-10 md:px-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[#1f2e4a]">Stage Cards</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-2xl border border-[#d8decf] bg-[#fbfff8] p-5">
            <h3 className="text-lg font-semibold text-[#18433f]">{item.title}</h3>
            <p className="mt-2 text-[#586765]">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
