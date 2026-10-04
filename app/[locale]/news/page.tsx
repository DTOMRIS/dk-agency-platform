import { permanentRedirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { normalizeLocale, withLocale } from '@/i18n/config';

/** Legacy /news → real news at /haberler, keeping the locale (TASK-0472). */
export default async function LocalizedLegacyNewsPage() {
  permanentRedirect(withLocale(normalizeLocale(await getLocale()), '/haberler'));
}
