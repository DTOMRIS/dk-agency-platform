# TASK-0102 - Contact Funnel

- Scope: Replace the visible contact phone card with a 3-channel lead funnel.
- Channels: KAZAN AI primary, WhatsApp, Telegram.
- Tracking endpoint: `POST /api/leads/track`.
- WhatsApp endpoint: `/api/leads/whatsapp` redirects to the external prefilled chat without rendering the phone on the contact page.
- Lead table: `leads` with `source`, `channel`, `locale`, `user_agent`, `ip_hash`, `created_at`.
- Source value: `contact_page`.
- Telegram placeholder: `https://t.me/dkagency`.
- KAZAN AI event: `kazan:open` with `context: contact_page`.
- Env note: `IP_HASH_SALT` must be set in Hostinger before deploy.
- Verification target: `e2e/contact-funnel.spec.ts` covers 4 locales and WhatsApp tracking payload.
