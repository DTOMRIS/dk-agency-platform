/**
 * @file full-audit.ts
 * @purpose Tam restoran auditi — foto + menyu + sosial → AI SWOT + tövsiyə
 */

import { analyzePhotos, type PhotoAnalysis } from './photo-analyzer';
import { analyzeMenu, type MenuAnalysis } from './menu-analyzer';
import { fetchInstagramPublic, fetchFacebookPublic, type SocialInfo } from './social-scraper';

export interface AuditInput {
  name: string;
  address?: string;
  category: string;
  photos: string[];
  socialLinks?: { instagram?: string; facebook?: string };
  deliveryLinks?: { wolt?: string; bolt?: string };
  menuPhotoUrl?: string | null;
}

export interface AuditResult {
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{
    priority: string; // yüksək, orta, aşağı
    area: string;
    action: string;
    dkAgencyHelp: string;
  }>;
  estimatedRevenue: { min: number; max: number; currency: string };
  redFlags: string[];
  whatsappTemplate: string;
  summary: string;
  photoAnalysis: PhotoAnalysis;
  menuAnalysis: MenuAnalysis | null;
  socialInfo: SocialInfo[];
}

export async function generateFullAudit(input: AuditInput): Promise<AuditResult> {
  // 1) Parallel: foto, menyu, sosial analiz
  const [photoAnalysis, menuAnalysis, ...socialResults] = await Promise.all([
    analyzePhotos(input.photos, input.category),
    analyzeMenu(input.menuPhotoUrl ?? null),
    input.socialLinks?.instagram
      ? fetchInstagramPublic(input.socialLinks.instagram)
      : Promise.resolve(null),
    input.socialLinks?.facebook
      ? fetchFacebookPublic(input.socialLinks.facebook)
      : Promise.resolve(null),
  ]);

  const socialInfo = socialResults.filter((s): s is SocialInfo => s !== null);

  // 2) Bütün data-nı AI-ya ver, full SWOT + tövsiyə hazırla
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  const context = buildContext(input, photoAnalysis, menuAnalysis, socialInfo);

  let aiResult: Omit<AuditResult, 'photoAnalysis' | 'menuAnalysis' | 'socialInfo'>;

  if (deepseekKey) {
    aiResult = await generateWithDeepSeek(context, input, deepseekKey);
  } else {
    aiResult = generateFallback(input, photoAnalysis, menuAnalysis, socialInfo);
  }

  return {
    ...aiResult,
    photoAnalysis,
    menuAnalysis,
    socialInfo,
  };
}

function buildContext(
  input: AuditInput,
  photo: PhotoAnalysis,
  menu: MenuAnalysis | null,
  social: SocialInfo[],
): string {
  let ctx = `RESTORAN: ${input.name}\n`;
  ctx += `Ünvan: ${input.address ?? 'Göstərilməyib'}\n`;
  ctx += `Kateqoriya: ${input.category}\n`;
  ctx += `Foto sayı: ${input.photos.length}\n\n`;

  ctx += `FOTO ANALİZİ:\n`;
  ctx += `- Təmizlik: ${photo.cleanliness}/10\n`;
  ctx += `- Atmosfer: ${photo.ambiance}/10\n`;
  ctx += `- Qiymət səviyyəsi: ${photo.priceLevel}\n`;
  ctx += `- Tutum: ~${photo.estimatedCapacity} oturacaq\n`;
  ctx += `- Müşahidələr: ${photo.observations.join('; ')}\n\n`;

  if (menu) {
    ctx += `MENYU ANALİZİ:\n`;
    ctx += `- Orta qiymət: ${menu.avgPrice} AZN\n`;
    ctx += `- Qiymət aralığı: ${menu.priceRange.min}-${menu.priceRange.max} AZN\n`;
    ctx += `- Kateqoriya miksi: ${menu.categoryMix}\n`;
    ctx += `- Strategiya: ${menu.pricingStrategy}\n`;
    if (menu.items.length > 0) {
      ctx += `- Nümunə yeməklər: ${menu.items.slice(0, 5).map((i) => `${i.name} (${i.price}₼)`).join(', ')}\n`;
    }
    ctx += `- Müşahidələr: ${menu.observations.join('; ')}\n\n`;
  }

  if (social.length > 0) {
    ctx += `SOSİAL MEDIA:\n`;
    for (const s of social) {
      ctx += `- ${s.platform}: ${s.available ? 'Aktiv' : 'Əlçatmaz'}`;
      if (s.followers) ctx += `, ${s.followers} izləyici`;
      ctx += '\n';
    }
    ctx += '\n';
  }

  const hasWolt = !!input.deliveryLinks?.wolt;
  const hasBolt = !!input.deliveryLinks?.bolt;
  if (hasWolt || hasBolt) {
    ctx += `DELIVERY: ${[hasWolt && 'Wolt', hasBolt && 'Bolt'].filter(Boolean).join(', ')}\n\n`;
  }

  return ctx;
}

