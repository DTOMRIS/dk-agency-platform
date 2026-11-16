import { NextRequest, NextResponse, after } from 'next/server';
import { db } from '@/lib/db';
import { kazanLeads } from '@/lib/db/schema';
import { leadButtons, notifyOwner } from '@/lib/telegram/notify-owner';
import { attributionLine } from '@/lib/analytics/attribution';
import { readAttribution, recordLeadSource } from '@/lib/analytics/attribution-server';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/utils/rate-limit';
import { captureContext, contactNotificationPreview, normalizeContactPhone } from '@/lib/contact/capture';
import { detectKazanIntent, normalizeBusinessType } from '@/lib/repositories/kazanLeadRepository';

/**
 * Site message form (TASK-0558). public-ok: anonymous visitors write to the owner; rate-limited + honeypot.
 *
 * Owner 2026-11-08: «mesaj bana gelmiyor — ya telegram ya mail olsun ama mesaj gelsin». The WhatsApp
 * button only opens WhatsApp on the visitor's phone; most never press Send. This form delivers the text
 * itself: saved in `kazan_leads` (dashboard «KAZAN leads», with status/notes), sent to the owner's Telegram
 * with a «WhatsApp-da yaz» button to the visitor's number, and e-mailed to ADMIN_EMAIL.
 * The visitor is told «sent» only when the message was saved or reached Telegram; otherwise 503.
 */

const MESSAGE_MAX = 2000;
const TELEGRAM_CHUNK = 480;

type FieldError = 'name' | 'phone' | 'message';

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function chunks(value: string, size: number): string[] {
  const out: string[] = [];
  for (const line of value.split(/\r?\n/)) {
    if (!line.trim()) continue;
    for (let i = 0; i < line.length; i += size) out.push(line.slice(i, i + size));
  }
  return out;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    body = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_body' }, { status: 400 });
  }

  // Honeypot: a hidden field people never fill. Bots get a quiet «ok» and nothing is sent.
  if (text(body.website, 200)) {
    return NextResponse.json({ success: true });
  }

  const name = text(body.name, 100);
  const phone = normalizeContactPhone(text(body.phone, 30));
  const message = text(body.message, MESSAGE_MAX);
  const page = text(body.page, 300) || null;
  const email = text(body.email, 255);
  const businessName = text(body.businessName, 100);
  const businessType = normalizeBusinessType(text(body.businessType, 30));
  const source = body.source === 'kazan_page' || body.source === 'kazan_widget' ? body.source : 'site_form';
  const context = captureContext(body.conversationContext);
  const intent = detectKazanIntent([...context.map(x => x.content), message].join(' '));

  const fields: FieldError[] = [];
  if (name.length < 2) fields.push('name');
  if (!phone) fields.push('phone');
  if (message.length < 2) fields.push('message');
  if (fields.length > 0) {
    return NextResponse.json({ success: false, error: 'invalid_fields', fields }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ success: false, error: 'invalid_fields', fields: ['email'] }, { status: 400 });

  // Counted only for well-formed messages: a typo does not use up the visitor's quota.
  if (!checkRateLimit(`lead-message:${getClientIp(req)}`, RATE_LIMITS.leadMessage).success) {
    return NextResponse.json({ success: false, error: 'rate_limited' }, { status: 429 });
  }

  let leadId: string | null = null;
  try {
    if (db) {
      const [row] = await db
        .insert(kazanLeads)
        .values({
          name,
          phone: phone!,
          email: email || null,
          businessType,
          intent,
          conversationContext: [...context, { role: 'user', content: message }].slice(-3),
          notes: [
            { at: new Date().toISOString(), text: `Sayt mesaj formu${page ? ` · ${page}` : ''}` },
            { at: new Date().toISOString(), text: `Əlaqə istəyi · ${source}${businessName ? ` · ${businessName}` : ''}` },
          ],
        })
        .returning({ id: kazanLeads.id });
      leadId = row?.id ?? null;
    }
  } catch {
    leadId = null;
  }

  const leadAttr = readAttribution(req);
  const telegramSent = await notifyOwner({
    title: '✉️ Yeni mesaj · sayt formu',
    lines: contactNotificationPreview([
      `Ad: ${name}`,
      `Telefon: ${phone}`,
      leadId ? null : '⚠️ Bazaya yazılmadı — mesaj yalnız buradadır.',
      businessName ? `Müəssisə: ${businessName}` : null,
      `Biznes: ${businessType} · mövzu: ${intent}`,
      `Forma: ${source} · geri dönüş istənilir`,
      email ? `E-poçt: ${email}` : null,
      page ? `Səhifə: ${page}` : null,
      'Mesaj:',
      ...chunks(message, TELEGRAM_CHUNK),
      ...context.flatMap(x => chunks(`${x.role === 'user' ? 'Ziyarətçi' : 'KAZAN'}: ${x.content}`, TELEGRAM_CHUNK)),
      attributionLine(leadAttr),
    ]),
    buttons: leadButtons(phone, '/dashboard/kazan-leads'),
  });

  if (!leadId && !telegramSent) {
    return NextResponse.json({ success: false, error: 'unavailable' }, { status: 503 });
  }

  after(async () => {
    await recordLeadSource(leadAttr, 'site_message', page);
    try {
      const { emailTemplates, sendEmail } = await import('@/lib/email/templates');
      const adminEmail = process.env.ADMIN_EMAIL || 'info@dkagency.com.tr';
      await sendEmail(
        adminEmail,
        emailTemplates.siteMessageAdmin(name, phone!, `${businessName ? `${businessName}\n` : ''}${message}\n${context.map(x => `${x.role}: ${x.content}`).join('\n')}`, page),
        'site_message'
      );
    } catch {
      // e-mail is the second channel — Telegram / the panel already have the message
    }
  });

  return NextResponse.json({ success: true, contact: { id: leadId, name, phone, businessType, intent } });
}
