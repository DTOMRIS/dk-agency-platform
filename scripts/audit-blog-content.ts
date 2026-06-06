import fs from 'node:fs';
import path from 'node:path';
import { BLOG_ARTICLES } from '../lib/data/blogArticles';

type Finding = {
  slug: string;
  kind: 'broken-link' | 'legacy-link' | 'language' | 'missing-tool-link';
  value: string;
};

const appDir = path.join(process.cwd(), 'app');
const routes = new Set<string>();

function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (!entry.isFile() || entry.name !== 'page.tsx') continue;

    const relative = path.relative(appDir, path.dirname(full)).replaceAll('\\', '/');
    const route = relative.replace(/^\[locale\]\/?/, '');
    routes.add(route ? `/${route}` : '/');
  }
}

walk(appDir);

const slugs = new Set(BLOG_ARTICLES.map((article) => article.slug));
const findings: Finding[] = [];
const languagePatterns: Array<[RegExp, string]> = [
  [/\bişletm(e|ə|ənin|nin|ler|ələr)\b/giu, 'işletmə → müəssisə'],
  [/\byatırım(cı|çı|ı|lar)?\b/giu, 'yatırım → investisiya'],
  [/\bnakit\b/giu, 'nakit → pul axını/nağd'],
  [/\bkanıtlanmış\b/giu, 'kanıtlanmış → sübut edilmiş'],
  [/\bkriteriya\b/giu, 'kriteriya → meyar'],
  [/\bortalama\b/giu, 'ortalama → orta'],
  [/\bkâr\b/giu, 'kâr → mənfəət'],
  [/\bgeçici\b/giu, 'geçici → müvəqqəti'],
  [/\bkapatma\b/giu, 'kapatma → bağlanma'],
  [/\bkayıt\b/giu, 'kayıt → qeyd'],
  [/\bbilinçli\b/giu, 'bilinçli → şüurlu'],
  [/\bitirdir\b/giu, 'itirdir → itirir'],
  [/\bsermaye\b/giu, 'sermaye → kapital'],
  [/\bdevral\w*/giu, 'devralmaq → təhvil almaq'],
  [/\bkurulum\b/giu, 'kurulum → qurulum'],
  [/pul axını axını/giu, 'təkrarlanan pul axını'],
  [/kanıtlanmış/giu, 'kanıtlanmış → sübut edilmiş'],
  [/investisiyaını/giu, 'investisiyaını → investisiyasını'],
  [/\bsermaye\w*/giu, 'sermaye → kapital'],
  [/\bsatın\b/giu, 'satın → alış/almaq'],
  [/\bskor\w*/giu, 'skor → göstərici'],
];

function routeExists(href: string) {
  const clean = href.split(/[?#]/)[0].replace(/\/$/, '') || '/';
  if (clean.startsWith('/blog/')) return slugs.has(clean.slice('/blog/'.length));
  if (routes.has(clean)) return true;
  return [...routes].some((route) => {
    if (!route.includes('[')) return false;
    const pattern = new RegExp(`^${route.replace(/\[[^/]+\]/g, '[^/]+')}$`);
    return pattern.test(clean);
  });
}

for (const article of BLOG_ARTICLES) {
  const links = [...article.content.matchAll(/\[[^\]]+\]\((\/[^)]+)\)/g)].map((match) => match[1]);
  for (const href of links) {
    if (!routeExists(href)) findings.push({ slug: article.slug, kind: 'broken-link', value: href });
    if (href === '/toolkit' || href.startsWith('/toolkit?')) {
      findings.push({ slug: article.slug, kind: 'legacy-link', value: href });
    }
  }

  const plainLegacyLinks = [...article.content.matchAll(/dkagency\.com\.tr\/(toolkit|danismanlik)/g)];
  for (const match of plainLegacyLinks) {
    findings.push({ slug: article.slug, kind: 'legacy-link', value: match[0] });
  }

  for (const [pattern, label] of languagePatterns) {
    const matches = article.content.match(pattern);
    if (matches?.length) {
      findings.push({ slug: article.slug, kind: 'language', value: `${label} (${matches.length})` });
    }
  }

  if (!links.some((href) => href.startsWith('/toolkit/') || href.startsWith('/marketinq/') || href.startsWith('/franchise/'))) {
    findings.push({ slug: article.slug, kind: 'missing-tool-link', value: article.category });
  }
}

const grouped = Object.groupBy(findings, (finding) => finding.kind);
console.log(JSON.stringify({
  articleCount: BLOG_ARTICLES.length,
  routeCount: routes.size,
  totals: Object.fromEntries(Object.entries(grouped).map(([key, value]) => [key, value?.length || 0])),
  findings,
}, null, 2));
