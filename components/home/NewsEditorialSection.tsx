export default function NewsEditorialSection() {
  return (
    <section id="news-editorial" className="border-t border-[#e3d8c8] px-5 py-10 md:px-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[#1f2e4a]">News Editorial</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <article className="rounded-2xl border border-[#d9d2c3] bg-[#fffefb] p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-[#2f6660]">Featured</p>
          <h3 className="mt-2 text-xl font-semibold text-[#1f2e4a]">Distribution-first newsroom layout for multilingual stories.</h3>
          <p className="mt-2 text-[#576262]">Featured lead plus list view for daily publishing rhythm.</p>
        </article>
        <aside className="rounded-2xl border border-[#d7d0bf] bg-[#fff9ee] p-5">
          <h4 className="font-semibold text-[#5f3c2b]">Most Read</h4>
          <ul className="mt-2 space-y-2 text-sm text-[#5f6868]">
            <li>Food Cost Q1 Benchmark</li>
            <li>Labor Scheduling Playbook</li>
            <li>Supplier Volatility Map</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
