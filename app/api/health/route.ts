import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({ ok: true, service: 'dk-agency-platform', timestamp: new Date().toISOString() });
}
