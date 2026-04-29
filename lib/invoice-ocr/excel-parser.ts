/**
 * @file excel-parser.ts
 * @purpose Excel/CSV fatura import — SheetJS ilə parse, sütun mapping, validation
 */

import * as XLSX from 'xlsx';

export interface ExcelRow {
  supplier?: string;
  date?: string;
  invoiceNo?: string;
  productName?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  category?: string;
}

export interface ParsedExcelResult {
  rows: ExcelRow[];
  errors: Array<{ row: number; field: string; value: string; error: string }>;
  headers: string[];
  totalRows: number;
  successRows: number;
  failedRows: number;
}

// Sütun adı tanıma (AZ/TR/EN/RU)
const COLUMN_ALIASES: Record<keyof ExcelRow, string[]> = {
  supplier: ['tədarükçü', 'tedarikci', 'supplier', 'mağaza', 'firma', 'поставщик', 'magaza'],
  date: ['tarix', 'tarih', 'date', 'дата', 'faktura tarixi'],
  invoiceNo: ['nömrə', 'numara', 'no', 'number', 'номер', 'faktura no'],
  productName: ['məhsul', 'ürün', 'product', 'ad', 'name', 'товар', 'mal'],
  quantity: ['miqdar', 'miktar', 'qty', 'quantity', 'количество', 'say'],
  unit: ['vahid', 'birim', 'unit', 'единица', 'ölçü'],
  unitPrice: ['qiymət', 'fiyat', 'price', 'цена', 'vahid qiymət'],
  category: ['kateqoriya', 'kategori', 'category', 'категория', 'növ'],
};

function normalizeHeader(h: string): string {
  return h.toLowerCase().trim().replace(/[^a-zəüöığçşа-яё0-9]/g, '');
}

function detectColumn(header: string): keyof ExcelRow | null {
  const norm = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as [keyof ExcelRow, string[]][]) {
    for (const alias of aliases) {
      if (norm.includes(normalizeHeader(alias))) return field;
    }
  }
  return null;
}

function parseDate(val: unknown): string | undefined {
  if (!val) return undefined;

  // Excel serial number
  if (typeof val === 'number') {
    const date = XLSX.SSF.parse_date_code(val);
    if (date) {
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
  }

  const s = String(val).trim();

  // DD.MM.YYYY
  const dotMatch = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (dotMatch) return `${dotMatch[3]}-${dotMatch[2].padStart(2, '0')}-${dotMatch[1].padStart(2, '0')}`;

  // YYYY-MM-DD
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];

  return s;
}

function parseNumber(val: unknown): number | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  if (typeof val === 'number') return val;
  const s = String(val).replace(/\s/g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? undefined : n;
}

export function parseExcelFile(buffer: ArrayBuffer): ParsedExcelResult {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  if (rawData.length === 0) {
    return { rows: [], errors: [], headers: [], totalRows: 0, successRows: 0, failedRows: 0 };
  }

  // Sütun mapping
  const rawHeaders = Object.keys(rawData[0]);
  const columnMap: Record<string, keyof ExcelRow | null> = {};
  for (const h of rawHeaders) {
    columnMap[h] = detectColumn(h);
  }

  const rows: ExcelRow[] = [];
  const errors: Array<{ row: number; field: string; value: string; error: string }> = [];

  for (let i = 0; i < rawData.length; i++) {
    const raw = rawData[i];
    const row: ExcelRow = {};
    let hasData = false;

    for (const [header, field] of Object.entries(columnMap)) {
      if (!field) continue;
      const val = raw[header];

      if (field === 'date') {
        row.date = parseDate(val);
      } else if (field === 'quantity' || field === 'unitPrice') {
        const num = parseNumber(val);
        if (num !== undefined) {
          row[field] = num;
          hasData = true;
        } else if (val !== '' && val !== undefined) {
          errors.push({ row: i + 2, field, value: String(val), error: 'Rəqəm deyil' });
        }
      } else {
        const s = String(val ?? '').trim();
        if (s) {
          (row as Record<string, unknown>)[field] = s;
          hasData = true;
        }
      }
    }

    // Minimum validation: productName olmalı
    if (hasData) {
      if (!row.productName) {
        errors.push({ row: i + 2, field: 'productName', value: '', error: 'Məhsul adı boşdur' });
      } else {
        rows.push(row);
      }
    }
  }

  return {
    rows,
    errors,
    headers: rawHeaders,
    totalRows: rawData.length,
    successRows: rows.length,
    failedRows: errors.length,
  };
}

// Sütun mapping UI üçün: raw header → detected field
export function detectColumnMapping(headers: string[]): Record<string, keyof ExcelRow | null> {
  const mapping: Record<string, keyof ExcelRow | null> = {};
  for (const h of headers) {
    mapping[h] = detectColumn(h);
  }
  return mapping;
}
