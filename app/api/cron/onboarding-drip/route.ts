import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, emailPreferences } from '@/lib/db/schema';
import { sendSmtpEmail } from '@/lib/email/smtp';
import { wrapEmail, BASE_URL } from '@/lib/email/templates';
import { and, gte, lte, eq, isNull } from 'drizzle-orm';

// ── Types ────────────────────────────────────────────────────────────────────

interface DripStageResult {
  sent: number;
  skipped: number;
}

interface DripResponse {
  ok: true;
  day1: DripStageResult;
  day3: DripStageResult;
  day7: DripStageResult;
}

interface UserRow {
  id: number;
  email: string;
  name: string;
}

interface PrefRow {
  userId: number | null;
  unsubscribeToken: string | null;
  productUpdatesSubscribed: boolean;
}

// ── Email builders ────────────────────────────────────────────────────────────

const CTA_STYLE =
  'display:inline-block;background:#E11D48;color:#ffffff;padding:14px 32px;border-radius:9999px;text-decoration:none;font-weight:700;font-size:15px;';

function buildDay1Email(name: string, unsubscribeUrl: string): { subject: string; html: string } {
  const subject = 'DK Agency — Sənin AI məsləhətçin hazırdır';
  const html = wrapEmail(
    `
    <p style="color:#1F2937;font-size:15px;line-height:1.7;margin:0 0 16px;">Salam ${name},</p>
    <p style="color:#1F2937;font-size:15px;line-height:1.7;margin:0 0 20px;">
      KAZAN AI sektorun ilk AI məsləhətçisidir. Food cost, menyu, AQTA — nə soruşsan cavab var.
    </p>
    <p style="margin:24px 0;">
      <a href="${BASE_URL}/kazan" style="${CTA_STYLE}">KAZAN AI ilə danış →</a>
    </p>
    `,
    { unsubscribeUrl },
  );
  return { subject, html };
}

function buildDay3Email(name: string, unsubscribeUrl: string): { subject: string; html: string } {
  const subject = 'DK Agency — Toolkit-dəki 9 alətlə tanış ol';
  const html = wrapEmail(
    `
    <p style="color:#1F2937;font-size:15px;line-height:1.7;margin:0 0 16px;">Salam ${name},</p>
    <p style="color:#1F2937;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Food Cost kalkulyatoru, PnL simulyatoru, Menyu Matrisi və daha 6 alət. Hamısı pulsuz.
    </p>
    <p style="margin:24px 0;">
      <a href="${BASE_URL}/toolkit" style="${CTA_STYLE}">Toolkit-ə keç →</a>
    </p>
    `,
    { unsubscribeUrl },
  );
  return { subject, html };
}

function buildDay7Email(name: string, unsubscribeUrl: string): { subject: string; html: string } {
  const subject = 'DK Agency — Sahibkar üçün bilik bazası';
  const html = wrapEmail(
    `
    <p style="color:#1F2937;font-size:15px;line-height:1.7;margin:0 0 16px;">Salam ${name},</p>
    <p style="color:#1F2937;font-size:15px;line-height:1.7;margin:0 0 20px;">
      28+ ekspert yazı: food cost-dan franchise-a, AQTA-dan marka qeydiyyatına.
    </p>
    <p style="margin:24px 0;">
      <a href="${BASE_URL}/blog" style="${CTA_STYLE}">Bloqa keç →</a>
    </p>
    `,
    { unsubscribeUrl },
  );
  return { subject, html };
}

// ── Query helpers ─────────────────────────────────────────────────────────────

/**
 * Returns users whose createdAt falls within ±12 hours of exactly N days ago,
 * are email-verified, not soft-deleted, and have opted in to product updates.
 * Users with no emailPreferences row are excluded (opt-in required).
 */
async function fetchUsersForDay(dayOffset: number): Promise<Array<UserRow & { pref: PrefRow }>> {
  if (!db) return [];

  const now = new Date();
  const center = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
  const windowMs = 12 * 60 * 60 * 1000;
  const lower = new Date(center.getTime() - windowMs);
  const upper = new Date(center.getTime() + windowMs);

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      prefUserId: emailPreferences.userId,
      prefUnsubToken: emailPreferences.unsubscribeToken,
      prefProductUpdates: emailPreferences.productUpdatesSubscribed,
    })
    .from(users)
    .innerJoin(emailPreferences, eq(emailPreferences.userId, users.id))
    .where(
      and(
        gte(users.createdAt, lower),
        lte(users.createdAt, upper),
        eq(users.emailVerified, true),
        isNull(users.deletedAt),
        eq(emailPreferences.productUpdatesSubscribed, true),
      ),
    );

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    pref: {
      userId: r.prefUserId,
      unsubscribeToken: r.prefUnsubToken,
      productUpdatesSubscribed: r.prefProductUpdates,
    },
  }));
}

// ── Drip stage runner ─────────────────────────────────────────────────────────

type EmailBuilder = (name: string, unsubUrl: string) => { subject: string; html: string };

async function runDripStage(dayOffset: number, builder: EmailBuilder): Promise<DripStageResult> {
  const eligible = await fetchUsersForDay(dayOffset);
  let sent = 0;
  let skipped = 0;

  const tasks = eligible.map(async (user) => {
    const token = user.pref.unsubscribeToken;
    if (!token) {
      skipped++;
      return;
    }

    const unsubscribeUrl = `${BASE_URL}/api/email/unsubscribe?token=${token}&type=product_updates`;
    const { subject, html } = builder(user.name, unsubscribeUrl);
    const result = await sendSmtpEmail(user.email, subject, html, {
      unsubscribeUrl,
      listId: 'product-updates.dkagency.com.tr',
    });

    if (result.success) {
      sent++;
    } else {
      skipped++;
    }
  });

  await Promise.allSettled(tasks);

  return { sent, skipped };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Auth guard
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!cronSecret || !token || token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // DB guard
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const [day1, day3, day7] = await Promise.all([
    runDripStage(1, buildDay1Email),
    runDripStage(3, buildDay3Email),
    runDripStage(7, buildDay7Email),
  ]);

  const body: DripResponse = { ok: true, day1, day3, day7 };
  return NextResponse.json(body);
}
