import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';
import { callAIJson, isAIAbortError } from '@/lib/ai-router';
import { db } from '@/lib/db';
import { marketingToolRuns } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const maxDuration = 60;

// ── SCHEMAS ─────────────────────────────────────────────────────────

const ScoreVal = z.number().int().min(1).max(5);

function categorySchema(prefix: string) {
  const shape: Record<string, z.ZodNumber> = {};
  for (let i = 1; i <= 10; i++) shape[`${prefix}${i}`] = ScoreVal;
  return z.object(shape);
}

const InputSchema = z.object({
  quality: categorySchema('K'),
  service: categorySchema('S'),
  cleanliness: categorySchema('T'),
  notes: z.string().max(1000).optional().default(''),
  locale: z.enum(['az', 'en', 'tr', 'ru']).default('az'),
});

const OutputSchema = z.object({
  scores: z.object({
    quality: z.number().min(0).max(100),
    service: z.number().min(0).max(100),
    cleanliness: z.number().min(0).max(100),
    overall: z.number().min(0).max(100),
  }),
  industryBenchmark: z.object({
    quality: z.number(),
    service: z.number(),
    cleanliness: z.number(),
    overall: z.number(),
  }),
  topIssues: z.array(z.object({
    category: z.enum(['quality', 'service', 'cleanliness']),
    questionId: z.string(),
    score: z.number(),
    rootCause: z.string(),
    weekFixStep: z.string(),
  })).min(3).max(5),
  actionPlan: z.object({
    week1: z.object({ title: z.string(), steps: z.array(z.string()) }),
    week2: z.object({ title: z.string(), steps: z.array(z.string()) }),
    week3to4: z.object({ title: z.string(), steps: z.array(z.string()) }),
  }),
  ahilikQuote: z.string(),
  encouragement: z.string(),
});

// ── SYSTEM PROMPT ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `Sen HoReCa keyfiyyet auditorusan, ISO 22000 ve HACCP standartlarina beledsen.
Restoran sahibi 30 sahe uzre oz-ozunu qiymetlendirib.

Senin isin:
1. Her kateqoriya uzre faiz skor hesabla:
   - quality: K1-K10 cemi / 50 x 100
   - service: S1-S10 cemi / 50 x 100
   - cleanliness: T1-T10 cemi / 50 x 100
   - overall: ucunun ortalamasi
2. Senaye benchmark (sabit deyerler ver):
   - quality: 80, service: 75, cleanliness: 85, overall: 80
3. En kritik 3 suali tap (en asagi bal alanlar). Her biri ucun:
   - category, questionId (K1-T10), score
   - rootCause: kok sebeb (1 cumle, suclamayan)
   - weekFixStep: 1 heftede hellolunan konkret addim
4. 30 gunluk action plan (3 hefte pille-pille):
   - week1: en kritik probleme tez hell
   - week2: orta-muddetli proses deyisikliyi
   - week3to4: davamli sistem qurulmasi (audit cedveli, KPI, training)
5. Ahilik enenelerinden movzuya uygun hikmet sozu
6. encouragement: 1 cumle motivasiya

Cavabini YALNIZ kecerli JSON formatinda ver.
JSON strukturu:
{
  "scores": { "quality": 0, "service": 0, "cleanliness": 0, "overall": 0 },
  "industryBenchmark": { "quality": 80, "service": 75, "cleanliness": 85, "overall": 80 },
  "topIssues": [{ "category": "", "questionId": "", "score": 0, "rootCause": "", "weekFixStep": "" }],
  "actionPlan": {
    "week1": { "title": "", "steps": [] },
    "week2": { "title": "", "steps": [] },
    "week3to4": { "title": "", "steps": [] }
  },
  "ahilikQuote": "",
  "encouragement": ""
}`;

// ── PROMPT BUILDER ──────────────────────────────────────────────────

function buildUserPrompt(input: z.infer<typeof InputSchema>): string {
  const fmt = (scores: Record<string, number>) =>
    Object.entries(scores).map(([id, v]) => `${id}: ${v}/5`).join(', ');

  return `Restoran sahibinin KST oz-ozunu qiymetlendirmesi:

