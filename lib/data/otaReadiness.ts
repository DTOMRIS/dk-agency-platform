/**
 * OTA Readiness Quiz — Single Source of Truth
 *
 * Booking.com, Airbnb və Yandex Travel platformalarında pansiyon, qonaq evi
 * və günlük kirayə sahibləri üçün hazırlıq səviyyəsi qiymətləndirməsi.
 *
 * Hədəf: Xınalıq, Lahıc, Laza, İlisu, Quba kəndi, Şəki, Qəbələ, Naxçıvan
 * və Bakı Airbnb host-ları.
 *
 * Real bazar konteksti:
 * - Booking.com komissiyası: 10-25% (ortalama 15%) + 1.1-3.1% ödəmə
 * - Airbnb split fee: host 3% + guest 14%, host-only: 15%
 * - Yandex Travel: ~12-15%
 *
 * Bu data SSOT-dur; UI mətnləri messages/{locale}.json-da.
 * Reuse: FranchiseQuiz parametrik component bunu config kimi qəbul edir.
 */

export type OtaReadinessScore = 25 | 50 | 75 | 100;

export type OtaReadinessOption = {
  optionKey: string;
  score: OtaReadinessScore;
};

export type OtaReadinessQuestion = {
  id: string;
  categoryKey: string;
  questionKey: string;
  options: [
    OtaReadinessOption,
    OtaReadinessOption,
    OtaReadinessOption,
    OtaReadinessOption
  ];
};

export type OtaReadinessTier =
  | 'not-ready'
  | 'booking-start'
  | 'airbnb-expand'
  | 'direct-strategy'
  | 'multi-platform-pro';

export type OtaReadinessVerdict = {
  minScore: number;
  maxScore: number;
  headingKey: string;
  sublineKey: string;
  tier: OtaReadinessTier;
};

/* ────────────────────────────────────────────────────────────────────────
 * 8 KATEQORİYA × 4 CAVAB = 32 SEÇİM
 * Pansiyon sahibinin diqqət müddəti qısadır — 12 yox, 8 sual.
 * ──────────────────────────────────────────────────────────────────────── */

export const OTA_READINESS_QUESTIONS: OtaReadinessQuestion[] = [
  {
    id: 'photos',
    categoryKey: 'otaReadiness.categories.photos',
    questionKey: 'otaReadiness.questions.photos',
    options: [
      { optionKey: 'otaReadiness.options.photos.a', score: 25 },
      { optionKey: 'otaReadiness.options.photos.b', score: 50 },
      { optionKey: 'otaReadiness.options.photos.c', score: 75 },
      { optionKey: 'otaReadiness.options.photos.d', score: 100 },
    ],
  },
  {
    id: 'profile',
    categoryKey: 'otaReadiness.categories.profile',
    questionKey: 'otaReadiness.questions.profile',
    options: [
      { optionKey: 'otaReadiness.options.profile.a', score: 25 },
      { optionKey: 'otaReadiness.options.profile.b', score: 50 },
      { optionKey: 'otaReadiness.options.profile.c', score: 75 },
      { optionKey: 'otaReadiness.options.profile.d', score: 100 },
    ],
  },
  {
    id: 'pricing',
    categoryKey: 'otaReadiness.categories.pricing',
    questionKey: 'otaReadiness.questions.pricing',
    options: [
      { optionKey: 'otaReadiness.options.pricing.a', score: 25 },
      { optionKey: 'otaReadiness.options.pricing.b', score: 50 },
      { optionKey: 'otaReadiness.options.pricing.c', score: 75 },
      { optionKey: 'otaReadiness.options.pricing.d', score: 100 },
    ],
  },
  {
    id: 'calendar',
    categoryKey: 'otaReadiness.categories.calendar',
    questionKey: 'otaReadiness.questions.calendar',
    options: [
      { optionKey: 'otaReadiness.options.calendar.a', score: 25 },
      { optionKey: 'otaReadiness.options.calendar.b', score: 50 },
      { optionKey: 'otaReadiness.options.calendar.c', score: 75 },
      { optionKey: 'otaReadiness.options.calendar.d', score: 100 },
    ],
  },
  {
    id: 'reviews',
    categoryKey: 'otaReadiness.categories.reviews',
    questionKey: 'otaReadiness.questions.reviews',
    options: [
      { optionKey: 'otaReadiness.options.reviews.a', score: 25 },
      { optionKey: 'otaReadiness.options.reviews.b', score: 50 },
      { optionKey: 'otaReadiness.options.reviews.c', score: 75 },
      { optionKey: 'otaReadiness.options.reviews.d', score: 100 },
    ],
  },
  {
    id: 'payment',
    categoryKey: 'otaReadiness.categories.payment',
    questionKey: 'otaReadiness.questions.payment',
    options: [
      { optionKey: 'otaReadiness.options.payment.a', score: 25 },
      { optionKey: 'otaReadiness.options.payment.b', score: 50 },
      { optionKey: 'otaReadiness.options.payment.c', score: 75 },
      { optionKey: 'otaReadiness.options.payment.d', score: 100 },
    ],
  },
  {
    id: 'language',
    categoryKey: 'otaReadiness.categories.language',
    questionKey: 'otaReadiness.questions.language',
    options: [
      { optionKey: 'otaReadiness.options.language.a', score: 25 },
      { optionKey: 'otaReadiness.options.language.b', score: 50 },
      { optionKey: 'otaReadiness.options.language.c', score: 75 },
      { optionKey: 'otaReadiness.options.language.d', score: 100 },
    ],
  },
  {
    id: 'directBooking',
    categoryKey: 'otaReadiness.categories.directBooking',
    questionKey: 'otaReadiness.questions.directBooking',
    options: [
      { optionKey: 'otaReadiness.options.directBooking.a', score: 25 },
      { optionKey: 'otaReadiness.options.directBooking.b', score: 50 },
      { optionKey: 'otaReadiness.options.directBooking.c', score: 75 },
      { optionKey: 'otaReadiness.options.directBooking.d', score: 100 },
    ],
  },
];

