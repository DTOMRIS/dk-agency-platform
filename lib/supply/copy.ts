/**
 * TASK-0498 — Təchizatçı bazası admin UI mətnləri (AZ/RU/EN/TR).
 * Dashboard-un `pageCopy: Record<Locale, …>` nümunəsi (bax app/dashboard/xeberler/page.tsx).
 * Komponentlərdə hardcoded mətn yoxdur — hamısı buradan.
 */

import type { Locale } from '@/i18n/config';

import type { RequestStatus, RequestType, SupplierStatus } from './categories';

export interface SupplyCopy {
  pageTitle: string;
  pageSubtitle: string;
  privacyNote: string;
  tabSuppliers: string;
  tabRequests: string;
  importToggle: string;
  importHide: string;
  tablesMissingTitle: string;
  tablesMissingBody: string;
  dbUnavailable: string;
  loadFailed: string;
  loading: string;
  retry: string;
  // import
  importTitle: string;
  importIntro: string;
  fileLabel: string;
  chooseFile: string;
  noFile: string;
  fileSelected: (name: string, sizeMb: string) => string;
  groupLabel: string;
  groupPlaceholder: string;
  windowLabel: string;
  windowOption: (months: number) => string;
  analyse: string;
  analysing: string;
  zipExtracting: string;
  importButton: string;
  importing: string;
  previewTitle: string;
  previewNoWrite: string;
  period: (from: string, to: string) => string;
  statMessages: string;
  statSuppliers: string;
  statRequests: string;
  statOffers: string;
  withPhone: (n: number) => string;
  newVsExisting: (fresh: number, existing: number) => string;
  classTableTitle: string;
  colClass: string;
  colMessages: string;
  colUnique: string;
  classLabels: Record<string, string>;
  categoriesTitle: string;
  colSuppliers: string;
  colRequests: string;
  sampleSuppliers: string;
  sampleRequests: string;
  phonesCount: (n: number) => string;
  postsCount: (n: number) => string;
  dbStateTablesMissing: string;
  dbStateUnavailable: string;
  importDone: (r: {
    suppliersInserted: number;
    suppliersUpdated: number;
    requestsInserted: number;
    requestsSkipped: number;
  }) => string;
  reimportNote: string;
  errors: Record<string, string>;
  // suppliers
  searchSuppliers: string;
  filterCategory: string;
  allCategories: string;
  filterStatus: string;
  allStatuses: string;
  filterActivity: string;
  anyTime: string;
  lastMonths: (months: number) => string;
  hasPhone: string;
  filterGroup: string;
  allGroups: string;
  sortLabel: string;
  sortLastSeen: string;
  sortPosts: string;
  exportCsv: string;
  clearFilters: string;
  colSupplier: string;
  colCategories: string;
  colPhones: string;
  colLastSeen: string;
  colPosts: string;
  colStatus: string;
  colConsent: string;
  supplierStatuses: Record<SupplierStatus, string>;
  consentLabel: string;
  consentOn: string;
  consentOff: string;
  copyPhone: (phone: string) => string;
  copied: string;
  callPhone: (phone: string) => string;
  emptySuppliers: string;
  emptySuppliersAll: string;
  summaryTotal: (n: number) => string;
  summaryWithPhone: (n: number) => string;
  summaryConsented: (n: number) => string;
  resultsCount: (n: number) => string;
  pageInfo: (page: number, pages: number) => string;
  prev: string;
  next: string;
  details: string;
  close: string;
  company: string;
  companyPlaceholder: string;
  notes: string;
  notesPlaceholder: string;
  save: string;
  saving: string;
  saved: string;
  saveFailed: string;
  sampleOffers: string;
  firstSeen: string;
  sourceGroups: string;
  // requests
  searchRequests: string;
  filterType: string;
  allTypes: string;
  requestTypes: Record<RequestType, string>;
  requestStatuses: Record<RequestStatus, string>;
  filterDate: string;
  matchesButton: (n: number) => string;
  noMatches: string;
  noCategories: string;
  showInSuppliers: string;
  emptyRequests: string;
  emptyRequestsAll: string;
  requester: string;
  posted: string;
  notesSaved: string;
}

