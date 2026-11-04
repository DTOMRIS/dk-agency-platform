import assert from 'node:assert/strict';
import { deliverNewsForApproval } from '../lib/telegram/news-approval';

async function main() {
  const fetchBefore = globalThis.fetch;
  const tokenBefore = process.env.TELEGRAM_BOT_TOKEN;
  const chatBefore = process.env.TELEGRAM_CHAT_ID;
  process.env.TELEGRAM_BOT_TOKEN = 'unit-test-token';
  process.env.TELEGRAM_CHAT_ID = 'unit-test-chat';
  const candidate = { id: 1, titleAz: 'Mənbə yoxlanmalıdır', reviewOnly: true, sourceUrls: ['https://report.az/a'] };
  try {
    globalThis.fetch = async (_url, init) => {
      const payload = JSON.parse(String(init?.body)) as { reply_markup: { inline_keyboard: Array<Array<{ callback_data?: string }>> } };
      assert(payload.reply_markup.inline_keyboard.flat().every((b) => !b.callback_data), 'review has no publish button');
      return Response.json({ ok: true, result: { message_id: 42 } });
    };
    assert.deepEqual(await deliverNewsForApproval(candidate), { state: 'sent', messageId: 42 });
    globalThis.fetch = async () => Response.json({ ok: false, description: 'Too Many Requests' }, { status: 429 });
    assert.equal((await deliverNewsForApproval(candidate)).state, 'failed');
    globalThis.fetch = async () => { throw new Error('timeout after request'); };
    assert.equal((await deliverNewsForApproval(candidate)).state, 'uncertain');
    globalThis.fetch = async () => new Response('bad gateway', { status: 502 });
    assert.equal((await deliverNewsForApproval(candidate)).state, 'uncertain');
    globalThis.fetch = async () => new Response('truncated response');
    assert.equal((await deliverNewsForApproval(candidate)).state, 'uncertain');
    globalThis.fetch = async () => Response.json({ ok: true });
    assert.equal((await deliverNewsForApproval(candidate)).state, 'uncertain');
  } finally {
    globalThis.fetch = fetchBefore;
    if (tokenBefore === undefined) delete process.env.TELEGRAM_BOT_TOKEN; else process.env.TELEGRAM_BOT_TOKEN = tokenBefore;
    if (chatBefore === undefined) delete process.env.TELEGRAM_CHAT_ID; else process.env.TELEGRAM_CHAT_ID = chatBefore;
  }
  console.log('news-delivery: OK (message ID, review-only, rejection, timeout, gateway, malformed response)');
}
main().catch((error: unknown) => { console.error(error); process.exit(1); });
