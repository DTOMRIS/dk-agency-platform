import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { canAccessNewsAdmin } from '@/lib/news/admin-access';
import {
  createNewsArticle,
  getAdminNewsArticles,
  getNewsSourcesAdmin,
} from '@/lib/repositories/newsRepository';

export async function GET(request: NextRequest) {
  const auth = await canAccessNewsAdmin(request);
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource');
  const status = searchParams.get('status');

  if (!auth.allowed) {
    return NextResponse.json({ success: false, error: 'Admin girisi teleb olunur.' }, { status: 403 });
  }

  if (resource === 'sources') {
    const sources = await getNewsSourcesAdmin();
    return NextResponse.json({ success: true, data: sources });
  }

  const result = await getAdminNewsArticles({ status });
  return NextResponse.json({ success: true, data: result.items, total: result.total, source: result.source });
}

const NewsCategoryEnum = z.enum(['finance', 'operations', 'growth', 'market', 'technology']);
const NewsStatusEnum = z.enum(['fetched', 'translated', 'approved', 'rejected']);
const NewsTypeEnum = z.enum(['none', 'photo', 'video']);

const CreateNewsSchema = z
  .object({
    slug: z.string().max(255).optional().nullable(),
    titleAz: z.string().max(500).optional().nullable(),
    titleRu: z.string().max(500).optional().nullable(),
    titleEn: z.string().max(500).optional().nullable(),
    titleTr: z.string().max(500).optional().nullable(),
    summaryAz: z.string().optional().nullable(),
    summaryRu: z.string().optional().nullable(),
    summaryEn: z.string().optional().nullable(),
    summaryTr: z.string().optional().nullable(),
    contentAz: z.string().optional().nullable(),
    contentRu: z.string().optional().nullable(),
    contentEn: z.string().optional().nullable(),
    contentTr: z.string().optional().nullable(),
    category: NewsCategoryEnum.optional(),
    author: z.string().max(150).optional().nullable(),
    publishedAt: z.string().optional().nullable(),
    status: NewsStatusEnum.optional(),
    imageUrl: z.string().optional().nullable(),
    seoTitle: z.string().max(70).optional().nullable(),
    seoDescription: z.string().max(160).optional().nullable(),
    isEditorPick: z.boolean().optional(),
    isManset: z.boolean().optional(),
    isTop: z.boolean().optional(),
    isGundem: z.boolean().optional(),
    newsType: NewsTypeEnum.optional().nullable(),
    telegramSend: z.boolean().optional(),
    logoOverlay: z.boolean().optional(),
    externalUrl: z.string().optional().nullable(),
    sourceId: z.number().int().nullable().optional(),
  })
  .refine(
    (data) =>
      Boolean(
        (data.titleAz && data.titleAz.trim()) ||
          (data.titleTr && data.titleTr.trim()) ||
          (data.titleEn && data.titleEn.trim()) ||
          (data.titleRu && data.titleRu.trim()),
      ),
    { message: 'Ən azı bir dildə başlıq tələb olunur.' },
  );

export async function POST(request: NextRequest) {
  const auth = await canAccessNewsAdmin(request);
  if (!auth.allowed) {
    return NextResponse.json(
      { success: false, error: 'Admin girisi teleb olunur.' },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'JSON formatı yanlış.' }, { status: 400 });
  }

  const parsed = CreateNewsSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        error: firstIssue?.message || 'Yanlış məlumat.',
        details: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  try {
    const row = await createNewsArticle(parsed.data);
    return NextResponse.json({ success: true, data: row }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Xəbər yaradılarkən xəta baş verdi.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
