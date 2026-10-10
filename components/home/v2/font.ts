/**
 * @file font.ts
 * @purpose Inter 400–900 for the homepage v2 sections (the approved /tanitim design uses Inter 800/900).
 * @task TASK-0512
 *       TASK-0533 (owner 10.10 «sen karar ver»): also the site-wide font — app/layout.tsx puts `inter.variable`
 *       (--font-sans) on <html>; DM Sans and Playfair Display were dropped (−92 KB per page, one typeface).
 */
import { Inter } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-sans',
});
