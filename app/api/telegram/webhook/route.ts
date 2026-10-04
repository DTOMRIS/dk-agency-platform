/**
 * Telegram webhook — news approval buttons (TASK-0477).
 *
 * Security: (1) Telegram must send the secret derived from the bot token in
 * `X-Telegram-Bot-Api-Secret-Token`; (2) the button press must come from TELEGRAM_CHAT_ID;
 * (3) an article can be decided only once. Anything else is ignored with 200 so Telegram
 * does not retry.
 */

import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { approveNewsArticle, rejectNewsArticle } from '@/lib/news/approve';
import {
  NEWS_CALLBACK,
  telegramApi,
  telegramConfig,
  webhookSecret,
} from '@/lib/telegram/news-approval';

type CallbackQuery = {
  id: string;
  data?: string;
  message?: { message_id: number; chat: { id: number | string } };
};

const SITE_URL = 'https://dkagency.com.tr';

function sameSecret(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  const config = telegramConfig();
  if (!config)
    return NextResponse.json({ ok: false, error: 'Telegram not configured' }, { status: 501 });

  const header = request.headers.get('x-telegram-bot-api-secret-token') || '';
  if (!sameSecret(header, webhookSecret(config.token))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = (await request.json().catch(() => null)) as {
    callback_query?: CallbackQuery;
  } | null;
  const query = update?.callback_query;
  if (!query?.data || !query.message) return NextResponse.json({ ok: true });

  const answer = (text: string) =>
    telegramApi(config.token, 'answerCallbackQuery', {
      callback_query_id: query.id,
      text,
      show_alert: false,
    }).catch(() => undefined);

  if (String(query.message.chat.id) !== String(config.chatId)) {
    await answer('İcazə yoxdur');
    return NextResponse.json({ ok: true });
  }

  const isApprove = query.data.startsWith(NEWS_CALLBACK.approve);
  const isReject = query.data.startsWith(NEWS_CALLBACK.reject);
  const articleId = Number(query.data.split(':').pop());
  if ((!isApprove && !isReject) || !Number.isInteger(articleId) || articleId <= 0) {
    await answer('Naməlum əmr');
    return NextResponse.json({ ok: true });
  }

  const outcome = isApprove
    ? await approveNewsArticle(articleId)
    : await rejectNewsArticle(articleId);

  let status: string;
  let buttons: Array<Array<{ text: string; url: string }>> = [];
  if (outcome.ok) {
    if (isApprove) {
      const url = outcome.slug ? `${SITE_URL}/haberler/${outcome.slug}` : `${SITE_URL}/haberler`;
      status = '✅ Yayınlandı — RU/EN/TR tərcümə arxa planda gedir';
      buttons = [[{ text: '🔗 Saytda bax', url }]];
    } else {
      status = '❌ Rədd edildi';
    }
  } else if (outcome.reason === 'already_decided') {
    status = outcome.status === 'approved' ? 'ℹ️ Artıq yayınlanıb' : 'ℹ️ Artıq rədd edilib';
  } else if (outcome.reason === 'no_az_content') {
    status = '⚠️ AZ mətni yoxdur — paneldə redaktə edin';
    buttons = [[{ text: '✏️ Paneldə aç', url: `${SITE_URL}/dashboard/xeberler/${articleId}` }]];
  } else {
    status = '⚠️ Xəbər tapılmadı';
  }

  await answer(status);
  // Replace the buttons so the same message cannot be decided twice, and log the decision under it.
  await telegramApi(config.token, 'editMessageReplyMarkup', {
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    reply_markup: { inline_keyboard: buttons },
  }).catch(() => undefined);
  await telegramApi(config.token, 'sendMessage', {
    chat_id: query.message.chat.id,
    text: `${status} (#${articleId})`,
    reply_parameters: { message_id: query.message.message_id },
  }).catch(() => undefined);

  return NextResponse.json({ ok: true });
}
