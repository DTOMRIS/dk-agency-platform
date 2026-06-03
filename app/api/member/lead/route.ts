import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { franchiseLeads } from '@/lib/db/schema';
import { sendSmtpEmail } from '@/lib/email/smtp';
import { sql } from 'drizzle-orm';
import { createHash } from 'crypto';

// ── Zod-free validation (zero extra deps) ──────────────────────────

type LeadInput = {
  name: string;
  brand?: string;
  contact: string;
  toolSource: 'readiness_test' | 'roi_calc' | 'buyer_checklist' | 'franchbook_gate' | 'academy' | 'consulting';
  score?: Record<string, unknown>;
  locale?: string;
  consentKvkk: boolean;
  consentVersion?: string;
};

const VALID_SOURCES = ['readiness_test', 'roi_calc', 'buyer_checklist', 'franchbook_gate', 'academy', 'consulting'] as const;
const VALID_LOCALES = ['az', 'ru', 'en', 'tr'];

function validate(body: unknown): { ok: true; data: LeadInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' };
  const b = body as Record<string, unknown>;

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const contact = typeof b.contact === 'string' ? b.contact.trim() : '';
  const toolSource = typeof b.toolSource === 'string' ? b.toolSource : '';

  if (!name || name.length < 2 || name.length > 200) return { ok: false, error: 'name: 2-200 chars required' };
  if (!contact || contact.length < 5 || contact.length > 200) return { ok: false, error: 'contact: 5-200 chars required' };
  if (!VALID_SOURCES.includes(toolSource as typeof VALID_SOURCES[number])) return { ok: false, error: 'toolSource: invalid' };
  if (b.consentKvkk !== true) return { ok: false, error: 'consentKvkk: must be true' };

  // Sanitize — strip anything that looks like prompt injection
  const sanitize = (s: string) => s.replace(/[<>{}[\]\\]/g, '').slice(0, 200);

  return {
    ok: true,
    data: {
      name: sanitize(name),
      brand: typeof b.brand === 'string' ? sanitize(b.brand.trim()) : undefined,
      contact: sanitize(contact),
      toolSource: toolSource as LeadInput['toolSource'],
      score: b.score && typeof b.score === 'object' ? b.score as Record<string, unknown> : undefined,
      locale: VALID_LOCALES.includes(String(b.locale)) ? String(b.locale) : 'az',
      consentKvkk: true,
      consentVersion: typeof b.consentVersion === 'string' ? b.consentVersion.slice(0, 50) : 'v1',
    },
  };
}

// ── Rate limit (IP-based, 3 leads/hour) ────────────────────────────

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.JWT_SECRET || '')).digest('hex').slice(0, 16);
}

async function isRateLimited(ipHash: string): Promise<boolean> {
  if (!db) return false;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(franchiseLeads)
    .where(sql`${franchiseLeads.ipHash} = ${ipHash} AND ${franchiseLeads.createdAt} > ${oneHourAgo}`);
  return (result[0]?.count ?? 0) >= 3;
}

// ── Email notifications ────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  readiness_test: 'Franchise Hazırlıq Testi',
  roi_calc: 'ROI Kalkulyatoru',
  buyer_checklist: 'Alıcı Çek-listi',
  franchbook_gate: 'AI Françbuk USTA Gate',
  academy: 'Franchise Akademiyası',
  consulting: 'Məsləhət Sorğusu',
};

