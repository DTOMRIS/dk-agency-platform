/**
 * Qonaq anketi — TASK-0523 (OCAQ logic, our own questions).
 * Builder: a short guest survey on the K·X·T·İ groups + NPS. Checker: scores pasted answers in code.
 *  - group % = Σ / (n × 5) × 100 over every answer in the group
 *  - NPS = % promoters (9–10) − % detractors (0–6)
 *  - «too perfect» share = rows where every rating is 5 AND NPS is 10 (warning above the owner's threshold)
 *  - rushed = rows filled faster than `rushSeconds` (only when a seconds column is given)
 *  - fewer than MIN_RESPONSES answers → results are shown as not reliable yet
 * Nothing here is copied from OCAQ's survey or Shaurma's Excel: wording lives in messages/*.json.
 */

export type SurveyGroup = 'quality' | 'service' | 'cleanliness' | 'people';

export const SURVEY_GROUPS: readonly SurveyGroup[] = ['quality', 'service', 'cleanliness', 'people'];

/** Two rating questions per group, in this order; NPS comes after them. */
export const SURVEY_QUESTIONS: ReadonlyArray<{ id: string; group: SurveyGroup }> = [
  { id: 'q1', group: 'quality' },
  { id: 'q2', group: 'quality' },
  { id: 'q3', group: 'service' },
  { id: 'q4', group: 'service' },
  { id: 'q5', group: 'cleanliness' },
  { id: 'q6', group: 'cleanliness' },
  { id: 'q7', group: 'people' },
  { id: 'q8', group: 'people' },
];

export const MIN_RESPONSES = 10;
/** DK rule of thumb, editable on the page — not a published standard. */
export const DEFAULT_PERFECT_WARN_PCT = 80;
export const DEFAULT_RUSH_SECONDS = 90;

export type SurveyRow = { ratings: Array<number | null>; nps: number | null; seconds: number | null };

export type SurveyParseResult = { rows: SurveyRow[]; skipped: number[] };

/**
 * One response per line: 8 ratings (1–5), NPS (0–10), optional seconds. Separators: comma, semicolon,
 * tab or spaces. A first line with letters is treated as a header. Empty cells are allowed.
 */
export function parseSurveyText(text: string): SurveyParseResult {
  const rows: SurveyRow[] = [];
  const skipped: number[] = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line) return;
    if (index === 0 && /[a-zA-Zəıöüçşğ]/i.test(line)) return; // header
    const cells = line.split(/[;,\t]|\s+/).map((c) => c.trim());
    if (cells.length < SURVEY_QUESTIONS.length + 1) {
      skipped.push(index + 1);
      return;
    }
    const num = (cell: string | undefined, min: number, max: number): number | null | undefined => {
      if (cell === undefined || cell === '') return null;
      const n = Number(cell.replace(',', '.'));
      if (!Number.isFinite(n) || n < min || n > max) return undefined;
      return n;
    };
    const ratings = SURVEY_QUESTIONS.map((_, i) => num(cells[i], 1, 5));
    const nps = num(cells[SURVEY_QUESTIONS.length], 0, 10);
    const seconds = num(cells[SURVEY_QUESTIONS.length + 1], 0, 86_400);
    if (ratings.some((r) => r === undefined) || nps === undefined || seconds === undefined) {
      skipped.push(index + 1);
      return;
    }
    rows.push({ ratings: ratings as Array<number | null>, nps: nps as number | null, seconds: (seconds ?? null) as number | null });
  });
  return { rows, skipped };
}

export type SurveyAnalysis = {
  responses: number;
  reliable: boolean;
  groups: Record<SurveyGroup, number | null>;
  overall: number | null;
  nps: number | null;
  promotersPct: number;
  detractorsPct: number;
  perfectPct: number;
  perfectWarning: boolean;
  rushedPct: number | null;
  rushedWarning: boolean;
  /** questions answered ≤ 3 most often (share of their answers), worst first */
  weakQuestions: Array<{ id: string; group: SurveyGroup; lowSharePct: number; avg: number }>;
};

const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

export function analyseSurvey(
  rows: SurveyRow[],
  opts: { perfectWarnPct?: number; rushSeconds?: number } = {},
): SurveyAnalysis {
  const perfectWarnPct = opts.perfectWarnPct ?? DEFAULT_PERFECT_WARN_PCT;
  const rushSeconds = opts.rushSeconds ?? DEFAULT_RUSH_SECONDS;
  const n = rows.length;

  const groups = Object.fromEntries(
    SURVEY_GROUPS.map((group) => {
      const values = rows.flatMap((row) =>
        SURVEY_QUESTIONS.map((q, i) => (q.group === group ? row.ratings[i] : null)).filter((v): v is number => v !== null),
      );
      return [group, values.length ? Math.round((values.reduce((s, v) => s + v, 0) / (values.length * 5)) * 100) : null];
    }),
  ) as Record<SurveyGroup, number | null>;
  const answered = SURVEY_GROUPS.map((g) => groups[g]).filter((v): v is number => v !== null);
  const overall = answered.length ? Math.round(answered.reduce((s, v) => s + v, 0) / answered.length) : null;

  const npsValues = rows.map((r) => r.nps).filter((v): v is number => v !== null);
  const promoters = npsValues.filter((v) => v >= 9).length;
  const detractors = npsValues.filter((v) => v <= 6).length;
  const promotersPct = pct(promoters, npsValues.length);
  const detractorsPct = pct(detractors, npsValues.length);
  const nps = npsValues.length ? promotersPct - detractorsPct : null;

  const perfect = rows.filter((r) => r.nps === 10 && r.ratings.every((v) => v === 5)).length;
  const perfectPct = pct(perfect, n);

  const timed = rows.filter((r) => r.seconds !== null);
  const rushed = timed.filter((r) => (r.seconds ?? 0) < rushSeconds).length;
  const rushedPct = timed.length ? pct(rushed, timed.length) : null;

  const weakQuestions = SURVEY_QUESTIONS.map((q, i) => {
    const values = rows.map((r) => r.ratings[i]).filter((v): v is number => v !== null);
    const low = values.filter((v) => v <= 3).length;
    return {
      id: q.id,
      group: q.group,
      lowSharePct: pct(low, values.length),
      avg: values.length ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10 : 0,
    };
  })
    .filter((q) => q.lowSharePct > 0)
    .sort((a, b) => b.lowSharePct - a.lowSharePct || a.avg - b.avg)
    .slice(0, 3);

  return {
    responses: n,
    reliable: n >= MIN_RESPONSES,
    groups,
    overall,
    nps,
    promotersPct,
    detractorsPct,
    perfectPct,
    perfectWarning: n > 0 && perfectPct >= perfectWarnPct,
    rushedPct,
    // no extra threshold: any survey filled faster than rushSeconds (OCAQ: 90 s) is worth a look
    rushedWarning: rushedPct !== null && rushed > 0,
    weakQuestions,
  };
}
