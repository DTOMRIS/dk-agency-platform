import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';
import { callAIJson, isAIAbortError } from '@/lib/ai-router';
import { buildBrainContext } from '@/lib/marketing-tools/_brain';
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
  // Legacy quick-view fields kept until TASK-0125 frontend report renderer lands.
  // New premium fields are added below.
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
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    methodology: z.string(),
    doganRule: z.string().optional(),
    targetSegment: z.string(),
    channels: z.array(z.string()).optional(),
    kpiDetail: z.object({
      primary: z.string(),
      target: z.string(),
    }).optional(),
    budgetEstimate: z.string().optional(),
    riskNotes: z.string().optional(),
  })),
  keyEvents: z.array(z.string()).optional(),
});

const OutputSchema = z.object({
  executiveSummary: z.string().min(50).max(800),
  context: z.object({
    restaurantName: z.string(),
    concept: z.string(),
    location: z.string(),
    audienceProfile: z.string(),
    targetMonths: z.array(z.string()),
  }),
  calendar: z.array(CampaignSchema),
  totalCampaigns: z.number(),
  budgetSummary: z.object({
    // Legacy quick-view fields.
    allocated: z.string(),
    perMonth: z.string(),
    topCategory: z.string(),
    // Premium report fields.
    totalBudget: z.string().optional(),
    breakdown: z.string().optional(),
    roiProjection: z.string().optional(),
  }),
  topRecommendations: z.array(z.string()).min(3).max(5),
  phases: z.object({
    preLaunch: z.array(z.string()).optional(),
    launch: z.array(z.string()).optional(),
    postLaunch: z.array(z.string()).optional(),
  }).optional(),
  aeoRecommendations: z.array(z.object({
    action: z.string(),
    rationale: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
  })).optional(),
  risksWatchout: z.array(z.object({
    period: z.string(),
    risk: z.string(),
    mitigation: z.string(),
  })).optional(),
  // TASK-0523: no longer requested; old saved runs may still have it.
  ahilikQuote: z.string().optional(),
});

// ── AI PROMPT ───────────────────────────────────────────────────────

// TASK-0523: proper Azerbaijani letters (the prompt used to TELL the model to write e/o/u/s/c/g/i);
// moving holidays are not given fixed dates — the model must not invent them.
const AZ_HOLIDAYS = `AZ bayramları və günləri: Novruz (20-24 mart), 8 Mart, 9 May, Müstəqillik Günü (28 may), Milli Qurtuluş Günü (15 iyun), Yeni il (31 dekabr - 1 yanvar); Ramazan və Qurban bayramı hər il dəyişir — dəqiq tarix bilinmirsə «təxmini tarix, rəsmi təqvimdən yoxlayın» yaz; Məhərrəm və Səfər ayları da hər il dəyişir. Dünya günləri: Sevgililər günü (14 fevral), Analar günü (may), Qəhvə günü (1 oktyabr)`;

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
- KPI: ölçüləcək göstərici və hədəf (məs. çek sayı, satış). Bu HƏDƏFDİR, vəd deyil — «artacaq» yox, «hədəf» yaz

Sonra:
- Umumi budce xulasesi
- 3-5 tovsiye (movsum strategiyasi, vaxt secimi)

MUHUM:
- AZ bayramlari ve kulturel kontekst
- Konsept ile uygunluq (fine-dining ucun "1+1 burger" teklif etme)
- Budce verilmeyibse, "budce texmini yoxdur" yaz, reqem uydurma
- Bütün mətni Azərbaycan dilində, düzgün hərflərlə yaz: ə, ı, ö, ü, ç, ş, ğ
- Halal: donuz əti və spirtli içki kampaniyası təklif etmə
- Statistika, ROI faizi və «tədqiqat göstərir» kimi iddia uydurma

Cavabi JSON formatinda ver.`;

const strictJsonSchemaInstruction = (year: number) => `
===================================================
JSON STRUCTURE - CRITICAL, NO EXCEPTIONS
===================================================

You MUST return a JSON object with EXACTLY these top-level keys in English:

