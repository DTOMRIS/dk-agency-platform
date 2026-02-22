import { NextRequest, NextResponse } from 'next/server';

type TelegramBody = {
  title?: string;
  url?: string;
};

function isValidUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json(
      {
        ok: false,
        provider: 'telegram',
        error: 'Telegram not configured',
      },
      { status: 501 },
    );
  }

  let body: TelegramBody;
  try {
    body = (await request.json()) as TelegramBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.title || !body.url) {
    return NextResponse.json({ ok: false, error: 'title and url are required' }, { status: 400 });
  }

  if (!isValidUrl(body.url)) {
    return NextResponse.json({ ok: false, error: 'url must be absolute http/https' }, { status: 400 });
  }

  const endpoint = `https://api.telegram.org/bot${token}/sendMessage`;
  const text = `${body.title}\n${body.url}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: false,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json(
        { ok: false, provider: 'telegram', error: 'Telegram API error', details },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, provider: 'telegram' });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        provider: 'telegram',
        error: 'Telegram request failed',
        details: String(error),
      },
      { status: 500 },
    );
  }
}
