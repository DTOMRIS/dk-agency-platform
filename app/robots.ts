import type { MetadataRoute } from "next";

const PRIVATE_PATHS = ["/dashboard", "/b2b-panel", "/settings", "/api/"];
const LOCALE_PREFIXES = ["", "/ru", "/en", "/tr"];

/**
 * TASK-0474: private sections (login-gated, redirect to /auth/login) are disallowed for every
 * locale. Account / email-token / placeholder pages are NOT disallowed here on purpose — they
 * carry `noindex` in their layout, and crawlers must be able to fetch them to see it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: LOCALE_PREFIXES.flatMap((prefix) => PRIVATE_PATHS.map((path) => `${prefix}${path}`)),
    },
    sitemap: "https://dkagency.com.tr/sitemap.xml",
    host: "https://dkagency.com.tr",
  };
}