const az: SupplyCopy = {
  pageTitle: 'Təchizatçılar və tələblər',
  pageSubtitle: 'WhatsApp HoReCa qruplarından toplanan təchizatçı bazası və alıcı tələbləri.',
  privacyNote:
    'Şəxsi məlumat — yalnız admin panelində görünür. Təchizatçı açıq kataloqa yalnız razılıq verdikdən sonra çıxa bilər.',
  tabSuppliers: 'Təchizatçılar',
  tabRequests: 'Tələblər',
  importToggle: 'WhatsApp-dan idxal',
  importHide: 'İdxalı gizlət',
  tablesMissingTitle: 'Cədvəllər hələ yaradılmayıb — miqrasiyanı işə salın',
  tablesMissingBody:
    'Serverdə «npm run db:migrate» işlədin (RUNBOOK §6), sonra səhifəni yeniləyin. İdxalın təhlili miqrasiyasız da işləyir, idxal isə miqrasiyadan sonra.',
  dbUnavailable: 'Verilənlər bazası əlçatan deyil.',
  loadFailed: 'Məlumat yüklənmədi.',
  loading: 'Yüklənir…',
  retry: 'Yenidən cəhd et',
  importTitle: 'WhatsApp-dan idxal',
  importIntro:
    'WhatsApp-da qrupu açın → Qrup məlumatı → «Söhbəti ixrac et». Alınan .zip və ya _chat.txt faylını seçin. Mətn yalnız serverdə qaydalarla təhlil olunur, heç bir xarici AI xidmətinə göndərilmir.',
  fileLabel: 'İxrac faylı (.zip və ya _chat.txt)',
  chooseFile: 'Fayl seçin',
  noFile: 'Fayl seçilməyib',
  fileSelected: (name, size) => `${name} · ${size} MB`,
  groupLabel: 'Mənbə qrupun adı',
  groupPlaceholder: 'Fayl adından götürülür',
  windowLabel: 'Dövr',
  windowOption: (m) => `Son ${m} ay`,
  analyse: 'Təhlil et',
  analysing: 'Təhlil olunur…',
  zipExtracting: 'ZIP-dən söhbət faylı çıxarılır…',
  importButton: 'İdxal et',
  importing: 'İdxal olunur…',
  previewTitle: 'Təhlil nəticəsi',
  previewNoWrite: 'Təhlil bazaya heç nə yazmır.',
  period: (from, to) => `Dövr: ${from} — ${to}`,
  statMessages: 'Dövrdəki mesaj',
  statSuppliers: 'Təchizatçı',
  statRequests: 'Tələb',
  statOffers: 'Təklif mesajı',
  withPhone: (n) => `${n} nəfərin telefonu var`,
  newVsExisting: (f, e) => `${f} yeni · ${e} mövcud`,
  classTableTitle: 'Mesaj növləri',
  colClass: 'Növ',
  colMessages: 'Mesaj',
  colUnique: 'Unikal',
  classLabels: {
    'techizatci-teklif': 'Təchizatçı təklifi',
    'xidmet-teklif': 'Xidmət təklifi',
    'sorgu:mehsul': 'Tələb: məhsul',
    'sorgu:ekipman': 'Tələb: avadanlıq',
    'sorgu:devir/yer': 'Tələb: obyekt/yer',
    'sorgu:xidmet': 'Tələb: xidmət',
    ekipman: 'Avadanlıq satışı',
    icare: 'İcarə',
    'devir/biznes-satis': 'Biznes satışı/devir',
    vakansiya: 'Vakansiya',
    'is_axtaran(CV)': 'İş axtaran',
    'franchise/ortaq': 'Franchise/ortaq',
    'qrup-admin': 'Qrup idarəsi',
    'sistem/media': 'Sistem/media',
    'qisa/sohbet': 'Qısa söhbət',
    'sual/muzakire': 'Sual/müzakirə',
    diger: 'Digər',
  },
  categoriesTitle: 'Məhsul qrupları',
  colSuppliers: 'Təchizatçı',
  colRequests: 'Tələb',
  sampleSuppliers: 'Nümunə: ən son aktiv təchizatçılar',
  sampleRequests: 'Nümunə: ən son tələblər',
  phonesCount: (n) => (n ? `${n} telefon` : 'telefon yoxdur'),
  postsCount: (n) => `${n} paylaşım`,
  dbStateTablesMissing:
    'Cədvəllər yoxdur — yeni/mövcud bölgüsü və idxal miqrasiyadan sonra işləyəcək.',
  dbStateUnavailable: 'Verilənlər bazası əlçatan deyil — yalnız təhlil göstərilir.',
  importDone: (r) =>
    `İdxal tamamlandı: ${r.suppliersInserted} yeni, ${r.suppliersUpdated} yenilənmiş təchizatçı; ${r.requestsInserted} yeni tələb (${r.requestsSkipped} artıq var idi).`,
  reimportNote:
    'Təkrar idxal təhlükəsizdir: eyni mesaj ikinci dəfə sayılmır, admin qeydləri və statuslar qorunur.',
  errors: {
    file_required: 'Fayl seçin.',
    zip_too_large:
      'ZIP çox böyükdür. Brauzer söhbət faylını çıxara bilmədi — _chat.txt faylını ayrıca seçin.',
    text_too_large: 'Söhbət faylı 20 MB-dan böyükdür.',
    body_too_large: 'Fayl çox böyükdür.',
    zip_not_zip: 'Fayl ZIP və ya WhatsApp söhbəti deyil.',
    zip_no_chat: 'ZIP-də _chat.txt tapılmadı.',
    zip_unsupported: 'Bu ZIP formatı dəstəklənmir — _chat.txt faylını ayrıca seçin.',
    not_whatsapp_export: 'Faylda WhatsApp mesajı tapılmadı (iOS ixrac formatı gözlənilir).',
    invalid_fields: 'Sahələr yanlışdır.',
    tables_missing: 'Cədvəllər hələ yaradılmayıb — miqrasiyanı işə salın.',
    db_unavailable: 'Verilənlər bazası əlçatan deyil.',
    server_error: 'Server xətası.',
    unauthorized: 'Admin girişi tələb olunur.',
    default: 'Xəta baş verdi.',
  },
  searchSuppliers: 'Ad, şirkət və ya telefon',
  filterCategory: 'Kateqoriya',
  allCategories: 'Bütün kateqoriyalar',
  filterStatus: 'Status',
  allStatuses: 'Bütün statuslar',
  filterActivity: 'Aktivlik',
  anyTime: 'İstənilən vaxt',
  lastMonths: (m) => `Son ${m} ay`,
  hasPhone: 'Telefonu var',
  filterGroup: 'Mənbə qrup',
  allGroups: 'Bütün qruplar',
  sortLabel: 'Sıralama',
  sortLastSeen: 'Son aktivlik',
  sortPosts: 'Paylaşım sayı',
  exportCsv: 'CSV ixrac',
  clearFilters: 'Filtrləri sıfırla',
  colSupplier: 'Təchizatçı',
  colCategories: 'Kateqoriyalar',
  colPhones: 'Telefon',
  colLastSeen: 'Son aktivlik',
  colPosts: 'Paylaşım',
  colStatus: 'Status',
  colConsent: 'Razılıq',
  supplierStatuses: {
    yeni: 'Yeni',
    elaqe_saxlanildi: 'Əlaqə saxlanıldı',
    razi: 'Razı',
    imtina: 'İmtina',
  },
  consentLabel: 'Açıq kataloq razılığı',
  consentOn: 'Razıdır',
  consentOff: 'Yoxdur',
  copyPhone: (p) => `${p} — kopyala`,
  copied: 'Kopyalandı',
  callPhone: (p) => `${p} — zəng et`,
  emptySuppliers: 'Filtrə uyğun təchizatçı yoxdur.',
  emptySuppliersAll: 'Hələ təchizatçı yoxdur — yuxarıdan WhatsApp ixracını idxal edin.',
  summaryTotal: (n) => `${n} təchizatçı`,
  summaryWithPhone: (n) => `${n} telefonlu`,
  summaryConsented: (n) => `${n} razılıq verib`,
  resultsCount: (n) => `${n} nəticə`,
  pageInfo: (p, t) => `Səhifə ${p} / ${t}`,
  prev: 'Əvvəlki',
  next: 'Növbəti',
  details: 'Ətraflı',
  close: 'Bağla',
  company: 'Şirkət',
  companyPlaceholder: 'Şirkətin adı',
  notes: 'Qeyd',
  notesPlaceholder: 'Daxili qeyd (yalnız admin görür)',
  save: 'Yadda saxla',
  saving: 'Saxlanılır…',
  saved: 'Yadda saxlanıldı',
  saveFailed: 'Saxlanılmadı',
  sampleOffers: 'Son təkliflər',
  firstSeen: 'İlk görünmə',
  sourceGroups: 'Mənbə qruplar',
  searchRequests: 'Mətn və ya ad',
  filterType: 'Növ',
  allTypes: 'Bütün növlər',
  requestTypes: { mehsul: 'Məhsul', ekipman: 'Avadanlıq', yer: 'Obyekt/yer', xidmet: 'Xidmət' },
  requestStatuses: { aciq: 'Açıq', uygunlasdirildi: 'Uyğunlaşdırıldı', baglandi: 'Bağlandı' },
  filterDate: 'Tarix',
  matchesButton: (n) => `Uyğun təchizatçılar (${n})`,
  noMatches: 'Uyğun təchizatçı tapılmadı.',
  noCategories: 'Kateqoriya təyin olunmayıb — uyğunlaşdırma mümkün deyil.',
  showInSuppliers: 'Hamısını təchizatçılarda göstər',
  emptyRequests: 'Filtrə uyğun tələb yoxdur.',
  emptyRequestsAll: 'Hələ tələb yoxdur — yuxarıdan WhatsApp ixracını idxal edin.',
  requester: 'Tələb edən',
  posted: 'Tarix',
  notesSaved: 'Qeyd saxlanıldı',
};

