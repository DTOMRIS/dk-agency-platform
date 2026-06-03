-- Migration 0010: Franchise Leads table
-- Franchise funnel lead capture for: readiness test, ROI calc, buyer checklist, academy, consulting

DO $$ BEGIN
  CREATE TYPE "franchise_tool_source" AS ENUM ('readiness_test', 'roi_calc', 'buyer_checklist', 'academy', 'consulting');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "franchise_leads" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" text NOT NULL,
  "brand" text,
  "contact" text NOT NULL,
  "tool_source" "franchise_tool_source" NOT NULL,
  "score" jsonb,
  "locale" varchar(2) NOT NULL DEFAULT 'az',
  "consent_kvkk" boolean NOT NULL DEFAULT false,
  "consent_version" text,
  "ip_hash" text,
  "user_agent" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz
);

CREATE INDEX IF NOT EXISTS "idx_fl_source" ON "franchise_leads" ("tool_source");
CREATE INDEX IF NOT EXISTS "idx_fl_created" ON "franchise_leads" ("created_at");
