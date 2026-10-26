'use client';

import Script from 'next/script';

/**
 * TASK-0551 (owner 26.10: «kaç kişi, hangi ülkeden girmiş?»): Cloudflare Web Analytics beacon.
 * Cookieless (no consent needed, so every visitor is counted — unlike Yandex Metrica, which only
 * counts visitors who accepted cookies), no DNS change: the site stays on Hostinger.
 * Shows visits, countries, pages, referrers and devices in the Cloudflare dashboard.
 * The token is a public site key (it ships in every page), not a secret.
 * SPA navigations are picked up by the beacon itself (history API), so one mount is enough.
 * Mounted in PublicChrome only — admin / B2B panel visits are not counted.
 * CSP: `https://static.cloudflareinsights.com` is allowed in next.config.ts script-src.
 */
const CF_BEACON_TOKEN = 'cdc7b8e5746c4387baf9dff01637700e';

export default function CloudflareWebAnalytics() {
  return (
    <Script
      id="cf-web-analytics"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN })}
    />
  );
}
