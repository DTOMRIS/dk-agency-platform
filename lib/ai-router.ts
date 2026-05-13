/**
 * @file ai-router.ts
 * @purpose Shared AI gateway for Marketinq Ocagi tools.
 * @critical DeepSeek primary + Claude fallback. Supports timeout, streaming,
 * JSON mode, token/cost tracking.
 * @lastModified 2026-05-13 (TASK-0120)
 */

export type AIProviderName = 'deepseek' | 'claude';
export type AIResponseFormat = 'json_object' | 'text';

export interface AIRequest {
  prompt: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  timeout?: number;
  responseFormat?: AIResponseFormat;
}

export interface AIResponse {
  text: string;
  provider: AIProviderName;
  tokensUsed: number;
  costAzn: number;
  inputTokens?: number;
  outputTokens?: number;
}

export interface AIRouterOptions {
  preferProvider?: AIProviderName;
  toolSlug: string;
  userId: number;
  locale?: string;
}

const DEFAULT_TIMEOUT_MS = 55_000;

const COST_PER_TOKEN: Record<AIProviderName, number> = {
  deepseek: 0.0000003,
  claude: 0.000005,
};

export function isAIAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === 'AbortError';
}

export async function callAI(
  req: AIRequest,
  opts: AIRouterOptions,
): Promise<AIResponse> {
  const normalizedReq: AIRequest = {
    ...req,
    stream: req.stream ?? false,
    timeout: req.timeout ?? DEFAULT_TIMEOUT_MS,
    responseFormat: req.responseFormat ?? 'text',
  };
  const primary = opts.preferProvider ?? 'deepseek';
  const fallback: AIProviderName = primary === 'deepseek' ? 'claude' : 'deepseek';

  try {
    return await callProvider(primary, normalizedReq, opts);
  } catch (err) {
    logProviderError(primary, normalizedReq, opts, err);
    if (isAIAbortError(err)) throw err;

    try {
      return await callProvider(fallback, normalizedReq, opts);
    } catch (fallbackErr) {
      logProviderError(fallback, normalizedReq, opts, fallbackErr);
      if (isAIAbortError(fallbackErr)) throw fallbackErr;
      throw new Error(
        `Both AI providers failed for ${opts.toolSlug}. Primary: ${primary}, Fallback: ${fallback}`,
      );
    }
  }
}

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
    .replace(/\s*```\s*$/i, '')
    .trim();

  const data = JSON.parse(cleaned) as T;

  return {
    data,
    meta: {
      provider: response.provider,
      tokensUsed: response.tokensUsed,
      costAzn: response.costAzn,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
    },
  };
}

async function callProvider(
  provider: AIProviderName,
  req: AIRequest,
  opts: AIRouterOptions,
): Promise<AIResponse> {
  if (provider === 'deepseek') return callDeepSeek(req, opts);
  return callClaude(req, opts);
}

async function callDeepSeek(
  req: AIRequest,
  opts: AIRouterOptions,
): Promise<AIResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

  const startedAt = Date.now();
  const payload: Record<string, unknown> = {
    model: 'deepseek-chat',
    temperature: req.temperature ?? 0.7,
    max_tokens: req.maxTokens ?? 1000,
    stream: req.stream ?? false,
    messages: [
      ...(req.system ? [{ role: 'system', content: req.system }] : []),
      { role: 'user', content: req.prompt },
    ],
  };

  if (req.responseFormat === 'json_object') {
    payload.response_format = { type: 'json_object' };
  }
  if (req.stream) {
    payload.stream_options = { include_usage: true };
  }

  return withTimeout(req.timeout ?? DEFAULT_TIMEOUT_MS, async (signal) => {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek HTTP ${response.status}: ${errText.slice(0, 300)}`);
    }

    const result = req.stream
      ? await readDeepSeekStream(response)
      : await readDeepSeekJson(response);

    const aiResponse = buildAIResponse(
      'deepseek',
      result.text,
      result.inputTokens,
      result.outputTokens,
      result.totalTokens,
    );
    logProviderSuccess('deepseek', req, opts, aiResponse, Date.now() - startedAt);
    return aiResponse;
  });
}

