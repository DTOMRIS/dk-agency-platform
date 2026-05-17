/**
 * @file sosial-metrik.ts
 * @purpose Sosial media ER hesablama motoru — Instagram + TikTok
 * @task TASK-0148
 * @lastModified 2026-05-17
 */

export type SocialPlatform = 'instagram' | 'tiktok';

export type ContentType = 'reels' | 'carousel' | 'single';

// ── INPUT TYPES ──────────────────────────────────────────

export type InstagramInput = {
  followers: number;
  totalLikes: number;
  totalComments: number;
  totalSaves: number;
  totalShares: number;
  postCount: number;
  avgReach?: number;
  // Content type breakdown (optional)
  reelsCount?: number;
  carouselCount?: number;
  singleCount?: number;
  reelsLikes?: number;
  reelsComments?: number;
  reelsSaves?: number;
  reelsShares?: number;
  carouselLikes?: number;
  carouselComments?: number;
  carouselSaves?: number;
  carouselShares?: number;
  singleLikes?: number;
  singleComments?: number;
  singleSaves?: number;
  singleShares?: number;
};

export type TikTokInput = {
  followers: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
  totalViews: number;
  postCount: number;
};

// ── OUTPUT TYPES ─────────────────────────────────────────

export type HealthStatus = 'excellent' | 'good' | 'average' | 'weak';

export type ContentTypeMetric = {
  type: ContentType;
  postCount: number;
  er: number;
  rank: number;
};

export type InstagramAnalysis = {
  platform: 'instagram';
  erFollower: number;
  erReach: number | null;
  totalInteractions: number;
  avgInteractionsPerPost: number;
  followerTier: 'nano' | 'micro' | 'mid';
  benchmark: number;
  benchmarkDelta: number;
  status: HealthStatus;
  healthScore: number;
  contentBreakdown: ContentTypeMetric[] | null;
  bestContentType: ContentType | null;
};

export type TikTokAnalysis = {
  platform: 'tiktok';
  erViews: number;
  erFollower: number;
  totalInteractions: number;
  avgInteractionsPerPost: number;
  benchmark: number;
  benchmarkDelta: number;
  status: HealthStatus;
  healthScore: number;
};

export type SocialMetrikAnalysis = InstagramAnalysis | TikTokAnalysis;

// ── BENCHMARKS (2025-2026, HoReCa/F&B sector) ───────────
// Source: Socialinsider 2025, RivalIQ 2025, Hootsuite 2025

export const INSTAGRAM_BENCHMARKS = {
  nano: { min: 0, max: 10_000, er: 2.53, label: '<10K' },
  micro: { min: 10_000, max: 100_000, er: 1.18, label: '10K–100K' },
  mid: { min: 100_000, max: Infinity, er: 0.70, label: '100K+' },
} as const;

// TikTok ER views-bazlı — F&B sektoru (2025-2026)
export const TIKTOK_BENCHMARK = {
  er: 2.65, // views-based median for F&B
  good: 4.0,
  excellent: 6.0,
} as const;

// Content type ER multipliers (Instagram 2025-2026 data)
export const CONTENT_MULTIPLIERS = {
  reels: 1.5,     // Reels get ~1.5x more ER than average
  carousel: 1.26, // Carousels ~1.26x
  single: 0.72,   // Single images lag behind
} as const;

// ── CALCULATION FUNCTIONS ────────────────────────────────

function getFollowerTier(followers: number): 'nano' | 'micro' | 'mid' {
  if (followers < 10_000) return 'nano';
  if (followers < 100_000) return 'micro';
  return 'mid';
}

function getHealthStatus(er: number, benchmark: number): HealthStatus {
  const ratio = er / benchmark;
  if (ratio >= 1.5) return 'excellent';
  if (ratio >= 1.0) return 'good';
  if (ratio >= 0.7) return 'average';
  return 'weak';
}

function calculateHealthScore(er: number, benchmark: number): number {
  // 0-100 scale: 50 = exactly benchmark, 100 = 2x benchmark, 0 = zero ER
  const ratio = benchmark > 0 ? er / benchmark : 0;
  const score = Math.min(100, Math.max(0, Math.round(ratio * 50)));
  return score;
}

function round(value: number, decimals = 2): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

// ── INSTAGRAM CALCULATION ────────────────────────────────

