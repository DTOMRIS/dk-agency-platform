/**
 * @file ai-analyze.ts
 * @purpose Fire-and-forget AI analysis for new listings via DeepSeek.
 * Called after listing creation, stores result in aiAnalysis + aiCheckResult columns.
 */

import { eq } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { listings } from '@/lib/db/schema';
import { callAIJson } from '@/lib/ai-router';

interface AIListingAnalysis {
  qualityScore: number; // 0-100
  summary: string;
  strengths: string[];
  risks: string[];
  recommendation: 'approve' | 'review' | 'reject';
  missingFields: string[];
  spamLikelihood: 'low' | 'medium' | 'high';
}

export async function analyzeListingAsync(listingId: number) {
  if (!dbAvailable || !db) return;

  try {
    const [row] = await db
      .select({
        title: listings.title,
        description: listings.description,
        type: listings.type,
        city: listings.city,
        price: listings.price,
        typeSpecificData: listings.typeSpecificData,
        equipment: listings.equipment,
      })
      .from(listings)
      .where(eq(listings.id, listingId));

    if (!row) return;

    const prompt = `Aşağıdakı HORECA sektoru elanını analiz et və JSON formatında qiymətləndir.

Elan məlumatları:
- Başlıq: ${row.title}
- Tip: ${row.type}
- Şəhər: ${row.city}
- Qiymət: ${row.price ?? 'göstərilməyib'} AZN
- Təsvir: ${row.description}
- Əlavə məlumat: ${JSON.stringify(row.typeSpecificData ?? {})}
- Avadanlıq: ${JSON.stringify(row.equipment ?? [])}

Cavab formatı (JSON):
{
  "qualityScore": 0-100 arası keyfiyyət balı,
  "summary": "Qısa analiz xülasəsi (1-2 cümlə)",
  "strengths": ["güclü tərəf 1", "güclü tərəf 2"],
  "risks": ["risk 1", "risk 2"],
  "recommendation": "approve" | "review" | "reject",
  "missingFields": ["çatışmayan sahə adları"],
  "spamLikelihood": "low" | "medium" | "high"
}`;

    const { data, meta } = await callAIJson<AIListingAnalysis>(
      {
        prompt,
        system: 'Sən HORECA sektoru üzrə ekspert investisiya analitikisən. Elanları qiymətləndir.',
        maxTokens: 500,
        temperature: 0.3,
      },
      {
        toolSlug: 'listing-ai-check',
        userId: 0, // system-level
      },
    );

    // Store results
    await db
      .update(listings)
      .set({
        aiAnalysis: data as unknown as Record<string, unknown>,
        aiCheckResult: {
          score: data.qualityScore,
          recommendation: data.recommendation,
          spamLikelihood: data.spamLikelihood,
          provider: meta.provider,
          tokensUsed: meta.tokensUsed,
          analyzedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listingId));
  } catch (err) {
    // Fire-and-forget — log but don't throw
    console.error(`[AI-ANALYZE] Listing #${listingId} analysis failed:`, err);
  }
}
