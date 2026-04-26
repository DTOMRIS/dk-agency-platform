export const locales = ['az', 'ru', 'en', 'tr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'az';

export const localeLabels: Record<Locale, string> = {
  az: 'AZ',
  ru: 'RU',
  en: 'EN',
  tr: 'TR',
};

export function isLocale(value: string | null | undefined): value is Locale {
  return locales.includes((value || '') as Locale);
}

export function normalizeLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function stripLocalePrefix(pathname: string): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const segment = normalizedPath.split('/')[1];
  if (!isLocale(segment)) return normalizedPath || '/';
  const stripped = normalizedPath.slice(segment.length + 1);
  return stripped || '/';
}

export function withLocale(locale: Locale, pathname: string): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (locale === defaultLocale) return normalizedPath || '/';
  return normalizedPath === '/' ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export function switchLocalePath(pathname: string, locale: Locale): string {
  return withLocale(locale, stripLocalePrefix(pathname));
}
