/**
 * @file toolkit-catalog.ts
 * @purpose News → Toolkit eşləşdirmə üçün SSOT kataloqun kiçik həriti.
 * URL slug-ları /toolkit/[slug] route-larından gəlir (marketing-tools-config.ts-dən deyil).
 * DeepSeek agent bu siyahıdan seçir — xaricində heç nə qəbul edilmir.
 */

export interface ToolkitEntry {
  slug: string;
  label: string;
  icon: string;
  description: string; // DeepSeek-ə verilir ki doğru seçsin
}

export const TOOLKIT_CATALOG: ToolkitEntry[] = [
  { slug: 'food-cost', label: 'Food Cost Kalkulyatoru', icon: '💰', description: 'Yeməyin maya dəyəri, porsiya xərci, hədəf marja hesablama' },
  { slug: 'pnl', label: 'P&L Simulyatoru', icon: '📊', description: 'Gəlir-xərc simulyasiyası, aylıq mənfəət modelləmə' },
  { slug: 'pnl-simulator', label: 'P&L Simulator', icon: '📈', description: 'Ssenari əsaslı P&L proqnozlaşdırma' },
  { slug: 'menu-matrix', label: 'Menyu Matrisi', icon: '🍽️', description: 'Menyu mühəndisliyi, ulduz/problem yeməklər, qiymətləndirmə' },
  { slug: 'basabas', label: 'Başabaş Kalkulyatoru', icon: '⚖️', description: 'Başabaş nöqtəsi, sabit/dəyişən xərclər, gündəlik hədəf' },
  { slug: 'staff-retention', label: 'İşçi Saxlama', icon: '👥', description: 'Kadr axını, işçi məmnuniyyəti, saxlama strategiyası' },
  { slug: 'checklist', label: 'Açılış Checklisti', icon: '✅', description: 'Restoran açılışı üçün tam yoxlama siyahısı' },
  { slug: 'aqta-checklist', label: 'AQTA Hazırlıq', icon: '🏥', description: 'AQTA yoxlaması üçün gigiyena hazırlığı' },
  { slug: 'delivery-calc', label: 'Delivery Kalkulyatoru', icon: '🚚', description: 'Çatdırılma xərci, komisyon, mənfəət hesabı' },
  { slug: 'branding-guide', label: 'Markalaşma Bələdçisi', icon: '🎨', description: 'Restoran brendi, vizual identitet, ad seçimi' },
  { slug: 'insaat-checklist', label: 'İnşaat Checklisti', icon: '🏗️', description: 'Restoran tikintisi, icazələr, avadanlıq planlaşdırma' },
  { slug: 'personel-planlayici', label: 'Personal Planlayıcı', icon: '📋', description: 'Növbə planlaması, işçi sayısı, əmək haqqı xərci' },
  { slug: 'metbex-istasyon', label: 'Mətbəx İstasyon', icon: '🍳', description: 'Mətbəx iş stansiyaları, axın planlaması' },
  { slug: 'otel-hazirlig-testi', label: 'Otel Hazırlıq Testi', icon: '🏨', description: 'Otel açılış hazırlığı testi' },
  { slug: 'ota-hazirlig-testi', label: 'OTA Hazırlıq Testi', icon: '🌐', description: 'Online turizm agentliyi hazırlığı' },
  { slug: 'qonaq-evi-roi-kalkulyatoru', label: 'Qonaq Evi ROI', icon: '🏠', description: 'Qonaq evi investisiya geri dönüşü' },
  { slug: 'whatsapp-template-paketi', label: 'WhatsApp Şablon', icon: '💬', description: 'Müştəri ünsiyyəti üçün WhatsApp şablonları' },
];

const VALID_SLUGS = new Set(TOOLKIT_CATALOG.map((t) => t.slug));

/** Validate and filter toolkit slugs — drop any not in catalog */
export function validateToolkitSlugs(slugs: unknown): string[] {
  if (!Array.isArray(slugs)) return [];
  return slugs.filter((s): s is string => typeof s === 'string' && VALID_SLUGS.has(s)).slice(0, 3);
}

/** Get toolkit entries by slugs */
export function getToolkitEntries(slugs: string[]): ToolkitEntry[] {
  return slugs
    .map((s) => TOOLKIT_CATALOG.find((t) => t.slug === s))
    .filter((t): t is ToolkitEntry => !!t);
}

/** Build DeepSeek prompt catalog (id — description) */
export function buildToolkitPromptCatalog(): string {
  return TOOLKIT_CATALOG.map((t) => `${t.slug} — ${t.description}`).join('\n');
}
