/**
 * @file lib/news/owner-feedback.ts
 * @purpose TASK-0561 (Doğan 25.11.2026: «reddettiğim haberlere göre akıllandır»). In the 30 days before this
 *          task the owner rejected 43% of the drafts sent to Telegram. Three patterns: (1) the same event again
 *          from another feed or language a day later (Hanoi «Bakı guşəsi» ×6, Şuşa ×5, By Fateh ×4, 47 şadlıq
 *          sarayı ×4), (2) hotel-software vendor opinion/PR pieces, (3) far-away hotel projects.
 *          (1) is caught deterministically on the AZ draft title (all drafts are AZ, so it works across source
 *          languages); (2)+(3) are learned by the editor pass from the owner's own recent decisions.
 */

import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { storyKey } from './story-dedupe';

/** Reject reasons the owner can tap after ❌ (code → Telegram button label + editor wording). */
export const REJECT_REASONS = {
  dup: { button: '🔁 Təkrar', editor: 'təkrar xəbər' },
  pr: { button: '📣 Reklam / PR', editor: 'şirkət reklamı və ya PR yazısı' },
  far: { button: '🌍 Uzaq mövzu', editor: 'Azərbaycan oxucusu üçün uzaq mövzu' },
  weak: { button: '😐 Maraqsız', editor: 'xəbər dəyəri zəifdir' },
} as const;

export type RejectReason = keyof typeof REJECT_REASONS;

export function isRejectReason(value: string): value is RejectReason {
  return Object.prototype.hasOwnProperty.call(REJECT_REASONS, value);
}

export type OwnerDecisionContext = {
  /** AZ titles already sent to the owner in the last 7 days (any decision, including undecided). */
  recentTitles: string[];
  approved: string[];
  rejected: Array<{ title: string; reason: RejectReason | null }>;
};

export const EMPTY_DECISION_CONTEXT: OwnerDecisionContext = {
  recentTitles: [],
  approved: [],
  rejected: [],
};

const EXAMPLES_PER_SIDE = 25;

/**
 * Loads the owner's recent decisions once per synthesis run. Never throws: without context the
 * pipeline behaves exactly as before (the column from migration 0025 is optional here).
 */
export async function loadDecisionContext(): Promise<OwnerDecisionContext> {
  if (!db) return EMPTY_DECISION_CONTEXT;
  try {
    const recent = await db.execute(sql`SELECT coalesce(a.title_az, a.title) AS title
      FROM news_approval_delivery d JOIN news_articles a ON a.id = d.article_id
      WHERE d.updated_at > now() - interval '7 days' AND d.state <> 'held'`);
    const decided =
      await db.execute(sql`SELECT coalesce(a.title_az, a.title) AS title, a.status::text AS status,
        to_jsonb(d) ->> 'reject_reason' AS reason
      FROM news_approval_delivery d JOIN news_articles a ON a.id = d.article_id
      WHERE d.updated_at > now() - interval '21 days' AND a.status IN ('approved', 'rejected')
      ORDER BY d.updated_at DESC LIMIT 200`);
    const approved: string[] = [];
    const rejected: OwnerDecisionContext['rejected'] = [];
    for (const row of decided.rows) {
      const title = String(row.title ?? '').trim();
      if (!title) continue;
      if (row.status === 'approved' && approved.length < EXAMPLES_PER_SIDE) approved.push(title);
      if (row.status === 'rejected' && rejected.length < EXAMPLES_PER_SIDE) {
        const reason = String(row.reason ?? '');
        rejected.push({ title, reason: isRejectReason(reason) ? reason : null });
      }
    }
    return {
      recentTitles: recent.rows.map((r) => String(r.title ?? '').trim()).filter(Boolean),
      approved,
      rejected,
    };
  } catch {
    return EMPTY_DECISION_CONTEXT;
  }
}

/**
 * Stems that appear in most AZ HoReCa titles and say nothing about the event («Azərbaycan», «turizm»,
 * «Bakıda», «təqdim olunub», «aşkarlanıb» …). Without this list, unrelated events were matched
 * (TASK-0561 replay: 10% of approved drafts flagged).
 */
const COMMON_STEMS = new Set(
  ('azərb bakıd bakın bakı turiz turis resto otell oteli otelə otel sekto şəhər keçir keçib təqdi olunu ' +
    'artıb azalı aşkar fəali müəss xəbər ölkə dövlə təşki tədbi müzak mərhə ilind ayınd faiz manat milyo ' +
    'milya qonaq iaşə ictim xidmə şirkə bazar inkiş layih yerli beynə əsas qida müəyy ' +
    'mətbə xərcl xərci axını gəlir vaxtı keçmi məhsu sənəd semin'
  ).split(' '),
);

