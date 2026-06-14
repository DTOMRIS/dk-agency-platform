/**
 * @file Preview route for HeroMotif — NOT public, dev only.
 * Shows all 3 presets side by side + hero layout demo.
 */
import { HeroMotif } from '@/components/HeroMotif';

export default function HeroMotifPreview() {
  return (
    <main className="min-h-screen bg-[#F8F7F4] px-4 py-10 text-[#1A1A2E]">
      <div className="mx-auto max-w-6xl space-y-16">
        <header>
          <h1 className="font-display text-4xl font-black">HeroMotif Preview</h1>
          <p className="mt-2 text-slate-500">3 preset, canlı canvas animasyon. Dev-only route.</p>
        </header>

        {/* Preset: brand (sidebar) */}
        <section>
          <h2 className="mb-4 text-xl font-bold">1. Brand (Ana Sayfa Hero)</h2>
          <div className="grid gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-[1fr_380px]">
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <span className="inline-flex w-fit rounded-full bg-[#FFF8E7] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C5A022]">
                Ustalığın Nişanı
              </span>
              <h3 className="mt-4 font-display text-3xl font-black leading-tight text-[#1A1A2E] lg:text-4xl">
                Azərbaycanın İlk AI-Dəstəkli HoReCa Platforması
              </h3>
              <p className="mt-4 max-w-md text-lg text-slate-600">
                Pulsuz toolkit, ekspert blog, restoran devri və franchise.
              </p>
              <button className="mt-6 w-fit rounded-xl bg-[#E94560] px-6 py-3 font-bold text-white transition hover:bg-[#d73753]">
                KAZAN AI-nı dene →
              </button>
            </div>
            <HeroMotif
              preset="brand"
              className="rounded-r-2xl"
              ariaLabel="DK Agency dekorativ motif"
            />
          </div>
        </section>

        {/* Preset: kazan (fill) */}
        <section>
          <h2 className="mb-4 text-xl font-bold">2. KAZAN (Advisor Hero)</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <HeroMotif
              preset="kazan"
              className="h-[300px]"
              ariaLabel="KAZAN AI dekorativ motif"
            />
          </div>
        </section>

        {/* Preset: editorial (band) */}
        <section>
          <h2 className="mb-4 text-xl font-bold">3. Editorial (Amiral Makale)</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <HeroMotif
              preset="editorial"
              ariaLabel="Editorial dekorativ motif"
            />
            <div className="p-8">
              <h3 className="font-display text-2xl font-black text-[#1A1A2E]">
                DK Amiral Editorial
              </h3>
              <p className="mt-2 text-slate-500">Uzun form editoryal düzeni burada başlar.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
