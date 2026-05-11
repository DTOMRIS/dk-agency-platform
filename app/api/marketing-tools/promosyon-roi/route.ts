import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';
import { callAIJson } from '@/lib/ai-router';
import { db } from '@/lib/db';
import { marketingToolRuns } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// ── SCHEMAS ─────────────────────────────────────────────────────────

const InputSchema = z.object({
  promoName: z.string().min(2).max(100),
  promoDurationDays: z.number().int().min(1).max(90),

  baseline: z.object({
    totalSales: z.number().min(0),
    transactionCount: z.number().int().min(1),
    grossMarginPercent: z.number().min(0).max(100),
  }),
  promo: z.object({
    totalSales: z.number().min(0),
    transactionCount: z.number().int().min(1),
    grossMarginPercent: z.number().min(0).max(100),
    promoCost: z.number().min(0),
    marketingSpend: z.number().min(0),
  }),
  fixedCosts: z.object({
    rentPercent: z.number().min(0).max(50).default(15),
    royaltyPercent: z.number().min(0).max(20).default(0),
    adPoolPercent: z.number().min(0).max(15).default(5),
    serviceFeePercent: z.number().min(0).max(15).default(5),
  }),
  locale: z.enum(['az', 'en', 'tr', 'ru']).default('az'),
});

const AIInsightSchema = z.object({
  verdict: z.enum(['QAZANDIRDI', 'BERABERE', 'ZERER']),
  keyFindings: z.array(z.string()).min(2).max(5),
  risks: z.array(z.string()).min(1).max(3),
  recommendations: z.array(z.string()).min(1).max(3),
  ahilikQuote: z.string(),
});

// ── CALCULATOR (pure functions) ─────────────────────────────────────

function calculatePnl(
  totalSales: number,
  grossMarginPercent: number,
  fixed: z.infer<typeof InputSchema>['fixedCosts'],
  promoCost: number,
  marketingSpend: number,
) {
  const grossProfit = totalSales * (grossMarginPercent / 100);
  const foodCost = totalSales - grossProfit;
  const rent = totalSales * (fixed.rentPercent / 100);
  const royalty = totalSales * (fixed.royaltyPercent / 100);
  const adPool = totalSales * (fixed.adPoolPercent / 100);
  const serviceFee = totalSales * (fixed.serviceFeePercent / 100);
  const soi = grossProfit - rent - royalty - adPool - serviceFee - promoCost - marketingSpend;
  const soiPercent = totalSales > 0 ? (soi / totalSales) * 100 : 0;

  return {
    totalSales: r(totalSales),
    foodCost: r(foodCost),
    grossProfit: r(grossProfit),
    rent: r(rent),
    royalty: r(royalty),
    adPool: r(adPool),
    serviceFee: r(serviceFee),
    promoCost: r(promoCost),
    marketingSpend: r(marketingSpend),
    SOI: r(soi),
    SOIPercent: r(soiPercent),
  };
}

function r(n: number) { return Math.round(n * 100) / 100; }

function calculateAll(input: z.infer<typeof InputSchema>) {
  const { baseline, promo, fixedCosts } = input;

  const baseAvgTicket = baseline.totalSales / baseline.transactionCount;
  const promoAvgTicket = promo.totalSales / promo.transactionCount;

  // Weekly comparison
  const weeklyComparison = {
    salesUplift: r(promo.totalSales - baseline.totalSales),
    salesUpliftPercent: r(((promo.totalSales - baseline.totalSales) / baseline.totalSales) * 100),
    tcUplift: promo.transactionCount - baseline.transactionCount,
    tcUpliftPercent: r(((promo.transactionCount - baseline.transactionCount) / baseline.transactionCount) * 100),
    avgTicketChange: r(promoAvgTicket - baseAvgTicket),
    avgTicketChangePercent: r(((promoAvgTicket - baseAvgTicket) / baseAvgTicket) * 100),
    grossMarginChange: r(promo.grossMarginPercent - baseline.grossMarginPercent),
  };

  // P&L
  const baselinePnl = calculatePnl(baseline.totalSales, baseline.grossMarginPercent, fixedCosts, 0, 0);
  const promoPnl = calculatePnl(promo.totalSales, promo.grossMarginPercent, fixedCosts, promo.promoCost, promo.marketingSpend);

  // Incremental
  const totalPromoInvestment = promo.promoCost + promo.marketingSpend;
  const incrementalSales = promo.totalSales - baseline.totalSales;
  const incrementalGrossProfit = promoPnl.grossProfit - baselinePnl.grossProfit;
  const incrementalSOI = promoPnl.SOI - baselinePnl.SOI;
  const roi = totalPromoInvestment > 0 ? r(((incrementalSOI) / totalPromoInvestment) * 100) : 0;

  const contribMarginRate = (promo.grossMarginPercent - fixedCosts.rentPercent - fixedCosts.adPoolPercent - fixedCosts.serviceFeePercent - fixedCosts.royaltyPercent) / 100;
  const breakEvenIncrementalSales = contribMarginRate > 0 ? r(totalPromoInvestment / contribMarginRate) : 0;

  const incremental = {
    incrementalSales: r(incrementalSales),
    incrementalGrossProfit: r(incrementalGrossProfit),
    incrementalSOI: r(incrementalSOI),
    totalPromoInvestment: r(totalPromoInvestment),
    ROI: roi,
    breakEvenIncrementalSales,
  };

  // Monthly projection (x4)
  const weeksInDuration = input.promoDurationDays / 7;
  const multiplier = weeksInDuration > 0 ? 4 / weeksInDuration : 4;
  const monthlyProjection = {
    note: 'Yalniz texmin — real performans hava, movsum, reqib aksiyalarindan asilidir',
    estimatedMonthlySalesUplift: r(weeklyComparison.salesUplift * multiplier),
    estimatedMonthlySOIUplift: r(incrementalSOI * multiplier),
    estimatedMonthlyROI: roi,
    breakEvenWeeks: incrementalSOI > 0 ? r(totalPromoInvestment / incrementalSOI) : 0,
  };

  return { weeklyComparison, pnl: { baseline: baselinePnl, promo: promoPnl }, incremental, monthlyProjection };
}

