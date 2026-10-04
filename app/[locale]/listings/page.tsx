import { permanentRedirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { normalizeLocale, withLocale } from '@/i18n/config';

/** /listings is an alias: permanent redirect to the canonical /ilanlar (TASK-0474). */
export default async function ListingsAliasPage() {
  permanentRedirect(withLocale(normalizeLocale(await getLocale()), '/ilanlar'));
}
