import { NextRequest, NextResponse } from 'next/server';
import { getServerMemberSession } from '@/lib/members/server-session';
import { updateNewsSource } from '@/lib/repositories/newsRepository';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin girisi teleb olunur.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const result = await updateNewsSource(Number(id), { isActive: body.isActive });
  return NextResponse.json({ success: true, source: result.source });
}
