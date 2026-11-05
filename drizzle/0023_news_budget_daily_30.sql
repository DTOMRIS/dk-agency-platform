-- TASK-0557. Daily synthesis allowance 12 → 30 (owner 2026-11-05). Idempotent: drop + re-add the slot check.
ALTER TABLE news_pipeline_budget DROP CONSTRAINT IF EXISTS news_pipeline_budget_slot_check;
ALTER TABLE news_pipeline_budget ADD CONSTRAINT news_pipeline_budget_slot_check CHECK (slot BETWEEN 1 AND 30);
