-- Migration 0015: Add locale columns for guru_name (guru_boxes)
-- Enables auto-translation of guru box headers (e.g. "yanaşması" → "approach")
-- Idempotent: safe to run multiple times

ALTER TABLE guru_boxes
  ADD COLUMN IF NOT EXISTS guru_name_ru VARCHAR(100),
  ADD COLUMN IF NOT EXISTS guru_name_en VARCHAR(100),
  ADD COLUMN IF NOT EXISTS guru_name_tr VARCHAR(100);
