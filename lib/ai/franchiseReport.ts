export type FranchiseReportTaskType = 'FranchiseReadinessReport' | 'FranchiseBuyerReport';

export type FranchiseReportInput = {
  taskType: FranchiseReportTaskType;
  scores: Record<string, number>;
  locale: string;
  avgScore: number;
  referrer?: string;
};

const forbiddenTerms = 'CRM, Pipeline, Agentlik, Holdinq, "Tezlikle"';

const localeInstructions: Record<string, string> = {
  az: 'Cavabi Azerbaycan dilinde yaz.',
  ru: 'Write the response in Russian.',
  en: 'Write the response in English.',
  tr: 'Cevabi Turkce olarak yaz.',
};

const systemPrompts: Record<FranchiseReportTaskType, string> = {
  FranchiseReadinessReport: `You are a DK Agency franchise advisor. Write a personal report based on a brand owner's readiness scores across 12 criteria.

Forbidden terms: ${forbiddenTerms}.

Format:
1) Overall evaluation (2-3 sentences)
2) Deep analysis of the weakest area (4-5 sentences)
3) Three priority next steps (bullet list)

Keep the answer 200-300 words. Use the user's selected language.`,

  FranchiseBuyerReport: `You are a DK Agency franchise advisor. Write a personal due-diligence report for someone evaluating whether to buy a franchise, based only on the 9 checklist scores provided.

Forbidden terms: ${forbiddenTerms}.

Important:
- Do not invent fees, campaigns, legal terms, financial promises, or franchisor claims.
- Present this as an initial evaluation, not legal or financial advice.
- Focus on buyer risk, missing evidence, and what the user should ask the franchisor before paying.

Format:
1) Overall buyer risk evaluation (2-3 sentences)
2) Deep analysis of the weakest area (4-5 sentences)
3) Three questions to ask the franchisor next (bullet list)

Keep the answer 200-300 words. Use the user's selected language.`,
};

function sanitizeScoreKey(key: string) {
  return key.replace(/[\r\n:]/g, ' ').slice(0, 80).trim();
}

function normalizeScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function buildFranchiseReportPrompt(input: FranchiseReportInput) {
  const taskType = input.taskType || 'FranchiseReadinessReport';
  const scoreText = Object.entries(input.scores)
    .slice(0, 20)
    .map(([category, value]) => `${sanitizeScoreKey(category)}: ${normalizeScore(value)}/100`)
    .join('\n');

  const userPrompt = [
    `Average score: ${normalizeScore(input.avgScore)}/100`,
    '',
    `Criteria scores:\n${scoreText}`,
    '',
    localeInstructions[input.locale] || localeInstructions.az,
    input.referrer ? `Referrer page: ${input.referrer.slice(0, 120)}` : '',
  ].filter(Boolean).join('\n');

  return {
    systemPrompt: systemPrompts[taskType],
    userPrompt,
  };
}

export function isFranchiseReportTaskType(value: unknown): value is FranchiseReportTaskType {
  return value === 'FranchiseReadinessReport' || value === 'FranchiseBuyerReport';
}
