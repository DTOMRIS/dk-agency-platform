# HANDOFF — 11 İyun 2026 Sessiyası

**Müəllif:** Claude Opus 4.6 (1M context)
**PR-lar:** #352–#364 (13 PR, hamısı merged to main)
**Status:** 503 — Hostinger RAM dolub, peş-peşə deploy səbəbi. Restart lazım.

---

## EDİLƏN İŞLƏR (13 PR)

### Xəbər sistemi
| PR | İş | Fayl(lar) |
|----|----|-----------|
| #352 | Content SELECT fix (contentAz oxunmurdu) | `lib/repositories/newsRepository.ts:514` |
| #352 | News DELETE API endpoint | `app/api/news/admin/[id]/route.ts` |
| #352 | News PATCH 5→22 sahə | `lib/repositories/newsRepository.ts`, `app/api/news/admin/[id]/route.ts` |
| #352 | News GET admin detail | `app/api/news/admin/[id]/route.ts` |
| #352 | Preview mode (?preview=true) | `app/haberler/[slug]/page.tsx`, `lib/repositories/newsRepository.ts` |
| #353 | slugify-az.ts missing file | `lib/utils/slugify-az.ts` |
| #354 | Məzmun (AZ) textarea editor modalda | `app/dashboard/xeberler/page.tsx` |
| #354 | Filter tab i18n (4 dil) | `app/dashboard/xeberler/page.tsx` |
| #354 | Admin list contentAz SELECT | `lib/repositories/newsRepository.ts` |
| #355 | Mock save xəbərdarlığı | `components/dashboard/NewsEditorForm.tsx` |
| #356 | **Slug collision POST→PATCH** | `components/dashboard/NewsEditorForm.tsx` |
| #356 | Foto xəbər 400 (foto→photo) | `components/dashboard/NewsEditorForm.tsx` |
| #356 | Mənbə düyməsi UX (böyük→kiçik) | `app/haberler/[slug]/page.tsx` |
| #356 | SEO canonical /sektor-nebzi/→/haberler/ | `app/haberler/[slug]/page.tsx` |
| #357 | **Auth bypass bağlandı** (Origin/Referer) | `lib/news/admin-access.ts` |
| #357 | Sil düyməsi admin UI | `app/dashboard/xeberler/page.tsx` |
| #357 | Telegram/Logo toggle gizləndi | `components/dashboard/NewsEditorForm.tsx` |
| #358 | "Originaldan draft yarat" fix | `app/dashboard/xeberler/page.tsx` |
| #358 | Tərcümə düyməsi editor modalda | `app/dashboard/xeberler/page.tsx` |
| #359 | **Auto-translate on approve** | `app/api/news/admin/[id]/route.ts` |
| #360 | **Manşet/Top/Gündəm featuring** | `app/haberler/page.tsx`, `lib/repositories/newsRepository.ts` |
| #361 | **Related Toolkit Box (TASK-0162)** | `lib/news/toolkit-catalog.ts`, `lib/news/match-toolkits.ts`, `components/news/RelatedToolkitsBox.tsx`, `lib/db/schema.ts` |
| #362 | **Görsel bloklar (TASK-0163)** | `components/blog/MarkdownRenderer.tsx`, `components/dashboard/BlogEditorForm.tsx` |
| #363 | Hotfix: detail page 500 (URL parse) | `app/haberler/[slug]/page.tsx` |
| #364 | Hotfix: approve without translation | `app/api/news/admin/[id]/route.ts` |

### İlanlar sistemi
| PR | İş | Fayl(lar) |
|----|----|-----------|
| #352 | Listing detail page (/ilanlar/[slug]) | `app/[locale]/ilanlar/[slug]/page.tsx`, `components/listings/ListingDetailClient.tsx` |
| #352 | getListingBySlug | `lib/db/listings-repository.ts` |
| #352 | Listing DELETE API | `app/api/listings/[id]/route.ts` |
| #352 | Admin PATCH bypass | `app/api/listings/[id]/route.ts` |
| #352 | 2 pulsuz ilan limiti | `app/api/listings/route.ts` |
| #352 | ilan-onaylari → redirect | `app/dashboard/ilan-onaylari/page.tsx` |

---

## BİLİNƏN PROBLEMLƏR (gələn CC həll etsin)

### P0 — ACİL
1. **503 Hostinger** — peş-peşə 13 PR deploy oldu, RAM doldu. FİX: Hostinger panelindən Node.js restart. DƏRS: Bundan sonra 1-2 PR arası 5 dəq gözlə.
2. **/ru/haberler xarici redirect** — QA agenti tapdı, kod düzgün görünür. Production cache ola bilər. Deploy sonrası yenidən yoxla.

