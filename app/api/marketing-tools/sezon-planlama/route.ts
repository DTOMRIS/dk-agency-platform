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

const InputSchema = z.object({
  restaurantName: z.string().min(2).max(100),
  concept: z.enum(['fast-food', 'fine-dining', 'cafe', 'fast-casual', 'fine-casual', 'pub', 'traditional', 'other']),
  city: z.string().min(2).max(50),
  targetMonths: z.array(z.number().int().min(1).max(12)).min(1).max(12),
  annualBudget: z.number().min(0).optional(),
  localEvents: z.string().max(500).optional().default(''),
  locale: z.enum(['az', 'en', 'tr', 'ru']).default('az'),
});

const CampaignSchema = z.object({
  month: z.number(),
  monthName: z.string(),
  campaigns: z.array(z.object({
    name: z.string(),
    type: z.enum(['bayram', 'movsum', 'event', 'promo', 'community']),
    startDay: z.number(),
    endDay: z.number(),
    description: z.string(),
    budget: z.string(),
    channel: z.string(),
    kpi: z.string(),
  })),
});

const OutputSchema = z.object({
  calendar: z.array(CampaignSchema),
  totalCampaigns: z.number(),
  budgetSummary: z.object({
    allocated: z.string(),
    perMonth: z.string(),
    topCategory: z.string(),
  }),
  topRecommendations: z.array(z.string()).min(3).max(5),
  ahilikQuote: z.string(),
});

// ── AI PROMPT ───────────────────────────────────────────────────────

const AZ_HOLIDAYS = `AZ bayramlari: Novruz (20-24 Mart), Respublika Gunu (28 May), Qurban bayrami (devisir), Ramazan bayrami (devisir), Yeni Il (31 Dek - 1 Yan), 8 Mart, 9 May (Zfer), 15 Iyun (Milli Xilas), 18 Oktyabr (Mustaqillik), Dunya gunleri: Valentin (14 Fev), Analar Gunu (may), Black Friday (noy), HoReCa: World Pizza Day (9 Fev), Coffee Day (1 Okt)`;

const SYSTEM_PROMPT = `Sen bir HoReCa marketinq planlama ekspertisen. Restoran sahibi senden 12 aylik kampaniya takvimi isteyir.

Her secilmis ay ucun 2-4 kampaniya teklif et:
- Bayram/movsum kampaniyalari (${AZ_HOLIDAYS})
- Promo aksiyalar (endirim, combo, sadiqlik)
- Community event-ler (live music, master-class, usaq gunu)
- Sosial medya kampaniyalari

Her kampaniya ucun:
- Ad, tip, baslama-bitme gunleri
- Qisa tesvir (1-2 cumle)
- Budce texmini (eger illik budce verilibse — bolushtur)
- Kanal (Instagram/TikTok/Google/Wolt/yerinde)
- KPI (hedef reqem: TC artimi %, satis artimi %, follower artimi)

Sonra:
- Umumi budce xulasesi
- 3-5 tovsiye (movsum strategiyasi, vaxt secimi)
- Ahilik hikmeti

MUHUM:
- AZ bayramlari ve kulturel kontekst
- Konsept ile uygunluq (fine-dining ucun "1+1 burger" teklif etme)
- Budce verilmeyibse, "budce texmini yoxdur" yaz, reqem uydurma
- AZ qrammatikasi: e, o, u, s, c, g, i

Cavabi JSON formatinda ver.`;

const STRICT_JSON_SCHEMA_INSTRUCTION = `
===================================================
JSON STRUCTURE - CRITICAL, NO EXCEPTIONS
===================================================

You MUST return a JSON object with EXACTLY these top-level keys in English:

{
  "calendar": [
    {
      "month": 6,
      "monthName": "Iyun",
      "campaigns": [
        {
          "name": "Kampaniya adi AZ dilinde",
          "type": "bayram",
          "startDay": 1,
          "endDay": 15,
          "description": "Tesvir AZ dilinde",
          "budget": "200 AZN",
          "channel": "Instagram, Wolt, yerinde",
          "kpi": "satis artimi 10%, TC artimi 5%"
        }
      ]
    }
  ],
  "totalCampaigns": 12,
  "budgetSummary": {
    "allocated": "1500 AZN",
    "perMonth": "Her ay texminen 500 AZN",
    "topCategory": "promo"
  },
  "topRecommendations": [
    "Tovsiye 1 AZ dilinde",
    "Tovsiye 2 AZ dilinde",
    "Tovsiye 3 AZ dilinde"
  ],
  "ahilikQuote": "Ahilik hikmeti AZ dilinde"
}

CRITICAL RULES:
1. Top-level keys MUST be exactly: calendar, totalCampaigns, budgetSummary, topRecommendations, ahilikQuote.
2. Do NOT add extra top-level keys like restoran, konsept, seher, budce, tovsiyeler, ahilik_hikmeti.
3. Do NOT use Azerbaijani or snake_case keys like kampaniya_takvimi, kampaniyalar, umumi_budce_xulasesi.
4. "calendar" MUST be an array, NOT an object.
5. Each calendar entry MUST have "month" as a number, "monthName" as a string, and "campaigns" as an array.
6. Campaign keys MUST be exactly: name, type, startDay, endDay, description, budget, channel, kpi.
7. Campaign "type" MUST be one of: bayram, movsum, event, promo, community.
8. "startDay" and "endDay" MUST be numbers, NOT dates and NOT strings.
9. "channel" MUST be a string, NOT an array.
10. "budgetSummary" keys MUST be exactly: allocated, perMonth, topCategory.
11. "totalCampaigns" MUST be a number, NOT a string.
12. "topRecommendations" MUST contain 3 to 5 strings.
13. Content values should be in Azerbaijani. Only JSON key names are English.
14. Return ONLY the JSON object. No markdown, no explanation.
`;

