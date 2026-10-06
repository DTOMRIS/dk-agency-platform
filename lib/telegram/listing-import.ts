/**
 * @file lib/telegram/listing-import.ts
 * @purpose TASK-0497 layer 2 — the owner forwards (or pastes) WhatsApp listings to the DK bot;
 *          they become draft listings and the bot replies with admin links.
 *
 * Only messages from TELEGRAM_CHAT_ID (the same owner chat the news approval uses) are handled;
 * commands ("/start") and bot messages are ignored. Callback queries (news ✅/❌) never reach
 * this module — see classifyTelegramUpdate().
 *
 * The webhook must subscribe to `message` updates: open /api/telegram/setup once after deploy.
 */

import {
  confirmItemSchema,
  type ConfirmItem,
  type ImportedListing,
  type WhatsAppParseResult,
} from '@/lib/listings/whatsapp-import';
import type { CreatedDraft } from '@/lib/listings/whatsapp-import-db';

export interface TelegramMessage {
  message_id: number;
  chat: { id: number | string };
  from?: { is_bot?: boolean };
  text?: string;
  caption?: string;
}

export interface TelegramUpdate {
  callback_query?: unknown;
  message?: TelegramMessage;
}

export type TelegramUpdateKind = 'callback' | 'listing' | 'ignore';

/** Routing decision for the webhook. A callback query always wins (news approval flow). */
export function classifyTelegramUpdate(
  update: TelegramUpdate | null,
  ownerChatId: string
): TelegramUpdateKind {
  if (!update) return 'ignore';
  if (update.callback_query) return 'callback';
  const message = update.message;
  if (!message || String(message.chat?.id) !== String(ownerChatId)) return 'ignore';
  if (message.from?.is_bot) return 'ignore';
  const text = (message.text ?? message.caption ?? '').trim();
  if (text.length < 15 || text.startsWith('/')) return 'ignore';
  return 'listing';
}

export function toConfirmItem(item: ImportedListing): ConfirmItem | null {
  const parsed = confirmItemSchema.safeParse({
    type: item.type,
    title: item.title,
    description: item.description,
    city: item.city,
    district: item.district,
    price: item.price,
    currency: item.currency,
    typeSpecificData: item.typeSpecificData,
    equipment: item.equipment,
    contactName: item.contactName,
    contactPhone: item.contactPhone,
    contactEmail: item.contactEmail,
  });
  return parsed.success ? parsed.data : null;
}

export interface ListingForwardDeps {
  parse: (text: string) => Promise<WhatsAppParseResult>;
  create: (
    items: ConfirmItem[]
  ) => Promise<{ created: CreatedDraft[]; failed: Array<{ title: string; error: string }> }>;
  reply: (text: string) => Promise<unknown>;
}

/** Builds the owner-facing reply. Plain text (no parse_mode) so titles need no escaping. */
export function buildForwardReply(
  created: CreatedDraft[],
  failedCount: number,
  skippedReasons: string[],
  parseErrors: string[] = []
): string {
  if (!created.length) {
    if (parseErrors.length)
      return '⚠️ AI təhlili alınmadı — bir az sonra yenidən göndərin və ya paneldən əlavə edin.';
    const reason = skippedReasons[0] ? ` (${skippedReasons[0]})` : '';
    return failedCount
      ? `⚠️ Elan tanındı, amma qaralama yaradılmadı (${failedCount} xəta).`
      : `🤷 Mesajda elan tanınmadı${reason}.`;
  }
  const lines = [`📥 ${created.length} qaralama yaradıldı`];
  for (const draft of created)
    lines.push('', `• ${draft.trackingCode} — ${draft.title}`, draft.adminUrl);
  if (failedCount) lines.push('', `⚠️ ${failedCount} elan yaradılmadı.`);
  lines.push('', 'Statusu «Göndərildi» — yayımdan əvvəl paneldə yoxlayın.');
  return lines.join('\n').slice(0, 4000);
}

/** Never throws: errors become a short reply to the owner. */
export async function handleListingForward(
  text: string,
  deps: ListingForwardDeps
): Promise<{ created: number }> {
  try {
    const result = await deps.parse(text);
    const items = result.items
      .map(toConfirmItem)
      .filter((item): item is ConfirmItem => item !== null);
    const { created, failed } = items.length
      ? await deps.create(items)
      : { created: [], failed: [] };
    await deps.reply(
      buildForwardReply(
        created,
        failed.length,
        result.skipped.map((s) => s.reason),
        result.errors
      )
    );
    return { created: created.length };
  } catch {
    await deps.reply('⚠️ Elan idxalı alınmadı — paneldən əlavə edin.').catch(() => undefined);
    return { created: 0 };
  }
}
