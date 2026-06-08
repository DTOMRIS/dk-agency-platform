import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, blogPosts, franchiseLeads, leads, kazanLeads } from '@/lib/db/schema';
import { sendSmtpEmail } from '@/lib/email/smtp';
import { wrapEmail, BASE_URL } from '@/lib/email/templates';
import { count, gte, and, eq } from 'drizzle-orm';

// ── Types ─────────────────────────────────────────────────────────────

interface DigestMetrics {
  newUsers: number;
  newBlogPosts: number;
  franchiseLeadsCount: number;
  contactLeadsCount: number;
  kazanLeadsCount: number;
}

// ── Date helpers ──────────────────────────────────────────────────────

function formatAzDate(date: Date): string {
  const AZ_MONTHS = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
    'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
  ];
  return `${date.getDate()} ${AZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// ── Email builder ─────────────────────────────────────────────────────

function buildDigestHtml(metrics: DigestMetrics, rangeStart: Date, rangeEnd: Date): string {
  const ctaStyle =
    'display:inline-block;background:#E11D48;color:#ffffff;padding:14px 32px;border-radius:9999px;text-decoration:none;font-weight:700;font-size:15px;';

  const total =
    metrics.newUsers +
    metrics.newBlogPosts +
    metrics.franchiseLeadsCount +
    metrics.contactLeadsCount +
    metrics.kazanLeadsCount;

  const rows: Array<{ label: string; value: number }> = [
    { label: 'Yeni üzv', value: metrics.newUsers },
    { label: 'Yeni blog yazısı', value: metrics.newBlogPosts },
    { label: 'Franchise lead', value: metrics.franchiseLeadsCount },
    { label: 'Əlaqə kliki (WhatsApp/Telegram)', value: metrics.contactLeadsCount },
    { label: 'KAZAN AI lead', value: metrics.kazanLeadsCount },
  ];

  const tableRows = rows
    .map(
      (r) =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #E5E7EB;color:#374151;font-size:14px;">${r.label}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #E5E7EB;color:#1F2937;font-size:14px;font-weight:600;text-align:right;">${r.value}</td>
        </tr>`,
    )
    .join('');

  const content = `
    <h2 style="font-family:'Playfair Display',Georgia,serif;color:#1A1A2E;font-size:22px;margin:0 0 6px;">
      Həftəlik Platform Hesabatı
    </h2>
    <p style="color:#64748b;font-size:13px;margin:0 0 28px;letter-spacing:0.3px;">
      ${formatAzDate(rangeStart)} — ${formatAzDate(rangeEnd)}
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="border-collapse:collapse;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:28px;">
      <thead>
        <tr style="background:#F8FAFC;">
          <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:12px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;border-bottom:1px solid #E5E7EB;">
            Metrik
          </th>
          <th style="padding:10px 12px;text-align:right;color:#64748b;font-size:12px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;border-bottom:1px solid #E5E7EB;">
            Dəyər
          </th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr style="background:#FFF1F4;">
          <td style="padding:12px;color:#1A1A2E;font-size:14px;font-weight:700;">Cəmi</td>
          <td style="padding:12px;color:#E11D48;font-size:16px;font-weight:700;text-align:right;">${total}</td>
        </tr>
      </tbody>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding-bottom:8px;">
        <a href="${BASE_URL}/dashboard" style="${ctaStyle}">Dashboard-a keç →</a>
      </td></tr>
    </table>
  `;

  return wrapEmail(content);
}

// ── Route handler ─────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Auth: CRON_SECRET bearer token
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('Authorization');

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // DB availability guard
  if (!db) {
    return NextResponse.json({ ok: false, error: 'Database unavailable' }, { status: 503 });
  }

  // Date window: last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Parallel queries
  const [
    usersResult,
    blogResult,
    franchiseResult,
    leadsResult,
    kazanResult,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(users)
      .where(gte(users.createdAt, sevenDaysAgo)),

    db
      .select({ value: count() })
      .from(blogPosts)
      .where(
        and(
          gte(blogPosts.createdAt, sevenDaysAgo),
          eq(blogPosts.status, 'published'),
        ),
      ),

    db
      .select({ value: count() })
      .from(franchiseLeads)
      .where(gte(franchiseLeads.createdAt, sevenDaysAgo)),

    db
      .select({ value: count() })
      .from(leads)
      .where(gte(leads.createdAt, sevenDaysAgo)),

    db
      .select({ value: count() })
      .from(kazanLeads)
      .where(gte(kazanLeads.createdAt, sevenDaysAgo)),
  ]);

  const metrics: DigestMetrics = {
    newUsers: Number(usersResult[0]?.value ?? 0),
    newBlogPosts: Number(blogResult[0]?.value ?? 0),
    franchiseLeadsCount: Number(franchiseResult[0]?.value ?? 0),
    contactLeadsCount: Number(leadsResult[0]?.value ?? 0),
    kazanLeadsCount: Number(kazanResult[0]?.value ?? 0),
  };

  // Build and send email
  const rangeEnd = new Date(now.getTime() - 24 * 60 * 60 * 1000); // yesterday
  const subject = `[DK Admin] Həftəlik KPI — ${formatAzDate(sevenDaysAgo)} – ${formatAzDate(rangeEnd)}`;
  const html = buildDigestHtml(metrics, sevenDaysAgo, rangeEnd);

  const adminEmail = process.env.ADMIN_EMAIL ?? 'info@dkagency.com.tr';
  const result = await sendSmtpEmail(adminEmail, subject, html);

  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: result.error ?? 'Email delivery failed' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, metrics });
}
