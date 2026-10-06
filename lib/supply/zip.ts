/**
 * TASK-0498 — Asılılıqsız minimal ZIP oxuyucu: WhatsApp ixracından yalnız `_chat.txt`-ni çıxarır.
 *
 * Niyə öz kodumuz: `package.json` qorunur və orada jszip/adm-zip yoxdur. ZIP
 * formatının bizə lazım olan hissəsi kiçikdir: sonda «End of central directory»
 * qeydi → mərkəzi kataloq → lazım olan faylın lokal başlığı → deflate məlumatı.
 *
 * Mühitdən asılı deyil: oxuma (`read`) və açma (`inflate`) funksiyalarını çağıran
 * verir. Server `Buffer` + `zlib.inflateRawSync`, brauzer isə `File.slice` +
 * `DecompressionStream('deflate-raw')` işlədir — 500 MB-lıq ixracda (şəkil/səs
 * ilə) brauzer yalnız ~3 MB-lıq `_chat.txt`-ni oxuyur, bütöv fayl yüklənmir.
 *
 * Dəstəklənmir: ZIP64 (≥4 GB və ya ≥65535 fayl) və şifrəli arxivlər — aydın xəta.
 */

export interface ZipSource {
  size: number;
  read(offset: number, length: number): Promise<Uint8Array>;
  inflateRaw(data: Uint8Array): Promise<Uint8Array>;
}

export class ZipError extends Error {
  constructor(public readonly code: 'not_zip' | 'no_chat' | 'unsupported' | 'too_large') {
    super(code);
    this.name = 'ZipError';
  }
}

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const MAX_COMMENT = 0xffff;

function u16(view: DataView, offset: number): number {
  return view.getUint16(offset, true);
}
function u32(view: DataView, offset: number): number {
  return view.getUint32(offset, true);
}

interface Entry {
  name: string;
  method: number;
  flags: number;
  compressedSize: number;
  uncompressedSize: number;
  localOffset: number;
}

async function readCentralDirectory(source: ZipSource): Promise<Entry[]> {
  const tailLength = Math.min(source.size, 22 + MAX_COMMENT);
  const tail = await source.read(source.size - tailLength, tailLength);
  const tailView = new DataView(tail.buffer, tail.byteOffset, tail.byteLength);

  let eocd = -1;
  for (let i = tail.byteLength - 22; i >= 0; i -= 1) {
    if (u32(tailView, i) === EOCD_SIGNATURE) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) throw new ZipError('not_zip');

  const entryCount = u16(tailView, eocd + 10);
  const cdSize = u32(tailView, eocd + 12);
  const cdOffset = u32(tailView, eocd + 16);
  if (entryCount === 0xffff || cdOffset === 0xffffffff) throw new ZipError('unsupported');

  const cd = await source.read(cdOffset, cdSize);
  const view = new DataView(cd.buffer, cd.byteOffset, cd.byteLength);
  const decoder = new TextDecoder('utf-8');
  const entries: Entry[] = [];

  let p = 0;
  for (let n = 0; n < entryCount && p + 46 <= cd.byteLength; n += 1) {
    if (u32(view, p) !== CENTRAL_SIGNATURE) throw new ZipError('not_zip');
    const nameLength = u16(view, p + 28);
    const extraLength = u16(view, p + 30);
    const commentLength = u16(view, p + 32);
    entries.push({
      flags: u16(view, p + 8),
      method: u16(view, p + 10),
      compressedSize: u32(view, p + 20),
      uncompressedSize: u32(view, p + 24),
      localOffset: u32(view, p + 42),
      name: decoder.decode(cd.subarray(p + 46, p + 46 + nameLength)),
    });
    p += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function pickChatEntry(entries: Entry[]): Entry | null {
  const files = entries.filter((entry) => !entry.name.endsWith('/'));
  const exact = files.find((entry) => entry.name.split('/').pop() === '_chat.txt');
  if (exact) return exact;
  const texts = files.filter((entry) => entry.name.toLowerCase().endsWith('.txt'));
  return texts.length === 1 ? texts[0] : null;
}

/**
 * Arxivdən `_chat.txt`-ni UTF-8 mətn kimi qaytarır.
 * @param maxBytes açılmış mətnin yuxarı həddi (default 20 MB)
 */
export async function extractChatText(
  source: ZipSource,
  maxBytes = 20 * 1024 * 1024
): Promise<string> {
  const entries = await readCentralDirectory(source);
  const entry = pickChatEntry(entries);
  if (!entry) throw new ZipError('no_chat');
  if (entry.flags & 0x1) throw new ZipError('unsupported');
  if (entry.compressedSize === 0xffffffff || entry.uncompressedSize === 0xffffffff) {
    throw new ZipError('unsupported');
  }
  if (entry.uncompressedSize > maxBytes) throw new ZipError('too_large');

  const header = await source.read(entry.localOffset, 30);
  const headerView = new DataView(header.buffer, header.byteOffset, header.byteLength);
  if (u32(headerView, 0) !== LOCAL_SIGNATURE) throw new ZipError('not_zip');
  const dataStart = entry.localOffset + 30 + u16(headerView, 26) + u16(headerView, 28);
  const data = await source.read(dataStart, entry.compressedSize);

  let bytes: Uint8Array;
  if (entry.method === 0) bytes = data;
  else if (entry.method === 8) bytes = await source.inflateRaw(data);
  else throw new ZipError('unsupported');

  if (bytes.byteLength > maxBytes) throw new ZipError('too_large');
  return new TextDecoder('utf-8').decode(bytes);
}

/** Faylın ZIP olub-olmadığını ilk 4 baytdan yoxlayır («PK\x03\x04»). */
export function looksLikeZip(head: Uint8Array): boolean {
  return (
    head.length >= 4 && head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04
  );
}
