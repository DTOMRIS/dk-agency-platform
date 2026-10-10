import { NextResponse } from 'next/server';

/**
 * public-ok: retired. TASK-0530: this checked an in-memory mock token store (lib/auth/mock-state), so a real
 * user's token was always «invalid» while the response looked like a real verification API. E-mail
 * verification is /api/auth/confirm?token=… (DB); /verify-email?token=… now forwards there.
 */
export function POST() {
  return NextResponse.json(
    { success: false, error: 'Bu ünvan bağlanıb. Təsdiq linki: /api/auth/confirm?token=…', confirmPath: '/api/auth/confirm' },
    { status: 410 },
  );
}
