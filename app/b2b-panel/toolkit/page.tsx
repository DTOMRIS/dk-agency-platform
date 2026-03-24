// app/b2b-panel/toolkit/page.tsx
// DK Agency - B2B Portal - 8 Klinik Toolkit Modülü
// Tomris & DK Agency dokümanlarına dayalı profesyonel araçlar

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calculator, Users, Megaphone,
  FileCheck, DollarSign, Award, Package,
  Play, Sparkles, ChevronRight,
  BarChart3, Clock, Target, Shield
} from 'lucide-react';

interface ToolkitModule {
  id: string;
  name: string;
  nameAz: string;
  description: string;
  source: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  gradient: string;
  features: string[];
  href: string;
  status: 'active' | 'coming';
}

const TOOLKIT_MODULES: ToolkitModule[] = [
  {
    id: 'pnl-simulator',
    name: 'P&L Simulyatoru',
    nameAz: 'Mənfəət-Zərər Simulyatoru',
    description: 'Detaylı gelir-gider analizi, maliyet kontrolü ve kârlılık projeksiyonları',
    source: 'muhasebeprosedur.doc',
    icon: Calculator,
    color: 'text-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    features: ['Gelir Tahminleme', 'Gider Kategorileri', 'Brüt/Net Kar Analizi', 'Aylık Projeksiyon'],
    href: '/b2b-panel/toolkit/pnl-simulator',
    status: 'active',
  },
  {
    id: 'operational-audit',
    name: 'Operasyonel Audit & KST',
    nameAz: 'Operasional Audit & KST',
    description: 'Kalite standartları takibi, operasyon el kitabı metrikleri ve denetim puanlama',
    source: "Heb's Operasyon El Kitabı",
    icon: FileCheck,
    color: 'text-green-500',
    gradient: 'from-green-500 to-emerald-600',
    features: ['Hijyen Kontrolü', 'Servis Kalitesi', 'Stok Yönetimi', 'Müşteri Memnuniyeti'],
    href: '/b2b-panel/toolkit/operational-audit',
    status: 'active',
  },
  {
    id: 'workforce-management',
    name: 'İşçi Heyəti & Vardiya',
    nameAz: 'İşçi Heyəti & Vardiya Menecmenti',
    description: 'Personel planlaması, vardiya optimizasyonu ve iş gücü maliyet analizi',
    source: 'Şube Müdürü Vardiya Yönetimi 2025',
    icon: Users,
    color: 'text-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    features: ['Vardiya Planlama', 'Maliyet/Saat', 'Performans İzleme', 'Overtime Takibi'],
    href: '/b2b-panel/toolkit/workforce',
    status: 'active',
  },
  {
    id: 'lsm-planner',
    name: 'LSM Planlayıcı',
    nameAz: 'Yerli Marketinq Planlayıcı',
    description: 'Yerel pazarlama stratejileri, kampanya planlaması ve ROI ölçümü',
    source: 'Marketinq Əl Kitabı 2023',
    icon: Megaphone,
    color: 'text-pink-500',
    gradient: 'from-pink-500 to-rose-600',
    features: ['Kampanya Takvimi', 'Bütçe Dağılımı', 'Kanal Performansı', 'Müşteri Edinme'],
    href: '/b2b-panel/toolkit/lsm-planner',
    status: 'active',
  },
  {
    id: 'franchise-readiness',
    name: 'Franchise Hazırlık Testi',
    nameAz: 'Franchise Uyğunluq Testi',
    description: 'Franchise vermeye hazırlık değerlendirmesi ve uygunluk skoru',
    source: 'FA1-Franchise Danışmanlığı',
    icon: Shield,
    color: 'text-amber-500',
    gradient: 'from-amber-500 to-orange-600',
    features: ['Marka Hazırlığı', 'Operasyon Standardı', 'Finansal Güç', 'Destek Kapasitesi'],
    href: '/b2b-panel/toolkit/franchise-readiness',
    status: 'active',
  },
  {
    id: 'financial-health',
    name: 'Maliyyə Sağlamlıq',
    nameAz: 'Maliyyə Sağlamlıq & ROI Analizi',
    description: 'Finansal sağlık göstergeleri, yatırım getirisi ve nakit akış analizi',
    source: 'Otel Biznesində Maliyyə İdarəetməsi',
    icon: DollarSign,
    color: 'text-emerald-500',
    gradient: 'from-emerald-500 to-teal-600',
    features: ['ROI Hesaplama', 'Nakit Akışı', 'Borç/Özkaynak', 'Break-even'],
    href: '/b2b-panel/toolkit/financial-health',
    status: 'active',
  },
  {
    id: 'talent-up',
    name: 'Talent-Up',
    nameAz: 'Talent-Up / Performans Ölçer',
    description: 'Çalışan performans değerlendirmesi, yetenek haritası ve eğitim takibi',
    source: 'BOC Eğitimi El Kitabı',
    icon: Award,
    color: 'text-indigo-500',
    gradient: 'from-indigo-500 to-violet-600',
    features: ['360° Değerlendirme', 'Yetkinlik Matrisi', 'Eğitim Takibi', 'Kariyer Planı'],
    href: '/b2b-panel/toolkit/talent-up',
    status: 'coming',
  },
  {
    id: 'inventory-control',
    name: 'İnventar Nəzarəti',
    nameAz: 'İnventar & Zayiat Nəzarəti',
    description: 'Stok yönetimi, fire/zayi takibi ve envanter optimizasyonu',
    source: 'muhasebeprosedur.doc - Envanter',
    icon: Package,
    color: 'text-cyan-500',
    gradient: 'from-cyan-500 to-sky-600',
    features: ['Stok Seviyesi', 'Fire Oranı', 'FIFO/LIFO', 'Sipariş Noktası'],
    href: '/b2b-panel/toolkit/inventory',
    status: 'coming',
  },
];

