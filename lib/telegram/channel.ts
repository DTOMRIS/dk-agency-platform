/**
 * @file lib/telegram/channel.ts
 * @purpose Public Telegram channel «DkAgency Sektör Nabzı» (t.me/dkagenc, owner 2026-10-08):
 *          every news article the owner approves is also posted there. The news bot must be an
 *          admin of the channel with "Post messages". Never throws; returns false on any failure.
 *
 * Env: TELEGRAM_BOT_TOKEN (same bot as approvals), TELEGRAM_CHANNEL_ID (optional, default @dkagenc).
 */

import { escapeHtml, telegramApi } from '@/lib/telegram/news-approval';
import { TELEGRAM_HANDLE } from '@/lib/contact-channels';

const SITE_URL = 'https://dkagency.com.tr';

export type ChannelNews = {
  slug: string;
  title: string;
  summary?: string | null;
  imageUrl?: string | null;
};

function channelId(): string {
  return process.env.TELEGRAM_CHANNEL_ID || `@${TELEGRAM_HANDLE}`;
}

export async function postNewsToChannel(news: ChannelNews): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !news.slug || !news.title) return false;

  const url = `${SITE_URL}/haberler/${encodeURIComponent(news.slug)}`;
  const summary = (news.summary ?? '').trim();
  const head = `<b>${escapeHtml(news.title.trim())}</b>`;
  const tail = `\n\n👉 <a href="${url}">Davamını oxu — DK Agency</a>`;
  const room = (max: number) => Math.max(0, max - head.length - tail.length - 4);
  const body = (max: number) => {
    const s = summary.length > room(max) ? `${summary.slice(0, room(max) - 1).trimEnd()}…` : summary;
    return s ? `${head}\n\n${escapeHtml(s)}${tail}` : `${head}${tail}`;
  };

  try {
    const image = news.imageUrl && /^https?:\/\//.test(news.imageUrl) ? news.imageUrl : null;
    if (image) {
      const res = await telegramApi(token, 'sendPhoto', {
        chat_id: channelId(),
        photo: image,
        caption: body(1000),
        parse_mode: 'HTML',
      });
      if (res.ok) return true;
      // Bad/unreachable image — fall through to a text post.
    }
    const res = await telegramApi(token, 'sendMessage', {
      chat_id: channelId(),
      text: body(3900),
      parse_mode: 'HTML',
    });
    return res.ok;
  } catch {
    return false;
  }
}
