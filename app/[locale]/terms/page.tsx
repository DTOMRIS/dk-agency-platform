import { normalizeLocale, isLocale } from '@/i18n/config';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { notFound } from 'next/navigation';

// Not force-static: the root layout (header/footer) resolves the locale per request;
// a build-time static render had no locale and shipped an AZ footer on /ru, /en, /tr (TASK-0471).

interface PageProps {
  params: Promise<{ locale?: string }>;
}

export default async function TermsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (rawLocale !== undefined && !isLocale(rawLocale)) notFound(); // undefined = root mirror (az)
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
