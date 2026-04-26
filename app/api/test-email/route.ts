import { NextRequest, NextResponse } from 'next/server';
import { getServerMemberSession } from '@/lib/members/server-session';
import { sendSmtpEmail } from '@/lib/email/smtp';

export async function POST(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin girişi tələb olunur.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const to = body?.to || process.env.ADMIN_EMAIL || 'info@dkagency.az';

  const result = await sendSmtpEmail(
    to,
    'DK Agency — Test Email',
    `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1A1A2E; padding: 24px; text-align: center;">
          <div style="color: #C5A022; font-size: 24px; font-weight: 800;">DK Agency</div>
        </div>
        <div style="background: #ffffff; padding: 32px;">
          <h2 style="color: #1A1A2E;">SMTP Test</h2>
          <p>Bu test emaili Hostinger SMTP vasitəsilə göndərildi.</p>
          <p style="color: #64748b; font-size: 14px;">
            Vaxt: ${new Date().toISOString()}<br/>
            Alıcı: ${to}
          </p>
        </div>
        <div style="padding: 16px 24px; color: #64748b; font-size: 12px; text-align: center;">
          &copy; 2026 DK Agency
        </div>
      </div>
    `,
  );

  return NextResponse.json({
    success: result.success,
    messageId: result.messageId,
    error: result.error,
    to,
  });
}
