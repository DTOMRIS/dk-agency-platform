/**
 * «İş elanları» — TQTA-dan gələn HoReCa vakansiyaları (TASK-0495).
 * Locale `params`-dan yox, `getLocale()`-dan alınır ki kök mirror (`app/is-elanlari`) da işləsin (L-038).
 */
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import JobsPage, { type JobsSearchParams } from '@/components/jobs/JobsPage';
import { normalizeLocale } from '@/i18n/config';
import { getAlternates } from '@/lib/seo/alternates';

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale());
  const t = await getTranslations({ locale, namespace: 'jobs' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: getAlternates(locale, '/is-elanlari'),
  };
}

export default async function IsElanlariPage({
  searchParams,
}: {
  searchParams: Promise<JobsSearchParams>;
}) {
  const locale = normalizeLocale(await getLocale());
  return <JobsPage locale={locale} searchParams={await searchParams} />;
}
