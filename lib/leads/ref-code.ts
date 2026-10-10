/**
 * TASK-0529: the WhatsApp redirect (/api/leads/whatsapp) appends «Kod: DK-XXXX» to the pre-filled text.
 * The owner sees the same code in the chat on his phone, so admin lists show it to match the two.
 */
export function extractRefCode(prefillText: string | null | undefined): string | null {
  const match = prefillText?.match(/Kod:\s*(DK-[A-Z0-9]{4})/);
  return match ? match[1] : null;
}

/**
 * TASK-0530: crawlers and link-preview fetchers follow the WhatsApp/Telegram links (the float is on every
 * page now) — they must not become «clicks» or ping the owner.
 */
export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return true;
  // Preview fetchers: «TelegramBot», «Discordbot» (→ bot), «WhatsApp/2.x» (starts with it). Real people in the
  // Telegram / WhatsApp in-app browsers send a normal browser UA and are still counted.
  return /^whatsapp\/|bot|crawl|spider|slurp|facebookexternalhit|embedly|curl|wget|python-requests|lighthouse/i.test(ua);
}