async function generateWithDeepSeek(
  context: string,
  input: AuditInput,
  apiKey: string,
): Promise<Omit<AuditResult, 'photoAnalysis' | 'menuAnalysis' | 'socialInfo'>> {
  const prompt = `Sən peşəkar restoran konsultantısan. Aşağıdakı məlumatlar əsasında tam audit hesabatı hazırla.

${context}

JSON formatında cavab ver — başqa heç nə yazma:
{
  "strengths": ["Güclü tərəflər — 3-5 maddə"],
  "weaknesses": ["Zəif tərəflər — 3-5 maddə"],
  "recommendations": [
    {"priority": "yüksək|orta|aşağı", "area": "Sahə adı", "action": "Konkret addım", "dkAgencyHelp": "DK Agency bu sahədə necə kömək edə bilər"}
  ],
  "estimatedRevenue": {"min": 5000, "max": 15000, "currency": "AZN"},
  "redFlags": ["Kritik problemlər — varsa"],
  "whatsappTemplate": "Restoran sahibinə hörmətli WhatsApp mesajı — güclü tərəfləri qeyd et, 2-3 tövsiyə ver, 15 dəqiqəlik görüş təklif et. DK Agency adından. Max 200 söz.",
  "summary": "3 cümləlik xülasə"
}

QAYDALAR:
- Azərbaycan dilində yaz
- Konkret, ölçülə bilən tövsiyələr ver
- estimatedRevenue aylıq gəlir təxminidir (AZN)
- whatsappTemplate mesajında restoran adını istifadə et: "${input.name}"
- recommendations-da DK Agency-nin xidmətlərini təbii şəkildə tövsiyə et
- redFlags yalnız ciddi problemlər üçün (olmaya da bilər)`;

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.3,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: 'Sən Azərbaycanda restoran audit ekspertisən. Yalnız JSON cavab ver.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const raw = data.choices?.[0]?.message?.content?.trim() ?? '';
      return parseAuditResult(raw, input);
    }
  } catch {
    // fallback
  }

  return generateFallback(input, null, null, []);
}

function parseAuditResult(
  text: string,
  input: AuditInput,
): Omit<AuditResult, 'photoAnalysis' | 'menuAnalysis' | 'socialInfo'> {
  try {
    let json = text;
    const fence = json.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) json = fence[1];
    const parsed = JSON.parse(json) as {
      strengths?: string[];
      weaknesses?: string[];
      recommendations?: Array<{ priority: string; area: string; action: string; dkAgencyHelp: string }>;
      estimatedRevenue?: { min: number; max: number; currency: string };
      redFlags?: string[];
      whatsappTemplate?: string;
      summary?: string;
    };

    return {
      strengths: parsed.strengths ?? [],
      weaknesses: parsed.weaknesses ?? [],
      recommendations: parsed.recommendations ?? [],
      estimatedRevenue: parsed.estimatedRevenue ?? { min: 5000, max: 15000, currency: 'AZN' },
      redFlags: parsed.redFlags ?? [],
      whatsappTemplate: parsed.whatsappTemplate ?? generateDefaultWhatsApp(input.name),
      summary: parsed.summary ?? '',
    };
  } catch {
    return generateFallback(input, null, null, []);
  }
}

function generateFallback(
  input: AuditInput,
  _photo: PhotoAnalysis | null,
  _menu: MenuAnalysis | null,
  _social: SocialInfo[],
): Omit<AuditResult, 'photoAnalysis' | 'menuAnalysis' | 'socialInfo'> {
  return {
    strengths: [
      `${input.category} kateqoriyasında fəaliyyət göstərir`,
      `${input.photos.length} foto yüklənib — vizual identifikasiya mövcuddur`,
    ],
    weaknesses: [
      'AI analizi üçün DEEPSEEK_API_KEY lazımdır',
      'Dəqiq analiz əl ilə aparılmalıdır',
    ],
    recommendations: [
      {
        priority: 'yüksək',
        area: 'Rəqəmsal mövcudluq',
        action: 'Sosial media strategiyası hazırlayın',
        dkAgencyHelp: 'DK Agency sosial media idarəetmə xidməti təklif edir',
      },
    ],
    estimatedRevenue: { min: 5000, max: 15000, currency: 'AZN' },
    redFlags: [],
    whatsappTemplate: generateDefaultWhatsApp(input.name),
    summary: `${input.name} — ${input.category} kateqoriyasında. Tam analiz üçün AI key tələb olunur.`,
  };
}

function generateDefaultWhatsApp(name: string): string {
  return `Salam ${name} komandası 👋

DK Agency olaraq sizin restoranı bu gün araşdırdıq. Çox gözəl detallar gördük, eyni zamanda bir neçə fürsət sahəsi də diqqətimizi çəkdi.

15 dəqiqəlik bir görüşdə bunları detallı paylaşmaq istərdik. Bu həftə uyğun vaxtınız olarmı?

Hörmətlə,
DK Agency`;
}
