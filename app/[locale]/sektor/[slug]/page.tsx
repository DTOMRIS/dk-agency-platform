import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getSektorConfig, VALID_SEKTOR_SLUGS } from '@/lib/data/sektorConfigs';
import SektorPageClient from './SektorPageClient';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return VALID_SEKTOR_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = getSektorConfig(slug);
  if (!config) return {};

  const t = await getTranslations(config.namespace);

  return {
    title: t(config.meta.titleKey),
    description: t(config.meta.descriptionKey),
    openGraph: {
      title: t(config.meta.ogTitleKey),
      description: t(config.meta.ogDescriptionKey),
      type: 'website',
      images: [
        {
          url: `/sektor/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${t(config.meta.ogTitleKey)} — DK Agency`,
        },
      ],
    },
  };
}

export default async function SektorPage({ params }: PageProps) {
  const { slug } = await params;
  const config = getSektorConfig(slug);
  if (!config) notFound();

  return <SektorPageClient config={config} />;
}
