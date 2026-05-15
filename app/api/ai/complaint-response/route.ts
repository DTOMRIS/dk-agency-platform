import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';
import { callAIJson } from '@/lib/ai-router';
import { db } from '@/lib/db';
import { marketingToolRuns } from '@/lib/db/schema';
import {
  buildComplaintSystemPrompt,
  buildComplaintUserPrompt,
} from '@/lib/ai/complaint-prompt-builder';

export const maxDuration = 60;

// ── RATE LIMIT (in-memory, 20/gun/user) ─────────────────────────────

const rateLimitMap = new Map<number, { count: number; resetAt: number }>();

function checkRateLimit(userId: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 86_400_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

// ── SCHEMAS ─────────────────────────────────────────────────────────

const InputSchema = z.object({
  complaintText: z.string().min(10).max(2000),
  complaintLang: z.enum(['az', 'en', 'tr', 'ru']).default('az'),
  responseLang: z.enum(['az', 'en', 'tr', 'ru']).default('az'),
  restaurantName: z.string().max(100).optional(),
  complaintType: z.enum(['food', 'service', 'price', 'cleanliness', 'other']).default('other'),
});

const OutputSchema = z.object({
  formal: z.string(),
  friendly: z.string(),
  short: z.string(),
});

// ── POST HANDLER ────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // 1. Auth
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ error: 'not-authenticated' }, { status: 401 });
    }

    // 2. Tier gating
    const access = await checkToolAccess(auth.userId, 'sikayet-cavablandirici', auth.role);
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
    const systemPrompt = buildComplaintSystemPrompt(input);
    const userPrompt = buildComplaintUserPrompt(input);

    const { data, meta } = await callAIJson<z.infer<typeof OutputSchema>>(
      {
        system: systemPrompt,
        prompt: userPrompt,
        maxTokens: 1500,
        temperature: 0.7,
        responseFormat: 'json_object',
      },
      {
        toolSlug: 'sikayet-cavablandirici',
        userId: auth.userId,
        preferProvider: 'deepseek',
      },
    );

    // 6. Validate output shape
    const validated = OutputSchema.safeParse(data);
    if (!validated.success) {
      return NextResponse.json({ error: 'ai-output-invalid' }, { status: 502 });
    }

    // 7. Save run to DB
    if (db) {
      await db.insert(marketingToolRuns).values({
        userId: auth.userId,
        toolSlug: 'sikayet-cavablandirici',
        inputData: input,
        outputData: validated.data,
        status: 'success',
        aiProvider: meta.provider,
        tokensUsed: meta.tokensUsed,
        costAzn: meta.costAzn,
        completedAt: new Date(),
        locale: input.responseLang,
      }).catch(() => {});
    }

    return NextResponse.json({
      responses: validated.data,
      meta: { provider: meta.provider, tokensUsed: meta.tokensUsed },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'ai-unavailable', message }, { status: 502 });
  }
}
