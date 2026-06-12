ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS related_toolkits jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS related_blog_slug text;
