export default function ComparisonSection() {
  return (
    <section id="comparison" className="border-t border-[#e3d8c8] px-5 py-10 md:px-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[#1f2e4a]">Comparison</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[#e0d7c8] bg-[#fffaf0] p-5">
          <h3 className="font-semibold text-[#5f392f]">Legacy</h3>
          <p className="mt-2 text-[#5d605d]">Patchwork tools, delayed reporting, and disconnected execution threads.</p>
        </article>
        <article className="rounded-2xl border border-[#c9ddcf] bg-[#f6fff9] p-5">
          <h3 className="font-semibold text-[#1a514c]">DK v4.1</h3>
          <p className="mt-2 text-[#4f6460]">Unified narrative, channel-aware actions, and measurable growth loop.</p>
        </article>
      </div>
    </section>
  );
}
