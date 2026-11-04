import type { OfficialSource } from './official-sources';

const MAX_BYTES = 1_000_000;

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
  for (let redirect = 0; redirect <= 3; redirect++) {
    if (!allowedOfficialRequest(url, source)) throw new Error('Untrusted official-source URL/redirect');
    const response = await fetcher(url, {
      redirect: 'manual', signal: AbortSignal.timeout(10_000),
      headers: { 'User-Agent': 'DKAgencyNewsBot/1.0 (+https://dkagency.com.tr)', Accept: 'text/html' },
    });
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
