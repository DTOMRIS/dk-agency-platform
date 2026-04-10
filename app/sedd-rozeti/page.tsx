import Link from 'next/link';

export default function SeddRozetiPage() {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <span className="inline-flex rounded-full bg-[var(--dk-red)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
          Şədd Rozeti
        </span>
        <h1 className="mt-5 font-display text-4xl font-black text-[var(--dk-navy)] lg:text-6xl">
          DK Agency Şədd Rozeti
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Şədd Rozeti HoReCa bizneslərinin əməliyyat, gigiyena, maliyyə və marka standartlarını
          yoxlayan DK Agency audit nişanıdır.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/elaqe"
            className="inline-flex rounded-lg bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white"
          >
            Audit üçün müraciət et
          </Link>
          <Link
            href="/toolkit"
            className="inline-flex rounded-lg border border-slate-200 px-6 py-3 text-sm font-bold text-[var(--dk-navy)]"
          >
            Toolkit-ə bax
          </Link>
        </div>
      </div>
    </div>
  );
}
