// Single source of truth for contact-channel destinations.
// Imported by the wa.me redirect route (app/api/leads/whatsapp) and the contact
// funnel (components/contact/ContactFunnel) so the number/handle live in one
// place and click tracking can record the real destination.
export const WHATSAPP_NUMBER = '994502566279';
export const TELEGRAM_HANDLE = 'dkagency';
export const TELEGRAM_URL = `https://t.me/${TELEGRAM_HANDLE}`;
