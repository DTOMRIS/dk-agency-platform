/**
 * @file jobs.ts
 * @purpose TQTA (tqta.az) iş elanlarını DK vitrini üçün oxuyur. DK bazasına yazılmır —
 * CV, uyğunlaşdırma və müraciət TQTA-da qalır (TASK-0495, sahib qərarı: DK vitrin, TQTA mühərrik).
 *
 * Qayda: `?slug=` sorğusu ÇAĞIRILMIR — TQTA-da baxış sayğacını artırır.
 */

import { z } from 'zod';

export const TQTA_ORIGIN = 'https://tqta.az';
const DEFAULT_API_URL = `${TQTA_ORIGIN}/api/jobs?aktif=true&limit=100`;
const FETCH_TIMEOUT_MS = 8000;
const REVALIDATE_SECONDS = 3600;
const UTM = 'utm_source=dkagency&utm_medium=referral&utm_campaign=jobs';
/** tesvir + telebler birlikdə bundan qısadırsa elan «boş» sayılır. */
const MIN_CONTENT_CHARS = 20;

export const JOB_CATEGORIES = [
  'aspazliq',
  'konditer',
  'barista',
  'kafe',
  'restoran',
  'idareetme',
  'otel',
  'turizm',
  'diger',
] as const;
export type JobCategory = (typeof JOB_CATEGORIES)[number];

export const JOB_TYPES = ['tam_gun', 'yarim_gun', 'staj', 'freelance', 'uzaqdan'] as const;
export type JobType = (typeof JOB_TYPES)[number];

const nullableText = z.string().nullish();

const rawJobSchema = z.object({
  id: z.number(),
  baslik: z.string(),
  slug: z.string(),
  sirket: z.string(),
  sirketLogo: nullableText,
  lokasyon: nullableText,
  isTipi: nullableText,
  tecrube: nullableText,
  maas: nullableText,
  tesvir: nullableText,
  telebler: nullableText,
  kategori: nullableText,
  basvuruLinki: nullableText,
  sonBasvuruTarixi: nullableText,
  oneCikan: z.boolean().nullish(),
  aktif: z.boolean().nullish(),
  createdAt: nullableText,
});
export type RawTqtaJob = z.infer<typeof rawJobSchema>;

const responseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.unknown()),
});

export interface TqtaJob {
  id: number;
  title: string;
  company: string;
  initials: string;
  logoUrl: string | null;
  city: string;
  cityKey: string;
  type: JobType;
  category: JobCategory;
  salary: string | null;
  experience: string | null;
  excerpt: string;
  featured: boolean;
  postedAt: string | null;
  applyUrl: string;
}

export interface RejectedTqtaJob {
  id: number;
  title: string;
  reason: 'inactive' | 'expired' | 'no_content' | 'test_data' | 'invalid_shape';
}

export interface TqtaJobsResult {
  ok: boolean;
  jobs: TqtaJob[];
  rejected: RejectedTqtaJob[];
}

/* ------------------------------------------------------------------ */
/*  Normalizers                                                        */
/* ------------------------------------------------------------------ */

