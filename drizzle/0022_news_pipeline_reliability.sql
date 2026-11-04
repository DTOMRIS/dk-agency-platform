-- TASK-0553. Separate operational state; existing news schema and content stay intact.
CREATE TABLE IF NOT EXISTS news_pipeline_budget (
  day date NOT NULL,
  slot integer NOT NULL CHECK (slot BETWEEN 1 AND 12),
  article_id integer REFERENCES news_articles(id) ON DELETE SET NULL,
  run_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (day, slot),
  UNIQUE (day, article_id)
);
CREATE TABLE IF NOT EXISTS news_approval_delivery (
  article_id integer PRIMARY KEY REFERENCES news_articles(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','sending','sent','failed','uncertain','held')),
  attempts integer NOT NULL DEFAULT 0,
  message_id bigint,
  editor_note text NOT NULL DEFAULT '',
  review_only boolean NOT NULL DEFAULT false,
  source_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
