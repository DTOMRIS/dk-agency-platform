/**
 * Azərbaycan dili üçün ICU-dan asılı olmayan rəqəm/tarix formatı (TASK-0462).
 *
 * Səbəb: Chrome/Chromium-un ICU paketində `az` məlumatı yoxdur — `az-AZ` ilə format
 * brauzerdə kök locale-ə düşür (`1,234,567`, `2026 M09 29`, `AZN 1,234.50`), Node isə
 * tam ICU ilə düzgün yazır (`1.234.567`, `29 sentyabr 2026`). Client komponentlərində
 * bu, hydration xətası və hidrasiyadan sonra ingiliscə görünən rəqəm/tarix deməkdir.
 *
 * - Rəqəm: `de-DE` — `az` ilə eyni (min `.`, onluq `,`) və hər yerdə mövcuddur.
 * - Tarix: ay/həftə günü adları burada, hissələr `en-US` + `Asia/Baku` ilə — server
 *   (UTC) və brauzer (istənilən saat qurşağı) eyni günü göstərir.
 * Nəticə Node-un `az-AZ` çıxışı ilə eynidir (unit test: e2e/az-format.test.ts).
 */

export const AZ_NUMBER_LOCALE = 'de-DE';
export const APP_TIME_ZONE = 'Asia/Baku';

const AZ_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avqust',
  'sentyabr',
  'oktyabr',
  'noyabr',
  'dekabr',
];
const AZ_MONTHS_SHORT = [
  'yan',
  'fev',
  'mar',
  'apr',
  'may',
  'iyn',
  'iyl',
  'avq',
  'sen',
  'okt',
  'noy',
  'dek',
];
// Date.getDay() sırası: 0 = bazar
const AZ_WEEKDAYS = [
  'bazar',
  'bazar ertəsi',
  'çərşənbə axşamı',
  'çərşənbə',
  'cümə axşamı',
  'cümə',
  'şənbə',
];
const EN_WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** `az`/`az-AZ` → `de-DE`; digər dillər olduğu kimi */
export function numberLocale(locale: string = 'az'): string {
  return locale.toLowerCase().startsWith('az') ? AZ_NUMBER_LOCALE : locale;
}

export function formatNumber(
  value: number,
  locale: string = 'az',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(numberLocale(locale), options).format(value);
}

interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: string;
  minute: string;
  second: string;
  weekday: number; // 0 = bazar
}

const PARTS_FORMAT = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  weekday: 'short',
});

function zonedParts(date: Date): ZonedParts {
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    PARTS_FORMAT.formatToParts(date).find((p) => p.type === type)?.value ?? '';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: get('hour').padStart(2, '0'),
    minute: get('minute').padStart(2, '0'),
    second: get('second').padStart(2, '0'),
    weekday: EN_WEEKDAY_INDEX[get('weekday')] ?? 0,
  };
}

const pad2 = (n: number) => String(n).padStart(2, '0');

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

/**
 * `toLocaleDateString('az-AZ', options)` əvəzi. Dəstəklənən: day, month (long/short/numeric/2-digit),
 * year, weekday (long), hour/minute/second. Seçimsiz — `29.09.2026`.
 */
export function formatAzDate(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return '';
  const p = zonedParts(date);

  const hasDate = Boolean(options.day || options.month || options.year || options.weekday);
  const hasTime = Boolean(options.hour || options.minute || options.second);
  const named = options.month === 'long' || options.month === 'short';

  let datePart = '';
  if (!hasDate && !hasTime) {
    datePart = `${pad2(p.day)}.${pad2(p.month)}.${p.year}`;
  } else if (named) {
    const month = options.month === 'long' ? AZ_MONTHS[p.month - 1] : AZ_MONTHS_SHORT[p.month - 1];
    const day = options.day === '2-digit' ? pad2(p.day) : String(p.day);
    datePart = [options.day ? day : '', month, options.year ? String(p.year) : '']
      .filter(Boolean)
      .join(' ');
  } else if (options.day || options.month || options.year) {
    datePart = [
      options.day ? pad2(p.day) : '',
      options.month ? pad2(p.month) : '',
      options.year ? String(p.year) : '',
    ]
      .filter(Boolean)
      .join('.');
  }
  if (options.weekday) {
    datePart = datePart ? `${datePart}, ${AZ_WEEKDAYS[p.weekday]}` : AZ_WEEKDAYS[p.weekday];
  }

  if (!hasTime) return datePart;
  const time = [
    options.hour ? p.hour : '',
    options.minute ? p.minute : '',
    options.second ? p.second : '',
  ]
    .filter(Boolean)
    .join(':');
  return datePart ? `${datePart}, ${time}` : time;
}

/** `toLocaleString('az-AZ')` (tarix + vaxt) əvəzi — `29.09.2026, 12:05:07` */
export function formatAzDateTime(value: Date | string | number): string {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return '';
  const p = zonedParts(date);
  return `${pad2(p.day)}.${pad2(p.month)}.${p.year}, ${p.hour}:${p.minute}:${p.second}`;
}
