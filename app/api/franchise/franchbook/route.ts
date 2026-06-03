import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { db, dbAvailable } from '@/lib/db';
import { franchbookProjects } from '@/lib/db/schema';
import { checkToolAccess } from '@/lib/marketing-gating';
import { generateFranchbookContent, sanitizeFranchbookInputs } from '@/lib/ai/franchbookGenerator';
import { FRANCHBOOK_OUTLINE, FRANCHBOOK_TOOL_SLUG } from '@/lib/data/franchbookOutline';

const LocaleSchema = z.enum(['az', 'ru', 'en', 'tr']).default('az');

const InputSchema = z.object({
  brand: z.string().min(2).max(120),
  sector: z.string().min(2).max(120),
  operationDescription: z.string().min(20).max(1600),
  standards: z.string().min(10).max(1600),
  staff: z.string().min(10).max(1600),
  supply: z.string().min(10).max(1600),
  openingProcess: z.string().min(10).max(1600),
  locale: LocaleSchema,
});

const SectionSchema = z.object({
  purpose: z.string().min(1).max(1500),
  procedure: z.array(z.string().min(1).max(700)).min(1).max(10),
  controls: z.array(z.string().min(1).max(700)).min(1).max(10),
  template: z.string().min(1).max(2500),
});

const ContentSchema = z.object(
  Object.fromEntries(
    FRANCHBOOK_OUTLINE.map((section) => [section.key, SectionSchema]),
  ),
);

const PatchSchema = z.object({
  id: z.number().int().positive(),
  content: ContentSchema,
  status: z.enum(['generated', 'reviewed']).default('reviewed'),
});

function gateResponse(reason: string, requiredTier?: string | null) {
  return NextResponse.json({ error: reason, requiredTier: requiredTier || 'usta' }, { status: 403 });
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const access = await checkToolAccess(auth.userId, FRANCHBOOK_TOOL_SLUG, auth.role);
    if (!access.allowed) {
      return gateResponse(access.reason, 'requiredTier' in access ? access.requiredTier : null);
    }

    if (!dbAvailable || !db) {
      return NextResponse.json({ error: 'database-unavailable' }, { status: 503 });
    }

    const parsed = InputSchema.parse(await req.json());
    const { locale, ...rawInputs } = parsed;
    const inputs = sanitizeFranchbookInputs(rawInputs);

    const [project] = await db.insert(franchbookProjects)
      .values({
        ownerId: auth.userId,
        brand: inputs.brand,
        sector: inputs.sector,
        inputs,
        status: 'draft',
        locale,
      })
      .returning({ id: franchbookProjects.id });

    const generated = await generateFranchbookContent(inputs, locale, auth.userId);

    await db.update(franchbookProjects)
      .set({
        content: generated.content,
        status: 'generated',
        updatedAt: new Date(),
      })
      .where(eq(franchbookProjects.id, project.id));

    return NextResponse.json({
      success: true,
      projectId: project.id,
      content: generated.content,
      providers: generated.providers,
      remainingRuns: access.remainingRuns,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation', issues: err.issues }, { status: 400 });
    }
    console.error('[franchbook] POST error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (!dbAvailable || !db) return NextResponse.json({ error: 'database-unavailable' }, { status: 503 });

    const body = PatchSchema.parse(await req.json());

    const [updated] = await db.update(franchbookProjects)
      .set({
        content: body.content,
        status: body.status,
        updatedAt: new Date(),
      })
      .where(and(eq(franchbookProjects.id, body.id), eq(franchbookProjects.ownerId, auth.userId)))
      .returning({ id: franchbookProjects.id });

    if (!updated) return NextResponse.json({ error: 'not-found' }, { status: 404 });
    return NextResponse.json({ success: true, projectId: updated.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation', issues: err.issues }, { status: 400 });
    }
    console.error('[franchbook] PATCH error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
