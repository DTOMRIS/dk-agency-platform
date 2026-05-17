'use server';

import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';

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
}

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

const SYSTEM_PROMPT = `Sen Azerbaycan restoranlari ucun sikayet idareetme mutexessisisen.
2026 musteri xidmeti standartlarinda suret vacibdir, amma hell keyfiyyeti ve insani ton daha vacibdir.
Esas prinsip: musteri sikayetin sebebinden deyil, ele alinma biciminden narazi qalir.

Kontekst:
- Sikayet etmeyen narazi musterilerin boyuk qismi geri donmur; sikayet eden musteri problemi duzeltmek sansi verir.
- Duzgun hell olunan problem marka haqqinda musbet sohbet yarada biler.
- AI tonu robot kimi yox, insan kimi olmalidir; musteri ozunu emal edilmis hiss etmemelidir.
- Cavab spesifik olmalidir: sikayeti adlandir, konkret addim ver, ohdelik gotur.
- Generic "bagislayin" cumlesi ile baslama. Meseleni adlandir, mesuliyyet gotur, novbeti addimi de.

Cavabi yalniz bu JSON strukturunda qaytar:
{
  "category": "food_quality | wait_speed | cleanliness | service_staff | price_bill | delivery | other",
  "secondaryCategories": ["food_quality"],
  "severity": "low | medium | high | critical",
  "severityReason": "qisa esaslandirma",
  "discoveryQuestions": ["3-5 kontekste uygun sual"],
  "customerResponse": "kanala ve musteri novune uygun cavab sablonu",
  "internalNote": {
    "owner": "metbex | menecer | xidmet | kuryer | kassir",
    "processCheck": "yoxlanilacaq proses",
    "note": "musteriye gosterilmeyen daxili qeyd"
  },
  "capa": {
    "investigation": "sikayetin arasdirilmasi ucun yoxlanacaq faktlar",
    "closureCriteria": "sikayet ne zaman baglanmis sayilir",
    "correctiveAction": "bu hadise ucun duzeldici fealiyyet",
    "preventiveAction": "tekrar olmamasi ucun onleyici fealiyyet",
    "recurrenceCheck": "7-14 gun sonra yoxlanacaq indikator"
  },
  "followUpRecommendation": "24-48 saat sonra gonderilecek follow-up tovsiye/metn"
}`;

function buildPrompt(input: ComplaintAnalysisInput) {
  return `Sikayet: ${input.complaintText}
Kanal: ${input.channel}
Musteri novu: ${input.customerType}
Tarix: ${input.date || 'bilinmir'}
Client-side ilkin kategoriya: ${input.clientCategory || 'bilinmir'}

Ashagidakilari ver:
1. Bir esas kateqoriya ve varsa ikincil kateqoriyalar
2. Ciddilik: low/medium/high/critical ve esaslandirma
3. Kesf suallari: hansi gun/saat, stol/zona, hansi isci, evvel gelibmi, basqa marka ile muqayise edibmi, kanal konteksti kimi 3-5 konkret sual
4. Musteriye cavab: kanal ve musteri novune uygun. Daimi musteride isti ton ve [Ad] placeholder-i, ilk defede guven yaradan ton, Google/Instagram-da hamini nezere alan ton
5. Daxili qeydiyyat: kimin diqqetine catdirilmali ve hansi proses yoxlanmalidir
6. CAPA: arasdirma, baglama kriteriyasi, duzeldici fealiyyet, tekrar olmamasi ucun onleyici fealiyyet, 7-14 gun sonra yoxlama indikatoru
7. 24-48 saat sonra follow-up tovsiye`;
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
        model: 'deepseek-chat',
        temperature: 0.35,
        max_tokens: 1400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildPrompt(sanitized) },
        ],
      }),
      cache: 'no-store',
    });

    if (!response.ok) return { ok: false, error: 'ai-failed' };

    const raw = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = raw.choices?.[0]?.message?.content;
    if (!content) return { ok: false, error: 'ai-failed' };

    const parsed = JSON.parse(content) as unknown;
    if (!isValidResult(parsed)) return { ok: false, error: 'ai-output-invalid' };

    return {
      ok: true,
      data: {
        ...parsed,
        discoveryQuestions: parsed.discoveryQuestions.slice(0, 5),
        customerResponse: parsed.customerResponse.slice(0, 2000),
        followUpRecommendation: parsed.followUpRecommendation.slice(0, 1000),
      },
    };
  } catch {
    return { ok: false, error: 'ai-failed' };
  }
}
