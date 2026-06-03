ALTER TYPE "franchise_tool_source" ADD VALUE IF NOT EXISTS 'franchbook_gate';

CREATE TABLE IF NOT EXISTS "franchbook_projects" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_id" integer NOT NULL REFERENCES "users"("id"),
  "brand" text NOT NULL,
  "sector" text NOT NULL,
  "inputs" jsonb NOT NULL,
  "content" jsonb,
  "status" text NOT NULL DEFAULT 'draft',
  "locale" varchar(2) NOT NULL DEFAULT 'az',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_fbp_owner" ON "franchbook_projects" ("owner_id");
CREATE INDEX IF NOT EXISTS "idx_fbp_status" ON "franchbook_projects" ("status");
CREATE INDEX IF NOT EXISTS "idx_fbp_created" ON "franchbook_projects" ("created_at");
