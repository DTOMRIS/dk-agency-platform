'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bell, CheckCircle, Clock, Inbox, XCircle, type LucideIcon } from 'lucide-react';

import { formatDate, useOwnerListings, type OwnerListing } from '@/components/b2b-panel/useOwnerListings';

// TASK-0507: ayrıca bildiriş cədvəli YOXDUR — lent üzvün öz elanlarından qurulur:
// elanın statusu (yayımlandı / rədd edildi / yoxlanılır) və elana gələn hər təklif.
// "Oxunmamış" yalnız bu brauzerdə saxlanır (localStorage) — cihazlar arası sinxron deyil.
const SEEN_KEY = 'dk_b2b_notifications_seen_at';

type Item = { key: string; at: string; icon: LucideIcon; tone: string; text: string; href: string };

function buildItems(listings: OwnerListing[], t: (k: string, v?: Record<string, string>) => string): Item[] {
  const items: Item[] = [];
  for (const l of listings) {
    const at = l.updatedAt ?? l.createdAt;
    if (l.status === 'showcase_ready') {
      items.push({ key: `s-${l.id}`, at, icon: CheckCircle, tone: 'bg-green-50 text-green-600', text: t('published', { title: l.title }), href: '/b2b-panel/ilanlarim' });
    } else if (l.status === 'rejected') {
      const reason = l.rejectedReason ? ` — ${l.rejectedReason}` : '';
      items.push({ key: `s-${l.id}`, at, icon: XCircle, tone: 'bg-red-50 text-red-600', text: t('rejected', { title: l.title }) + reason, href: '/b2b-panel/ilanlarim' });
    } else if (l.status !== 'draft') {
      items.push({ key: `s-${l.id}`, at, icon: Clock, tone: 'bg-amber-50 text-amber-600', text: t('inReview', { title: l.title }), href: '/b2b-panel/ilanlarim' });
    }
    (l.leads ?? []).forEach((lead, i) => {
      items.push({ key: `l-${l.id}-${i}`, at: lead.createdAt, icon: Inbox, tone: 'bg-indigo-50 text-indigo-600', text: t('newOffer', { name: lead.name, title: l.title }), href: '/b2b-panel/teklifler' });
    });
  }
  return items.sort((a, b) => b.at.localeCompare(a.at));
}

function readSeen(): string | null {
  try {
    return localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
}

export default function NotificationsPage() {
  const t = useTranslations('b2bPages.notifications');
  const { listings, loading, failed } = useOwnerListings();
  // Səhifə açılanda əvvəlki "görüldü" anı oxunur; sonra indiki an yazılır (növbəti açılış üçün).
  const [seenAt] = useState<string | null>(() => (typeof window === 'undefined' ? null : readSeen()));

  useEffect(() => {
    if (loading) return;
    try {
      localStorage.setItem(SEEN_KEY, new Date().toISOString());
    } catch {
      /* gizli rejim — oxunmamış nişanı sadəcə işləmir */
    }
  }, [loading]);

  const items = buildItems(listings, t);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
      <p className="mt-1 text-sm text-slate-600">{t('subtitle')}</p>

      {loading ? (
        <p className="mt-8 text-sm text-slate-600">{t('loading')}</p>
      ) : failed ? (
        <p className="mt-8 text-sm text-red-700">{t('error')}</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Bell size={26} className="text-slate-500" />
          </div>
          <p className="font-semibold text-slate-900">{t('emptyTitle')}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">{t('emptyText')}</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white" data-testid="notifications-list">
          {items.map((item) => {
            const Icon = item.icon;
            const unread = seenAt === null || item.at > seenAt;
            return (
              <li key={item.key}>
                <Link href={item.href} className="flex items-start gap-3 p-4 hover:bg-slate-50">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.tone}`}>
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm ${unread ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{item.text}</span>
                    <span className="mt-0.5 block text-xs text-slate-600">{formatDate(item.at)}</span>
                  </span>
                  {unread && <span aria-label={t('unread')} className="mt-2 h-2 w-2 shrink-0 rounded-full bg-dk-red" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