KEYFIYYET (10 sual):
${fmt(input.quality)}

SERVIS (10 sual):
${fmt(input.service)}

TEMIZLIK (10 sual):
${fmt(input.cleanliness)}

${input.notes ? `Elave qeyd: ${input.notes}` : ''}

JSON formatinda tam audit raportu ver.`;
}

// ── POST ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const access = await checkToolAccess(auth.userId, 'kst-yoxlayici', auth.role);
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.reason, requiredTier: 'requiredTier' in access ? access.requiredTier : null },
        { status: 403 },
      );
    }

    const body = await req.json();
    const input = InputSchema.parse(body);

    if (!db) {
      return NextResponse.json({ error: 'database-unavailable' }, { status: 503 });
    }

    const [run] = await db
      .insert(marketingToolRuns)
      .values({
        userId: auth.userId,
        toolSlug: 'kst-yoxlayici',
        inputData: input,
        status: 'pending',
        locale: input.locale,
      })
      .returning();

    let aiResult: { data: unknown; meta: { provider: string; tokensUsed: number; costAzn: number } };

    try {
      aiResult = await callAIJson<unknown>(
        {
          system: SYSTEM_PROMPT,
          prompt: buildUserPrompt(input),
          maxTokens: 2000,
          temperature: 0.5,
          timeout: 55000,
        },
        {
          preferProvider: 'deepseek',
          toolSlug: 'kst-yoxlayici',
          userId: auth.userId,
          locale: input.locale,
        },
      );
    } catch (aiErr) {
      await db
        .update(marketingToolRuns)
        .set({ status: 'error', errorMessage: String(aiErr).slice(0, 500), completedAt: new Date() })
        .where(eq(marketingToolRuns.id, run.id));
      if (isAIAbortError(aiErr)) {
        return NextResponse.json({ error: 'ai-timeout' }, { status: 504 });
      }
      return NextResponse.json({ error: 'ai-failed' }, { status: 502 });
    }

    const parseResult = OutputSchema.safeParse(aiResult.data);
    if (!parseResult.success) {
      await db
        .update(marketingToolRuns)
        .set({ status: 'error', errorMessage: `Output validation: ${parseResult.error.message.slice(0, 400)}`, completedAt: new Date() })
        .where(eq(marketingToolRuns.id, run.id));
      return NextResponse.json({ error: 'ai-output-invalid' }, { status: 502 });
    }

    await db
      .update(marketingToolRuns)
      .set({
        outputData: parseResult.data as Record<string, unknown>,
        status: 'success',
        aiProvider: aiResult.meta.provider,
        tokensUsed: aiResult.meta.tokensUsed,
        costAzn: aiResult.meta.costAzn,
        completedAt: new Date(),
      })
      .where(eq(marketingToolRuns.id, run.id));

    return NextResponse.json({
      success: true,
      data: parseResult.data,
      remainingRuns: access.remainingRuns !== null ? access.remainingRuns - 1 : null,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation', issues: err.issues }, { status: 400 });
    }
    console.error('[kst-yoxlayici] POST error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

// ── GET (history) ───────────────────────────────────────────────────

export async function GET() {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    if (!db) {
      return NextResponse.json({ hasRun: false, lastResult: null, completedAt: null });
    }

    const [lastRun] = await db
      .select()
      .from(marketingToolRuns)
      .where(
        and(
          eq(marketingToolRuns.userId, auth.userId),
          eq(marketingToolRuns.toolSlug, 'kst-yoxlayici'),
          eq(marketingToolRuns.status, 'success'),
        ),
      )
      .orderBy(desc(marketingToolRuns.createdAt))
      .limit(1);

    return NextResponse.json({
      hasRun: !!lastRun,
      lastResult: lastRun?.outputData ?? null,
      completedAt: lastRun?.completedAt ?? null,
    });
  } catch (err) {
    console.error('[kst-yoxlayici] GET error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
