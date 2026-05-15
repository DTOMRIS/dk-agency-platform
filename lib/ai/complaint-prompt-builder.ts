/**
 * @file complaint-prompt-builder.ts
 * @purpose Sikayet Cavablandirici AI system prompt + few-shot examples
 * @critical Ahilik deyerleri: uzr + konkret cozum + hormetli dil
 * @lastModified 2026-05-15 (TASK-0128)
 */

const LANG_MAP: Record<string, string> = {
  az: 'Azərbaycan dili',
  en: 'English',
  tr: 'Türkçe',
  ru: 'Русский',
};

export interface ComplaintPromptInput {
  complaintText: string;
  complaintType: string;
  complaintLang: string;
  responseLang: string;
  restaurantName?: string;
}

export function buildComplaintSystemPrompt(input: ComplaintPromptInput): string {
  const responseLangName = LANG_MAP[input.responseLang] || input.responseLang;
  const restaurantCtx = input.restaurantName
    ? `Restoran adi: "${input.restaurantName}". Cavablarda bu adi istifade et.`
    : 'Restoran adi verilmeyib. "Restoranımız" ifadesini istifade et.';

  return `Sen Azerbaijan restoran sahibine komek eden AI komekcisen.
Veziven: Musteri sikayetine 3 ferqli tonda cavab yazmaq.

${restaurantCtx}

Ahilik deyerleri:
- Uzr isteme bacarigi (ozunu haqli cixarmaq YOX)
- Konkret cozum teklifi (kupon, yeniden gelme deveti, pulun geri qaytarilmasi)
- Semimi ve hormetli dil
- Musterinin hisslerini etraf et, suclama yox

Sikayetin novu: ${input.complaintType}

Cavablari **${responseLangName}** dilinde yaz.

3 ton:
1. RESMI — "Hormetli musteri..." baslanqici, formal dil, tam cumleler
2. SEMIMI — "Salam!" baslanqici, isti dil, emoji YOX, dostane ton
3. QISA — 2-3 cumle, birbasa uzr + cozum, basqa hec ne

Her cavab MUTLEQ bunlari ehtiva etmelidir:
- Uzr
- Konkret hell addimi (kupon, yeniden hazirlama, geri qaytarma ve s.)
- Yeniden gelme deveti

Output STRICT JSON (basqa hec bir metn olmasin):
{ "formal": "...", "friendly": "...", "short": "..." }`;
}

export function buildComplaintUserPrompt(input: ComplaintPromptInput): string {
  const fewShot = `Numune 1 (yemek sikayeti):
Musteri: "Sifarisimiz 40 deqiqe gec geldi ve yemek soyuq idi."
Cavab:
{"formal":"Hormetli musterimiz, sifarisinizdeki gecikmeden ve yemeyin keyfiyyetinin asagi dusmesinden dolayi seimimi uzr isteyirik. Bu veziyyetin sebepleri arasdirilib ve mutfaq komandamiza elave talimat verilib. Sizi yeniden qebul etmek ve bu tecrubeni duzeltmek ucun 20% endirim kuponu gonderirik. Hormetle, restoran rehberliyi.","friendly":"Salam! Gec sifaris ve soyuq yemek ucun cox uzr isteyirik — biliriq ki, bele sey olmamaliydi. Bunu duzeltmek ucun novbeti gelisinizde 20% endirim hazirlamisiq. Sizi yeniden goreceyimize sevinirik!","short":"Uzr isteyirik — gecikmeli ve soyuq sifaris qebul edilemezdir. 20% endirim kuponu gonderdik, sizi yeniden gozleyirik."}

Numune 2 (xidmet sikayeti):
Musteri: "Garson cox laqeyd idi ve sifaris almaq ucun 20 deqiqe gozledik."
Cavab:
{"formal":"Hormetli musterimiz, xidmetimizdeki bu gecikme ve diqqetsizlikden dolayi uzr isteyirik. Personal ile bu mesele muvafiq sekilde hell edilib. Sizi yeniden qebul etmek ucun bir fincan qehve ikramimiz var. Tesekkkur edirik ki, bildirdiniz.","friendly":"Salam! Gozleme ve laqeyd xidmet ucun cox uzr isteyirik. Bunu ciddi qebul etdik ve komanda ile danisdiq. Novbeti ziyaretinizde bir qehve bizden — sizi goreceyimize sevinirik!","short":"Uzr isteyirik — 20 deqiqe gozleme ve laqeyd xidmet qebul edilemezdir. Personal ile danisild, novbeti gelisinizde bir qehve bizdend."}

Indi bu sikayete cavab yaz:
Musteri: "${input.complaintText}"`;

  return fewShot;
}
