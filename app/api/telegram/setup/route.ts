/**
 * One-time Telegram setup for news approval (TASK-0477). Admin only.
 *
 * GET /api/telegram/setup            → registers the webhook (secret derived from the bot token)
 *                                       and returns Telegram's webhook info.
 * GET /api/telegram/setup?pending=10 → also sends up to N synthesized, not-yet-decided articles
 *                                       to the owner's chat for approval.
 *
 * The bot token never leaves the server; the owner just opens this URL while logged in as admin.
 */

import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { newsArticles } from '@/lib/db/schema';
import { canAccessNewsAdmin } from '@/lib/news/admin-access';
import {
  sendNewsForApproval,
  telegramApi,
  telegramConfig,
  webhookSecret,
} from '@/lib/telegram/news-approval';

const WEBHOOK_URL = 'https://dkagency.com.tr/api/telegram/webhook';

/** TASK-0500: the dashboard button calls this with POST; the URL still works with GET. */
export async function POST(request: NextRequest) {
  return GET(request);
}

export async function GET(request: NextRequest) {
  const auth = await canAccessNewsAdmin(request);
  if (!auth.allowed) {
    return NextResponse.json({ ok: false, error: 'Admin girişi tələb olunur.' }, { status: 403 });
  }

  const config = telegramConfig();
  if (!config) {
    return NextResponse.json(
      { ok: false, error: 'TELEGRAM_BOT_TOKEN və ya TELEGRAM_CHAT_ID serverdə təyin olunmayıb.' },
      { status: 501 }
    );
  }

  // TASK-0500: idempotent + 429-safe. Browsers pre-load a URL typed in the address bar, so this
  // route was often hit twice within a second and Telegram answered the second setWebhook with
  // "Too Many Requests: retry after 1" — the owner saw a failure even when the first call worked.
  type WebhookInfo = {
    url?: string;
    pending_update_count?: number;
    last_error_message?: string;
    allowed_updates?: string[];
  };
  const wanted = ['callback_query', 'message'];
  const before = await telegramApi<WebhookInfo>(config.token, 'getWebhookInfo', {});
  const alreadySet =
    before.ok &&
    before.result?.url === WEBHOOK_URL &&
    wanted.every((u) => (before.result?.allowed_updates ?? []).includes(u));

  let setWebhook: { ok: boolean; description?: string } = { ok: true, description: 'already set' };
  if (!alreadySet) {
    const payload = {
      url: WEBHOOK_URL,
      secret_token: webhookSecret(config.token),
      // TASK-0497: 'message' = owner forwards WhatsApp listings to the bot (lib/telegram/listing-import.ts).
      allowed_updates: wanted,
      drop_pending_updates: true,
    };
    setWebhook = await telegramApi(config.token, 'setWebhook', payload);
    const retryAfter = Number(/retry after (\d+)/i.exec(setWebhook.description ?? '')?.[1] ?? 0);
    if (!setWebhook.ok && retryAfter > 0 && retryAfter <= 5) {
      await new Promise((resolve) => setTimeout(resolve, (retryAfter + 0.5) * 1000));
      setWebhook = await telegramApi(config.token, 'setWebhook', payload);
    }
  }
  const info = await telegramApi<WebhookInfo>(config.token, 'getWebhookInfo', {});

  const pendingLimit = Math.min(Number(request.nextUrl.searchParams.get('pending') || 0) || 0, 20);
  let sent = 0;
  if (pendingLimit > 0 && dbAvailable && db) {
    const rows = await db
      .select({
        id: newsArticles.id,
        titleAz: newsArticles.titleAz,
        summaryAz: newsArticles.summaryAz,
        contentAz: newsArticles.contentAz,
        externalUrl: newsArticles.externalUrl,
        category: newsArticles.category,
      })
      .from(newsArticles)
      .where(and(eq(newsArticles.status, 'translated'), isNotNull(newsArticles.contentAz)))
      .orderBy(desc(newsArticles.id))
      .limit(pendingLimit);
    for (const row of rows) {
      if (row.titleAz && (await sendNewsForApproval({ ...row, titleAz: row.titleAz }))) sent++;
    }
  }

  return NextResponse.json({
    ok: setWebhook.ok,
    setWebhook: setWebhook.description ?? 'ok',
    webhook: {
      url: info.result?.url,
      allowedUpdates: info.result?.allowed_updates ?? [],
      pending: info.result?.pending_update_count,
      lastError: info.result?.last_error_message,
    },
    pendingSent: sent,
  });
}
