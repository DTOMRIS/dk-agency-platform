'use server';

import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess, logToolRun } from '@/lib/marketing-gating';
import { AI_MODELS } from '@/lib/ai-models';

export type ComplaintChannel = 'face_to_face' | 'phone' | 'whatsapp' | 'google_maps' | 'instagram' | 'other';
export type CustomerType = 'first_time' | 'regular' | 'unknown';
export type ComplaintCategory =
  | 'food_quality'
  | 'wait_speed'
  | 'cleanliness'
  | 'service_staff'
  | 'price_bill'
  | 'delivery'
  | 'other';
export type ComplaintSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ComplaintAnalysisInput {
  complaintText: string;
  channel: ComplaintChannel;
  customerType: CustomerType;
  date?: string;
  clientCategory?: ComplaintCategory;
  locale?: string;
}

export interface ComplaintAnalysisResult {
  category: ComplaintCategory;
  secondaryCategories: ComplaintCategory[];
  severity: ComplaintSeverity;
  severityReason: string;
  discoveryQuestions: string[];
  customerResponse: string;
  internalNote: {
    owner: string;
    processCheck: string;
    note: string;
  };
  capa: {
    investigation: string;
    closureCriteria: string;
    correctiveAction: string;
    preventiveAction: string;
    recurrenceCheck: string;
  };
  followUpRecommendation: string;
  /** TASK-0523: reply-by time from severity, set in code (critical 1 h · high 4 h · medium 24 h · low 48 h). */
  responseWithinHours?: number;
}

const RESPONSE_SLA_HOURS: Record<ComplaintSeverity, number> = { critical: 1, high: 4, medium: 24, low: 48 };

export type ComplaintAnalysisActionResult =
  | { ok: true; data: ComplaintAnalysisResult }
  | { ok: false; error: 'unauthorized' | 'rate-limited' | 'validation' | 'missing-key' | 'ai-failed' | 'ai-output-invalid' };

const RATE_COOKIE = 'dk_complaint_analysis_runs';
const WINDOW_MS = 10 * 60 * 1000;
const MAX_RUNS = 5;

function sanitizeInput(input: ComplaintAnalysisInput): ComplaintAnalysisInput | null {
  const complaintText = input.complaintText.trim().replace(/\s+/g, ' ').slice(0, 1000);
  if (complaintText.length < 20) return null;

  if (!['face_to_face', 'phone', 'whatsapp', 'google_maps', 'instagram', 'other'].includes(input.channel)) return null;
  if (!['first_time', 'regular', 'unknown'].includes(input.customerType)) return null;
  if (input.clientCategory && !['food_quality', 'wait_speed', 'cleanliness', 'service_staff', 'price_bill', 'delivery', 'other'].includes(input.clientCategory)) {
    return null;
  }

  return {
    complaintText,
    channel: input.channel,
    customerType: input.customerType,
    date: input.date?.trim().slice(0, 20),
    clientCategory: input.clientCategory,
    locale: ['az', 'ru', 'en', 'tr'].includes(input.locale ?? '') ? input.locale : 'az',
  };
}

async function checkRateLimit(userId: number): Promise<boolean> {
  const store = await cookies();
  const now = Date.now();
  const raw = store.get(RATE_COOKIE)?.value;
  let records: Array<{ userId: number; at: number }> = [];

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Array<{ userId: number; at: number }>;
      if (Array.isArray(parsed)) {
        records = parsed.filter((record) =>
          Number.isInteger(record.userId) &&
          Number.isFinite(record.at) &&
          now - record.at < WINDOW_MS
        );
      }
    } catch {
      records = [];
    }
  }

  if (records.filter((record) => record.userId === userId).length >= MAX_RUNS) {
    return false;
  }

  records.push({ userId, at: now });
  store.set(RATE_COOKIE, JSON.stringify(records).slice(0, 1800), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: WINDOW_MS / 1000,
  });

  return true;
}

const OUTPUT_LANGUAGE: Record<string, string> = {
  az: 'Azərbaycan dilində (düzgün hərflərlə: ə, ı, ö, ü, ç, ş, ğ)',
  ru: 'на русском языке',
  en: 'in English',
  tr: 'Türkçe',
};

// TASK-0523: proper Azerbaijani, output in the page language, and no compensation promise
// (owner 2026-10-09: default = apology + fix; the owner adds an offer himself if he wants).
function buildSystemPrompt(locale: string) {
  return `Sən Azərbaycan restoranları üçün qonaq şikayətləri ilə işləyən mütəxəssissən.
Əsas prinsip: qonaq çox vaxt problemin özündən yox, ona necə yanaşıldığından narazı qalır.

Qaydalar:
- Ton insan kimi olsun, robot kimi yox; qonaq özünü «emal olunmuş» hiss etməsin.
- Cavab konkret olsun: şikayəti adlandır, məsuliyyət götür, növbəti addımı de. «Bağışlayın» ilə quru başlama.
- Qonağa cavabda kompensasiya (endirim, kupon, pulsuz yemək, ikram, geri ödəmə) VƏD ETMƏ — yalnız üzr + həll + əlaqəyə dəvət.
- Baş verməmiş şeyi (işçi cəzalandırıldı, kamera baxıldı) fakt kimi yazma.
- Statistika və ya «tədqiqat göstərir» kimi iddia uydurma.
- severity: low (narahatlıq), medium (pis təcrübə), high (qonaq itirilir / ictimai şikayət), critical (sağlamlıq, təhlükəsizlik, yad cisim, zəhərlənmə).
- Bütün mətn ${OUTPUT_LANGUAGE[locale] ?? OUTPUT_LANGUAGE.az} olsun. JSON açarları və kateqoriya/severity dəyərləri ingiliscə qalsın.

Cavabı yalnız bu JSON strukturunda qaytar:
{
  "category": "food_quality | wait_speed | cleanliness | service_staff | price_bill | delivery | other",
  "secondaryCategories": ["food_quality"],
  "severity": "low | medium | high | critical",
  "severityReason": "qısa əsaslandırma",
  "discoveryQuestions": ["vəziyyətə uyğun 3-5 sual"],
  "customerResponse": "kanala və qonaq növünə uyğun cavab",
  "internalNote": {
    "owner": "mətbəx | menecer | xidmət | kuryer | kassir",
    "processCheck": "yoxlanılacaq iş qaydası",
    "note": "qonağa göstərilməyən daxili qeyd"
  },
  "capa": {
    "investigation": "yoxlanılacaq faktlar",
    "closureCriteria": "şikayət nə vaxt bağlanmış sayılır",
    "correctiveAction": "bu hadisə üçün düzəldici addım",
    "preventiveAction": "təkrar olmasın deyə qabaqlayıcı addım",
    "recurrenceCheck": "7-14 gün sonra baxılacaq göstərici"
  },
  "followUpRecommendation": "24-48 saat sonra göndəriləcək mesaj tövsiyəsi"
}`;
}

