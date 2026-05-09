CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" varchar(50),
	"channel" varchar(20),
	"locale" varchar(2),
	"user_agent" text,
	"ip_hash" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_leads_source_channel" ON "leads" USING btree ("source","channel");
