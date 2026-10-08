/**
 * Telegram webhook — news approval buttons (TASK-0477) + WhatsApp listing forwards (TASK-0497).
 *
 * Security: (1) Telegram must send the secret derived from the bot token in
 * `X-Telegram-Bot-Api-Secret-Token`; (2) the button press must come from TELEGRAM_CHAT_ID;
 * (3) an article can be decided only once. Anything else is ignored with 200 so Telegram
 * does not retry.
 */

import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse, after } from 'next/server';
import { deepSeekCaller, parseWhatsAppListings } from '@/lib/listings/whatsapp-import';
import { createImportedDrafts } from '@/lib/listings/whatsapp-import-db';
import { approveListingFromTelegram, rejectListingFromTelegram } from '@/lib/listings/set-status';
import { approveNewsArticle, rejectNewsArticle } from '@/lib/news/approve';
import {
  classifyTelegramUpdate,
  handleListingForward,
  type ListingForwardDeps,
  type TelegramMessage,
} from '@/lib/telegram/listing-import';
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

export const maxDuration = 120;

function listingForwardDeps(token: string, message: TelegramMessage): ListingForwardDeps {
  const apiKey = process.env.DEEPSEEK_API_KEY || '';
  return {
    parse: (text) => parseWhatsAppListings(text, deepSeekCaller(apiKey)),
    create: (items) => createImportedDrafts(items, 'telegram'),
    reply: (text) =>
      telegramApi(token, 'sendMessage', {
        chat_id: message.chat.id,
        text,
        link_preview_options: { is_disabled: true },
        reply_parameters: { message_id: message.message_id },
      }).catch(() => undefined),
  };
}

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
    message?: TelegramMessage;
  } | null;

  // TASK-0497: owner forwards/pastes a WhatsApp listing → drafts. Processed after the 200
  // response so Telegram does not retry (and duplicate drafts) while DeepSeek runs.
  if (classifyTelegramUpdate(update, config.chatId) === 'listing' && update?.message) {
    const message = update.message;
    after(() =>
      handleListingForward(message.text ?? message.caption ?? '', listingForwardDeps(config.token, message))
    );
    return NextResponse.json({ ok: true });
  }

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

  // TASK-0511: B2B listing approval buttons.
  const listingMatch = /^listing:(approve|reject):(\d+)$/.exec(query.data);
  if (listingMatch) {
    const listingId = Number(listingMatch[2]);
    const approving = listingMatch[1] === 'approve';
    const result = approving
      ? await approveListingFromTelegram(listingId)
      : await rejectListingFromTelegram(listingId);
    let listingStatus: string;
    let listingButtons: Array<Array<{ text: string; url: string }>> = [];
    if (result.ok) {
      listingStatus = approving ? '✅ Elan təsdiqləndi (vitrində)' : '❌ Elan rədd edildi';
    } else if (result.reason === 'already_decided') {
      listingStatus = 'ℹ️ Elanın statusu artıq bu əməliyyata icazə vermir';
      listingButtons = [[{ text: '✏️ Paneldə aç', url: `${SITE_URL}/dashboard/ilanlar/${listingId}` }]];
    } else {
      listingStatus = '⚠️ Elan tapılmadı';
    }
    await answer(listingStatus);
    await telegramApi(config.token, 'editMessageReplyMarkup', {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      reply_markup: { inline_keyboard: listingButtons },
    }).catch(() => undefined);
    await telegramApi(config.token, 'sendMessage', {
      chat_id: query.message.chat.id,
      text: `${listingStatus} (#${listingId})`,
      reply_parameters: { message_id: query.message.message_id },
    }).catch(() => undefined);
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
