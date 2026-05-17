'use server';

import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';

export interface PersonaInput {
  restaurantType: string;
  city: string;
  avgCheckRange: string;
  serviceModels: string[];
  ageRanges: string[];
  genderFemalePercent: number;
  visitTimes: string[];
  visitFrequency: string;
  tableSize: string;
  paymentMethods: string[];
  arrivalMethods: string[];
  notes: string;
}

export interface PersonaJSON {
  name: string;
  age: number;
  occupation: string;
  location: string;
  tagline: string;
  demographics: {
    income: string;
    family: string;
    education: string;
  };
  psychographics: {
    values: string[];
    interests: string[];
    dining_motivation: string;
  };
  behavior: {
    decision_trigger: string;
    discovery_channel: string;
    payment_habit: string;
    loyalty_driver: string;
  };
  digital: {
    social_media: string[];
    content_type: string;
    peak_online: string;
  };
  pain_points: string[];
  marketing_message: string;
  best_channels: string[];
  menu_recommendation: string;
  dos: string[];
  donts: string[];
}

export interface PersonaResult {
  ok: boolean;
  persona?: PersonaJSON;
  error?: 'unauthorized' | 'rate-limited' | 'validation' | 'missing-key' | 'ai-failed' | 'json-parse';
}

const RATE_COOKIE = 'dk_persona_ai_runs';
const WINDOW_MS = 10 * 60 * 1000;
const MAX_RUNS = 5;

function sanitizeText(value: string, max = 80) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function sanitizeArray(arr: unknown, max = 10, itemMax = 60): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item): item is string => typeof item === 'string')
    .slice(0, max)
    .map((item) => sanitizeText(item, itemMax));
}

function sanitizeInput(input: PersonaInput): PersonaInput | null {
  const restaurantType = sanitizeText(input.restaurantType, 40);
  const city = sanitizeText(input.city, 60);
  const avgCheckRange = sanitizeText(input.avgCheckRange, 20);
  if (!restaurantType || !city || !avgCheckRange) return null;

  const serviceModels = sanitizeArray(input.serviceModels, 4);
  const ageRanges = sanitizeArray(input.ageRanges, 5);
  const visitTimes = sanitizeArray(input.visitTimes, 4);
  const paymentMethods = sanitizeArray(input.paymentMethods, 3);
  const arrivalMethods = sanitizeArray(input.arrivalMethods, 4);

  if (!serviceModels.length || !ageRanges.length) return null;

  const genderFemalePercent = Math.max(0, Math.min(100, Math.round(Number(input.genderFemalePercent) || 50)));

  return {
    restaurantType,
    city,
    avgCheckRange,
    serviceModels,
    ageRanges,
    genderFemalePercent,
    visitTimes,
    visitFrequency: sanitizeText(input.visitFrequency, 40),
    tableSize: sanitizeText(input.tableSize, 20),
    paymentMethods,
    arrivalMethods,
    notes: sanitizeText(input.notes, 300),
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

  if (records.filter((record) => record.userId === userId).length >= MAX_RUNS) return false;

  records.push({ userId, at: now });
  store.set(RATE_COOKIE, JSON.stringify(records).slice(0, 2400), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: WINDOW_MS / 1000,
  });
  return true;
}

function buildPrompt(input: PersonaInput) {
  return `Restoran: ${input.restaurantType}, ${input.city}, Orta çek: ${input.avgCheckRange}
Xidmət: ${input.serviceModels.join(', ')}
Müştəri müşahidələri:
- Yaş: ${input.ageRanges.join(', ')}
- Cins: Qadın ${input.genderFemalePercent}% / Kişi ${100 - input.genderFemalePercent}%
- Gəliş vaxtı: ${input.visitTimes.join(', ')}
- Tezlik: ${input.visitFrequency}
- Masa ölçüsü: ${input.tableSize}
- Ödəmə: ${input.paymentMethods.join(', ')}
- Necə gəlir: ${input.arrivalMethods.join(', ')}
- Əlavə: ${input.notes || 'yoxdur'}

Aşağıdakı JSON strukturunu doldur (yalnız JSON qaytar, başqa heç nə):
{
  "name": "Persona adı (AZ adı, məs: Aytən, Rauf, Nigar)",
  "age": yaş (rəqəm),
  "occupation": "peşə",
  "location": "şəhər/rayon",
  "tagline": "bu insanı bir cümlə ilə tanımlayan ifadə",
  "demographics": {
    "income": "gəlir səviyyəsi",
    "family": "ailə vəziyyəti",
    "education": "təhsil"
  },
  "psychographics": {
    "values": ["dəyər1", "dəyər2", "dəyər3"],
    "interests": ["maraq1", "maraq2", "maraq3"],
    "dining_motivation": "niyə çölə yemək yeməyə gedir?"
  },
  "behavior": {
    "decision_trigger": "nə onu restoran seçiminə aparır?",
    "discovery_channel": "restoran haqqında haradan öyrənir?",
    "payment_habit": "ödəmə vərdişi",
    "loyalty_driver": "nə onu geri qaytarır?"
  },
  "digital": {
    "social_media": ["platform1", "platform2"],
    "content_type": "hansı content-ə reaksiya verir?",
    "peak_online": "gün ərzində ən aktiv saatlar"
  },
  "pain_points": ["problem1", "problem2", "problem3"],
  "marketing_message": "bu persona üçün ideal marketinq mesajı (1-2 cümlə)",
  "best_channels": ["kanal1", "kanal2"],
  "menu_recommendation": "bu persona üçün menyu tövsiyəsi",
  "dos": ["etməli1", "etməli2", "etməli3"],
  "donts": ["etməməli1", "etməməli2"]
}`;
}

