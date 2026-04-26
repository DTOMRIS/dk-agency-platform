-- Migration: 0001_add_ru_locale_columns
-- Purpose: Add Russian (ru) locale columns to all content tables + multi-locale columns for news/listings
-- Date: 2026-04-26
-- Status: EXECUTED on Neon production DB

-- hero_content
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS badge_text_ru TEXT;
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS title1_ru TEXT;
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS title_highlight_ru TEXT;
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS title2_ru TEXT;
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS subtitle_ru TEXT;
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS ahilik_ru TEXT;
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS stat1_label_ru VARCHAR(50);
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS stat2_label_ru VARCHAR(50);
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS stat3_label_ru VARCHAR(50);

-- blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS title_ru TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS summary_ru TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS content_ru TEXT;

-- guru_boxes
ALTER TABLE guru_boxes ADD COLUMN IF NOT EXISTS quote_ru TEXT;
ALTER TABLE guru_boxes ADD COLUMN IF NOT EXISTS note_ru TEXT;

-- news_articles
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS title_ru TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS title_tr TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS summary_ru TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS summary_en TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS summary_tr TEXT;

-- listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS title_az TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS title_ru TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS title_tr TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS description_az TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS description_ru TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS description_tr TEXT;
UPDATE listings SET title_az = title WHERE title_az IS NULL;
UPDATE listings SET description_az = description WHERE description_az IS NULL;

-- site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS value_ru TEXT;

-- email_templates
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS subject_ru TEXT;
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS preview_ru TEXT;
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS body_ru TEXT;
