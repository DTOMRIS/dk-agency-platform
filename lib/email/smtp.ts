import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || '465');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'DK Agency <info@dkagency.com.tr>';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[smtp] SMTP_USER or SMTP_PASS not set — emails will be logged only');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

export interface SmtpSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendSmtpEmail(
  to: string,
  subject: string,
  html: string,
): Promise<SmtpSendResult> {
  const transport = getTransporter();

  if (!transport) {
    console.log('[smtp] MOCK — To:', to, '| Subject:', subject);
    return { success: true, messageId: 'mock-' + Date.now() };
  }

  try {
    const info = await transport.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });

    console.log('[smtp] Sent:', info.messageId, '→', to);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[smtp] Failed:', message);
    return { success: false, error: message };
  }
}
