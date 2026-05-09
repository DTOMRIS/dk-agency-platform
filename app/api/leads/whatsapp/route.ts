import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_NUMBER = '994502566279';

export function GET(req: NextRequest) {
  const message = req.nextUrl.searchParams.get('text') ?? '';
  const url = new URL(`https://wa.me/${WHATSAPP_NUMBER}`);
  if (message) {
    url.searchParams.set('text', message);
  }

  return NextResponse.redirect(url);
}