const ru: SupplyCopy = {
  pageTitle: 'Поставщики и запросы',
  pageSubtitle: 'База поставщиков и запросы покупателей из WhatsApp-групп HoReCa.',
  privacyNote:
    'Персональные данные — видны только в админ-панели. Поставщик попадёт в открытый каталог только после согласия.',
  tabSuppliers: 'Поставщики',
  tabRequests: 'Запросы',
  importToggle: 'Импорт из WhatsApp',
  importHide: 'Скрыть импорт',
  tablesMissingTitle: 'Таблицы ещё не созданы — запустите миграцию',
  tablesMissingBody:
    'Выполните на сервере «npm run db:migrate» (RUNBOOK §6) и обновите страницу. Анализ импорта работает и без миграции, сам импорт — после неё.',
  dbUnavailable: 'База данных недоступна.',
  loadFailed: 'Не удалось загрузить данные.',
  loading: 'Загрузка…',
  retry: 'Повторить',
  importTitle: 'Импорт из WhatsApp',
  importIntro:
    'Откройте группу в WhatsApp → Данные группы → «Экспорт чата». Выберите полученный .zip или _chat.txt. Текст анализируется только на сервере по правилам и не отправляется во внешние AI-сервисы.',
  fileLabel: 'Файл экспорта (.zip или _chat.txt)',
  chooseFile: 'Выбрать файл',
  noFile: 'Файл не выбран',
  fileSelected: (name, size) => `${name} · ${size} МБ`,
  groupLabel: 'Название группы-источника',
  groupPlaceholder: 'Берётся из имени файла',
  windowLabel: 'Период',
  windowOption: (m) => `Последние ${m} мес.`,
  analyse: 'Анализировать',
  analysing: 'Анализ…',
  zipExtracting: 'Извлекаем чат из ZIP…',
  importButton: 'Импортировать',
  importing: 'Импорт…',
  previewTitle: 'Результат анализа',
  previewNoWrite: 'Анализ ничего не записывает в базу.',
  period: (from, to) => `Период: ${from} — ${to}`,
  statMessages: 'Сообщений за период',
  statSuppliers: 'Поставщики',
  statRequests: 'Запросы',
  statOffers: 'Сообщения-предложения',
  withPhone: (n) => `с телефоном: ${n}`,
  newVsExisting: (f, e) => `${f} новых · ${e} уже есть`,
  classTableTitle: 'Типы сообщений',
  colClass: 'Тип',
  colMessages: 'Сообщений',
  colUnique: 'Уникальных',
  classLabels: {
    'techizatci-teklif': 'Предложение поставщика',
    'xidmet-teklif': 'Предложение услуг',
    'sorgu:mehsul': 'Запрос: продукт',
    'sorgu:ekipman': 'Запрос: оборудование',
    'sorgu:devir/yer': 'Запрос: объект/помещение',
    'sorgu:xidmet': 'Запрос: услуга',
    ekipman: 'Продажа оборудования',
    icare: 'Аренда',
    'devir/biznes-satis': 'Продажа бизнеса',
    vakansiya: 'Вакансия',
    'is_axtaran(CV)': 'Ищет работу',
    'franchise/ortaq': 'Франшиза/партнёр',
    'qrup-admin': 'Управление группой',
    'sistem/media': 'Системное/медиа',
    'qisa/sohbet': 'Короткий разговор',
    'sual/muzakire': 'Вопрос/обсуждение',
    diger: 'Другое',
  },
  categoriesTitle: 'Товарные группы',
  colSuppliers: 'Поставщики',
  colRequests: 'Запросы',
  sampleSuppliers: 'Пример: последние активные поставщики',
  sampleRequests: 'Пример: последние запросы',
  phonesCount: (n) => (n ? `телефонов: ${n}` : 'нет телефона'),
  postsCount: (n) => `публикаций: ${n}`,
  dbStateTablesMissing:
    'Таблиц нет — деление на новые/существующие и импорт заработают после миграции.',
  dbStateUnavailable: 'База данных недоступна — показан только анализ.',
  importDone: (r) =>
    `Импорт завершён: новых поставщиков ${r.suppliersInserted}, обновлено ${r.suppliersUpdated}; новых запросов ${r.requestsInserted} (уже было ${r.requestsSkipped}).`,
  reimportNote:
    'Повторный импорт безопасен: одно сообщение не считается дважды, заметки и статусы сохраняются.',
  errors: {
    file_required: 'Выберите файл.',
    zip_too_large:
      'ZIP слишком большой, браузер не смог извлечь чат — выберите _chat.txt отдельно.',
    text_too_large: 'Файл чата больше 20 МБ.',
    body_too_large: 'Файл слишком большой.',
    zip_not_zip: 'Файл не является ZIP или чатом WhatsApp.',
    zip_no_chat: 'В ZIP нет _chat.txt.',
    zip_unsupported: 'Этот формат ZIP не поддерживается — выберите _chat.txt отдельно.',
    not_whatsapp_export: 'В файле нет сообщений WhatsApp (ожидается формат экспорта iOS).',
    invalid_fields: 'Неверные поля.',
    tables_missing: 'Таблицы ещё не созданы — запустите миграцию.',
    db_unavailable: 'База данных недоступна.',
    server_error: 'Ошибка сервера.',
    unauthorized: 'Нужен вход администратора.',
    default: 'Произошла ошибка.',
  },
  searchSuppliers: 'Имя, компания или телефон',
  filterCategory: 'Категория',
  allCategories: 'Все категории',
  filterStatus: 'Статус',
  allStatuses: 'Все статусы',
  filterActivity: 'Активность',
  anyTime: 'Любое время',
  lastMonths: (m) => `Последние ${m} мес.`,
  hasPhone: 'Есть телефон',
  filterGroup: 'Группа-источник',
  allGroups: 'Все группы',
  sortLabel: 'Сортировка',
  sortLastSeen: 'Последняя активность',
  sortPosts: 'Число публикаций',
  exportCsv: 'Экспорт CSV',
  clearFilters: 'Сбросить фильтры',
  colSupplier: 'Поставщик',
  colCategories: 'Категории',
  colPhones: 'Телефон',
  colLastSeen: 'Активность',
  colPosts: 'Публикаций',
  colStatus: 'Статус',
  colConsent: 'Согласие',
  supplierStatuses: {
    yeni: 'Новый',
    elaqe_saxlanildi: 'Связались',
    razi: 'Согласен',
    imtina: 'Отказ',
  },
  consentLabel: 'Согласие на открытый каталог',
  consentOn: 'Согласен',
  consentOff: 'Нет',
  copyPhone: (p) => `${p} — копировать`,
  copied: 'Скопировано',
  callPhone: (p) => `${p} — позвонить`,
  emptySuppliers: 'Нет поставщиков по фильтру.',
  emptySuppliersAll: 'Поставщиков пока нет — импортируйте экспорт WhatsApp выше.',
  summaryTotal: (n) => `поставщиков: ${n}`,
  summaryWithPhone: (n) => `с телефоном: ${n}`,
  summaryConsented: (n) => `дали согласие: ${n}`,
  resultsCount: (n) => `результатов: ${n}`,
  pageInfo: (p, t) => `Страница ${p} из ${t}`,
  prev: 'Назад',
  next: 'Далее',
  details: 'Подробнее',
  close: 'Закрыть',
  company: 'Компания',
  companyPlaceholder: 'Название компании',
  notes: 'Заметка',
  notesPlaceholder: 'Внутренняя заметка (видит только админ)',
  save: 'Сохранить',
  saving: 'Сохранение…',
  saved: 'Сохранено',
  saveFailed: 'Не сохранено',
  sampleOffers: 'Последние предложения',
  firstSeen: 'Впервые',
  sourceGroups: 'Группы-источники',
  searchRequests: 'Текст или имя',
  filterType: 'Тип',
  allTypes: 'Все типы',
  requestTypes: {
    mehsul: 'Продукт',
    ekipman: 'Оборудование',
    yer: 'Объект/помещение',
    xidmet: 'Услуга',
  },
  requestStatuses: { aciq: 'Открыт', uygunlasdirildi: 'Подобран', baglandi: 'Закрыт' },
  filterDate: 'Дата',
  matchesButton: (n) => `Подходящие поставщики (${n})`,
  noMatches: 'Подходящих поставщиков нет.',
  noCategories: 'Категория не определена — подбор невозможен.',
  showInSuppliers: 'Показать всех в поставщиках',
  emptyRequests: 'Нет запросов по фильтру.',
  emptyRequestsAll: 'Запросов пока нет — импортируйте экспорт WhatsApp выше.',
  requester: 'Автор запроса',
  posted: 'Дата',
  notesSaved: 'Заметка сохранена',
};

