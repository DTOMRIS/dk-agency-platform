-- News origin tracking + dedup hash + relevance score
-- TASK-0401: NewsData.io discovery pipeline

ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT 'manual';
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS source_url_hash text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS relevance_score integer;

CREATE UNIQUE INDEX IF NOT EXISTS uq_news_url_hash ON news_articles(source_url_hash) WHERE source_url_hash IS NOT NULL;
