-- TASK-0561. Why the owner rejected a draft (Telegram buttons after ❌). Additive and nullable:
-- code that predates it never reads it; the pipeline reads it through to_jsonb(d) so a missing column is harmless.
ALTER TABLE news_approval_delivery ADD COLUMN IF NOT EXISTS reject_reason text
  CHECK (reject_reason IS NULL OR reject_reason IN ('dup', 'pr', 'far', 'weak'));
