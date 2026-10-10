/**
 * TASK-0529: the WhatsApp redirect (/api/leads/whatsapp) appends «Kod: DK-XXXX» to the pre-filled text.
 * The owner sees the same code in the chat on his phone, so admin lists show it to match the two.
 */
export function extractRefCode(prefillText: string | null | undefined): string | null {
  const match = prefillText?.match(/Kod:\s*(DK-[A-Z0-9]{4})/);
  return match ? match[1] : null;
}
