import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';
import { callAIJson, isAIAbortError } from '@/lib/ai-router';
import { db } from '@/lib/db';
import { marketingToolRuns } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { computeKstScores, KST_CATEGORIES, KST_TARGET_PCT, type KstWeakItem } from '@/lib/marketing-tools/kst-score';

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

// TASK-0523: the AI only writes words. Scores, the weakest answers and the target come from code
// (lib/marketing-tools/kst-score.ts); before, the LLM summed 30 answers and invented a «sector norm».
const AiOutputSchema = z.object({
  issues: z.array(z.object({
    questionId: z.string(),
    rootCause: z.string(),
    weekFixStep: z.string(),
  })).max(5),
  actionPlan: z.object({
    week1: z.object({ title: z.string(), steps: z.array(z.string()) }),
    week2: z.object({ title: z.string(), steps: z.array(z.string()) }),
    week3to4: z.object({ title: z.string(), steps: z.array(z.string()) }),
  }),
  encouragement: z.string(),
});

// ── SYSTEM PROMPT ───────────────────────────────────────────────────

const OUTPUT_LANGUAGE: Record<string, string> = {
  az: 'Azərbaycan dilində (düzgün hərflərlə: ə, ı, ö, ü, ç, ş, ğ)',
  ru: 'на русском языке',
  en: 'in English',
  tr: 'Türkçe',
};

function buildSystemPrompt(locale: string): string {
  return `Sən Bakıda restoranlara keyfiyyət, xidmət və təmizlik üzrə məsləhət verən təcrübəli əməliyyat məsləhətçisisən.
Restoran sahibi 30 sual üzrə özünü 1-5 balla qiymətləndirib. Ballar və ən zəif cavablar artıq hesablanıb — rəqəmləri dəyişmə, yenidən hesablama.

Sənin işin:
1. issues — sənə verilən hər zəif sual üçün (questionId eyni qalsın):
   - rootCause: ehtimal olunan kök səbəb, 1 cümlə, heç kimi günahlandırmadan
   - weekFixStep: 1 həftədə edilə bilən konkret addım
2. actionPlan — 30 günlük plan, 3 mərhələ:
   - week1: ən zəif suala tez həll
   - week2: iş qaydasının dəyişdirilməsi
   - week3to4: davamlı nəzarət (yoxlama cədvəli, məsul şəxs, qısa təlim)
3. encouragement — 1 cümlə ruhlandırıcı söz (sitat və ya «atalar sözü» uydurma)

Qaydalar: sadə dil, ingiliscə termin yox (KPI, audit checklist əvəzinə «yoxlama cədvəli»), rəqəm və standart adı uydurma.
Bütün mətn ${OUTPUT_LANGUAGE[locale] ?? OUTPUT_LANGUAGE.az} olsun.

Cavabı YALNIZ keçərli JSON kimi qaytar:
{
  "issues": [{ "questionId": "", "rootCause": "", "weekFixStep": "" }],
  "actionPlan": {
    "week1": { "title": "", "steps": [] },
    "week2": { "title": "", "steps": [] },
    "week3to4": { "title": "", "steps": [] }
  },
  "encouragement": ""
}`;
}

// ── PROMPT BUILDER ──────────────────────────────────────────────────

const GROUP_LABEL: Record<string, string> = { quality: 'Keyfiyyət', service: 'Servis', cleanliness: 'Təmizlik' };

function buildUserPrompt(
  input: z.infer<typeof InputSchema>,
  scores: Record<string, number>,
  weakest: Array<KstWeakItem & { text: string }>,
): string {
  const groups = KST_CATEGORIES.map((c) => `${GROUP_LABEL[c]}: ${scores[c]}%`).join(', ');
  const weak = weakest.length
    ? weakest.map((w) => `- ${w.questionId} (${GROUP_LABEL[w.category]}): «${w.text}» — ${w.score}/5`).join('\n')
    : '- Zəif cavab yoxdur (bütün cavablar 4-5). Plan mövcud səviyyəni qorumağa yönəlsin.';

  return `Qrup balları: ${groups}. Ümumi: ${scores.overall}%. Hədəf: hər qrup ${KST_TARGET_PCT}%.

Ən zəif cavablar:
${weak}

${input.notes ? `Sahibin əlavə qeydi: ${input.notes}` : ''}

JSON-u ver.`;
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
    const { scores, weakest } = computeKstScores(input);
    const tq = await getTranslations({ locale: input.locale, namespace: 'mqForms.kst.questions' });
    const weakWithText = weakest.map((w) => ({ ...w, text: tq(w.questionId) }));

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
          system: buildSystemPrompt(input.locale),
          prompt: buildUserPrompt(input, scores, weakWithText),
          maxTokens: 2000,
          temperature: 0.5,
          timeout: 50000,
          responseFormat: 'json_object',
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

    const parseResult = AiOutputSchema.safeParse(aiResult.data);
    if (!parseResult.success) {
      await db
        .update(marketingToolRuns)
        .set({ status: 'error', errorMessage: `Output validation: ${parseResult.error.message.slice(0, 400)}`, completedAt: new Date() })
        .where(eq(marketingToolRuns.id, run.id));
      return NextResponse.json({ error: 'ai-output-invalid' }, { status: 502 });
    }

    const aiIssues = new Map(parseResult.data.issues.map((issue) => [issue.questionId, issue]));
    const result = {
      scores,
      industryBenchmark: { quality: KST_TARGET_PCT, service: KST_TARGET_PCT, cleanliness: KST_TARGET_PCT, overall: KST_TARGET_PCT },
      topIssues: weakWithText.map((w) => ({
        category: w.category,
        questionId: w.questionId,
        questionText: w.text,
        score: w.score,
        rootCause: aiIssues.get(w.questionId)?.rootCause ?? '',
        weekFixStep: aiIssues.get(w.questionId)?.weekFixStep ?? '',
      })),
      actionPlan: parseResult.data.actionPlan,
      ahilikQuote: '',
      encouragement: parseResult.data.encouragement,
    };

    await db
      .update(marketingToolRuns)
      .set({
        outputData: result as Record<string, unknown>,
        status: 'success',
        aiProvider: aiResult.meta.provider,
        tokensUsed: aiResult.meta.tokensUsed,
        costAzn: aiResult.meta.costAzn,
        completedAt: new Date(),
      })
      .where(eq(marketingToolRuns.id, run.id));

    return NextResponse.json({
      success: true,
      data: result,
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