function adminNotificationHtml(data: LeadInput, leadId: string): string {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc">
      <div style="background:#1A1A2E;padding:24px;text-align:center">
        <div style="color:#C5A022;font-size:24px;font-weight:800">DK Agency</div>
      </div>
      <div style="background:#fff;padding:32px">
        <h2 style="color:#1A1A2E;margin:0 0 16px">Yeni Franchise Lead</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#64748b;width:120px">Alət:</td><td style="padding:8px 0;font-weight:600">${TOOL_LABELS[data.toolSource] || data.toolSource}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Ad:</td><td style="padding:8px 0">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Marka:</td><td style="padding:8px 0">${data.brand || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Əlaqə:</td><td style="padding:8px 0">${data.contact}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Dil:</td><td style="padding:8px 0">${data.locale?.toUpperCase()}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Lead ID:</td><td style="padding:8px 0;font-size:12px;color:#94a3b8">${leadId}</td></tr>
        </table>
        ${data.score ? `<div style="margin-top:16px;padding:12px;background:#f1f5f9;border-radius:8px;font-size:12px"><pre style="margin:0;white-space:pre-wrap">${JSON.stringify(data.score, null, 2)}</pre></div>` : ''}
      </div>
      <div style="padding:16px 24px;color:#64748b;font-size:12px;text-align:center">&copy; 2026 DK Agency</div>
    </div>
  `;
}

function userThankYouHtml(data: LeadInput): string {
  const locale = data.locale || 'az';
  const t: Record<string, { subject: string; greeting: string; body: string; closing: string }> = {
    az: { subject: 'DK Agency — Müraciətiniz qəbul olundu', greeting: `Hörmətli ${data.name},`, body: 'Müraciətiniz uğurla qeydə alındı. Komandamız ən qısa zamanda sizinlə əlaqə saxlayacaq.', closing: 'Uğurlar arzulayırıq!' },
    ru: { subject: 'DK Agency — Ваша заявка принята', greeting: `Уважаемый(ая) ${data.name},`, body: 'Ваша заявка успешно зарегистрирована. Наша команда свяжется с вами в ближайшее время.', closing: 'Желаем успехов!' },
    en: { subject: 'DK Agency — Your request received', greeting: `Dear ${data.name},`, body: 'Your request has been successfully recorded. Our team will contact you shortly.', closing: 'Best regards!' },
    tr: { subject: 'DK Agency — Başvurunuz alındı', greeting: `Sayın ${data.name},`, body: 'Başvurunuz başarıyla kaydedildi. Ekibimiz en kısa sürede sizinle iletişime geçecektir.', closing: 'Başarılar dileriz!' },
  };
  const copy = t[locale] || t.az;
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc">
      <div style="background:#1A1A2E;padding:24px;text-align:center">
        <div style="color:#C5A022;font-size:24px;font-weight:800">DK Agency</div>
      </div>
      <div style="background:#fff;padding:32px">
        <h2 style="color:#1A1A2E;margin:0 0 12px">${copy.greeting}</h2>
        <p style="color:#334155;line-height:1.7">${copy.body}</p>
        <p style="color:#334155;margin-top:16px">${copy.closing}</p>
        <p style="color:#94a3b8;font-size:13px;margin-top:24px">— DK Agency komandası</p>
      </div>
      <div style="padding:16px 24px;color:#64748b;font-size:12px;text-align:center">&copy; 2026 DK Agency</div>
    </div>
  `;
}

// ── POST handler ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!dbAvailable || !db) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const v = validate(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  const ipHash = hashIp(ip);

  if (await isRateLimited(ipHash)) {
    return NextResponse.json({ error: 'Rate limited — max 3 leads per hour' }, { status: 429 });
  }

  const data = v.data;

  const inserted = await db.insert(franchiseLeads).values({
    name: data.name,
    brand: data.brand || null,
    contact: data.contact,
    toolSource: data.toolSource,
    score: data.score || null,
    locale: data.locale || 'az',
    consentKvkk: true,
    consentVersion: data.consentVersion || 'v1',
    ipHash,
    userAgent: req.headers.get('user-agent')?.slice(0, 500) || null,
  }).returning({ id: franchiseLeads.id });

  const leadId = inserted[0]?.id || 'unknown';

  // Fire-and-forget emails
  const adminEmail = process.env.ADMIN_EMAIL || 'info@dkagency.com.tr';
  sendSmtpEmail(adminEmail, `Yeni Franchise Lead — ${TOOL_LABELS[data.toolSource]}`, adminNotificationHtml(data, leadId)).catch(() => {});

  // User thank-you (only if contact looks like email)
  if (data.contact.includes('@')) {
    const locale = data.locale || 'az';
    const t: Record<string, string> = { az: 'DK Agency — Müraciətiniz qəbul olundu', ru: 'DK Agency — Ваша заявка принята', en: 'DK Agency — Your request received', tr: 'DK Agency — Başvurunuz alındı' };
    sendSmtpEmail(data.contact, t[locale] || t.az, userThankYouHtml(data)).catch(() => {});
  }

  return NextResponse.json({ success: true, leadId });
}
