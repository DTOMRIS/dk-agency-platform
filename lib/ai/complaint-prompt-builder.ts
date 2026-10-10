/**
 * @file complaint-prompt-builder.ts
 * @purpose Şikayət Cavablandırıcı AI system prompt + few-shot examples
 * @critical Üzr + konkret həll + hörmətli dil. TASK-0523 (owner 2026-10-09): kompensasiya
 *           (endirim, ikram, geri ödəmə) YALNIZ sahib seçəndə yazılır; varsayılan = üzr + həll.
 *           Əvvəl hər cavabda kupon/geri ödəmə məcburi idi və nümunələr «20% endirim» vəd edirdi.
 * @lastModified 2026-10-10 (TASK-0523)
 */

const LANG_MAP: Record<string, string> = {
  az: 'Azərbaycan dili (düzgün hərflərlə: ə, ı, ö, ü, ç, ş, ğ)',
  en: 'English',
  tr: 'Türkçe',
  ru: 'Русский',
};

export const COMPENSATION_OPTIONS = ['none', 'discount', 'treat', 'redo', 'refund'] as const;
export type CompensationOption = (typeof COMPENSATION_OPTIONS)[number];

export interface ComplaintPromptInput {
  complaintText: string;
  complaintType: string;
  complaintLang: string;
  responseLang: string;
  restaurantName?: string;
  /** What the owner is willing to offer; 'none' (default) = apology + fix, no promise. */
  compensation?: CompensationOption;
  /** Owner's own words for the offer, e.g. «növbəti sifarişə 10% endirim». */
  compensationDetail?: string;
}

const COMPENSATION_TEXT: Record<Exclude<CompensationOption, 'none'>, string> = {
  discount: 'növbəti gəlişə endirim',
  treat: 'növbəti gəlişdə ikram (məsələn, desert və ya içki)',
  redo: 'yeməyi yenidən hazırlamaq / sifarişi yeniləmək',
  refund: 'ödənişin geri qaytarılması',
};

export function buildComplaintSystemPrompt(input: ComplaintPromptInput): string {
  const responseLangName = LANG_MAP[input.responseLang] || input.responseLang;
  const restaurantCtx = input.restaurantName
    ? `Restoranın adı: "${input.restaurantName}". Cavablarda bu adı işlət.`
    : 'Restoranın adı verilməyib. «Restoranımız» ifadəsini işlət.';

  const compensation = input.compensation ?? 'none';
  const compensationRule = compensation === 'none'
    ? `- Heç bir kompensasiya VƏD ETMƏ: endirim, kupon, pulsuz yemək, ikram, geri ödəmə yazma. Sahib bunu seçməyib.
- Həll = nə yoxlanılacaq / nə dəyişdiriləcək + qonağı birbaşa əlaqəyə dəvət (telefon və ya mesaj).`
    : `- Sahib bu kompensasiyanı təklif etməyə razıdır: ${COMPENSATION_TEXT[compensation]}${input.compensationDetail ? ` — sahibin sözləri: «${input.compensationDetail}»` : ''}.
- Yalnız bunu təklif et; faiz, məbləğ və ya başqa hədiyyə uydurma (sahib yazmayıbsa rəqəm vermə).`;

  return `Sən Azərbaycanda restoran sahibinə qonaq şikayətlərinə cavab yazmaqda kömək edirsən.
Vəzifə: şikayətə 3 fərqli tonda cavab yazmaq.

${restaurantCtx}

Qaydalar:
- Səmimi üzr istə; özünü haqlı çıxarma, qonağı günahlandırma.
- Qonağın hisslərini qəbul et.
- Konkret həll addımı yaz.
${compensationRule}
- Restoranda olmayan şeyi (yeni menecer, kamera, təlim keçirildi və s.) faktiki baş vermiş kimi yazma; «yoxlayırıq», «komandamızla danışacağıq» kimi yaz.

Şikayətin növü: ${input.complaintType}

Cavabları **${responseLangName}** dilində yaz.

3 ton:
1. formal — «Hörmətli qonağımız…» ilə başlayır, rəsmi dil, tam cümlələr
2. friendly — «Salam!» ilə başlayır, isti və dostcasına, emoji YOX
3. short — 2-3 cümlə: üzr + həll, başqa heç nə

Cavabı YALNIZ JSON kimi qaytar (başqa mətn olmasın):
{ "formal": "...", "friendly": "...", "short": "..." }`;
}

export function buildComplaintUserPrompt(input: ComplaintPromptInput): string {
  const fewShot = `Nümunə 1 (yemək şikayəti, kompensasiya seçilməyib):
Qonaq: "Sifarişimiz 40 dəqiqə gec gəldi və yemək soyuq idi."
Cavab:
{"formal":"Hörmətli qonağımız, sifarişinizin gecikməsinə və yeməyin soyuq çatmasına görə səmimi üzr istəyirik. Gecikmənin səbəbini mətbəx və çatdırılma komandamızla birlikdə yoxlayırıq. Sizinlə birbaşa danışıb nə baş verdiyini öyrənmək istərdik — zəhmət olmasa, bizə yazın və ya zəng edin. Hörmətlə, restoran rəhbərliyi.","friendly":"Salam! Gec gələn və soyumuş sifarişə görə çox üzr istəyirik — belə olmamalı idi. Səbəbini komandamızla yoxlayırıq. Bizə yazsanız, hər şeyi birlikdə aydınlaşdıraq.","short":"Gecikmə və soyuq yemək üçün üzr istəyirik. Səbəbini yoxlayırıq — zəhmət olmasa, bizə yazın."}

Nümunə 2 (xidmət şikayəti, sahib «növbəti gəlişdə qəhvə bizdən» seçib):
Qonaq: "Ofisiant çox laqeyd idi, sifariş vermək üçün 20 dəqiqə gözlədik."
Cavab:
{"formal":"Hörmətli qonağımız, gözləmə və diqqətsiz xidmətə görə üzr istəyirik. Bu məsələni xidmət komandamızla müzakirə edəcəyik. Növbəti gəlişinizdə qəhvəniz bizdən olacaq. Bildirdiyiniz üçün təşəkkür edirik.","friendly":"Salam! Gözləməyə və laqeyd xidmətə görə çox üzr istəyirik. Komandamızla danışacağıq. Növbəti dəfə qəhvə bizdən — sizi yenidən görməyə şad olarıq!","short":"20 dəqiqəlik gözləmə üçün üzr istəyirik. Komandamızla danışacağıq; növbəti gəlişinizdə qəhvə bizdən."}

İndi bu şikayətə cavab yaz:
Qonaq: "${input.complaintText}"`;

  return fewShot;
}
