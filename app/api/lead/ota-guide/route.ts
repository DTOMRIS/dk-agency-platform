import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { franchiseLeads } from '@/lib/db/schema';
import { sendSmtpEmail } from '@/lib/email/smtp';
import { sql } from 'drizzle-orm';
import { createHash } from 'crypto';

const VALID_LOCALES = ['az', 'ru', 'en', 'tr'];

function validate(body: unknown): { ok: true; data: ValidData } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' };
  const b = body as Record<string, unknown>;

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const contact = typeof b.contact === 'string' ? b.contact.trim() : '';
  const whatsapp = typeof b.whatsapp === 'string' ? b.whatsapp.trim() : '';

  if (!name || name.length < 2 || name.length > 200) return { ok: false, error: 'name: 2-200 chars required' };
  if (!contact && !whatsapp) return { ok: false, error: 'contact or whatsapp required' };
  if (b.consentKvkk !== true) return { ok: false, error: 'consentKvkk: must be true' };

  const sanitize = (s: string) => s.replace(/[<>{}[\]\\]/g, '').slice(0, 200);

  return {
    ok: true,
    data: {
      name: sanitize(name),
      contact: sanitize(contact || whatsapp),
      whatsapp: whatsapp ? sanitize(whatsapp) : undefined,
      toolSource: 'ota_guide_pdf',
      locale: VALID_LOCALES.includes(String(b.locale)) ? String(b.locale) : 'az',
      consentKvkk: true,
      consentVersion: typeof b.consentVersion === 'string' ? b.consentVersion.slice(0, 50) : 'v1',
    },
  };
}

type ValidData = {
  name: string;
  contact: string;
  whatsapp?: string;
  toolSource: string;
  locale: string;
  consentKvkk: boolean;
  consentVersion: string;
};

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

function adminHtml(data: ValidData, leadId: string): string {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc">
      <div style="background:#1A1A2E;padding:24px;text-align:center">
        <div style="color:#C5A022;font-size:24px;font-weight:800">DK Agency</div>
      </div>
      <div style="background:#fff;padding:32px">
        <h2 style="color:#1A1A2E;margin:0 0 16px">Yeni OTA Lead — Bələdçi Sorğusu</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#64748b;width:120px">Ad:</td><td style="padding:8px 0">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Əlaqə:</td><td style="padding:8px 0">${data.contact}</td></tr>
          ${data.whatsapp ? `<tr><td style="padding:8px 0;color:#64748b">WhatsApp:</td><td style="padding:8px 0">${data.whatsapp}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#64748b">Dil:</td><td style="padding:8px 0">${data.locale.toUpperCase()}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Lead ID:</td><td style="padding:8px 0;font-size:12px;color:#94a3b8">${leadId}</td></tr>
        </table>
      </div>
      <div style="padding:16px 24px;color:#64748b;font-size:12px;text-align:center">&copy; 2026 DK Agency</div>
    </div>
  `;
}

function userHtml(data: ValidData): string {
  const t: Record<string, { subject: string; greeting: string; body: string; closing: string }> = {
    az: { subject: 'DK Agency — OTA Bələdçiniz hazırdır', greeting: `Hörmətli ${data.name},`, body: 'OTA Açma Bələdçisi sorğunuz qəbul olundu. Komandamız 24 saat ərzində WhatsApp və ya email ilə əlaqə saxlayacaq.', closing: 'Uğurlar!' },
    ru: { subject: 'DK Agency — Ваш OTA гид готов', greeting: `Уважаемый(ая) ${data.name},`, body: 'Ваш запрос на OTA гид успешно получен. Наша команда свяжется с вами в течение 24 часов.', closing: 'Успехов!' },
    en: { subject: 'DK Agency — Your OTA Guide is ready', greeting: `Dear ${data.name},`, body: 'Your OTA Guide request has been received. Our team will reach out within 24 hours via WhatsApp or email.', closing: 'Best regards!' },
    tr: { subject: 'DK Agency — OTA Rehberiniz hazır', greeting: `Sayın ${data.name},`, body: 'OTA Rehberi talebiniz alındı. Ekibimiz 24 saat içinde WhatsApp veya email ile iletişime geçecektir.', closing: 'Başarılar!' },
  };
  const c = t[data.locale] || t.az;
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc">
      <div style="background:#1A1A2E;padding:24px;text-align:center">
        <div style="color:#C5A022;font-size:24px;font-weight:800">DK Agency</div>
      </div>
      <div style="background:#fff;padding:32px">
        <h2 style="color:#1A1A2E;margin:0 0 12px">${c.greeting}</h2>
        <p style="color:#334155;line-height:1.7">${c.body}</p>
        <p style="color:#334155;margin-top:16px">${c.closing}</p>
        <p style="color:#94a3b8;font-size:13px;margin-top:24px">— DK Agency komandası</p>
      </div>
      <div style="padding:16px 24px;color:#64748b;font-size:12px;text-align:center">&copy; 2026 DK Agency</div>
    </div>
  `;
}

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
    brand: null,
    contact: data.contact,
    toolSource: 'consulting',
    score: { source: 'ota_guide_pdf', whatsapp: data.whatsapp || null },
    locale: data.locale,
    consentKvkk: true,
    consentVersion: data.consentVersion,
    ipHash,
    userAgent: req.headers.get('user-agent')?.slice(0, 500) || null,
  }).returning({ id: franchiseLeads.id });

  const leadId = inserted[0]?.id || 'unknown';

  const adminEmail = process.env.ADMIN_EMAIL || 'info@dkagency.com.tr';
  sendSmtpEmail(adminEmail, 'Yeni OTA Lead — Bələdçi Sorğusu', adminHtml(data, leadId)).catch(() => {});

  if (data.contact.includes('@')) {
    const t: Record<string, string> = { az: 'DK Agency — OTA Bələdçiniz hazırdır', ru: 'DK Agency — Ваш OTA гид готов', en: 'DK Agency — Your OTA Guide is ready', tr: 'DK Agency — OTA Rehberiniz hazır' };
    sendSmtpEmail(data.contact, t[data.locale] || t.az, userHtml(data)).catch(() => {});
  }

  return NextResponse.json({ success: true, leadId });
}
