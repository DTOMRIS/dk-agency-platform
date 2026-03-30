'use client';

import { useState } from 'react';
import { adminUsers } from '@/lib/data/adminContent';

export default function DashboardUsersPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedUser = adminUsers.find((item) => item.id === selectedId);

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">İstifadəçilər</h1>
          <p className="mt-3 text-sm text-slate-500">Mock üzv siyahısı, verify statusu və elan aktivliyi burada görünür.</p>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-400">
              <tr>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Ad</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Email</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Telefon</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Qeydiyyat</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Verified</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Elan sayı</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Son giriş</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Detallar</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-semibold text-[var(--dk-navy)]">{user.name}</td>
                  <td className="px-5 py-4 text-slate-600">{user.email}</td>
                  <td className="px-5 py-4 text-slate-600">{user.phone}</td>
                  <td className="px-5 py-4 text-slate-500">{user.createdAt}</td>
                  <td className="px-5 py-4">{user.emailVerified ? '✓' : '✗'}</td>
                  <td className="px-5 py-4 text-slate-600">{user.listingCount}</td>
                  <td className="px-5 py-4 text-slate-500">{user.lastLogin}</td>
                  <td className="px-5 py-4">
                    <button type="button" onClick={() => setSelectedId(user.id)} className="rounded-full bg-[var(--dk-red)] px-4 py-2 text-xs font-bold text-white">Detallar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedUser ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">{selectedUser.name}</h2>
              <button type="button" onClick={() => setSelectedId(null)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700">Bağla</button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <div><strong>Email:</strong> {selectedUser.email}</div>
                <div className="mt-2"><strong>Telefon:</strong> {selectedUser.phone}</div>
                <div className="mt-2"><strong>Email verified:</strong> {selectedUser.emailVerified ? 'Bəli' : 'Xeyr'}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <div><strong>Elan sayı:</strong> {selectedUser.listingCount}</div>
                <div className="mt-2"><strong>Lead sayı:</strong> {selectedUser.leads}</div>
                <div className="mt-2"><strong>Son giriş:</strong> {selectedUser.lastLogin}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
