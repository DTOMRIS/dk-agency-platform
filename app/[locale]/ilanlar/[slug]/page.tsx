import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

import { getListingBySlug } from '@/lib/db/listings-repository';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { getAlternates } from '@/lib/seo/alternates';
import ListingDetailClient from '@/components/listings/ListingDetailClient';

const detailCopy: Record<Locale, { back: string; details: string; contact: string; whatsapp: string; leadTitle: string }> = {
  az: { back: '← Bütün elanlar', details: 'Tipə görə detallar', contact: 'Sürətli əlaqə', whatsapp: 'WhatsApp ilə yaz', leadTitle: 'Müraciət et' },
  tr: { back: '← Tüm ilanlar', details: 'Tipe göre detaylar', contact: 'Hızlı iletişim', whatsapp: 'WhatsApp ile yaz', leadTitle: 'Başvur' },
  en: { back: '← All listings', details: 'Type-specific details', contact: 'Quick contact', whatsapp: 'Message on WhatsApp', leadTitle: 'Inquire' },
  ru: { back: '← Все объявления', details: 'Детали по типу', contact: 'Быстрая связь', whatsapp: 'Написать в WhatsApp', leadTitle: 'Оставить заявку' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const normalized = normalizeLocale(locale);
  const listing = await getListingBySlug(slug, normalized);

  if (!listing) return { title: 'Elan tapılmadı' };

  return {
    title: `${listing.title} | DK Agency`,
    description: listing.description?.slice(0, 160) || '',
    alternates: getAlternates(locale, `/ilanlar/${slug}`),
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

  const copy = detailCopy[normalized];

  return (
    <ListingDetailClient listing={listing} copy={copy} locale={normalized} />
  );
}
