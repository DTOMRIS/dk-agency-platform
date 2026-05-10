'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface MarkaKompasiInput {
  customerTime: string;
  customerActivity: string;
  foodStory: string;
  competitorGap: string;
  recommendReason: string;
}

const formCopy: Record<
  Locale,
  {
    questions: Record<string, { label: string; placeholder?: string; help?: string; options?: Record<string, string> }>;
    submit: string;
    submitting: string;
    validation: string;
  }
> = {
  az: {
    questions: {
      customerTime: {
        label: 'Sənin müştərin gündə hansı saatda gəlir?',
        help: 'Əsas zaman aralığını seç',
        options: { morning: 'Səhər', lunch: 'Nahar', evening: 'Axşam', 'late-night': 'Gec gecə', all: 'Hamısı' },
      },
      customerActivity: {
        label: 'Onlar burda nə edir?',
        options: { 'fill-belly': 'Qarın doyurur', work: 'İş görür', celebration: 'Mərasim / Bayram', relax: 'Dincəlir', 'third-place': 'Ev/iş arası üçüncü məkan' },
      },
      foodStory: {
        label: 'Sənin yeməyinin əsas hekayəsi nədir?',
        options: { tradition: 'Gələnək', speed: 'Sürət', health: 'Sağlamlıq', exotic: 'Ekzotika', handcrafted: 'Əl-emeyi' },
      },
      competitorGap: {
        label: 'Rəqibinin edə bilmədiyi nə? (ən az 3 cavab)',
        placeholder: 'Hər sətirdə bir cavab yaz...',
        help: 'Rəqibinin tutamadığı, sənin gücün olan 3 şey',
      },
      recommendReason: {
        label: 'Müştəri sənin yerini niyə dostuna tövsiyə edər?',
        placeholder: '1 cümlə ilə yaz',
      },
    },
    submit: 'Mənim Kompasımı Yarat',
    submitting: 'AI fikirləşir...',
    validation: 'Bütün sahələri doldur',
  },
  en: {
    questions: {
      customerTime: {
        label: 'What time of day do your customers come?',
        options: { morning: 'Morning', lunch: 'Lunch', evening: 'Evening', 'late-night': 'Late night', all: 'All day' },
      },
      customerActivity: {
        label: 'What do they do here?',
        options: { 'fill-belly': 'Eat', work: 'Work', celebration: 'Celebrate', relax: 'Relax', 'third-place': 'Third place' },
      },
      foodStory: {
        label: 'What is the core story of your food?',
        options: { tradition: 'Tradition', speed: 'Speed', health: 'Health', exotic: 'Exotic', handcrafted: 'Handcrafted' },
      },
      competitorGap: {
        label: 'What can your competitors NOT do? (at least 3 answers)',
        placeholder: 'One answer per line...',
      },
      recommendReason: {
        label: 'Why would a customer recommend you to a friend?',
        placeholder: 'Write in 1 sentence',
      },
    },
    submit: 'Create My Compass',
    submitting: 'AI is thinking...',
    validation: 'Fill in all fields',
  },
  tr: {
    questions: {
      customerTime: {
        label: 'Müşteriniz günün hangi saatinde gelir?',
        options: { morning: 'Sabah', lunch: 'Öğle', evening: 'Akşam', 'late-night': 'Gece geç', all: 'Tüm gün' },
      },
      customerActivity: {
        label: 'Burada ne yapıyorlar?',
        options: { 'fill-belly': 'Karnını doyuruyor', work: 'İş görüyor', celebration: 'Kutlama', relax: 'Dinleniyor', 'third-place': 'Üçüncü mekan' },
      },
      foodStory: {
        label: 'Yemeğinizin ana hikayesi ne?',
        options: { tradition: 'Gelenek', speed: 'Hız', health: 'Sağlık', exotic: 'Egzotik', handcrafted: 'El yapımı' },
      },
      competitorGap: {
        label: 'Rakibinizin yapamadığı ne? (en az 3 cevap)',
        placeholder: 'Her satırda bir cevap yazın...',
      },
      recommendReason: {
        label: 'Müşteri sizi neden arkadaşına tavsiye eder?',
        placeholder: '1 cümleyle yazın',
      },
    },
    submit: 'Pusulamı Oluştur',
    submitting: 'AI düşünüyor...',
    validation: 'Tüm alanları doldurun',
  },
  ru: {
    questions: {
      customerTime: {
        label: 'В какое время дня приходят ваши клиенты?',
        options: { morning: 'Утро', lunch: 'Обед', evening: 'Вечер', 'late-night': 'Поздний вечер', all: 'Весь день' },
      },
      customerActivity: {
        label: 'Что они здесь делают?',
        options: { 'fill-belly': 'Поесть', work: 'Работать', celebration: 'Праздновать', relax: 'Отдыхать', 'third-place': 'Третье место' },
      },
      foodStory: {
        label: 'Какова главная история вашей кухни?',
        options: { tradition: 'Традиция', speed: 'Скорость', health: 'Здоровье', exotic: 'Экзотика', handcrafted: 'Ручная работа' },
      },
      competitorGap: {
        label: 'Что НЕ может ваш конкурент? (минимум 3 ответа)',
        placeholder: 'Один ответ на строку...',
      },
      recommendReason: {
        label: 'Почему клиент порекомендует вас другу?',
        placeholder: 'Напишите одним предложением',
      },
    },
    submit: 'Создать мой компас',
    submitting: 'ИИ думает...',
    validation: 'Заполните все поля',
  },
};

