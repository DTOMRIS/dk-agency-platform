-- TASK-0546 · Doğan işlədir:  node --env-file=.env.local scripts/ops/run-sql.mjs docs/ops/2026-10-11-blog-retranslate.sql [--commit]
-- TASK-0545 auditi yalnız AZ mətni düzəltdi; en/ru/tr köhnə (uydurmalı) tərcümələr qalıb. Mövcud «Hamısını tərcümə et»
-- yalnız boş və ya AZ qalmış sahələri tərcümə edir — ona görə əvvəl 37 yazının mətn və «Ustadan qeyd» tərcümələri boşaldılır.
-- Başlıq və xülasə dəyişmədi, toxunulmur. Sonra: /dashboard/blog/translation-status → «Hamısını tərcümə et».
-- Arada en/ru/tr səhifələr AZ mətni göstərir (fallback) — tərcümə bitənə qədər.
BEGIN;
SELECT count(*) AS yazilar, count(content_en) AS en_var, count(content_ru) AS ru_var, count(content_tr) AS tr_var FROM blog_posts WHERE id IN (3, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 65, 66, 67, 149, 151, 152, 153, 154, 155, 156, 157, 158);
UPDATE blog_posts SET content_en = NULL, content_ru = NULL, content_tr = NULL,
  dogan_note_en = NULL, dogan_note_ru = NULL, dogan_note_tr = NULL
WHERE id IN (3, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 65, 66, 67, 149, 151, 152, 153, 154, 155, 156, 157, 158);
COMMIT;
