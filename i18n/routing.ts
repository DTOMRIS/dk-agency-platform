import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['az', 'tr', 'en'],
  defaultLocale: 'az',
  localePrefix: 'as-needed',
});
