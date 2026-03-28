'use client';

import { useMemo, useState } from 'react';

type Tab = 'ekipman' | 'devir' | 'tedarikci';

const DATA: Record<Tab, { title: string; city: string }[]> = {
  ekipman: [
    { title: 'Combi Oven Package', city: 'Baku' },
    { title: 'Prep Chiller Set', city: 'Ganja' },
  ],
  devir: [
    { title: 'Cafe Transfer Deal', city: 'Sumqayit' },
    { title: 'Branch Exit Opportunity', city: 'Baku' },
  ],
  tedarikci: [
    { title: 'Cold Chain Supplier', city: 'Baku' },
    { title: 'Fresh Network Vendor', city: 'Shaki' },
  ],
};

export default function ListingsPreviewSection() {
  const [tab, setTab] = useState<Tab>('ekipman');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim();
    return DATA[tab].filter((item) => !q || item.title.toLowerCase().includes(q));
  }, [tab, query]);

  return (
    <section id="listings-preview" className="border-t border-[var(--dk-warm-border)] px-5 py-10 md:px-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[var(--dk-indigo)]">Listings Preview</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {(['ekipman', 'devir', 'tedarikci'] as const).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            className={`rounded-full border px-3 py-1 text-sm ${tab === name ? 'bg-[color-mix(in srgb, var(--dk-mint) 70%, white)] border-[var(--dk-line)]' : 'bg-dk-paper border-[var(--dk-warm-border)]'}`}
          >
            {name}
          </button>
        ))}
      </div>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search listings"
        className="mt-4 w-full md:w-80 rounded-xl border border-[var(--dk-warm-border)] bg-white px-3 py-2"
      />
      <div className="mt-4 grid gap-3">
        {rows.map((row) => (
          <article key={row.title} className="rounded-xl border border-[var(--dk-line)] bg-[color-mix(in srgb, var(--dk-paper) 35%, white)] p-4">
            <h3 className="font-semibold text-[var(--dk-ink)]">{row.title}</h3>
            <p className="text-sm text-[var(--dk-ink-soft)]">{row.city}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
