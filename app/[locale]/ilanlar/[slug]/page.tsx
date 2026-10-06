import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

import { getListingBySlug } from '@/lib/db/listings-repository';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { getAlternates } from '@/lib/seo/alternates';
import ListingDetailClient from '@/components/listings/ListingDetailClient';

type DetailCopy = {
  back: string;
  details: string;
  contact: string;
  whatsapp: string;
  leadTitle: string;
  share: string;
  shareLead: string;
  copyLink: string;
  linkCopied: string;
};

const SITE_URL = 'https://dkagency.com.tr';

const detailCopy: Record<Locale, DetailCopy> = {
  az: { back: '← Bütün elanlar', details: 'Tipə görə detallar', contact: 'Sürətli əlaqə', whatsapp: 'WhatsApp ilə yaz', leadTitle: 'Müraciət et', share: 'WhatsApp-da paylaş', shareLead: 'DK Agency elanı', copyLink: 'Linki kopyala', linkCopied: 'Link kopyalandı!' },
  tr: { back: '← Tüm ilanlar', details: 'Tipe göre detaylar', contact: 'Hızlı iletişim', whatsapp: 'WhatsApp ile yaz', leadTitle: 'Başvur', share: 'WhatsApp’ta paylaş', shareLead: 'DK Agency ilanı', copyLink: 'Linki kopyala', linkCopied: 'Link kopyalandı!' },
  en: { back: '← All listings', details: 'Type-specific details', contact: 'Quick contact', whatsapp: 'Message on WhatsApp', leadTitle: 'Inquire', share: 'Share on WhatsApp', shareLead: 'DK Agency listing', copyLink: 'Copy link', linkCopied: 'Link copied!' },
  ru: { back: '← Все объявления', details: 'Детали по типу', contact: 'Быстрая связь', whatsapp: 'Написать в WhatsApp', leadTitle: 'Оставить заявку', share: 'Поделиться в WhatsApp', shareLead: 'Объявление DK Agency', copyLink: 'Скопировать ссылку', linkCopied: 'Ссылка скопирована!' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const normalized = normalizeLocale(locale);
  const listing = await getListingBySlug(slug, normalized);

  if (!listing) return { title: 'Elan tapılmadı' };

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

  const copy = detailCopy[normalized];
  const canonicalUrl = `${SITE_URL}${normalized === 'az' ? '' : `/${normalized}`}/ilanlar/${slug}`;
  // TASK-0497: the client component is serialized into the page — send it only public data
  // (inquiry leads, review notes and the owner e-mail are admin data).
  const publicListing = { ...listing, leads: [], reviewNotes: [], email: '' };

  return (
    <ListingDetailClient listing={publicListing} copy={copy} locale={normalized} canonicalUrl={canonicalUrl} />
  );
}
