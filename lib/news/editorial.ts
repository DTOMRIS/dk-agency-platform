/**
 * @file editorial.ts
 * @purpose Sektor Nəbzi xəbərinin iki mərhələli hazırlanması: müəllif (jurnalist üslubu, sabit
 * şablon yox) → redaktor (hər faktı siqnalla yoxlayır, dili düzəldir, xəbər dəyəri yoxdursa
 * rədd edir). DB-yə toxunmur — synthesize.ts və dry-run skriptləri eyni funksiyanı çağırır.
 * TASK-0492
 */

import { AI_MODELS } from '@/lib/ai-models';

export interface NewsSignal {
  title: string;
  summary: string | null;
  externalUrl: string | null;
  /** Mənbədə dərc tarixi — təravət yoxlaması bununla aparılır. */
  publishedAt?: Date | null;
}

export type EditorialOutcome =
  | {
      kind: 'publishable';
      titleAz: string;
      summaryAz: string;
      bodyAz: string;
      /** Redaktorun sahibə qısa qeydi (Telegram-da göstərilir). */
      editorNote: string;
      editorVerdict: 'ok' | 'fixed';
    }
  | { kind: 'unpublishable'; reason: string }
  | { kind: 'error'; error: string };

/** Köhnə sabit şablonun başlıqları — artıq mətndə görünməməlidir. */
const TEMPLATE_HEADINGS = [
  'nə baş verdi',
  'niyə önəmlidir',
  'azərbaycan horeca üçün dərs',
  'risk',
  'bu həftə 1 addım',
  'dk baxışı',
];

const CLICHES = [
  'qeyd etmək lazımdır ki',
  'qeyd edək ki',
  'danılmaz faktdır',
  'oyun dəyişdirici',
  'inqilabi',
  'son nəticədə',
  'bu baxımdan',
];

const FORBIDDEN_TERMS = ['CRM', 'Pipeline', 'Agentlik', 'Holdinq', 'Tezliklə'];

const WRITER_PROMPT = `Sən DK Agency-nin "Sektor Nəbzi" bölməsinin müəllifisən. Oxucu — Azərbaycanda restoran, kafe, otel, qonaq evi sahibi və meneceridir. Sənə bir xəbər SİQNALI verilir (başlıq, qısa xülasə, mənbə linki).

Məqsəd: oxunan, təbii Azərbaycan dilində yazılmış, qısa və dəqiq XƏBƏR yazmaq. Analitik hesabat yox, sabit şablon yox.

NECƏ YAZ:
- İlk abzas (lid): kim, nə etdi/nə baş verdi, harada — 1-2 cümlə, konkret. Oxucu yalnız bunu oxusa da xəbəri anlamalıdır.
- Sonra 2-4 qısa abzas: siqnaldakı detallar, kontekst və bunun sektor üçün mənası.
- Yalnız həqiqətən konkret dərs varsa, sonda təbii bir abzasla Azərbaycan bazarına körpü qur (məs. "Bakıdakı şəbəkələr üçün bu ... deməkdir"). Hər xəbərdə məcburi deyil — ümumi nəsihət yazma.
- Uzunluq siqnaldakı fakt qədər: zəif siqnal → 90-150 söz; zəngin siqnal → 200-320 söz. Doldurma (padding) etmə.
- Alt başlıq (###) yalnız mətn 250 sözdən uzundursa, ən çox 2 dənə, məzmuna xas ifadə ilə. QADAĞAN başlıqlar: "Nə baş verdi", "Niyə önəmlidir", "Risk", "DK baxışı", "Bu həftə 1 addım", "Azərbaycan HoReCa üçün dərs".
- Başlıq: məlumatverici, ən çox 90 simvol, klikbeyt yox, böyük hərflə yazılmış sözlər yox. Sual başlığı yalnız mənbə özü sual qoyursa.

DƏQİQLİK (ən vacib):
- YALNIZ siqnaldakı faktları işlət. Rəqəm, ad, tarix, şəhər, sitat uydurma. Siqnalda yoxdursa yazma.
- Şirkətin öz iddiası/press-reliz rəqəmi: "şirkətin açıqlamasına görə" kimi mənbəyə bağla.
- Mənbəni cümlə-cümlə tərcümə və ya yaxın parafraz etmə — faktları öz sözünlə nəql et.

DİL:
- Təbii ədəbi Azərbaycan dili. Türkcə/ingiliscə kalka etmə (məs. "gerçəkləşdirdi" yox → "həyata keçirdi"; "lansman" yox → "təqdimat").
- Terminlər: "otel", "mehmanxana", "otelçilik" (QADAĞAN: "hotel", "hotelçilik"); "qonaq", "ofisiant", "ictimai iaşə", "françayz".
- Bu ifadələri işlətmə: "qeyd etmək lazımdır ki", "danılmaz faktdır", "oyun dəyişdirici", "inqilabi", "son nəticədə", "bu baxımdan".
- **Bold** yalnız şirkət/brend adı ilk dəfə çəkiləndə.
- Bu sözlər QADAĞANDIR: CRM, Pipeline, Agentlik, Holdinq, Tezliklə. Reklam dili yox.

UYĞUNLUQ:
- publishable:true — restoran, kafe, otel, qonaq evi, catering, ictimai iaşə, françayz, turizm biznesi və ya onların texnologiyası haqqında real xəbər (dünya xəbəri də olar, əgər AZ HoReCa oxucusu üçün maraqlıdırsa).
- publishable:false — köhnə hadisədir ("Bu gün"dən 2 aydan çox əvvəl), və ya mövzu bu biznes deyil (idman, siyasət, hərbi, kriminal, şou-biznes, ümumi makroiqtisadiyyat) və ya siqnalda yazmaq üçün fakt yoxdur. "reason"-da qısa səbəb.

ÇIXIŞ — yalnız JSON:
{"title_az":"...","summary_az":"1-2 cümləlik lid, ≤220 simvol","body_az":"abzaslar (\\n\\n ilə)","publishable":true,"reason":""}`;

