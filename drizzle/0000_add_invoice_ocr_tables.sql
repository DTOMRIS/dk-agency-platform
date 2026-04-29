CREATE TYPE "public"."email_template_audience" AS ENUM('member', 'lead', 'admin', 'system');--> statement-breakpoint
CREATE TYPE "public"."invoice_import_status" AS ENUM('processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."invoice_ocr_provider" AS ENUM('gemini', 'deepseek-vision', 'deepseek-text');--> statement-breakpoint
CREATE TYPE "public"."invoice_source" AS ENUM('ocr_camera', 'ocr_upload', 'manual', 'excel', 'pdf');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'confirmed', 'disputed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."kazan_business_type" AS ENUM('restoran', 'kafe', 'franchise', 'diger');--> statement-breakpoint
CREATE TYPE "public"."kazan_lead_intent" AS ENUM('food_cost', 'pnl', 'aqta', 'delivery', 'general');--> statement-breakpoint
CREATE TYPE "public"."kazan_lead_status" AS ENUM('new', 'contacted', 'qualified', 'converted', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."listing_lead_status" AS ENUM('new', 'contacted', 'converted');--> statement-breakpoint
CREATE TYPE "public"."listing_media_type" AS ENUM('image', 'video', 'document');--> statement-breakpoint
CREATE TYPE "public"."listing_review_decision" AS ENUM('approve', 'conditional', 'reject');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('submitted', 'ai_checked', 'committee_review', 'shortlisted', 'docs_requested', 'showcase_ready', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('devir', 'franchise-vermek', 'franchise-almaq', 'ortak-tapmaq', 'yeni-investisiya', 'obyekt-icaresi', 'horeca-ekipman');--> statement-breakpoint
CREATE TYPE "public"."news_article_category" AS ENUM('operations', 'finance', 'growth', 'market', 'technology');--> statement-breakpoint
CREATE TYPE "public"."news_article_status" AS ENUM('fetched', 'translated', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."news_source_language" AS ENUM('en', 'tr', 'az');--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title_az" text NOT NULL,
	"title_tr" text,
	"title_en" text,
	"title_ru" text,
	"summary_az" text,
	"summary_tr" text,
	"summary_en" text,
	"summary_ru" text,
	"content_az" text NOT NULL,
	"content_tr" text,
	"content_en" text,
	"content_ru" text,
	"category" varchar(50),
	"author" varchar(100),
	"read_time" integer,
	"featured_image" text,
	"dogan_note" text,
	"seo_title" varchar(160),
	"seo_description" varchar(320),
	"has_paywall" boolean DEFAULT true,
	"status" varchar(20) DEFAULT 'draft',
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_key" varchar(120) NOT NULL,
	"audience" "email_template_audience" DEFAULT 'member' NOT NULL,
	"subject_az" text NOT NULL,
	"subject_tr" text,
	"subject_en" text,
	"preview_az" text,
	"preview_tr" text,
	"preview_en" text,
	"body_az" text NOT NULL,
	"body_tr" text,
	"body_en" text,
	"subject_ru" text,
	"preview_ru" text,
	"body_ru" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "email_templates_template_key_unique" UNIQUE("template_key")
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "email_verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "guru_boxes" (
	"id" serial PRIMARY KEY NOT NULL,
	"blog_post_id" integer,
	"guru_name" varchar(100),
	"quote_az" text,
	"quote_tr" text,
	"quote_en" text,
	"quote_ru" text,
	"book" varchar(200),
	"note_az" text,
	"note_ru" text,
	"sort_order" integer
);
--> statement-breakpoint
CREATE TABLE "hero_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"badge_text_az" text,
	"badge_text_tr" text,
	"badge_text_en" text,
	"title1_az" text,
	"title1_tr" text,
	"title1_en" text,
	"title_highlight_az" text,
	"title_highlight_tr" text,
	"title_highlight_en" text,
	"title2_az" text,
	"title2_tr" text,
	"title2_en" text,
	"subtitle_az" text,
	"subtitle_tr" text,
	"subtitle_en" text,
	"ahilik_az" text,
	"ahilik_tr" text,
	"ahilik_en" text,
	"badge_text_ru" text,
	"title1_ru" text,
	"title_highlight_ru" text,
	"title2_ru" text,
	"subtitle_ru" text,
	"ahilik_ru" text,
	"stat1_value" varchar(20),
	"stat1_label_az" varchar(50),
	"stat1_label_tr" varchar(50),
	"stat1_label_en" varchar(50),
	"stat1_label_ru" varchar(50),
	"stat2_value" varchar(20),
	"stat2_label_az" varchar(50),
	"stat2_label_tr" varchar(50),
	"stat2_label_en" varchar(50),
	"stat2_label_ru" varchar(50),
	"stat3_value" varchar(20),
	"stat3_label_az" varchar(50),
	"stat3_label_tr" varchar(50),
	"stat3_label_en" varchar(50),
	"stat3_label_ru" varchar(50),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"color" varchar(10) DEFAULT '#6B7280',
	"icon" varchar(50) DEFAULT 'package',
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoice_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "invoice_category_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"keyword" varchar(150) NOT NULL,
	"category_id" integer NOT NULL,
	"created_by" varchar(30) DEFAULT 'system',
	"confidence" real DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"source" "invoice_source" NOT NULL,
	"file_name" text,
	"total_rows" integer DEFAULT 0,
	"success_rows" integer DEFAULT 0,
	"failed_rows" integer DEFAULT 0,
	"error_log" jsonb,
	"status" "invoice_import_status" DEFAULT 'processing',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"category_id" integer,
	"name" text NOT NULL,
	"quantity" real NOT NULL,
	"unit" varchar(20) DEFAULT 'əd' NOT NULL,
	"unit_price" integer DEFAULT 0 NOT NULL,
	"total_price" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0,
	"is_edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"supplier_name" text NOT NULL,
	"supplier_voen" varchar(20),
	"invoice_number" varchar(100),
	"invoice_date" date NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"vat_amount" integer DEFAULT 0,
	"grand_total" integer DEFAULT 0 NOT NULL,
	"currency" varchar(5) DEFAULT 'AZN',
	"status" "invoice_status" DEFAULT 'draft',
	"source" "invoice_source" NOT NULL,
	"ocr_provider" "invoice_ocr_provider",
	"ocr_confidence" real,
	"original_file_url" text,
	"original_file_size" integer,
	"compressed_size" integer,
	"notes" text,
	"branch_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"confirmed_at" timestamp,
	"confirmed_by" integer
);
--> statement-breakpoint
CREATE TABLE "kazan_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"email" varchar(255),
	"business_type" "kazan_business_type" NOT NULL,
	"conversation_context" jsonb,
	"intent" "kazan_lead_intent" DEFAULT 'general' NOT NULL,
	"status" "kazan_lead_status" DEFAULT 'new' NOT NULL,
	"whatsapp_handoff" boolean DEFAULT false NOT NULL,
	"meeting_requested" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"name" varchar(150) NOT NULL,
	"phone" varchar(30),
	"email" varchar(255),
	"message" text,
	"status" "listing_lead_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"url" text NOT NULL,
	"type" "listing_media_type" DEFAULT 'image' NOT NULL,
	"is_showcase" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"reviewer_id" integer,
	"score" integer,
	"notes" text,
	"decision" "listing_review_decision",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"tracking_code" varchar(20) NOT NULL,
	"type" "listing_type" NOT NULL,
	"status" "listing_status" DEFAULT 'submitted' NOT NULL,
	"is_showcase" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"owner_name" varchar(150) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"email" varchar(255) NOT NULL,
	"city" varchar(120) NOT NULL,
	"district" varchar(120),
	"slug" varchar(255),
	"title" text NOT NULL,
	"title_az" text,
	"title_ru" text,
	"title_en" text,
	"title_tr" text,
	"description" text NOT NULL,
	"description_az" text,
	"description_ru" text,
	"description_en" text,
	"description_tr" text,
	"price" integer,
	"currency" varchar(5) DEFAULT 'AZN' NOT NULL,
	"type_specific_data" jsonb,
	"ai_analysis" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	CONSTRAINT "listings_tracking_code_unique" UNIQUE("tracking_code"),
	CONSTRAINT "listings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "login_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"ip_address" text,
	"user_agent" text,
	"city" text,
	"country" text,
	"success" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "member_entitlements" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer,
	"code" varchar(80) NOT NULL,
	"source" varchar(50) DEFAULT 'subscription',
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "member_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(150),
	"company" varchar(150),
	"phone" varchar(30),
	"role" varchar(30) DEFAULT 'member',
	"source" varchar(50) DEFAULT 'website',
	"email_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "member_profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "member_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer,
	"provider" varchar(30) DEFAULT 'manual',
	"plan_code" varchar(50) DEFAULT 'member-monthly',
	"status" varchar(30) DEFAULT 'trial',
	"external_customer_id" varchar(120),
	"external_subscription_id" varchar(120),
	"current_period_ends_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer,
	"external_url" text NOT NULL,
	"slug" varchar(255),
	"title" text NOT NULL,
	"title_az" text,
	"title_ru" text,
	"title_en" text,
	"title_tr" text,
	"summary" text,
	"summary_az" text,
	"summary_ru" text,
	"summary_en" text,
	"summary_tr" text,
	"category" "news_article_category" DEFAULT 'market' NOT NULL,
	"image_url" text,
	"author" varchar(150),
	"published_at" timestamp,
	"status" "news_article_status" DEFAULT 'fetched' NOT NULL,
	"is_editor_pick" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_articles_external_url_unique" UNIQUE("external_url"),
	CONSTRAINT "news_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "news_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"url" text NOT NULL,
	"rss_url" text NOT NULL,
	"language" "news_source_language" DEFAULT 'en' NOT NULL,
	"category" "news_article_category" DEFAULT 'market' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_fetched_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"logo" text,
	"category" varchar(50),
	"website" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value_az" text,
	"value_tr" text,
	"value_en" text,
	"value_ru" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(150) NOT NULL,
	"password_hash" text,
	"phone" text,
	"company" varchar(150),
	"role" varchar(30) DEFAULT 'member',
	"email_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guru_boxes" ADD CONSTRAINT "guru_boxes_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_category_rules" ADD CONSTRAINT "invoice_category_rules_category_id_invoice_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."invoice_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_imports" ADD CONSTRAINT "invoice_imports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_category_id_invoice_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."invoice_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_confirmed_by_users_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_leads" ADD CONSTRAINT "listing_leads_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_reviews" ADD CONSTRAINT "listing_reviews_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_entitlements" ADD CONSTRAINT "member_entitlements_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_subscriptions" ADD CONSTRAINT "member_subscriptions_profile_id_member_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_source_id_news_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."news_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;