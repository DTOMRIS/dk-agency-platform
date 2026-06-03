'use client';

import FranchiseQuiz, { type QuizConfig } from './FranchiseQuiz';
import { QUESTION_COUNT, QUESTION_SCORES, getVerdict, getWeakestIndex } from '@/lib/data/franchiseReadiness';

const config: QuizConfig = {
  namespace: 'franchiseReadiness',
  questionCount: QUESTION_COUNT,
  scoreOptions: QUESTION_SCORES,
  storageKey: 'dk-franchise-readiness',
  toolSource: 'readiness_test',
  aiReportPath: '/api/franchise/readiness-report',
  reportType: 'FranchiseReadinessReport',
  getVerdict: (avg) => getVerdict(avg),
  getWeakestIndex: (scores) => getWeakestIndex(scores),
};

export default function ReadinessQuiz() {
  return <FranchiseQuiz config={config} />;
}
