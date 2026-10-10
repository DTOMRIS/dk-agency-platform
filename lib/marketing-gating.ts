/**
 * @file marketing-gating.ts
 * @purpose Marketinq Ocagi aletlerine SAGIRD/KALFA/USTA pille erisim kontrolu
 * @lastModified 2026-05-09
 */

import {
  getToolConfig,
  canAccessTool,
  type MarketingToolTier,
} from './marketing-tools-config';
import { db } from './db';
import { marketingToolRuns } from './db/schema';
import { eq, and, gte, sql as dsql } from 'drizzle-orm';

// ── TIPLER ──────────────────────────────────────────────────────────

export type GatingResult =
  | {
      allowed: true;
      userTier: MarketingToolTier;
      remainingRuns: number | null;
    }
  | {
      allowed: false;
      reason: 'not-authenticated' | 'tier-too-low' | 'monthly-limit-reached' | 'tool-not-found';
      requiredTier?: MarketingToolTier;
    };

// ── TIER MAPPING ────────────────────────────────────────────────────
// Movcud member-access.ts-deki MemberPlan -> MarketingToolTier
// free -> sagird, member -> kalfa, admin -> usta

export function mapPlanToTier(plan: string): MarketingToolTier {
  switch (plan) {
    case 'admin':
      return 'usta';
    case 'member':
      return 'kalfa';
    default:
      return 'sagird';
  }
}

// ── ANA FUNKSIYA ────────────────────────────────────────────────────

export async function checkToolAccess(
  userId: number | null,
  toolSlug: string,
  userPlan: string = 'free',
): Promise<GatingResult> {
  if (!userId) {
    return { allowed: false, reason: 'not-authenticated' };
  }

  const tool = getToolConfig(toolSlug);
  if (!tool) {
    return { allowed: false, reason: 'tool-not-found' };
  }

  const userTier = mapPlanToTier(userPlan);

  if (!canAccessTool(userTier, tool.tier)) {
    return { allowed: false, reason: 'tier-too-low', requiredTier: tool.tier };
  }

  // Monthly run limit check
  const limit = tool.monthlyRunLimit[userTier];
  if (limit === 0) {
    return { allowed: false, reason: 'tier-too-low', requiredTier: tool.tier };
  }
  if (limit !== null) {
    const runsThisMonth = await countRunsThisMonth(userId, toolSlug);
    if (runsThisMonth >= limit) {
      return { allowed: false, reason: 'monthly-limit-reached' };
    }
    return { allowed: true, userTier, remainingRuns: limit - runsThisMonth };
  }

  return { allowed: true, userTier, remainingRuns: null };
}

// ── KOMEKCILER ──────────────────────────────────────────────────────

async function countRunsThisMonth(
  userId: number,
  toolSlug: string,
): Promise<number> {
  if (!db) return 0;

  const result = await db
    .select({ count: dsql<number>`count(*)::int` })
    .from(marketingToolRuns)
    .where(
      and(
        eq(marketingToolRuns.userId, userId),
        eq(marketingToolRuns.toolSlug, toolSlug),
        eq(marketingToolRuns.status, 'success'),
        gte(marketingToolRuns.createdAt, dsql`date_trunc('month', now())`),
      ),
    );

  return result[0]?.count ?? 0;
}

// ── RUN LOG (TASK-0523) ─────────────────────────────────────────────
// Server actions (menyu, persona, şikayət, ROI, P&L, trend, lokasyon) used to check the monthly
// limit but never wrote a row, so countRunsThisMonth stayed 0 and the limit never bit.
// Best-effort: a failed log write must not fail the user's result.

export async function logToolRun(params: {
  userId: number;
  toolSlug: string;
  input: Record<string, unknown>;
  status: 'success' | 'error';
  output?: Record<string, unknown>;
  errorMessage?: string;
  provider?: string;
  locale?: string;
}): Promise<void> {
  if (!db) return;
  try {
    await db.insert(marketingToolRuns).values({
      userId: params.userId,
      toolSlug: params.toolSlug,
      inputData: params.input,
      outputData: params.output ?? null,
      aiProvider: params.provider ?? null,
      status: params.status,
      errorMessage: params.errorMessage?.slice(0, 500) ?? null,
      locale: (params.locale ?? 'az').slice(0, 2),
      completedAt: new Date(),
    });
  } catch (err) {
    console.error('[marketing-gating] logToolRun failed', params.toolSlug, err);
  }
}
