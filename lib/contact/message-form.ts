/**
 * @file lib/contact/message-form.ts
 * @purpose TASK-0558 (owner 2026-11-08: «hep yazıyorsun ama mesaj bana gelmiyor — ya telegram ya mail olsun
 *          ama mesaj gelsin»): a WhatsApp button only opens WhatsApp on the visitor's phone and most never
 *          press Send, so the owner got «button pressed» pings but no messages. Every WhatsApp contact on the
 *          public site now opens the site message form first (MessageFormModal); its text reaches the owner's
 *          Telegram + e-mail + the KAZAN leads panel directly. WhatsApp stays one click away inside the form.
 */

export const MESSAGE_FORM_EVENT = 'dk:message-form';

/** Anchors with this attribute go straight to WhatsApp (the link inside the form itself). */
export const MESSAGE_FORM_SKIP_ATTR = 'data-message-form-skip';

export type MessageFormRequest = {
  /** The counting WhatsApp redirect (`/api/leads/whatsapp?text=…`) — offered as the alternative. */
  whatsappHref: string;
};

/** True for our own WhatsApp redirect (not a listing owner's wa.me link). */
export function isSiteWhatsappHref(href: string | null | undefined): href is string {
  return typeof href === 'string' && href.startsWith('/api/leads/whatsapp');
}

/** The pre-filled text carried by a `/api/leads/whatsapp?text=…` link, or ''. */
export function prefillFromWhatsappHref(href: string): string {
  try {
    return new URL(href, 'https://dkagency.com.tr').searchParams.get('text') ?? '';
  } catch {
    return '';
  }
}

/**
 * Opens the message form for a WhatsApp contact; where the form is not mounted (dashboard / member panel)
 * the event is not handled and WhatsApp opens as before.
 */
export function openContact(whatsappHref: string): void {
  const event = new CustomEvent<MessageFormRequest>(MESSAGE_FORM_EVENT, {
    detail: { whatsappHref },
    cancelable: true,
  });
  const handled = !window.dispatchEvent(event);
  if (!handled) window.open(whatsappHref, '_blank', 'noopener,noreferrer');
}