export default function ToolkitPage() {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  const activeModules = TOOLKIT_MODULES.filter(m => m.status === 'active');
  const comingModules = TOOLKIT_MODULES.filter(m => m.status === 'coming');

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Klinik Toolkit</h1>
            <p className="text-gray-500 text-sm">8 Profesyonel Analiz Modülü</p>
          </div>
        </div>
        <p className="text-gray-600 mt-4 max-w-2xl">
          Tomris ve DK Agency dokümanlarına dayalı, HORECA sektörüne özel geliştirilmiş 
          profesyonel analiz ve yönetim araçları.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BarChart3 size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-xs text-gray-500">Modül</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Play size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">6</p>
              <p className="text-xs text-gray-500">Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-xs text-gray-500">Yakında</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Target size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">32</p>
              <p className="text-xs text-gray-500">Özellik</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Modules Grid */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Play size={18} className="text-green-500" />
          Aktif Modüller
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeModules.map((module) => {
            const Icon = module.icon;
            const isHovered = hoveredModule === module.id;

            return (
              <Link
                key={module.id}
                href={module.href}
                onMouseEnter={() => setHoveredModule(module.id)}
                onMouseLeave={() => setHoveredModule(null)}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
              >
                {/* Header */}
                <div className={`p-5 bg-gradient-to-r ${module.gradient} relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative flex items-start justify-between">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                      <Icon size={28} className="text-white" />
                    </div>
                    <span className="px-2 py-1 bg-white/20 backdrop-blur text-white text-[10px] font-bold rounded-lg uppercase">
                      Active
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-4">{module.name}</h3>
                  <p className="text-white/70 text-xs mt-1">{module.nameAz}</p>
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{module.description}</p>
                  
                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {module.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${module.gradient}`}></div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Source */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Kaynak: {module.source}
                    </span>
                    <div className={`
                      flex items-center gap-1 text-sm font-semibold transition-all
                      ${isHovered ? 'text-red-600 translate-x-0' : 'text-gray-400 -translate-x-2 opacity-0'}
                    `}>
                      Başlat <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Coming Soon */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-amber-500" />
          Yakında
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {comingModules.map((module) => {
            const Icon = module.icon;

            return (
              <div
                key={module.id}
                className="bg-white/60 rounded-2xl border border-dashed border-gray-200 p-6 opacity-70"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${module.gradient} opacity-50 flex items-center justify-center`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-700">{module.name}</h3>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg">
                        Yakında
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{module.nameAz}</p>
                    <p className="text-sm text-gray-500 mt-2">{module.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Integration CTA */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Sparkles size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-1">Almila AI Entegrasyonu</h3>
              <p className="text-gray-400 max-w-md">
                Tüm toolkit modüllerinde AI destekli analiz ve öneriler. 
                Yatırım kararlarınızı veriye dayalı alın.
              </p>
            </div>
          </div>
          <Link
            href="/b2b-panel/yeni-ilan"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-900 px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/30 whitespace-nowrap"
          >
            <Sparkles size={18} />
            AI Analizi İste
          </Link>
        </div>
      </div>
    </div>
  );
}
