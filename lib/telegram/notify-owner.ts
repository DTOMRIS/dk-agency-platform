/**
 * @file lib/telegram/notify-owner.ts
 * @purpose TASK-0511: one-way business-event messages to the owner's Telegram chat
 *          (new lead, new member, new listing, weekly summary). Reuses the news-approval bot.
 *          Never throws; returns false when Telegram is not configured or the call fails.
 */

import { escapeHtml, telegramApi, telegramConfig } from '@/lib/telegram/news-approval';

export const SITE_URL = 'https://dkagency.com.tr';

export type OwnerButton = { text: string; url?: string; callbackData?: string };

export type OwnerNotification = {
  title: string;
  /** Plain-text lines; values are HTML-escaped here. Empty/nullish lines are dropped. */
  lines: Array<string | null | undefined>;
  url?: string;
  /** Rows of inline buttons. */
  buttons?: OwnerButton[][];
};

/** Digits-only phone for wa.me, or null when it does not look like a phone number. */
export function whatsappLink(phone: string | null | undefined): string | null {
  const digits = (phone ?? '').replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 ? `https://wa.me/${digits}` : null;
}

/** Standard button rows: optional "WhatsApp-da yaz" + "Paneldə aç". */
export function leadButtons(phone: string | null | undefined, panelPath: string): OwnerButton[][] {
  const row: OwnerButton[] = [];
  const wa = whatsappLink(phone);
  if (wa) row.push({ text: '💬 WhatsApp-da yaz', url: wa });
  row.push({ text: '✏️ Paneldə aç', url: `${SITE_URL}${panelPath}` });
  return [row];
}

export async function notifyOwner(notification: OwnerNotification): Promise<boolean> {
  const config = telegramConfig();
  if (!config) return false;

  const body = [
    `<b>${escapeHtml(notification.title)}</b>`,
    ...notification.lines
      .filter((line): line is string => typeof line === 'string' && line.trim() !== '')
      .map((line) => escapeHtml(line.slice(0, 500))),
    notification.url ? escapeHtml(notification.url) : '',
  ]
    .filter((line) => line !== '')
    .join('\n');

  const rows = (notification.buttons ?? [])
    .map((row) =>
      row.map((button) =>
        button.url
          ? { text: button.text, url: button.url }
          : { text: button.text, callback_data: button.callbackData ?? 'noop' }
      )
    )
    .filter((row) => row.length > 0);

  try {
    const res = await telegramApi(config.token, 'sendMessage', {
      chat_id: config.chatId,
      text: body.slice(0, 4000),
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      ...(rows.length > 0 ? { reply_markup: { inline_keyboard: rows } } : {}),
    });
    return res.ok;
  } catch {
    return false;
  }
}
