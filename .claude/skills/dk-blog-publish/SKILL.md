---
name: dk-blog-publish
description: DK Agency blog publishing procedure — add or update a blog post with
  correct number, slug, cover image, 4-language content, sources, and DB sync.
  Encodes the cover-drift and DB-first content lessons.
when_to_use: adding a new blog post, wiring blog cover images, fixing blog content
  language mismatch, blog citation/source work.
argument-hint: [blog-number] [slug]
disable-model-invocation: true
---

# Blog publishing (DK Agency)

Content is **DB-first.** The site renders from the DB; static config is fallback only.

## Steps
1. **Number & slug**: pick the next `blog-NN`. Slug must match DB exactly (drift = 404/empty).
2. **Cover**: wire by **slug**, not array index (off-by-one drift). Path stored as `images/blog-NN.png`;
   `resolveLocalCover` adds the leading `/`. Asset lives in `public/images/blog-NN.png`.
3. **Content, 4 langs**: AZ is source; RU/EN/TR via the translate scripts. Never hardcode AZ content
   in `page.tsx` to override the DB (L-037) — that desyncs AZ from the translated RU/EN/TR.
4. **Sources/citations**: soften unsourced statistics; add a real source to the top claims.
   Industry stats need a citation (e.g. food cost 28–35% industry standard; turnover → NRA).
5. **DB sync**: run the relevant `scripts/*blog*` (e.g. `update-blog-covers.mjs`,
   `sync-static-blog-article.ts`). Confirm the DB row, then verify the rendered page.
6. **Contrast**: blog body is a light container → dark text only, no `text-white` (see `dk-i18n-pattern`).

## Verify
- Prefix-less URL `/blog/<slug>` → 200 (and cover renders), not only `/en/blog/...` (L-038 mirror exists for blog).
- Cover image 200 (not 404).
- `docs/CHANGELOG.md` updated.

## Reference
`lib/data/blogArticles.ts`, `scripts/update-blog-covers.mjs`, `scripts/sync-static-blog-article.ts`,
`docs/BLOG-CITATION-AUDIT.md`. Lessons: L-020 (blog renderer ≠ legal), L-037 (no hardcoded override).
