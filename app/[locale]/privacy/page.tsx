import { normalizeLocale, isLocale } from '@/i18n/config';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = normalizeLocale(rawLocale);

  return <LegalPageLayout locale={locale} document="privacy" />;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  const titles: Record<string, string> = {
    az: 'Məxfilik Siyasəti — DK Agency',
    ru: 'Политика конфиденциальности — DK Agency',
    en: 'Privacy Policy — DK Agency',
    tr: 'Gizlilik Politikası — DK Agency',
  };

  return { title: titles[locale] };
}
