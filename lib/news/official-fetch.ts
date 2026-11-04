import type { OfficialSource } from './official-sources';

const MAX_BYTES = 1_000_000;

function connectionReason(error: unknown): string {
  if (!(error instanceof Error)) return 'unknown connection error';
  const cause = error.cause;
  if (cause && typeof cause === 'object' && 'code' in cause && typeof cause.code === 'string') return cause.code;
  return error.name === 'Error' ? error.message.slice(0, 160) : error.name;
}

/** Follow only this configured official host (www alias allowed), never arbitrary redirects. */
export function allowedOfficialRequest(raw: string, source: OfficialSource): boolean {
  try {
    const url = new URL(raw), base = new URL(source.url);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && url.hostname.replace(/^www\./, '') === base.hostname.replace(/^www\./, '')
      && (url.pathname.replace(/\/$/, '') === base.pathname.replace(/\/$/, '')
        || url.pathname.startsWith(source.articlePath));
  } catch { return false; }
}

export async function fetchOfficialHtml(source: OfficialSource, initialUrl = source.url, fetcher: typeof fetch = fetch): Promise<string> {
  let url = initialUrl;
  let aliasTried = false;
  const connectionErrors: string[] = [];
  // The whole redirect/alias chain is bounded too, not just each individual response.
  const deadline = AbortSignal.timeout(20_000);
  for (let redirect = 0; redirect <= 3; redirect++) {
    if (!allowedOfficialRequest(url, source)) throw new Error('Untrusted official-source URL/redirect');
    let response: Response;
    try {
      response = await fetcher(url, {
        redirect: 'manual', signal: AbortSignal.any([deadline, AbortSignal.timeout(10_000)]),
        headers: { 'User-Agent': 'DKAgencyNewsBot/1.0 (+https://dkagency.com.tr)', Accept: 'text/html' },
      });
    } catch (error) {
      connectionErrors.push(connectionReason(error));
      // Only a normal official www/bare alias, only on connection failure. Never retry a 403
      // through another host, change the bot identity, or disable TLS verification.
      if (!aliasTried && !deadline.aborted) {
        aliasTried = true;
        const alias = new URL(url);
        alias.hostname = alias.hostname.startsWith('www.') ? alias.hostname.slice(4) : `www.${alias.hostname}`;
        url = alias.href;
        continue;
      }
      throw new Error(`Fetch failed (${connectionErrors.join(' → ')})`);
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) throw new Error(`HTTP ${response.status} without location`);
      url = new URL(location, url).href;
      continue;
    }
    if (!response.ok) { await response.body?.cancel(); throw new Error(`HTTP ${response.status}`); }
    if (!response.headers.get('content-type')?.toLowerCase().includes('text/html')) {
      await response.body?.cancel(); throw new Error('Expected HTML press page');
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Empty press response');
    const decoder = new TextDecoder();
    let bytes = 0, html = '';
    try {
      for (;;) {
        const part = await reader.read();
        if (part.done) break;
        bytes += part.value.byteLength;
        if (bytes > MAX_BYTES) { await reader.cancel(); throw new Error('Press page exceeds 1 MB'); }
        html += decoder.decode(part.value, { stream: true });
      }
    } finally { reader.releaseLock(); }
    return html + decoder.decode();
  }
  throw new Error('Too many official-source redirects');
}
