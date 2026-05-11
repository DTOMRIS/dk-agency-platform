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
  restaurantName: z.string().min(2).max(100),
  concept: z.enum(['fast-food', 'fine-dining', 'cafe', 'fast-casual', 'fine-casual', 'pub', 'traditional', 'other']),
  city: z.string().min(2).max(50),
  targetSegment: z.enum(['families', 'young-professionals', 'students', 'tourists', 'business', 'seniors', 'mixed']),
  avgTicket: z.number().min(1).optional(),
  peakHours: z.enum(['morning', 'lunch', 'evening', 'late-night', 'all']),
  observations: z.string().max(500).optional().default(''),
  locale: z.enum(['az', 'en', 'tr', 'ru']).default('az'),
});

const PersonaSchema = z.object({
  name: z.string(),
  age: z.string(),
  occupation: z.string(),
  income: z.string(),
  lifestyle: z.string(),
  visitFrequency: z.string(),
  avgSpend: z.string(),
  motivations: z.array(z.string()),
  painPoints: z.array(z.string()),
  channels: z.array(z.string()),
  quote: z.string(),
});

const OutputSchema = z.object({
  primaryPersona: PersonaSchema,
  secondaryPersona: PersonaSchema,
  antiPersona: z.object({
    description: z.string(),
    whyNot: z.string(),
  }),
  marketingTips: z.array(z.object({
    channel: z.string(),
    message: z.string(),
    timing: z.string(),
  })),
  menuSuggestions: z.array(z.string()),
  ahilikQuote: z.string(),
});

// ── AI PROMPT ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Sen bir HoReCa musteri segmentasiya ekspertisen. Restoran sahibi sene oz restorani haqqinda melumat verir, senin isin ideal musteri personalarini yaratmaqdir.

VEZIVEN:
1. PRIMARY PERSONA — en cox gelen, en cox xerc eden ideal musteri
   - Ad (AZ adi), yas araligi, pes, gelir seviyyesi, heyat terzi
   - Ziyaret tezliyi, ortalama xerc
   - 3 motivasiya (niye gelir)
   - 3 pain point (neden narazidir)
   - 3 kanal (hardan xeber alir)
   - 1 cumle sitat ("Men bu restorana gelerin cunki...")

2. SECONDARY PERSONA — ikinci hedef qrup (potensial artim)
   - Eyni format

3. ANTI-PERSONA — bu restoran ucun UYGUN OLMAYAN musteri
   - Kim ve niye gelmemeli (resurs itkisinin qarsisini almaq)

4. MARKETING TIPS — her persona ucun 3 kanal+mesaj+zaman tovsiyesi

5. MENU SUGGESTIONS — persona-ya uygun 3-5 menyu tovsiyesi

6. Ahilik hikmeti

MUHUM:
- Azerbaycan/Turkiye konteksti (yas, gelir, heyat terzi yerli)
- Konkret ad, yas, pes ver — abstrakt "25-35 yas qadin" yox, "Leyla, 32, HR meneceri" kimi
- Anti-persona suclama deyil, resurs optimizasiyasidir

Cavabi JSON formatinda ver.`;

function buildUserPrompt(input: z.infer<typeof InputSchema>): string {
  return `RESTORAN: ${input.restaurantName}
KONSEPT: ${input.concept}
SEHER: ${input.city}
HEDEF SEGMENT: ${input.targetSegment}
${input.avgTicket ? `ORTALAMA HESAB: ${input.avgTicket} AZN` : ''}
PIK SAATLAR: ${input.peakHours}
${input.observations ? `ELAVE MUSAHIDE: ${input.observations}` : ''}

Bu melumatlardan 2 persona + 1 anti-persona + marketing tips + menu suggestions yarat. JSON formatinda ver.`;
}

// ── POST ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const access = await checkToolAccess(auth.userId, 'musteri-persona', auth.role);
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
      .values({ userId: auth.userId, toolSlug: 'musteri-persona', inputData: input, status: 'pending', locale: input.locale })
      .returning();

    let aiResult: { data: unknown; meta: { provider: string; tokensUsed: number; costAzn: number } };

    try {
      aiResult = await callAIJson<unknown>(
        { system: SYSTEM_PROMPT, prompt: buildUserPrompt(input), maxTokens: 2500, temperature: 0.7 },
        { preferProvider: 'deepseek', toolSlug: 'musteri-persona', userId: auth.userId, locale: input.locale },
      );
    } catch (aiErr) {
      await db.update(marketingToolRuns)
        .set({ status: 'error', errorMessage: String(aiErr).slice(0, 500), completedAt: new Date() })
        .where(eq(marketingToolRuns.id, run.id));
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
    console.error('[musteri-persona] POST error:', err);
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
      .where(and(eq(marketingToolRuns.userId, auth.userId), eq(marketingToolRuns.toolSlug, 'musteri-persona'), eq(marketingToolRuns.status, 'success')))
      .orderBy(desc(marketingToolRuns.createdAt)).limit(1);

    return NextResponse.json({ hasRun: !!lastRun, lastResult: lastRun?.outputData ?? null, completedAt: lastRun?.completedAt ?? null });
  } catch (err) {
    console.error('[musteri-persona] GET error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
