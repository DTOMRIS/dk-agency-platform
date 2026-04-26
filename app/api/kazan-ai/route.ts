import { NextRequest, NextResponse } from 'next/server';
import { buildKazanSystemPrompt, type KazanLocale } from '@/lib/kazan-ai/system-prompt';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type RequestBody = {
  messages?: ChatMessage[];
  locale?: string;
};

const VALID_LOCALES = new Set<KazanLocale>(['az', 'en', 'tr', 'ru']);

function parseLocale(value: unknown): KazanLocale {
  if (typeof value === 'string' && VALID_LOCALES.has(value as KazanLocale)) {
    return value as KazanLocale;
  }
  return 'az';
}

function normalizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter((message) => (message.role === 'user' || message.role === 'assistant') && message.content.trim())
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 4000),
    }));
}

function buildStaticFallback(messages: ChatMessage[], locale: KazanLocale) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content.toLowerCase() ?? '';

  if (locale === 'az') {
    if (lastUserMessage.includes('food cost')) {
      return `Food cost-un yüksəkdirsə əvvəl 3 rəqəmə bax: ideal aralıq çox restoran üçün 28-32%-dir, sən 38%-dəsənsə ən azı 6 bənd aşağı enməlisən. 1) Resept kartını sabitlə. 2) Trim loss-u ölç. 3) Satış mix-ini ulduz yeməklərə çək. 4) Alış qiymətini yenidən danış. 5) Həftəlik inventar say.\n\n[Food Cost hesabla](/toolkit/food-cost)`;
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

  const generalFallbacks: Record<string, string> = {
    ru: 'В управлении рестораном решения нужно принимать на основе цифр: фуд-кост, P&L, AQTA, доставка и текучесть кадров должны анализироваться в единой системе. Уточните ваш вопрос, и я отвечу с конкретными цифрами и планом действий.\n\n[Инструменты](/toolkit) · [Связаться с DK Agency](/elaqe)',
    en: 'In restaurant management, decisions must be data-driven: food cost, P&L, AQTA, delivery and staff turnover should be analyzed in one system. Be specific with your question and I will respond with concrete numbers and an action plan.\n\n[Toolkit](/toolkit) · [Contact DK Agency](/elaqe)',
    tr: 'Restoran yönetiminde kararlar veriye dayalı olmalıdır: food cost, P&L, AQTA, teslimat ve personel devri tek sistemde analiz edilmelidir. Sorunuzu netleştirin, size somut rakamlar ve aksiyon planı ile cevap vereyim.\n\n[Araçlar](/toolkit) · [DK Agency ile iletişim](/elaqe)',
  };
  return generalFallbacks[locale] || generalFallbacks.en;
}

async function callAnthropic(messages: ChatMessage[], apiKey: string, locale: KazanLocale) {
  const model = process.env.KAZAN_ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
  const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: buildKazanSystemPrompt(locale),
      max_tokens: 700,
      temperature: 0.2,
      messages,
    }),
  });

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
    content?: Array<{ type?: string; text?: string }>;
  };

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

async function callDeepSeek(messages: ChatMessage[], apiKey: string, locale: KazanLocale) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        { role: 'system', content: buildKazanSystemPrompt(locale) },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    }),
  });

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
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = payload.choices?.[0]?.message?.content?.trim();
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
      model: payload.model || 'deepseek-chat',
      provider: 'deepseek',
      message: text,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const messages = normalizeMessages(body.messages ?? []);
    const locale = parseLocale(body.locale);

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Ən azı 1 mesaj göndərilməlidir.' }, { status: 400 });
    }

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

    if (deepseekApiKey) {
      const result = await callDeepSeek(messages, deepseekApiKey, locale);
      if (result.ok) {
        return NextResponse.json(result.body, { status: result.status });
      }
    }

    if (anthropicApiKey) {
      const result = await callAnthropic(messages, anthropicApiKey, locale);
      if (result.ok) {
        return NextResponse.json(result.body, { status: result.status });
      }
    }

    return NextResponse.json(
      {
        provider: 'static',
        model: 'kazan-static-sample',
        message: buildStaticFallback(messages, locale),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'KAZAN AI sorğusu zamanı xəta baş verdi.',
        details: String(error),
      },
      { status: 500 },
    );
  }
}
