// public-ok: public KAZAN assistant, rate-limited 30 / min per IP
import { NextRequest, NextResponse } from 'next/server';
import {
  AI_MODELS,
  claudeAcceptsTemperature,
  claudeThinkingOff,
  resolveClaudeModel,
} from '@/lib/ai-models';
import {
  checkRateLimit,
  getClientIp,
  rateLimitExceeded,
  RATE_LIMITS,
} from '@/lib/utils/rate-limit';
import { buildKazanSystemPrompt } from '@/lib/kazan-ai/system-prompt';
import { buildFoodCostContext } from '@/lib/kazan-ai/food-cost-context';
import { buildSiteContext } from '@/lib/kazan-ai/site-context';
import { buildSystemPromptInjection, type KazanContext } from '@/lib/kazan-ai/context-greetings';
import ahilikQuotes from '@/data/kazan-kb/ahilik-quotes.json';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type RequestBody = {
  messages?: ChatMessage[];
  locale?: string;
  pnlContext?: KazanContext;
};

type AhilikQuote = { id: string; az: string; ru: string; en: string; tr: string; category: string };

function pickRandomQuote(locale: string): string {
  const quotes = ahilikQuotes as AhilikQuote[];
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  const lang = locale === 'ru' || locale === 'en' || locale === 'tr' ? locale : 'az';
  return q[lang as keyof AhilikQuote] || q.az;
}

function shouldAppendQuote(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 80) return false;
  if (trimmed.endsWith('?')) return false;
  return true;
}

/** Modelin özü yazdığı (uydurma) ☕ sitat sətirlərini silir — real sitatı sistem əlavə edir. */
function stripModelQuotes(text: string): string {
  return text
    .split('\n')
    .filter((line) => !line.trim().startsWith('☕'))
    .join('\n')
    .replace(/\n-{3,}\s*$/u, '')
    .trim();
}

function appendQuote(raw: string, locale: string): string {
  const text = stripModelQuotes(raw);
  if (!shouldAppendQuote(text)) return text;
  const quote = pickRandomQuote(locale);
  let suffix = 'Əhilik';
  if (locale === 'tr') suffix = 'Ahilik';
  else if (locale === 'ru') suffix = 'Ахилик';
  else if (locale === 'en') suffix = 'Ahilik';
  return `${text}\n\n---\n☕ *${quote}* — ${suffix}`;
}

function normalizeMessages(messages: ChatMessage[]): ChatMessage[] {
  const recent = messages
    .filter(
      (message) =>
        (message.role === 'user' || message.role === 'assistant') && message.content.trim()
    )
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 4000),
    }));

  // Claude: tarixce `user` ile baslamali; sonda `assistant` qalsa 5.x modelleri onu
  // prefill sayib 400 qaytarir (TASK-0503). slice(-10) kesimi de `assistant`-den baslaya biler.
  let start = 0;
  while (start < recent.length && recent[start].role === 'assistant') start++;
  let end = recent.length;
  while (end > start && recent[end - 1].role === 'assistant') end--;
  return recent.slice(start, end);
}

