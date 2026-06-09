ALTER TABLE "kazan_leads" ADD COLUMN "notes" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "kazan_leads" ADD COLUMN "lead_score" smallint;--> statement-breakpoint
ALTER TABLE "kazan_leads" ADD COLUMN "next_contact_at" timestamp;