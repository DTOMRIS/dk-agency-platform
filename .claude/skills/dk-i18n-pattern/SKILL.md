---
name: dk-i18n-pattern
description: DK Agency i18n and text-quality rules — read when adding or editing any
  user-facing text, component, or messages/*.json. Covers Pattern A (useTranslations),
  the 4 languages (AZ/RU/EN/TR), mojibake/encoding, and the WCAG contrast guardrail.
when_to_use: writing a new component with text, editing messages JSON, adding
  translations, any UI copy, fixing raw i18n keys or wrong-language/mojibake text.
---

# i18n & text quality (DK Agency)

4 languages: **AZ (default) / RU / EN / TR.** `localePrefix: 'as-needed'`.

## Pattern A only
Use `useTranslations('namespace')` (client) or `getTranslations({ locale, namespace })` (server).
**Forbidden:** inline `copyByLocale` / `Record<Locale, string>` blocks inside components
(Pattern C). If you find Pattern C, it must be extracted to its own file as Pattern A (L-004, L-009).

- Default UI language is **AZ**. Never ship a key in only one language.
- Add the key in **all 4** `messages/{az,ru,en,tr}.json`. No `TODO`/`...` placeholders.
- Big files: `messages/*.json` is ~830 KB — never full-Read. `grep`/offset+limit by namespace (L-033).
- Inject by namespace: parse JSON, insert as first child after the marker, validate with `JSON.parse`. Don't reformat the whole file.

## Audit ≠ auto-translate (L-017/L-018/L-028)
A missing-key count is not permission to translate. First confirm runtime use
(`useTranslations`/`t('ns.X')` references). Zero use = dead key → delete, don't translate.
Check both directions: missing (AZ has, X lacks) AND orphan (X has, AZ lacks) AND nested leaves
(component may add `.label` suffix the JSON lacks). Visual render matters too (operators like −, →, ✓
are part of the translation in formal/mono layouts — L-019).

## Contrast guardrail (release-blocking, not cosmetic)
On light backgrounds (`bg-white`, `bg-slate-50/100`, `var(--dk-paper)`): dark text only
(`text-slate-900/800`, `var(--dk-ink)`). `text-white` is **forbidden** in article/blog/news/form/CMS
bodies. Light text only on provably dark surfaces (image hero w/ overlay, dark CTA/nav/footer).

**Interactive elements (WCAG AA mandatory):** quiz option, radio, checkbox, dropdown, tab label —
always `text-slate-700` (unselected) / `text-slate-900` (selected). No `<button>`/`<label>` without
an explicit text-color class. Contrast ≥ 4.5:1. Applies to result screens too.

## Encoding
No UTF-8 BOM. No mojibake (corrupted UTF-8 byte sequences, smart-quote corruption). `npm run verify:encoding` enforces — and it scans this file too, so describe mojibake in words, never paste the literal corrupt bytes.
Azerbaijani chars (Ə ə ı İ ş ç ğ ö ü) are expected and fine.
