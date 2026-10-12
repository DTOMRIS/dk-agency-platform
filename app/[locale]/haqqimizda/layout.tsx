import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import AboutJsonLd from '@/components/seo/AboutJsonLd';
import { normalizeLocale } from '@/i18n/config';
import { getAlternates } from '@/lib/seo/alternates';

/** TASK-0546: /ru|en|tr/haqqimizda had no title of its own (only the AZ root layout had one). */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'aboutV2' });
  return { title: t('metaTitle'), description: t('metaDescription'), alternates: getAlternates(locale, '/haqqimizda') };
}

/** /ru|en|tr/haqqimizda — same About JSON-LD as the AZ root layout (TASK-0475). */
export default function LocalizedHaqqimizdaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AboutJsonLd />
      {children}
    </>
  );
}
