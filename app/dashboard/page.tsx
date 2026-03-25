import Link from 'next/link';
import {
  Newspaper,
  Building2,
  FileText,
  TrendingUp,
  MessageSquare,
  Clock,
  Shield,
  Sparkles,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

const stats = [
  { label: 'Kontent planı', value: '24', change: '+3', icon: Newspaper, color: 'bg-red-100 text-red-600' },
  { label: 'B2B partnyorlar', value: '12', change: '+2', icon: Building2, color: 'bg-blue-100 text-blue-600' },
  { label: 'Aktiv elanlar', value: '8', change: '+1', icon: FileText, color: 'bg-green-100 text-green-600' },
  { label: 'Pipeline deal-lər', value: '15', change: '+5', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
];

const approvals = [
  { title: 'Yeni devir elanı: Sumqayıt restoranı', owner: 'Can Investments', age: '2 saat əvvəl', priority: 'Yüksək' },
  { title: 'B2B partner başvurusu', owner: 'Azer Food Group', age: '4 saat əvvəl', priority: 'Orta' },
  { title: 'HORECA sektor raportu 2026', owner: 'Redaksiya', age: '6 saat əvvəl', priority: 'Aşağı' },
];

const messages = [
  { from: 'Caspian Hotels', subject: 'İnvestisiya görüşü üçün slot', age: '30 dəq əvvəl' },
  { from: 'Azer Food Group', subject: 'Partnyorluq detalları', age: '2 saat əvvəl' },
  { from: 'GP Restaurants', subject: 'Due diligence sənədləri', age: '5 saat əvvəl' },
];

const quickActions = [
  { href: '/dashboard/haberler', label: 'Kontenti idarə et' },
  { href: '/dashboard/ilan-onaylari', label: 'İlan onaylarını aç' },
  { href: '/dashboard/pipeline', label: 'Pipeline görünüşü' },
  { href: '/dashboard/raporlar', label: 'Raporları yoxla' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">DK Agency Admin</h1>
            <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 px-3 py-1 text-xs font-bold text-white shadow-lg">
              <Shield size={12} />
              GOD MODE
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Kontent, B2B ekosistem, onaylar və pipeline üçün vahid idarəetmə mərkəzi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/pipeline"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <BarChart3 size={16} />
            Pipeline
          </Link>
          <Link
            href="/dashboard/ilan-onaylari"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            <Zap size={16} />
            Sürətli baxış
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-lg">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                <Icon size={24} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              <p className="mt-2 text-xs font-medium text-green-600">{stat.change} bu həftə</p>
            </div>
          );
        })}
      </div>

      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Bugünkü idarəetmə fokusu</h2>
              <p className="text-xs text-gray-500">Ən vacib 3 xətt: onay, pipeline, kontent ritmi</p>
            </div>
          </div>
          <Link href="/dashboard/pipeline" className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700">
            Tam görünüş <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-amber-700">
              <Clock size={16} />
              <span className="text-sm font-bold">3 gözləyən onay</span>
            </div>
            <p className="text-sm text-amber-800/80">
              Yeni elanlar və partner başvuruları bu gün cavablanmalıdır.
            </p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-blue-700">
              <MessageSquare size={16} />
              <span className="text-sm font-bold">5 oxunmamış mesaj</span>
            </div>
            <p className="text-sm text-blue-800/80">
              2-si deal flow ilə bağlıdır, prioritet cavab tələb edir.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={16} />
              <span className="text-sm font-bold">Kontent ritmi normaldır</span>
            </div>
            <p className="text-sm text-emerald-800/80">
              Xəbər axını işləyir, əsas ehtiyac redaksiya keyfiyyət nəzarətidir.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-amber-600" />
              <h2 className="font-bold text-gray-900">Gözləyən onaylar</h2>
            </div>
            <Link href="/dashboard/ilan-onaylari" className="text-sm font-medium text-amber-600 hover:text-amber-700">
              Hamısı
            </Link>
          </div>
          <div className="space-y-3">
            {approvals.map((item) => (
              <div key={item.title} className="rounded-xl bg-gray-50 p-4">
                <p className="mb-1 text-sm font-semibold text-gray-900">{item.title}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{item.owner}</span>
                  <span>{item.age}</span>
                </div>
                <div className="mt-3 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  Prioritet: {item.priority}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-600" />
              <h2 className="font-bold text-gray-900">Mesaj axını</h2>
            </div>
            <Link href="/dashboard/mesajlar" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Hamısı
            </Link>
          </div>
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.subject} className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{message.from}</p>
                <p className="mt-1 text-sm text-gray-600">{message.subject}</p>
                <p className="mt-2 text-xs text-gray-500">{message.age}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                <Sparkles size={16} />
              </div>
              <h2 className="font-bold text-purple-900">Almila AI içgörüləri</h2>
            </div>
            <div className="space-y-3 text-sm text-purple-900/80">
              <div className="rounded-lg bg-white/70 p-3">HORECA trend axınında “əməliyyat səmərəliliyi” teması yüksəlir.</div>
              <div className="rounded-lg bg-white/70 p-3">Food cost və delivery marjası məzmunu daha çox lead gətirir.</div>
              <div className="rounded-lg bg-white/70 p-3">AQTA və compliance mövzularında ayrıca lead magnet açmaq lazımdır.</div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-gray-900">Sürətli keçidlər</h2>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  {action.label}
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="mb-2 flex items-center gap-2 text-red-700">
              <AlertTriangle size={18} />
              <h2 className="font-bold">Admin qərarı</h2>
            </div>
            <p className="text-sm text-red-800/80">
              `/dashboard` DK Agency admin mərkəzidir. `/b2b-panel` isə istifadəçi/sahibkar portalı
              olaraq qalmalıdır. İkisini qarışdırmaq olmaz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
