/**
 * @file slugify-az.ts
 * @purpose Azərbaycan/Türk hərfləri üçün mərkəzi slug generatoru
 * @usage import { slugifyAz } from '@/lib/utils/slugify-az'
 */

export function slugifyAz(value: string): string {
  return value
    .replace(/İ/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/I/g, 'i')
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/\u0307/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}
