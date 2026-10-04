import { permanentRedirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { normalizeLocale, withLocale } from '@/i18n/config';

export default async function ContactPage() {
  permanentRedirect(withLocale(normalizeLocale(await getLocale()), '/elaqe'));
}
