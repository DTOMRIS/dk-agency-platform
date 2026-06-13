import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerMemberSession } from '@/lib/members/server-session';
import {
  AD_FORMATS,
  AD_PLACEMENTS,
  deleteAd,
  getAdById,
  updateAd,
} from '@/lib/repositories/adsRepository';

async function requireAdmin() {
  const session = await getServerMemberSession();
  return session.loggedIn && session.plan === 'admin';
}

const AdPatchSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  format: z.enum(AD_FORMATS).optional(),
  mediaUrl: z.string().url().max(2000).optional(),
  targetUrl: z.string().url().max(2000).optional(),
  placement: z.enum(AD_PLACEMENTS).optional(),
  altText: z.string().max(200).optional().nullable(),
  advertiser: z.string().max(150).optional().nullable(),
  isActive: z.boolean().optional(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, error: 'Admin girişi tələb olunur.' },
      { status: 403 }
    );
  }

  const { id } = await params;
  const adId = Number(id);
  if (!(await getAdById(adId))) {
    return NextResponse.json({ success: false, error: 'Reklam tapılmadı.' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'JSON formatı yanlış.' }, { status: 400 });
  }

  const parsed = AdPatchSchema.safeParse(body);
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

  const result = await updateAd(adId, parsed.data);
  return NextResponse.json({ success: true, source: result.source });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, error: 'Admin girişi tələb olunur.' },
      { status: 403 }
    );
  }

  const { id } = await params;
  const adId = Number(id);
  if (!(await getAdById(adId))) {
    return NextResponse.json({ success: false, error: 'Reklam tapılmadı.' }, { status: 404 });
  }

  const result = await deleteAd(adId);
  return NextResponse.json({ success: true, source: result.source });
}
