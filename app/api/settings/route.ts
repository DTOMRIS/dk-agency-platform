import { NextRequest, NextResponse } from 'next/server';
import { getServerMemberSession } from '@/lib/members/server-session';
import {
  getSiteSettingsRecord,
  updateSiteSettingsRecord,
  type SiteSettingsPayload,
} from '@/lib/repositories/settingsRepository';

export async function GET() {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin girisi teleb olunur.' }, { status: 403 });
  }

  const settings = await getSiteSettingsRecord();
  return NextResponse.json({ success: true, data: settings });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin girisi teleb olunur.' }, { status: 403 });
  }

  const body = (await request.json()) as SiteSettingsPayload;
  const updated = await updateSiteSettingsRecord(body);
  return NextResponse.json({ success: true, data: updated });
}
