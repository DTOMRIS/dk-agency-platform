// public-ok: free quiz AI report, rate-limited 10 / hour, inputs capped (TASK-0530)
import { NextRequest, NextResponse } from 'next/server';
import { AI_MODELS } from '@/lib/ai-models';
import { checkRateLimit, getClientIp, rateLimitExceeded, RATE_LIMITS } from '@/lib/utils/rate-limit';
import {
  buildFranchiseReportPrompt,
  isFranchiseReportTaskType,
  type FranchiseReportTaskType,
} from '@/lib/ai/franchiseReport';

// Long-form AZ reports (3 sections) need generation headroom; allow up to 60s
// on platforms that honor this (prevents premature cut-off / timeout).
export const maxDuration = 60;

type ReportRequestBody = {
  scores?: Record<string, number>;
  locale?: string;
  avgScore?: number;
  referrer?: string;
  taskType?: FranchiseReportTaskType;
};

/**
 * TASK-0530 (system map: public route without a guard). Public on purpose — the free readiness quizzes
 * call it without login — but every call is a paid AI request, so: per-IP limit, at most 20 numeric scores
 * (0–100, same scale as buildFranchiseReportPrompt) and a known locale.
 */
function cleanScores(raw: unknown): Record<string, number> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>).slice(0, 20)) {
    const n = Number(value);
    if (!Number.isFinite(n)) continue;
    out[key.slice(0, 60)] = Math.min(100, Math.max(0, n));
  }
  return Object.keys(out).length ? out : null;
}

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`ai-report:${getClientIp(req)}`, RATE_LIMITS.aiReport);
  if (!rl.success) return rateLimitExceeded(rl);

  let body: ReportRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const scores = cleanScores(body.scores);
  const locale = ['az', 'en', 'ru', 'tr'].includes(String(body.locale)) ? String(body.locale) : 'az';
  const avgScore = Math.min(100, Math.max(0, Number(body.avgScore) || 0));
  const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 120) : '';

  if (!scores) {
    return NextResponse.json({ error: 'scores required' }, { status: 400 });
  }

  const taskType = isFranchiseReportTaskType(body.taskType)
    ? body.taskType
    : 'FranchiseReadinessReport';

  const { systemPrompt, userPrompt } = buildFranchiseReportPrompt({
    taskType,
    scores,
    locale,
    avgScore,
    referrer,
  });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ report: null, fallback: true });
  }

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_MODELS.deepseek.chat,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
    const data = await res.json();
    const report = data.choices?.[0]?.message?.content || null;
    return NextResponse.json({ report, taskType });
  } catch (err) {
    console.error('[franchise-report] DeepSeek failed:', err);

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.gemini.text}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
              generationConfig: { maxOutputTokens: 3000, temperature: 0.7 },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const report = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
          return NextResponse.json({ report, provider: 'gemini', taskType });
        }
      } catch {
        // Fall through to the same non-fatal fallback as DeepSeek.
      }
    }

    return NextResponse.json({ report: null, fallback: true });
  }
}
