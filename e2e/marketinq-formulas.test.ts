/**
 * TASK-0523: Marketinq Ocağı numbers that used to come from the LLM or from wrong formulas.
 * Run with: npx tsx e2e/marketinq-formulas.test.ts
 * Exits 0 on success, 1 on failure.
 */

import { computeKstScores } from '../lib/marketing-tools/kst-score';
import { computeComplaintStats } from '../lib/marketing-tools/complaint-stats';
import { calculateSeasonAnalysis, normalizedCoefficients, ramadanMonths, RESTAURANT_SEASON_TYPES, MONTH_KEYS } from '../lib/marketing-tools/sezon-analitikasi';
import { calculateReklamRoi } from '../lib/marketing-tools/reklam-roi';
import { pnlBreakeven } from '../components/toolkit/pnl/PnlScenarioPanel';
import { parseSurveyText, analyseSurvey } from '../lib/marketing-tools/qonaq-anketi';

let failures = 0;
let checks = 0;
function eq(actual: unknown, expected: unknown, label: string) {
  checks++;
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures++;
    console.error(`FAIL: ${label}\n  gözlənilən: ${JSON.stringify(expected)}\n  alınan:     ${JSON.stringify(actual)}`);
  }
}
function near(actual: number, expected: number, label: string, tolerance = 0.01) {
  checks++;
  if (Math.abs(actual - expected) > tolerance) {
    failures++;
    console.error(`FAIL: ${label}\n  gözlənilən: ${expected}\n  alınan:     ${actual}`);
  }
}

// ── KST: Σ / (n×5) × 100, weakest = answers ≤ 3, lowest first ──────────────
const ten = (v: number, prefix: string) => Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`${prefix}${i + 1}`, v]));
{
  const answers = { quality: ten(5, 'K'), service: { ...ten(4, 'S'), S3: 2 }, cleanliness: { ...ten(3, 'T'), T7: 1 } };
  const r = computeKstScores(answers);
  eq(r.scores.quality, 100, 'KST quality all 5 → 100');
  eq(r.scores.service, 76, 'KST service 9×4 + 2 = 38/50 → 76');
  eq(r.scores.cleanliness, 56, 'KST cleanliness 9×3 + 1 = 28/50 → 56');
  eq(r.scores.overall, 77, 'KST overall = mean(100, 76, 56) → 77');
  eq(r.weakest.map((w) => w.questionId), ['T7', 'S3', 'T1'], 'KST weakest: 1/5 first, then 2/5, then first 3/5');
  eq(computeKstScores({ quality: ten(4, 'K'), service: ten(5, 'S'), cleanliness: ten(4, 'T') }).weakest, [], 'KST no answer ≤ 3 → no weak items');
  // 4th group «İnsan» (5 questions): 4+4+4+4+2 = 18/25 → 72; overall = mean(100, 76, 56, 72) = 76
  const withPeople = computeKstScores({ ...answers, people: { I1: 4, I2: 4, I3: 4, I4: 4, I5: 2 } });
  eq(withPeople.scores.people, 72, 'KST İnsan 18/25 → 72');
  eq(withPeople.scores.overall, 76, 'KST overall over 4 groups');
  eq(r.scores.people, null, 'KST old runs without İnsan → null, overall over 3 groups');
}

// ── Complaints: counts, shares, urgency, lightness ─────────────────────────
{
  const s = computeComplaintStats(5, [
    { index: 1, category: 'wait_speed', severity: 'medium' },
    { index: 2, category: 'wait_speed', severity: 'high' },
    { index: 3, category: 'food_quality', severity: 'critical' },
    { index: 4, category: 'wait_speed', severity: 'low' },
    // index 5 missing → other / medium
    { index: 9, category: 'cleanliness', severity: 'low' }, // out of range → ignored
  ]);
  eq(s.total, 5, 'complaints total');
  eq(s.categories.map((c) => [c.key, c.count, c.percentage]), [['wait_speed', 3, 60], ['food_quality', 1, 20], ['other', 1, 20]], 'complaints category counts / shares');
  eq(s.topCategory, 'wait_speed', 'complaints top category');
  eq(s.urgencyLevel, 'critical', 'complaints urgency = worst severity');
  // weights 50 + 75 + 100 + 25 + 50 = 300 → mean 60 → (100 − 60) / 75 × 100 = 53
  eq(s.lightnessScore, 53, 'complaints lightness score');
  eq(computeComplaintStats(2, [{ index: 1, category: 'other', severity: 'low' }, { index: 2, category: 'other', severity: 'low' }]).lightnessScore, 100, 'all minor → 100');
}

