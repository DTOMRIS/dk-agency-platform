// Locale-less root mirror so the default locale (az) is served without a
// prefix. Implementation lives in the [locale] route; locale is resolved via
// getLocale() there. Mirror pattern matches app/blog/page.tsx.
export { default, generateMetadata } from '@/app/[locale]/sektor/page';
