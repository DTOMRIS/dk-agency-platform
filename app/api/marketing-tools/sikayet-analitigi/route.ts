import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';
import { callAIJson, isAIAbortError } from '@/lib/ai-router';
import { db } from '@/lib/db';
import { marketingToolRuns } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import {
  computeComplaintStats,
  COMPLAINT_CATEGORIES,
  COMPLAINT_SEVERITIES,
  type ComplaintCategoryKey,
} from '@/lib/marketing-tools/complaint-stats';

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

// TASK-0523: the AI labels each complaint and writes advice; counts, shares, top category,
// urgency and the score are code (lib/marketing-tools/complaint-stats.ts). The unsourced
// «each complaint = 26 silent unhappy customers» rule and the invented Ahilik quote are gone.
const AiOutputSchema = z.object({
  labels: z.array(z.object({
    n: z.number().int(),
    category: z.enum(COMPLAINT_CATEGORIES),
    severity: z.enum(COMPLAINT_SEVERITIES),
  })),
  categoryNotes: z.array(z.object({
    category: z.enum(COMPLAINT_CATEGORIES),
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
    category: z.enum(COMPLAINT_CATEGORIES),
    template: z.string(),
  })),
});

const CATEGORY_LABEL: Record<string, Record<ComplaintCategoryKey, string>> = {
  az: { food_quality: 'Yemək keyfiyyəti', wait_speed: 'Gözləmə / sürət', service_staff: 'Xidmət / personal', cleanliness: 'Təmizlik', price_bill: 'Qiymət / hesab', delivery: 'Çatdırılma', atmosphere: 'Mühit (səs, isti, yer)', other: 'Digər' },
  ru: { food_quality: 'Качество еды', wait_speed: 'Ожидание / скорость', service_staff: 'Обслуживание / персонал', cleanliness: 'Чистота', price_bill: 'Цена / счёт', delivery: 'Доставка', atmosphere: 'Атмосфера (шум, жара, место)', other: 'Другое' },
  en: { food_quality: 'Food quality', wait_speed: 'Waiting / speed', service_staff: 'Service / staff', cleanliness: 'Cleanliness', price_bill: 'Price / bill', delivery: 'Delivery', atmosphere: 'Atmosphere (noise, heat, space)', other: 'Other' },
  tr: { food_quality: 'Yemek kalitesi', wait_speed: 'Bekleme / hız', service_staff: 'Hizmet / personel', cleanliness: 'Temizlik', price_bill: 'Fiyat / hesap', delivery: 'Teslimat', atmosphere: 'Ortam (ses, sıcak, yer)', other: 'Diğer' },
};

const OUTPUT_LANGUAGE: Record<string, string> = {
  az: 'Azərbaycan dilində (düzgün hərflərlə: ə, ı, ö, ü, ç, ş, ğ)',
  ru: 'на русском языке',
  en: 'in English',
  tr: 'Türkçe',
};

// ── AI PROMPT ───────────────────────────────────────────────────────

function buildSystemPrompt(locale: string): string {
  return `Sən Bakıda restoranlara qonaq şikayətlərini təhlil etməkdə kömək edən təcrübəli məsləhətçisən.

Vəzifə:
1. labels — HƏR şikayət üçün (n = şikayətin nömrəsi): category və severity.
   category yalnız bunlardan biri: ${COMPLAINT_CATEGORIES.join(', ')}
   severity: low (narahatlıq), medium (pis təcrübə), high (qonaq itirilir / ictimai şikayət), critical (sağlamlıq, təhlükəsizlik, yad cisim, zəhərlənmə).
2. categoryNotes — rast gəlinən hər kateqoriya üçün kök səbəb (rootCause) və konkret həll addımı (fixAction).
3. patterns — təkrarlanan mövzular (vaxt, mənbə, yemək adı). frequency sözlə yazılır (məs. «5 şikayətdən 3-ü»); rəqəmləri şikayətlərdən say, uydurma.
4. actionPlan — prioritetli plan (immediate / this-week / this-month).
5. responseTemplates — rast gəlinən kateqoriyalar üçün qonağa cavab şablonu. Kompensasiya (endirim, kupon, pulsuz yemək, geri ödəmə) VƏD ETMƏ — yalnız üzr + həll + əlaqəyə dəvət.

Qaydalar: günahlandırmadan, həll yönümlü, sadə dil; statistika, «qayda» və ya sitat uydurma.
Bütün mətn ${OUTPUT_LANGUAGE[locale] ?? OUTPUT_LANGUAGE.az} olsun.

Cavabı YALNIZ JSON kimi ver:
{
  "labels": [{ "n": 1, "category": "", "severity": "" }],
  "categoryNotes": [{ "category": "", "rootCause": "", "fixAction": "" }],
  "patterns": [{ "pattern": "", "frequency": "", "impact": "" }],
  "actionPlan": [{ "priority": "", "action": "", "expectedResult": "" }],
  "responseTemplates": [{ "category": "", "template": "" }]
}`;
}

