/**
 * @file lib/email/client.ts
 * @description Resend email SDK wrapper — graceful degradation when not configured
 */

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'DK Agency <onboarding@resend.dev>';

export const isConfigured = Boolean(resendApiKey);

// Singleton client (null if not configured)
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  if (!resend || !resendApiKey) {
    // Graceful degradation - log instead of failing
    console.warn(
      '[Resend] RESEND_API_KEY not configured. Email not sent (would have gone to: ' + to + ')',
    );
    console.log('[Resend] Subject:', subject);
    console.log('[Resend] HTML preview:', html.substring(0, 200) + '...');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const response = await resend.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    if (response.error) {
      console.error('[Resend] Send error:', response.error);
      return { success: false, error: response.error.message };
    }

    console.log('[Resend] Email sent successfully. ID:', response.data?.id);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[Resend] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
