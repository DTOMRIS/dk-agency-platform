/**
 * Bloq tərcüməsi — arxa plan işləri (TASK-0455).
 *
 * Tərcümə uzun yazıda 1–3 dəqiqə çəkir; admin sorğusu bu qədər açıq qalanda
 * proxy bağlantını kəsir və redaktor «Tərcümə xidməti əlçatmadı» göstərirdi.
 * İndi POST işi başladıb dərhal cavab verir, redaktor GET ilə vəziyyəti soruşur.
 *
 * Vəziyyət prosesin yaddaşındadır: Hostinger bir uzunömürlü Node prosesidir.
 * Proses yenidən başlasa iş itir — GET «idle» qaytarır, redaktor bunu deyir.
 * Eyni yazı üçün ikinci iş başlamır (yaradılışdakı avtomatik tərcümə də daxil).
 */

import {
  translateBlogPostBySlug,
  type BlogTranslateOptions,
  type BlogTranslateResult,
} from '@/lib/db/blog-repository';

export type TranslationJobStatus = 'running' | 'done' | 'failed';

export interface TranslationJob {
  status: TranslationJobStatus;
  force: boolean;
  startedAt: number;
  finishedAt?: number;
  result?: BlogTranslateResult;
}

/** Bu müddətdən uzun «running» qalan iş ilişib sayılır — yenisi başlaya bilər */
const STALE_MS = 15 * 60_000;
/** Bitmiş işlər bu müddətdən sonra yaddaşdan silinir */
const KEEP_MS = 60 * 60_000;

// globalThis: dev HMR və ayrı route bundle-ları eyni xəritəni görsün
const store = globalThis as unknown as { __dkBlogTranslationJobs?: Map<string, TranslationJob> };
const jobs: Map<string, TranslationJob> = (store.__dkBlogTranslationJobs ??= new Map());

function prune(now: number) {
  for (const [slug, job] of jobs) {
    if (job.finishedAt && now - job.finishedAt > KEEP_MS) jobs.delete(slug);
  }
}

export function getTranslationJob(slug: string): TranslationJob | null {
  return jobs.get(slug) ?? null;
}

/**
 * İşi başladır (və ya gedən işi qaytarır). `done` — işin sonu; route onu
 * `after()`-ə verir ki, cavabdan sonra da işləməyə davam etsin.
 */
export function startTranslationJob(
  slug: string,
  options: BlogTranslateOptions = {}
): { job: TranslationJob; started: boolean; done: Promise<void> } {
  const now = Date.now();
  prune(now);

  const existing = jobs.get(slug);
  if (existing?.status === 'running' && now - existing.startedAt < STALE_MS) {
    return { job: existing, started: false, done: Promise.resolve() };
  }

  const job: TranslationJob = { status: 'running', force: Boolean(options.force), startedAt: now };
  jobs.set(slug, job);

  const done = translateBlogPostBySlug(slug, options)
    .then((result) => {
      job.result = result;
      job.status = result.ok && !result.error ? 'done' : 'failed';
    })
    .catch((err: unknown) => {
      job.result = {
        ok: false,
        langs: { ru: 'failed', en: 'failed', tr: 'failed' },
        error: String(err).slice(0, 300),
      };
      job.status = 'failed';
    })
    .finally(() => {
      job.finishedAt = Date.now();
    });

  return { job, started: true, done };
}
