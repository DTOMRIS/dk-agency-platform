import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KAZAN AI | Tezliklə',
  description: 'KAZAN AI tezliklə aktiv olacaq.',
};

export default function KazanAiPage() {
  return (
    <main className="min-h-[70vh] bg-[var(--dk-paper)] px-4 py-24">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mb-4 inline-flex rounded-full bg-amber-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-800">
          Tezliklə
        </div>
        <h1 className="text-4xl font-black text-slate-900">KAZAN AI</h1>
        <p className="mt-4 text-lg text-slate-600">KAZAN AI tezliklə aktiv olacaq.</p>
      </div>
    </main>
  );
}
