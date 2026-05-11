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
  revenue: z.number().min(0),
  foodCost: z.number().min(0),
  packaging: z.number().min(0).default(0),
  staffCost: z.number().min(0),
  management: z.number().min(0).default(0),
  advertising: z.number().min(0).default(0),
  promo: z.number().min(0).default(0),
  outsource: z.number().min(0).default(0),
  uniform: z.number().min(0).default(0),
  supplies: z.number().min(0).default(0),
  repair: z.number().min(0).default(0),
  utilities: z.number().min(0).default(0),
  otherControllable: z.number().min(0).default(0),
  rent: z.number().min(0),
  accounting: z.number().min(0).default(0),
  insurance: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  depreciation: z.number().min(0).default(0),
  locale: z.enum(['az', 'en', 'tr', 'ru']).default('az'),
});

const AIInsightSchema = z.object({
  verdict: z.enum(['SAGLAM', 'DIQQET', 'KRITIK']),
  keyFindings: z.array(z.string()).min(2).max(5),
  risks: z.array(z.string()).min(1).max(3),
  recommendations: z.array(z.string()).min(2).max(5),
  benchmarkComparison: z.object({
    foodCostStatus: z.string(),
    laborCostStatus: z.string(),
    rentStatus: z.string(),
    netProfitStatus: z.string(),
  }),
  ahilikQuote: z.string(),
});

// ── P&L CALCULATOR (mövcud formula-lar, dəyişmədən) ────────────────

function calculatePnl(input: z.infer<typeof InputSchema>) {
  const { revenue, foodCost, packaging, staffCost, management, advertising, promo,
    outsource, uniform, supplies, repair, utilities, otherControllable,
    rent, accounting, insurance, tax, depreciation } = input;

  const cogs = foodCost + packaging;
  const operatingProfit = revenue - cogs;
  const controllable = staffCost + management + advertising + promo + outsource + uniform + supplies + repair + utilities + otherControllable;
  const controllableProfit = operatingProfit - controllable;
  const uncontrollable = rent + accounting + insurance + tax + depreciation;
  const netProfit = controllableProfit - uncontrollable;
  const primeCost = foodCost + staffCost + management;

  const pct = (v: number) => revenue > 0 ? Math.round((v / revenue) * 1000) / 10 : 0;

  return {
    revenue,
    cogs, cogsPercent: pct(cogs),
    operatingProfit, operatingProfitPercent: pct(operatingProfit),
    controllable, controllablePercent: pct(controllable),
    controllableProfit, controllableProfitPercent: pct(controllableProfit),
    uncontrollable, uncontrollablePercent: pct(uncontrollable),
    netProfit, netProfitPercent: pct(netProfit),
    primeCost, primeCostPercent: pct(primeCost),
    foodCostPercent: pct(foodCost),
    laborCostPercent: pct(staffCost + management),
    rentPercent: pct(rent),
  };
}

// ── AI PROMPT ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Sen bir HoReCa maliyye meslehetcisisen. Restoran sahibi P&L hesablamasinin neticelerini sene verir.

1. Saglamliq qiymetlendirmesi: SAGLAM / DIQQET / KRITIK
2. 3-5 esas tapinti (key findings) — reqemlere esaslanan
3. 2-3 risk (gelecek tehlukeler)
4. 3-5 konkret tovsiye
5. Senaye benchmark muqayisesi:
   - Food cost: 28-35% saglam
   - Labor cost: 25-32% saglam
   - Rent: 8-15% saglam (>20% kritik)
   - Net profit: 8-15% saglam, >15% ela, <5% kritik
6. Ahilik hikmeti

MUHUM: Reqem uydurma, verilen datayla danis.

