import { permanentRedirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { normalizeLocale, withLocale } from '@/i18n/config';

/** /xeberler duplicated /haberler (same content, both self-canonical): permanent redirect (TASK-0474). */
export default async function XeberlerAliasPage() {
  permanentRedirect(withLocale(normalizeLocale(await getLocale()), '/haberler'));
}
