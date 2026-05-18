/**
 * @file trend-analiz.ts
 * @purpose Static 2026 HoReCa trend knowledge base and scoring engine.
 * @task TASK-0150
 * @lastModified 2026-05-18
 */

export type TrendRestaurantType = 'city' | 'coast' | 'mountain' | 'cafe' | 'banquet';
export type TrendAudience = 'young' | 'family' | 'business' | 'tourist' | 'mixed';
export type TrendStrength = 'food_quality' | 'price' | 'location' | 'service' | 'online';

export type TrendId =
  | 'value_pricing'
  | 'delivery_first'
  | 'ai_ordering'
  | 'functional_health'
  | 'nostalgia_escape'
  | 'beverage_focus'
  | 'sustainability_local'
  | 'experience_human_touch';

export type TrendProfile = {
  restaurantType: TrendRestaurantType;
  audience: TrendAudience;
  strength: TrendStrength;
};

export type TrendKnowledge = {
  id: TrendId;
  restaurantFit: Record<TrendRestaurantType, number>;
  audienceFit: Record<TrendAudience, number>;
  strengthFit: Record<TrendStrength, number>;
};

export type TrendScore = {
  trendId: TrendId;
  score: number;
  rank: number;
};

export type TrendAnalysis = {
  profile: TrendProfile;
  scores: TrendScore[];
  topTrends: TrendScore[];
};

export const RESTAURANT_TYPES: TrendRestaurantType[] = ['city', 'coast', 'mountain', 'cafe', 'banquet'];
export const AUDIENCES: TrendAudience[] = ['young', 'family', 'business', 'tourist', 'mixed'];
export const STRENGTHS: TrendStrength[] = ['food_quality', 'price', 'location', 'service', 'online'];

export const TREND_KB: TrendKnowledge[] = [
  {
    id: 'value_pricing',
    restaurantFit: { city: 92, coast: 78, mountain: 74, cafe: 88, banquet: 70 },
    audienceFit: { young: 88, family: 95, business: 70, tourist: 78, mixed: 86 },
    strengthFit: { food_quality: 76, price: 98, location: 70, service: 72, online: 76 },
  },
  {
    id: 'delivery_first',
    restaurantFit: { city: 90, coast: 68, mountain: 58, cafe: 86, banquet: 42 },
    audienceFit: { young: 92, family: 74, business: 84, tourist: 56, mixed: 76 },
    strengthFit: { food_quality: 64, price: 72, location: 66, service: 60, online: 98 },
  },
  {
    id: 'ai_ordering',
    restaurantFit: { city: 84, coast: 68, mountain: 60, cafe: 92, banquet: 54 },
    audienceFit: { young: 94, family: 62, business: 86, tourist: 68, mixed: 74 },
    strengthFit: { food_quality: 58, price: 66, location: 62, service: 70, online: 100 },
  },
  {
    id: 'functional_health',
    restaurantFit: { city: 82, coast: 76, mountain: 70, cafe: 92, banquet: 56 },
    audienceFit: { young: 84, family: 78, business: 80, tourist: 72, mixed: 76 },
    strengthFit: { food_quality: 92, price: 58, location: 64, service: 66, online: 72 },
  },
  {
    id: 'nostalgia_escape',
    restaurantFit: { city: 86, coast: 78, mountain: 84, cafe: 88, banquet: 82 },
    audienceFit: { young: 76, family: 92, business: 64, tourist: 86, mixed: 82 },
    strengthFit: { food_quality: 96, price: 74, location: 78, service: 84, online: 70 },
  },
  {
    id: 'beverage_focus',
    restaurantFit: { city: 76, coast: 88, mountain: 72, cafe: 96, banquet: 64 },
    audienceFit: { young: 94, family: 64, business: 72, tourist: 86, mixed: 78 },
    strengthFit: { food_quality: 72, price: 66, location: 82, service: 74, online: 88 },
  },
  {
    id: 'sustainability_local',
    restaurantFit: { city: 72, coast: 82, mountain: 88, cafe: 76, banquet: 66 },
    audienceFit: { young: 80, family: 74, business: 66, tourist: 90, mixed: 76 },
    strengthFit: { food_quality: 88, price: 54, location: 86, service: 70, online: 68 },
  },
  {
    id: 'experience_human_touch',
    restaurantFit: { city: 82, coast: 90, mountain: 92, cafe: 78, banquet: 94 },
    audienceFit: { young: 70, family: 86, business: 78, tourist: 96, mixed: 82 },
    strengthFit: { food_quality: 82, price: 58, location: 90, service: 100, online: 62 },
  },
];

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateTrendAnalysis(profile: TrendProfile): TrendAnalysis {
  const scores = TREND_KB
    .map((trend) => {
      const typeScore = trend.restaurantFit[profile.restaurantType];
      const audienceScore = trend.audienceFit[profile.audience];
      const strengthScore = trend.strengthFit[profile.strength];
      const score = clampScore((typeScore * 0.5) + (audienceScore * 0.3) + (strengthScore * 0.2));
      return { trendId: trend.id, score, rank: 0 };
    })
    .sort((a, b) => b.score - a.score);

  const ranked = scores.map((score, index) => ({ ...score, rank: index + 1 }));

  return {
    profile,
    scores: ranked,
    topTrends: ranked.slice(0, 3),
  };
}

export function isTrendRestaurantType(value: string): value is TrendRestaurantType {
  return RESTAURANT_TYPES.includes(value as TrendRestaurantType);
}

export function isTrendAudience(value: string): value is TrendAudience {
  return AUDIENCES.includes(value as TrendAudience);
}

export function isTrendStrength(value: string): value is TrendStrength {
  return STRENGTHS.includes(value as TrendStrength);
}
