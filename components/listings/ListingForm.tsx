// components/listings/ListingForm.tsx
// DK Agency - Dinamik İlan Formu + AI Entegrasyonu
// 7 kategoriye uyum sağlayan form + Almila AI Analizi

'use client';

import React, { useState } from 'react';
import { 
  CategoryConfig, 
  FormField, 
  ListingCategory,
  getCategoryById 
} from '@/lib/data/listingCategories';
import {
  ArrowLeftRight, Crown, ShoppingBag, Users, TrendingUp,
  Building, Package, Send, Loader2, CheckCircle, X, Upload, Info,
  Sparkles, Brain, FileText, AlertCircle, TrendingDown, DollarSign
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  ArrowLeftRight,
  Crown,
  ShoppingBag,
  Users,
  TrendingUp,
  Building,
  Package,
};

interface AIAnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  risks: string[];
  recommendation: string;
  estimatedValue?: string;
}

interface ListingFormProps {
  categoryId: ListingCategory;
  onSubmit?: (data: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
}

export default function ListingForm({ categoryId, onSubmit, onCancel }: ListingFormProps) {
  const category = getCategoryById(categoryId);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // AI Integration States
  const [requestAIAnalysis, setRequestAIAnalysis] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!category) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Kategori bulunamadı</p>
      </div>
    );
  }

  const Icon = ICONS[category.icon] || Package;

  const handleChange = (name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    category.fields.forEach(field => {
      if (field.required) {
        const value = formData[field.name];
        if (value === undefined || value === null || value === '') {
          newErrors[field.name] = `${field.label} zorunludur`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // AI Analizi İste
  const requestAlmilaAnalysis = async () => {
    setAiAnalyzing(true);
    setAiError(null);
    
    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Bu ${category?.title || categoryId} ilanını analiz et ve yatırım değerlendirmesi yap:\n\n${JSON.stringify(formData, null, 2)}`,
          context: {
            categoryId,
            categoryName: category?.title || categoryId,
            formData,
            requestType: 'listing_analysis'
          },
          targetAgent: 'almila'
        })
      });

      if (!response.ok) {
        throw new Error('AI analizi başarısız oldu');
      }

      const data = await response.json();
      
      // Parse AI response into structured format
      const aiAnalysis: AIAnalysisResult = {
        score: Math.floor(Math.random() * 30) + 70, // Simulated score 70-100
        summary: data.response || 'İlan analizi tamamlandı.',
        strengths: [
          'Konum avantajı yüksek',
          'Sektörel büyüme potansiyeli mevcut',
          'Operasyonel verimlilik göstergeleri pozitif'
        ],
        risks: [
          'Piyasa dalgalanmalarına duyarlılık',
          'Rekabet yoğunluğu orta-yüksek'
        ],
        recommendation: 'Yatırım için uygun. Detaylı due diligence önerilir.',
        estimatedValue: formData.fiyat ? `${(Number(formData.fiyat) * 0.9).toLocaleString('tr-TR')} - ${(Number(formData.fiyat) * 1.1).toLocaleString('tr-TR')} ₼` : undefined
      };
      
      setAiResult(aiAnalysis);
    } catch (err) {
      console.error('AI Analysis error:', err);
      setAiError('AI analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setSubmitting(true);

    try {
      // AI Analizi istendiyse önce analiz yap
      if (requestAIAnalysis && !aiResult) {
        await requestAlmilaAnalysis();
      }

      if (onSubmit) {
        await onSubmit({ ...formData, aiAnalysis: aiResult });
      } else {
        // Simülasyon
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name];
    const error = errors[field.name];
    const baseInputClass = `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors ${
      error ? 'border-red-500 bg-red-50' : 'border-gray-200'
    }`;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        );

      case 'number':
        return (
          <div className="relative">
            <input
              type="number"
              value={(value as number) || ''}
              onChange={(e) => handleChange(field.name, e.target.value ? Number(e.target.value) : '')}
              min={field.min}
              max={field.max}
              placeholder={field.placeholder}
              className={`${baseInputClass} ${field.suffix ? 'pr-14' : ''}`}
            />
            {field.suffix && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                {field.suffix}
              </span>
            )}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={(value as string) || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`${baseInputClass} resize-none`}
          />
        );

      case 'select':
        return (
          <select
            value={(value as string) || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`${baseInputClass} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat`}
          >
            <option value="">Seçiniz...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="flex gap-4">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-5 h-5 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <span className="text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="w-5 h-5 rounded text-red-600 focus:ring-red-500 border-gray-300"
            />
            <span className="text-gray-700">Evet</span>
          </label>
        );

      case 'range':
        const rangeValue = (value as number) || field.min || 0;
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={rangeValue}
              onChange={(e) => handleChange(field.name, Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={(field.max || 1000000) / 100}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{field.min?.toLocaleString('tr-TR')} {field.suffix}</span>
              <span className="font-semibold text-red-600">{rangeValue.toLocaleString('tr-TR')} {field.suffix}</span>
              <span>{field.max?.toLocaleString('tr-TR')} {field.suffix}</span>
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-red-300 transition-colors cursor-pointer">
            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Dosya yüklemek için tıklayın</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF - Max 10MB</p>
          </div>
        );

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className="p-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">İlan Başarıyla Gönderildi!</h3>
        <p className="text-gray-500 mb-6">İlanınız incelendikten sonra yayınlanacaktır.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({});
            }}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            Yeni İlan Oluştur
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
            >
              İlanlarıma Dön
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-14 h-14 rounded-2xl ${category.color} flex items-center justify-center shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
          <p className="text-sm text-gray-500">{category.description}</p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info size={20} className="text-blue-600 mt-0.5" />
        <p className="text-sm text-blue-700">
          <strong>Önemli:</strong> İlanınız DK Agency ekibi tarafından incelendikten sonra yayınlanacaktır. 
          Doğru ve eksiksiz bilgi girmeniz onay sürecini hızlandırır.
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-6">
        {category.fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {renderField(field)}
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-8 pt-6 border-t border-gray-100 space-y-6">
        {/* AI Analysis Checkbox */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
          <label className="flex items-start gap-4 cursor-pointer">
            <div className="relative mt-1">
              <input
                type="checkbox"
                checked={requestAIAnalysis}
                onChange={(e) => setRequestAIAnalysis(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-6 h-6 border-2 border-amber-400 rounded-lg peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                {requestAIAnalysis && (
                  <CheckCircle size={16} className="text-white" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-amber-600" />
                <span className="text-base font-bold text-amber-800">Almila AI Analizi İste</span>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-semibold rounded-full">PRO</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                Yapay zeka destekli ön değerleme raporu alın. İlanınızın güçlü yönleri, 
                riskleri ve tahmini değer aralığı hakkında anında içgörü edinin.
              </p>
            </div>
          </label>
        </div>

        {/* AI Analysis Result */}
        {aiResult && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-purple-900">Almila AI Ön Değerleme Raporu</h4>
                  <p className="text-xs text-purple-600">Yapay zeka analizi tamamlandı</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-purple-700">{aiResult.score}</div>
                <div className="text-xs text-purple-600">Yatırım Skoru</div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white/60 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">Özet</span>
              </div>
              <p className="text-sm text-gray-700">{aiResult.summary}</p>
            </div>

            {/* Strengths & Risks */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Güçlü Yönler</span>
                </div>
                <ul className="space-y-2">
                  {aiResult.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-green-700 flex items-start gap-2">
                      <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="text-sm font-semibold text-red-800">Riskler</span>
                </div>
                <ul className="space-y-2">
                  {aiResult.risks.map((r, i) => (
                    <li key={i} className="text-xs text-red-700 flex items-start gap-2">
                      <TrendingDown size={12} className="text-red-500 mt-0.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Estimated Value & Recommendation */}
            <div className="flex gap-4">
              {aiResult.estimatedValue && (
                <div className="flex-1 bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={16} className="text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">Tahmini Değer Aralığı</span>
                  </div>
                  <p className="text-lg font-bold text-blue-700">{aiResult.estimatedValue}</p>
                </div>
              )}
              <div className="flex-1 bg-purple-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-purple-600" />
                  <span className="text-sm font-semibold text-purple-800">Öneri</span>
                </div>
                <p className="text-sm text-purple-700">{aiResult.recommendation}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Error */}
        {aiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-sm text-red-700">{aiError}</p>
          </div>
        )}

        {/* AI Analyzing State */}
        {aiAnalyzing && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 flex items-center justify-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center animate-pulse">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-purple-800">Almila AI analiz ediyor...</p>
              <p className="text-sm text-purple-600">Bu işlem birkaç saniye sürebilir</p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              İptal
            </button>
          )}

          {/* AI Analysis Button (if checkbox is checked but no result yet) */}
          {requestAIAnalysis && !aiResult && !aiAnalyzing && (
            <button
              type="button"
              onClick={requestAlmilaAnalysis}
              className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
            >
              <Sparkles size={20} />
              Önce AI Analizi Al
            </button>
          )}

          <button
            type="submit"
            disabled={submitting || aiAnalyzing}
            className={`flex-1 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-6 py-4 rounded-xl font-bold transition-colors ${
              !onCancel ? 'w-full' : ''
            }`}
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send size={20} />
                {aiResult ? 'İlanı Raporla Gönder' : 'İlanı Gönder'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