Cavabi JSON formatinda ver:
{
  "verdict": "SAGLAM | DIQQET | KRITIK",
  "keyFindings": ["...", "..."],
  "risks": ["...", "..."],
  "recommendations": ["...", "..."],
  "benchmarkComparison": {
    "foodCostStatus": "...",
    "laborCostStatus": "...",
    "rentStatus": "...",
    "netProfitStatus": "..."
  },
  "ahilikQuote": "..."
}`;

// ── POST ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const access = await checkToolAccess(auth.userId, 'pnl-simulator', auth.role);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason, requiredTier: 'requiredTier' in access ? access.requiredTier : null }, { status: 403 });
    }

    const body = await req.json();
    const input = InputSchema.parse(body);

    if (!db) return NextResponse.json({ error: 'database-unavailable' }, { status: 503 });

    const pnlResult = calculatePnl(input);

    const [run] = await db.insert(marketingToolRuns)
      .values({ userId: auth.userId, toolSlug: 'pnl-simulator', inputData: input, status: 'pending', locale: input.locale })
      .returning();

    let aiInsight: z.infer<typeof AIInsightSchema>;
    let aiMeta = { provider: 'deepseek', tokensUsed: 0, costAzn: 0 };

    try {
      const aiResult = await callAIJson<unknown>(
        { system: SYSTEM_PROMPT, prompt: `P&L NETICELERI:\n${JSON.stringify(pnlResult, null, 2)}`, maxTokens: 1500, temperature: 0.5 },
        { preferProvider: 'deepseek', toolSlug: 'pnl-simulator', userId: auth.userId, locale: input.locale },
      );
      const parsed = AIInsightSchema.safeParse(aiResult.data);
      aiInsight = parsed.success ? parsed.data : {
        verdict: pnlResult.netProfitPercent >= 8 ? 'SAGLAM' : pnlResult.netProfitPercent >= 3 ? 'DIQQET' : 'KRITIK',
        keyFindings: ['AI strukturlu cavab yarada bilmedi. Reqemsel hesablama tamdir.'],
        risks: [], recommendations: [],
        benchmarkComparison: { foodCostStatus: `${pnlResult.foodCostPercent}%`, laborCostStatus: `${pnlResult.laborCostPercent}%`, rentStatus: `${pnlResult.rentPercent}%`, netProfitStatus: `${pnlResult.netProfitPercent}%` },
        ahilikQuote: 'Hesabsiz is, bereketsiz qazanc.',
      };
      aiMeta = { provider: aiResult.meta.provider, tokensUsed: aiResult.meta.tokensUsed, costAzn: aiResult.meta.costAzn };
    } catch {
      aiInsight = {
        verdict: pnlResult.netProfitPercent >= 8 ? 'SAGLAM' : pnlResult.netProfitPercent >= 3 ? 'DIQQET' : 'KRITIK',
        keyFindings: ['AI servisi hazirda erisilemir.'], risks: [], recommendations: [],
        benchmarkComparison: { foodCostStatus: `${pnlResult.foodCostPercent}%`, laborCostStatus: `${pnlResult.laborCostPercent}%`, rentStatus: `${pnlResult.rentPercent}%`, netProfitStatus: `${pnlResult.netProfitPercent}%` },
        ahilikQuote: 'Hesabsiz is, bereketsiz qazanc.',
      };
    }

    const fullOutput = { pnl: pnlResult, aiInsight };

    await db.update(marketingToolRuns)
      .set({ outputData: fullOutput as Record<string, unknown>, status: 'success', aiProvider: aiMeta.provider, tokensUsed: aiMeta.tokensUsed, costAzn: aiMeta.costAzn, completedAt: new Date() })
      .where(eq(marketingToolRuns.id, run.id));

    return NextResponse.json({ success: true, data: fullOutput, remainingRuns: access.remainingRuns });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'validation', issues: err.issues }, { status: 400 });
    console.error('[pnl-simulator] POST error:', err);
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
      .where(and(eq(marketingToolRuns.userId, auth.userId), eq(marketingToolRuns.toolSlug, 'pnl-simulator'), eq(marketingToolRuns.status, 'success')))
      .orderBy(desc(marketingToolRuns.createdAt)).limit(1);

    return NextResponse.json({ hasRun: !!lastRun, lastResult: lastRun?.outputData ?? null, completedAt: lastRun?.completedAt ?? null });
  } catch (err) {
    console.error('[pnl-simulator] GET error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
