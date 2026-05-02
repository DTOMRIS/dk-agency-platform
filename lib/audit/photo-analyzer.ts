/**
 * @file photo-analyzer.ts
 * @purpose Restoran fotolarını AI ilə analiz et
 *
 * Gemini Vision (əgər key varsa) → foto analizi
 * Fallback: DeepSeek text (foto URL + kontekst əsasında ümumi analiz)
 */

export interface PhotoAnalysis {
  observations: string[];
  cleanliness: number; // 1-10
  ambiance: number; // 1-10
  priceLevel: string; // ucuz, orta, premium, lüks
  estimatedCapacity: number;
}

export async function analyzePhotos(
  photoUrls: string[],
  category: string,
): Promise<PhotoAnalysis> {
  if (photoUrls.length === 0) {
    return {
      observations: ['Foto yüklənməyib — vizual analiz mümkün deyil'],
      cleanliness: 5,
      ambiance: 5,
      priceLevel: 'orta',
      estimatedCapacity: 30,
    };
  }

  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    return analyzeWithGemini(photoUrls, category, geminiKey);
  }

  // DeepSeek text fallback — foto URL-lərini təsvir əsasında analiz
  return analyzeWithDeepSeekFallback(photoUrls.length, category);
}

async function analyzeWithGemini(
  photoUrls: string[],
  category: string,
  apiKey: string,
): Promise<PhotoAnalysis> {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-04-17';

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  // Fotoları fetch edib base64-ə çevir
  for (const url of photoUrls.slice(0, 4)) {
    try {
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = res.headers.get('content-type') || 'image/jpeg';
      parts.push({ inlineData: { mimeType, data: base64 } });
    } catch {
      // Foto yüklənmədisə keç
    }
  }

  parts.push({
    text: `Bu ${category} tipli bir restoranın fotolarıdır. Analiz et:
1. Müşahidələr (5-8 maddə): təmizlik, dizayn, işıqlandırma, mebel keyfiyyəti, rəng sxemi, girişin cazibədarlığı
2. Təmizlik balı (1-10)
3. Atmosfer balı (1-10)
4. Qiymət səviyyəsi: ucuz/orta/premium/lüks
5. Təxmini oturacaq tutumu

Yalnız JSON cavab ver:
{"observations":["..."],"cleanliness":7,"ambiance":8,"priceLevel":"orta","estimatedCapacity":40}`,
  });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] }),
      },
    );

    if (res.ok) {
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return parsePhotoAnalysis(text);
    }
  } catch {
    // fallback
  }

  return analyzeWithDeepSeekFallback(photoUrls.length, category);
}

function analyzeWithDeepSeekFallback(photoCount: number, category: string): PhotoAnalysis {
  // Kateqoriyaya görə ağlabatan default-lar
  const defaults: Record<string, Partial<PhotoAnalysis>> = {
    'fine-dining': { cleanliness: 8, ambiance: 9, priceLevel: 'premium', estimatedCapacity: 50 },
    'restoran': { cleanliness: 7, ambiance: 7, priceLevel: 'orta', estimatedCapacity: 60 },
    'kafe': { cleanliness: 6, ambiance: 6, priceLevel: 'orta', estimatedCapacity: 30 },
    'fast-food': { cleanliness: 6, ambiance: 5, priceLevel: 'ucuz', estimatedCapacity: 40 },
  };

  const d = defaults[category] ?? defaults['restoran'];

  return {
    observations: [
      `${photoCount} foto yüklənib — vizual AI analizi üçün Gemini Vision key lazımdır`,
      `Kateqoriya: ${category} — standart parametrlər istifadə edildi`,
      'Dəqiq analiz üçün GEMINI_API_KEY əlavə edin',
    ],
    cleanliness: d.cleanliness ?? 6,
    ambiance: d.ambiance ?? 6,
    priceLevel: d.priceLevel ?? 'orta',
    estimatedCapacity: d.estimatedCapacity ?? 40,
  };
}

function parsePhotoAnalysis(text: string): PhotoAnalysis {
  try {
    let json = text;
    const fence = json.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) json = fence[1];
    const parsed = JSON.parse(json) as PhotoAnalysis;
    return {
      observations: parsed.observations ?? [],
      cleanliness: Math.min(10, Math.max(1, parsed.cleanliness ?? 5)),
      ambiance: Math.min(10, Math.max(1, parsed.ambiance ?? 5)),
      priceLevel: parsed.priceLevel ?? 'orta',
      estimatedCapacity: parsed.estimatedCapacity ?? 40,
    };
  } catch {
    return {
      observations: ['AI cavabı parse edilə bilmədi'],
      cleanliness: 5,
      ambiance: 5,
      priceLevel: 'orta',
      estimatedCapacity: 40,
    };
  }
}
