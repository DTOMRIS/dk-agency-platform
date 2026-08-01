/**
 * @file ai-models.ts
 * @purpose Centralized AI model identifiers — SINGLE SOURCE OF TRUTH.
 *
 * When a provider deprecates a model, change ONLY this file.
 * All 22+ call sites import from here — zero hardcoded model strings.
 *
 * Deadlines:
 *   - gemini-2.0-flash shutdown: 2026-06-01 — migrated (2.5-flash)
 *   - deepseek-chat deprecated:  2026-07-24 — migrated (v4-flash)
 *
 * @lastModified 2026-08-01 (TASK-0427)
 */

export const AI_MODELS = {
  gemini: {
    /** Vision + text — GA since May 2026 */
    vision: 'gemini-2.5-flash',
    /** Text-only tasks (same model, kept for semantic clarity) */
    text: 'gemini-2.5-flash',
  },
  deepseek: {
    /** Primary chat/reasoning model — replaces deprecated deepseek-chat */
    chat: 'deepseek-v4-flash',
  },
  claude: {
    /** Fallback provider — DeepSeek cokende ise dusur. Env override: KAZAN_ANTHROPIC_MODEL */
    fallback: 'claude-sonnet-4-6',
  },
} as const;

export type GeminiModel = (typeof AI_MODELS.gemini)[keyof typeof AI_MODELS.gemini];
export type DeepSeekModel = (typeof AI_MODELS.deepseek)[keyof typeof AI_MODELS.deepseek];
export type ClaudeModel = (typeof AI_MODELS.claude)[keyof typeof AI_MODELS.claude];

/** Isledilecek Claude modeli — env override, yoxdursa SST default. */
export function resolveClaudeModel(): string {
  return process.env.KAZAN_ANTHROPIC_MODEL || AI_MODELS.claude.fallback;
}

/**
 * `temperature` / `top_p` / `top_k` Claude-un yeni nesillerinde (Opus 4.7+,
 * Sonnet 5, Opus 5, Fable 5) API-den silinib — gonderilse sorgu 400 qaytarir.
 *
 * Allowlist QESDENDIR: taniinmayan model ID gelende parametri GONDERMIRIK.
 * Gondermek sorgunu sindirir; gondermemek ise yalniz default deyer demekdir —
 * yeni model ID-si env-de yazilanda fallback yolu sinmasin deye fail-safe terefe meyillidir.
 */
const CLAUDE_MODELS_ACCEPTING_TEMPERATURE: ReadonlySet<string> = new Set([
  'claude-sonnet-4-6',
  'claude-opus-4-6',
  'claude-sonnet-4-5',
  'claude-opus-4-5',
  'claude-haiku-4-5',
]);

export function claudeAcceptsTemperature(model: string): boolean {
  return CLAUDE_MODELS_ACCEPTING_TEMPERATURE.has(model);
}