const en: SupplyCopy = {
  pageTitle: 'Suppliers & requests',
  pageSubtitle: 'Supplier base and buyer requests collected from HoReCa WhatsApp groups.',
  privacyNote:
    'Personal data — visible in the admin panel only. A supplier can appear in a public catalogue only after giving consent.',
  tabSuppliers: 'Suppliers',
  tabRequests: 'Requests',
  importToggle: 'Import from WhatsApp',
  importHide: 'Hide import',
  tablesMissingTitle: 'Tables are not created yet — run the migration',
  tablesMissingBody:
    'Run "npm run db:migrate" on the server (RUNBOOK §6), then reload. Import analysis works without the migration; the import itself needs it.',
  dbUnavailable: 'Database unavailable.',
  loadFailed: 'Could not load data.',
  loading: 'Loading…',
  retry: 'Retry',
  importTitle: 'Import from WhatsApp',
  importIntro:
    'In WhatsApp open the group → Group info → "Export chat". Pick the resulting .zip or _chat.txt. Text is analysed on the server with rules only and is never sent to an external AI service.',
  fileLabel: 'Export file (.zip or _chat.txt)',
  chooseFile: 'Choose file',
  noFile: 'No file selected',
  fileSelected: (name, size) => `${name} · ${size} MB`,
  groupLabel: 'Source group name',
  groupPlaceholder: 'Taken from the file name',
  windowLabel: 'Period',
  windowOption: (m) => `Last ${m} months`,
  analyse: 'Analyse',
  analysing: 'Analysing…',
  zipExtracting: 'Extracting chat from ZIP…',
  importButton: 'Import',
  importing: 'Importing…',
  previewTitle: 'Analysis result',
  previewNoWrite: 'Analysis does not write anything to the database.',
  period: (from, to) => `Period: ${from} — ${to}`,
  statMessages: 'Messages in period',
  statSuppliers: 'Suppliers',
  statRequests: 'Requests',
  statOffers: 'Offer messages',
  withPhone: (n) => `${n} with a phone`,
  newVsExisting: (f, e) => `${f} new · ${e} existing`,
  classTableTitle: 'Message types',
  colClass: 'Type',
  colMessages: 'Messages',
  colUnique: 'Unique',
  classLabels: {
    'techizatci-teklif': 'Supplier offer',
    'xidmet-teklif': 'Service offer',
    'sorgu:mehsul': 'Request: product',
    'sorgu:ekipman': 'Request: equipment',
    'sorgu:devir/yer': 'Request: venue/space',
    'sorgu:xidmet': 'Request: service',
    ekipman: 'Equipment for sale',
    icare: 'Rental',
    'devir/biznes-satis': 'Business for sale',
    vakansiya: 'Vacancy',
    'is_axtaran(CV)': 'Job seeker',
    'franchise/ortaq': 'Franchise/partner',
    'qrup-admin': 'Group admin',
    'sistem/media': 'System/media',
    'qisa/sohbet': 'Short chat',
    'sual/muzakire': 'Question/discussion',
    diger: 'Other',
  },
  categoriesTitle: 'Product groups',
  colSuppliers: 'Suppliers',
  colRequests: 'Requests',
  sampleSuppliers: 'Sample: most recently active suppliers',
  sampleRequests: 'Sample: latest requests',
  phonesCount: (n) => (n ? `${n} phone${n === 1 ? '' : 's'}` : 'no phone'),
  postsCount: (n) => `${n} post${n === 1 ? '' : 's'}`,
  dbStateTablesMissing:
    'Tables missing — the new/existing split and import will work after the migration.',
  dbStateUnavailable: 'Database unavailable — showing analysis only.',
  importDone: (r) =>
    `Import finished: ${r.suppliersInserted} new, ${r.suppliersUpdated} updated suppliers; ${r.requestsInserted} new requests (${r.requestsSkipped} already existed).`,
  reimportNote:
    'Re-importing is safe: a message is never counted twice; notes and statuses are kept.',
  errors: {
    file_required: 'Choose a file.',
    zip_too_large:
      'ZIP is too large and the browser could not extract the chat — pick _chat.txt separately.',
    text_too_large: 'Chat file is larger than 20 MB.',
    body_too_large: 'File is too large.',
    zip_not_zip: 'The file is not a ZIP or a WhatsApp chat.',
    zip_no_chat: 'No _chat.txt in the ZIP.',
    zip_unsupported: 'This ZIP format is not supported — pick _chat.txt separately.',
    not_whatsapp_export: 'No WhatsApp messages found (iOS export format expected).',
    invalid_fields: 'Invalid fields.',
    tables_missing: 'Tables are not created yet — run the migration.',
    db_unavailable: 'Database unavailable.',
    server_error: 'Server error.',
    unauthorized: 'Admin sign-in required.',
    default: 'Something went wrong.',
  },
  searchSuppliers: 'Name, company or phone',
  filterCategory: 'Category',
  allCategories: 'All categories',
  filterStatus: 'Status',
  allStatuses: 'All statuses',
  filterActivity: 'Activity',
  anyTime: 'Any time',
  lastMonths: (m) => `Last ${m} months`,
  hasPhone: 'Has phone',
  filterGroup: 'Source group',
  allGroups: 'All groups',
  sortLabel: 'Sort',
  sortLastSeen: 'Last activity',
  sortPosts: 'Post count',
  exportCsv: 'Export CSV',
  clearFilters: 'Reset filters',
  colSupplier: 'Supplier',
  colCategories: 'Categories',
  colPhones: 'Phone',
  colLastSeen: 'Last activity',
  colPosts: 'Posts',
  colStatus: 'Status',
  colConsent: 'Consent',
  supplierStatuses: {
    yeni: 'New',
    elaqe_saxlanildi: 'Contacted',
    razi: 'Agreed',
    imtina: 'Declined',
  },
  consentLabel: 'Public catalogue consent',
  consentOn: 'Consented',
  consentOff: 'None',
  copyPhone: (p) => `Copy ${p}`,
  copied: 'Copied',
  callPhone: (p) => `Call ${p}`,
  emptySuppliers: 'No suppliers match the filters.',
  emptySuppliersAll: 'No suppliers yet — import a WhatsApp export above.',
  summaryTotal: (n) => `${n} suppliers`,
  summaryWithPhone: (n) => `${n} with phone`,
  summaryConsented: (n) => `${n} consented`,
  resultsCount: (n) => `${n} results`,
  pageInfo: (p, t) => `Page ${p} of ${t}`,
  prev: 'Previous',
  next: 'Next',
  details: 'Details',
  close: 'Close',
  company: 'Company',
  companyPlaceholder: 'Company name',
  notes: 'Note',
  notesPlaceholder: 'Internal note (admin only)',
  save: 'Save',
  saving: 'Saving…',
  saved: 'Saved',
  saveFailed: 'Not saved',
  sampleOffers: 'Latest offers',
  firstSeen: 'First seen',
  sourceGroups: 'Source groups',
  searchRequests: 'Text or name',
  filterType: 'Type',
  allTypes: 'All types',
  requestTypes: { mehsul: 'Product', ekipman: 'Equipment', yer: 'Venue/space', xidmet: 'Service' },
  requestStatuses: { aciq: 'Open', uygunlasdirildi: 'Matched', baglandi: 'Closed' },
  filterDate: 'Date',
  matchesButton: (n) => `Matching suppliers (${n})`,
  noMatches: 'No matching suppliers.',
  noCategories: 'No category detected — matching is not possible.',
  showInSuppliers: 'Show all in suppliers',
  emptyRequests: 'No requests match the filters.',
  emptyRequestsAll: 'No requests yet — import a WhatsApp export above.',
  requester: 'Requested by',
  posted: 'Date',
  notesSaved: 'Note saved',
};

