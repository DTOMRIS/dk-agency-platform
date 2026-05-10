CREATE TABLE "marketing_tool_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tool_slug" varchar(64) NOT NULL,
	"input_data" jsonb NOT NULL,
	"output_data" jsonb,
	"ai_provider" varchar(16),
	"tokens_used" integer DEFAULT 0,
	"cost_azn" real DEFAULT 0,
	"status" varchar(16) DEFAULT 'pending',
	"error_message" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"locale" varchar(2) DEFAULT 'az' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "marketing_tool_runs" ADD CONSTRAINT "marketing_tool_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_mtr_user" ON "marketing_tool_runs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_mtr_slug" ON "marketing_tool_runs" USING btree ("tool_slug");--> statement-breakpoint
CREATE INDEX "idx_mtr_created" ON "marketing_tool_runs" USING btree ("created_at");