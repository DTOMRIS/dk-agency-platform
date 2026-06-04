'use client';

import FranchiseQuiz, { type QuizConfig } from '@/components/franchise/FranchiseQuiz';

const OTA_QUESTION_COUNT = 8;
const OTA_SCORES = [25, 50, 75, 100] as const;

function getVerdict(avg: number): string {
  if (avg < 40) return 'not_ready';
  if (avg < 55) return 'booking_start';
  if (avg < 70) return 'airbnb_expand';
  if (avg < 85) return 'direct_strategy';
  return 'multi_pro';
}

function getWeakest(scores: number[]): number {
  let minVal = 101, minIdx = 0;
  scores.forEach((v, i) => { if (v < minVal) { minVal = v; minIdx = i; } });
  return minIdx;
}

const config: QuizConfig = {
  namespace: 'otaReadiness',
  questionCount: OTA_QUESTION_COUNT,
  scoreOptions: OTA_SCORES,
  storageKey: 'dk-ota-readiness',
  toolSource: 'readiness_test',
  aiReportPath: '/api/franchise/readiness-report',
  reportType: 'OtaReadinessReport' as 'FranchiseReadinessReport',
  getVerdict,
  getWeakestIndex: getWeakest,
};

export default function OtaReadinessQuiz() {
  return <FranchiseQuiz config={config} />;
}