const tr: SupplyCopy = {
  pageTitle: 'Tedarikçiler ve talepler',
  pageSubtitle: 'HoReCa WhatsApp gruplarından toplanan tedarikçi tabanı ve alıcı talepleri.',
  privacyNote:
    'Kişisel veri — yalnızca yönetim panelinde görünür. Tedarikçi açık kataloğa ancak onay verdikten sonra çıkabilir.',
  tabSuppliers: 'Tedarikçiler',
  tabRequests: 'Talepler',
  importToggle: "WhatsApp'tan içe aktar",
  importHide: 'İçe aktarmayı gizle',
  tablesMissingTitle: 'Tablolar henüz oluşturulmadı — migrasyonu çalıştırın',
  tablesMissingBody:
    'Sunucuda "npm run db:migrate" çalıştırın (RUNBOOK §6), ardından sayfayı yenileyin. Analiz migrasyonsuz da çalışır, içe aktarma ise migrasyondan sonra.',
  dbUnavailable: 'Veritabanına erişilemiyor.',
  loadFailed: 'Veriler yüklenemedi.',
  loading: 'Yükleniyor…',
  retry: 'Tekrar dene',
  importTitle: "WhatsApp'tan içe aktar",
  importIntro:
    'WhatsApp\'ta grubu açın → Grup bilgisi → "Sohbeti dışa aktar". Oluşan .zip veya _chat.txt dosyasını seçin. Metin yalnızca sunucuda kurallarla analiz edilir, hiçbir harici AI servisine gönderilmez.',
  fileLabel: 'Dışa aktarma dosyası (.zip veya _chat.txt)',
  chooseFile: 'Dosya seç',
  noFile: 'Dosya seçilmedi',
  fileSelected: (name, size) => `${name} · ${size} MB`,
  groupLabel: 'Kaynak grup adı',
  groupPlaceholder: 'Dosya adından alınır',
  windowLabel: 'Dönem',
  windowOption: (m) => `Son ${m} ay`,
  analyse: 'Analiz et',
  analysing: 'Analiz ediliyor…',
  zipExtracting: "ZIP'ten sohbet dosyası çıkarılıyor…",
  importButton: 'İçe aktar',
  importing: 'İçe aktarılıyor…',
  previewTitle: 'Analiz sonucu',
  previewNoWrite: 'Analiz veritabanına hiçbir şey yazmaz.',
  period: (from, to) => `Dönem: ${from} — ${to}`,
  statMessages: 'Dönemdeki mesaj',
  statSuppliers: 'Tedarikçi',
  statRequests: 'Talep',
  statOffers: 'Teklif mesajı',
  withPhone: (n) => `${n} kişinin telefonu var`,
  newVsExisting: (f, e) => `${f} yeni · ${e} mevcut`,
  classTableTitle: 'Mesaj türleri',
  colClass: 'Tür',
  colMessages: 'Mesaj',
  colUnique: 'Benzersiz',
  classLabels: {
    'techizatci-teklif': 'Tedarikçi teklifi',
    'xidmet-teklif': 'Hizmet teklifi',
    'sorgu:mehsul': 'Talep: ürün',
    'sorgu:ekipman': 'Talep: ekipman',
    'sorgu:devir/yer': 'Talep: mekan/yer',
    'sorgu:xidmet': 'Talep: hizmet',
    ekipman: 'Ekipman satışı',
    icare: 'Kiralama',
    'devir/biznes-satis': 'İşletme satışı/devir',
    vakansiya: 'İş ilanı',
    'is_axtaran(CV)': 'İş arayan',
    'franchise/ortaq': 'Franchise/ortak',
    'qrup-admin': 'Grup yönetimi',
    'sistem/media': 'Sistem/medya',
    'qisa/sohbet': 'Kısa sohbet',
    'sual/muzakire': 'Soru/tartışma',
    diger: 'Diğer',
  },
  categoriesTitle: 'Ürün grupları',
  colSuppliers: 'Tedarikçi',
  colRequests: 'Talep',
  sampleSuppliers: 'Örnek: en son aktif tedarikçiler',
  sampleRequests: 'Örnek: en son talepler',
  phonesCount: (n) => (n ? `${n} telefon` : 'telefon yok'),
  postsCount: (n) => `${n} paylaşım`,
  dbStateTablesMissing:
    'Tablolar yok — yeni/mevcut ayrımı ve içe aktarma migrasyondan sonra çalışacak.',
  dbStateUnavailable: 'Veritabanına erişilemiyor — yalnızca analiz gösteriliyor.',
  importDone: (r) =>
    `İçe aktarma tamamlandı: ${r.suppliersInserted} yeni, ${r.suppliersUpdated} güncellenen tedarikçi; ${r.requestsInserted} yeni talep (${r.requestsSkipped} zaten vardı).`,
  reimportNote:
    'Tekrar içe aktarma güvenlidir: aynı mesaj iki kez sayılmaz, notlar ve durumlar korunur.',
  errors: {
    file_required: 'Dosya seçin.',
    zip_too_large: 'ZIP çok büyük, tarayıcı sohbeti çıkaramadı — _chat.txt dosyasını ayrıca seçin.',
    text_too_large: "Sohbet dosyası 20 MB'tan büyük.",
    body_too_large: 'Dosya çok büyük.',
    zip_not_zip: 'Dosya ZIP veya WhatsApp sohbeti değil.',
    zip_no_chat: "ZIP'te _chat.txt bulunamadı.",
    zip_unsupported: 'Bu ZIP biçimi desteklenmiyor — _chat.txt dosyasını ayrıca seçin.',
    not_whatsapp_export: 'Dosyada WhatsApp mesajı bulunamadı (iOS dışa aktarma biçimi bekleniyor).',
    invalid_fields: 'Alanlar geçersiz.',
    tables_missing: 'Tablolar henüz oluşturulmadı — migrasyonu çalıştırın.',
    db_unavailable: 'Veritabanına erişilemiyor.',
    server_error: 'Sunucu hatası.',
    unauthorized: 'Yönetici girişi gerekli.',
    default: 'Bir hata oluştu.',
  },
  searchSuppliers: 'Ad, şirket veya telefon',
  filterCategory: 'Kategori',
  allCategories: 'Tüm kategoriler',
  filterStatus: 'Durum',
  allStatuses: 'Tüm durumlar',
  filterActivity: 'Aktiflik',
  anyTime: 'Herhangi bir zaman',
  lastMonths: (m) => `Son ${m} ay`,
  hasPhone: 'Telefonu var',
  filterGroup: 'Kaynak grup',
  allGroups: 'Tüm gruplar',
  sortLabel: 'Sıralama',
  sortLastSeen: 'Son aktiflik',
  sortPosts: 'Paylaşım sayısı',
  exportCsv: 'CSV dışa aktar',
  clearFilters: 'Filtreleri sıfırla',
  colSupplier: 'Tedarikçi',
  colCategories: 'Kategoriler',
  colPhones: 'Telefon',
  colLastSeen: 'Son aktiflik',
  colPosts: 'Paylaşım',
  colStatus: 'Durum',
  colConsent: 'Onay',
  supplierStatuses: {
    yeni: 'Yeni',
    elaqe_saxlanildi: 'İletişime geçildi',
    razi: 'Onayladı',
    imtina: 'Reddetti',
  },
  consentLabel: 'Açık katalog onayı',
  consentOn: 'Onaylı',
  consentOff: 'Yok',
  copyPhone: (p) => `${p} — kopyala`,
  copied: 'Kopyalandı',
  callPhone: (p) => `${p} — ara`,
  emptySuppliers: 'Filtreye uyan tedarikçi yok.',
  emptySuppliersAll: 'Henüz tedarikçi yok — yukarıdan WhatsApp dışa aktarımını içe aktarın.',
  summaryTotal: (n) => `${n} tedarikçi`,
  summaryWithPhone: (n) => `${n} telefonlu`,
  summaryConsented: (n) => `${n} onay verdi`,
  resultsCount: (n) => `${n} sonuç`,
  pageInfo: (p, t) => `Sayfa ${p} / ${t}`,
  prev: 'Önceki',
  next: 'Sonraki',
  details: 'Ayrıntılar',
  close: 'Kapat',
  company: 'Şirket',
  companyPlaceholder: 'Şirket adı',
  notes: 'Not',
  notesPlaceholder: 'Dahili not (yalnızca yönetici görür)',
  save: 'Kaydet',
  saving: 'Kaydediliyor…',
  saved: 'Kaydedildi',
  saveFailed: 'Kaydedilemedi',
  sampleOffers: 'Son teklifler',
  firstSeen: 'İlk görülme',
  sourceGroups: 'Kaynak gruplar',
  searchRequests: 'Metin veya ad',
  filterType: 'Tür',
  allTypes: 'Tüm türler',
  requestTypes: { mehsul: 'Ürün', ekipman: 'Ekipman', yer: 'Mekan/yer', xidmet: 'Hizmet' },
  requestStatuses: { aciq: 'Açık', uygunlasdirildi: 'Eşleştirildi', baglandi: 'Kapandı' },
  filterDate: 'Tarih',
  matchesButton: (n) => `Uygun tedarikçiler (${n})`,
  noMatches: 'Uygun tedarikçi bulunamadı.',
  noCategories: 'Kategori belirlenmedi — eşleştirme mümkün değil.',
  showInSuppliers: 'Tümünü tedarikçilerde göster',
  emptyRequests: 'Filtreye uyan talep yok.',
  emptyRequestsAll: 'Henüz talep yok — yukarıdan WhatsApp dışa aktarımını içe aktarın.',
  requester: 'Talep eden',
  posted: 'Tarih',
  notesSaved: 'Not kaydedildi',
};

export const SUPPLY_COPY: Record<Locale, SupplyCopy> = { az, ru, en, tr };
