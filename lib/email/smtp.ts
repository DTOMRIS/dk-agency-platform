import nodemailer from 'nodemailer';

import { htmlToPlainText } from './content';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || `DK Agency <${SMTP_USER}>`;

function getTransporter() {
  if (!SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });
}

export interface SmtpSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface SmtpSendOptions {
  attachments?: EmailAttachment[];
  text?: string;
  replyTo?: string;
  unsubscribeUrl?: string;
  listId?: string;
}

export async function sendSmtpEmail(
  to: string,
  subject: string,
  html: string,
  attachmentsOrOptions?: EmailAttachment[] | SmtpSendOptions,
): Promise<SmtpSendResult> {
  const transport = getTransporter();
  if (!transport) {
    return {
      success: false,
      error: 'SMTP credentials are not configured',
    };
  }

  const options = Array.isArray(attachmentsOrOptions)
    ? { attachments: attachmentsOrOptions }
    : attachmentsOrOptions || {};

  const headers: Record<string, string> = {};
  if (options.unsubscribeUrl) {
    headers['List-Unsubscribe'] = `<${options.unsubscribeUrl}>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }
  if (options.listId) headers['List-ID'] = options.listId;

  try {
    const info = await transport.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
      text: options.text || htmlToPlainText(html),
      replyTo: options.replyTo || SMTP_USER,
      headers,
      attachments: options.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown SMTP error';
    console.error('[smtp] Send failed:', message);
    return { success: false, error: message };
  }
}
