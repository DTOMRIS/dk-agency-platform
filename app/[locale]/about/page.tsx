import { permanentRedirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { normalizeLocale, withLocale } from '@/i18n/config';

export default async function AboutPage() {
  permanentRedirect(withLocale(normalizeLocale(await getLocale()), '/haqqimizda'));
}
