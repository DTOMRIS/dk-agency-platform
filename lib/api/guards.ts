/**
 * @file guards.ts
 * @purpose API route auth guards — tək giriş nöqtəsi.
 *
 * Niyə ayrıca modul: TASK-0439-a qədər hər route öz yoxlamasını kopyalayırdı,
 * ona görə də dörd route-da yoxlama ümumiyyətlə unudulmuşdu. İndi qayda bir
 * yerdədir; yeni route yazan adam iki sətirlə düzgün davranışı alır.
 *
 * Hansı sessiya sistemi: layihədə iki paralel sistem var —
 *   1. `lib/auth/guards.ts` → JWT cookie, `user.role`
 *   2. `lib/members/server-session.ts` → `session.plan`
 * Dashboard API-ları (`/api/settings`, `/api/blog/bulk`) və `/ilan-ver`
 * ikincini işlədir, ona görə bu modul da ikincinin üzərində qurulub.
 * İki sistemin birləşdirilməsi ayrıca işdir — bax docs/TECH_DEBT.md TD-003.
 */

import { NextResponse } from 'next/server';

import { getServerMemberSession } from '@/lib/members/server-session';

import type { MemberSession } from '@/lib/member-access';

export type GuardResult =
  | { ok: true; session: MemberSession }
  | { ok: false; response: NextResponse };

/** 401 — ümumiyyətlə giriş edilməyib. */
function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Giriş tələb olunur.' }, { status: 401 });
}

/** 403 — giriş var, amma səlahiyyət çatmır. */
function forbidden(): NextResponse {
  return NextResponse.json({ error: 'Admin səlahiyyəti tələb olunur.' }, { status: 403 });
}

/**
 * Giriş etmiş istifadəçi tələb edir (plan fərqi yoxdur).
 * AI çağırışları kimi xərc yaradan, amma admin olmayan endpoint-lər üçün.
 */
export async function requireApiMember(): Promise<GuardResult> {
  const session = await getServerMemberSession();
  if (!session.loggedIn) return { ok: false, response: unauthorized() };
  return { ok: true, session };
}

/** Admin tələb edir. Dashboard-a aid bütün yazma/oxuma endpoint-ləri üçün. */
export async function requireApiAdmin(): Promise<GuardResult> {
  const session = await getServerMemberSession();
  if (!session.loggedIn) return { ok: false, response: unauthorized() };
  if (session.plan !== 'admin') return { ok: false, response: forbidden() };
  return { ok: true, session };
}
