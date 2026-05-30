-- Migration: Add user_events table for adoption loop telemetry
-- Purpose: Track user interactions (modal views, priority selection, tool clicks, nudge engagement)
-- Safe: CREATE TABLE only, no destructive operations, no data loss

CREATE TABLE IF NOT EXISTS "user_events" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "event_type" varchar(50) NOT NULL,
  "payload" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_ue_user" ON "user_events" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_ue_type" ON "user_events" ("event_type");
CREATE INDEX IF NOT EXISTS "idx_ue_created" ON "user_events" ("created_at");
