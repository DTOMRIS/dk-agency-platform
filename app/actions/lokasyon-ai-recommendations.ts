'use server';

import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';
import { callAIJson } from '@/lib/ai-router';
import {
  calculateLocationAnalysis,
  DEFAULT_ANSWERS,
  DEFAULT_BREAKEVEN,
  isLocationMode,
  isLocationType,
  isRiskFlag,
  type AnswerValue,
  type LocationCriterionId,
  type LocationMode,
  type LocationProfile,
  type LocationType,
  type RiskFlagId,
} from '@/lib/marketing-tools/lokasyon-analiz';

export type LokasyonRecommendationInput = {
  mode: string;
  locationType: string;
  answers: Partial<Record<LocationCriterionId, number>>;
  riskFlags?: string[];
  breakeven?: Partial<Record<keyof typeof DEFAULT_BREAKEVEN, number>>;
  locale?: string;
  forceFallback?: boolean;
};

export type LokasyonRecommendationResult =
  | {
      ok: true;
      source: 'ai';
      recommendations: string[];
    }
  | {
      ok: false;
      source: 'fallback';
      reason: 'unauthorized' | 'validation' | 'ai-unavailable';
    };

type AiLokasyonResponse = {
  recommendations: string[];
};

function sanitizeLocale(value: string | undefined): string {
  if (value === 'en' || value === 'tr' || value === 'ru') return value;
  return 'az';
}

function answerValue(value: number | undefined): AnswerValue {
  if (value === 2) return 2;
  if (value === 0) return 0;
  return 1;
}

function sanitizeProfile(input: LokasyonRecommendationInput): LocationProfile | null {
  if (!isLocationMode(input.mode)) return null;
  if (!isLocationType(input.locationType)) return null;

  const answers = Object.fromEntries(
    Object.keys(DEFAULT_ANSWERS).map((key) => {
      const criterionId = key as LocationCriterionId;
      return [criterionId, answerValue(input.answers?.[criterionId])];
    }),
  ) as Record<LocationCriterionId, AnswerValue>;

  const riskFlags = (input.riskFlags ?? []).filter(isRiskFlag) as RiskFlagId[];
  const breakeven = { ...DEFAULT_BREAKEVEN, ...(input.breakeven ?? {}) };

  return {
    mode: input.mode as LocationMode,
    locationType: input.locationType as LocationType,
    answers,
    riskFlags,
    breakeven,
  };
}

function validateAiResponse(data: unknown): string[] | null {
  if (!data || typeof data !== 'object') return null;
  const raw = (data as AiLokasyonResponse).recommendations;
  if (!Array.isArray(raw)) return null;
  const recommendations = raw
    .map((item) => String(item ?? '').trim().replace(/\s+/g, ' ').slice(0, 260))
    .filter(Boolean);
  if (recommendations.length < 3) return null;
  return recommendations.slice(0, 3);
}

function buildPrompt(profile: LocationProfile, locale: string): string {
  const analysis = calculateLocationAnalysis(profile);
  return `Locale: ${locale}
Location profile:
- Mode: ${profile.mode}
- Location type: ${profile.locationType}
- Score: ${analysis.score}
- Level: ${analysis.level}
- Weak criteria: ${analysis.weaknesses.join(', ') || 'none'}
- Strong criteria: ${analysis.strengths.join(', ') || 'none'}
- Risk flags: ${analysis.applicableRiskFlags.join(', ') || 'none'}
- Fixed costs AZN: ${analysis.breakeven.fixedCosts}
- Gross margin percent: ${analysis.breakeven.grossMarginPercent}
- Monthly breakeven sales AZN: ${analysis.breakeven.monthlyBreakevenSales ?? 'not sustainable'}

Return valid JSON only:
{
  "recommendations": [
    "one concrete low-cost location improvement or decision, max 2 sentences",
    "one concrete low-cost location improvement or decision, max 2 sentences",
    "one concrete low-cost location improvement or decision, max 2 sentences"
  ]
}`;
}

const SYSTEM_PROMPT = `You are a practical HoReCa location consultant for small restaurants in Azerbaijan.
Use franchise-style location discipline but keep advice usable for a small operator in Baku or regions.
Do not suggest expensive mapping APIs, demographic databases, legal fee numbers, or uncertain public procedures.
Focus on observation, lease decision, signage, daypart demand, parking, rent logic, and breakeven discipline.
Return JSON only.`;

export async function generateLokasyonRecommendations(
  input: LokasyonRecommendationInput,
): Promise<LokasyonRecommendationResult> {
  const auth = await getAuthFromCookie();
  if (!auth) return { ok: false, source: 'fallback', reason: 'unauthorized' };

  const access = await checkToolAccess(auth.userId, 'lokasyon-analiz', auth.role);
  if (!access.allowed) return { ok: false, source: 'fallback', reason: 'unauthorized' };

  const profile = sanitizeProfile(input);
  if (!profile) return { ok: false, source: 'fallback', reason: 'validation' };

  if (input.forceFallback) {
    return { ok: false, source: 'fallback', reason: 'ai-unavailable' };
  }

  const locale = sanitizeLocale(input.locale);

  try {
    const response = await callAIJson<AiLokasyonResponse>(
      {
        prompt: buildPrompt(profile, locale),
        system: SYSTEM_PROMPT,
        maxTokens: 700,
        temperature: 0.25,
        timeout: 18_000,
        responseFormat: 'json_object',
      },
      {
        preferProvider: 'deepseek',
        toolSlug: 'lokasyon-analiz',
        userId: auth.userId,
        locale,
      },
    );

    const recommendations = validateAiResponse(response.data);
    if (!recommendations) return { ok: false, source: 'fallback', reason: 'ai-unavailable' };

    return { ok: true, source: 'ai', recommendations };
  } catch {
    return { ok: false, source: 'fallback', reason: 'ai-unavailable' };
  }
}
