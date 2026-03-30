import { NextResponse } from 'next/server';
import { consumePasswordResetToken, updateMockPassword } from '@/lib/auth/mock-state';

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body?.token || '');
  const newPassword = String(body?.newPassword || '');

  if (!token || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ success: false, error: 'Yeni şifrə minimum 8 simvol olmalıdır.' }, { status: 400 });
  }

  const result = consumePasswordResetToken(token);
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  updateMockPassword(result.userId, newPassword);
  console.log('Password reset completed for user:', result.userId);

  return NextResponse.json({
    success: true,
    message: 'Şifrə yeniləndi. Yeni şifrənizlə daxil ola bilərsiniz.',
  });
}
