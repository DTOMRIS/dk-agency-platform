import Link from 'next/link';
import {
  BarChart3, Brain, Compass, FileText, MapPin, TrendingUp,
  Users, Sparkles, ArrowRight, Star, Wrench, Shield,
} from 'lucide-react';
import { getLocale } from 'next-intl/server';
import { normalizeLocale, withLocale } from '@/i18n/config';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Compass, BarChart3, Brain, FileText, MapPin, TrendingUp,
  Users, Sparkles, Star, Wrench, Shield,
};

const tools = [
  { slug: 'lokasyon-analiz', icon: 'MapPin', color: 'bg-emerald-50 text-emerald-600' },
  { slug: 'menyu-analitik', icon: 'BarChart3', color: 'bg-blue-50 text-blue-600' },
  { slug: 'musteri-persona', icon: 'Users', color: 'bg-purple-50 text-purple-600' },
  { slug: 'pl-simulyatoru', icon: 'TrendingUp', color: 'bg-amber-50 text-amber-600' },
  { slug: 'reklam-roi', icon: 'Star', color: 'bg-rose-50 text-rose-600' },
  { slug: 'restoran-audit', icon: 'Shield', color: 'bg-teal-50 text-teal-600' },
  { slug: 'roi-kalkulator', icon: 'BarChart3', color: 'bg-indigo-50 text-indigo-600' },
  { slug: 'sezon-analitikasi', icon: 'TrendingUp', color: 'bg-orange-50 text-orange-600' },
  { slug: 'sikayat-analizi', icon: 'FileText', color: 'bg-red-50 text-red-600' },
  { slug: 'sosial-metrik', icon: 'Sparkles', color: 'bg-pink-50 text-pink-600' },
  { slug: 'trend-analiz', icon: 'Brain', color: 'bg-cyan-50 text-cyan-600' },
];

const TOOL_LABELS: Record<string, { az: string; en: string; ru: string; tr: string }> = {
  'lokasyon-analiz': { az: 'Lokasiya Analizi', en: 'Location Analysis', ru: 'Анализ локации', tr: 'Lokasyon Analizi' },
  'menyu-analitik': { az: 'Menyu Analitikası', en: 'Menu Analytics', ru: 'Аналитика меню', tr: 'Menü Analitiği' },
  'musteri-persona': { az: 'Müştəri Personası', en: 'Customer Persona', ru: 'Персона клиента', tr: 'Müşteri Personası' },
  'pl-simulyatoru': { az: 'P&L Simulyatoru', en: 'P&L Simulator', ru: 'Симулятор P&L', tr: 'P&L Simülatörü' },
  'reklam-roi': { az: 'Reklam ROI', en: 'Ad ROI', ru: 'ROI рекламы', tr: 'Reklam ROI' },
  'restoran-audit': { az: 'Restoran Audit', en: 'Restaurant Audit', ru: 'Аудит ресторана', tr: 'Restoran Denetimi' },
  'roi-kalkulator': { az: 'ROI Kalkulyator', en: 'ROI Calculator', ru: 'Калькулятор ROI', tr: 'ROI Hesaplayıcı' },
  'sezon-analitikasi': { az: 'Sezon Analitikası', en: 'Season Analytics', ru: 'Сезонная аналитика', tr: 'Sezon Analitiği' },
  'sikayat-analizi': { az: 'Şikayət Analizi', en: 'Complaint Analysis', ru: 'Анализ жалоб', tr: 'Şikayet Analizi' },
  'sosial-metrik': { az: 'Sosial Metrik', en: 'Social Metrics', ru: 'Соц. метрики', tr: 'Sosyal Metrik' },
  'trend-analiz': { az: 'Trend Analizi', en: 'Trend Analysis', ru: 'Анализ трендов', tr: 'Trend Analizi' },
};

const PAGE_COPY: Record<string, { title: string; subtitle: string }> = {
  az: { title: 'Marketinq Alətləri', subtitle: 'HoReCa biznesiniz üçün AI dəstəkli analiz və planlaşdırma alətləri.' },
  en: { title: 'Marketing Tools', subtitle: 'AI-powered analytics and planning tools for your HoReCa business.' },
  ru: { title: 'Маркетинговые инструменты', subtitle: 'AI-инструменты аналитики и планирования для вашего HoReCa бизнеса.' },
  tr: { title: 'Pazarlama Araçları', subtitle: 'HoReCa işletmeniz için AI destekli analiz ve planlama araçları.' },
};

export default async function MarketinqIndexPage() {
  const rawLocale = await getLocale();
  const locale = normalizeLocale(rawLocale);
  const copy = PAGE_COPY[locale] ?? PAGE_COPY.az;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
            <Sparkles size={28} className="text-amber-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">{copy.title}</h1>
          <p className="mt-2 text-base text-slate-500">{copy.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = ICON_MAP[tool.icon] || Wrench;
            const label = TOOL_LABELS[tool.slug]?.[locale] ?? tool.slug;
            return (
              <Link
                key={tool.slug}
                href={withLocale(locale, `/marketinq/${tool.slug}`)}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-md"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tool.color}`}>
                  <Icon size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700">{label}</h3>
                </div>
                <ArrowRight size={16} className="text-slate-300 transition group-hover:text-amber-500" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
