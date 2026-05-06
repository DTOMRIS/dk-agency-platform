// app/b2b-panel/yeni-ilan/page.tsx
// DK Agency - B2B Portal - Yeni İlan Oluştur
// 7 Kategori Seçimi ve Dinamik Form

'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeftRight, Crown, ShoppingBag, Users, TrendingUp,
  Building, Package, ArrowLeft, Check
} from 'lucide-react';
import { LISTING_CATEGORIES, ListingCategory } from '@/lib/data/listingCategories';
import ListingForm from '@/components/listings/ListingForm';
import { normalizeLocale, type Locale } from '@/i18n/config';

const pageCopy: Record<Locale, {
  backToCategory: string;
  back: string;
  enterDetails: string;
  createListing: string;
  selectCategory: string;
  continue: string;
  guideTitle: string;
  guideItems: string[];
}> = {
  az: {
    backToCategory: 'Kateqoriya Seç',
    back: 'Geri',
    enterDetails: 'Elan Məlumatlarını Daxil Edin',
    createListing: 'Yeni Elan Yarat',
    selectCategory: 'HORECA sektörü üçün elan kateqoriyası seçin',
    continue: 'Davam Et',
    guideTitle: 'Hansı kateqoriya sizə uyğundur?',
    guideItems: [
      'İşletmə Devri: Mövcud işletmənizi devretmək istəyirsinizsə',
      'Franchise Vermək: Markanızı franchise modeli ilə böyütmək istəyirsinizsə',
      'Franchise Almaq: Hazır marka ilə iş qurmaq istəyirsinizsə',
      'Ortaq Tapmaq: Layihənizə kapital və ya işletmə ortağı axtarırsınızsa',
      'Yeni İnvestisiya: İnvestor axtaran yeni layihə təqdim edirsinizsə',
      'Obyekt İcarəsi: HORECA uyğun obyekt icarəyə götürəcək və ya verəcəksinizsə',
      'HORECA Ekipman: Peşəkar avadanlıq alqı-satqısı üçün',
    ],
  },
  ru: {
    backToCategory: 'Выбрать категорию',
    back: 'Назад',
    enterDetails: 'Введите данные объявления',
    createListing: 'Создать объявление',
    selectCategory: 'Выберите категорию объявления для сектора HORECA',
    continue: 'Продолжить',
    guideTitle: 'Какая категория вам подходит?',
    guideItems: [
      'Передача бизнеса: если вы хотите передать существующий бизнес',
      'Продать франшизу: если вы хотите развивать бренд по франшизной модели',
      'Купить франшизу: если вы хотите открыть бизнес с готовым брендом',
      'Найти партнёра: если вы ищете капитал или операционного партнёра для проекта',
      'Новые инвестиции: если вы представляете новый проект, ищущий инвестора',
      'Аренда объекта: если вы снимаете или сдаёте объект, подходящий для HORECA',
      'Оборудование HORECA: для профессиональной купли-продажи оборудования',
    ],
  },
  en: {
    backToCategory: 'Select Category',
    back: 'Back',
    enterDetails: 'Enter Listing Details',
    createListing: 'Create Listing',
    selectCategory: 'Choose a listing category for the HORECA sector',
    continue: 'Continue',
    guideTitle: 'Which category suits you?',
    guideItems: [
      'Business Transfer: if you want to transfer your existing business',
      'Sell Franchise: if you want to grow your brand with a franchise model',
      'Buy Franchise: if you want to start a business with an established brand',
      'Find Partner: if you are looking for capital or an operating partner for your project',
      'New Investment: if you are presenting a new project seeking investors',
      'Venue Rental: if you are renting or leasing a venue suitable for HORECA',
      'HORECA Equipment: for professional buying and selling of equipment',
    ],
  },
  tr: {
    backToCategory: 'Kategori Seç',
    back: 'Geri',
    enterDetails: 'İlan Bilgilerini Girin',
    createListing: 'Yeni İlan Oluştur',
    selectCategory: 'HORECA sektörü için ilan kategorisi seçin',
    continue: 'Devam Et',
    guideTitle: 'Hangi kategori size uygun?',
    guideItems: [
      'İşletme Devri: Mevcut işletmenizi devretmek istiyorsanız',
      'Franchise Vermek: Markanızı franchise modeli ile büyütmek istiyorsanız',
      'Franchise Almak: Hazır bir marka ile iş kurmak istiyorsanız',
      'Ortak Bulmak: Projenize sermaye veya işletme ortağı arıyorsanız',
      'Yeni Yatırım: Yatırımcı arayan yeni bir proje sunuyorsanız',
      'Mekan Kiralama: HORECA uygun mekan kiralayacak veya kiraya verecekseniz',
      'HORECA Ekipman: Profesyonel ekipman alım-satımı için',
    ],
  },
};

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
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

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
            {selectedCategory ? copy.backToCategory : copy.back}
          </span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {selectedCategory ? copy.enterDetails : copy.createListing}
        </h1>
        <p className="text-gray-500 mt-1">
          {selectedCategory
            ? LISTING_CATEGORIES.find(c => c.id === selectedCategory)?.description
            : copy.selectCategory
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
                  className="group bg-white rounded-xl border-2 border-gray-200 hover:border-dk-red p-6 text-left transition-all hover:shadow-lg"
                >
                  <div className={`w-14 h-14 rounded-2xl ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{category.title}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                  <div className="mt-4 flex items-center text-dk-red text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{copy.continue}</span>
                    <Check size={16} className="ml-1" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-2">{copy.guideTitle}</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {copy.guideItems.map((item, i) => {
                const [label, ...rest] = item.split(': ');
                return (
                  <li key={i}><strong>{label}:</strong> {rest.join(': ')}</li>
                );
              })}
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
