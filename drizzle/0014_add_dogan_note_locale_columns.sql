-- Migration: 0014_add_dogan_note_locale_columns
-- Purpose: Add ru/en/tr locale columns for the blog "Doğan Notu" field so the
--          auto-translate pipeline can store localized versions (was AZ-only,
--          single column → untranslated on RU/EN/TR pages).
-- Date: 2026-06-10
-- Status: PENDING — run manually on Neon production DB

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS dogan_note_ru TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS dogan_note_en TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS dogan_note_tr TEXT;
