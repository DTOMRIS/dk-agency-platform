/**
 * TASK-0521 — «Bütün müraciətlər» unified admin inbox (read-only).
 *
 * Every public form/click that e-mails ADMIN_EMAIL also writes a row somewhere; before this task
 * listing inquiries (listing_leads) had no admin list at all and the rest were spread over three
 * pages. This module SELECTs the last N rows of each source table inside a period and normalises
 * them into one shape. No writes, no schema change.
 *
 *   listing   → listing_leads (+ listings.title)       detail: /dashboard/ilanlar/[id]
 *   contact   → leads (WhatsApp/Telegram/KAZAN clicks) detail: /dashboard/contact-tracking
 *   kazan     → kazan_leads                            detail: /dashboard/kazan-leads
 *   franchise → franchise_leads (member/OTA/radar)     detail: /dashboard/franchise-leads
 *   newsletter→ email_preferences (newsletter sources) detail: — (no admin page)
 */

import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import {
  emailPreferences,
  franchiseLeads,
  kazanLeads,
  leads,
  listingLeads,
  listings,
} from '@/lib/db/schema';

export const INBOX_SOURCES = ['listing', 'contact', 'kazan', 'franchise', 'newsletter'] as const;
export type InboxSource = (typeof INBOX_SOURCES)[number];

export const INBOX_PERIODS = [7, 30, 90] as const;
export type InboxPeriod = (typeof INBOX_PERIODS)[number];

/** Newsletter sign-ups are e-mail preference rows whose consent came from a newsletter form. */
const NEWSLETTER_CONSENT_SOURCES = ['homepage_newsletter', 'blog_newsletter'];

/** Per-source cap so a noisy table (WhatsApp clicks) cannot drown the others. */
export const INBOX_PER_SOURCE_LIMIT = 200;

export type InboxItem = {
  key: string;
  date: Date;
  source: InboxSource;
  /** Sub-type inside the source: whatsapp/telegram/kazan, toolSource or score.source, consent source… */
  channel: string | null;
  /** Origin key inside the source table (leads.source: wa_redirect/contact_page/home_join). */
  origin: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  /** Listing title, page path or brand — "where it came from". */
  context: string | null;
  message: string | null;
  status: string | null;
  href: string | null;
};

const SNIPPET = 220;
function snippet(value: string | null | undefined): string | null {
  if (!value) return null;
  const clean = value.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  return clean.length > SNIPPET ? `${clean.slice(0, SNIPPET - 1)}…` : clean;
}

function pagePath(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, 'https://dkagency.az');
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

/** franchise_leads.contact is free text: e-mail or phone. */
function splitContact(contact: string): { phone: string | null; email: string | null } {
  return contact.includes('@') ? { phone: null, email: contact } : { phone: contact, email: null };
}

function scoreSource(score: unknown): string | null {
  if (score && typeof score === 'object' && 'source' in score) {
    const value = (score as { source?: unknown }).source;
    return typeof value === 'string' ? value : null;
  }
  return null;
}

