'use client';

/**
 * TASK-0498 — /dashboard/techizatcilar: «Təchizatçılar» | «Tələblər» + WhatsApp idxalı.
 * Yalnız admin (layout + səhifədə requireAdminPage, API-da requireApiAdmin). Açıq səhifə yoxdur.
 */

import { useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Database, Lock, Upload } from 'lucide-react';

import { normalizeLocale } from '@/i18n/config';
import { SUPPLY_COPY } from '@/lib/supply/copy';

import ImportPanel from './ImportPanel';
import RequestsTab from './RequestsTab';
import SuppliersTab, { EMPTY_SUPPLIER_FILTERS, type SupplierFilterState } from './SuppliersTab';
import { CARD, PILL_BTN } from './ui';

type Tab = 'suppliers' | 'requests';

export default function SupplyBoard() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = SUPPLY_COPY[locale];

  const [tab, setTab] = useState<Tab>('suppliers');
  const [showImport, setShowImport] = useState(false);
  const [tablesMissing, setTablesMissing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [supplierPreset, setSupplierPreset] = useState<SupplierFilterState>(EMPTY_SUPPLIER_FILTERS);

  const onTablesMissing = useCallback(() => setTablesMissing(true), []);
  const onImported = useCallback(() => {
    setTablesMissing(false);
    setRefreshKey((key) => key + 1);
  }, []);
  const onShowSuppliers = useCallback((categories: string[]) => {
    setSupplierPreset({ ...EMPTY_SUPPLIER_FILTERS, categories });
    setTab('suppliers');
  }, []);

  const tabs: Array<[Tab, string]> = [
    ['suppliers', copy.tabSuppliers],
    ['requests', copy.tabRequests],
  ];

  return (
    <div className="min-h-full bg-[#F6F1E9] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 max-w-3xl">
            <h1 className="text-[30px] font-black tracking-[-0.03em] text-[#0F172A] sm:text-[38px]">
              {copy.pageTitle}
            </h1>
            <p className="mt-1 text-[15px] text-[#334155]">{copy.pageSubtitle}</p>
            <p className="mt-2 inline-flex items-start gap-1.5 text-[13px] font-medium text-[#334155]">
              <Lock size={14} className="mt-0.5 shrink-0 text-[#334155]" aria-hidden="true" />
              {copy.privacyNote}
            </p>
          </div>
          <button
            type="button"
            aria-expanded={showImport}
            onClick={() => setShowImport((value) => !value)}
            className={`${PILL_BTN} h-11 bg-dk-red-strong px-5 text-[14px] text-white hover:bg-dk-red-deep`}
          >
            <Upload size={16} aria-hidden="true" />
            {showImport ? copy.importHide : copy.importToggle}
          </button>
        </div>

        {tablesMissing ? (
          <div
            className={`${CARD} flex items-start gap-3 border border-amber-200 p-5`}
            role="status"
            data-testid="supply-tables-missing"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
              <Database size={18} className="text-amber-800" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[16px] font-bold text-[#0F172A]">{copy.tablesMissingTitle}</h2>
              <p className="mt-1 text-[14px] leading-relaxed text-[#334155]">
                {copy.tablesMissingBody}
              </p>
            </div>
          </div>
        ) : null}

        {showImport ? <ImportPanel copy={copy} locale={locale} onImported={onImported} /> : null}

        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div
            role="tablist"
            className="inline-flex gap-1 rounded-full border border-[#E4DCCD] bg-white p-1"
          >
            {tabs.map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={`h-9 whitespace-nowrap rounded-full px-5 text-[14px] font-semibold transition-colors ${
                  tab === value ? 'bg-[#0F172A] text-white' : 'text-[#334155] hover:bg-[#FBF8F3]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {tablesMissing ? null : tab === 'suppliers' ? (
          <SuppliersTab
            copy={copy}
            locale={locale}
            initialFilters={supplierPreset}
            refreshKey={refreshKey}
            onTablesMissing={onTablesMissing}
          />
        ) : (
          <RequestsTab
            copy={copy}
            locale={locale}
            refreshKey={refreshKey}
            onTablesMissing={onTablesMissing}
            onShowSuppliers={onShowSuppliers}
          />
        )}
      </div>
    </div>
  );
}
