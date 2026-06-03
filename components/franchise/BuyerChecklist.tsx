'use client';

import FranchiseQuiz, { type QuizConfig } from './FranchiseQuiz';
import { BUYER_QUESTION_COUNT, BUYER_SCORE_OPTIONS, getBuyerVerdict, getBuyerWeakestIndex } from '@/lib/data/franchiseBuyer';

const config: QuizConfig = {
  namespace: 'franchiseBuyer',
  questionCount: BUYER_QUESTION_COUNT,
  scoreOptions: BUYER_SCORE_OPTIONS,
  storageKey: 'dk-franchise-buyer',
  toolSource: 'buyer_checklist',
  aiReportPath: '/api/franchise/readiness-report',
  reportType: 'FranchiseBuyerReport',
  getVerdict: (avg) => getBuyerVerdict(avg),
  getWeakestIndex: (scores) => getBuyerWeakestIndex(scores),
};

export default function BuyerChecklist() {
  return <FranchiseQuiz config={config} />;
}
