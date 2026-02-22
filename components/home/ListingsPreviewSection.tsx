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
    <section id="listings-preview" className="border-t border-[#e3d8c8] px-5 py-10 md:px-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[#1f2e4a]">Listings Preview</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {(['ekipman', 'devir', 'tedarikci'] as const).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            className={`rounded-full border px-3 py-1 text-sm ${tab === name ? 'bg-[#dcefe8] border-[#9bc5b9]' : 'bg-[#fff7ea] border-[#dccbb5]'}`}
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
        className="mt-4 w-full md:w-80 rounded-xl border border-[#d7cab8] bg-white px-3 py-2"
      />
      <div className="mt-4 grid gap-3">
        {rows.map((row) => (
          <article key={row.title} className="rounded-xl border border-[#d6dccf] bg-[#fafdff] p-4">
            <h3 className="font-semibold text-[#1d3f5a]">{row.title}</h3>
            <p className="text-sm text-[#5a6668]">{row.city}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
