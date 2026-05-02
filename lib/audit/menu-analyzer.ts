/**
 * @file menu-analyzer.ts
 * @purpose Menyu fotosunu AI ilə analiz et — qiymət, kateqoriya, food cost təxmini
 */

export interface MenuAnalysis {
  items: Array<{ name: string; price: number }>;
  avgPrice: number;
  priceRange: { min: number; max: number };
  categoryMix: string; // "Əsas yemək ağırlıqlı", "Balans", "İçki ağırlıqlı"
  pricingStrategy: string; // "Rəqabətli", "Premium", "Aşağı"
  observations: string[];
}

export async function analyzeMenu(menuPhotoUrl: string | null): Promise<MenuAnalysis | null> {
  if (!menuPhotoUrl) return null;

  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    return analyzeMenuWithGemini(menuPhotoUrl, geminiKey);
  }

  // Vision key yoxdursa null qaytar
  return null;
}

async function analyzeMenuWithGemini(url: string, apiKey: string): Promise<MenuAnalysis | null> {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-04-17';

  try {
    const imgRes = await fetch(url);
    const buffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType, data: base64 } },
              { text: `Bu bir restoran menyusunun fotosudur. Analiz et:
1. Yeməklərin siyahısı (ad + qiymət AZN)
2. Ortalama qiymət
3. Qiymət aralığı (min-max)
4. Kateqoriya miksi: "Əsas yemək ağırlıqlı" / "Balans" / "İçki ağırlıqlı"
5. Qiymət strategiyası: "Rəqabətli" / "Premium" / "Aşağı"
6. Müşahidələr (2-3 maddə)

JSON cavab:
{"items":[{"name":"Ad","price":12.5}],"avgPrice":15,"priceRange":{"min":5,"max":35},"categoryMix":"Balans","pricingStrategy":"Rəqabətli","observations":["..."]}` },
            ],
          }],
        }),
      },
    );

    if (res.ok) {
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return parseMenuAnalysis(text);
    }
  } catch {
    // fallback
  }

  return null;
}

function parseMenuAnalysis(text: string): MenuAnalysis | null {
  try {
    let json = text;
    const fence = json.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) json = fence[1];
    const parsed = JSON.parse(json) as MenuAnalysis;
    return {
      items: parsed.items ?? [],
      avgPrice: parsed.avgPrice ?? 0,
      priceRange: parsed.priceRange ?? { min: 0, max: 0 },
      categoryMix: parsed.categoryMix ?? 'Bilinmir',
      pricingStrategy: parsed.pricingStrategy ?? 'Bilinmir',
      observations: parsed.observations ?? [],
    };
  } catch {
    return null;
  }
}
