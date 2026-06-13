-- TASK-0315 PR-1: advertisements (banner ads)
-- Idempotent — safe to run multiple times on Neon production.
CREATE TABLE IF NOT EXISTS ads (
  id serial PRIMARY KEY,
  title varchar(150) NOT NULL,
  format varchar(10) NOT NULL DEFAULT 'image',
  media_url text NOT NULL,
  target_url text NOT NULL,
  placement varchar(40) NOT NULL,
  alt_text varchar(200),
  advertiser varchar(150),
  is_active boolean NOT NULL DEFAULT false,
  starts_at timestamptz,
  ends_at timestamptz,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ads_placement_active ON ads (placement, is_active);
