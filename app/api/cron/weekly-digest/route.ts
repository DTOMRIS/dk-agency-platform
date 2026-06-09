import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogPosts, emailPreferences } from '@/lib/db/schema';
import { sendSmtpEmail } from '@/lib/email/smtp';
import { wrapEmail, BASE_URL } from '@/lib/email/templates';
import { desc, eq, gte, and } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DigestPost {
  slug: string;
  title: string;
  summary: string | null;
  readTime: number | null;
}

interface DigestSubscriber {
  email: string;
  unsubscribeToken: string | null;
}

interface DigestResult {
  ok: boolean;
  sent: number;
  failed: number;
  posts: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SUBJECT = 'DK Agency \u2014 H\u0259ft\u0259lik B\u00FClt\u0259n';

const ctaStyle =
  'display:inline-block;background:#E11D48;color:#ffffff;padding:14px 32px;border-radius:9999px;text-decoration:none;font-weight:700;font-size:15px;';

function buildPostRow(post: DigestPost): string {
  const postUrl = `${BASE_URL}/blog/${post.slug}`;
  const readLabel = post.readTime != null ? `${post.readTime} d\u0259q oxu` : '';
  const summaryHtml =
    post.summary != null && post.summary.length > 0
      ? `<p style="margin:4px 0 0;color:#64748b;font-size:14px;line-height:1.6;">${post.summary}</p>`
      : '';
  const readTimeHtml =
    readLabel.length > 0
      ? `<p style="margin:4px 0 0;color:#94a3b8;font-size:12px;">${readLabel}</p>`
      : '';

  return `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #F1F5F9;">
        <a href="${postUrl}"
           style="color:#1A1A2E;font-size:16px;font-weight:600;text-decoration:none;line-height:1.4;">
          ${post.title}
        </a>
        ${summaryHtml}
        ${readTimeHtml}
      </td>
    </tr>`;
}

function buildEmailBody(posts: DigestPost[]): string {
  const blogUrl = `${BASE_URL}/blog`;

  const postsSection =
    posts.length > 0
      ? `<h2 style="font-family:'Playfair Display',Georgia,serif;color:#1A1A2E;font-size:20px;margin:0 0 16px;">
           Bu H\u0259ft\u0259nin Se\u00E7m\u0259l\u0259ri
         </h2>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
           ${posts.map(buildPostRow).join('')}
         </table>`
      : `<p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 28px;">
           Bu h\u0259ft\u0259 yeni yaz\u0131 yoxdur, amma \u0259n \u00E7ox oxunanlar\u0131 yoxla.
         </p>`;

  return `${postsSection}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:0 0 8px;">
          <a href="${blogUrl}" style="${ctaStyle}">B\u00FCt\u00FCn Bloglar \u2192</a>
        </td>
      </tr>
    </table>`;
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse<DigestResult | { error: string }>> {
  // ── 1. CRON_SECRET guard ───────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron xidm\u0259ti konfiqurasiya edilm\u0259yib.' }, { status: 503 });
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Icaz\u0259siz.' }, { status: 401 });
  }

  // ── 2. DB guard ────────────────────────────────────────────────────────
  if (!db) {
    return NextResponse.json({ error: 'Verilənlər bazası əlçatmazdır.' }, { status: 503 });
  }

  // ── 3. Fetch last 7 days of published posts ────────────────────────────
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentPosts = await db
    .select({
      slug: blogPosts.slug,
      title: blogPosts.title_az,
      summary: blogPosts.summary_az,
      readTime: blogPosts.readTime,
    })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.status, 'published'),
        gte(blogPosts.publishedAt, sevenDaysAgo),
      ),
    )
    .orderBy(desc(blogPosts.publishedAt))
    .limit(5);

  // ── 4. Fetch newsletter subscribers ───────────────────────────────────
  const subscribers = await db
    .select({
      email: emailPreferences.email,
      unsubscribeToken: emailPreferences.unsubscribeToken,
    })
    .from(emailPreferences)
    .where(eq(emailPreferences.newsletterSubscribed, true));

  if (subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0, posts: recentPosts.length });
  }

  // ── 5. Build email content ─────────────────────────────────────────────
  const bodyContent = buildEmailBody(recentPosts);

  // ── 6. Send in parallel, do not abort on single failure ───────────────
  const results = await Promise.allSettled(
    subscribers.map((pref: DigestSubscriber) => {
      const unsubscribeUrl = pref.unsubscribeToken != null
        ? `${BASE_URL}/api/email/unsubscribe?token=${pref.unsubscribeToken}&type=newsletter`
        : undefined;

      const html = wrapEmail(bodyContent, { unsubscribeUrl });
      return sendSmtpEmail(pref.email, SUBJECT, html, {
        unsubscribeUrl,
        listId: 'newsletter.dkagency.com.tr',
      });
    }),
  );

  // ── 7. Tally outcomes ─────────────────────────────────────────────────
  let sent = 0;
  let failed = 0;

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.success) {
      sent += 1;
    } else {
      failed += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    failed,
    posts: recentPosts.length,
  });
}
