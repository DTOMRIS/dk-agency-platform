/**
 * @file lib/email/send.ts
 * @purpose Mərkəzi email göndərmə funksiyası — Resend üzərindən
 */
import { canSendEmail, EMAIL_FROM, resend } from './client';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!canSendEmail()) return false;

  try {
    await resend!.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
    return true;
  } catch (error: unknown) {
    console.error('[EMAIL] Göndərmə xətası:', error);
    return false;
  }
}
