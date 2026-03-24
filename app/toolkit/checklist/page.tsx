'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Circle, ArrowLeft, Download, ChevronDown, ChevronUp } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  detail?: string;
}

interface ChecklistSection {
  title: string;
  emoji: string;
  items: ChecklistItem[];
}

const CHECKLIST_DATA: ChecklistSection[] = [
  {
    title: 'Hüquqi və Rəsmi İşlər',
    emoji: '\uD83D\uDCCB',
    items: [
      { id: 'h1', text: 'VÖEN alınması (Vergilər Nazirliyi)', detail: 'Fərdi sahibkar və ya MMC qeydiyyatı' },
      { id: 'h2', text: 'AQTA icazəsi (qida təhlükəsizliyi)', detail: 'Ərizə + plan + gigiyena sertifikatı' },
      { id: 'h3', text: 'Yanğın təhlükəsizliyi aktı (FHN)', detail: 'Yanğınsöndürmə sistemi quraşdırılmalı' },
      { id: 'h4', text: 'SES (Sanitariya-Epidemioloji) rəyi' },
      { id: 'h5', text: 'İcra Hakimiyyəti razılığı (reklam lövhəsi)' },
      { id: 'h6', text: 'Əmək müqavilələri (işçilərlə)' },
      { id: 'h7', text: 'Kassa aparatı qeydiyyatı' },
    ],
  },
  {
    title: 'Mekan və İnşaat',
    emoji: '\uD83C\uDFD7\uFE0F',
    items: [
      { id: 'm1', text: 'Mekan seçimi (lokasiya analizi)', detail: 'Piyada trafiki, rəqib xəritəsi, icarə şərtləri' },
      { id: 'm2', text: 'İcarə müqaviləsi imzalanması' },
      { id: 'm3', text: 'Memariyyət planı (layout)', detail: 'Mətbəx, salon, anbar, tualet — axın sxemi' },
      { id: 'm4', text: 'İnşaat / təmir işləri' },
      { id: 'm5', text: 'Ventilyasiya sistemi', detail: 'Mətbəx hood + salon hava dövranı' },
      { id: 'm6', text: 'Elektrik və su infrastrukturu' },
      { id: 'm7', text: 'Mebel və dekorasiya' },
    ],
  },
  {
    title: 'Mətbəx və Avadanlıq',
    emoji: '\uD83C\uDF73',
    items: [
      { id: 'a1', text: 'Əsas avadanlıq siyahısı', detail: 'Soba, soyuducu, frizər, grill, fryer...' },
      { id: 'a2', text: 'Kiçik avadanlıqlar (blender, terazi, bıçaq dəsti)' },
      { id: 'a3', text: 'Qab-qacaq (boşqab, stəkan, çəngəl-bıçaq)' },
      { id: 'a4', text: 'POS sistemi / kassa proqramı' },
      { id: 'a5', text: 'Anbar rəfləri + saxlama qabları' },
    ],
  },
  {
    title: 'Menyu və Təchizat',
    emoji: '\uD83D\uDCDD',
    items: [
      { id: 'mn1', text: 'Menyu konsepti (target auditoriya uyğun)', detail: 'Qiymət aralığı, porsiya ölçüsü, food cost hədəfi' },
      { id: 'mn2', text: 'Resept kartları hazırlanması', detail: 'Hər yeməyin ərzaq siyahısı + miqdar + maya dəyəri' },
      { id: 'mn3', text: 'Food cost hesablaması (hər porsiya)' },
      { id: 'mn4', text: 'Təchizatçı müqavilələri (ət, tərəvəz, içki)' },
      { id: 'mn5', text: 'Menyu dizaynı və çapı' },
      { id: 'mn6', text: 'Qiymət siyasəti (markup strategiyası)' },
    ],
  },
  {
    title: 'Kadr və Təlim',
    emoji: '\uD83D\uDC65',
    items: [
      { id: 'k1', text: 'Baş aşpaz işə qəbul' },
      { id: 'k2', text: 'Ofisiant heyəti (salon müdiri dahil)' },
      { id: 'k3', text: 'Mətbəx köməkçiləri' },
      { id: 'k4', text: 'Təmizlik heyəti' },
      { id: 'k5', text: 'Təlim proqramı (xidmət standartları)', detail: 'Qarşılama, sifariş alma, şikayət idarəsi' },
      { id: 'k6', text: 'Gigiyena təlimi (AQTA tələbi)' },
    ],
  },
  {
    title: 'Marketinq və Açılış',
    emoji: '\uD83D\uDE80',
    items: [
      { id: 'mr1', text: 'Brend identifikasiyası (logo, rəng, font)' },
      { id: 'mr2', text: 'Sosial media hesabları (Instagram, TikTok)' },
      { id: 'mr3', text: 'Google Maps / Yandex qeydiyyatı' },
      { id: 'mr4', text: 'Açılış tarixi təyini' },
      { id: 'mr5', text: 'Soft opening (dəvətli test)', detail: 'Dostlar + ailə ilə 2-3 gün sınaq' },
      { id: 'mr6', text: 'Grand opening kampaniyası' },
      { id: 'mr7', text: 'Wolt / Bolt Food qeydiyyatı' },
    ],
  },
  {
    title: 'Maliyyə',
    emoji: '\uD83D\uDCB0',
    items: [
      { id: 'f1', text: 'Başlanğıc büdcə planı', detail: 'İnşaat + avadanlıq + ilk 3 ay əməliyyat xərci' },
      { id: 'f2', text: 'Başabaş nöqtəsi hesablaması (break-even)' },
      { id: 'f3', text: 'Aylıq P&L şablonu hazırlanması' },
      { id: 'f4', text: 'Bank hesabı açılması' },
      { id: 'f5', text: 'Mühasibat xidməti / proqramı' },
    ],
  },
];

