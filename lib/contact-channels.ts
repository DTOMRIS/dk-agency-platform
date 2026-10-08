// Single source of truth for contact-channel destinations.
// Imported by the wa.me redirect route (app/api/leads/whatsapp) and the contact
// funnel (components/contact/ContactFunnel) so the number/handle live in one
// place and click tracking can record the real destination.
export const WHATSAPP_NUMBER = '994502566279';
// Owner's public channel «DkAgency Sektör Nabzı» (2026-10-08). The old handle 'dkagency'
// belongs to an unrelated channel — never link it.
export const TELEGRAM_HANDLE = 'dkagenc';
export const TELEGRAM_URL = `https://t.me/${TELEGRAM_HANDLE}`;