const CHANNEL_LABEL: Record<string, string> = {
  face_to_face: 'üzbəüz', phone: 'telefon', whatsapp: 'WhatsApp', google_maps: 'Google Maps rəyi', instagram: 'Instagram', other: 'digər',
};
const CUSTOMER_LABEL: Record<string, string> = { first_time: 'ilk dəfə gələn', regular: 'daimi qonaq', unknown: 'bilinmir' };

function buildPrompt(input: ComplaintAnalysisInput) {
  return `Şikayət: ${input.complaintText}
Kanal: ${CHANNEL_LABEL[input.channel] ?? input.channel}
Qonaq: ${CUSTOMER_LABEL[input.customerType] ?? input.customerType}
Tarix: ${input.date || 'bilinmir'}
İlkin kateqoriya (açar sözlərdən): ${input.clientCategory || 'bilinmir'}

Ver:
1. Bir əsas kateqoriya və varsa ikinci dərəcəli kateqoriyalar
2. Ciddilik və əsaslandırma
3. Aydınlaşdırma sualları: hansı gün/saat, masa/zona, hansı işçi, əvvəl gəlibmi və s. — 3-5 konkret sual
4. Qonağa cavab: daimi qonağa isti ton və [Ad] yeri; ilk dəfə gələnə etimad yaradan ton; Google/Instagram-da hamının oxuduğunu nəzərə alan ton
5. Daxili qeyd: kimə çatdırılmalı, hansı iş qaydası yoxlanmalı
6. Düzəliş planı: araşdırma, bağlama meyarı, düzəldici və qabaqlayıcı addım, 7-14 gün sonra yoxlama göstəricisi
7. 24-48 saat sonra təkrar əlaqə tövsiyəsi`;
}

function isValidResult(value: unknown): value is ComplaintAnalysisResult {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<ComplaintAnalysisResult>;
  return (
    typeof data.category === 'string' &&
    Array.isArray(data.secondaryCategories) &&
    typeof data.severity === 'string' &&
    typeof data.severityReason === 'string' &&
    Array.isArray(data.discoveryQuestions) &&
    typeof data.customerResponse === 'string' &&
    !!data.internalNote &&
    typeof data.internalNote.owner === 'string' &&
    typeof data.internalNote.processCheck === 'string' &&
    typeof data.internalNote.note === 'string' &&
    !!data.capa &&
    typeof data.capa.investigation === 'string' &&
    typeof data.capa.closureCriteria === 'string' &&
    typeof data.capa.correctiveAction === 'string' &&
    typeof data.capa.preventiveAction === 'string' &&
    typeof data.capa.recurrenceCheck === 'string' &&
    typeof data.followUpRecommendation === 'string'
  );
}

export async function analyzeComplaint(input: ComplaintAnalysisInput): Promise<ComplaintAnalysisActionResult> {
  const auth = await getAuthFromCookie();
  if (!auth) return { ok: false, error: 'unauthorized' };

  const access = await checkToolAccess(auth.userId, 'sikayet-analitigi', auth.role);
  if (!access.allowed) return { ok: false, error: 'unauthorized' };

  const sanitized = sanitizeInput(input);
  if (!sanitized) return { ok: false, error: 'validation' };

  const allowed = await checkRateLimit(auth.userId);
  if (!allowed) return { ok: false, error: 'rate-limited' };

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return { ok: false, error: 'missing-key' };

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_MODELS.deepseek.chat,
        temperature: 0.35,
        max_tokens: 1400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt(sanitized.locale ?? 'az') },
          { role: 'user', content: buildPrompt(sanitized) },
        ],
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) return { ok: false, error: 'ai-failed' };

    const raw = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = raw.choices?.[0]?.message?.content;
    if (!content) return { ok: false, error: 'ai-failed' };

    const parsed = JSON.parse(content) as unknown;
    if (!isValidResult(parsed)) return { ok: false, error: 'ai-output-invalid' };

    await logToolRun({ userId: auth.userId, toolSlug: 'sikayet-analitigi', input: { ...sanitized }, status: 'success' });
    return {
      ok: true,
      data: {
        ...parsed,
        discoveryQuestions: parsed.discoveryQuestions.slice(0, 5),
        customerResponse: parsed.customerResponse.slice(0, 2000),
        followUpRecommendation: parsed.followUpRecommendation.slice(0, 1000),
        responseWithinHours: RESPONSE_SLA_HOURS[parsed.severity] ?? 24,
      },
    };
  } catch {
    return { ok: false, error: 'ai-failed' };
  }
}