{
  "executiveSummary": "3-4 cumlelik strateji xulase AZ dilinde",
  "context": {
    "restaurantName": "Restoran adi",
    "concept": "fine-dining",
    "location": "Baki",
    "audienceProfile": "aile, ciftlik, biznes ve turist segmentleri",
    "targetMonths": ["Iyun", "Iyul", "Avqust"]
  },
  "calendar": [
    {
      "month": 6,
      "monthName": "Iyun",
      "keyEvents": ["1 iyun Uşaqların Müdafiəsi Günü", "Məhərrəm və Səfər (tarixi hər il dəyişir)"],
      "campaigns": [
        {
          "name": "Kampaniya adi AZ dilinde",
          "type": "bayram",
          "startDay": 1,
          "endDay": 15,
          "startDate": "${year}-06-01",
          "endDate": "${year}-06-15",
          "description": "Tesvir AZ dilinde",
          "methodology": "Pille 3: Heveslendirme",
          "doganRule": "Usaq strategiyasi: usaq razi qalanda aile tekrar gelir",
          "targetSegment": "aile ve usaqli qonaqlar",
          "budget": "200 AZN",
          "budgetEstimate": "200 AZN",
          "channel": "Instagram, Wolt, yerinde",
          "channels": ["Instagram", "Wolt", "yerinde"],
          "kpi": "satis artimi 10%, TC artimi 5%",
          "kpiDetail": { "primary": "TC artimi", "target": "5%" },
          "riskNotes": "Meherrem dovru toy kampaniyasi verme"
        }
      ]
    }
  ],
  "totalCampaigns": 12,
  "budgetSummary": {
    "allocated": "1500 AZN",
    "perMonth": "Her ay texminen 500 AZN",
    "topCategory": "promo",
    "totalBudget": "1500 AZN",
    "breakdown": "Her ay texminen 500 AZN",
    "roiProjection": "Kampaniya bitəndə satışı əvvəlki ayla müqayisə edin"
  },
  "topRecommendations": [
    "Tovsiye 1 AZ dilinde",
    "Tovsiye 2 AZ dilinde",
    "Tovsiye 3 AZ dilinde"
  ],
  "phases": {
    "preLaunch": ["Hazirliq addimi"],
    "launch": ["Icra addimi"],
    "postLaunch": ["Olcme addimi"]
  },
  "aeoRecommendations": [
    { "action": "Google Business Profile-i yenile", "rationale": "AI search citation ucun lazimdir", "priority": "high" }
  ],
  "risksWatchout": [
    { "period": "Məhərrəm və Səfər ayları", "risk": "Toy və şənlik sifarişləri azalır", "mitigation": "Korporativ, konfrans, turist və ailə naharı paketləri" }
  ]
}

CRITICAL RULES:
1. Top-level keys MUST include: executiveSummary, context, calendar, totalCampaigns, budgetSummary, topRecommendations.
2. Do NOT add extra top-level keys like restoran, konsept, seher, budce, tovsiyeler, ahilik_hikmeti.
3. Do NOT use Azerbaijani or snake_case keys like kampaniya_takvimi, kampaniyalar, umumi_budce_xulasesi.
4. "calendar" MUST be an array, NOT an object.
5. Each calendar entry MUST have "month" as a number, "monthName" as a string, and "campaigns" as an array.
6. Campaign keys MUST include legacy quick-view keys: name, type, startDay, endDay, description, budget, channel, kpi.
7. Campaign "type" MUST be one of: bayram, movsum, event, promo, community.
8. "startDay" and "endDay" MUST be numbers, NOT dates and NOT strings.
9. "channel" MUST be a string, NOT an array.
10. "budgetSummary" MUST include legacy keys: allocated, perMonth, topCategory.
11. "totalCampaigns" MUST be a number, NOT a string.
12. "topRecommendations" MUST contain 3 to 5 strings.
13. Every campaign MUST include "methodology" and "targetSegment"; "doganRule" is strongly recommended.
14. Add "aeoRecommendations" and "risksWatchout" when relevant, especially for Meherrem/Sefer.
15. Content values should be in Azerbaijani with correct letters (ə, ı, ö, ü, ç, ş, ğ). Only JSON key names are English.
16. Return ONLY the JSON object. No markdown, no explanation.
`;

function buildUserPrompt(input: z.infer<typeof InputSchema>): string {
  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
  const selected = input.targetMonths.map((m) => monthNames[m - 1]).join(', ');

  return `Restoran: ${input.restaurantName}
Konsept: ${input.concept}
Şəhər: ${input.city}
İl: ${new Date().getFullYear()}
Seçilmiş aylar: ${selected}
${input.annualBudget ? `İllik büdcə: ${input.annualBudget} AZN` : 'Büdcə: verilməyib (məbləğ yazma)'}
${input.localEvents ? `Yerli xüsusi günlər: ${input.localEvents}` : ''}

Bu aylar üçün kampaniya təqvimi yarat. JSON formatında ver.`;
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
          system: `${buildBrainContext('sezon-planlama')}\n\n=== TASK ===\n${SYSTEM_PROMPT}\n${strictJsonSchemaInstruction(new Date().getFullYear())}`,
          prompt: buildUserPrompt(input),
          maxTokens: 5000,
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
