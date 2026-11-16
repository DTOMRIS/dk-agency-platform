export function normalizeContactPhone(value: string): string | null {
  if (!/^[+\d\s().-]+$/.test(value.trim())) return null;
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  // Azerbaijan's local mobile notation; other international numbers keep their country code.
  if (/^0[1-9]\d{8}$/.test(digits)) digits = `994${digits.slice(1)}`;
  return /^[1-9]\d{6,14}$/.test(digits) ? `+${digits}` : null;
}

export function captureContext(value: unknown): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is { role: 'user' | 'assistant'; content: string } => !!x && typeof x === 'object'
    && (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string')
    .slice(-2).map(x => ({ role: x.role, content: x.content.trim().slice(0, 2000) })).filter(x => x.content);
}

export function isAnonymousClick(type: string): boolean {
  return type === 'whatsapp_click' || type === 'channel_click';
}

/** Preview budget includes HTML expansion performed by notifyOwner; never cut an HTML entity. */
export function contactNotificationPreview(lines: Array<string | null>): string[] {
  let remaining = 3700; // Reserve title, formatting and truncation marker within Telegram's limit.
  const result: string[] = [];
  for (const line of lines) {
    if (!line?.trim()) continue;
    let preview = '';
    for (const char of line.slice(0, 500)) {
      const cost = char === '&' ? 5 : char === '<' || char === '>' ? 4 : char.length;
      if (remaining < cost + 2) { result.push(`${preview}…`); return result; }
      remaining -= cost;
      preview += char;
    }
    result.push(preview);
    remaining -= 1;
  }
  return result;
}
