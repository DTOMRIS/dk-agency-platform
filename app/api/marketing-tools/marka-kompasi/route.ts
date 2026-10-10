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

// TASK-0523: was «B2B SaaS positioning expert, April Dunford style» in diacritic-less Azerbaijani —
// the wrong trade for a Baku restaurant owner. JSON keys stay the same (the page reads them).
const OUTPUT_LANGUAGE: Record<string, string> = {
  az: 'Azərbaycan dilində (düzgün hərflərlə: ə, ı, ö, ü, ç, ş, ğ)',
  ru: 'на русском языке',
  en: 'in English',
  tr: 'Türkçe',
};

function buildSystemPrompt(locale: string): string {
  return `Sən Bakıda və Azərbaycanın digər şəhərlərində restoran, kafe və fast-food markalarını yerləşdirən təcrübəli marka məsləhətçisisən.
Restoran sahibinin 5 cavabından bunları çıxar:
1. icp — əsas qonaq: kimdir (who), hansı vəziyyətdə gəlir (context), hansı ehtiyacı/problemi var (painPoint)
2. valueProp — bir cümlə: qonaq niyə məhz bu restoranı seçməlidir
3. differentiators — rəqibin edə bilmədiyi 3 konkret üstünlük (sahibin cavablarına əsaslan, uydurma)
4. tagline — bir qısa şüar, menyuya, vitrinə və Instagram bio-ya yazıla bilən
5. useThisIn — bu mövqeni harada işlətmək: 3-5 konkret yer (Google Biznes təsviri, Instagram bio, menyunun üz qabığı, Wolt/Bolt Food təsviri, vitrin, kassa yanı və s.)

Qaydalar:
- Konkret yaz, ümumi söz yox («ləzzətli yemək», «keyfiyyətli xidmət» kimi boş ifadələr yazma).
- Sahibin dediyindən kənara çıxma; rəqəm, mükafat, tarix uydurma.
- Halal: donuz əti və spirtli içki təklif etmə.
- Bütün mətn ${OUTPUT_LANGUAGE[locale] ?? OUTPUT_LANGUAGE.az} olsun; ingiliscə marketinq termini (ICP, value proposition, positioning) işlətmə.

Cavabı YALNIZ keçərli JSON kimi qaytar:
{
  "icp": { "who": "...", "context": "...", "painPoint": "..." },
  "valueProp": "...",
  "differentiators": ["...", "...", "..."],
  "tagline": "...",
  "useThisIn": ["...", "...", "..."]
}`;
}

// ── PROMPT BUILDER ──────────────────────────────────────────────────

const TIME_MAP: Record<string, string> = {
  morning: 'səhər',
  lunch: 'nahar vaxtı',
  evening: 'axşam',
  'late-night': 'gecə gec saatlarda',
  all: 'bütün gün',
};

const ACTIVITY_MAP: Record<string, string> = {
  'fill-belly': 'tez və doyumlu yemək yeməyə',
  work: 'iş görüşü / işləməyə',
  celebration: 'məclis, ad günü, bayram üçün',
  relax: 'dincəlməyə',
  'third-place': 'ev ilə iş arasında oturub vaxt keçirməyə',
};

const FOOD_MAP: Record<string, string> = {
  tradition: 'ənənə, ata-baba reseptləri',
  speed: 'sürət, tez hazırlanan yemək',
  health: 'sağlam, təbii məhsul',
  exotic: 'dünya mətbəxi, fərqli dadlar',
  handcrafted: 'əl işi, yerində hazırlanan',
};

function buildUserPrompt(input: z.infer<typeof InputSchema>): string {
  return `Restoran sahibinin cavabları:

1. Qonaqlar əsasən ${TIME_MAP[input.customerTime]} gəlir.
2. Gəlmə səbəbi: ${ACTIVITY_MAP[input.customerActivity]}.
3. Yeməyin əsas hekayəsi: ${FOOD_MAP[input.foodStory]}.
4. Rəqibin edə bilmədiyi (sahibin sözləri):
${input.competitorGap}
5. Qonaqların bizi tövsiyə etmə səbəbi (sahibin sözləri): ${input.recommendReason}

Bu cavablardan icp, valueProp, differentiators, tagline və useThisIn çıxar.`;
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
          system: buildSystemPrompt(input.locale),
          prompt: userPrompt,
          maxTokens: 1500,
          temperature: 0.7,
          timeout: 40000,
          responseFormat: 'json_object',
        },
        {
          // TASK-0523: in sync with marketing-tools-config (deepseek → claude fallback).
          preferProvider: 'deepseek',
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