function buildStaticFallback(messages: ChatMessage[]) {
  const lastUserMessage =
    [...messages]
      .reverse()
      .find((message) => message.role === 'user')
      ?.content.toLowerCase() ?? '';

  if (lastUserMessage.includes('food cost')) {
    return `Food cost-un yüksəkdirsə əvvəl 3 rəqəmə bax: ideal aralıq çox restoran üçün 28-32%-dir, sən 38%-dəsənsə ən azı 6 bənd aşağı enməlisən. 1) Resept kartını sabitlə. 2) Təmizləmə itkisini ölç. 3) Satışı çox qazandıran yeməklərə yönəlt. 4) Alış qiymətini yenidən danış. 5) Həftəlik inventar say.\n\n[Food Cost hesabla](/toolkit/food-cost)`;
  }

  if (lastUserMessage.includes('aqta')) {
    return `AQTA yoxlaması üçün 3 kritik blok var: ərzaq saxlama, şəxsi gigiyena və sənədləşdirmə. Ən çox cərimə riskini temperatur nəzarəti, etiketləmə və çarpaz bulaşma yaradır. Bu həftə minimum 1 daxili audit et və qırmızı, yaşıl, sarı, mavi taxtaları ayrı saxla.\n\n[AQTA checklist](/toolkit/aqta-checklist)`;
  }

  if (lastUserMessage.includes('delivery')) {
    return `Delivery-də komissiya 30%-dirsə tək komissiyaya baxmaq kifayət deyil. Food cost 33%, qablaşdırma 1.5 AZN, işçi xərci 3 AZN olduqda real netto çox sürətlə əriyir. Platforma P&L-ni ayrıca izləmək lazımdır.\n\n[Delivery kalkulyatoru](/toolkit/delivery-calc)`;
  }

  if (lastUserMessage.includes('p&l') || lastUserMessage.includes('pnl')) {
    return `P&L hesabatında əvvəl gross sales, COGS, labor və operating expense bloklarına bax. EBITDA müsbət görünürsə belə food cost və əmək xərci birlikdə 55-60%-i keçirsə model zəifləyir. Son 4 həftəni yan-yana aç və trendi yoxla.\n\n[P&L alətinə keç](/toolkit/pnl)`;
  }

  return `Bakıda restoran idarəetməsində qərarı rəqəmlə vermək lazımdır: food cost, labor, AQTA, delivery və kadr axını eyni sistemdə baxılmalıdır. Sualını bir az konkret yaz, mən sənə rəqəm və addım planı ilə cavab verim.\n\n[Əlaqə saxla](/elaqe)`;
}

async function fetchWithTimeout(url: string, init: RequestInit, ms = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callAnthropicWithPrompt(
  messages: ChatMessage[],
  apiKey: string,
  systemPrompt: string
) {
  const model = resolveClaudeModel();
  const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';

  const requestBody: Record<string, unknown> = {
    model,
    system: systemPrompt,
    max_tokens: 1200,
    messages,
  };

  // Yalniz qebul eden modellere gonder — yenilerinde parametr silinib, 400 qaytarir.
  if (claudeAcceptsTemperature(model)) {
    requestBody.temperature = 0.2;
  }
  // Sonnet 5.5: thinking default aciqdir, 1200 limiti dusuncede bitmesin (TASK-0503).
  const thinking = claudeThinkingOff(model);
  if (thinking) {
    requestBody.thinking = thinking;
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    return {
      ok: false as const,
      status: 504,
      body: { error: 'Anthropic əlçatmaz və ya timeout.', details: String(err).slice(0, 300) },
    };
  }

  if (!response.ok) {
    const errorText = await response.text();
    return {
      ok: false as const,
      status: response.status,
      body: {
        error: 'Anthropic proxy cavabı uğursuz oldu.',
        details: errorText.slice(0, 1200),
      },
    };
  }

  const payload = (await response.json()) as {
    id?: string;
    model?: string;
    stop_reason?: string;
    stop_details?: { category?: string | null } | null;
    content?: Array<{ type?: string; text?: string }>;
  };

  // 5.x modellerin tehlukesizlik klassifikatoru HTTP 200 + stop_reason "refusal" qaytarir.
  if (payload.stop_reason === 'refusal') {
    return {
      ok: false as const,
      status: 422,
      body: {
        error: 'Anthropic bu sorğunu cavablandırmadı.',
        details: `refusal: ${payload.stop_details?.category ?? 'unknown'}`,
      },
    };
  }

  const text = payload.content
    ?.filter((item) => item.type === 'text')
    .map((item) => item.text || '')
    .join('\n\n')
    .trim();

  if (!text) {
    return {
      ok: false as const,
      status: 502,
      body: { error: 'Anthropic modeli boş cavab qaytardı.' },
    };
  }

  return {
    ok: true as const,
    status: 200,
    body: {
      id: payload.id,
      model: payload.model || model,
      provider: 'anthropic',
      message: text,
    },
  };
}

async function callDeepSeekWithPrompt(
  messages: ChatMessage[],
  apiKey: string,
  systemPrompt: string
) {
  let response: Response;
  try {
    response = await fetchWithTimeout('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_MODELS.deepseek.chat,
        temperature: 0.2,
        // v4-flash reasoning token-ları da bu limitdən yeyir (TASK-0487)
        max_tokens: 2500,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ],
      }),
    });
  } catch (err) {
    return {
      ok: false as const,
      status: 504,
      body: { error: 'DeepSeek əlçatmaz və ya timeout.', details: String(err).slice(0, 300) },
    };
  }

  if (!response.ok) {
    const errorText = await response.text();
    return {
      ok: false as const,
      status: response.status,
      body: {
        error: 'DeepSeek proxy cavabı uğursuz oldu.',
        details: errorText.slice(0, 1200),
      },
    };
  }

  const payload = (await response.json()) as {
    id?: string;
    model?: string;
    choices?: Array<{ finish_reason?: string; message?: { content?: string } }>;
  };

  const choice = payload.choices?.[0];
  let text = choice?.message?.content?.trim();
  if (text && choice?.finish_reason === 'length') {
    // Limitə çatıbsa yarımçıq sözlə bitməsin — son tam paraqrafda kəs.
    const cut = text.lastIndexOf('\n\n');
    if (cut > 200) text = text.slice(0, cut).trim();
  }
  if (!text) {
    return {
      ok: false as const,
      status: 502,
      body: { error: 'DeepSeek modeli boş cavab qaytardı.' },
    };
  }

  return {
    ok: true as const,
    status: 200,
    body: {
      id: payload.id,
      model: payload.model || AI_MODELS.deepseek.chat,
      provider: 'deepseek',
      message: text,
    },
  };
}

