import { defaultLocale, locales } from '@/i18n/config';

const BASE_URL = 'https://dkagency.com.tr';

/**
 * Default locale (az) prefiksiz servis olunur — `localePrefix: 'as-needed'`
 * ilə `/az/X` avtomatik `/X`-ə redirect edilir (bax L-038).
 *
 * Ona gore canonical/hreflang ucun AZ ünvanları prefiksiz qurulmalidir:
 * prefiksli variant redirect-e isare edir, Google bunu ziddiyyetli siqnal
 * sayir ve indekslesmeni bogur. `lib/seo/structured-data.ts` → localeUrl()
 * eyni qaydani tetbiq edir; bu fayl onunla uygunlasdirilib.
 */
function localeUrl(locale: string, cleanPath: string): string {
  const suffix = cleanPath === '/' ? '' : cleanPath;
  if (locale === defaultLocale) return `${BASE_URL}${suffix || '/'}`;
  return `${BASE_URL}/${locale}${suffix}`;
}

export function getAlternates(locale: string, path: string) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const languages: Record<string, string> = {};

  for (const loc of locales) {
    languages[loc] = localeUrl(loc, cleanPath);
  }
  languages['x-default'] = localeUrl(defaultLocale, cleanPath);

  return {
    canonical: localeUrl(locale, cleanPath),
    languages,
  };
}
