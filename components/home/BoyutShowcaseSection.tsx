export default function BoyutShowcaseSection() {
  const metrics = [
    '32% faster decision cycle',
    '95% weekly digest coverage',
    '3.2x higher lead qualification',
  ];

  return (
    <section id="boyut-showcase" className="border-t border-[#e3d8c8] px-5 py-10 md:px-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[#1f2e4a]">Boyut Showcase</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric} className="rounded-xl border border-[#d0dccf] bg-[#f9fff9] px-4 py-3 text-[#1d4f48] font-medium">
            {metric}
          </div>
        ))}
      </div>
    </section>
  );
}
