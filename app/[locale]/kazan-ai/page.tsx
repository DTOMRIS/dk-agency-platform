import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { normalizeLocale } from '@/i18n/config';

export { default } from '@/app/kazan-ai/page';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: 'kazanAi.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}
