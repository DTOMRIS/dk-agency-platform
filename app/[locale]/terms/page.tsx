import { normalizeLocale, isLocale } from '@/i18n/config';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TermsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = normalizeLocale(rawLocale);

  return <LegalPageLayout locale={locale} document="terms" />;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  const titles: Record<string, string> = {
    az: 'İstifadə Şərtləri — DK Agency',
    ru: 'Условия использования — DK Agency',
    en: 'Terms of Use — DK Agency',
    tr: 'Kullanım Koşulları — DK Agency',
  };

  return { title: titles[locale] };
}
