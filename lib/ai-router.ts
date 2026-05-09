/**
 * @file ai-router.ts
 * @purpose Marketinq Ocagi ucun vahid AI gateway — DeepSeek (primary) + Claude (fallback)
 * @critical Sarmal anti-pattern yasaq — butun aletler bu interfeysi cagirir
 * @lastModified 2026-05-09
 */

// ── TIPLER ──────────────────────────────────────────────────────────

export type AIProviderName = 'deepseek' | 'claude';

export interface AIRequest {
  prompt: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  text: string;
  provider: AIProviderName;
  tokensUsed: number;
  costAzn: number;
}

export interface AIRouterOptions {
  preferProvider?: AIProviderName;
  toolSlug: string;
  userId: number;
  locale?: string;
}

// ── COST CONSTANTS (AZN per token, yaxinlasdirilmis) ────────────────

const COST_PER_TOKEN: Record<AIProviderName, number> = {
  deepseek: 0.0000003, // ~$0.14/1M input, ~$0.28/1M output → orta 0.0000003 AZN
  claude: 0.000005, // Sonnet ~$3/1M input, $15/1M output → orta 0.000005 AZN
};

// ── ANA FUNKSIYA ────────────────────────────────────────────────────

export async function callAI(
  req: AIRequest,
  opts: AIRouterOptions,
): Promise<AIResponse> {
  const primary = opts.preferProvider ?? 'deepseek';
  const fallback: AIProviderName = primary === 'deepseek' ? 'claude' : 'deepseek';

  try {
    return await callProvider(primary, req);
  } catch (err) {
    console.error(`[ai-router] ${primary} failed for ${opts.toolSlug}:`, err);
    try {
      return await callProvider(fallback, req);
    } catch (fallbackErr) {
      console.error(`[ai-router] ${fallback} also failed for ${opts.toolSlug}:`, fallbackErr);
      throw new Error(
        `Both AI providers failed for ${opts.toolSlug}. Primary: ${primary}, Fallback: ${fallback}`,
      );
    }
  }
}

/**
 * callAI wrapper — JSON output ucun.
 * System prompt-a JSON formatini mecbur edir.
 */
export async function callAIJson<T>(
  req: AIRequest,
  opts: AIRouterOptions,
): Promise<{ data: T; meta: Omit<AIResponse, 'text'> }> {
  const jsonInstruction =
    '\n\nVacib: Cavabini YALNIZ kecerli JSON formatinda ver. Basqa hec bir metn, izahat ve ya markdown kod bloku olmasin. Yalniz xam JSON.';

  const response = await callAI(
    { ...req, system: (req.system ?? '') + jsonInstruction },
    opts,
  );

  const cleaned = response.text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  const data = JSON.parse(cleaned) as T;

  return {
    data,
    meta: {
      provider: response.provider,
      tokensUsed: response.tokensUsed,
      costAzn: response.costAzn,
    },
  };
}

// ── PROVIDER IMPLEMENTATIONS ────────────────────────────────────────

async function callProvider(
  provider: AIProviderName,
  req: AIRequest,
): Promise<AIResponse> {
  if (provider === 'deepseek') return callDeepSeek(req);
  return callClaude(req);
}

async function callDeepSeek(req: AIRequest): Promise<AIResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 1000,
      messages: [
        ...(req.system ? [{ role: 'system', content: req.system }] : []),
        { role: 'user', content: req.prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek HTTP ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { total_tokens?: number };
  };

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('DeepSeek returned empty response');

  const tokens = data.usage?.total_tokens ?? 0;

  return {
    text,
    provider: 'deepseek',
    tokensUsed: tokens,
    costAzn: tokens * COST_PER_TOKEN.deepseek,
  };
}

async function callClaude(req: AIRequest): Promise<AIResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

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
      system: req.system,
      max_tokens: req.maxTokens ?? 1000,
      temperature: req.temperature ?? 0.7,
      messages: [{ role: 'user', content: req.prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude HTTP ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
    usage?: { input_tokens?: number; output_tokens?: number };
  };

  const text = data.content
    ?.filter((item) => item.type === 'text')
    .map((item) => item.text ?? '')
    .join('\n\n')
    .trim();

  if (!text) throw new Error('Claude returned empty response');

  const tokens =
    (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0);

  return {
    text,
    provider: 'claude',
    tokensUsed: tokens,
    costAzn: tokens * COST_PER_TOKEN.claude,
  };
}
