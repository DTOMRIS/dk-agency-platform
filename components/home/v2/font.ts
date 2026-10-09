/**
 * @file font.ts
 * @purpose Inter 400–900 for the homepage v2 sections (the approved /tanitim design uses Inter 800/900).
 * @task TASK-0512
 */
import { Inter } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});
