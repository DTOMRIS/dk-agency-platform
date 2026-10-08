/**
 * @file app/tanitim/route.ts
 * @purpose Satış üçün tanıtım səhifəsi — `/tanitim` (TASK-0509).
 *
 * Səhifə müstəqil hazırlanmış HTML-dir (öz menyusu, footer-i, CSS-i və canlı food cost
 * kalkulyatoru ilə) — `public/tanitim/index.html`. Burada yalnız gözəl ünvanla verilir;
 * mətn/dizayn dəyişikliyi həmin faylda edilir. Middleware yalnız dil prefiksli yolları tutur,
 * ona görə bu yol yönləndirilmir.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-static';

export async function GET() {
  const html = await readFile(path.join(process.cwd(), 'public/tanitim/index.html'), 'utf8');
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=3600',
    },
  });
}
