'use client';

import FranchiseQuiz, { type QuizConfig } from '@/components/franchise/FranchiseQuiz';
import { HOTEL_QUESTION_COUNT, HOTEL_QUESTION_SCORES, HOTEL_READINESS_TASK_TYPE, getHotelVerdict, getHotelWeakestIndex } from '@/lib/data/hotelReadiness';

const config: QuizConfig = {
  namespace: 'hotelReadiness',
  questionCount: HOTEL_QUESTION_COUNT,
  scoreOptions: HOTEL_QUESTION_SCORES,
  storageKey: 'dk-hotel-readiness',
  toolSource: 'readiness_test',
  aiReportPath: '/api/franchise/readiness-report',
  reportType: HOTEL_READINESS_TASK_TYPE as 'FranchiseReadinessReport',
  getVerdict: (avg) => getHotelVerdict(avg),
  getWeakestIndex: (scores) => getHotelWeakestIndex(scores),
};

export default function HotelReadinessQuiz() {
  return <FranchiseQuiz config={config} />;
}