async function callClaude(
  req: AIRequest,
  opts: AIRouterOptions,
): Promise<AIResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const startedAt = Date.now();
  const model = process.env.KAZAN_ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
  const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
  const system = req.responseFormat === 'json_object'
    ? `${req.system ?? ''}\n\nRespond with valid JSON only. Do not include markdown fences or explanatory text.`
    : req.system;

  const payload: Record<string, unknown> = {
    model,
    system,
    max_tokens: req.maxTokens ?? 1000,
    temperature: req.temperature ?? 0.7,
    stream: req.stream ?? false,
    messages: [{ role: 'user', content: req.prompt }],
  };

  return withTimeout(req.timeout ?? DEFAULT_TIMEOUT_MS, async (signal) => {
    const response = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude HTTP ${response.status}: ${errText.slice(0, 300)}`);
    }

    const result = req.stream
      ? await readClaudeStream(response)
      : await readClaudeJson(response);

    const aiResponse = buildAIResponse('claude', result.text, result.inputTokens, result.outputTokens);
    logProviderSuccess('claude', req, opts, aiResponse, Date.now() - startedAt);
    return aiResponse;
  });
}

async function withTimeout<T>(
  timeoutMs: number,
  operation: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await operation(controller.signal);
  } catch (err) {
    if (isAbortLikeError(err)) {
      const abortError = new Error(`AI request timed out after ${timeoutMs}ms`);
      abortError.name = 'AbortError';
      throw abortError;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    controller.abort();
  }
}

function isAbortLikeError(err: unknown): boolean {
  return err instanceof Error && (
    err.name === 'AbortError' ||
    err.name === 'TimeoutError' ||
    /aborted|abort/i.test(err.message)
  );
}

async function readDeepSeekJson(response: Response) {
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('DeepSeek returned empty response');

  return {
    text,
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
    totalTokens: data.usage?.total_tokens ?? 0,
  };
}

async function readDeepSeekStream(response: Response) {
  let text = '';
  let inputTokens = 0;
  let outputTokens = 0;
  let totalTokens = 0;

  await readSse(response, (data) => {
    if (data === '[DONE]') return;
    const chunk = JSON.parse(data) as {
      choices?: Array<{ delta?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null;
    };
    text += chunk.choices?.[0]?.delta?.content ?? '';
    inputTokens = chunk.usage?.prompt_tokens ?? inputTokens;
    outputTokens = chunk.usage?.completion_tokens ?? outputTokens;
    totalTokens = chunk.usage?.total_tokens ?? totalTokens;
  });

  const trimmed = text.trim();
  if (!trimmed) throw new Error('DeepSeek returned empty streamed response');

  return { text: trimmed, inputTokens, outputTokens, totalTokens };
}

async function readClaudeJson(response: Response) {
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

  return {
    text,
    inputTokens: data.usage?.input_tokens ?? 0,
    outputTokens: data.usage?.output_tokens ?? 0,
  };
}

async function readClaudeStream(response: Response) {
  let text = '';
  let inputTokens = 0;
  let outputTokens = 0;

  await readSse(response, (data) => {
    const event = JSON.parse(data) as {
      type?: string;
      message?: { usage?: { input_tokens?: number; output_tokens?: number } };
      usage?: { input_tokens?: number; output_tokens?: number };
      delta?: { text?: string };
    };

    if (event.type === 'message_start') {
      inputTokens = event.message?.usage?.input_tokens ?? inputTokens;
      outputTokens = event.message?.usage?.output_tokens ?? outputTokens;
    }
    if (event.type === 'content_block_delta') {
      text += event.delta?.text ?? '';
    }
    if (event.type === 'message_delta') {
      outputTokens = event.usage?.output_tokens ?? outputTokens;
    }
  });

  const trimmed = text.trim();
  if (!trimmed) throw new Error('Claude returned empty streamed response');

  return { text: trimmed, inputTokens, outputTokens };
}

async function readSse(
  response: Response,
  onData: (data: string) => void,
): Promise<void> {
  if (!response.body) throw new Error('Streaming response has no body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let eventMatch = buffer.match(/\r?\n\r?\n/);

    while (eventMatch?.index !== undefined) {
      const eventEnd = eventMatch.index;
      const rawEvent = buffer.slice(0, eventEnd);
      buffer = buffer.slice(eventEnd + eventMatch[0].length);
      dispatchSseEvent(rawEvent, onData);
      eventMatch = buffer.match(/\r?\n\r?\n/);
    }
  }

  buffer += decoder.decode();
  if (buffer.trim()) dispatchSseEvent(buffer, onData);
}

function dispatchSseEvent(
  rawEvent: string,
  onData: (data: string) => void,
) {
  const data = rawEvent
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n')
    .trim();

  if (data) onData(data);
}

function buildAIResponse(
  provider: AIProviderName,
  text: string,
  inputTokens: number,
  outputTokens: number,
  totalTokens?: number,
): AIResponse {
  const tokensUsed = totalTokens && totalTokens > 0 ? totalTokens : inputTokens + outputTokens;
  return {
    text,
    provider,
    inputTokens,
    outputTokens,
    tokensUsed,
    costAzn: tokensUsed * COST_PER_TOKEN[provider],
  };
}

function estimateInputTokens(req: AIRequest): number {
  return Math.ceil(`${req.system ?? ''}\n${req.prompt}`.length / 4);
}

function logProviderSuccess(
  provider: AIProviderName,
  req: AIRequest,
  opts: AIRouterOptions,
  response: AIResponse,
  durationMs: number,
) {
  console.info('[ai-router] provider success', {
    provider,
    toolSlug: opts.toolSlug,
    userId: opts.userId,
    stream: req.stream ?? false,
    responseFormat: req.responseFormat ?? 'text',
    timeoutMs: req.timeout ?? DEFAULT_TIMEOUT_MS,
    inputTokens: response.inputTokens ?? 0,
    outputTokens: response.outputTokens ?? 0,
    tokensUsed: response.tokensUsed,
    durationMs,
  });
}

function logProviderError(
  provider: AIProviderName,
  req: AIRequest,
  opts: AIRouterOptions,
  err: unknown,
) {
  console.error('[ai-router] provider failed', {
    provider,
    toolSlug: opts.toolSlug,
    userId: opts.userId,
    stream: req.stream ?? false,
    responseFormat: req.responseFormat ?? 'text',
    timeoutMs: req.timeout ?? DEFAULT_TIMEOUT_MS,
    estimatedInputTokens: estimateInputTokens(req),
    outputTokens: 0,
    error: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
  });
}