export function calculateInstagram(input: InstagramInput): InstagramAnalysis {
  const { followers, totalLikes, totalComments, totalSaves, totalShares, postCount, avgReach } = input;
  const posts = Math.max(1, postCount);

  // Total interactions (2026 formula: likes + comments + saves + shares)
  const totalInteractions = totalLikes + totalComments + totalSaves + totalShares;
  const avgInteractionsPerPost = totalInteractions / posts;

  // ER (follower-based) = totalInteractions / (posts × followers) × 100
  const erFollower = followers > 0
    ? (totalInteractions / (posts * followers)) * 100
    : 0;

  // ER (reach-based) = totalInteractions / (posts × avgReach) × 100
  const erReach = avgReach && avgReach > 0
    ? (totalInteractions / (posts * avgReach)) * 100
    : null;

  // Benchmark based on follower tier
  const followerTier = getFollowerTier(followers);
  const benchmark = INSTAGRAM_BENCHMARKS[followerTier].er;
  const benchmarkDelta = erFollower - benchmark;
  const status = getHealthStatus(erFollower, benchmark);
  const healthScore = calculateHealthScore(erFollower, benchmark);

  // Content type breakdown (optional)
  let contentBreakdown: ContentTypeMetric[] | null = null;
  let bestContentType: ContentType | null = null;

  const hasReels = (input.reelsCount ?? 0) > 0;
  const hasCarousel = (input.carouselCount ?? 0) > 0;
  const hasSingle = (input.singleCount ?? 0) > 0;

  if (hasReels || hasCarousel || hasSingle) {
    const types: ContentTypeMetric[] = [];

    if (hasReels && input.reelsCount) {
      const interactions = (input.reelsLikes ?? 0) + (input.reelsComments ?? 0) + (input.reelsSaves ?? 0) + (input.reelsShares ?? 0);
      const er = followers > 0 ? (interactions / (input.reelsCount * followers)) * 100 : 0;
      types.push({ type: 'reels', postCount: input.reelsCount, er: round(er), rank: 0 });
    }

    if (hasCarousel && input.carouselCount) {
      const interactions = (input.carouselLikes ?? 0) + (input.carouselComments ?? 0) + (input.carouselSaves ?? 0) + (input.carouselShares ?? 0);
      const er = followers > 0 ? (interactions / (input.carouselCount * followers)) * 100 : 0;
      types.push({ type: 'carousel', postCount: input.carouselCount, er: round(er), rank: 0 });
    }

    if (hasSingle && input.singleCount) {
      const interactions = (input.singleLikes ?? 0) + (input.singleComments ?? 0) + (input.singleSaves ?? 0) + (input.singleShares ?? 0);
      const er = followers > 0 ? (interactions / (input.singleCount * followers)) * 100 : 0;
      types.push({ type: 'single', postCount: input.singleCount, er: round(er), rank: 0 });
    }

    // Sort by ER descending and assign rank
    types.sort((a, b) => b.er - a.er);
    types.forEach((item, index) => { item.rank = index + 1; });

    contentBreakdown = types;
    bestContentType = types[0]?.type ?? null;
  }

  return {
    platform: 'instagram',
    erFollower: round(erFollower),
    erReach: erReach !== null ? round(erReach) : null,
    totalInteractions,
    avgInteractionsPerPost: round(avgInteractionsPerPost),
    followerTier,
    benchmark,
    benchmarkDelta: round(benchmarkDelta),
    status,
    healthScore,
    contentBreakdown,
    bestContentType,
  };
}

// ── TIKTOK CALCULATION ───────────────────────────────────

export function calculateTikTok(input: TikTokInput): TikTokAnalysis {
  const { followers, totalLikes, totalComments, totalShares, totalSaves, totalViews, postCount } = input;
  const posts = Math.max(1, postCount);

  // Total interactions
  const totalInteractions = totalLikes + totalComments + totalShares + totalSaves;
  const avgInteractionsPerPost = totalInteractions / posts;

  // TikTok ER (views-based) = totalInteractions / totalViews × 100
  const erViews = totalViews > 0
    ? (totalInteractions / totalViews) * 100
    : 0;

  // Follower-based ER for reference
  const erFollower = followers > 0
    ? (totalInteractions / (posts * followers)) * 100
    : 0;

  const benchmark = TIKTOK_BENCHMARK.er;
  const benchmarkDelta = erViews - benchmark;
  const status = getHealthStatus(erViews, benchmark);
  const healthScore = calculateHealthScore(erViews, benchmark);

  return {
    platform: 'tiktok',
    erViews: round(erViews),
    erFollower: round(erFollower),
    totalInteractions,
    avgInteractionsPerPost: round(avgInteractionsPerPost),
    benchmark,
    benchmarkDelta: round(benchmarkDelta),
    status,
    healthScore,
  };
}
