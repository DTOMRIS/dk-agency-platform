import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import SektorLanding from '@/components/sektor/SektorLanding';
import { getSektorConfig } from '@/lib/data/sektorConfigs';

interface SektorPageParams {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: SektorPageParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const config = getSektorConfig(slug);
  if (!config) {
    return { title: 'Sektor tapılmadı | DK Agency' };
  }

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