function since(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/** Loads the last INBOX_PER_SOURCE_LIMIT rows of every source inside the period, newest first. */
export async function getInboxItems(periodDays: InboxPeriod): Promise<InboxItem[] | null> {
  if (!db) return null;
  const from = since(periodDays);
  const limit = INBOX_PER_SOURCE_LIMIT;
  const newsletterDate = sql<Date>`coalesce(${emailPreferences.consentGivenAt}, ${emailPreferences.lastUpdatedAt})`;

  const [listingRows, contactRows, kazanRows, franchiseRows, newsletterRows] = await Promise.all([
    db
      .select({
        id: listingLeads.id,
        listingId: listingLeads.listingId,
        name: listingLeads.name,
        phone: listingLeads.phone,
        email: listingLeads.email,
        message: listingLeads.message,
        status: listingLeads.status,
        createdAt: listingLeads.createdAt,
        title: listings.title,
        trackingCode: listings.trackingCode,
      })
      .from(listingLeads)
      .leftJoin(listings, eq(listings.id, listingLeads.listingId))
      .where(gte(listingLeads.createdAt, from))
      .orderBy(desc(listingLeads.createdAt))
      .limit(limit),
    db
      .select({
        id: leads.id,
        source: leads.source,
        channel: leads.channel,
        sourceUrl: leads.sourceUrl,
        prefillText: leads.prefillText,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .where(gte(leads.createdAt, from))
      .orderBy(desc(leads.createdAt))
      .limit(limit),
    db
      .select({
        id: kazanLeads.id,
        name: kazanLeads.name,
        phone: kazanLeads.phone,
        email: kazanLeads.email,
        intent: kazanLeads.intent,
        status: kazanLeads.status,
        conversationContext: kazanLeads.conversationContext,
        createdAt: kazanLeads.createdAt,
      })
      .from(kazanLeads)
      .where(gte(kazanLeads.createdAt, from))
      .orderBy(desc(kazanLeads.createdAt))
      .limit(limit),
    db
      .select({
        id: franchiseLeads.id,
        name: franchiseLeads.name,
        brand: franchiseLeads.brand,
        contact: franchiseLeads.contact,
        toolSource: franchiseLeads.toolSource,
        score: franchiseLeads.score,
        createdAt: franchiseLeads.createdAt,
      })
      .from(franchiseLeads)
      .where(gte(franchiseLeads.createdAt, from))
      .orderBy(desc(franchiseLeads.createdAt))
      .limit(limit),
    db
      .select({
        id: emailPreferences.id,
        email: emailPreferences.email,
        consentSource: emailPreferences.consentSource,
        subscribed: emailPreferences.newsletterSubscribed,
        date: newsletterDate,
      })
      .from(emailPreferences)
      .where(
        and(
          inArray(emailPreferences.consentSource, NEWSLETTER_CONSENT_SOURCES),
          sql`${newsletterDate} >= ${from.toISOString()}::timestamptz`,
        ),
      )
      .orderBy(desc(newsletterDate))
      .limit(limit),
  ]);

  const items: InboxItem[] = [
    ...listingRows.map<InboxItem>((row) => ({
      key: `listing-${row.id}`,
      date: new Date(row.createdAt),
      source: 'listing',
      channel: 'form',
      origin: null,
      name: row.name,
      phone: row.phone,
      email: row.email,
      context: row.title ? `${row.title}${row.trackingCode ? ` · ${row.trackingCode}` : ''}` : null,
      message: snippet(row.message),
      status: row.status,
      href: `/dashboard/ilanlar/${row.listingId}`,
    })),
    ...contactRows.map<InboxItem>((row) => ({
      key: `contact-${row.id}`,
      date: new Date(row.createdAt),
      source: 'contact',
      channel: row.channel,
      origin: row.source,
      name: null,
      phone: null,
      email: null,
      context: pagePath(row.sourceUrl),
      message: snippet(row.prefillText),
      status: null,
      href: '/dashboard/contact-tracking',
    })),
    ...kazanRows.map<InboxItem>((row) => {
      const lastUser = [...(row.conversationContext ?? [])].reverse().find((m) => m.role === 'user');
      return {
        key: `kazan-${row.id}`,
        date: new Date(row.createdAt),
        source: 'kazan',
        channel: row.intent,
        origin: null,
        name: row.name,
        phone: row.phone,
        email: row.email,
        context: null,
        message: snippet(lastUser?.content),
        status: row.status,
        href: '/dashboard/kazan-leads',
      };
    }),
    ...franchiseRows.map<InboxItem>((row) => ({
      key: `franchise-${row.id}`,
      date: new Date(row.createdAt),
      source: 'franchise',
      channel: scoreSource(row.score) ?? row.toolSource,
      origin: null,
      name: row.name,
      ...splitContact(row.contact),
      context: row.brand,
      message: null,
      status: null,
      href: '/dashboard/franchise-leads',
    })),
    ...newsletterRows.map<InboxItem>((row) => ({
      key: `newsletter-${row.id}`,
      date: new Date(row.date),
      source: 'newsletter',
      channel: row.consentSource,
      origin: null,
      name: null,
      phone: null,
      email: row.email,
      context: null,
      message: null,
      status: row.subscribed ? 'subscribed' : 'unsubscribed',
      href: null,
    })),
  ];

  return items.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** Total rows across all sources in the last `days` days (sidebar badge). Five COUNT(*) queries. */
/**
 * Sidebar badge: real enquiries only (listing, KAZAN, franchise/OTA/radar, newsletter).
 * Anonymous WhatsApp/contact clicks are left out so the badge is not noise (owner-facing decision 2026-10-09).
 */
export async function countInboxSince(days: number): Promise<number | null> {
  if (!db) return null;
  const from = since(days);
  const count = sql<number>`count(*)::int`;
  const [a, c, d, e] = await Promise.all([
    db.select({ n: count }).from(listingLeads).where(gte(listingLeads.createdAt, from)),
    db.select({ n: count }).from(kazanLeads).where(gte(kazanLeads.createdAt, from)),
    db.select({ n: count }).from(franchiseLeads).where(gte(franchiseLeads.createdAt, from)),
    db
      .select({ n: count })
      .from(emailPreferences)
      .where(
        and(
          inArray(emailPreferences.consentSource, NEWSLETTER_CONSENT_SOURCES),
          sql`coalesce(${emailPreferences.consentGivenAt}, ${emailPreferences.lastUpdatedAt}) >= ${from.toISOString()}::timestamptz`,
        ),
      ),
  ]);
  return [a, c, d, e].reduce((sum, rows) => sum + Number(rows[0]?.n ?? 0), 0);
}
