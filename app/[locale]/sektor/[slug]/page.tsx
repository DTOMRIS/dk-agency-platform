import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import SektorLanding from '@/components/sektor/SektorLanding';
import { getSektorConfig } from '@/lib/data/sektorConfigs';

// Only `slug` is read from params — the locale comes from `getLocale()` so this
// page works both at `/[locale]/sektor/[slug]` and via the locale-less root
// mirror `app/sektor/[slug]` (where `params` has no `locale`).
interface SektorPageParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SektorPageParams): Promise<Metadata> {
  const { slug } = await params;
  const config = getSektorConfig(slug);
  if (!config) {
    return { title: 'Sektor tapılmadı | DK Agency' };
  }

  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: config.namespace });
  const title = t('pageTitle');

  return {
    title,
    description: config.metaDescription,
    openGraph: {
      title,
      description: config.metaDescription,
      type: 'website',
    },
  };
}

export default async function SektorSlugPage({ params }: SektorPageParams) {
  const { slug } = await params;
  const config = getSektorConfig(slug);
  if (!config) {
    notFound();
  }

  return <SektorLanding config={config} />;
}