function buildUserPrompt(input: z.infer<typeof InputSchema>): string {
  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
  const selected = input.targetMonths.map((m) => monthNames[m - 1]).join(', ');

  return `RESTORAN: ${input.restaurantName}
KONSEPT: ${input.concept}
SEHER: ${input.city}
SECILMIS AYLAR: ${selected}
${input.annualBudget ? `ILLIK BUDCE: ${input.annualBudget} AZN` : 'BUDCE: verilmeyib'}
${input.localEvents ? `YERLI XUSUSI GUNLER: ${input.localEvents}` : ''}

Bu aylar ucun kampaniya takvimi yarat. JSON formatinda ver.`;
}

// ── POST ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const access = await checkToolAccess(auth.userId, 'sezon-planlama', auth.role);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason, requiredTier: 'requiredTier' in access ? access.requiredTier : null }, { status: 403 });
    }

    const body = await req.json();
    const input = InputSchema.parse(body);

    if (!db) return NextResponse.json({ error: 'database-unavailable' }, { status: 503 });

    const [run] = await db.insert(marketingToolRuns)
      .values({ userId: auth.userId, toolSlug: 'sezon-planlama', inputData: input, status: 'pending', locale: input.locale })
      .returning();

    let aiResult: { data: unknown; meta: { provider: string; tokensUsed: number; costAzn: number } };

    try {
      aiResult = await callAIJson<unknown>(
        {
          system: `${SYSTEM_PROMPT}\n${STRICT_JSON_SCHEMA_INSTRUCTION}`,
          prompt: buildUserPrompt(input),
          maxTokens: 3000,
          temperature: 0.7,
          stream: true,
          timeout: 55000,
          responseFormat: 'json_object',
        },
        { preferProvider: 'deepseek', toolSlug: 'sezon-planlama', userId: auth.userId, locale: input.locale },
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

    const rawOutput = aiResult.data;
    console.error('[SEZON-DEBUG] raw output:', JSON.stringify(rawOutput, null, 2));
    console.error('[SEZON-DEBUG] output keys:', Object.keys((rawOutput ?? {}) as Record<string, unknown>));

    const parseResult = OutputSchema.safeParse(rawOutput);
    if (!parseResult.success) {
      const debug = parseResult.error.format();
      console.error('[SEZON-DEBUG] zod errors:', JSON.stringify(debug, null, 2));
      await db.update(marketingToolRuns)
        .set({ status: 'error', errorMessage: `Output validation: ${parseResult.error.message.slice(0, 400)}`, completedAt: new Date() })
        .where(eq(marketingToolRuns.id, run.id));
      return NextResponse.json({ error: 'ai-output-invalid', debug }, { status: 422 });
    }

    await db.update(marketingToolRuns)
      .set({ outputData: parseResult.data as Record<string, unknown>, status: 'success', aiProvider: aiResult.meta.provider, tokensUsed: aiResult.meta.tokensUsed, costAzn: aiResult.meta.costAzn, completedAt: new Date() })
      .where(eq(marketingToolRuns.id, run.id));

    return NextResponse.json({ success: true, data: parseResult.data, remainingRuns: access.remainingRuns });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'validation', issues: err.issues }, { status: 400 });
    console.error('[sezon-planlama] POST error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (!db) return NextResponse.json({ hasRun: false, lastResult: null, completedAt: null });

    const [lastRun] = await db.select().from(marketingToolRuns)
      .where(and(eq(marketingToolRuns.userId, auth.userId), eq(marketingToolRuns.toolSlug, 'sezon-planlama'), eq(marketingToolRuns.status, 'success')))
      .orderBy(desc(marketingToolRuns.createdAt)).limit(1);

    return NextResponse.json({ hasRun: !!lastRun, lastResult: lastRun?.outputData ?? null, completedAt: lastRun?.completedAt ?? null });
  } catch (err) {
    console.error('[sezon-planlama] GET error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
