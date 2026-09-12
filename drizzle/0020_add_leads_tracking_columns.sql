-- TASK-0434: enrich contact-channel click tracking
-- Adds click-intent detail to the leads table: which page the click came from,
-- the pre-filled message we seeded into the wa.me/t.me link, and the destination
-- handle/number. All nullable — existing rows and the click event stay valid.
-- Idempotent — safe to run multiple times on Neon production.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS prefill_text text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS destination_phone varchar(32);
