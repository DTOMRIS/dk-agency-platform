export default function HizlandirAlternatingSection() {
  return (
    <section id="hizlandir-alternating" className="border-t border-[#e3d8c8] px-5 py-10 md:px-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[#1f2e4a]">Hizlandir Alternating</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[#d6c9b8] bg-[#fff9ed] p-5">
          <h3 className="font-semibold text-[#423d34]">Module A</h3>
          <p className="mt-2 text-[#5d5e58]">Revenue pacing and staffing alignment in one frame.</p>
        </article>
        <article className="rounded-2xl border border-[#c4d9d3] bg-[#f2fbf8] p-5">
          <h3 className="font-semibold text-[#204d4a]">Module B</h3>
          <p className="mt-2 text-[#4c6260]">Distribution hooks for newsroom and audience channels.</p>
        </article>
      </div>
    </section>
  );
}
