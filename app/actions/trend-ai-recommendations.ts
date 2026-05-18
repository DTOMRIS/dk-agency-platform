'use server';

import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';
import { callAIJson } from '@/lib/ai-router';
import {
  calculateTrendAnalysis,
  isTrendAudience,
  isTrendRestaurantType,
  isTrendStrength,
  type TrendAudience,
  type TrendId,
  type TrendProfile,
  type TrendRestaurantType,
  type TrendStrength,
} from '@/lib/marketing-tools/trend-analiz';

export type TrendRecommendationInput = {
  restaurantType: string;
  audience: string;
  strength: string;
  locale?: string;
  forceFallback?: boolean;
};

export type TrendRecommendation = {
  trendId: TrendId;
  firstStep: string;
};

export type TrendRecommendationResult =
  | {
      ok: true;
      source: 'ai';
      recommendations: TrendRecommendation[];
    }
  | {
      ok: false;
      source: 'fallback';
      reason: 'unauthorized' | 'validation' | 'ai-unavailable';
    };

type AiTrendResponse = {
  recommendations: TrendRecommendation[];
};

function sanitizeLocale(value: string | undefined): string {
  if (value === 'en' || value === 'tr' || value === 'ru') return value;
  return 'az';
}

function sanitizeProfile(input: TrendRecommendationInput): TrendProfile | null {
  if (!isTrendRestaurantType(input.restaurantType)) return null;
  if (!isTrendAudience(input.audience)) return null;
  if (!isTrendStrength(input.strength)) return null;
  return {
    restaurantType: input.restaurantType as TrendRestaurantType,
    audience: input.audience as TrendAudience,
    strength: input.strength as TrendStrength,
  };
}

function normalizeRecommendation(
  value: unknown,
  trendIds: TrendId[],
): TrendRecommendation | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const trendId = String(item.trendId ?? '');
  const firstStep = String(item.firstStep ?? '').trim().replace(/\s+/g, ' ').slice(0, 240);
  if (!trendIds.includes(trendId as TrendId) || !firstStep) return null;
  return { trendId: trendId as TrendId, firstStep };
}

function validateAiResponse(data: unknown, trendIds: TrendId[]): TrendRecommendation[] | null {
  if (!data || typeof data !== 'object') return null;
  const raw = (data as AiTrendResponse).recommendations;
  if (!Array.isArray(raw)) return null;
  const recommendations = raw
    .map((item) => normalizeRecommendation(item, trendIds))
    .filter((item): item is TrendRecommendation => item !== null);

  if (recommendations.length !== trendIds.length) return null;
  return trendIds.map((trendId) => recommendations.find((item) => item.trendId === trendId)!);
}

function buildPrompt(profile: TrendProfile, topTrendIds: TrendId[], locale: string): string {
  return `Locale: ${locale}
Restaurant profile:
- Type: ${profile.restaurantType}
- Audience: ${profile.audience}
- Current strength: ${profile.strength}

Top 2026 trends:
${topTrendIds.map((trendId, index) => `${index + 1}. ${trendId}`).join('\n')}

Return valid JSON only:
{
  "recommendations": [
    { "trendId": "${topTrendIds[0]}", "firstStep": "one cheap, concrete first step, max 2 sentences" },
    { "trendId": "${topTrendIds[1]}", "firstStep": "one cheap, concrete first step, max 2 sentences" },
    { "trendId": "${topTrendIds[2]}", "firstStep": "one cheap, concrete first step, max 2 sentences" }
  ]
}`;
}

const SYSTEM_PROMPT = `You are a practical HoReCa marketing consultant for small restaurants in Azerbaijan.
Use Baku and regional small-business reality: low budget, small team, simple POS/WhatsApp/Instagram workflows, and quick implementation.
For each trend, provide one concrete first step that can be tried in 7 days without expensive software or renovation.
Do not mention uncertain fees, public procedures, or unsupported statistics.
Return JSON only.`;

export async function generateTrendRecommendations(
  input: TrendRecommendationInput,
): Promise<TrendRecommendationResult> {
  const auth = await getAuthFromCookie();
  if (!auth) return { ok: false, source: 'fallback', reason: 'unauthorized' };

  const access = await checkToolAccess(auth.userId, 'trend-analiz', auth.role);
  if (!access.allowed) return { ok: false, source: 'fallback', reason: 'unauthorized' };

  const profile = sanitizeProfile(input);
  if (!profile) return { ok: false, source: 'fallback', reason: 'validation' };

  if (input.forceFallback) {
    return { ok: false, source: 'fallback', reason: 'ai-unavailable' };
  }

  const locale = sanitizeLocale(input.locale);
  const analysis = calculateTrendAnalysis(profile);
  const topTrendIds = analysis.topTrends.map((trend) => trend.trendId);

  try {
    const response = await callAIJson<AiTrendResponse>(
      {
        prompt: buildPrompt(profile, topTrendIds, locale),
        system: SYSTEM_PROMPT,
        maxTokens: 700,
        temperature: 0.35,
        timeout: 18_000,
        responseFormat: 'json_object',
      },
      {
        preferProvider: 'deepseek',
        toolSlug: 'trend-analiz',
        userId: auth.userId,
        locale,
      },
    );

    const recommendations = validateAiResponse(response.data, topTrendIds);
    if (!recommendations) return { ok: false, source: 'fallback', reason: 'ai-unavailable' };

    return { ok: true, source: 'ai', recommendations };
  } catch {
    return { ok: false, source: 'fallback', reason: 'ai-unavailable' };
  }
}
