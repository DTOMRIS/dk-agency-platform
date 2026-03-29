import { NextResponse } from 'next/server';
import { findMockUserByEmail, updateMockPassword } from '@/lib/auth/mock-state';
import { getServerMemberSession } from '@/lib/members/server-session';

export async function POST(request: Request) {
  const session = await getServerMemberSession();
  if (!session.loggedIn) {
    return NextResponse.json({ success: false, error: 'Giriş tələb olunur.' }, { status: 401 });
  }

  const body = await request.json();
  const currentPassword = String(body?.currentPassword || '');
  const newPassword = String(body?.newPassword || '');

  const user = findMockUserByEmail(session.email);

  if (!user || user.password !== currentPassword) {
    return NextResponse.json({ success: false, error: 'Mövcud şifrə yanlışdır.' }, { status: 400 });
  }

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ success: false, error: 'Yeni şifrə minimum 8 simvol olmalıdır.' }, { status: 400 });
  }

  updateMockPassword(user.id, newPassword);
  console.log('Password changed for user:', user.email);

  return NextResponse.json({ success: true, message: 'Şifrəniz dəyişdirildi.' });
}