// ── Season: coefficients average 1, year = 12 × average month ──────────────
for (const type of RESTAURANT_SEASON_TYPES) {
  const c = normalizedCoefficients(type);
  const mean = MONTH_KEYS.reduce((sum, m) => sum + c[m], 0) / 12;
  near(mean, 1, `season ${type}: mean coefficient = 1`, 0.002);
  const a = calculateSeasonAnalysis({ monthlyRevenue: 10000, restaurantType: type, laborPercent: 25, foodCostPercent: 30, year: 2027 });
  near(a.annualRevenue, 120000, `season ${type}: year = 12 × 10 000`, 30);
}
eq([...ramadanMonths(2026)], ['feb', 'mar'], 'Ramadan 2026 → Feb–Mar');
eq([...ramadanMonths(2028)], ['jan', 'feb'], 'Ramadan 2028 → Jan–Feb');
eq([...ramadanMonths(2031)], [], 'Ramadan unknown year → none (not a guess)');

// ── Reklam ROI: profit = revenue × margin ──────────────────────────────────
{
  const r = calculateReklamRoi({
    campaignType: 'conversion',
    averageOrderValue: 20,
    repeatPurchasePercent: 0,
    organicValuePerReach: 0,
    marginPercent: 50,
    channels: [{ id: 'a', type: 'instagram_facebook', budget: 100, newCustomers: 10 }],
  });
  // revenue 200 × 50% = 100 left − 100 ads → 0% ROI; ROAS 2x = break-even 1/0.5
  eq(r.totalRoiPercent, 0, 'reklam ROI on margin, not revenue');
  eq(r.totalRoas, 2, 'reklam ROAS stays revenue / spend');
  eq(r.breakevenRoas, 2, 'reklam break-even ROAS = 1 / margin');
}

// ── P&L break-even: only food/packaging is variable ────────────────────────
// revenue 50 000, food 15 500 (31%), fixed 31 000 → 31 000 / 0.69 = 44 927.54
near(pnlBreakeven(50000, 15500, 31000) ?? -1, 44927.54, 'P&L break-even = fixed / (1 − food %)');
eq(pnlBreakeven(1000, 1000, 500), null, 'P&L break-even impossible when food ≥ sales');

// ── Qonaq anketi: parse + group %, NPS, «too perfect», rushed ───────────────
{
  const text = [
    'q1,q2,q3,q4,q5,q6,q7,q8,nps,san',
    '5,5,5,5,5,5,5,5,10,40',   // perfect + rushed
    '4,4,3,3,5,5,4,4,8,200',
    '2,3,4,4,4,4,5,5,5,150',
    '5;5;5;5;5;5;5;5;10',      // perfect, no time
    'bad,row',
  ].join('\n');
  const parsed = parseSurveyText(text);
  eq(parsed.rows.length, 4, 'survey: 4 valid rows');
  eq(parsed.skipped, [6], 'survey: bad line reported by number');
  const a = analyseSurvey(parsed.rows, { perfectWarnPct: 50 });
  // quality: (5+5)+(4+4)+(2+3)+(5+5) = 33 / 40 → 83
  eq(a.groups.quality, 83, 'survey quality % = Σ / (n×5)');
  // NPS: 10, 8, 5, 10 → promoters 2/4 = 50, detractors 1/4 = 25 → 25
  eq(a.nps, 25, 'survey NPS = promoters − detractors');
  eq(a.perfectPct, 50, 'survey all-5 + NPS 10 share');
  eq(a.perfectWarning, true, 'survey perfect warning at owner threshold 50');
  eq(a.rushedPct, 33, 'survey rushed share among timed rows (1/3)');
  eq(a.reliable, false, 'survey < 10 answers → not reliable yet');
  // q1 (5,4,2,5) and q2 (5,4,3,5) both 25% low; q1 has the lower average → first
  eq(a.weakQuestions[0].id, 'q1', 'survey weakest question first');
}

if (failures) {
  console.error(`\n${failures}/${checks} yoxlama uğursuz`);
  process.exit(1);
}
console.log(`marketinq-formulas: ${checks}/${checks} OK`);
