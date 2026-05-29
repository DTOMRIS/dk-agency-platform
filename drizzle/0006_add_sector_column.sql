-- Migration: Add sector column to listings (business sector axis)
-- Nullable varchar — existing listings keep NULL, no data loss
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "sector" varchar(50);
