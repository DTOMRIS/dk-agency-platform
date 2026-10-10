-- TASK-0537 · Doğan işlədir (Claude production DB-yə yazmır). psql "$DATABASE_URL" -f docs/ops/2026-10-11-blog-fixes.sql
-- 1) «36 ildir» → «40 ildir» (Doğan: 40 il, 1986-dan) — pese-mektebi-olke-meselesi, bütün dil sütunları.
-- 2) aha-ulduz-sertifikati-otel-hazirliq — yoxlanmamış «6 ay içində məcburdur / 70%-i bacarmır» və müştəri rəqəmli
--    «DOĞAN NOTU» (14 otel / 11 ulduz) çıxır (sahib qaydası: müştəri rəqəmi yayımlanmır, uydurma yoxdur).
BEGIN;

-- Əvvəl: neçə yerdə var?
SELECT slug,
  (content_az LIKE '%36 ildir%' OR coalesce(dogan_note,'') LIKE '%36 ildir%') AS az36,
  (coalesce(content_tr,'') || coalesce(dogan_note_tr,'')) LIKE '%36 yıl%' AS tr36,
  (coalesce(content_en,'') || coalesce(dogan_note_en,'')) LIKE '%36 years%' AS en36,
  (coalesce(content_ru,'') || coalesce(dogan_note_ru,'')) LIKE '%36 лет%' AS ru36,
  content_az LIKE '%14 otel sahibi%' AS fake_note,
  content_az LIKE '%6 ay içində ulduz almağa məcburdur%' AS mandatory_claim
FROM blog_posts WHERE slug IN ('pese-mektebi-olke-meselesi', 'aha-ulduz-sertifikati-otel-hazirliq');

UPDATE blog_posts SET
  content_az   = replace(content_az, '36 ildir', '40 ildir'),
  dogan_note   = replace(dogan_note, '36 ildir', '40 ildir'),
  content_tr   = replace(replace(content_tr, '36 yıldır', '40 yıldır'), '36 yıl ', '40 yıl '),
  dogan_note_tr= replace(replace(dogan_note_tr, '36 yıldır', '40 yıldır'), '36 yıl ', '40 yıl '),
  content_en   = replace(content_en, '36 years', '40 years'),
  dogan_note_en= replace(dogan_note_en, '36 years', '40 years'),
  content_ru   = replace(replace(content_ru, '36 лет', '40 лет'), '36 год', '40 год'),
  dogan_note_ru= replace(replace(dogan_note_ru, '36 лет', '40 лет'), '36 год', '40 год'),
  updated_at   = now()
WHERE slug = 'pese-mektebi-olke-meselesi';

UPDATE blog_posts SET
  content_az = regexp_replace(
                 replace(content_az,
                   '**Çünki Azərbaycanda hər mehmanxana 6 ay içində ulduz almağa məcburdur** — və hələ də 70%-i bunu bacarmır.',
                   '**Ulduz təsnifatı qonağın gözündə otelin səviyyəsini göstərir** — və müraciətə hazırlıq vaxt tələb edir. Cari qaydaları Dövlət Turizm Agentliyindən dəqiqləşdirin.'),
                 '> 📝 \*\*DOĞAN NOTU:\*\* "DK Agency-də son 6 ayda 14 otel sahibi[^\n]*', '', 'g'),
  summary_az = replace(summary_az, 'Azərbaycanda otel açan hər sahibkar 6 ay içində ulduz almağa məcburdur. ', ''),
  updated_at = now()
WHERE slug = 'aha-ulduz-sertifikati-otel-hazirliq';

-- Sonra: hamısı false olmalıdır (en/tr/ru tərcümələrində 14 otel qeydi qalıbsa, admin paneldən silin).
SELECT slug,
  content_az LIKE '%36 ildir%' AS az36_left,
  content_az LIKE '%14 otel sahibi%' AS fake_note_left,
  content_az LIKE '%6 ay içində ulduz almağa məcburdur%' AS claim_left,
  coalesce(content_en,'') ~* '14 hotel owners' AS en_note_left
FROM blog_posts WHERE slug IN ('pese-mektebi-olke-meselesi', 'aha-ulduz-sertifikati-otel-hazirliq');

COMMIT;
