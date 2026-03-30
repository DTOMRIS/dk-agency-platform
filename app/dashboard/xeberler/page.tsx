'use client';

import { useState } from 'react';
import { adminNewsQueue } from '@/lib/data/adminContent';

type FilterStatus = 'all' | 'fetched' | 'approved' | 'rejected';

export default function DashboardXeberlerPage() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const items = filter === 'all' ? adminNewsQueue : adminNewsQueue.filter((item) => item.status === filter);

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">Xəbərlər İdarəsi</h1>
          <p className="mt-3 text-sm text-slate-500">RSS pipeline hələ mock rejimdədir, amma review shell tam hazırdır.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            ['all', 'Hamısı'],
            ['fetched', 'Gözləyən'],
            ['approved', 'Təsdiqlənmiş'],
            ['rejected', 'Rədd'],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter(value as FilterStatus)} className={`rounded-full px-5 py-3 text-sm font-bold ${filter === value ? 'bg-[var(--dk-red)] text-white' : 'border border-slate-200 text-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-400">
              <tr>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Başlıq</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Mənbə</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Kateqoriya</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Status</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Tarix</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-semibold text-[var(--dk-navy)]">{item.title}</td>
                  <td className="px-5 py-4 text-slate-600">{item.source}</td>
                  <td className="px-5 py-4 text-slate-600">{item.category}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : item.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{item.date}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => console.log('news_approve', item.id)} className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Təsdiqlə</button>
                      <button type="button" onClick={() => console.log('news_reject', item.id)} className="rounded-full bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Rədd et</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