const EDITOR_PROMPT = `Sən DK Agency "Sektor Nəbzi"nin baş redaktorusan. Sənə SİQNAL (mənbə faktları) və müəllifin QARALAMASI verilir. Qaralama sahibə təsdiq üçün gedəcək — sənin işin onu dərc səviyyəsinə gətirmək və ya rədd etməkdir.

YOXLA:
1. Dəqiqlik: qaralamadakı HƏR rəqəm, ad, tarix, yer, sitat siqnalda varmı? Siqnalda olmayanı sil və ya ümumiləşdir. Şirkət iddiası mənbəyə bağlanıbmı?
2. Oxunaqlıq: lid kim/nə/harada sualına cavab verirmi? Abzaslar qısa və axıcıdırmı? Təkrar, su, ümumi nəsihət varsa kəs.
3. Şablon: "Nə baş verdi / Niyə önəmlidir / Risk / DK baxışı / Bu həftə 1 addım" kimi sabit başlıqlar və ya hər xəbərə yapışdırılan eyni sonluq varsa çıxar.
4. Dil: təbii Azərbaycan dili; kalka, qrammatik xəta, klişe ("qeyd etmək lazımdır ki", "son nəticədə", "bu baxımdan") düzəlt.
5. Başlıq: dəqiq, ≤90 simvol, klikbeyt deyil, mətnlə uyğun.
6. Təravət: əsas meyar "Mənbədə dərc tarixi"dir. Xəbərin ƏSAS hadisəsi "Bu gün"dən 2 aydan çox əvvəl baş veribsə (köhnə tədbir, hesabat, açılış; başlıqda keçmiş il) → reject, reject_reason: "köhnə xəbər". Təzə dərc olunmuş yazıda keçmişə istinad (arxa plan) köhnəlik DEYİL.
7. Terminlər: "hotel/hotelçilik" → "otel/otelçilik".
8. Xəbər dəyəri: Azərbaycan HoReCa oxucusu üçün bunu dərc etməyə dəyərmi? Mövzu kənardırsa və ya fakt çox zəifdirsə → reject.

QAYDA: yeni fakt əlavə etmə. Mətni yaxşılaşdırarkən uzatma — qısaltmaq olar.

ÇIXIŞ — yalnız JSON:
{"verdict":"ok|fixed|reject","title_az":"...","summary_az":"...","body_az":"...","notes":"sahibə 1 cümlə: nəyi düzəltdin / nəyə diqqət etsin (≤140 simvol)","reject_reason":""}
- "ok": dəyişiklik lazım deyil (mətni olduğu kimi qaytar).
- "fixed": düzəliş etdin (düzəldilmiş mətni qaytar).
- "reject": dərc olunmamalıdır (reject_reason doldur).`;