function isFoodCostIntent(messages: ChatMessage[]): boolean {
  const last3 = messages.slice(-3);
  const text = last3.map((m) => m.content.toLowerCase()).join(' ');
  const keywords = [
    'food cost',
    'xərc',
    'kateqoriya',
    'nəyə xərcləmişəm',
    'nə qədər',
    'fatura',
    'tədarükçü',
    'ən bahalı',
    'maya dəyəri',
    'qida xərci',
    'aylıq xərc',
  ];
  return keywords.some((kw) => text.includes(kw));
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`kazan-ai:${ip}`, RATE_LIMITS.kazanAi);
    if (!rl.success) return rateLimitExceeded(rl);

    const body = (await request.json()) as RequestBody;
    const locale = body.locale || 'az';
    const messages = normalizeMessages(body.messages ?? []);

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Ən azı 1 mesaj göndərilməlidir.' }, { status: 400 });
    }

    // Food cost intent olduqda real veri inject et
    let systemPrompt = buildKazanSystemPrompt(locale);
    if (isFoodCostIntent(messages)) {
      const foodCostCtx = await buildFoodCostContext();
      systemPrompt = systemPrompt + '\n\n' + foodCostCtx;
    }

    // Saytın real məzmunu: bloq, toolkit, xəbərlər (TASK-0487)
    const recentUserText = messages
      .filter((m) => m.role === 'user')
      .slice(-3)
      .map((m) => m.content)
      .join(' ');
    const siteContext = await buildSiteContext(recentUserText, locale);
    systemPrompt = systemPrompt + '\n\n' + siteContext;

    // P&L / AI Readiness context injection
    if (body.pnlContext) {
      const contextInjection = buildSystemPromptInjection(body.pnlContext);
      if (contextInjection) {
        systemPrompt = systemPrompt + '\n\n' + contextInjection;
      }
    }

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

    if (deepseekApiKey) {
      const result = await callDeepSeekWithPrompt(messages, deepseekApiKey, systemPrompt);
      if (result.ok) {
        result.body.message = appendQuote(result.body.message, locale);
        return NextResponse.json(result.body, { status: result.status });
      }
    }

    if (anthropicApiKey) {
      const result = await callAnthropicWithPrompt(messages, anthropicApiKey, systemPrompt);
      if (result.ok) {
        result.body.message = appendQuote(result.body.message, locale);
        return NextResponse.json(result.body, { status: result.status });
      }
    }

    return NextResponse.json(
      {
        provider: 'static',
        model: 'kazan-static-sample',
        message: appendQuote(buildStaticFallback(messages), locale),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'KAZAN AI sorğusu zamanı xəta baş verdi.',
        details: String(error),
      },
      { status: 500 }
    );
  }
}
