/**
 * @file app/api/news/card/[id]/route.tsx
 * @purpose Təsdiqlənmiş xəbər üçün Instagram/Facebook kartı (1080×1350 PNG, "B — ağ kağız" dizaynı).
 * Meta Graph API şəkli public URL-dən çəkir, ona görə route açıqdır — yalnız `approved` xəbərlər.
 * TASK-0489
 */
import { ImageResponse } from 'next/og';
import { NextResponse, type NextRequest } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { newsArticles } from '@/lib/db/schema';

export const runtime = 'nodejs';

type Locale = 'az' | 'ru' | 'en' | 'tr';
type Category = 'operations' | 'finance' | 'growth' | 'market' | 'technology';

const COPY: Record<Locale, { pulse: string; more: string; categories: Record<Category, string> }> =
  {
    az: {
      pulse: 'SEKTOR NƏBZİ',
      more: 'Ətraflı — bio-dakı link',
      categories: {
        operations: 'ƏMƏLİYYAT',
        finance: 'MALİYYƏ',
        growth: 'BÖYÜMƏ',
        market: 'BAZAR',
        technology: 'TEXNOLOGİYA',
      },
    },
    tr: {
      pulse: 'SEKTÖR NABZI',
      more: 'Detaylar — bio’daki link',
      categories: {
        operations: 'OPERASYON',
        finance: 'FİNANS',
        growth: 'BÜYÜME',
        market: 'PAZAR',
        technology: 'TEKNOLOJİ',
      },
    },
    en: {
      pulse: 'SECTOR PULSE',
      more: 'More — link in bio',
      categories: {
        operations: 'OPERATIONS',
        finance: 'FINANCE',
        growth: 'GROWTH',
        market: 'MARKET',
        technology: 'TECHNOLOGY',
      },
    },
    ru: {
      pulse: 'ПУЛЬС СЕКТОРА',
      more: 'Подробнее — ссылка в био',
      categories: {
        operations: 'ОПЕРАЦИИ',
        finance: 'ФИНАНСЫ',
        growth: 'РОСТ',
        market: 'РЫНОК',
        technology: 'ТЕХНОЛОГИИ',
      },
    },
  };

const INK = '#1A1A2E';
const RED = '#E94560';
const GOLD = '#C5A022';

function normalizeLocale(value: string | null): Locale {
  return value === 'ru' || value === 'en' || value === 'tr' ? value : 'az';
}

/** Markdown işarələrini təmizləyir, cümlə sərhədində qısaldır. */
function plainSummary(text: string, max = 190): string {
  const clean = text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#*_`>]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const sentence = cut.lastIndexOf('. ');
  return sentence > 80 ? cut.slice(0, sentence + 1) : `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

/** Google Fonts-dan yalnız lazım olan glifləri TTF kimi yükləyir (satori woff2 oxumur). */
async function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (!src) throw new Error(`font not found: ${family}`);
  return (await fetch(src[1])).arrayBuffer();
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isInteger(articleId) || articleId <= 0 || !db) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const [article] = await db
    .select({
      title: newsArticles.title,
      titleAz: newsArticles.titleAz,
      titleRu: newsArticles.titleRu,
      titleEn: newsArticles.titleEn,
      titleTr: newsArticles.titleTr,
      summaryAz: newsArticles.summaryAz,
      summaryRu: newsArticles.summaryRu,
      summaryEn: newsArticles.summaryEn,
      summaryTr: newsArticles.summaryTr,
      category: newsArticles.category,
      publishedAt: newsArticles.publishedAt,
      createdAt: newsArticles.createdAt,
    })
    .from(newsArticles)
    .where(and(eq(newsArticles.id, articleId), eq(newsArticles.status, 'approved')))
    .limit(1);

  if (!article) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const locale = normalizeLocale(req.nextUrl.searchParams.get('locale'));
  const copy = COPY[locale];
  const titles: Record<Locale, string | null> = {
    az: article.titleAz,
    ru: article.titleRu,
    en: article.titleEn,
    tr: article.titleTr,
  };
  const summaries: Record<Locale, string | null> = {
    az: article.summaryAz,
    ru: article.summaryRu,
    en: article.summaryEn,
    tr: article.summaryTr,
  };
  const title = titles[locale] || article.titleAz || article.title;
  const summary = plainSummary(summaries[locale] || article.summaryAz || '');
  const category = copy.categories[article.category as Category] ?? copy.categories.market;
  const date = (article.publishedAt ?? article.createdAt).toLocaleDateString('ru-RU', {
    timeZone: 'Asia/Baku',
  });
  const footer = `dkagency.com.tr · ${date}`;

  const titleSize = title.length > 90 ? 70 : title.length > 60 ? 80 : 88;

  const logo = await readFile(path.join(process.cwd(), 'public/images/logo-mobil.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  const sansText = `DK Agency ${copy.pulse} ${category} ${summary} ${footer} ${copy.more}`;
  const [playfair, interRegular, interBold] = await Promise.all([
    loadFont('Playfair+Display', 800, title),
    loadFont('Inter', 400, sansText),
    loadFont('Inter', 700, sansText),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: '1080px',
        height: '1350px',
        display: 'flex',
        background: '#FAFAF8',
        fontFamily: 'Inter',
        color: INK,
      }}
    >
      <div style={{ width: '22px', height: '100%', background: RED, display: 'flex' }} />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '84px 84px 72px 62px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={84} height={84} style={{ borderRadius: '20px' }} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '22px' }}>
            <span style={{ fontSize: '30px', fontWeight: 700 }}>DK Agency</span>
            <span
              style={{
                fontSize: '22px',
                fontWeight: 400,
                letterSpacing: '4px',
                color: RED,
                marginTop: '4px',
              }}
            >
              {copy.pulse}
            </span>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              background: INK,
              color: '#FFFFFF',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '3px',
              padding: '14px 26px',
              borderRadius: '999px',
            }}
          >
            {category}
          </div>
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            fontFamily: 'Playfair',
            fontSize: `${titleSize}px`,
            lineHeight: 1.08,
            letterSpacing: '-1px',
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: '120px',
            height: '10px',
            borderRadius: '10px',
            background: GOLD,
            margin: '48px 0 40px',
            display: 'flex',
          }}
        />
        {summary ? (
          <div
            style={{
              display: 'flex',
              fontSize: '34px',
              lineHeight: 1.45,
              color: '#374151',
              maxWidth: '860px',
            }}
          >
            {summary}
          </div>
        ) : null}

        <div
          style={{
            marginTop: 'auto',
            paddingTop: '40px',
            borderTop: '1.5px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '26px',
            fontWeight: 700,
          }}
        >
          <span style={{ color: '#6B7280' }}>{footer}</span>
          <span
            style={{
              background: INK,
              color: '#FFFFFF',
              padding: '20px 34px',
              borderRadius: '999px',
            }}
          >
            {copy.more}
          </span>
        </div>
      </div>
    </div>,
    {
      width: 1080,
      height: 1350,
      fonts: [
        { name: 'Playfair', data: playfair, weight: 800, style: 'normal' },
        { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
      ],
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
    }
  );
}
