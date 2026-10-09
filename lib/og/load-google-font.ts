/**
 * Google Fonts-dan yalnız lazım olan glifləri TTF/OTF kimi yükləyir — `next/og` (satori) woff2 oxumur.
 * TASK-0510: `app/api/news/card/[id]/route.tsx`-dən çıxarıldı ki, sayt OG şəkli də eyni yolu işlətsin
 * (route.ts faylından ixtiyari export Next App Router-də qadağandır).
 */
/** TASK-0513: şəbəkə ilişsə önizləmə gözləməsin — `timeoutMs` keçəndə xəta atır, çağıran standart şriftə düşür. */
export async function loadGoogleFont(
  family: string,
  weight: number,
  text: string,
  timeoutMs = 5000
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (!src) throw new Error(`font not found: ${family}`);
  return (await fetch(src[1], { signal: AbortSignal.timeout(timeoutMs) })).arrayBuffer();
}