function clean(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

/** HTML/markdown-u düz mətnə çevirir. */
function plain(value: string | null | undefined): string {
  return clean(
    (value ?? '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[#*_`>|]+/g, ' ')
      .replace(/&nbsp;/g, ' ')
  );
}

/** AZ/TR hərflərini ASCII-yə endirir — şəhər açarı üçün. */
export function foldText(value: string): string {
  return value
    .toLocaleLowerCase('az')
    .replace(/ı/g, 'i')
    .replace(/ə/g, 'e')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const KNOWN_CITIES: Record<string, string> = {
  baki: 'Bakı',
  baku: 'Bakı',
  sumqayit: 'Sumqayıt',
  gence: 'Gəncə',
  quba: 'Quba',
  qusar: 'Qusar',
  qebele: 'Qəbələ',
  seki: 'Şəki',
  lenkeran: 'Lənkəran',
  mingecevir: 'Mingəçevir',
  naxcivan: 'Naxçıvan',
  sirvan: 'Şirvan',
  xacmaz: 'Xaçmaz',
  ismayilli: 'İsmayıllı',
};

/** Bakının rayon/qəsəbə adları — ünvan kimi yazılıbsa şəhəri Bakı sayırıq. */
const BAKU_HINTS = [
  'nerimanov',
  'nesimi',
  'yasamal',
  'xetai',
  'sebail',
  'sabail',
  'binegedi',
  'nizami',
  'suraxani',
  'sabuncu',
  'xezer',
  'qaradag',
  'nardaran',
  'nardalan',
  'ag seher',
  'sixov',
  'insaatcilar',
  'bilgeh',
];

export function normalizeCity(raw: string | null | undefined): { city: string; key: string } {
  const text = clean(raw).replace(/[;,.]+$/, '');
  const folded = foldText(text);
  if (!folded) return { city: '', key: '' };
  for (const [key, label] of Object.entries(KNOWN_CITIES)) {
    if (folded === key || folded.split(' ').includes(key)) return { city: label, key };
  }
  if (BAKU_HINTS.some((hint) => folded.includes(hint))) return { city: 'Bakı', key: 'baki' };
  return { city: text, key: folded.replace(/ /g, '-') };
}

export function normalizeCategory(raw: string | null | undefined): JobCategory {
  const value = clean(raw).toLowerCase();
  return (JOB_CATEGORIES as readonly string[]).includes(value) ? (value as JobCategory) : 'diger';
}

export function normalizeType(raw: string | null | undefined): JobType {
  const value = clean(raw).toLowerCase();
  return (JOB_TYPES as readonly string[]).includes(value) ? (value as JobType) : 'tam_gun';
}

const IMAGE_EXT = /\.(png|jpe?g|webp|svg|gif|avif)(\?.*)?$/i;
const IMAGE_HOSTS = [
  'res.cloudinary.com',
  'images.unsplash.com',
  'blob.vercel-storage.com',
  'googleusercontent.com',
  'i.imgur.com',
  'supabase.co',
];

/** Logo yalnız şəkil URL-i kimi görünürsə qəbul olunur (veb səhifə URL-i yox). */
export function imageUrlOrNull(raw: string | null | undefined): string | null {
  const value = clean(raw);
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (IMAGE_EXT.test(url.pathname)) return url.toString();
  if (IMAGE_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
    return url.toString();
  }
  return null;
}

export function companyInitials(company: string): string {
  const words = clean(company)
    .split(' ')
    .filter((w) => /[\p{L}\p{N}]/u.test(w));
  const letters = words.slice(0, 2).map((w) => (w.match(/[\p{L}\p{N}]/u) ?? [''])[0]);
  return letters.join('').toLocaleUpperCase('az') || '•';
}

function withUtm(url: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}${UTM}`;
}

/** TQTA-da elanın səhifəsi: /karyera/{slug}. Xarici (ext-) elanlar TQTA-da səhifəsizdir. */
export function tqtaApplyUrl(slug: string, externalLink?: string | null): string {
  if (slug.startsWith('ext-')) {
    const link = clean(externalLink);
    if (/^https?:\/\//i.test(link)) return link;
    return withUtm(`${TQTA_ORIGIN}/karyera`);
  }
  return withUtm(`${TQTA_ORIGIN}/karyera/${encodeURIComponent(slug)}`);
}

export const TQTA_EMPLOYER_URL = withUtm(`${TQTA_ORIGIN}/isverenler`);
export const TQTA_HOME_URL = withUtm(TQTA_ORIGIN);
export const TQTA_CAREER_URL = withUtm(`${TQTA_ORIGIN}/karyera`);

const CONTACT_PATTERN = /(\+?\d[\d\s()-]{7,}\d)|([\w.+-]+@[\w-]+\.[\w.]+)/g;

const CONTACT_LABEL = /^(ünvan|unvan|əlaqə nömrəsi|elaqe nomresi|əlaqə|e-poçt|e-poct|e-mail|email|telefon|tel|mobil)$/iu;

/** Sətir-sətir siyahını (tələblər) «a · b · c» kimi birləşdirir. */
function joinLines(value: string | null | undefined): string {
  return (value ?? '')
    .split(/\r?\n+/)
    .map((line) =>
      plain(line)
        // Müraciət TQTA-da qalır: telefon/e-poçt vitrinə çıxarılmır.
        .replace(CONTACT_PATTERN, ' ')
        .replace(/\b(zəng edin|zeng edin|əlaqə|elaqe|whatsapp)\b[:\s]*/giu, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^[-•✓✔*:]+\s*/u, '')
        .replace(/[.;,:]+$/, '')
    )
    .filter((line) => /[\p{L}]{2,}/u.test(line) && !CONTACT_LABEL.test(line))
    .filter(Boolean)
    .join(' · ');
}

function excerptOf(job: RawTqtaJob): string {
  const description = joinLines(job.tesvir);
  const requirements = joinLines(job.telebler);
  const text = description.length >= 40 || !requirements ? description : [description, requirements].filter(Boolean).join(' · ');
  return text.length > 220 ? `${text.slice(0, 217).trimEnd()}…` : text;
}

/** Elan vitrinə çıxa bilərmi? Çıxa bilmirsə səbəbi qaytarır. */
export function rejectReason(
  job: RawTqtaJob,
  now: Date = new Date()
): RejectedTqtaJob['reason'] | null {
  if (job.aktif === false) return 'inactive';
  if (job.sonBasvuruTarixi) {
    const deadline = new Date(job.sonBasvuruTarixi);
    if (!Number.isNaN(deadline.getTime()) && deadline.getTime() < now.getTime()) return 'expired';
  }
  if (/\be2e\b/i.test(job.baslik)) return 'test_data';
  if (`${plain(job.tesvir)}${plain(job.telebler)}`.length < MIN_CONTENT_CHARS) return 'no_content';
  return null;
}

export function normalizeJob(job: RawTqtaJob): TqtaJob {
  const company = clean(job.sirket);
  const { city, key } = normalizeCity(job.lokasyon);
  return {
    id: job.id,
    title: clean(job.baslik),
    company,
    initials: companyInitials(company),
    logoUrl: imageUrlOrNull(job.sirketLogo),
    city,
    cityKey: key,
    type: normalizeType(job.isTipi),
    category: normalizeCategory(job.kategori),
    salary: clean(job.maas) || null,
    experience: clean(job.tecrube) || null,
    excerpt: excerptOf(job),
    featured: job.oneCikan === true,
    postedAt: job.createdAt ?? null,
    applyUrl: tqtaApplyUrl(job.slug, job.basvuruLinki),
  };
}

/** Xam API cavabını yoxlayır, süzür, normallaşdırır. Saf funksiya — test oluna bilir. */
export function processTqtaPayload(payload: unknown, now: Date = new Date()): TqtaJobsResult {
  const parsed = responseSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) return { ok: false, jobs: [], rejected: [] };

  const jobs: TqtaJob[] = [];
  const rejected: RejectedTqtaJob[] = [];
  for (const item of parsed.data.data) {
    const row = rawJobSchema.safeParse(item);
    if (!row.success) {
      const id = typeof item === 'object' && item && 'id' in item ? Number(item.id) : -1;
      rejected.push({ id, title: '', reason: 'invalid_shape' });
      continue;
    }
    const reason = rejectReason(row.data, now);
    if (reason) {
      rejected.push({ id: row.data.id, title: clean(row.data.baslik), reason });
      continue;
    }
    jobs.push(normalizeJob(row.data));
  }

  jobs.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return (b.postedAt ?? '').localeCompare(a.postedAt ?? '');
  });
  return { ok: true, jobs, rejected };
}

/**
 * TQTA-dan aktiv elanları gətirir. Xəta/timeout halında `{ ok: false, jobs: [] }` —
 * səhifə heç vaxt 500 vermir. `TQTA_JOBS_API_URL` yalnız lokal test üçündür.
 */
export async function getTqtaJobs(): Promise<TqtaJobsResult> {
  const url = process.env.TQTA_JOBS_API_URL || DEFAULT_API_URL;
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return { ok: false, jobs: [], rejected: [] };
    const payload: unknown = await response.json();
    return processTqtaPayload(payload);
  } catch {
    return { ok: false, jobs: [], rejected: [] };
  }
}
