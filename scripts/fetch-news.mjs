#!/usr/bin/env node
/**
 * DK Agency — Günlük xəbər çəkmə və tərcümə skripti
 *
 * RSS feedlərdən HoReCa xəbərlərini çəkir, Azərbaycan dilinə tərcümə edir
 * və lib/data/curatedNews.json-a yazır.
 *
 * İstifadə:
 *   npm run fetch:news              # GEMINI_API_KEY ilə tərcümə
 *   npm run fetch:news -- --no-translate   # Yalnız çək, tərcümə etmə
 *   npm run fetch:news -- --limit 5        # Max 5 xəbər
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const CURATED_FILE = join(ROOT, 'lib', 'data', 'curatedNews.json');
const PENDING_FILE = join(ROOT, 'lib', 'data', 'pendingNews.json');

const RSS_FEEDS = [
  // Azərbaycan — artıq AZ dilində, tərcümə lazım deyil
  { url: 'https://turizmplus.az/rss', source: 'Turizmplus.az', lang: 'az' },
  { url: 'https://turizmmedia.az/feed', source: 'Turizm Media', lang: 'az' },
  // Türkiyə HoReCa — TR→AZ tərcümə
  { url: 'https://en.horecatrend.com/feed', source: 'HORECA TREND', lang: 'tr' },
  // Beynəlxalq — EN→AZ tərcümə
  { url: 'https://www.hospitalitynet.org/news/global.xml', source: 'Hospitality Net', lang: 'en' },
  { url: 'https://www.hospitalitynet.org/news/mea.xml', source: 'Hospitality Net MEA', lang: 'en' },
  { url: 'https://www.hospitalitynet.org/news/europe.xml', source: 'Hospitality Net Europe', lang: 'en' },
];

const MAX_ITEMS = parseInt(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || process.env.FETCH_NEWS_LIMIT || '15', 10);
const NO_TRANSLATE = process.argv.includes('--no-translate');

function loadJson(path) {
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return [];
  }
}

function savePending(items) {
  const dataDir = join(ROOT, 'lib', 'data');
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  const seen = new Set();
  const unique = items.filter((i) => {
    const key = i.sourceUrl || i.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const sorted = unique.sort((a, b) => new Date(b.date) - new Date(a.date));
  const toKeep = sorted.slice(0, 100);
  writeFileSync(PENDING_FILE, JSON.stringify(toKeep, null, 2), 'utf8');
  console.log(`[fetch-news] Saved ${toKeep.length} items to pendingNews.json`);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

async function translateWithDeepSeek(text, apiKey) {
  if (!apiKey || !text?.trim()) return text;
  try {
    const fromLang = text.match(/[ğüşıöçĞÜŞİÖÇ]/) ? 'Turkish' : 'English';
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: `Translate the following ${fromLang} hospitality/restaurant news text to Azerbaijani (az-AZ). Return ONLY the translation, no explanations.\n\n${text.slice(0, 2000)}`,
          },
        ],
        temperature: 0.2,
      }),
    });
    const data = await res.json();
    const out = data?.choices?.[0]?.message?.content?.trim();
    return out || text;
  } catch (e) {
    console.warn('[fetch-news] DeepSeek translate error:', e.message);
    return text;
  }
}

async function translateWithGemini(text, apiKey) {
  if (!apiKey || !text?.trim()) return text;
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Translate the following text (English or Turkish) to Azerbaijani (az-AZ). Return ONLY the translation.\n\n${text.slice(0, 2000)}`,
      config: { temperature: 0.2 },
    });
    const out = res?.text?.trim();
    return out || text;
  } catch (e) {
    console.warn('[fetch-news] Gemini translate error:', e.message);
    return text;
  }
}

async function translate(text, sourceLang) {
  const deepSeekKey = process.env.DEEPSEEK_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (sourceLang === 'az') return text;
  if (deepSeekKey) return translateWithDeepSeek(text, deepSeekKey);
  if (geminiKey) return translateWithGemini(text, geminiKey);
  return text;
}

async function fetchRss(url) {
  try {
    const Parser = (await import('rss-parser')).default;
    const parser = new Parser({ timeout: 10000 });
    const feed = await parser.parseURL(url);
    return feed?.items || [];
  } catch (e) {
    console.warn(`[fetch-news] RSS fetch failed ${url}:`, e.message);
    return [];
  }
}

function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

async function main() {
  console.log('[fetch-news] Starting…');
  const hasTranslate = process.env.DEEPSEEK_API_KEY || process.env.GEMINI_API_KEY;
  if (!NO_TRANSLATE && !hasTranslate) {
    console.warn('[fetch-news] DEEPSEEK_API_KEY or GEMINI_API_KEY not set. Use --no-translate to skip.');
  }

  const curated = loadJson(CURATED_FILE);
  const pending = loadJson(PENDING_FILE);
  const existingUrls = new Set([
    ...curated.map((i) => i.sourceUrl).filter(Boolean),
    ...pending.map((i) => i.sourceUrl).filter(Boolean),
  ]);

  const allItems = [];
  for (const { url, source, lang } of RSS_FEEDS) {
    const items = await fetchRss(url);
    for (const item of items.slice(0, 8)) {
      const link = item.link || item.guid;
      if (!link || existingUrls.has(link)) continue;

      const title = (item.title || '').trim();
      const content = stripHtml(item.contentSnippet || item.content || item.summary || '');
      const excerpt = content.slice(0, 300) || title;
      const pubDate = item.pubDate || item.isoDate || new Date().toISOString();

      const raw = {
        id: `curated-${hash(link)}`,
        title,
        excerpt,
        sourceUrl: link,
        source,
        date: pubDate,
        category: 'Report',
        type: 'Report',
        image: item.enclosure?.url || item['media:content']?.[0]?.['$']?.url || item['media:thumbnail']?.[0]?.['$']?.url || `https://picsum.photos/seed/${hash(link)}/800/600`,
        author: item.creator || item['dc:creator'] || source,
      };

      if (NO_TRANSLATE || lang === 'az') {
        raw.titleAz = raw.title;
        raw.excerptAz = raw.excerpt;
      } else {
        raw.titleAz = await translate(raw.title, lang);
        raw.excerptAz = await translate(excerpt, lang);
      }

      allItems.push(raw);
      existingUrls.add(link);
      if (allItems.length >= MAX_ITEMS) break;
    }
    if (allItems.length >= MAX_ITEMS) break;
  }

  const merged = [...allItems, ...pending];
  savePending(merged);
  console.log(`[fetch-news] Done. Fetched ${allItems.length} new items → pendingNews.json (admin təsdiqindən sonra curatedNews-ə keçəcək)`);
}

main().catch((e) => {
  console.error('[fetch-news] Error:', e);
  process.exit(1);
});
