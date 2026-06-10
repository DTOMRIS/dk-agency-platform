import { NextRequest, NextResponse } from 'next/server';
import { bulkUpdateBlogStatus, type BulkBlogAction } from '@/lib/db/blog-repository';
import { getServerMemberSession } from '@/lib/members/server-session';

const VALID_ACTIONS: BulkBlogAction[] = ['archive', 'publish', 'draft', 'delete'];

export async function POST(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Admin girişi tələb olunur.' },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Yanlış JSON formatı.' }, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !Array.isArray((body as Record<string, unknown>).ids) ||
    typeof (body as Record<string, unknown>).action !== 'string'
  ) {
    return NextResponse.json(
      { success: false, error: '{ ids: number[], action: string } tələb olunur.' },
      { status: 400 }
    );
  }

  const { ids, action } = body as { ids: unknown[]; action: string };

  if (!VALID_ACTIONS.includes(action as BulkBlogAction)) {
    return NextResponse.json(
      { success: false, error: `Yanlış action. Mövcud: ${VALID_ACTIONS.join(', ')}` },
      { status: 400 }
    );
  }

  const numericIds = ids.filter((id): id is number => typeof id === 'number' && Number.isInteger(id));
  if (numericIds.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Ən azı 1 rəqəm ID tələb olunur.' },
      { status: 400 }
    );
  }

  const affected = await bulkUpdateBlogStatus(numericIds, action as BulkBlogAction);

  return NextResponse.json({ success: true, affected });
}
