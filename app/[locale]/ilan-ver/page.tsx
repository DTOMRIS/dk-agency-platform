import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { normalizeLocale } from '@/i18n/config';
import IlanVerPage from '@/app/ilan-ver/page';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: normalizeLocale(locale), namespace: 'createListing.meta' });
  return { title: t('title'), description: t('description') };
}

export default function LocalizedIlanVerPage() {
  return <IlanVerPage />;
}
