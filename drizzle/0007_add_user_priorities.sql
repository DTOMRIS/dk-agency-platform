-- Migration: Add priorities jsonb column to users table
-- Purpose: Adoption loop — store user's top 1-3 HoReCa priorities
-- Safe: nullable column, no data loss, no destructive operations

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "priorities" jsonb;
