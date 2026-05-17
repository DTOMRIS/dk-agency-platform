'use server';

import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';

export interface ROIChannelInput {
  name: string;
  spend: number;
  revenue: number;
  newCustomers: number;
  roiPercent: number;
  roas: number;
  cac: number;
}

export interface ROIAIInput {
  campaignName: string;
  period: string;
  ltv: number;
  totalCAC: number;
  ltvCacRatio: number;
  bestChannel: string;
  worstChannel: string;
  channels: ROIChannelInput[];
}

export interface ROIAIResult {
  ok: boolean;
  analysis?: string;
  error?: 'unauthorized' | 'rate-limited' | 'validation' | 'missing-key' | 'ai-failed';
}

const RATE_COOKIE = 'dk_roi_ai_runs';
const WINDOW_MS = 10 * 60 * 1000;
const MAX_RUNS = 3;

function sanitizeText(value: string, max = 80) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function sanitizeNumber(value: number, allowZero = true) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  if (allowZero ? numeric < 0 : numeric <= 0) return null;
  return Math.round(numeric * 100) / 100;
}

function sanitizeSignedNumber(value: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric * 100) / 100;
}

function sanitizeInput(input: ROIAIInput): ROIAIInput | null {
  const channels = (Array.isArray(input.channels) ? input.channels : [])
    .slice(0, 8)
    .map((channel) => ({
      name: sanitizeText(channel.name, 40),
      spend: sanitizeNumber(channel.spend, false),
      revenue: sanitizeNumber(channel.revenue),
      newCustomers: sanitizeNumber(channel.newCustomers),
      roiPercent: sanitizeSignedNumber(channel.roiPercent),
      roas: sanitizeNumber(channel.roas),
      cac: sanitizeNumber(channel.cac),
    }))
    .filter((channel) => channel.name && channel.spend !== null && channel.revenue !== null && channel.newCustomers !== null && channel.roiPercent !== null && channel.roas !== null && channel.cac !== null);

  if (!channels.length) return null;

  const ltv = sanitizeNumber(input.ltv);
  const totalCAC = sanitizeNumber(input.totalCAC, false);
  const ltvCacRatio = sanitizeNumber(input.ltvCacRatio);
  if (ltv === null || totalCAC === null || ltvCacRatio === null) return null;

  return {
    campaignName: sanitizeText(input.campaignName || 'ROI kampaniyası', 80),
    period: sanitizeText(input.period || '-', 80),
    ltv,
    totalCAC,
    ltvCacRatio,
    bestChannel: sanitizeText(input.bestChannel || '-', 40),
    worstChannel: sanitizeText(input.worstChannel || '-', 40),
    channels: channels as ROIChannelInput[],
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
  store.set(RATE_COOKIE, JSON.stringify(records).slice(0, 1800), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: WINDOW_MS / 1000,
  });
  return true;
}

function buildPrompt(input: ROIAIInput) {
  const channelLines = input.channels.map((channel) =>
    `- ${channel.name}: xərc ${channel.spend} AZN, gəlir ${channel.revenue} AZN, ROI ${channel.roiPercent}%, ROAS ${channel.roas}x, CAC ${channel.cac} AZN`
  ).join('\n');

  return `Kampaniya: ${input.campaignName}, Dövr: ${input.period}
LTV: ${input.ltv} AZN, Ümumi CAC: ${input.totalCAC} AZN, LTV:CAC: ${input.ltvCacRatio}:1

Kanal nəticələri:
${channelLines}

Ən yaxşı kanal: ${input.bestChannel}
Ən pis kanal: ${input.worstChannel}

Ver:
1. ÜMUMİ QİYMƏTLƏNDİRMƏ (2-3 cümlə)
2. KANAL STRATEGİYASI: hansını artır, hansını kəs, hansını test et
3. BÜDCƏ YENİDƏN BÖLÜŞDÜRMƏSİ: eyni ümumi büdcə ilə optimal bölgü (faiz kimi)
4. NÖVBƏTİ ADDIM: bu ay nə etməli (3 konkret addım)`;
}

export async function getROIAIAnalysis(input: ROIAIInput): Promise<ROIAIResult> {
  const auth = await getAuthFromCookie();
  if (!auth) return { ok: false, error: 'unauthorized' };

  const access = await checkToolAccess(auth.userId, 'promosyon-roi', auth.role);
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
        max_tokens: 1200,
        messages: [
          {
            role: 'system',
            content: 'Sən Azərbaycan restoranları üçün marketinq ROI mütəxəssisisən. Restoran sahibinə hansı kanala daha çox investisiya etməyi, hansını kəsməyi və büdcəni necə bölüşdürməyi praktik, konkret Azərbaycan dilində izah et.',
          },
          { role: 'user', content: buildPrompt(sanitized) },
        ],
      }),
      cache: 'no-store',
    });

    if (!response.ok) return { ok: false, error: 'ai-failed' };

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const analysis = data.choices?.[0]?.message?.content?.trim();
    if (!analysis) return { ok: false, error: 'ai-failed' };
    return { ok: true, analysis: analysis.slice(0, 5000) };
  } catch {
    return { ok: false, error: 'ai-failed' };
  }
}