const SELECT_FIELDS = ['customerTime', 'customerActivity', 'foodStory'] as const;

interface QuestionnaireFormProps {
  locale: Locale;
  onResult: (data: unknown) => void;
  onError: (msg: string) => void;
}

export default function QuestionnaireForm({ locale, onResult, onError }: QuestionnaireFormProps) {
  const copy = formCopy[locale];

  const [form, setForm] = useState<MarkaKompasiInput>({
    customerTime: '',
    customerActivity: '',
    foodStory: '',
    competitorGap: '',
    recommendReason: '',
  });
  const [loading, setLoading] = useState(false);

  const isValid =
    form.customerTime &&
    form.customerActivity &&
    form.foodStory &&
    form.competitorGap.length >= 20 &&
    form.recommendReason.length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);

    try {
      const res = await fetch('/api/marketing-tools/marka-kompasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessages: Record<string, Record<Locale, string>> = {
          'tier-too-low': { az: 'Bu alət üçün KALFA pilləsi lazımdır', en: 'KALFA tier required', tr: 'KALFA seviyesi gerekli', ru: 'Требуется уровень KALFA' },
          'monthly-limit-reached': { az: 'Bu ay limitiniz dolub. KALFA-ya yüksəlin.', en: 'Monthly limit reached.', tr: 'Aylık limit doldu.', ru: 'Лимит исчерпан.' },
          'ai-failed': { az: 'Texniki problem, yenidən cəhd edin', en: 'Technical error, try again', tr: 'Teknik sorun, tekrar deneyin', ru: 'Техническая ошибка, попробуйте снова' },
        };
        onError(errorMessages[data.error]?.[locale] ?? data.error);
        return;
      }

      onResult(data.data);
    } catch {
      onError(copy.questions.competitorGap.help ?? 'Error');
    } finally {
      setLoading(false);
    }
  }

  function updateField(name: keyof MarkaKompasiInput, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {SELECT_FIELDS.map((fieldName) => {
        const q = copy.questions[fieldName];
        const options = q.options ?? {};
        return (
          <div key={fieldName}>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">
              {q.label}
            </label>
            {q.help && <p className="mb-2 text-xs text-slate-500">{q.help}</p>}
            <select
              name={fieldName}
              value={form[fieldName]}
              onChange={(e) => updateField(fieldName, e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20"
              required
            >
              <option value="" disabled>—</option>
              {Object.entries(options).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        );
      })}

      {/* competitorGap — textarea */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">
          {copy.questions.competitorGap.label}
        </label>
        {copy.questions.competitorGap.help && (
          <p className="mb-2 text-xs text-slate-500">{copy.questions.competitorGap.help}</p>
        )}
        <textarea
          name="competitorGap"
          value={form.competitorGap}
          onChange={(e) => updateField('competitorGap', e.target.value)}
          placeholder={copy.questions.competitorGap.placeholder}
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20"
          required
          minLength={20}
          maxLength={500}
        />
      </div>

      {/* recommendReason — text input */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">
          {copy.questions.recommendReason.label}
        </label>
        <input
          type="text"
          name="recommendReason"
          value={form.recommendReason}
          onChange={(e) => updateField('recommendReason', e.target.value)}
          placeholder={copy.questions.recommendReason.placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20"
          required
          minLength={10}
          maxLength={200}
        />
      </div>

      <button
        type="submit"
        disabled={!isValid || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {copy.submitting}
          </>
        ) : (
          copy.submit
        )}
      </button>
    </form>
  );
}
