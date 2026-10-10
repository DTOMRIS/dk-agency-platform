import { getTranslations } from 'next-intl/server';

import { PricingPage } from '@/components/pricing/PricingPage';
import { normalizeLocale } from '@/i18n/config';
import PageBack from '@/components/inner/PageBack';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: 'pricing' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function PricingRoute({ params }: Props) {
  await params;
  return (
    <>
      <PageBack band />
      <PricingPage />
    </>
  );
}