/* ────────────────────────────────────────────────────────────────────────
 * VERDICT — 5 tier ilə pansiyon sahibinin real journey-ini xəritələyir.
 * Pis xəbər vermirik — hər tier-in öz "növbəti addımı" var.
 * ──────────────────────────────────────────────────────────────────────── */

export const OTA_READINESS_VERDICTS: OtaReadinessVerdict[] = [
  {
    minScore: 0,
    maxScore: 39,
    headingKey: 'otaReadiness.verdicts.notReady.heading',
    sublineKey: 'otaReadiness.verdicts.notReady.subline',
    tier: 'not-ready',
  },
  {
    minScore: 40,
    maxScore: 54,
    headingKey: 'otaReadiness.verdicts.bookingStart.heading',
    sublineKey: 'otaReadiness.verdicts.bookingStart.subline',
    tier: 'booking-start',
  },
  {
    minScore: 55,
    maxScore: 69,
    headingKey: 'otaReadiness.verdicts.airbnbExpand.heading',
    sublineKey: 'otaReadiness.verdicts.airbnbExpand.subline',
    tier: 'airbnb-expand',
  },
  {
    minScore: 70,
    maxScore: 84,
    headingKey: 'otaReadiness.verdicts.directStrategy.heading',
    sublineKey: 'otaReadiness.verdicts.directStrategy.subline',
    tier: 'direct-strategy',
  },
  {
    minScore: 85,
    maxScore: 100,
    headingKey: 'otaReadiness.verdicts.multiPlatformPro.heading',
    sublineKey: 'otaReadiness.verdicts.multiPlatformPro.subline',
    tier: 'multi-platform-pro',
  },
];

/** Verdict resolver — L-027 (Infinity upper-bound yox, defensive fallback). */
export function resolveOtaVerdict(score: number): OtaReadinessVerdict {
  const v = OTA_READINESS_VERDICTS.find(
    (item) => score >= item.minScore && score <= item.maxScore
  );
  return v ?? OTA_READINESS_VERDICTS[0];
}

/** AI report taskType — lib/ai-models.ts-də qeyd olunacaq */
export const OTA_READINESS_TASK_TYPE = 'OtaReadinessReport' as const;

/** Quiz config — FranchiseQuiz parametrik component üçün */
export const OTA_READINESS_QUIZ_CONFIG = {
  quizId: 'ota-readiness',
  toolSource: 'ota_readiness_test' as const,
  questions: OTA_READINESS_QUESTIONS,
  verdicts: OTA_READINESS_VERDICTS,
  aiTaskType: OTA_READINESS_TASK_TYPE,
  routePath: '/toolkit/ota-hazirlig-testi',
  i18nNamespace: 'otaReadiness',
} as const;
