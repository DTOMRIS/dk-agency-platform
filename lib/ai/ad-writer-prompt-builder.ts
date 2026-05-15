/**
 * @file ad-writer-prompt-builder.ts
 * @purpose Reklam Yazicisi AI system prompt + few-shot examples
 * @critical Ahilik deyerleri: yalanci ved yox, real fayda, hormet
 * @lastModified 2026-05-15 (TASK-0130)
 */

const LANG_MAP: Record<string, string> = {
  az: 'Azərbaycan dili',
  en: 'English',
  tr: 'Türkçe',
  ru: 'Русский',
};

const PLATFORM_LIMITS: Record<string, number> = {
  instagram: 125,
  facebook: 200,
  tiktok: 150,
  google_ads: 90,
};

export interface AdWriterPromptInput {
  platform: string;
  campaignDescription: string;
  targetAudience: string;
  callStyle: string;
  language: string;
  restaurantName?: string;
}

export function buildAdWriterSystemPrompt(input: AdWriterPromptInput): string {
  const langName = LANG_MAP[input.language] || input.language;
  const charLimit = PLATFORM_LIMITS[input.platform] || 150;
  const restaurantCtx = input.restaurantName
    ? `Restoran adi: "${input.restaurantName}". Reklam metninde bu adi istifade et.`
    : 'Restoran adi verilmeyib. Umumi restoran kimi yaz.';

  return `Sen Azerbaijan restoran sahibi ucun reklam metni yazan AI komekcisen.
Platform: ${input.platform}
Hedəf auditoriya: ${input.targetAudience}
Kampaniya stili: ${input.callStyle}

${restaurantCtx}

Ahilik deyerleri:
- Yalanci ved yox — real fayda yaz
- Hormeti qoru — spam ton qadagandir
- Muşteriye deyər ver, satış yox

Reklam metnlerini **${langName}** dilinde yaz.
Body max **${charLimit}** simvol (${input.platform} limiti).
Headline max **60** simvol.

3 variant yaz:
1. DIQQET CEKEN — viral stil, emosional, 1-2 emoji icaze
2. INFORMATIV — fakt esasli, sakit ton, emoji yox
3. SATIS-YONLU — CTA guclu, urgency hissi, endirim/limit vurğu

Her variant ucun 5-7 hashtag yaz (# ile).

Output STRICT JSON (basqa hec bir metn olmasin):
{
  "variants": [
    { "tone": "attention", "headline": "...", "body": "...", "hashtags": ["#...", "#..."] },
    { "tone": "informative", "headline": "...", "body": "...", "hashtags": ["#...", "#..."] },
    { "tone": "sales", "headline": "...", "body": "...", "hashtags": ["#...", "#..."] }
  ]
}`;
}

export function buildAdWriterUserPrompt(input: AdWriterPromptInput): string {
  return `Numune 1 (yeni menyu, instagram):
Kampaniya: "Yeni dolma menyusu, 30 May acilisi"
{"variants":[{"tone":"attention","headline":"Dolma sevənlərə müjdə! 🎉","body":"30 Maydan etibarən 7 növ dolma bir menyuda. İlk 50 qonağa pulsuz desert! Masanı indi saxla.","hashtags":["#dolma","#yenimenu","#bakurestoranlar","#azerbaycanmutfaqi","#foodbaku"]},{"tone":"informative","headline":"7 növ dolma — bir menyuda","body":"Yarpaq, kələm, biber, badımcan, pomidor, soğan və kartof dolması. Hər biri ev resepti ilə, günlük təzə. 30 Maydan.","hashtags":["#dolma","#azərbaycanmətbəxi","#yenimenu","#restoranacilis","#bakuyemek"]},{"tone":"sales","headline":"Dolma festivali başlayır — yer məhduddur","body":"30 May, saat 12:00. İlk 50 qonağa pulsuz desert + 15% endirim. Rezervasiya: bio-dakı linkdən.","hashtags":["#endirim","#dolmafestivali","#bakuendirim","#restoranaksiya","#yenimenu"]}]}

Numune 2 (endirim, facebook):
Kampaniya: "Cümə axşamı 20% endirim bütün menyuya"
{"variants":[{"tone":"attention","headline":"Bu cümə axşamı menyunun hamısı -20%! 🔥","body":"Sevdiyiniz yeməklər, sevdiyiniz qiymətdən 20% aşağı. Yalnız cümə axşamı, yalnız restoranda. Dostlarınızı da çağırın — süfrə böyük olsun!","hashtags":["#endirim","#cumeaksami","#bakurestoran","#yemekaksiyasi","#horeca"]},{"tone":"informative","headline":"Cümə axşamı: bütün menyuya 20% endirim","body":"Bu həftə cümə axşamı bütün menyu 20% endirimlə. Endirim yalnız restoranda, take-away daxil deyil. Saat 12:00-23:00.","hashtags":["#endirim","#menyu","#bakurestoran","#azerbaycan","#yemek"]},{"tone":"sales","headline":"20% endirim — yalnız bu cümə axşamı","body":"Tək bir gün, tək bir fürsət. Cümə axşamı bütün menyu 20% endirimli. Masa məhduddur — indi zəng edin. Tel: bio-da.","hashtags":["#songun","#endirim","#mehdud","#bakuaksiya","#restoranlar"]}]}

Indi bu kampaniya ucun reklam yaz:
Kampaniya: "${input.campaignDescription}"`;
}
