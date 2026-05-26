export interface AiReadinessOption {
  id: string;
  translationKey: string;
  score: number;
}

export interface AiReadinessQuestion {
  id: string;
  translationKey: string;
  weight: number;
  options: AiReadinessOption[];
}

export interface AiReadinessSegment {
  id: 'READY' | 'PARTIAL' | 'NOT_READY';
  translationKey: string;
  scoreRange: [number, number];
  recommendedTools: string[];
  kazanIntroKey: string;
}

export const AI_READINESS_MAX_SCORE = 30;

export const aiReadinessQuestions: AiReadinessQuestion[] = [
  {
    id: 'q1_pos',
    translationKey: 'ai_readiness.questions.q1_pos',
    weight: 1,
    options: [
      { id: 'yes_modern', translationKey: 'ai_readiness.questions.q1_pos.options.yes_modern', score: 3 },
      { id: 'yes_old', translationKey: 'ai_readiness.questions.q1_pos.options.yes_old', score: 1 },
      { id: 'no', translationKey: 'ai_readiness.questions.q1_pos.options.no', score: 0 },
    ],
  },
  {
    id: 'q2_inventory',
    translationKey: 'ai_readiness.questions.q2_inventory',
    weight: 1,
    options: [
      { id: 'weekly', translationKey: 'ai_readiness.questions.q2_inventory.options.weekly', score: 3 },
      { id: 'monthly', translationKey: 'ai_readiness.questions.q2_inventory.options.monthly', score: 1 },
      { id: 'no', translationKey: 'ai_readiness.questions.q2_inventory.options.no', score: 0 },
    ],
  },
  {
    id: 'q3_recipe',
    translationKey: 'ai_readiness.questions.q3_recipe',
    weight: 1,
    options: [
      { id: 'all', translationKey: 'ai_readiness.questions.q3_recipe.options.all', score: 3 },
      { id: 'partial', translationKey: 'ai_readiness.questions.q3_recipe.options.partial', score: 1 },
      { id: 'no', translationKey: 'ai_readiness.questions.q3_recipe.options.no', score: 0 },
    ],
  },
  {
    id: 'q4_pnl',
    translationKey: 'ai_readiness.questions.q4_pnl',
    weight: 1,
    options: [
      { id: 'self', translationKey: 'ai_readiness.questions.q4_pnl.options.self', score: 3 },
      { id: 'assistant', translationKey: 'ai_readiness.questions.q4_pnl.options.assistant', score: 1 },
      { id: 'no', translationKey: 'ai_readiness.questions.q4_pnl.options.no', score: 0 },
    ],
  },
  {
    id: 'q5_staff',
    translationKey: 'ai_readiness.questions.q5_staff',
    weight: 1,
    options: [
      { id: 'system', translationKey: 'ai_readiness.questions.q5_staff.options.system', score: 3 },
      { id: 'excel', translationKey: 'ai_readiness.questions.q5_staff.options.excel', score: 1 },
      { id: 'manual', translationKey: 'ai_readiness.questions.q5_staff.options.manual', score: 0 },
    ],
  },
  {
    id: 'q6_food_cost',
    translationKey: 'ai_readiness.questions.q6_food_cost',
    weight: 1,
    options: [
      { id: 'weekly', translationKey: 'ai_readiness.questions.q6_food_cost.options.weekly', score: 3 },
      { id: 'monthly', translationKey: 'ai_readiness.questions.q6_food_cost.options.monthly', score: 1 },
      { id: 'no', translationKey: 'ai_readiness.questions.q6_food_cost.options.no', score: 0 },
    ],
  },
  {
    id: 'q7_feedback',
    translationKey: 'ai_readiness.questions.q7_feedback',
    weight: 1,
    options: [
      { id: 'crm', translationKey: 'ai_readiness.questions.q7_feedback.options.crm', score: 3 },
      { id: 'manual', translationKey: 'ai_readiness.questions.q7_feedback.options.manual', score: 1 },
      { id: 'no', translationKey: 'ai_readiness.questions.q7_feedback.options.no', score: 0 },
    ],
  },
  {
    id: 'q8_vendor',
    translationKey: 'ai_readiness.questions.q8_vendor',
    weight: 1,
    options: [
      { id: 'monthly', translationKey: 'ai_readiness.questions.q8_vendor.options.monthly', score: 3 },
      { id: 'yearly', translationKey: 'ai_readiness.questions.q8_vendor.options.yearly', score: 1 },
      { id: 'never', translationKey: 'ai_readiness.questions.q8_vendor.options.never', score: 0 },
    ],
  },
  {
    id: 'q9_menu',
    translationKey: 'ai_readiness.questions.q9_menu',
    weight: 1,
    options: [
      { id: 'matrix', translationKey: 'ai_readiness.questions.q9_menu.options.matrix', score: 3 },
      { id: 'intuition', translationKey: 'ai_readiness.questions.q9_menu.options.intuition', score: 1 },
      { id: 'no', translationKey: 'ai_readiness.questions.q9_menu.options.no', score: 0 },
    ],
  },
  {
    id: 'q10_team',
    translationKey: 'ai_readiness.questions.q10_team',
    weight: 1,
    options: [
      { id: 'yes', translationKey: 'ai_readiness.questions.q10_team.options.yes', score: 3 },
      { id: 'partial', translationKey: 'ai_readiness.questions.q10_team.options.partial', score: 1 },
      { id: 'no', translationKey: 'ai_readiness.questions.q10_team.options.no', score: 0 },
    ],
  },
];

export const aiReadinessSegments: AiReadinessSegment[] = [
  {
    id: 'NOT_READY',
    translationKey: 'ai_readiness.segments.not_ready',
    scoreRange: [0, 10],
    recommendedTools: ['checklist', 'food-cost', 'aqta-checklist'],
    kazanIntroKey: 'ai_readiness.segments.not_ready.kazan_cta',
  },
  {
    id: 'PARTIAL',
    translationKey: 'ai_readiness.segments.partial',
    scoreRange: [11, 20],
    recommendedTools: ['pnl', 'food-cost', 'staff-retention'],
    kazanIntroKey: 'ai_readiness.segments.partial.kazan_cta',
  },
  {
    id: 'READY',
    translationKey: 'ai_readiness.segments.ready',
    scoreRange: [21, 30],
    recommendedTools: ['menu-matrix', 'basabas', 'pnl-simulator'],
    kazanIntroKey: 'ai_readiness.segments.ready.kazan_cta',
  },
];

export function getSegment(score: number): AiReadinessSegment {
  for (const seg of aiReadinessSegments) {
    if (score >= seg.scoreRange[0] && score <= seg.scoreRange[1]) return seg;
  }
  return aiReadinessSegments[0];
}
