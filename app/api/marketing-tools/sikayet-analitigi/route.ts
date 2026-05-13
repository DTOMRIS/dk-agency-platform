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

const ComplaintSchema = z.object({
  text: z.string().min(5).max(500),
  source: z.enum(['google', '2gis', 'instagram', 'whatsapp', 'verbal', 'other']),
  date: z.string().optional(),
});

const InputSchema = z.object({
  restaurantName: z.string().min(2).max(100),
  complaints: z.array(ComplaintSchema).min(3, 'En az 3 sikayet lazimdir').max(30),
  period: z.enum(['last-week', 'last-month', 'last-quarter', 'custom']),
  locale: z.enum(['az', 'en', 'tr', 'ru']).default('az'),
});

const OutputSchema = z.object({
  summary: z.object({
    totalComplaints: z.number(),
    topCategory: z.string(),
    sentimentScore: z.number().min(0).max(100),
    urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']),
  }),
  categories: z.array(z.object({
    name: z.string(),
    count: z.number(),
    percentage: z.number(),
    examples: z.array(z.string()),
    rootCause: z.string(),
    fixAction: z.string(),
  })),
  patterns: z.array(z.object({
    pattern: z.string(),
    frequency: z.string(),
    impact: z.string(),
  })),
  actionPlan: z.array(z.object({
    priority: z.enum(['immediate', 'this-week', 'this-month']),
    action: z.string(),
    expectedResult: z.string(),
  })),
  responseTemplates: z.array(z.object({
    forCategory: z.string(),
    template: z.string(),
  })),
  ahilikQuote: z.string(),
});

// ── AI PROMPT ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Sen bir HoReCa musteri deneyimi analitiksisen. Restoran sahibi sene musteri sikayetlerini verir, senin isin bunlari tehlil etmekdir.

VEZIVEN:
1. Sikayetleri kateqoriyalara bol (yemek keyfiyyeti, servis surati, temizlik, qiymet, atmosfer, diger)
2. Her kateqoriya ucun: say, faiz, numune sikayetler, kok sebeb, hell addimi
3. Pattern-ler tap: tekrarlanan temalar, vaxt pattern-i, menbe pattern-i
4. Prioritetli hell plani yaz (immediate / this-week / this-month)
5. Her kateqoriya ucun cavab sablonu ver (restoran sahibi kopyalayib istifade ede biler)
6. Ahilik enenelerinden hikmet sozu

MUHUM:
- "26 sessiz narazı musteri" qaydasini xatırlat — her sikayet 26 sessiz narazini temsil edir
- Suclama yox, hell yonumlu ton
- Konkret, olculebilen addimlar tovsiye et
- Cavab sablonlari hormetli, empatik ve hell-yonumlu olsun

Cavabi JSON formatinda ver:
{
  "summary": { "totalComplaints": 0, "topCategory": "", "sentimentScore": 0, "urgencyLevel": "" },
  "categories": [{ "name": "", "count": 0, "percentage": 0, "examples": [], "rootCause": "", "fixAction": "" }],
  "patterns": [{ "pattern": "", "frequency": "", "impact": "" }],
  "actionPlan": [{ "priority": "", "action": "", "expectedResult": "" }],
  "responseTemplates": [{ "forCategory": "", "template": "" }],
  "ahilikQuote": ""
}`;

function buildUserPrompt(input: z.infer<typeof InputSchema>): string {
  const list = input.complaints.map((c, i) =>
    `${i + 1}. [${c.source}${c.date ? `, ${c.date}` : ''}] ${c.text}`
  ).join('\n');

  return `RESTORAN: ${input.restaurantName}
DOVRESI: ${input.period}
SIKAYETLER (${input.complaints.length} eded):
${list}

JSON formatinda tam tehlil ver.`;
}

// ── POST ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const access = await checkToolAccess(auth.userId, 'sikayet-analitigi', auth.role);
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
      .values({ userId: auth.userId, toolSlug: 'sikayet-analitigi', inputData: input, status: 'pending', locale: input.locale })
      .returning();

    let aiResult: { data: unknown; meta: { provider: string; tokensUsed: number; costAzn: number } };

    try {
      aiResult = await callAIJson<unknown>(
        { system: SYSTEM_PROMPT, prompt: buildUserPrompt(input), maxTokens: 2500, temperature: 0.5, timeout: 55000 },
        { preferProvider: 'deepseek', toolSlug: 'sikayet-analitigi', userId: auth.userId, locale: input.locale },
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
        status: 'success', aiProvider: aiResult.meta.provider,
        tokensUsed: aiResult.meta.tokensUsed, costAzn: aiResult.meta.costAzn, completedAt: new Date(),
      })
      .where(eq(marketingToolRuns.id, run.id));

    return NextResponse.json({ success: true, data: parseResult.data, remainingRuns: access.remainingRuns });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'validation', issues: err.issues }, { status: 400 });
    console.error('[sikayet-analitigi] POST error:', err);
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
      .where(and(eq(marketingToolRuns.userId, auth.userId), eq(marketingToolRuns.toolSlug, 'sikayet-analitigi'), eq(marketingToolRuns.status, 'success')))
      .orderBy(desc(marketingToolRuns.createdAt)).limit(1);

    return NextResponse.json({ hasRun: !!lastRun, lastResult: lastRun?.outputData ?? null, completedAt: lastRun?.completedAt ?? null });
  } catch (err) {
    console.error('[sikayet-analitigi] GET error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
