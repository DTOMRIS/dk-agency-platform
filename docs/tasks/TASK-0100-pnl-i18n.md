# TASK-0100 - P&L Simulator i18n

## Scope

Convert the P&L Simulator from Pattern C hardcoded Azerbaijani copy to Pattern A `next-intl` translations.

## Changed

- `app/[locale]/toolkit/pnl/page.tsx` now uses `useTranslations('toolkit.pnl')`.
- `messages/az.json`, `messages/ru.json`, `messages/en.json`, and `messages/tr.json` include the full `toolkit.pnl` namespace.
- Currency and percent values are formatted with `Intl.NumberFormat`.
- Text inputs parse locale-specific decimal separators for AZ/RU/TR and EN.
- `/toolkit/pnl-simulator` and `/{locale}/toolkit/pnl-simulator` alias the existing P&L page for test and public compatibility.
- Playwright smoke coverage validates all 4 locales and number formatting.

## Out Of Scope

- Other toolkit calculators.
- Database schema or migrations.
- Protected auth, middleware, and listing configuration files.
