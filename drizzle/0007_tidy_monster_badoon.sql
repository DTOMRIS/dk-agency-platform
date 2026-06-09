CREATE TYPE "public"."franchise_tool_source" AS ENUM('readiness_test', 'roi_calc', 'buyer_checklist', 'franchbook_gate', 'academy', 'consulting');--> statement-breakpoint
CREATE TABLE "email_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"email" varchar(255) NOT NULL,
	"newsletter_subscribed" boolean DEFAULT true NOT NULL,
	"blog_digest_subscribed" boolean DEFAULT true NOT NULL,
	"product_updates_subscribed" boolean DEFAULT true NOT NULL,
	"admin_digest_subscribed" boolean DEFAULT true NOT NULL,
	"consent_given_at" timestamp with time zone DEFAULT now(),
	"consent_source" varchar(50) DEFAULT 'signup_form',
	"unsubscribe_token" varchar(64),
	"last_updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "email_preferences_email_unique" UNIQUE("email"),
	CONSTRAINT "email_preferences_unsubscribe_token_unique" UNIQUE("unsubscribe_token")
);
--> statement-breakpoint
CREATE TABLE "franchbook_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"brand" text NOT NULL,
	"sector" text NOT NULL,
	"inputs" jsonb NOT NULL,
	"content" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"locale" varchar(2) DEFAULT 'az' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "franchise_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"contact" text NOT NULL,
	"tool_source" "franchise_tool_source" NOT NULL,
	"score" jsonb,
	"locale" varchar(2) DEFAULT 'az' NOT NULL,
	"consent_kvkk" boolean DEFAULT false NOT NULL,
	"consent_version" text,
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_conversion_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"page_path" text NOT NULL,
	"event_name" varchar(100) NOT NULL,
	"source" varchar(100),
	"campaign" varchar(100),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "stage" varchar(20);--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "voen" varchar(20);--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "sector" varchar(80);--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "authorized_person" varchar(150);--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "position" varchar(100);--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "contact_phone" varchar(30);--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "whatsapp" varchar(30);--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "website" varchar(255);--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "city" varchar(80);--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "district" varchar(80);--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "street_address" text;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "instagram" varchar(120);--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "linkedin" varchar(255);--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "visibility_settings" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "approval_status" varchar(20) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "reviewed_by" integer;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "slug" varchar(150);--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "language" varchar(5) DEFAULT 'az';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "priorities" jsonb;--> statement-breakpoint
ALTER TABLE "email_preferences" ADD CONSTRAINT "email_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchbook_projects" ADD CONSTRAINT "franchbook_projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ep_email" ON "email_preferences" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_ep_user" ON "email_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ep_token" ON "email_preferences" USING btree ("unsubscribe_token");--> statement-breakpoint
CREATE INDEX "idx_fbp_owner" ON "franchbook_projects" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_fbp_status" ON "franchbook_projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_fbp_created" ON "franchbook_projects" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_fl_source" ON "franchise_leads" USING btree ("tool_source");--> statement-breakpoint
CREATE INDEX "idx_fl_created" ON "franchise_leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ue_user" ON "user_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ue_type" ON "user_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_ue_created" ON "user_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_wce_session" ON "web_conversion_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_wce_event" ON "web_conversion_events" USING btree ("event_name");--> statement-breakpoint
CREATE INDEX "idx_wce_created" ON "web_conversion_events" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;