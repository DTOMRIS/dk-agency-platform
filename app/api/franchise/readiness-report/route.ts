import { NextRequest, NextResponse } from 'next/server';
import { AI_MODELS } from '@/lib/ai-models';

const SYSTEM_PROMPT = `Sən DK Agency franchise məsləhətçisisən. User-in 12 kriteri üzrə skorları əsasında şəxsi hesabat yaz.

QADAĞAN terminlər: CRM, Pipeline, Agentlik, Holdinq, "Tezliklə".

Format:
1) Ümumi qiymət (2-3 cümlə)
2) Ən zəif sahə dərin təhlil (4-5 cümlə)
3) 3 prioritet addım (bullet list)

Cavabın 200-300 söz olsun. Dil: user-in seçdiyi dil.`;

const LOCALE_INSTRUCTIONS: Record<string, string> = {
  az: 'Cavabı Azərbaycan dilində yaz.',
  ru: 'Ответ на русском языке.',
  en: 'Write the response in English.',
  tr: 'Cevabı Türkçe olarak yaz.',
};

export async function POST(req: NextRequest) {
  let body: { scores: Record<string, number>; locale?: string; avgScore?: number; referrer?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { scores, locale = 'az', avgScore = 0, referrer = '' } = body;
  if (!scores || typeof scores !== 'object') return NextResponse.json({ error: 'scores required' }, { status: 400 });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    // Fallback: static template
    return NextResponse.json({ report: null, fallback: true });
  }

  const scoreText = Object.entries(scores).map(([cat, val]) => `${cat}: ${val}/100`).join('\n');
  const userPrompt = `Orta bal: ${avgScore}/100\n\nKriteri skorları:\n${scoreText}\n\n${LOCALE_INSTRUCTIONS[locale] || LOCALE_INSTRUCTIONS.az}${referrer ? `\n\nUser gəldiyi səhifə: ${referrer}` : ''}`;

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_MODELS.deepseek.chat,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
    const data = await res.json();
    const report = data.choices?.[0]?.message?.content || null;
    return NextResponse.json({ report });
  } catch (err) {
    console.error('[franchise-readiness-report] DeepSeek failed:', err);

    // Gemini fallback
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.gemini.text}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
              generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const report = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
          return NextResponse.json({ report, provider: 'gemini' });
        }
      } catch { /* fall through */ }
    }

    return NextResponse.json({ report: null, fallback: true });
  }
}
