// components/blog/BlogElements.tsx
// TQTA Blog v4 — Əlavə UI Elementləri
// Warning box, checklist, reading time, section divider

import React from 'react';

// ═══════════════════════════════════════════════════════════════
// XƏBƏRDARLIQ QUTUSU
// ═══════════════════════════════════════════════════════════════
interface WarningBoxProps {
  title?: string;
  children: React.ReactNode;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

export function WarningBox({ title, children, type = 'warning' }: WarningBoxProps) {
  const types = {
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: '🚨',
      iconBg: 'bg-red-100',
      titleColor: 'text-red-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: '⚠️',
      iconBg: 'bg-amber-100',
      titleColor: 'text-amber-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'ℹ️',
      iconBg: 'bg-blue-100',
      titleColor: 'text-blue-700',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: '✅',
      iconBg: 'bg-green-100',
      titleColor: 'text-green-700',
    },
  };

  const t = types[type];

  return (
    <div className={`my-6 p-5 rounded-xl ${t.bg} border ${t.border}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg ${t.iconBg} flex items-center justify-center text-xl shrink-0`}>
          {t.icon}
        </div>
        <div>
          {title && (
            <h4 className={`font-bold ${t.titleColor} mb-2`}>{title}</h4>
          )}
          <div className="text-slate-700 text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CHECKLIST
// ═══════════════════════════════════════════════════════════════
interface ChecklistItem {
  text: string;
  done?: boolean;
  critical?: boolean;
}

interface ChecklistProps {
  title: string;
  items: ChecklistItem[];
  description?: string;
}

export function Checklist({ title, items, description }: ChecklistProps) {
  return (
    <div className="my-8 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <h4 className="font-bold text-slate-800">{title}</h4>
            {description && (
              <p className="text-slate-500 text-sm mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-5">
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li 
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                item.critical ? 'bg-red-50 border border-red-200' : 'bg-slate-50'
              }`}
            >
              <span className={`mt-0.5 ${item.done ? 'text-green-600' : 'text-slate-400'}`}>
                {item.done ? '✓' : '○'}
              </span>
              <span className={`text-sm ${
                item.critical ? 'text-red-700 font-medium' : 'text-slate-700'
              }`}>
                {item.text}
                {item.critical && (
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                    Kritik
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// OXU MÜDDƏTİ
// ═══════════════════════════════════════════════════════════════
interface ReadingTimeProps {
  wordCount: number;
  // Azərbaycan restoran sahibkarları üçün 160 söz/dəq
  wordsPerMinute?: number;
}

export function ReadingTime({ wordCount, wordsPerMinute = 160 }: ReadingTimeProps) {
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  return (
    <span className="inline-flex items-center gap-1 text-slate-600 text-sm">
      <span>⏱️</span>
      <span>{minutes} dəqiqə oxu</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// BÖLMƏ AYIRICI
// ═══════════════════════════════════════════════════════════════
export function SectionDivider() {
  return (
    <div className="my-10 flex items-center justify-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-300" />
      <div className="flex gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="w-2 h-2 rounded-full bg-amber-300" />
        <span className="w-2 h-2 rounded-full bg-amber-400" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-300" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// XÜLASƏ CƏDVƏL
// ═══════════════════════════════════════════════════════════════
interface SummaryTableRow {
  label: string;
  min: string;
  max: string;
  note?: string;
}

interface SummaryTableProps {
  title: string;
  rows: SummaryTableRow[];
  totalLabel?: string;
}

export function SummaryTable({ title, rows, totalLabel = 'TOPLAM' }: SummaryTableProps) {
  return (
    <div className="my-8 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <span>📊</span> {title}
        </h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-4 text-slate-600 font-medium">Maddə</th>
              <th className="text-right p-4 text-slate-600 font-medium">Minimum</th>
              <th className="text-right p-4 text-slate-600 font-medium">Maksimum</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-slate-100">
                <td className="p-4 text-slate-700">
                  {row.label}
                  {row.note && (
                    <span className="block text-xs text-slate-500 mt-1">{row.note}</span>
                  )}
                </td>
                <td className="p-4 text-right text-amber-600 font-mono font-semibold">{row.min}</td>
                <td className="p-4 text-right text-amber-600 font-mono font-semibold">{row.max}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-amber-50 border-t-2 border-amber-300">
              <td className="p-4 font-bold text-slate-800">{totalLabel}</td>
              <td className="p-4 text-right font-bold text-amber-700 font-mono">
                {rows.reduce((sum, row) => sum + parseFloat(row.min.replace(/[^0-9.-]/g, '')) || 0, 0).toLocaleString()}₼
              </td>
              <td className="p-4 text-right font-bold text-amber-700 font-mono">
                {rows.reduce((sum, row) => sum + parseFloat(row.max.replace(/[^0-9.-]/g, '')) || 0, 0).toLocaleString()}₼
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// KATEQORİYA BADGE
// ═══════════════════════════════════════════════════════════════
interface CategoryBadgeProps {
  category: 'maliyye' | 'kadr' | 'emeliyyat' | 'konsept' | 'acilis' | 'satis';
}

const categoryConfig = {
  maliyye: { emoji: '💰', label: 'Maliyyə', color: 'bg-green-100 text-green-700 border-green-200' },
  kadr: { emoji: '👥', label: 'Kadr', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  emeliyyat: { emoji: '🔧', label: 'Əməliyyat', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  konsept: { emoji: '🎨', label: 'Konsept', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  acilis: { emoji: '🏗️', label: 'Açılış', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  satis: { emoji: '📈', label: 'Satış', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config?.color || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      <span>{config?.emoji || '📝'}</span>
      <span>{config?.label || 'Digər'}</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// DÜELLO FORMATI
// ═══════════════════════════════════════════════════════════════
interface DuelloProps {
  leftTitle: string;
  leftContent: string;
  rightTitle: string;
  rightContent: string;
  verdict: string;
}

export function Duello({ leftTitle, leftContent, rightTitle, rightContent, verdict }: DuelloProps) {
  return (
    <div className="my-8">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔴</span>
            <h4 className="font-bold text-red-700">{leftTitle}</h4>
          </div>
          <p className="text-slate-700 text-sm">{leftContent}</p>
        </div>
        <div className="p-5 rounded-xl bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🟢</span>
            <h4 className="font-bold text-green-700">{rightTitle}</h4>
          </div>
          <p className="text-slate-700 text-sm">{rightContent}</p>
        </div>
      </div>
      <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚖️</span>
          <span className="font-bold text-amber-700">Verdikt:</span>
        </div>
        <p className="text-slate-700 text-sm mt-2">{verdict}</p>
      </div>
    </div>
  );
}
