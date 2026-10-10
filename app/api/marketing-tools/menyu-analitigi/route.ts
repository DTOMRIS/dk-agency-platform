import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';
import { callAIJson, isAIAbortError } from '@/lib/ai-router';
import { db } from '@/lib/db';
import { marketingToolRuns } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { classifyMenu, type MenuCategory } from '@/lib/toolkit/menu-matrix';

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

// TASK-0523: the matrix is code — Kasavana & Smith via lib/toolkit/menu-matrix (popular = ≥ 70% of the
// equal share, profitable = ≥ the sales-weighted average margin). Before, the LLM sorted the dishes and was
// told to GUESS sales and cost when missing. A dish without monthly sales or cost % is now listed under
// «needsData» instead of being placed. The AI writes only short reasons and advice.
const AiOutputSchema = z.object({
  reasons: z.array(z.object({ name: z.string(), reason: z.string() })),
  categoryTips: z.record(z.string(), z.string()),
  psychologicalPricing: z.array(z.string()),
  anchorItems: z.array(z.string()),
  topRecommendations: z.array(z.string()).min(1).max(7),
});

type MenuItemInput = z.infer<typeof MenuItemSchema>;
type QuadrantKey = 'stars' | 'plowhorses' | 'puzzles' | 'dogs';
const QUADRANT: Record<MenuCategory, QuadrantKey> = { star: 'stars', plowHorse: 'plowhorses', puzzle: 'puzzles', dog: 'dogs' };

