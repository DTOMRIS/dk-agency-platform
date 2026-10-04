import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { normalizeLocale, withLocale } from '@/i18n/config';

export default async function AboutPage() {
  redirect(withLocale(normalizeLocale(await getLocale()), '/haqqimizda'));
}