async function callDeepSeek(
  apiKey: string,
  system: string,
  user: string,
  maxTokens: number
): Promise<{ ok: true; json: Record<string, unknown> } | { ok: false; error: string }> {
  let res: Response;
  try {
    res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_MODELS.deepseek.chat,
        temperature: 0.4,
        max_tokens: maxTokens,
        // TASK-0488: v4-flash reasoning otherwise eats the budget and truncates the JSON.
        thinking: { type: 'disabled' },
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch (err) {
    return { ok: false, error: `[deepseek] ${err instanceof Error ? err.message : 'network'}` };
  }
  if (!res.ok) return { ok: false, error: `[deepseek] ${res.status}` };

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = data.choices?.[0]?.message?.content || '';
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return { ok: false, error: '[parse] no JSON object' };
  try {
    return { ok: true, json: JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown> };
  } catch {
    return { ok: false, error: '[parse] invalid JSON' };
  }
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Sabit şablon başlıqlarını silir, ##/# başlıqları ###-ə endirir, artıq boş sətirləri yığır. */
export function cleanBody(body: string): string {
  return body
    .split('\n')
    .filter((line) => {
      const m = line.match(/^#{1,6}\s*(.+?)\s*:?\s*$/);
      return !(m && TEMPLATE_HEADINGS.includes(m[1].toLocaleLowerCase('az').replace(/\*/g, '')));
    })
    .map((line) => line.replace(/^#{1,2}\s/, '### '))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Mexaniki keyfiyyət yoxlaması — redaktordan sonra qalan problemlər. */
export function lintArticle(title: string, body: string): string[] {
  const issues: string[] = [];
  const text = `${title}\n${body}`;
  const lower = text.toLocaleLowerCase('az');
  for (const term of FORBIDDEN_TERMS) {
    if (lower.includes(term.toLocaleLowerCase('az'))) issues.push(`qadağan söz: ${term}`);
  }
  for (const phrase of CLICHES) {
    if (lower.includes(phrase)) issues.push(`klişe: ${phrase}`);
  }
  if (title.length > 100) issues.push('başlıq çox uzundur');
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < 60) issues.push(`mətn çox qısadır (${words} söz)`);
  if (words > 420) issues.push(`mətn çox uzundur (${words} söz)`);
  return issues;
}

function plainSummary(summary: string, body: string, title: string): string {
  if (summary.length >= 30) return summary.slice(0, 300);
  const firstPara = body
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 30 && !l.startsWith('#'));
  return (firstPara || title).replace(/\*\*/g, '').slice(0, 300);
}

/**
 * Siqnal → yazılı xəbər. İki DeepSeek çağırışı (müəllif + redaktor), thinking söndürülüb.
 * Redaktor əlçatmaz olarsa müəllif mətni redaktor qeydi ilə qaytarılır — sahib Telegram-da görür.
 */
export async function draftNewsArticle(
  signal: NewsSignal,
  apiKey: string
): Promise<EditorialOutcome> {
  const signalText = [
    `Bu gün: ${new Date().toISOString().slice(0, 10)}`,
    `Mənbədə dərc tarixi: ${signal.publishedAt ? signal.publishedAt.toISOString().slice(0, 10) : 'məlum deyil'}`,
    `Başlıq: ${signal.title}`,
    `Xülasə: ${signal.summary?.trim() || 'Yoxdur'}`,
    `Mənbə URL: ${signal.externalUrl ?? 'Yoxdur'}`,
  ].join('\n');

  const writer = await callDeepSeek(apiKey, WRITER_PROMPT, signalText, 2500);
  if (!writer.ok) return { kind: 'error', error: writer.error };

  if (writer.json.publishable === false) {
    return { kind: 'unpublishable', reason: str(writer.json.reason) || 'Zəif siqnal' };
  }
  const draft = {
    title_az: str(writer.json.title_az),
    summary_az: str(writer.json.summary_az),
    body_az: cleanBody(str(writer.json.body_az)),
  };
  if (!draft.title_az || !draft.body_az) {
    return { kind: 'unpublishable', reason: 'Müəllif mətn qaytarmadı' };
  }

  const editor = await callDeepSeek(
    apiKey,
    EDITOR_PROMPT,
    `SİQNAL:\n${signalText}\n\nQARALAMA (JSON):\n${JSON.stringify(draft)}`,
    3000
  );

  let titleAz = draft.title_az;
  let summaryAz = draft.summary_az;
  let bodyAz = draft.body_az;
  let verdict: 'ok' | 'fixed' = 'ok';
  let note = '';

  if (editor.ok) {
    const v = str(editor.json.verdict);
    if (v === 'reject') {
      return {
        kind: 'unpublishable',
        reason: `Redaktor: ${str(editor.json.reject_reason) || 'xəbər dəyəri yoxdur'}`,
      };
    }
    const edTitle = str(editor.json.title_az);
    const edBody = cleanBody(str(editor.json.body_az));
    if (edTitle && edBody) {
      titleAz = edTitle;
      bodyAz = edBody;
      summaryAz = str(editor.json.summary_az) || summaryAz;
    }
    verdict = v === 'fixed' ? 'fixed' : 'ok';
    note = str(editor.json.notes);
  } else {
    note = `Redaktor yoxlaması alınmadı (${editor.error}) — mətni diqqətlə oxu.`;
  }

  const issues = lintArticle(titleAz, bodyAz);
  if (issues.some((i) => i.startsWith('qadağan söz'))) {
    return { kind: 'error', error: `[forbidden] ${issues.join('; ')}` };
  }
  if (issues.length) note = [note, `Yoxlama: ${issues.join('; ')}`].filter(Boolean).join(' · ');

  return {
    kind: 'publishable',
    titleAz,
    summaryAz: plainSummary(summaryAz, bodyAz, titleAz),
    bodyAz,
    editorNote: note.slice(0, 300),
    editorVerdict: verdict,
  };
}
