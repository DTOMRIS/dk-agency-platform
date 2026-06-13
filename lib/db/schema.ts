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
  uuid,
  real,
  numeric,
  date,
  index,
  smallint,
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
  badgeText_ru: text('badge_text_ru'),
  title1_ru: text('title1_ru'),
  titleHighlight_ru: text('title_highlight_ru'),
  title2_ru: text('title2_ru'),
  subtitle_ru: text('subtitle_ru'),
  ahilik_ru: text('ahilik_ru'),
  stat1Value: varchar('stat1_value', { length: 20 }),
  stat1Label_az: varchar('stat1_label_az', { length: 50 }),
  stat1Label_tr: varchar('stat1_label_tr', { length: 50 }),
  stat1Label_en: varchar('stat1_label_en', { length: 50 }),
  stat1Label_ru: varchar('stat1_label_ru', { length: 50 }),
  stat2Value: varchar('stat2_value', { length: 20 }),
  stat2Label_az: varchar('stat2_label_az', { length: 50 }),
  stat2Label_tr: varchar('stat2_label_tr', { length: 50 }),
  stat2Label_en: varchar('stat2_label_en', { length: 50 }),
  stat2Label_ru: varchar('stat2_label_ru', { length: 50 }),
  stat3Value: varchar('stat3_value', { length: 20 }),
  stat3Label_az: varchar('stat3_label_az', { length: 50 }),
  stat3Label_tr: varchar('stat3_label_tr', { length: 50 }),
  stat3Label_en: varchar('stat3_label_en', { length: 50 }),
  stat3Label_ru: varchar('stat3_label_ru', { length: 50 }),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Blog posts
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  title_az: text('title_az').notNull(),
  title_tr: text('title_tr'),
  title_en: text('title_en'),
  title_ru: text('title_ru'),
  summary_az: text('summary_az'),
  summary_tr: text('summary_tr'),
  summary_en: text('summary_en'),
  summary_ru: text('summary_ru'),
  content_az: text('content_az').notNull(),
  content_tr: text('content_tr'),
  content_en: text('content_en'),
  content_ru: text('content_ru'),
  category: varchar('category', { length: 50 }),
  author: varchar('author', { length: 100 }),
  readTime: integer('read_time'),
  featuredImage: text('featured_image'),
  doganNote: text('dogan_note'),
  doganNote_ru: text('dogan_note_ru'),
  doganNote_en: text('dogan_note_en'),
  doganNote_tr: text('dogan_note_tr'),
  seoTitle: varchar('seo_title', { length: 160 }),
  seoDescription: varchar('seo_description', { length: 320 }),
  stage: varchar('stage', { length: 20 }),
  hasPaywall: boolean('has_paywall').default(true),
  status: varchar('status', { length: 20 }).default('draft'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Blog guru boxes
export const guruBoxes = pgTable('guru_boxes', {
  id: serial('id').primaryKey(),
  blogPostId: integer('blog_post_id').references(() => blogPosts.id, { onDelete: 'cascade' }),
  guruName: varchar('guru_name', { length: 100 }),
  guruName_ru: varchar('guru_name_ru', { length: 100 }),
  guruName_en: varchar('guru_name_en', { length: 100 }),
  guruName_tr: varchar('guru_name_tr', { length: 100 }),
  quote_az: text('quote_az'),
  quote_tr: text('quote_tr'),
  quote_en: text('quote_en'),
  quote_ru: text('quote_ru'),
  book: varchar('book', { length: 200 }),
  note_az: text('note_az'),
  note_ru: text('note_ru'),
  sortOrder: integer('sort_order'),
});

// Slug redirects — when a blog slug changes, old URL → 301 → new slug
export const slugRedirects = pgTable('slug_redirects', {
  id: serial('id').primaryKey(),
  oldSlug: varchar('old_slug', { length: 255 }).notNull(),
  newSlug: varchar('new_slug', { length: 255 }).notNull(),
  type: varchar('type', { length: 20 }).notNull().default('blog'),
  createdAt: timestamp('created_at').defaultNow(),
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
  'sold',
  'expired',
]);

export const listingMediaTypeEnum = pgEnum('listing_media_type', ['image', 'video', 'document']);

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

export const kazanBusinessTypeEnum = pgEnum('kazan_business_type', [
  'restoran',
  'kafe',
  'franchise',
  'diger',
]);

export const kazanLeadIntentEnum = pgEnum('kazan_lead_intent', [
  'food_cost',
  'pnl',
  'aqta',
  'delivery',
  'general',
]);

export const kazanLeadStatusEnum = pgEnum('kazan_lead_status', [
  'new',
  'contacted',
  'qualified',
  'converted',
  'dismissed',
]);

export const newsSourceLanguageEnum = pgEnum('news_source_language', ['en', 'tr', 'az']);

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
  // Business sector (orthogonal to type). varchar + config, NOT pgEnum.
  sector: varchar('sector', { length: 50 }),
  isShowcase: boolean('is_showcase').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  // Owner (FK to users — M5.1)
  ownerId: integer('owner_id').references(() => users.id),
  // Legacy contact fields (preserved from mock, owner-dən fərqli ola bilər)
  ownerName: varchar('owner_name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 150 }),
  contactPhone: varchar('contact_phone', { length: 30 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  // Location
  city: varchar('city', { length: 120 }).notNull(),
  district: varchar('district', { length: 120 }),
  lat: numeric('lat', { precision: 10, scale: 7 }),
  lng: numeric('lng', { precision: 10, scale: 7 }),
  // Content
  slug: varchar('slug', { length: 255 }).unique(),
  title: text('title').notNull(),
  titleAz: text('title_az'),
  titleRu: text('title_ru'),
  titleEn: text('title_en'),
  titleTr: text('title_tr'),
  description: text('description').notNull(),
  descriptionAz: text('description_az'),
  descriptionRu: text('description_ru'),
  descriptionEn: text('description_en'),
  descriptionTr: text('description_tr'),
  price: integer('price'),
  priceLabel: varchar('price_label', { length: 50 }),
  currency: varchar('currency', { length: 5 }).notNull().default('AZN'),
  typeSpecificData: jsonb('type_specific_data').$type<Record<string, unknown>>(),
  equipment: jsonb('equipment').default([]),
  images: jsonb('images').default([]),
  // AI & review workflow
  aiAnalysis: jsonb('ai_analysis').$type<Record<string, unknown>>(),
  aiCheckResult: jsonb('ai_check_result'),
  committeeNotes: text('committee_notes'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  approvedBy: integer('approved_by').references(() => users.id),
  rejectedReason: text('rejected_reason'),
  // Metrics
  viewCount: integer('view_count').default(0),
  // Lifecycle
  expiredAt: timestamp('expired_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
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

export const leads = pgTable(
  'leads',
  {
    id: serial('id').primaryKey(),
    source: varchar('source', { length: 50 }),
    channel: varchar('channel', { length: 20 }),
    locale: varchar('locale', { length: 2 }),
    userAgent: text('user_agent'),
    ipHash: varchar('ip_hash', { length: 64 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    sourceChannelIdx: index('idx_leads_source_channel').on(table.source, table.channel),
  })
);

// ── EMAIL PREFERENCES (KVKK/GDPR consent) ───────────────────────────

export const emailPreferences = pgTable(
  'email_preferences',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    newsletterSubscribed: boolean('newsletter_subscribed').notNull().default(true),
    blogDigestSubscribed: boolean('blog_digest_subscribed').notNull().default(true),
    productUpdatesSubscribed: boolean('product_updates_subscribed').notNull().default(true),
    adminDigestSubscribed: boolean('admin_digest_subscribed').notNull().default(true),
    consentGivenAt: timestamp('consent_given_at', { withTimezone: true }).defaultNow(),
    consentSource: varchar('consent_source', { length: 50 }).default('signup_form'),
    unsubscribeToken: varchar('unsubscribe_token', { length: 64 }).unique(),
    lastUpdatedAt: timestamp('last_updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    emailIdx: index('idx_ep_email').on(table.email),
    userIdx: index('idx_ep_user').on(table.userId),
    tokenIdx: index('idx_ep_token').on(table.unsubscribeToken),
  })
);

export const kazanLeads = pgTable('kazan_leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 255 }),
  businessType: kazanBusinessTypeEnum('business_type').notNull(),
  conversationContext:
    jsonb('conversation_context').$type<Array<{ role: string; content: string }>>(),
  intent: kazanLeadIntentEnum('intent').notNull().default('general'),
  status: kazanLeadStatusEnum('status').notNull().default('new'),
  whatsappHandoff: boolean('whatsapp_handoff').notNull().default(false),
  meetingRequested: boolean('meeting_requested').notNull().default(false),
  notes: jsonb('notes').$type<Array<{ at: string; text: string }>>().default([]),
  leadScore: smallint('lead_score'),
  nextContactAt: timestamp('next_contact_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
  titleRu: text('title_ru'),
  titleEn: text('title_en'),
  titleTr: text('title_tr'),
  summary: text('summary'),
  summaryAz: text('summary_az'),
  summaryRu: text('summary_ru'),
  summaryEn: text('summary_en'),
  summaryTr: text('summary_tr'),
  contentAz: text('content_az'),
  contentRu: text('content_ru'),
  contentEn: text('content_en'),
  contentTr: text('content_tr'),
  category: newsArticleCategoryEnum('category').notNull().default('market'),
  imageUrl: text('image_url'),
  author: varchar('author', { length: 150 }),
  publishedAt: timestamp('published_at'),
  status: newsArticleStatusEnum('status').notNull().default('fetched'),
  isEditorPick: boolean('is_editor_pick').notNull().default(false),
  isManset: boolean('is_manset').notNull().default(false),
  isTop: boolean('is_top').notNull().default(false),
  isGundem: boolean('is_gundem').notNull().default(false),
  newsType: varchar('news_type', { length: 10 }).default('none'),
  telegramSend: boolean('telegram_send').notNull().default(false),
  logoOverlay: boolean('logo_overlay').notNull().default(false),
  seoTitle: varchar('seo_title', { length: 70 }),
  seoDescription: varchar('seo_description', { length: 160 }),
  relatedToolkits: jsonb('related_toolkits').$type<string[]>().default([]),
  relatedBlogSlug: text('related_blog_slug'),
  origin: text('origin').notNull().default('manual'),
  sourceUrlHash: text('source_url_hash'),
  relevanceScore: integer('relevance_score'),
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
  value_ru: text('value_ru'),
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
  subjectRu: text('subject_ru'),
  previewRu: text('preview_ru'),
  bodyRu: text('body_ru'),
  isActive: boolean('is_active').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Email delivery log
export const emailLogStatusEnum = pgEnum('email_log_status', [
  'queued',
  'sent',
  'failed',
]);

export const emailLogs = pgTable('email_logs', {
  id: serial('id').primaryKey(),
  recipient: varchar('recipient', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 500 }).notNull(),
  templateType: varchar('template_type', { length: 80 }).notNull(),
  status: emailLogStatusEnum('status').notNull().default('queued'),
  messageId: varchar('message_id', { length: 255 }),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
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
  emailVerified: boolean('email_verified').default(false),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),

  // V2 — company/business identity
  logoUrl: text('logo_url'),
  voen: varchar('voen', { length: 20 }),
  sector: varchar('sector', { length: 80 }),
  description: text('description'),

  // V2 — contact person
  authorizedPerson: varchar('authorized_person', { length: 150 }),
  position: varchar('position', { length: 100 }),
  contactPhone: varchar('contact_phone', { length: 30 }),
  whatsapp: varchar('whatsapp', { length: 30 }),
  website: varchar('website', { length: 255 }),

  // V2 — location
  city: varchar('city', { length: 80 }),
  district: varchar('district', { length: 80 }),
  streetAddress: text('street_address'),

  // V2 — bio & social
  bio: text('bio'),
  instagram: varchar('instagram', { length: 120 }),
  linkedin: varchar('linkedin', { length: 255 }),

  // V2 — visibility per-field (jsonb: { phone: true, email: false, ... })
  visibilitySettings: jsonb('visibility_settings').$type<Record<string, boolean>>().default({}),

  // V2 — approval workflow
  approvalStatus: varchar('approval_status', { length: 20 }).default('draft').notNull(),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),

  // V2 — public slug & language
  slug: varchar('slug', { length: 150 }),
  language: varchar('language', { length: 5 }).default('az'),
});

// Generic users table for auth-related utilities and future adapter alignment
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 150 }).notNull(),
  passwordHash: text('password_hash'),
  phone: text('phone'),
  company: varchar('company', { length: 150 }),
  role: varchar('role', { length: 30 }).default('member'),
  emailVerified: boolean('email_verified').default(false),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // KVKK Md. 7(2) + GDPR Art. 7(1) — consent tracking
  termsAcceptedAt: timestamp('terms_accepted_at', { withTimezone: true }),
  termsAcceptedIp: text('terms_accepted_ip'),
  termsVersion: varchar('terms_version', { length: 20 }),
  privacyAcceptedAt: timestamp('privacy_accepted_at', { withTimezone: true }),
  privacyAcceptedIp: text('privacy_accepted_ip'),
  marketingConsent: boolean('marketing_consent').default(false),

  // Adoption loop — user's top 1-3 HoReCa priorities (jsonb array of PriorityKey)
  priorities: jsonb('priorities').$type<string[]>(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const loginLogs = pgTable('login_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  city: text('city'),
  country: text('country'),
  success: boolean('success').default(true),
  createdAt: timestamp('created_at').defaultNow(),
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

// ── FATURA OCR SİSTEMİ ─────────────────────────────────────────────

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'confirmed',
  'disputed',
  'archived',
]);

export const invoiceSourceEnum = pgEnum('invoice_source', [
  'ocr_camera',
  'ocr_upload',
  'manual',
  'excel',
  'pdf',
]);

export const invoiceOcrProviderEnum = pgEnum('invoice_ocr_provider', [
  'gemini',
  'deepseek-vision',
  'deepseek-text',
]);

export const invoiceImportStatusEnum = pgEnum('invoice_import_status', [
  'processing',
  'completed',
  'failed',
]);

// Fatura kateqoriyaları (ət, süd, içki, təmizlik...)
export const invoiceCategories = pgTable('invoice_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  color: varchar('color', { length: 10 }).default('#6B7280'),
  icon: varchar('icon', { length: 50 }).default('package'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Ana fatura cədvəli
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  supplierName: text('supplier_name').notNull(),
  supplierVoen: varchar('supplier_voen', { length: 20 }),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  invoiceDate: date('invoice_date').notNull(),
  subtotal: integer('subtotal').notNull().default(0),
  vatAmount: integer('vat_amount').default(0),
  grandTotal: integer('grand_total').notNull().default(0),
  currency: varchar('currency', { length: 5 }).default('AZN'),
  status: invoiceStatusEnum('status').default('draft'),
  source: invoiceSourceEnum('source').notNull(),
  ocrProvider: invoiceOcrProviderEnum('ocr_provider'),
  ocrConfidence: real('ocr_confidence'),
  originalFileUrl: text('original_file_url'),
  originalFileSize: integer('original_file_size'),
  compressedSize: integer('compressed_size'),
  notes: text('notes'),
  branchId: integer('branch_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  confirmedAt: timestamp('confirmed_at'),
  confirmedBy: integer('confirmed_by').references(() => users.id),
});

// Fatura sətirləri (field-by-field)
export const invoiceItems = pgTable('invoice_items', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').references(() => invoiceCategories.id),
  name: text('name').notNull(),
  quantity: real('quantity').notNull(),
  unit: varchar('unit', { length: 20 }).notNull().default('əd'),
  unitPrice: integer('unit_price').notNull().default(0),
  totalPrice: integer('total_price').notNull().default(0),
  sortOrder: integer('sort_order').default(0),
  isEdited: boolean('is_edited').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Toplu import tarixçəsi
export const invoiceImports = pgTable('invoice_imports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  source: invoiceSourceEnum('source').notNull(),
  fileName: text('file_name'),
  totalRows: integer('total_rows').default(0),
  successRows: integer('success_rows').default(0),
  failedRows: integer('failed_rows').default(0),
  errorLog:
    jsonb('error_log').$type<Array<{ row: number; field: string; value: string; error: string }>>(),
  status: invoiceImportStatusEnum('status').default('processing'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── RESTORAN AUDİT SİSTEMİ ──────────────────────────────────────────

export const auditCategoryEnum = pgEnum('audit_category', [
  'kafe',
  'restoran',
  'fast-food',
  'fine-dining',
]);

export const auditStatusEnum = pgEnum('audit_status', [
  'draft',
  'sent',
  'meeting',
  'converted',
  'rejected',
]);

export const restaurantAudits = pgTable('restaurant_audits', {
  id: serial('id').primaryKey(),
  createdBy: integer('created_by').references(() => users.id),
  name: text('name').notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 30 }),
  category: auditCategoryEnum('category').default('restoran'),
  photos: jsonb('photos').$type<string[]>().default([]),
  socialLinks: jsonb('social_links').$type<{ instagram?: string; facebook?: string }>().default({}),
  deliveryLinks: jsonb('delivery_links').$type<{ wolt?: string; bolt?: string }>().default({}),
  menuPhotoUrl: text('menu_photo_url'),
  aiAnalysis: jsonb('ai_analysis').$type<{
    strengths: string[];
    weaknesses: string[];
    recommendations: Array<{
      priority: string;
      area: string;
      action: string;
      dkAgencyHelp: string;
    }>;
    estimatedRevenue: { min: number; max: number; currency: string };
    redFlags: string[];
    whatsappTemplate: string;
    summary: string;
  }>(),
  status: auditStatusEnum('status').default('draft'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const restaurantAuditActions = pgTable('restaurant_audit_actions', {
  id: serial('id').primaryKey(),
  auditId: integer('audit_id')
    .notNull()
    .references(() => restaurantAudits.id, { onDelete: 'cascade' }),
  actionType: varchar('action_type', { length: 50 }).notNull(), // created, sent, called, meeting, converted, rejected, note
  date: timestamp('date').defaultNow(),
  notes: text('notes'),
});

// Kateqoriya auto-mapping qaydaları (AI öyrənmə)
export const invoiceCategoryRules = pgTable('invoice_category_rules', {
  id: serial('id').primaryKey(),
  keyword: varchar('keyword', { length: 150 }).notNull(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => invoiceCategories.id, { onDelete: 'cascade' }),
  createdBy: varchar('created_by', { length: 30 }).default('system'),
  confidence: real('confidence').default(1.0),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── MARKETINQ OCAGI ─────────────────────────────────────────────────

export const marketingToolRuns = pgTable(
  'marketing_tool_runs',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    toolSlug: varchar('tool_slug', { length: 64 }).notNull(),
    inputData: jsonb('input_data').$type<Record<string, unknown>>().notNull(),
    outputData: jsonb('output_data').$type<Record<string, unknown>>(),
    aiProvider: varchar('ai_provider', { length: 16 }),
    tokensUsed: integer('tokens_used').default(0),
    costAzn: real('cost_azn').default(0),
    status: varchar('status', { length: 16 }).default('pending'),
    errorMessage: varchar('error_message', { length: 500 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    locale: varchar('locale', { length: 2 }).notNull().default('az'),
  },
  (table) => ({
    userIdx: index('idx_mtr_user').on(table.userId),
    slugIdx: index('idx_mtr_slug').on(table.toolSlug),
    createdIdx: index('idx_mtr_created').on(table.createdAt),
  })
);

// ── ADMIN AUDIT LOG (OWASP 2025 — immutable) ─────────────────────────

export const adminAuditLogs = pgTable(
  'admin_audit_logs',
  {
    id: serial('id').primaryKey(),
    adminId: integer('admin_id').notNull(),
    adminEmail: varchar('admin_email', { length: 255 }).notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    targetUserId: integer('target_user_id'),
    targetEmail: varchar('target_email', { length: 255 }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    adminIdx: index('idx_aal_admin').on(table.adminId),
    actionIdx: index('idx_aal_action').on(table.action),
    createdIdx: index('idx_aal_created').on(table.createdAt),
  })
);

// ── USER EVENTS (adoption loop telemetry) ──────────────────────────

export const userEvents = pgTable(
  'user_events',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    eventType: varchar('event_type', { length: 50 }).notNull(),
    payload: jsonb('payload'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('idx_ue_user').on(table.userId),
    typeIdx: index('idx_ue_type').on(table.eventType),
    createdIdx: index('idx_ue_created').on(table.createdAt),
  })
);

// ── FRANCHISE LEADS ─────────────────────────────────────────────────

export const franchiseToolSourceEnum = pgEnum('franchise_tool_source', [
  'readiness_test',
  'roi_calc',
  'buyer_checklist',
  'franchbook_gate',
  'academy',
  'consulting',
]);

export const franchiseLeads = pgTable(
  'franchise_leads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    brand: text('brand'),
    contact: text('contact').notNull(),
    toolSource: franchiseToolSourceEnum('tool_source').notNull(),
    score: jsonb('score'),
    locale: varchar('locale', { length: 2 }).notNull().default('az'),
    consentKvkk: boolean('consent_kvkk').notNull().default(false),
    consentVersion: text('consent_version'),
    ipHash: text('ip_hash'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  (table) => ({
    sourceIdx: index('idx_fl_source').on(table.toolSource),
    createdIdx: index('idx_fl_created').on(table.createdAt),
  })
);

export const franchbookProjects = pgTable(
  'franchbook_projects',
  {
    id: serial('id').primaryKey(),
    ownerId: integer('owner_id')
      .notNull()
      .references(() => users.id),
    brand: text('brand').notNull(),
    sector: text('sector').notNull(),
    inputs: jsonb('inputs').$type<Record<string, unknown>>().notNull(),
    content: jsonb('content').$type<Record<string, unknown>>(),
    status: text('status').notNull().default('draft'),
    locale: varchar('locale', { length: 2 }).notNull().default('az'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    ownerIdx: index('idx_fbp_owner').on(table.ownerId),
    statusIdx: index('idx_fbp_status').on(table.status),
    createdIdx: index('idx_fbp_created').on(table.createdAt),
  })
);

// ── EQUIPMENT CONDITION ENUM (M5.1) ─────────────────────────────────

export const equipmentConditionEnum = pgEnum('equipment_condition', ['new', 'used']);

// NOTE: listings, listingLeads, listingMedia, listingReviews tables
// are defined above (line ~191). M5.1 adds columns via Drizzle migration.

// Visitor Analytics (Web Conversion Events)
export const webConversionEvents = pgTable(
  'web_conversion_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: varchar('session_id', { length: 255 }).notNull(),
    pagePath: text('page_path').notNull(),
    eventName: varchar('event_name', { length: 100 }).notNull(), // 'page_view', 'dwell_30s', 'portal_exit'
    source: varchar('source', { length: 100 }),
    campaign: varchar('campaign', { length: 100 }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index('idx_wce_session').on(table.sessionId),
    eventIdx: index('idx_wce_event').on(table.eventName),
    createdIdx: index('idx_wce_created').on(table.createdAt),
  })
);

// ── ADVERTISEMENTS (banner ads — TASK-0315 PR-1) ────────────────────
// Format kept text (not pgEnum) so html5/lottie can be added later without an
// ALTER TYPE. PR-1 renders image|gif|video; html5/lottie need CSP work first.
export const ads = pgTable(
  'ads',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 150 }).notNull(),
    format: varchar('format', { length: 10 }).notNull().default('image'),
    mediaUrl: text('media_url').notNull(),
    targetUrl: text('target_url').notNull(),
    placement: varchar('placement', { length: 40 }).notNull(),
    altText: varchar('alt_text', { length: 200 }),
    advertiser: varchar('advertiser', { length: 150 }),
    isActive: boolean('is_active').notNull().default(false),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    impressions: integer('impressions').notNull().default(0),
    clicks: integer('clicks').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    placementActiveIdx: index('idx_ads_placement_active').on(table.placement, table.isActive),
  })
);
