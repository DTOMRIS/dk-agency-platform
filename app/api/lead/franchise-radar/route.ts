import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { franchiseLeads } from '@/lib/db/schema';
import { sendSmtpEmail } from '@/lib/email/smtp';
import { wrapEmail } from '@/lib/email/templates';
import { getFranchiseBrand } from '@/lib/data/franchiseDirectory';
import { sql } from 'drizzle-orm';
import { createHash } from 'crypto';

const VALID_LOCALES = ['az', 'ru', 'en', 'tr'];

type ValidData = {
  name: string;
  contact: string;
  brandSlug: string;
  brandName: string;
  locale: string;
  consentVersion: string;
};

function validate(body: unknown): { ok: true; data: ValidData } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' };
  const b = body as Record<string, unknown>;

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const contact = typeof b.contact === 'string' ? b.contact.trim() : '';
  const brandSlug = typeof b.brandSlug === 'string' ? b.brandSlug.trim() : '';

  if (!name || name.length < 2 || name.length > 200)
    return { ok: false, error: 'name: 2-200 chars required' };
  if (!contact || contact.length < 3) return { ok: false, error: 'contact required' };
  if (b.consent !== true) return { ok: false, error: 'consent: must be true' };

  const brand = brandSlug ? getFranchiseBrand(brandSlug) : null;
  if (!brand) return { ok: false, error: 'brandSlug: unknown brand' };

  const sanitize = (s: string) => s.replace(/[<>{}[\]\\]/g, '').slice(0, 200);

  return {
    ok: true,
    data: {
      name: sanitize(name),
      contact: sanitize(contact),
      brandSlug: brand.slug,
      brandName: brand.brandName,
      locale: VALID_LOCALES.includes(String(b.locale)) ? String(b.locale) : 'az',
      consentVersion: typeof b.consentVersion === 'string' ? b.consentVersion.slice(0, 50) : 'v1',
    },
  };
}

function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + (process.env.JWT_SECRET || ''))
    .digest('hex')
    .slice(0, 16);
}

async function isRateLimited(ipHash: string): Promise<boolean> {
  if (!db) return false;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(franchiseLeads)
    .where(
      sql`${franchiseLeads.ipHash} = ${ipHash} AND ${franchiseLeads.createdAt} > ${oneHourAgo}`
    );
  return (result[0]?.count ?? 0) >= 5;
}

function adminHtml(data: ValidData, leadId: string): string {
  return wrapEmail(`
    <h2 style="color:#1A1A2E;font-size:20px;margin:0 0 16px;">Yeni Franchise Radar Lead</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#64748b;width:120px">Brend:</td><td style="padding:8px 0;font-weight:700">${data.brandName}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Ad:</td><td style="padding:8px 0">${data.name}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Əlaqə:</td><td style="padding:8px 0">${data.contact}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Dil:</td><td style="padding:8px 0">${data.locale.toUpperCase()}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Lead ID:</td><td style="padding:8px 0;font-size:12px;color:#94a3b8">${leadId}</td></tr>
    </table>
    <p style="margin-top:20px;">
      <a href="https://dkagency.com.tr/dashboard/franchise-leads" style="display:inline-block;background:#E11D48;color:#ffffff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:700;font-size:14px;">Lead-ə bax</a>
    </p>
  `);
}

export async function POST(req: NextRequest) {
  if (!dbAvailable || !db) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const v = validate(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const ipHash = hashIp(ip);

  if (await isRateLimited(ipHash)) {
    return NextResponse.json({ error: 'Rate limited — max 5 leads per hour' }, { status: 429 });
  }

  const data = v.data;

  const inserted = await db
    .insert(franchiseLeads)
    .values({
      name: data.name,
      brand: data.brandName,
      contact: data.contact,
      // toolSource is a protected enum — reuse 'consulting' and stash the real
      // source + brand in the score jsonb (same pattern as the ota-guide route).
      toolSource: 'consulting',
      score: { source: 'franchise_radar', brandSlug: data.brandSlug },
      locale: data.locale,
      consentKvkk: true,
      consentVersion: data.consentVersion,
      ipHash,
      userAgent: req.headers.get('user-agent')?.slice(0, 500) || null,
    })
    .returning({ id: franchiseLeads.id });

  const leadId = inserted[0]?.id || 'unknown';

  const adminEmail = process.env.ADMIN_EMAIL || 'info@dkagency.com.tr';
  sendSmtpEmail(
    adminEmail,
    `Yeni Franchise Radar Lead — ${data.brandName}`,
    adminHtml(data, leadId)
  ).catch((err) => console.error('[email] Franchise radar admin mail failed:', err));

  return NextResponse.json({ success: true, leadId });
}
