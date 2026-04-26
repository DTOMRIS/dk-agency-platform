import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['az', 'ru', 'en', 'tr'],
  defaultLocale: 'az',
  localePrefix: 'as-needed',
});
