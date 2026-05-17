import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail, emailTemplates } from '@/lib/email/templates';
import { getBaseUrl } from '@/lib/utils/get-base-url';
import { writeAuditLog } from '@/lib/audit';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthFromCookie();
  if (!auth) {
    return NextResponse.json({ error: 'not-authenticated' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!db) {
    return NextResponse.json({ error: 'database-unavailable' }, { status: 503 });
  }

  const { id: rawId } = await params;
  const targetId = parseInt(rawId, 10);
  if (isNaN(targetId)) {
    return NextResponse.json({ error: 'invalid-id' }, { status: 400 });
  }

  // Find user in users table (auth system — tokens reference users.id)
  const user = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, targetId))
    .then((rows) => rows[0]);

  if (!user) {
    return NextResponse.json({ error: 'user-not-found' }, { status: 404 });
  }

  // Create reset token (1 hour — same as forgot-password)
  const token = crypto.randomUUID();
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  // Send admin-initiated password reset email
  const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;
  try {
    await sendEmail(
      user.email,
      emailTemplates.adminPasswordReset(resetUrl, user.name, 'az'),
    );
  } catch (emailErr) {
    console.error('[admin/members/reset-password] Email send failed:', emailErr);
    return NextResponse.json({ error: 'email-send-failed' }, { status: 500 });
  }

  // Audit log — NEVER log token/hash in metadata
  writeAuditLog({
    adminId: auth.userId,
    adminEmail: auth.email,
    action: 'member.password_reset',
    targetUserId: user.id,
    targetEmail: user.email,
    metadata: { initiatedBy: 'admin' },
  });

  return NextResponse.json({ success: true });
}