function round(value: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function analyseMenu(items: MenuItemInput[]) {
  const complete = items.filter((m) => m.costPercent !== undefined && m.monthlySales !== undefined);
  const needsData = items.filter((m) => m.costPercent === undefined || m.monthlySales === undefined).map((m) => m.name);
  const matrix: Record<QuadrantKey, Array<{ name: string; category: string; price: number; margin?: number; reason: string }>> = {
    stars: [], plowhorses: [], puzzles: [], dogs: [],
  };
  if (complete.length >= 2) {
    const classified = classifyMenu(complete.map((m, index) => ({
      id: String(index),
      name: m.name,
      salesCount: m.monthlySales ?? 0,
      contributionMargin: m.price * (1 - (m.costPercent ?? 0) / 100),
    })));
    for (const entry of classified) {
      const item = complete[Number(entry.item.id)];
      matrix[QUADRANT[entry.category]].push({
        name: item.name,
        category: item.category,
        price: item.price,
        margin: round(100 - (item.costPercent ?? 0), 0),
        reason: '',
      });
    }
  } else {
    needsData.push(...complete.map((m) => m.name));
  }

  const categoryBalance: Record<string, { count: number; avgPrice: number; avgMargin: number; recommendation: string }> = {};
  for (const m of items) {
    const entry = categoryBalance[m.category] ?? { count: 0, avgPrice: 0, avgMargin: 0, recommendation: '' };
    entry.count += 1;
    categoryBalance[m.category] = entry;
  }
  for (const [cat, entry] of Object.entries(categoryBalance)) {
    const inCat = items.filter((m) => m.category === cat);
    const withCost = inCat.filter((m) => m.costPercent !== undefined);
    entry.avgPrice = round(inCat.reduce((sum, m) => sum + m.price, 0) / inCat.length);
    entry.avgMargin = withCost.length ? round(withCost.reduce((sum, m) => sum + (100 - (m.costPercent ?? 0)), 0) / withCost.length, 0) : 0;
  }

  const prices = items.map((m) => m.price);
  const priceSpread = round(Math.max(...prices) / Math.min(...prices), 1);
  return { matrix, needsData, categoryBalance, priceSpread };
}

// ── AI PROMPT ───────────────────────────────────────────────────────

const OUTPUT_LANGUAGE: Record<string, string> = {
  az: 'Azərbaycan dilində (düzgün hərflərlə: ə, ı, ö, ü, ç, ş, ğ)',
  ru: 'на русском языке',
  en: 'in English',
  tr: 'Türkçe',
};

function buildSystemPrompt(locale: string): string {
  return `Sən Bakıda restoranlara menyu və qiymət üzrə məsləhət verən təcrübəli mütəxəssissən.
Yeməklər artıq 4 qrupa ayrılıb (kodla, satış sayı və porsiyadan qalan qazanca görə). Qrupları dəyişmə.
Qruplar: «Qoru» (çox satılır, qazanc yüksək), «Qiymətini düzəlt» (çox satılır, qazanc az), «Tanıt» (az satılır, qazanc yüksək), «Çıxar» (az satılır, qazanc az).

Vəzifə:
1. reasons — qrupa düşən hər yemək üçün 1 qısa cümlə: nə etməli (adı dəqiq eyni yaz).
2. categoryTips — menyu bölmələri (salat, şorba və s.) üçün bir cümləlik tövsiyə; açar = bölmənin kodu.
3. psychologicalPricing — qiymət yazılışı üzrə 2-3 praktik məsləhət (məs. 9,90 əvəzinə 10, ₼ işarəsini kiçik yazmaq).
4. anchorItems — menyuda «müqayisə üçün» bahalı göstərilə biləcək yeməklərin adları (yalnız siyahıdakılardan).
5. topRecommendations — 3-7 praktik addım.

Qaydalar: sadə dil, ingiliscə termin yox (menu engineering, plowhorse, anchor, margin yazma); rəqəm və satış sayı uydurma — yalnız verilən məlumatla danış.
Halal: donuz əti və spirtli içki təklif etmə.
Bütün mətn ${OUTPUT_LANGUAGE[locale] ?? OUTPUT_LANGUAGE.az} olsun.

Cavabı YALNIZ JSON kimi ver:
{
  "reasons": [{ "name": "", "reason": "" }],
  "categoryTips": { "salat": "" },
  "psychologicalPricing": [""],
  "anchorItems": [""],
  "topRecommendations": [""]
}`;
}

const GROUP_NAME: Record<QuadrantKey, string> = { stars: 'Qoru', plowhorses: 'Qiymətini düzəlt', puzzles: 'Tanıt', dogs: 'Çıxar' };

function buildUserPrompt(input: z.infer<typeof InputSchema>, analysis: ReturnType<typeof analyseMenu>): string {
  const groups = (Object.keys(analysis.matrix) as QuadrantKey[])
    .map((q) => `${GROUP_NAME[q]}: ${analysis.matrix[q].map((m) => `${m.name} (${m.price} AZN, qazanc ${m.margin}%)`).join(', ') || '—'}`)
    .join('\n');
  const items = input.menuItems.map((m) =>
    `- ${m.name} [${m.category}] — ${m.price} AZN${m.costPercent !== undefined ? `, maya dəyəri ${m.costPercent}%` : ''}${m.monthlySales !== undefined ? `, ayda ${m.monthlySales} porsiya` : ''}`
  ).join('\n');

  return `Restoran: ${input.restaurantName}
Menyu (${input.menuItems.length} yemək):
${items}

Qruplar:
${groups}
${analysis.needsData.length ? `Məlumatı natamam (qrupa salınmayıb): ${analysis.needsData.join(', ')}` : ''}
Ən baha / ən ucuz: ${analysis.priceSpread} dəfə.

JSON-u ver.`;
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
    const analysis = analyseMenu(input.menuItems);

    if (!db) return NextResponse.json({ error: 'database-unavailable' }, { status: 503 });

    const [run] = await db
      .insert(marketingToolRuns)
      .values({ userId: auth.userId, toolSlug: 'menyu-analitik', inputData: input, status: 'pending', locale: input.locale })
      .returning();

    let aiResult: { data: unknown; meta: { provider: string; tokensUsed: number; costAzn: number } };

    try {
      aiResult = await callAIJson<unknown>(
        { system: buildSystemPrompt(input.locale), prompt: buildUserPrompt(input, analysis), maxTokens: 2000, temperature: 0.4, timeout: 50000, responseFormat: 'json_object' },
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

    const parseResult = AiOutputSchema.safeParse(aiResult.data);
    if (!parseResult.success) {
      await db.update(marketingToolRuns)
        .set({ status: 'error', errorMessage: `Output validation: ${parseResult.error.message.slice(0, 400)}`, completedAt: new Date() })
        .where(eq(marketingToolRuns.id, run.id));
      return NextResponse.json({ error: 'ai-output-invalid' }, { status: 502 });
    }

    const ai = parseResult.data;
    const reasonByName = new Map(ai.reasons.map((r) => [r.name.trim().toLowerCase(), r.reason]));
    const result = {
      matrix: Object.fromEntries(
        (Object.entries(analysis.matrix) as Array<[QuadrantKey, typeof analysis.matrix.stars]>).map(([q, list]) => [
          q,
          list.map((m) => ({ ...m, reason: reasonByName.get(m.name.trim().toLowerCase()) ?? '' })),
        ]),
      ),
      needsData: analysis.needsData,
      categoryBalance: Object.fromEntries(
        Object.entries(analysis.categoryBalance).map(([cat, info]) => [cat, { ...info, recommendation: ai.categoryTips[cat] ?? '' }]),
      ),
      pricing: { priceSpread: analysis.priceSpread, psychologicalPricing: ai.psychologicalPricing, anchorItems: ai.anchorItems },
      topRecommendations: ai.topRecommendations,
      ahilikQuote: '',
    };

    await db.update(marketingToolRuns)
      .set({
        outputData: result as Record<string, unknown>,
        status: 'success',
        aiProvider: aiResult.meta.provider,
        tokensUsed: aiResult.meta.tokensUsed,
        costAzn: aiResult.meta.costAzn,
        completedAt: new Date(),
      })
      .where(eq(marketingToolRuns.id, run.id));

    return NextResponse.json({ success: true, data: result, remainingRuns: access.remainingRuns });
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
