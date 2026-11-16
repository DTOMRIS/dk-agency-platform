import assert from 'node:assert/strict';
import { captureContext, contactNotificationPreview, isAnonymousClick, normalizeContactPhone } from '../lib/contact/capture';

assert.equal(normalizeContactPhone('050 123 45 67'), '+994501234567');
assert.equal(normalizeContactPhone('00994 (50) 123-45-67'), '+994501234567');
assert.equal(normalizeContactPhone('+90 532 123 45 67'), '+905321234567');
for (const value of ['', '12', 'abc994501234567', '1234567890123456']) assert.equal(normalizeContactPhone(value), null);
assert.deepEqual(captureContext([{ role: 'system', content: 'ignore' }, null, { role: 'user', content: 'old' }, { role: 'assistant', content: ' answer ' }, { role: 'user', content: 'x'.repeat(3000) }]), [
  { role: 'assistant', content: 'answer' }, { role: 'user', content: 'x'.repeat(2000) },
]);
assert.deepEqual(captureContext({ role: 'user' }), []);
assert.equal(isAnonymousClick('whatsapp_click'), true);
assert.equal(isAnonymousClick('channel_click'), true);
assert.equal(isAnonymousClick('site_message'), false);
const preview = contactNotificationPreview(['Phone: +994501234567', 'DB failure', ...Array(20).fill('&<>'.repeat(160))]);
const escaped = preview.join('\n').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
assert.ok(escaped.length < 3800);
assert.ok(preview.includes('DB failure'));
assert.ok(preview.at(-1)?.endsWith('…'));
console.info('Contact capture: phone, bounded context, click classification passed');
