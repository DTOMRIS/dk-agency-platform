'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { adminUsers } from '@/lib/data/adminContent';
import { normalizeLocale, type Locale } from '@/i18n/config';

const pageCopy: Record<Locale, {
  pageTitle: string;
  pageSubtitle: string;
  colName: string;
  colEmail: string;
  colPhone: string;
  colRegistered: string;
  colVerified: string;
  colListings: string;
  colLastLogin: string;
  colDetails: string;
  detailsButton: string;
  closeButton: string;
  detailEmail: string;
  detailPhone: string;
  detailEmailVerified: string;
  detailListings: string;
  detailLeads: string;
  detailLastLogin: string;
  verifiedYes: string;
  verifiedNo: string;
}> = {
  az: {
    pageTitle: 'İstifadəçilər',
    pageSubtitle: 'Mock üzv siyahısı, verify statusu və elan aktivliyi burada görünür.',
    colName: 'Ad',
    colEmail: 'Email',
    colPhone: 'Telefon',
    colRegistered: 'Qeydiyyat',
    colVerified: 'Verified',
    colListings: 'Elan sayı',
    colLastLogin: 'Son giriş',
    colDetails: 'Detallar',
    detailsButton: 'Detallar',
    closeButton: 'Bağla',
    detailEmail: 'Email',
    detailPhone: 'Telefon',
    detailEmailVerified: 'Email verified',
    detailListings: 'Elan sayı',
    detailLeads: 'Lead sayı',
    detailLastLogin: 'Son giriş',
    verifiedYes: 'Bəli',
    verifiedNo: 'Xeyr',
  },
  ru: {
    pageTitle: 'Пользователи',
    pageSubtitle: 'Список mock-участников, статус верификации и активность объявлений отображаются здесь.',
    colName: 'Имя',
    colEmail: 'Email',
    colPhone: 'Телефон',
    colRegistered: 'Регистрация',
    colVerified: 'Верифицирован',
    colListings: 'Объявлений',
    colLastLogin: 'Последний вход',
    colDetails: 'Подробности',
    detailsButton: 'Подробности',
    closeButton: 'Закрыть',
    detailEmail: 'Email',
    detailPhone: 'Телефон',
    detailEmailVerified: 'Email верифицирован',
    detailListings: 'Объявлений',
    detailLeads: 'Лидов',
    detailLastLogin: 'Последний вход',
    verifiedYes: 'Да',
    verifiedNo: 'Нет',
  },
  en: {
    pageTitle: 'Users',
    pageSubtitle: 'Mock member list, verification status and listing activity are shown here.',
    colName: 'Name',
    colEmail: 'Email',
    colPhone: 'Phone',
    colRegistered: 'Registered',
    colVerified: 'Verified',
    colListings: 'Listings',
    colLastLogin: 'Last Login',
    colDetails: 'Details',
    detailsButton: 'Details',
    closeButton: 'Close',
    detailEmail: 'Email',
    detailPhone: 'Phone',
    detailEmailVerified: 'Email verified',
    detailListings: 'Listings',
    detailLeads: 'Leads',
    detailLastLogin: 'Last login',
    verifiedYes: 'Yes',
    verifiedNo: 'No',
  },
  tr: {
    pageTitle: 'Kullanıcılar',
    pageSubtitle: 'Mock üye listesi, doğrulama durumu ve ilan aktivitesi burada görünür.',
    colName: 'Ad',
    colEmail: 'Email',
    colPhone: 'Telefon',
    colRegistered: 'Kayıt',
    colVerified: 'Doğrulandı',
    colListings: 'İlan sayısı',
    colLastLogin: 'Son giriş',
    colDetails: 'Detaylar',
    detailsButton: 'Detaylar',
    closeButton: 'Kapat',
    detailEmail: 'Email',
    detailPhone: 'Telefon',
    detailEmailVerified: 'Email doğrulandı',
    detailListings: 'İlan sayısı',
    detailLeads: 'Lead sayısı',
    detailLastLogin: 'Son giriş',
    verifiedYes: 'Evet',
    verifiedNo: 'Hayır',
  },
};

export default function DashboardUsersPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedUser = adminUsers.find((item) => item.id === selectedId);

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">{copy.pageTitle}</h1>
          <p className="mt-3 text-sm text-slate-500">{copy.pageSubtitle}</p>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-400">
              <tr>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colName}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colEmail}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colPhone}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colRegistered}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colVerified}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colListings}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colLastLogin}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colDetails}</th>
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
                    <button type="button" onClick={() => setSelectedId(user.id)} className="rounded-full bg-[var(--dk-red)] px-4 py-2 text-xs font-bold text-white">{copy.detailsButton}</button>
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
              <button type="button" onClick={() => setSelectedId(null)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700">{copy.closeButton}</button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <div><strong>{copy.detailEmail}:</strong> {selectedUser.email}</div>
                <div className="mt-2"><strong>{copy.detailPhone}:</strong> {selectedUser.phone}</div>
                <div className="mt-2"><strong>{copy.detailEmailVerified}:</strong> {selectedUser.emailVerified ? copy.verifiedYes : copy.verifiedNo}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <div><strong>{copy.detailListings}:</strong> {selectedUser.listingCount}</div>
                <div className="mt-2"><strong>{copy.detailLeads}:</strong> {selectedUser.leads}</div>
                <div className="mt-2"><strong>{copy.detailLastLogin}:</strong> {selectedUser.lastLogin}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
