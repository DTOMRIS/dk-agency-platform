import Link from 'next/link';

export default function SektorNotFound() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-slate-50">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mb-6 text-6xl font-black text-slate-200">404</div>
        <h1 className="mb-3 font-display text-2xl font-bold text-slate-900">
          Bu sektor movcud deyil
        </h1>
        <p className="mb-8 text-sm text-slate-500">
          Axtardiginiz sektor sehifesi tapilmadi. Movcud sektorlara baxin.
        </p>
        <Link
          href="/sektor"
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--dk-red)] px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
        >
          Sektorlara bax
        </Link>
      </div>
    </section>
  );
}
