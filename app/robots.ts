import type { MetadataRoute } from "next";

const PRIVATE_PATHS = ["/dashboard", "/b2b-panel", "/settings", "/api/"];
const LOCALE_PREFIXES = ["", "/ru", "/en", "/tr"];
const DISALLOW = LOCALE_PREFIXES.flatMap((prefix) => PRIVATE_PATHS.map((path) => `${prefix}${path}`));

/**
 * TASK-0513: AI cavab mühərrikləri (ChatGPT, Claude, Perplexity, Gemini) açıq dəvət olunur — sayt
 * onların cavablarında mənbə kimi görünsün (`/llms.txt` da onlar üçündür). `*` qrupu onları onsuz da
 * buraxırdı; ayrıca qrup bu niyyəti sənədləşdirir. Robots qaydasında xüsusi qrup `*`-ı əvəz edir,
 * ona görə eyni `disallow` siyahısı hər qrupa təkrar verilir.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
];

/**
 * TASK-0474: private sections (login-gated, redirect to /auth/login) are disallowed for every
 * locale. Account / email-token / placeholder pages are NOT disallowed here on purpose — they
 * carry `noindex` in their layout, and crawlers must be able to fetch them to see it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: "https://dkagency.com.tr/sitemap.xml",
    host: "https://dkagency.com.tr",
  };
}
