'use server';

import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess } from '@/lib/marketing-gating';

export type MenuAnalyticsCategory = 'star' | 'plowhorse' | 'puzzle' | 'dog';

export interface MenuAnalyticsAIItem {
  name: string;
  contributionMargin: number;
  category: MenuAnalyticsCategory;
}

export interface MenuAnalyticsAIInput {
  averageContributionMargin: number;
  items: MenuAnalyticsAIItem[];
}

export interface MenuAnalyticsAIResult {
  ok: boolean;
  tips?: string;
  error?: 'unauthorized' | 'rate-limited' | 'validation' | 'missing-key' | 'ai-failed';
}

const RATE_COOKIE = 'dk_menu_analytics_ai_runs';
const WINDOW_MS = 10 * 60 * 1000;
const MAX_RUNS = 3;

function sanitizeItem(item: MenuAnalyticsAIItem): MenuAnalyticsAIItem | null {
  const name = item.name.trim().replace(/\s+/g, ' ').slice(0, 50);
  const contributionMargin = Number(item.contributionMargin);

  if (!name || !Number.isFinite(contributionMargin)) return null;
  if (!['star', 'plowhorse', 'puzzle', 'dog'].includes(item.category)) return null;

  return {
    name,
    contributionMargin: Math.round(contributionMargin * 100) / 100,
    category: item.category,
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

  const userRuns = records.filter((record) => record.userId === userId);
  if (userRuns.length >= MAX_RUNS) return false;

  records.push({ userId, at: now });
  store.set(RATE_COOKIE, JSON.stringify(records).slice(0, 1800), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: WINDOW_MS / 1000,
  });

  return true;
}

function formatGroup(items: MenuAnalyticsAIItem[], category: MenuAnalyticsCategory) {
  const group = items.filter((item) => item.category === category);
  if (!group.length) return 'Yoxdur';
  return group
    .map((item) => `${item.name} (${item.contributionMargin.toFixed(2)} AZN)`)
    .join(', ');
}

function buildPrompt(input: { averageContributionMargin: number; items: MenuAnalyticsAIItem[] }) {
  return `Sen bir restoran menyu muhendisisen. Ashagidaki analiz neticelerine esasen her kateqoriya ucun konkret, praktik tovsiye ver (AZ dilinde, qisa, bullet):

ULDUZLAR: ${formatGroup(input.items, 'star')}
ISH ATILARI: ${formatGroup(input.items, 'plowhorse')}
BULMACALAR: ${formatGroup(input.items, 'puzzle')}
ITLER: ${formatGroup(input.items, 'dog')}
Orta CM: ${input.averageContributionMargin.toFixed(2)} AZN

Her kateqoriya ucun 2-3 konkret addim ver. Cavabi yalniz qisa markdown bullet formatinda qaytar.`;
}

export async function getMenuAnalyticsTips(input: MenuAnalyticsAIInput): Promise<MenuAnalyticsAIResult> {
  const auth = await getAuthFromCookie();
  if (!auth) return { ok: false, error: 'unauthorized' };

  const access = await checkToolAccess(auth.userId, 'menyu-analitigi', auth.role);
  if (!access.allowed) return { ok: false, error: 'unauthorized' };

  const sanitizedItems = input.items
    .slice(0, 20)
    .map(sanitizeItem)
    .filter((item): item is MenuAnalyticsAIItem => item !== null);

  const averageContributionMargin = Number(input.averageContributionMargin);
  if (sanitizedItems.length < 2 || !Number.isFinite(averageContributionMargin)) {
    return { ok: false, error: 'validation' };
  }

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
        max_tokens: 900,
        messages: [
          {
            role: 'system',
            content: 'Sen Azerbaycan HoReCa bazarini bilen praktik restoran menyu muhendisisen. Uzun izah yox, sahibkarin sabah ede bileceyi addimlari yaz.',
          },
          { role: 'user', content: buildPrompt({ averageContributionMargin, items: sanitizedItems }) },
        ],
      }),
      cache: 'no-store',
    });

    if (!response.ok) return { ok: false, error: 'ai-failed' };

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const tips = data.choices?.[0]?.message?.content?.trim();

    if (!tips) return { ok: false, error: 'ai-failed' };
    return { ok: true, tips: tips.slice(0, 4000) };
  } catch {
    return { ok: false, error: 'ai-failed' };
  }
}