### P1 — Bu həftə
3. **Canlı E2E test keçməyib** — 13 PR merge oldu amma heç biri production-da tam test edilmədi. Gələn CC `docs/HANDOFF-11-IYUN-2026.md`-dəki E2E test siyahısını keçirsin.
4. **Decision-log faylları untracked** — `decision-log/2026-06-1*` faylları commit edilməyib (12+3 agent araşdırma raportları).

### P2 — Gələcək sprint
5. **Faz 1: NewsData.io ingestion pipeline** — Blueprint hazır (`docs/reports/` içində), kod yoxdur.
6. **İlan maliyyə sahələri** (revenue, profit, staff, lease) — dünya araşdırması tapıntısı.
7. **WhatsApp share xəbər səhifəsində** — 6 qitə araşdırması tövsiyəsi.

---

## NEON SQL — İŞLƏDİLƏN
```sql
-- CEO işlətdi:
UPDATE listings SET sector = 'restoran' WHERE type = 'devir' AND sector IS NULL;
UPDATE listings SET sector = 'fast-food' WHERE title LIKE '%Pizza%' AND sector IS NULL;
UPDATE listings SET sector = 'kafe' WHERE title LIKE '%Kafe%' AND sector IS NULL;
UPDATE listings SET sector = 'restoran' WHERE sector IS NULL;

ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS related_toolkits jsonb DEFAULT '[]'::jsonb;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS related_blog_slug text;
```

## NEON SQL — HƏLƏLİK İŞLƏDİLMƏYƏN (gələcək sprint)
```sql
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT 'manual';
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS cover_type text DEFAULT 'category_banner';
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS source_url_hash text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_news_url_hash ON news_articles(source_url_hash) WHERE source_url_hash IS NOT NULL;
```

---

## GƏLƏN CC ÜÇÜN OXUMALARI

1. **Bu fayl** — `docs/HANDOFF-11-IYUN-2026.md`
2. **Blueprint** — CEO-nun verdiyi tam arxitektura sənədi (kontekstdə var, fayl kimi yazılmayıb)
3. **Memory** — `~/.claude/projects/C--Users-dotom/memory/MEMORY.md` (yenilənmiş)
4. **Kritik dərs** — `feedback_build_ne_isleyir.md` — BUILD PASS ≠ İŞLƏYİR

## TOXUNDUğUM FAYLLAR (tam siyahı)
```
app/api/news/admin/[id]/route.ts          ← DELETE, PATCH genişlənmiş, auto-translate, toolkit match, approve fix
app/api/news/admin/route.ts               ← (toxunulmadı bu sessiyada, əvvəldən POST var)
app/api/listings/[id]/route.ts            ← DELETE, admin PATCH bypass
app/api/listings/route.ts                 ← 2 ilan limiti
app/haberler/[slug]/page.tsx              ← preview, SEO canonical, mənbə UX, toolkit box, 500 hotfix
app/haberler/page.tsx                     ← manşet/top/gündəm featuring
app/[locale]/ilanlar/[slug]/page.tsx      ← YENİ — listing detail SSR
app/dashboard/xeberler/page.tsx           ← filter i18n, contentAz, sil, draft, translate, slug
app/dashboard/ilan-onaylari/page.tsx      ← redirect
components/dashboard/NewsEditorForm.tsx    ← slug collision, foto, mock warning, telegram hidden
components/dashboard/BlogEditorForm.tsx    ← görsel blok düymələri
components/blog/MarkdownRenderer.tsx      ← görsel blok render (images/gallery/video)
components/listings/ListingDetailClient.tsx ← YENİ
components/news/RelatedToolkitsBox.tsx    ← YENİ
lib/repositories/newsRepository.ts        ← content SELECT, PATCH genişlənmiş, flag-lar, admin list
lib/db/listings-repository.ts             ← getListingBySlug
lib/db/schema.ts                          ← related_toolkits, related_blog_slug
lib/news/admin-access.ts                  ← auth bypass fix
lib/news/toolkit-catalog.ts               ← YENİ — SSOT toolkit kataloqu
lib/news/match-toolkits.ts                ← YENİ — DeepSeek toolkit matching
lib/utils/slugify-az.ts                   ← YENİ
docs/tasks/TASK-0162.md                   ← YENİ
docs/tasks/TASK-0263.md                   ← YENİ
```

## CEO-NUN GÖZLƏDİYİ (manual işlər)
1. Hostinger restart (503 fix)
2. Salon du Chocolat + Kabab məqaləsi daxil etmə (blog editoru ilə)
3. E2E test keçirmə (browser + screenshot)
