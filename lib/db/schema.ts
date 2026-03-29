import {
  pgTable,
  pgEnum,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

// Hero section content (field by field admin)
export const heroContent = pgTable('hero_content', {
  id: serial('id').primaryKey(),
  badgeText_az: text('badge_text_az'),
  badgeText_tr: text('badge_text_tr'),
  badgeText_en: text('badge_text_en'),
  title1_az: text('title1_az'),
  title1_tr: text('title1_tr'),
  title1_en: text('title1_en'),
  titleHighlight_az: text('title_highlight_az'),
  titleHighlight_tr: text('title_highlight_tr'),
  titleHighlight_en: text('title_highlight_en'),
  title2_az: text('title2_az'),
  title2_tr: text('title2_tr'),
  title2_en: text('title2_en'),
  subtitle_az: text('subtitle_az'),
  subtitle_tr: text('subtitle_tr'),
  subtitle_en: text('subtitle_en'),
  ahilik_az: text('ahilik_az'),
  ahilik_tr: text('ahilik_tr'),
  ahilik_en: text('ahilik_en'),
  stat1Value: varchar('stat1_value', { length: 20 }),
  stat1Label_az: varchar('stat1_label_az', { length: 50 }),
  stat1Label_tr: varchar('stat1_label_tr', { length: 50 }),
  stat1Label_en: varchar('stat1_label_en', { length: 50 }),
  stat2Value: varchar('stat2_value', { length: 20 }),
  stat2Label_az: varchar('stat2_label_az', { length: 50 }),
  stat2Label_tr: varchar('stat2_label_tr', { length: 50 }),
  stat2Label_en: varchar('stat2_label_en', { length: 50 }),
  stat3Value: varchar('stat3_value', { length: 20 }),
  stat3Label_az: varchar('stat3_label_az', { length: 50 }),
  stat3Label_tr: varchar('stat3_label_tr', { length: 50 }),
  stat3Label_en: varchar('stat3_label_en', { length: 50 }),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Blog posts
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  title_az: text('title_az').notNull(),
  title_tr: text('title_tr'),
  title_en: text('title_en'),
  summary_az: text('summary_az'),
  summary_tr: text('summary_tr'),
  summary_en: text('summary_en'),
  content_az: text('content_az').notNull(),
  content_tr: text('content_tr'),
  content_en: text('content_en'),
  category: varchar('category', { length: 50 }),
  author: varchar('author', { length: 100 }),
  readTime: integer('read_time'),
  featuredImage: text('featured_image'),
  doganNote: text('dogan_note'),
  seoTitle: varchar('seo_title', { length: 160 }),
  seoDescription: varchar('seo_description', { length: 320 }),
  hasPaywall: boolean('has_paywall').default(true),
  status: varchar('status', { length: 20 }).default('draft'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Blog guru boxes
export const guruBoxes = pgTable('guru_boxes', {
  id: serial('id').primaryKey(),
  blogPostId: integer('blog_post_id').references(() => blogPosts.id),
  guruName: varchar('guru_name', { length: 100 }),
  quote_az: text('quote_az'),
  quote_tr: text('quote_tr'),
  quote_en: text('quote_en'),
  book: varchar('book', { length: 200 }),
  note_az: text('note_az'),
  sortOrder: integer('sort_order'),
});

export const listingTypeEnum = pgEnum('listing_type', [
  'devir',
  'franchise-vermek',
  'franchise-almaq',
  'ortak-tapmaq',
  'yeni-investisiya',
  'obyekt-icaresi',
  'horeca-ekipman',
]);

export const listingStatusEnum = pgEnum('listing_status', [
  'submitted',
  'ai_checked',
  'committee_review',
  'shortlisted',
  'docs_requested',
  'showcase_ready',
  'rejected',
]);

export const listingMediaTypeEnum = pgEnum('listing_media_type', [
  'image',
  'video',
  'document',
]);

export const listingLeadStatusEnum = pgEnum('listing_lead_status', [
  'new',
  'contacted',
  'converted',
]);

export const listingReviewDecisionEnum = pgEnum('listing_review_decision', [
  'approve',
  'conditional',
  'reject',
]);

export const newsSourceLanguageEnum = pgEnum('news_source_language', [
  'en',
  'tr',
  'az',
]);

export const newsArticleCategoryEnum = pgEnum('news_article_category', [
  'operations',
  'finance',
  'growth',
  'market',
  'technology',
]);

export const newsArticleStatusEnum = pgEnum('news_article_status', [
  'fetched',
  'translated',
  'approved',
  'rejected',
]);

// Listings (devir & satis marketplace)
export const listings = pgTable('listings', {
  id: serial('id').primaryKey(),
  trackingCode: varchar('tracking_code', { length: 20 }).notNull().unique(),
  type: listingTypeEnum('type').notNull(),
  status: listingStatusEnum('status').notNull().default('submitted'),
  isShowcase: boolean('is_showcase').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  ownerName: varchar('owner_name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  city: varchar('city', { length: 120 }).notNull(),
  district: varchar('district', { length: 120 }),
  slug: varchar('slug', { length: 255 }).unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: integer('price'),
  currency: varchar('currency', { length: 5 }).notNull().default('AZN'),
  typeSpecificData: jsonb('type_specific_data').$type<Record<string, unknown>>(),
  aiAnalysis: jsonb('ai_analysis').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  publishedAt: timestamp('published_at'),
});

export const listingMedia = pgTable('listing_media', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id')
    .notNull()
    .references(() => listings.id),
  url: text('url').notNull(),
  type: listingMediaTypeEnum('type').notNull().default('image'),
  isShowcase: boolean('is_showcase').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const listingLeads = pgTable('listing_leads', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id')
    .notNull()
    .references(() => listings.id),
  name: varchar('name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 30 }),
  email: varchar('email', { length: 255 }),
  message: text('message'),
  status: listingLeadStatusEnum('status').notNull().default('new'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const listingReviews = pgTable('listing_reviews', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id')
    .notNull()
    .references(() => listings.id),
  reviewerId: integer('reviewer_id'),
  score: integer('score'),
  notes: text('notes'),
  decision: listingReviewDecisionEnum('decision'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const newsSources = pgTable('news_sources', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  url: text('url').notNull(),
  rssUrl: text('rss_url').notNull(),
  language: newsSourceLanguageEnum('language').notNull().default('en'),
  category: newsArticleCategoryEnum('category').notNull().default('market'),
  isActive: boolean('is_active').notNull().default(true),
  lastFetchedAt: timestamp('last_fetched_at'),
});

export const newsArticles = pgTable('news_articles', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id').references(() => newsSources.id),
  externalUrl: text('external_url').notNull().unique(),
  slug: varchar('slug', { length: 255 }).unique(),
  title: text('title').notNull(),
  titleAz: text('title_az'),
  summary: text('summary'),
  summaryAz: text('summary_az'),
  category: newsArticleCategoryEnum('category').notNull().default('market'),
  imageUrl: text('image_url'),
  author: varchar('author', { length: 150 }),
  publishedAt: timestamp('published_at'),
  status: newsArticleStatusEnum('status').notNull().default('fetched'),
  isEditorPick: boolean('is_editor_pick').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Partners (terefdaslar)
export const partners = pgTable('partners', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  logo: text('logo'),
  category: varchar('category', { length: 50 }),
  website: text('website'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
});

// Site settings (field by field)
export const siteSettings = pgTable('site_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value_az: text('value_az'),
  value_tr: text('value_tr'),
  value_en: text('value_en'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const emailTemplateAudienceEnum = pgEnum('email_template_audience', [
  'member',
  'lead',
  'admin',
  'system',
]);

// Email templates (message catalog)
export const emailTemplates = pgTable('email_templates', {
  id: serial('id').primaryKey(),
  templateKey: varchar('template_key', { length: 120 }).unique().notNull(),
  audience: emailTemplateAudienceEnum('audience').notNull().default('member'),
  subjectAz: text('subject_az').notNull(),
  subjectTr: text('subject_tr'),
  subjectEn: text('subject_en'),
  previewAz: text('preview_az'),
  previewTr: text('preview_tr'),
  previewEn: text('preview_en'),
  bodyAz: text('body_az').notNull(),
  bodyTr: text('body_tr'),
  bodyEn: text('body_en'),
  isActive: boolean('is_active').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Membership profiles
export const memberProfiles = pgTable('member_profiles', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  fullName: varchar('full_name', { length: 150 }),
  company: varchar('company', { length: 150 }),
  phone: varchar('phone', { length: 30 }),
  role: varchar('role', { length: 30 }).default('member'),
  source: varchar('source', { length: 50 }).default('website'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Membership subscriptions
export const memberSubscriptions = pgTable('member_subscriptions', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').references(() => memberProfiles.id),
  provider: varchar('provider', { length: 30 }).default('manual'),
  planCode: varchar('plan_code', { length: 50 }).default('member-monthly'),
  status: varchar('status', { length: 30 }).default('trial'),
  externalCustomerId: varchar('external_customer_id', { length: 120 }),
  externalSubscriptionId: varchar('external_subscription_id', { length: 120 }),
  currentPeriodEndsAt: timestamp('current_period_ends_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Membership entitlements
export const memberEntitlements = pgTable('member_entitlements', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').references(() => memberProfiles.id),
  code: varchar('code', { length: 80 }).notNull(),
  source: varchar('source', { length: 50 }).default('subscription'),
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
