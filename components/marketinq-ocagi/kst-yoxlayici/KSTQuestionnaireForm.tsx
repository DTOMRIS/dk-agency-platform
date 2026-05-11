'use client';

import { useReducer, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { LikertScale } from '../shared/LikertScale';
import type { Locale } from '@/i18n/config';

// ── TYPES ───────────────────────────────────────────────────────────

type Category = 'quality' | 'service' | 'cleanliness';

interface FormState {
  quality: Record<string, number>;
  service: Record<string, number>;
  cleanliness: Record<string, number>;
  notes: string;
}

type FormAction =
  | { type: 'SET_SCORE'; category: Category; questionId: string; value: number }
  | { type: 'SET_NOTES'; value: string };

function reducer(state: FormState, action: FormAction): FormState {
  if (action.type === 'SET_SCORE') {
    return { ...state, [action.category]: { ...state[action.category], [action.questionId]: action.value } };
  }
  if (action.type === 'SET_NOTES') {
    return { ...state, notes: action.value };
  }
  return state;
}

const INITIAL: FormState = { quality: {}, service: {}, cleanliness: {}, notes: '' };

const PREFIXES: Record<Category, string> = { quality: 'K', service: 'S', cleanliness: 'T' };
const CATEGORIES: Category[] = ['quality', 'service', 'cleanliness'];

// ── LOCALE COPY ─────────────────────────────────────────────────────

type QuestionLabel = Record<string, string>;

const questionLabels: Record<Locale, QuestionLabel> = {
  az: {
    K1: 'Yeməklərin dadı və keyfiyyəti yüksəkdir', K2: 'Porsiyaların ölçüsü qiymətə uyğundur',
    K3: 'Təzə malzəmələr istifadə olunur', K4: 'Yeməyin görünüşü gözəldir',
    K5: 'Menyu çeşidi yetərlidir', K6: 'Yemək temperaturu düzgündür',
    K7: 'Spesial yeməklər (vegan/halal) var', K8: 'Hazırlanma vaxtı qəbul edilir',
    K9: 'Yemək konsistent gəlir (eyni dad)', K10: 'Yemək paketinin keyfiyyəti (delivery)',
    S1: 'Personalın dostlucu və xoş münasibəti', S2: 'Sifariş qəbul sürəti',
    S3: 'Personalın menyu bilgisi', S4: 'Hesab gətirilmə sürəti',
    S5: 'Şikayətlərə cavab verilməsi', S6: 'Personal vahid forma geyinmiş',
    S7: 'Stol gözləmə vaxtı qəbul edilir', S8: 'Telefon/online sifariş asanlığı',
    S9: 'Sifariş düzgün gəlir (səhv yox)', S10: 'Müştəri yenidən gəlir (sadiqlik)',
    T1: 'Yemək sahəsi təmizdir (stol, döşəmə)', T2: 'Tualet daim təmiz',
    T3: 'Mətbəx təmizliyi (görünən hissə)', T4: 'Personalın şəxsi gigieni',
    T5: 'Cihaz və qab təmizliyi', T6: 'Zibil idarəsi düzgündür',
    T7: 'Kondisioner/havalandırma işləyir', T8: 'Gizli toz/kir yoxdur',
    T9: 'Bakteriya yoxlaması müntəzəm', T10: 'AQTA/sanitar standartlara uyğun',
  },
  en: {
    K1: 'Food taste and quality is high', K2: 'Portion size matches the price',
    K3: 'Fresh ingredients are used', K4: 'Food presentation is appealing',
    K5: 'Menu variety is sufficient', K6: 'Food temperature is correct',
    K7: 'Special diets available (vegan/halal)', K8: 'Preparation time is acceptable',
    K9: 'Food is consistent (same taste)', K10: 'Delivery packaging quality',
    S1: 'Staff friendliness and attitude', S2: 'Order taking speed',
    S3: 'Staff menu knowledge', S4: 'Bill delivery speed',
    S5: 'Complaint handling', S6: 'Staff wears uniform',
    S7: 'Table waiting time is acceptable', S8: 'Phone/online ordering ease',
    S9: 'Order accuracy (no mistakes)', S10: 'Customer returns (loyalty)',
    T1: 'Dining area is clean (tables, floor)', T2: 'Restroom is always clean',
    T3: 'Kitchen cleanliness (visible area)', T4: 'Staff personal hygiene',
    T5: 'Equipment and dish cleanliness', T6: 'Waste management is proper',
    T7: 'AC/ventilation works', T8: 'No hidden dust or dirt',
    T9: 'Regular bacteria checks', T10: 'Meets sanitary standards',
  },
  tr: {
    K1: 'Yemeklerin tadı ve kalitesi yüksek', K2: 'Porsiyon büyüklüğü fiyata uygun',
    K3: 'Taze malzemeler kullanılıyor', K4: 'Yemeğin sunumu güzel',
    K5: 'Menü çeşitliliği yeterli', K6: 'Yemek sıcaklığı doğru',
    K7: 'Özel diyetler mevcut (vegan/helal)', K8: 'Hazırlama süresi kabul edilebilir',
    K9: 'Yemek tutarlı geliyor (aynı tat)', K10: 'Paket servis kalitesi',
    S1: 'Personelin güler yüzlülüğü', S2: 'Sipariş alma hızı',
    S3: 'Personelin menü bilgisi', S4: 'Hesap getirme hızı',
    S5: 'Şikayetlere yanıt verilmesi', S6: 'Personel üniforma giyiyor',
    S7: 'Masa bekleme süresi kabul edilebilir', S8: 'Telefon/online sipariş kolaylığı',
    S9: 'Sipariş doğru geliyor', S10: 'Müşteri tekrar geliyor',
    T1: 'Yemek alanı temiz (masa, zemin)', T2: 'Tuvalet her zaman temiz',
    T3: 'Mutfak temizliği (görünür kısım)', T4: 'Personel kişisel hijyeni',
    T5: 'Ekipman ve tabak temizliği', T6: 'Çöp yönetimi düzgün',
    T7: 'Klima/havalandırma çalışıyor', T8: 'Gizli toz/kir yok',
    T9: 'Düzenli bakteri kontrolü', T10: 'Sanitasyon standartlarına uygun',
  },
  ru: {
    K1: 'Вкус и качество блюд высокие', K2: 'Размер порций соответствует цене',
    K3: 'Используются свежие ингредиенты', K4: 'Подача блюд привлекательна',
    K5: 'Разнообразие меню достаточное', K6: 'Температура блюд правильная',
    K7: 'Есть спецдиеты (веган/халяль)', K8: 'Время приготовления приемлемое',
    K9: 'Блюда стабильны (один вкус)', K10: 'Качество упаковки доставки',
    S1: 'Дружелюбность персонала', S2: 'Скорость принятия заказа',
    S3: 'Знание меню персоналом', S4: 'Скорость выноса счёта',
    S5: 'Реагирование на жалобы', S6: 'Персонал в форме',
    S7: 'Время ожидания стола приемлемо', S8: 'Удобство телефонного/онлайн заказа',
    S9: 'Заказ приходит правильно', S10: 'Клиент возвращается (лояльность)',
    T1: 'Обеденная зона чиста (столы, пол)', T2: 'Туалет всегда чист',
    T3: 'Чистота кухни (видимая часть)', T4: 'Личная гигиена персонала',
    T5: 'Чистота оборудования и посуды', T6: 'Управление отходами правильное',
    T7: 'Кондиционер/вентиляция работает', T8: 'Нет скрытой пыли/грязи',
    T9: 'Регулярная бактериальная проверка', T10: 'Соответствие санитарным нормам',
  },
};

const categoryCopy: Record<Locale, Record<Category, string>> = {
  az: { quality: 'Keyfiyyət', service: 'Servis', cleanliness: 'Təmizlik' },
  en: { quality: 'Quality', service: 'Service', cleanliness: 'Cleanliness' },
  tr: { quality: 'Kalite', service: 'Servis', cleanliness: 'Temizlik' },
  ru: { quality: 'Качество', service: 'Сервис', cleanliness: 'Чистота' },
};

const btnCopy: Record<Locale, { submit: string; submitting: string; notes: string; notesPlaceholder: string; progress: string }> = {
  az: { submit: 'KST Auditimi Yarat', submitting: 'AI fikirləşir...', notes: 'Əlavə qeyd (opsional)', notesPlaceholder: 'Hansı sahədə daha çox sıxıntı yaşadığını yaz...', progress: 'cavablandı' },
  en: { submit: 'Create My KST Audit', submitting: 'AI is thinking...', notes: 'Additional notes (optional)', notesPlaceholder: 'Write which area causes the most concern...', progress: 'answered' },
  tr: { submit: 'KST Denetimimi Oluştur', submitting: 'AI düşünüyor...', notes: 'Ek not (opsiyonel)', notesPlaceholder: 'Hangi alanda daha çok sıkıntı yaşadığını yaz...', progress: 'yanıtlandı' },
  ru: { submit: 'Создать KST Аудит', submitting: 'ИИ думает...', notes: 'Дополнительные заметки (опционально)', notesPlaceholder: 'Напишите, в какой области больше всего проблем...', progress: 'отвечено' },
};

// ── COMPONENT ───────────────────────────────────────────────────────

interface Props {
  locale: Locale;
  onResult: (data: unknown) => void;
  onError: (msg: string) => void;
}

export default function KSTQuestionnaireForm({ locale, onResult, onError }: Props) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [loading, setLoading] = useState(false);
  const [openSections, setOpenSections] = useState<Record<Category, boolean>>({
    quality: true, service: false, cleanliness: false,
  });

  const labels = questionLabels[locale];
  const cats = categoryCopy[locale];
  const btn = btnCopy[locale];

  const totalAnswered =
    Object.keys(state.quality).length +
    Object.keys(state.service).length +
    Object.keys(state.cleanliness).length;
  const progress = Math.round((totalAnswered / 30) * 100);
  const isComplete = totalAnswered === 30;

  function toggleSection(cat: Category) {
    setOpenSections((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  async function handleSubmit() {
    if (!isComplete) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing-tools/kst-yoxlayici', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...state, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? 'unknown');
        return;
      }
      onResult(data.data);
    } catch {
      onError('network');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
          <span>{totalAnswered} / 30 {btn.progress}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[var(--dk-gold)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      {CATEGORIES.map((cat) => {
        const prefix = PREFIXES[cat];
        const answered = Object.keys(state[cat]).length;
        const isOpen = openSections[cat];

        return (
          <div key={cat} className="rounded-2xl border border-slate-200 bg-slate-50/50">
            <button
              type="button"
              onClick={() => toggleSection(cat)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[var(--dk-navy)]">{cats[cat]}</span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {answered}/10
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && (
              <div className="space-y-2 px-4 pb-4">
                {Array.from({ length: 10 }, (_, i) => {
                  const qId = `${prefix}${i + 1}`;
                  return (
                    <LikertScale
                      key={qId}
                      questionId={qId}
                      label={labels[qId] ?? qId}
                      value={state[cat][qId] ?? null}
                      onChange={(v) => dispatch({ type: 'SET_SCORE', category: cat, questionId: qId, value: v })}
                      disabled={loading}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{btn.notes}</label>
        <textarea
          value={state.notes}
          onChange={(e) => dispatch({ type: 'SET_NOTES', value: e.target.value })}
          placeholder={btn.notesPlaceholder}
          rows={3}
          maxLength={1000}
          disabled={loading}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20"
        />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isComplete || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" />{btn.submitting}</>
        ) : (
          btn.submit
        )}
      </button>
    </div>
  );
}
