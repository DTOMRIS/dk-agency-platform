import { NextRequest, NextResponse } from 'next/server';
import { AI_MODELS } from '@/lib/ai-models';
import { buildFranchiseReportPrompt, isFranchiseReportTaskType, type FranchiseReportTaskType } from '@/lib/ai/franchiseReport';

type ReportRequestBody = {
  scores?: Record<string, number>;
  locale?: string;
  avgScore?: number;
  referrer?: string;
  taskType?: FranchiseReportTaskType;
};

export async function POST(req: NextRequest) {
  let body: ReportRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    scores,
    locale = 'az',
    avgScore = 0,
    referrer = '',
  } = body;

  if (!scores || typeof scores !== 'object') {
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
        max_tokens: 800,
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
              generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
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
