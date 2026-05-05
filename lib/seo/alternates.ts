const BASE_URL = 'https://dkagency.com.tr';
const LOCALES = ['az', 'en', 'ru', 'tr'] as const;

export function getAlternates(locale: string, path: string) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const languages: Record<string, string> = {};

  for (const loc of LOCALES) {
    languages[loc] = `${BASE_URL}/${loc}${cleanPath}`;
  }
  languages['x-default'] = `${BASE_URL}/az${cleanPath}`;

  return {
    canonical: `${BASE_URL}/${locale}${cleanPath}`,
    languages,
  };
}
