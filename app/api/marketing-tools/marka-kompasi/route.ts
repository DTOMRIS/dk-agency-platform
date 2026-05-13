import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';
import { callAIJson, isAIAbortError } from '@/lib/ai-router';
import { db } from '@/lib/db';
import { marketingToolRuns } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const maxDuration = 60;

// ── SCHEMAS ─────────────────────────────────────────────────────────

const InputSchema = z.object({
  customerTime: z.enum(['morning', 'lunch', 'evening', 'late-night', 'all']),
  customerActivity: z.enum(['fill-belly', 'work', 'celebration', 'relax', 'third-place']),
  foodStory: z.enum(['tradition', 'speed', 'health', 'exotic', 'handcrafted']),
  competitorGap: z.string().min(20, 'En az 20 simvol').max(500),
  recommendReason: z.string().min(10, 'En az 10 simvol').max(200),
  locale: z.enum(['az', 'en', 'tr', 'ru']).default('az'),
});

const OutputSchema = z.object({
  icp: z.object({
    who: z.string(),
    context: z.string(),
    painPoint: z.string(),
  }),
  valueProp: z.string(),
  differentiators: z.array(z.string()).min(3).max(5),
  tagline: z.string(),
  useThisIn: z.array(z.string()).min(2).max(6),
});

type MarkaKompasiOutput = z.infer<typeof OutputSchema>;

// ── SYSTEM PROMPT ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `Sen B2B SaaS positioning expertisen, April Dunford terzinde.

Restoran sahibinin 5 cavabindan bunlari cixar:
1. ICP (Ideal Customer Profile): kim, hansi kontekstde, hansi problem
2. Value Proposition: 1 cumle, niye senin restoranin
3. 3 Differentiator: reqibin ede bilmediyi konkret ustunlukler
4. Tagline: bir-cumle, brendi tam ifade eden
5. UseThisIn: bu positioning hansi 3-5 yerde islene biler (Google Business tesviri, IG bio, menyu girisi ve s.)

Stil:
- Konkret ve ezeleli, umumi soz yox ("lezzetli yemek" deme)
- Ahilik enenelerine hormetli, lakin muasir
- Azerbaycan/Turkiye bazari ucun uygun

Cavabini YALNIZ kecerli JSON formatinda ver.
JSON strukturu:
{
  "icp": { "who": "...", "context": "...", "painPoint": "..." },
  "valueProp": "...",
  "differentiators": ["...", "...", "..."],
  "tagline": "...",
  "useThisIn": ["...", "...", "..."]
}`;

// ── PROMPT BUILDER ──────────────────────────────────────────────────

const TIME_MAP: Record<string, string> = {
  morning: 'seher',
  lunch: 'nahar',
  evening: 'axsam',
  'late-night': 'gec gece',
  all: 'butun gun',
};

const ACTIVITY_MAP: Record<string, string> = {
  'fill-belly': 'qarin doyurmaq',
  work: 'is gormek',
  celebration: 'merasim / bayram',
  relax: 'dincelmek',
  'third-place': 'ev/is arasi ucuncu mekan',
};

const FOOD_MAP: Record<string, string> = {
  tradition: 'gelenek / ata-baba reseptleri',
  speed: 'suret / fast casual',
  health: 'saglamliq / organik',
  exotic: 'ekzotik / dunya mutfagi',
  handcrafted: 'el-emeyi / hand-crafted',
};

function buildUserPrompt(input: z.infer<typeof InputSchema>): string {
  return `Restoran sahibinin cavablari:

1. Musteriler gunde ${TIME_MAP[input.customerTime]} gelir.
2. Onlar burda: ${ACTIVITY_MAP[input.customerActivity]}.
3. Yemeyin esas hekayesi: ${FOOD_MAP[input.foodStory]}.
4. Reqibin ede bilmediyi:
${input.competitorGap}
5. Musteri tovsiye sebebi: ${input.recommendReason}

Bu melumatlardan ICP, Value Prop, 3 Differentiator, Tagline ve UseThisIn cixar.`;
}

// ── POST — yeni run ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const access = await checkToolAccess(auth.userId, 'marka-kompasi', auth.role);
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

    // Pending run yarat
    const [run] = await db
      .insert(marketingToolRuns)
      .values({
        userId: auth.userId,
        toolSlug: 'marka-kompasi',
        inputData: input,
        status: 'pending',
        locale: input.locale,
      })
      .returning();

    // AI call
    const userPrompt = buildUserPrompt(input);
    let aiResult: { data: unknown; meta: { provider: string; tokensUsed: number; costAzn: number } };

    try {
      aiResult = await callAIJson<unknown>(
        {
          system: SYSTEM_PROMPT,
          prompt: userPrompt,
          maxTokens: 1500,
          temperature: 0.7,
          timeout: 55000,
        },
        {
          preferProvider: 'claude',
          toolSlug: 'marka-kompasi',
          userId: auth.userId,
          locale: input.locale,
        },
      );
    } catch (aiErr) {
      await db
        .update(marketingToolRuns)
        .set({
          status: 'error',
          errorMessage: String(aiErr).slice(0, 500),
          completedAt: new Date(),
        })
        .where(eq(marketingToolRuns.id, run.id));

      if (isAIAbortError(aiErr)) {
        return NextResponse.json({ error: 'ai-timeout' }, { status: 504 });
      }

      return NextResponse.json({ error: 'ai-failed' }, { status: 502 });
    }

    // Validate output
    const parseResult = OutputSchema.safeParse(aiResult.data);
    if (!parseResult.success) {
      await db
        .update(marketingToolRuns)
        .set({
          status: 'error',
          errorMessage: `Output validation failed: ${parseResult.error.message.slice(0, 400)}`,
          completedAt: new Date(),
        })
        .where(eq(marketingToolRuns.id, run.id));

      return NextResponse.json({ error: 'ai-output-invalid' }, { status: 502 });
    }

    // Success — update run
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
    console.error('[marka-kompasi] POST error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

// ── GET — son nəticəni qaytarır (history) ───────────────────────────

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
          eq(marketingToolRuns.toolSlug, 'marka-kompasi'),
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
    console.error('[marka-kompasi] GET error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