export default function ChecklistPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1]));

  const totalItems = CHECKLIST_DATA.reduce((sum, s) => sum + s.items.length, 0);
  const checkedCount = checked.size;
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-20">
      {/* Header */}
      <div className="bg-slate-950 py-16 text-white">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/toolkit" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Toolkit
          </Link>
          <h1 className="text-4xl font-display font-black tracking-tighter mb-4">
            Restoran Acilis Checklist
          </h1>
          <p className="text-slate-400 text-lg">
            Restoran acmaq ucun lazim olan butun addimlar — huquqi, maliyye, menyudan marketinqe qeder.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-700">{checkedCount} / {totalItems} tamamlandi</span>
            <span className="text-sm font-black text-brand-red">{progress}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-red rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-4 mt-8 space-y-4">
        {CHECKLIST_DATA.map((section, sIdx) => {
          const sectionChecked = section.items.filter(i => checked.has(i.id)).length;
          const isExpanded = expandedSections.has(sIdx);
          const isComplete = sectionChecked === section.items.length;

          return (
            <div key={sIdx} className={`bg-white rounded-2xl border transition-colors ${isComplete ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => toggleSection(sIdx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.emoji}</span>
                  <div>
                    <h2 className="font-bold text-slate-900">{section.title}</h2>
                    <p className="text-xs text-slate-400">{sectionChecked}/{section.items.length} tamamlandi</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-1">
                  {section.items.map((item) => {
                    const isDone = checked.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggle(item.id)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${isDone ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                      >
                        {isDone
                          ? <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          : <Circle size={20} className="text-slate-300 flex-shrink-0 mt-0.5" />
                        }
                        <div>
                          <span className={`text-sm font-medium ${isDone ? 'text-emerald-700 line-through' : 'text-slate-800'}`}>
                            {item.text}
                          </span>
                          {item.detail && (
                            <p className="text-xs text-slate-400 mt-0.5">{item.detail}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
