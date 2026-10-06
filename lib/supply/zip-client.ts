/**
 * TASK-0498 — Brauzerdə WhatsApp ZIP-dən `_chat.txt`-ni çıxarır (bütöv faylı yükləmədən).
 * Şəkil/səs ilə ixrac yüzlərlə MB ola bilər; serverə yalnız mətn (bir neçə MB) gedir.
 */

import { extractChatText, type ZipSource } from './zip';

async function inflateRawInBrowser(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export function canExtractInBrowser(): boolean {
  return typeof DecompressionStream !== 'undefined';
}

export async function extractChatFromZipFile(file: File): Promise<string> {
  const source: ZipSource = {
    size: file.size,
    read: async (offset, length) =>
      new Uint8Array(await file.slice(offset, offset + length).arrayBuffer()),
    inflateRaw: inflateRawInBrowser,
  };
  return extractChatText(source);
}
