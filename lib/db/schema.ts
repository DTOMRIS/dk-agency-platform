import {
  pgTable,
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

// Listings (ilanlar)
export const listings = pgTable('listings', {
  id: serial('id').primaryKey(),
  title_az: text('title_az').notNull(),
  title_tr: text('title_tr'),
  title_en: text('title_en'),
  category: varchar('category', { length: 50 }),
  price: integer('price'),
  priceType: varchar('price_type', { length: 20 }),
  currency: varchar('currency', { length: 5 }).default('AZN'),
  location: varchar('location', { length: 100 }),
  description_az: text('description_az'),
  description_tr: text('description_tr'),
  description_en: text('description_en'),
  images: jsonb('images'),
  contactPhone: varchar('contact_phone', { length: 20 }),
  contactEmail: varchar('contact_email', { length: 100 }),
  status: varchar('status', { length: 20 }).default('pending'),
  views: integer('views').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
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
