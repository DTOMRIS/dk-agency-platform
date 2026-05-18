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

const MenuItemSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['salat', 'shorba', 'et', 'toyuq', 'baliq', 'sandvic', 'shirniyyat', 'icki']),
  price: z.number().min(0.1),
  costPercent: z.number().min(0).max(100).optional(),
  monthlySales: z.number().int().min(0).optional(),
});

const InputSchema = z.object({
  restaurantName: z.string().min(2).max(100),
  menuItems: z.array(MenuItemSchema).min(5, 'En az 5 yemek lazimdir').max(50),
  locale: z.enum(['az', 'en', 'tr', 'ru']).default('az'),
});

const MatrixItemSchema = z.object({
  name: z.string(),
  category: z.string(),
  price: z.number(),
  margin: z.number().optional(),
  reason: z.string(),
});

const OutputSchema = z.object({
  matrix: z.object({
    stars: z.array(MatrixItemSchema),
    plowhorses: z.array(MatrixItemSchema),
    puzzles: z.array(MatrixItemSchema),
    dogs: z.array(MatrixItemSchema),
  }),
  categoryBalance: z.record(z.string(), z.object({
    count: z.number(),
    avgPrice: z.number(),
    avgMargin: z.number(),
    recommendation: z.string(),
  })),
  pricing: z.object({
    priceSpread: z.number(),
    psychologicalPricing: z.array(z.string()),
    anchorItems: z.array(z.string()),
  }),
  topRecommendations: z.array(z.string()).min(3).max(7),
  ahilikQuote: z.string(),
});

// ── AI PROMPT ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Sen bir HoReCa menyu muhendisliyi meslehetcisisen. Restoran sahibi oz menyusunu sene verir, senin isin Menu Engineering Matrix metodologiyasi ile tehlil etmekdir.

VEZIVEN:
1. Her yemeyi 4 quadrant-dan birine yerleshdir:
   - stars: yuksek populyarite + yuksek marja (qoru)
   - plowhorses: yuksek populyarite + ashagi marja (qiymet/maliyye yenile)
   - puzzles: ashagi populyarite + yuksek marja (marketing/pozisiya)
   - dogs: ashagi populyarite + ashagi marja (menyudan sil)

2. Kategoriya balansini analiz et — her kategoriya ucun count, avgPrice, avgMargin ve tovsiye.

3. Qiymet analizi:
   - Psixoloji qiymet (9.99 vs 10.00)
   - Anchor item varmi? (Premium yemek digerlerini ucuz gosterir)
   - Price spread (en bahali / en ucuz)

4. 5-7 maddeli praktik tovsiye yaz.

5. Ahilik enenelerinden bir hikmet sozu elave et.

MUHUM:
- monthlySales yoxdursa, yemeyin adi + kateqoriyasina gore populyariteni TEXMIN et
- costPercent yoxdursa, kateqoriyaya gore texmin et:
  - Salat/Shorba: 25-35%
  - Et/Baliq: 35-45%
  - Icki: 15-25%
  - Shirniyyat: 25-35%
  - Toyuq/Sandvic: 28-38%
- Hec bir konkret reqem uydurma — sene verilen datayla danis.

Cavabi JSON formatinda ver:
{
  "matrix": { "stars": [...], "plowhorses": [...], "puzzles": [...], "dogs": [...] },
  "categoryBalance": { "salat": { "count": 0, "avgPrice": 0, "avgMargin": 0, "recommendation": "" } },
  "pricing": { "priceSpread": 0, "psychologicalPricing": ["..."], "anchorItems": ["..."] },
  "topRecommendations": ["...", "..."],
  "ahilikQuote": "..."
}`;

function buildUserPrompt(input: z.infer<typeof InputSchema>): string {
  const items = input.menuItems.map((m) =>
    `- ${m.name} (${m.category}) — ${m.price} AZN${m.costPercent ? `, maliyyet ${m.costPercent}%` : ''}${m.monthlySales ? `, ayda ${m.monthlySales} porsiya` : ''}`
  ).join('\n');

  return `RESTORAN: ${input.restaurantName}
MENYU (${input.menuItems.length} yemek):
${items}

JSON formatinda tam tehlil ver.`;
}

// ── POST ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const access = await checkToolAccess(auth.userId, 'menyu-analitik', auth.role);
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.reason, requiredTier: 'requiredTier' in access ? access.requiredTier : null },
        { status: 403 },
      );
    }

    const body = await req.json();
    const input = InputSchema.parse(body);

    if (!db) return NextResponse.json({ error: 'database-unavailable' }, { status: 503 });

    const [run] = await db
      .insert(marketingToolRuns)
      .values({ userId: auth.userId, toolSlug: 'menyu-analitik', inputData: input, status: 'pending', locale: input.locale })
      .returning();

    let aiResult: { data: unknown; meta: { provider: string; tokensUsed: number; costAzn: number } };

    try {
      aiResult = await callAIJson<unknown>(
        { system: SYSTEM_PROMPT, prompt: buildUserPrompt(input), maxTokens: 2500, temperature: 0.5, timeout: 55000 },
        { preferProvider: 'deepseek', toolSlug: 'menyu-analitik', userId: auth.userId, locale: input.locale },
      );
    } catch (aiErr) {
      await db.update(marketingToolRuns)
        .set({ status: 'error', errorMessage: String(aiErr).slice(0, 500), completedAt: new Date() })
        .where(eq(marketingToolRuns.id, run.id));
      if (isAIAbortError(aiErr)) {
        return NextResponse.json({ error: 'ai-timeout' }, { status: 504 });
      }
      return NextResponse.json({ error: 'ai-failed' }, { status: 502 });
    }

    const parseResult = OutputSchema.safeParse(aiResult.data);
    if (!parseResult.success) {
      await db.update(marketingToolRuns)
        .set({ status: 'error', errorMessage: `Output validation: ${parseResult.error.message.slice(0, 400)}`, completedAt: new Date() })
        .where(eq(marketingToolRuns.id, run.id));
      return NextResponse.json({ error: 'ai-output-invalid' }, { status: 502 });
    }

    await db.update(marketingToolRuns)
      .set({
        outputData: parseResult.data as Record<string, unknown>,
        status: 'success',
        aiProvider: aiResult.meta.provider,
        tokensUsed: aiResult.meta.tokensUsed,
        costAzn: aiResult.meta.costAzn,
        completedAt: new Date(),
      })
      .where(eq(marketingToolRuns.id, run.id));

    return NextResponse.json({ success: true, data: parseResult.data, remainingRuns: access.remainingRuns });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'validation', issues: err.issues }, { status: 400 });
    console.error('[menyu-analitigi] POST error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

// ── GET (history) ───────────────────────────────────────────────────

export async function GET() {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (!db) return NextResponse.json({ hasRun: false, lastResult: null, completedAt: null });

    const [lastRun] = await db.select().from(marketingToolRuns)
      .where(and(eq(marketingToolRuns.userId, auth.userId), eq(marketingToolRuns.toolSlug, 'menyu-analitik'), eq(marketingToolRuns.status, 'success')))
      .orderBy(desc(marketingToolRuns.createdAt)).limit(1);

    return NextResponse.json({ hasRun: !!lastRun, lastResult: lastRun?.outputData ?? null, completedAt: lastRun?.completedAt ?? null });
  } catch (err) {
    console.error('[menyu-analitigi] GET error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