const SYSTEM_PROMPT = `Sən Azərbaycan və Türkiyə restoranları üçün marketinq mütəxəssisisən.
Verilən məlumatlara əsasən real, inandırıcı, detallı müştəri persona kartı yarat.
Persona Azərbaycan/Türkiyə sosial-kultural kontekstinə uyğun olsun.
Bakılı, Gəncəli, İstanbullu müştəri fərqlidir — yerli davranış nümunələrini istifadə et.
Lokal ödəmə vərdişləri (nağd/kart/online), sosial media (Instagram vs TikTok vs WhatsApp statusu),
ailə yönümlü vs fərdi yemək vərdişi kimi fərqləri nəzərə al.
Cavab YALNIZ JSON formatında olsun. Heç bir izahat, başlıq və ya markdown əlavə etmə.`;

function validatePersonaJSON(data: unknown): PersonaJSON | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  if (typeof obj.name !== 'string' || !obj.name) return null;
  if (typeof obj.age !== 'number' || obj.age < 1) return null;
  if (typeof obj.occupation !== 'string') return null;
  if (typeof obj.tagline !== 'string') return null;

  const demographics = obj.demographics as Record<string, unknown> | undefined;
  if (!demographics || typeof demographics.income !== 'string') return null;

  const psychographics = obj.psychographics as Record<string, unknown> | undefined;
  if (!psychographics || !Array.isArray(psychographics.values)) return null;

  const behavior = obj.behavior as Record<string, unknown> | undefined;
  if (!behavior || typeof behavior.decision_trigger !== 'string') return null;

  const digital = obj.digital as Record<string, unknown> | undefined;
  if (!digital || !Array.isArray(digital.social_media)) return null;

  if (!Array.isArray(obj.pain_points)) return null;
  if (typeof obj.marketing_message !== 'string') return null;
  if (!Array.isArray(obj.best_channels)) return null;
  if (typeof obj.menu_recommendation !== 'string') return null;
  if (!Array.isArray(obj.dos)) return null;
  if (!Array.isArray(obj.donts)) return null;

  return {
    name: String(obj.name).slice(0, 60),
    age: Math.round(Number(obj.age)),
    occupation: String(obj.occupation).slice(0, 80),
    location: String(obj.location ?? '').slice(0, 80),
    tagline: String(obj.tagline).slice(0, 200),
    demographics: {
      income: String(demographics.income).slice(0, 100),
      family: String(demographics.family ?? '').slice(0, 100),
      education: String(demographics.education ?? '').slice(0, 100),
    },
    psychographics: {
      values: (psychographics.values as string[]).slice(0, 5).map((v) => String(v).slice(0, 60)),
      interests: (Array.isArray(psychographics.interests) ? psychographics.interests as string[] : []).slice(0, 5).map((v) => String(v).slice(0, 60)),
      dining_motivation: String(psychographics.dining_motivation ?? '').slice(0, 200),
    },
    behavior: {
      decision_trigger: String(behavior.decision_trigger).slice(0, 200),
      discovery_channel: String(behavior.discovery_channel ?? '').slice(0, 200),
      payment_habit: String(behavior.payment_habit ?? '').slice(0, 200),
      loyalty_driver: String(behavior.loyalty_driver ?? '').slice(0, 200),
    },
    digital: {
      social_media: (digital.social_media as string[]).slice(0, 5).map((v) => String(v).slice(0, 40)),
      content_type: String(digital.content_type ?? '').slice(0, 200),
      peak_online: String(digital.peak_online ?? '').slice(0, 100),
    },
    pain_points: (obj.pain_points as string[]).slice(0, 5).map((v) => String(v).slice(0, 100)),
    marketing_message: String(obj.marketing_message).slice(0, 300),
    best_channels: (obj.best_channels as string[]).slice(0, 5).map((v) => String(v).slice(0, 40)),
    menu_recommendation: String(obj.menu_recommendation).slice(0, 300),
    dos: (obj.dos as string[]).slice(0, 5).map((v) => String(v).slice(0, 100)),
    donts: (obj.donts as string[]).slice(0, 5).map((v) => String(v).slice(0, 100)),
  };
}

export async function generatePersona(input: PersonaInput): Promise<PersonaResult> {
  const auth = await getAuthFromCookie();
  if (!auth) return { ok: false, error: 'unauthorized' };

  const access = await checkToolAccess(auth.userId, 'musteri-persona', auth.role);
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
        temperature: 0.7,
        max_tokens: 1800,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildPrompt(sanitized) },
        ],
      }),
      cache: 'no-store',
    });

    if (!response.ok) return { ok: false, error: 'ai-failed' };

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return { ok: false, error: 'ai-failed' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ok: false, error: 'json-parse' };
    }

    const persona = validatePersonaJSON(parsed);
    if (!persona) return { ok: false, error: 'json-parse' };

    return { ok: true, persona };
  } catch {
    return { ok: false, error: 'ai-failed' };
  }
}
