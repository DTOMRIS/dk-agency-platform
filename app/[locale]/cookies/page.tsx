import { normalizeLocale, isLocale } from '@/i18n/config';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CookiesPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = normalizeLocale(rawLocale);

  return <LegalPageLayout locale={locale} document="cookie-policy" />;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  const titles: Record<string, string> = {
    az: 'Çərəz Siyasəti — DK Agency',
    ru: 'Политика файлов cookie — DK Agency',
    en: 'Cookie Policy — DK Agency',
    tr: 'Çerez Politikası — DK Agency',
  };

  return { title: titles[locale] };
}
