/**
 * @file lib/telegram/news-approval.ts
 * @purpose Telegram approval for news (TASK-0477): every synthesized article is sent to the
 *          owner's chat with ✅ / ❌ buttons; the webhook (/api/telegram/webhook) publishes or rejects.
 *
 * Env (server and GitHub Actions): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
 * The webhook secret is derived from the bot token, so no extra secret has to be managed.
 */

import { createHash } from 'node:crypto';

const SITE_URL = 'https://dkagency.com.tr';

export const NEWS_CALLBACK = { approve: 'news:approve:', reject: 'news:reject:' } as const;

export function telegramConfig(): { token: string; chatId: string } | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  return token && chatId ? { token, chatId } : null;
}

/** Secret Telegram echoes back in `X-Telegram-Bot-Api-Secret-Token` (allowed chars: A-Z a-z 0-9 _ -). */
export function webhookSecret(token: string): string {
  return createHash('sha256').update(`dk-news-webhook:${token}`).digest('hex').slice(0, 48);
}

export async function telegramApi<T = unknown>(
  token: string,
  method: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; result?: T; description?: string }> {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  return (await res.json().catch(() => ({ ok: false, description: `HTTP ${res.status}` }))) as {
    ok: boolean;
    result?: T;
    description?: string;
  };
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function hostOf(url: string | null | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export type ApprovalCandidate = {
  id: number;
  titleAz: string;
  summaryAz?: string | null;
  contentAz?: string | null;
  externalUrl?: string | null;
  category?: string | null;
};

/** Plain-text preview of the AZ analysis (markdown headings/bold stripped), max ~700 chars. */
function preview(candidate: ApprovalCandidate): string {
  const source = candidate.contentAz || candidate.summaryAz || '';
  const plain = source
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\n{2,}/g, '\n')
    .trim();
  return plain.length > 700 ? `${plain.slice(0, 700).trimEnd()}…` : plain;
}

/** Send one article to the owner's chat with publish / reject buttons. Never throws. */
export async function sendNewsForApproval(candidate: ApprovalCandidate): Promise<boolean> {
  const config = telegramConfig();
  if (!config) return false;

  const host = hostOf(candidate.externalUrl);
  const lines = [
    `📰 <b>${escapeHtml(candidate.titleAz)}</b>`,
    candidate.category ? `<i>${escapeHtml(candidate.category)}</i>` : '',
    '',
    escapeHtml(preview(candidate)),
    '',
    host && candidate.externalUrl
      ? `Mənbə: <a href="${escapeHtml(candidate.externalUrl)}">${escapeHtml(host)}</a>`
      : '',
    `#${candidate.id}`,
  ].filter((line, i, all) => line !== '' || (all[i - 1] ?? '') !== '');

  try {
    const res = await telegramApi(config.token, 'sendMessage', {
      chat_id: config.chatId,
      text: lines.join('\n').slice(0, 4000),
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Yayınla', callback_data: `${NEWS_CALLBACK.approve}${candidate.id}` },
            { text: '❌ Rədd et', callback_data: `${NEWS_CALLBACK.reject}${candidate.id}` },
          ],
          [{ text: '✏️ Paneldə aç', url: `${SITE_URL}/dashboard/xeberler/${candidate.id}` }],
        ],
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}
