-- TASK-0498: supplier base + buyer demand board (admin-only, personal data)
-- Source: WhatsApp HoReCa group exports imported from /dashboard/techizatcilar.
-- Idempotent — safe to run multiple times on Neon production (npm run db:migrate).
CREATE TABLE IF NOT EXISTS supply_contacts (
  id serial PRIMARY KEY,
  dedupe_key varchar(200) NOT NULL,
  display_name varchar(200) NOT NULL,
  company varchar(200),
  phones jsonb NOT NULL DEFAULT '[]'::jsonb,
  categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_groups jsonb NOT NULL DEFAULT '[]'::jsonb,
  first_seen timestamptz NOT NULL,
  last_seen timestamptz NOT NULL,
  post_count integer NOT NULL DEFAULT 0,
  message_hashes jsonb NOT NULL DEFAULT '[]'::jsonb,
  sample_offers jsonb NOT NULL DEFAULT '[]'::jsonb,
  status varchar(20) NOT NULL DEFAULT 'yeni',
  public_consent boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE supply_contacts ADD CONSTRAINT supply_contacts_dedupe_key_unique UNIQUE (dedupe_key);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_supply_contacts_last_seen ON supply_contacts (last_seen);
CREATE INDEX IF NOT EXISTS idx_supply_contacts_status ON supply_contacts (status);

CREATE TABLE IF NOT EXISTS supply_requests (
  id serial PRIMARY KEY,
  requester_name varchar(200) NOT NULL,
  phones jsonb NOT NULL DEFAULT '[]'::jsonb,
  text text NOT NULL,
  categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  request_type varchar(20) NOT NULL,
  source_group varchar(200) NOT NULL,
  posted_at timestamptz NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'aciq',
  notes text,
  text_hash varchar(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE supply_requests ADD CONSTRAINT supply_requests_text_hash_unique UNIQUE (text_hash);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_supply_requests_posted ON supply_requests (posted_at);
CREATE INDEX IF NOT EXISTS idx_supply_requests_status ON supply_requests (status);
