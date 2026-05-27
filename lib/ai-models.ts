/**
 * @file ai-models.ts
 * @purpose Centralized AI model identifiers — SINGLE SOURCE OF TRUTH.
 *
 * When a provider deprecates a model, change ONLY this file.
 * All 22+ call sites import from here — zero hardcoded model strings.
 *
 * Deadlines:
 *   - gemini-2.0-flash shutdown: 2026-06-01
 *   - deepseek-chat deprecated:  2026-07-24 (migrate to v4-flash)
 *
 * @lastModified 2026-05-27 (TASK-A02pre)
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
} as const;

export type GeminiModel = (typeof AI_MODELS.gemini)[keyof typeof AI_MODELS.gemini];
export type DeepSeekModel = (typeof AI_MODELS.deepseek)[keyof typeof AI_MODELS.deepseek];
