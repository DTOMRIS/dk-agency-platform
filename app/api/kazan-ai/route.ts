import { NextRequest, NextResponse } from 'next/server';
import { buildKazanSystemPrompt } from '@/lib/kazan-ai/system-prompt';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type RequestBody = {
  messages?: ChatMessage[];
};

function normalizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter((message) => (message.role === 'user' || message.role === 'assistant') && message.content.trim())
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 4000),
    }));
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const messages = normalizeMessages(body.messages ?? []);

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Ən azı 1 mesaj göndərilməlidir.' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'KAZAN AI server-side konfiqurasiyası tapılmadı. ANTHROPIC_API_KEY əlavə olunmalıdır.',
        },
        { status: 503 },
      );
    }

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
        system: buildKazanSystemPrompt(),
        max_tokens: 700,
        temperature: 0.2,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: 'Anthropic proxy cavabı uğursuz oldu.',
          details: errorText.slice(0, 1200),
        },
        { status: response.status },
      );
    }

    const payload = (await response.json()) as {
      id?: string;
      model?: string;
      content?: Array<{ type?: string; text?: string }>;
    };

    const text = payload.content
      ?.filter((item) => item.type === 'text')
      .map((item) => item.text || '')
      .join('\n\n')
      .trim();

    if (!text) {
      return NextResponse.json({ error: 'Model boş cavab qaytardı.' }, { status: 502 });
    }

    return NextResponse.json({
      id: payload.id,
      model: payload.model || model,
      message: text,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'KAZAN AI sorğusu zamanı xəta baş verdi.',
        details: String(error),
      },
      { status: 500 },
    );
  }
}