// ── AI PROMPT ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Sen bir HoReCa pazarlama analitiksən. Restoran sahibi bir kampaniya keçirdi ve nəticələri sənə göndərir.

1. QAZANDIRDI/BERABERE/ZERER qerarini ver (SOI artimina esasen)
2. 3-5 esas tapinti (key findings) yaz — reqemlere esaslanan
3. 2-3 risk goster — gelecek kampaniyalar ucun xeberdarlia
4. 2-3 tovsiye yaz — kampaniyani nece yaxsilasdipmaq olar
5. Ahilik enenelerinden bir hikmet sozu elave et

MUHUM:
- Hec bir reqemi uydurma. Sene verilen reqemlerle danis.
- Avg ticket azaldisa amma TC artdisa, "endirim guclu isleyib, amma margin sixisdi" de
- TC azaldisa, "kampaniya yeni musteri cekmedi" de
- ROI menfi olarsa, "bu kampaniya finansal menada zerer etdi" de

Cavabi JSON formatinda ver:
{
  "verdict": "QAZANDIRDI | BERABERE | ZERER",
  "keyFindings": ["...", "..."],
  "risks": ["...", "..."],
  "recommendations": ["...", "..."],
  "ahilikQuote": "..."
}`;

// ── POST ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const access = await checkToolAccess(auth.userId, 'promosyon-roi', auth.role);
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.reason, requiredTier: 'requiredTier' in access ? access.requiredTier : null },
        { status: 403 },
      );
    }

    const body = await req.json();
    const input = InputSchema.parse(body);

    if (!db) return NextResponse.json({ error: 'database-unavailable' }, { status: 503 });

    // Pure calculation (no AI needed)
    const calcResult = calculateAll(input);

    // DB pending row
    const [run] = await db
      .insert(marketingToolRuns)
      .values({ userId: auth.userId, toolSlug: 'promosyon-roi', inputData: input, status: 'pending', locale: input.locale })
      .returning();

    // AI insight
    let aiInsight: z.infer<typeof AIInsightSchema>;
    let aiMeta = { provider: 'deepseek', tokensUsed: 0, costAzn: 0 };

    try {
      const aiResult = await callAIJson<unknown>(
        {
          system: SYSTEM_PROMPT,
          prompt: `DATA:\n${JSON.stringify(calcResult, null, 2)}`,
          maxTokens: 1500,
          temperature: 0.5,
        },
        { preferProvider: 'deepseek', toolSlug: 'promosyon-roi', userId: auth.userId, locale: input.locale },
      );
      const parsed = AIInsightSchema.safeParse(aiResult.data);
      aiInsight = parsed.success ? parsed.data : {
        verdict: calcResult.incremental.incrementalSOI > 0 ? 'QAZANDIRDI' : calcResult.incremental.incrementalSOI === 0 ? 'BERABERE' : 'ZERER',
        keyFindings: ['AI analiz etdi, lakin strukturlu cavab yarada bilmedi.'],
        risks: [],
        recommendations: [],
        ahilikQuote: 'Hesabsiz is, bereketsiz qazanc.',
      };
      aiMeta = { provider: aiResult.meta.provider, tokensUsed: aiResult.meta.tokensUsed, costAzn: aiResult.meta.costAzn };
    } catch {
      aiInsight = {
        verdict: calcResult.incremental.incrementalSOI > 0 ? 'QAZANDIRDI' : 'ZERER',
        keyFindings: ['AI servisi hazirda erisilemir. Reqemsel hesablama tamdir.'],
        risks: [],
        recommendations: [],
        ahilikQuote: 'Hesabsiz is, bereketsiz qazanc.',
      };
    }

    const fullOutput = { ...calcResult, aiInsight };

    await db
      .update(marketingToolRuns)
      .set({
        outputData: fullOutput as Record<string, unknown>,
        status: 'success',
        aiProvider: aiMeta.provider,
        tokensUsed: aiMeta.tokensUsed,
        costAzn: aiMeta.costAzn,
        completedAt: new Date(),
      })
      .where(eq(marketingToolRuns.id, run.id));

    return NextResponse.json({ success: true, data: fullOutput, remainingRuns: access.remainingRuns });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'validation', issues: err.issues }, { status: 400 });
    console.error('[promosyon-roi] POST error:', err);
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
      .where(and(eq(marketingToolRuns.userId, auth.userId), eq(marketingToolRuns.toolSlug, 'promosyon-roi'), eq(marketingToolRuns.status, 'success')))
      .orderBy(desc(marketingToolRuns.createdAt)).limit(1);

    return NextResponse.json({ hasRun: !!lastRun, lastResult: lastRun?.outputData ?? null, completedAt: lastRun?.completedAt ?? null });
  } catch (err) {
    console.error('[promosyon-roi] GET error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