const PERIOD_LABEL: Record<string, string> = {
  'last-week': 'son həftə',
  'last-month': 'son ay',
  'last-quarter': 'son 3 ay',
  custom: 'seçilmiş dövr',
};

function buildUserPrompt(input: z.infer<typeof InputSchema>): string {
  const list = input.complaints.map((c, i) =>
    `${i + 1}. [${c.source}${c.date ? `, ${c.date}` : ''}] ${c.text}`
  ).join('\n');

  return `Restoran: ${input.restaurantName}
Dövr: ${PERIOD_LABEL[input.period] ?? input.period}
Şikayətlər (${input.complaints.length} ədəd):
${list}

JSON-u ver.`;
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
        { system: buildSystemPrompt(input.locale), prompt: buildUserPrompt(input), maxTokens: 2500, temperature: 0.4, timeout: 50000, responseFormat: 'json_object' },
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

    const parseResult = AiOutputSchema.safeParse(aiResult.data);
    if (!parseResult.success) {
      await db.update(marketingToolRuns)
        .set({ status: 'error', errorMessage: `Output validation: ${parseResult.error.message.slice(0, 400)}`, completedAt: new Date() })
        .where(eq(marketingToolRuns.id, run.id));
      return NextResponse.json({ error: 'ai-output-invalid' }, { status: 502 });
    }

    const ai = parseResult.data;
    const stats = computeComplaintStats(
      input.complaints.length,
      ai.labels.map((l) => ({ index: l.n, category: l.category, severity: l.severity })),
    );
    const labels = CATEGORY_LABEL[input.locale] ?? CATEGORY_LABEL.az;
    const notes = new Map(ai.categoryNotes.map((note) => [note.category, note]));
    const result = {
      summary: {
        totalComplaints: stats.total,
        topCategory: stats.topCategory ? labels[stats.topCategory] : '-',
        sentimentScore: stats.lightnessScore,
        urgencyLevel: stats.urgencyLevel,
      },
      categories: stats.categories.map((cat) => ({
        name: labels[cat.key],
        count: cat.count,
        percentage: cat.percentage,
        examples: cat.indexes.slice(0, 2).map((n) => input.complaints[n - 1].text.slice(0, 140)),
        rootCause: notes.get(cat.key)?.rootCause ?? '',
        fixAction: notes.get(cat.key)?.fixAction ?? '',
      })),
      patterns: ai.patterns,
      actionPlan: ai.actionPlan,
      responseTemplates: ai.responseTemplates.map((tmpl) => ({ forCategory: labels[tmpl.category], template: tmpl.template })),
      ahilikQuote: '',
    };

    await db.update(marketingToolRuns)
      .set({
        outputData: result as Record<string, unknown>,
        status: 'success', aiProvider: aiResult.meta.provider,
        tokensUsed: aiResult.meta.tokensUsed, costAzn: aiResult.meta.costAzn, completedAt: new Date(),
      })
      .where(eq(marketingToolRuns.id, run.id));

    return NextResponse.json({ success: true, data: result, remainingRuns: access.remainingRuns });
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
