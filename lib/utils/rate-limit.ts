/**
 * @file rate-limit.ts
 * @purpose In-memory sliding window rate limiter (IP-based)
 * @note Production-ready for single-instance; swap Map for Upstash Redis for multi-instance
 */

import { NextRequest, NextResponse } from 'next/server';

type RateLimitEntry = {
  timestamps: number[];
};

type RateLimitConfig = {
  /** Max requests allowed within the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
};

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

/**
 * Extract client IP from request headers (behind Hostinger/Cloudflare proxy)
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  );
}

/**
 * Check rate limit for a given key (typically IP + endpoint)
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const cutoff = now - config.windowMs;

  cleanup(config.windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  const remaining = Math.max(0, config.maxRequests - entry.timestamps.length);
  const reset = entry.timestamps.length > 0
    ? Math.ceil((entry.timestamps[0] + config.windowMs) / 1000)
    : Math.ceil((now + config.windowMs) / 1000);

  if (entry.timestamps.length >= config.maxRequests) {
    return { success: false, limit: config.maxRequests, remaining: 0, reset };
  }

  entry.timestamps.push(now);
  return { success: true, limit: config.maxRequests, remaining: remaining - 1, reset };
}

/**
 * Apply rate limit headers to a response
 */
export function withRateLimitHeaders(response: NextResponse, result: RateLimitResult): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(result.reset));
  return response;
}

/**
 * Create a 429 response with rate limit headers
 */
export function rateLimitExceeded(result: RateLimitResult, locale?: string): NextResponse {
  const retryMinutes = Math.max(1, Math.ceil((result.reset * 1000 - Date.now()) / 60000));

  const messages: Record<string, string> = {
    az: `Çox sorğu göndərdiniz. ${retryMinutes} dəqiqə sonra cəhd edin.`,
    ru: `Слишком много запросов. Повторите через ${retryMinutes} мин.`,
    en: `Too many requests. Please try again in ${retryMinutes} minute(s).`,
    tr: `Çok fazla istek gönderdiniz. ${retryMinutes} dakika sonra tekrar deneyin.`,
  };

  const response = NextResponse.json(
    { error: messages[locale || 'az'] || messages.az },
    { status: 429 },
  );

  return withRateLimitHeaders(response, result);
}

// ── Pre-configured limiters for common endpoints ──────────────

export const RATE_LIMITS = {
  authLogin: { maxRequests: 5, windowMs: 15 * 60 * 1000 },       // 5 / 15 min
  authRegister: { maxRequests: 3, windowMs: 60 * 60 * 1000 },    // 3 / 1 hour
  authForgotPassword: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 / 1 hour
  authResetPassword: { maxRequests: 5, windowMs: 60 * 60 * 1000 },  // 5 / 1 hour
  authVerifyEmail: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 / 1 hour
  kazanAi: { maxRequests: 30, windowMs: 60 * 1000 },             // 30 / 1 min
  invoiceOcr: { maxRequests: 20, windowMs: 60 * 60 * 1000 },     // 20 / 1 hour
} as const;
