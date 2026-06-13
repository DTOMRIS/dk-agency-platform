import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerMemberSession } from '@/lib/members/server-session';
import { AD_FORMATS, AD_PLACEMENTS, createAd, listAds } from '@/lib/repositories/adsRepository';

async function requireAdmin() {
  const session = await getServerMemberSession();
  return session.loggedIn && session.plan === 'admin';
}

const AdSchema = z.object({
  title: z.string().min(1).max(150),
  format: z.enum(AD_FORMATS),
  mediaUrl: z.string().url().max(2000),
  targetUrl: z.string().url().max(2000),
  placement: z.enum(AD_PLACEMENTS),
  altText: z.string().max(200).optional().nullable(),
  advertiser: z.string().max(150).optional().nullable(),
  isActive: z.boolean().optional(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
});

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, error: 'Admin girişi tələb olunur.' },
      { status: 403 }
    );
  }
  const items = await listAds();
  return NextResponse.json({ success: true, data: items });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, error: 'Admin girişi tələb olunur.' },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'JSON formatı yanlış.' }, { status: 400 });
  }

  const parsed = AdSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.issues[0]?.message || 'Yanlış məlumat.',
        details: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const row = await createAd(parsed.data);
  return NextResponse.json({ success: true, data: row }, { status: 201 });
}
