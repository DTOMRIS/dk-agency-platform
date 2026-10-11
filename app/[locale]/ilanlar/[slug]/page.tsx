import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { getListingBySlug } from '@/lib/db/listings-repository';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { getAlternates } from '@/lib/seo/alternates';
import ListingDetailClient from '@/components/listings/ListingDetailClient';

const SITE_URL = 'https://dkagency.com.tr';

/** TASK-0523 (v2): every label comes from messages (listingsV2.detail) — no hardcoded copy in the page. */
async function getDetailCopy(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'listingsV2.detail' });
  return {
    details: t('details'),
    contact: t('contact'),
    whatsapp: t('whatsapp'),
    leadTitle: t('leadTitle'),
    share: t('share'),
    shareLead: t('shareLead'),
    copyLink: t('copyLink'),
    linkCopied: t('linkCopied'),
    yes: t('yes'),
    no: t('no'),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const normalized = normalizeLocale(locale);
  const listing = await getListingBySlug(slug, normalized);

  if (!listing) {
    const t = await getTranslations({ locale: normalized, namespace: 'listingsV2.detail' });
    return { title: t('notFound') };
  }

  return {
    title: `${listing.title} | DK Agency`,
    description: listing.description?.slice(0, 160) || '',
    alternates: getAlternates(normalized, `/ilanlar/${slug}`),
    openGraph: {
      title: listing.title,
      description: listing.description?.slice(0, 160) || '',
      images: listing.images?.[0]?.url ? [listing.images[0].url] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const normalized = normalizeLocale(locale);
  const listing = await getListingBySlug(slug, normalized);

  if (!listing) notFound();

  const copy = await getDetailCopy(normalized);
  const canonicalUrl = `${SITE_URL}${normalized === 'az' ? '' : `/${normalized}`}/ilanlar/${slug}`;
  // TASK-0497: the client component is serialized into the page — send it only public data
  // (inquiry leads, review notes and the owner e-mail are admin data).
  const publicListing = { ...listing, leads: [], reviewNotes: [], email: '' };

  return (
    <ListingDetailClient listing={publicListing} copy={copy} locale={normalized} canonicalUrl={canonicalUrl} />
  );
}
