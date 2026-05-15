import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';
import { callAIJson } from '@/lib/ai-router';
import { db } from '@/lib/db';
import { marketingToolRuns } from '@/lib/db/schema';
import {
  buildAdWriterSystemPrompt,
  buildAdWriterUserPrompt,
} from '@/lib/ai/ad-writer-prompt-builder';

export const maxDuration = 60;

// ── RATE LIMIT (in-memory, 30/gun/user) ─────────────────────────────

const rateLimitMap = new Map<number, { count: number; resetAt: number }>();

function checkRateLimit(userId: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 86_400_000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count++;
  return true;
}

// ── SCHEMAS ─────────────────────────────────────────────────────────

const InputSchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'tiktok', 'google_ads']),
  restaurantName: z.string().max(80).optional(),
  campaignDescription: z.string().min(20).max(500),
  targetAudience: z.enum(['youth_18_30', 'family', 'corporate', 'all']).default('all'),
  callStyle: z.enum(['discount', 'new_product', 'brand_awareness', 'event']).default('brand_awareness'),
  language: z.enum(['az', 'en', 'tr', 'ru']).default('az'),
});

const VariantSchema = z.object({
  tone: z.string(),
  headline: z.string(),
  body: z.string(),
  hashtags: z.array(z.string()),
});

const OutputSchema = z.object({
  variants: z.array(VariantSchema).min(3).max(3),
});

// ── POST HANDLER ────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // 1. Auth (L-002: auth.userId, auth.role — NEVER auth.id/auth.plan)
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ error: 'not-authenticated' }, { status: 401 });
    }

    // 2. Tier gating
    const access = await checkToolAccess(auth.userId, 'reklam-yazicisi', auth.role);
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.reason, requiredTier: 'requiredTier' in access ? access.requiredTier : undefined },
        { status: 403 },
      );
    }

    // 3. Rate limit
    if (!checkRateLimit(auth.userId)) {
      return NextResponse.json({ error: 'rate-limit-exceeded' }, { status: 429 });
    }

    // 4. Input validation
    const body = await request.json();
    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'validation-error', details: parsed.error.flatten() }, { status: 400 });
    }

    const input = parsed.data;

    // 5. AI call
    const systemPrompt = buildAdWriterSystemPrompt(input);
    const userPrompt = buildAdWriterUserPrompt(input);

    const { data, meta } = await callAIJson<z.infer<typeof OutputSchema>>(
      {
        system: systemPrompt,
        prompt: userPrompt,
        maxTokens: 2000,
        temperature: 0.8,
        responseFormat: 'json_object',
      },
      {
        toolSlug: 'reklam-yazicisi',
        userId: auth.userId,
        preferProvider: 'deepseek',
      },
    );

    // 6. Validate output shape
    const validated = OutputSchema.safeParse(data);
    if (!validated.success) {
      return NextResponse.json({ error: 'ai-output-invalid' }, { status: 502 });
    }

    // 7. Save run to DB (L-002: inputData/outputData/aiProvider, NEVER input/output/provider)
    if (db) {
      await db.insert(marketingToolRuns).values({
        userId: auth.userId,
        toolSlug: 'reklam-yazicisi',
        inputData: input,
        outputData: validated.data,
        status: 'success',
        aiProvider: meta.provider,
        tokensUsed: meta.tokensUsed,
        costAzn: meta.costAzn,
        completedAt: new Date(),
        locale: input.language,
      }).catch(() => {});
    }

    return NextResponse.json({
      variants: validated.data.variants,
      meta: { provider: meta.provider, tokensUsed: meta.tokensUsed },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'ai-unavailable', message }, { status: 502 });
  }
}