/**
 * Azerbaijani is agglutinative: «sarayından» / «sarayında» / «sarayı» are one word for dedupe purposes.
 * Compare 5-letter stems; numbers stay whole (one-digit counts are too common to identify an event).
 */
function stems(title: string): { words: Set<string>; numbers: Set<string> } {
  const key = storyKey(title.toLocaleLowerCase('az'));
  const words = new Set<string>();
  const numbers = new Set<string>();
  for (const w of key.words) {
    if (/^\d/.test(w)) {
      const n = w.replace(/\D.*$/, '');
      if (n.length >= 2) numbers.add(n);
    } else if (!COMMON_STEMS.has(w.slice(0, 5)) && !COMMON_STEMS.has(w.slice(0, 4))) {
      words.add(w.slice(0, 5));
    }
  }
  return { words, numbers };
}

/**
 * Same event as an AZ title the owner already saw this week (conservative — the editor pass also
 * judges repeats; this backstop must not hide a genuinely new event):
 * two shared figures (e.g. «47» and «41») plus one distinctive stem, or ≥ 3 distinctive stems
 * covering ≥ 70% of the shorter title.
 */
export function repeatsRecentTitle(titleAz: string, recentTitles: string[]): string | null {
  const a = stems(titleAz);
  if (a.words.size === 0) return null;
  for (const other of recentTitles) {
    const b = stems(other);
    if (b.words.size === 0) continue;
    let shared = 0;
    for (const w of a.words) if (b.words.has(w)) shared += 1;
    let sharedNumbers = 0;
    for (const n of a.numbers) if (b.numbers.has(n)) sharedNumbers += 1;
    if (sharedNumbers >= 2 && shared >= 1) return other;
    if (shared >= 3 && shared / Math.min(a.words.size, b.words.size) >= 0.7) return other;
  }
  return null;
}

/** Block appended to the editor's input: the owner's taste, learned from his last decisions. */
export function ownerTasteBlock(context: OwnerDecisionContext): string {
  if (!context.approved.length && !context.rejected.length && !context.recentTitles.length)
    return '';
  const lines: string[] = [];
  if (context.recentTitles.length) {
    lines.push(
      'BU HƏFTƏ SAHİBƏ ARTIQ GÖNDƏRİLƏN BAŞLIQLAR (eyni hadisədirsə → reject, reject_reason: "təkrar xəbər"):'
    );
    lines.push(...context.recentTitles.slice(0, 80).map((t) => `- ${t}`));
  }
  if (context.approved.length) {
    lines.push('', 'SAHİBİN SON TƏSDİQLƏDİKLƏRİ:');
    lines.push(...context.approved.map((t) => `+ ${t}`));
  }
  if (context.rejected.length) {
    lines.push('', 'SAHİBİN SON RƏDD ETDİKLƏRİ (səbəb məlumdursa mötərizədə):');
    lines.push(
      ...context.rejected.map(
        (r) => `- ${r.title}${r.reason ? ` (${REJECT_REASONS[r.reason].editor})` : ''}`
      )
    );
  }
  return lines.join('\n');
}

/** TASK-0561: store why the owner rejected a draft (only for an article that really is rejected). */
export async function recordRejectReason(articleId: number, reason: RejectReason): Promise<boolean> {
  if (!db) return false;
  try {
    const result = await db.execute(sql`UPDATE news_approval_delivery d SET reject_reason = ${reason}, updated_at = now()
      FROM news_articles a WHERE a.id = d.article_id AND d.article_id = ${articleId} AND a.status = 'rejected'
      RETURNING d.article_id`);
    return result.rows.length > 0;
  } catch {
    // Before migration 0025 the column does not exist — the button just answers «Qeyd alınmadı».
    return false;
  }
}

/** Inline keyboard shown under a rejected draft: one tap tells the pipeline why. */
export function rejectReasonButtons(articleId: number, prefix: string): Array<Array<{ text: string; callback_data: string }>> {
  const items = (Object.keys(REJECT_REASONS) as RejectReason[]).map((code) => ({
    text: REJECT_REASONS[code].button,
    callback_data: `${prefix}${code}:${articleId}`,
  }));
  return [items.slice(0, 2), items.slice(2)];
}

/** Parses `news:why:<code>:<id>`; null for anything else. */
export function parseReasonCallback(data: string, prefix: string): { reason: RejectReason; articleId: number } | null {
  if (!data.startsWith(prefix)) return null;
  const [code, id] = data.slice(prefix.length).split(':');
  const articleId = Number(id);
  if (!isRejectReason(code ?? '') || !Number.isSafeInteger(articleId) || articleId <= 0) return null;
  return { reason: code as RejectReason, articleId };
}
