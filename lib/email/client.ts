/**
 * @file lib/email/client.ts
 * @purpose Resend email client — singleton, null-safe
 */
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Sandbox: onboarding@resend.dev — yalnız öz email-ə göndərə bilir.
// Production: domain verify et → noreply@dkagency.az ilə əvəz et.
export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'DK Agency <onboarding@resend.dev>';

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'info@dkagency.az';

export function canSendEmail(): boolean {
  if (!resend) {
    console.warn('[EMAIL] RESEND_API_KEY yoxdur — email göndərilmədi');
    return false;
  }
  return true;
}
