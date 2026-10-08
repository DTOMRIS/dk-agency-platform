'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Briefcase, Mail, MessageCircle, Phone } from 'lucide-react';

import { formatDate, useOwnerListings } from '@/components/b2b-panel/useOwnerListings';

// TASK-0507: əvvəl "Bu bölmə hazırlanır" idi. Mənbə — üzvün öz elanlarına gələn maraq sorğuları
// (`listing_leads`), GET /api/listings?scope=owner ilə; yeni API/cədvəl yoxdur.
export default function OffersPage() {
  const t = useTranslations('b2bPages.offers');
  const { listings, loading, failed } = useOwnerListings();

  const offers = listings
    .flatMap((listing) => (listing.leads ?? []).map((lead) => ({ lead, listing })))
    .sort((a, b) => b.lead.createdAt.localeCompare(a.lead.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
      <p className="mt-1 text-sm text-slate-600">{t('subtitle')}</p>

      {loading ? (
        <p className="mt-8 text-sm text-slate-600">{t('loading')}</p>
      ) : failed ? (
        <p className="mt-8 text-sm text-red-700">{t('error')}</p>
      ) : offers.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
            <Briefcase size={26} className="text-amber-500" />
          </div>
          <p className="font-semibold text-slate-900">{t('emptyTitle')}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
            {listings.length === 0 ? t('emptyNoListings') : t('emptyHasListings')}
          </p>
          <Link
            href={listings.length === 0 ? '/b2b-panel/yeni-ilan' : '/b2b-panel/ilanlarim'}
            className="mt-5 inline-flex rounded-xl bg-dk-red px-4 py-2 text-sm font-semibold text-white"
          >
            {listings.length === 0 ? t('ctaNewListing') : t('ctaMyListings')}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3" data-testid="offers-list">
          {offers.map(({ lead, listing }, i) => {
            const wa = lead.phone.replace(/\D/g, '');
            return (
              <li key={`${listing.id}-${i}`} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{lead.name}</p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {t('forListing')}: <span className="font-medium text-slate-800">{listing.title}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.status === 'new' && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        {t('statusNew')}
                      </span>
                    )}
                    <span className="text-xs text-slate-600">{formatDate(lead.createdAt)}</span>
                  </div>
                </div>
                {lead.message && (
                  <p className="mt-3 whitespace-pre-line text-sm text-slate-800">{lead.message}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      <Phone size={14} /> {lead.phone}
                    </a>
                  )}
                  {wa.length >= 9 && (
                    <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  )}
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      <Mail size={14} /> {lead.email}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
