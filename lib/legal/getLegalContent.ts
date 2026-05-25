import { promises as fs } from 'fs';
import path from 'path';
import { type Locale, defaultLocale } from '@/i18n/config';

export type LegalDocument = 'privacy' | 'terms' | 'cookie-policy';

interface LegalContentResult {
  content: string;
  /** true when the requested locale was missing and AZ fallback was served */
  isFallback: boolean;
}

export async function getLegalContent(
  locale: Locale,
  document: LegalDocument,
): Promise<LegalContentResult> {
  const requestedPath = path.join(
    process.cwd(),
    'content',
    'legal',
    locale,
    `${document}.md`,
  );

  try {
    const content = await fs.readFile(requestedPath, 'utf-8');
    return { content, isFallback: false };
  } catch {
    // Fallback to default locale (AZ) for missing translations
    if (locale !== defaultLocale) {
      const fallbackPath = path.join(
        process.cwd(),
        'content',
        'legal',
        defaultLocale,
        `${document}.md`,
      );
      const content = await fs.readFile(fallbackPath, 'utf-8');
      return { content, isFallback: true };
    }
    throw new Error(`Legal document not found: ${locale}/${document}`);
  }
}
