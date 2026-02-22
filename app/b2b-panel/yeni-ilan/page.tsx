// app/b2b-panel/yeni-ilan/page.tsx
// DK Agency - B2B Portal - Yeni İlan Oluştur
// 7 Kategori Seçimi ve Dinamik Form

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftRight, Crown, ShoppingBag, Users, TrendingUp,
  Building, Package, ArrowLeft, Check
} from 'lucide-react';
import { LISTING_CATEGORIES, ListingCategory } from '@/lib/data/listingCategories';
import ListingForm from '@/components/listings/ListingForm';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  ArrowLeftRight,
  Crown,
  ShoppingBag,
  Users,
  TrendingUp,
  Building,
  Package,
};

export default function YeniIlanPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | null>(null);

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      router.back();
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">
            {selectedCategory ? 'Kategori Seç' : 'Geri'}
          </span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {selectedCategory ? 'İlan Bilgilerini Girin' : 'Yeni İlan Oluştur'}
        </h1>
        <p className="text-gray-500 mt-1">
          {selectedCategory
            ? LISTING_CATEGORIES.find(c => c.id === selectedCategory)?.description
            : 'HORECA sektörü için ilan kategorisi seçin'
          }
        </p>
      </div>

      {!selectedCategory ? (
        <>
          {/* Category Selection */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LISTING_CATEGORIES.map((category) => {
              const Icon = ICONS[category.icon] || Package;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="group bg-white rounded-xl border-2 border-gray-200 hover:border-red-500 p-6 text-left transition-all hover:shadow-lg"
                >
                  <div className={`w-14 h-14 rounded-2xl ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{category.title}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                  <div className="mt-4 flex items-center text-red-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Devam Et</span>
                    <Check size={16} className="ml-1" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-2">Hangi kategori size uygun?</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><strong>İşletme Devri:</strong> Mevcut işletmenizi devretmek istiyorsanız</li>
              <li><strong>Franchise Vermek:</strong> Markanızı franchise modeli ile büyütmek istiyorsanız</li>
              <li><strong>Franchise Almak:</strong> Hazır bir marka ile iş kurmak istiyorsanız</li>
              <li><strong>Ortak Bulmak:</strong> Projenize sermaye veya işletme ortağı arıyorsanız</li>
              <li><strong>Yeni Yatırım:</strong> Yatırımcı arayan yeni bir proje sunuyorsanız</li>
              <li><strong>Mekan Kiralama:</strong> HORECA uygun mekan kiralayacak veya kiraya verecekseniz</li>
              <li><strong>HORECA Ekipman:</strong> Profesyonel ekipman alım-satımı için</li>
            </ul>
          </div>
        </>
      ) : (
        /* Form */
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
          <ListingForm
            categoryId={selectedCategory}
            onCancel={() => setSelectedCategory(null)}
          />
        </div>
      )}
    </div>
  );
}
