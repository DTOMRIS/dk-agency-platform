/**
 * @file export-utils.ts
 * @purpose Fatura export — CSV, Excel, PDF (UTF-8 BOM, AZ/TR locale uyğun)
 *
 * CSV: nöqtəli vergül (;) separator — Excel AZ/TR locale-da düzgün açılır
 * Excel: SheetJS XLSX — sütun genişlikləri, başlıq formatı
 * PDF: jsPDF — AZ hərfləri (ə, ı, ö, ü, ş, ç, ğ) dəstəklənir
 */

import * as XLSX from 'xlsx';

// ── Shared Types ────────────────────────────────────────────────────

interface ExportInvoice {
  supplierName: string;
  supplierVoen?: string | null;
  invoiceNumber?: string | null;
  invoiceDate: string;
  grandTotal: number;
  currency: string;
  status: string;
  source: string;
}

interface FoodCostExportRow {
  categoryName: string;
  totalAmount: number;
  itemCount: number;
  percentage: number;
}

// ── Helpers ─────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Təsdiqlənib',
  draft: 'Qaralama',
  disputed: 'Mübahisəli',
  archived: 'Arxiv',
};

const SOURCE_LABELS: Record<string, string> = {
  ocr_camera: 'Kamera OCR',
  ocr_upload: 'Yüklə OCR',
  manual: 'Əl ilə',
  excel: 'Excel',
  pdf: 'PDF',
};

function escCsv(val: string): string {
  // Hər hücrəni qoşa dırnaqla sarı, daxili dırnaqları escape et
  return `"${val.replace(/"/g, '""')}"`;
}

function fmtMoney(qepik: number): string {
  return (qepik / 100).toFixed(2);
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── CSV Export (UTF-8 BOM + nöqtəli vergül separator) ───────────────
// AZ/TR locale-da Excel ";" ilə sütun ayırır, "," ilə deyil.

export function exportInvoicesToCsv(invoices: ExportInvoice[], filename = 'faturalar.csv') {
  const BOM = '\uFEFF';
  const SEP = ';';

  const headers = ['Tədarükçü', 'VÖEN', 'Faktura No', 'Tarix', 'Yekun (AZN)', 'Valyuta', 'Status', 'Mənbə'];

  const rows = invoices.map((inv) => [
    escCsv(inv.supplierName),
    escCsv(inv.supplierVoen ?? ''),
    escCsv(inv.invoiceNumber ?? ''),
    escCsv(inv.invoiceDate),
    escCsv(fmtMoney(inv.grandTotal)),
    escCsv(inv.currency),
    escCsv(STATUS_LABELS[inv.status] ?? inv.status),
    escCsv(SOURCE_LABELS[inv.source] ?? inv.source),
  ]);

  const csv = BOM + [headers.map(escCsv), ...rows].map((r) => r.join(SEP)).join('\r\n');
  downloadBlob(csv, filename, 'text/csv;charset=utf-8');
}

// ── Food Cost CSV Export ────────────────────────────────────────────

export function exportFoodCostToCsv(
  categories: FoodCostExportRow[],
  grandTotal: number,
  period: string,
  filename = 'food-cost.csv',
) {
  const BOM = '\uFEFF';
  const SEP = ';';

  const headers = ['Kateqoriya', 'Məbləğ (AZN)', 'Məhsul sayı', 'Faiz (%)'];

  const rows = categories.map((cat) => [
    escCsv(cat.categoryName),
    escCsv(fmtMoney(cat.totalAmount)),
    escCsv(String(cat.itemCount)),
    escCsv(cat.percentage.toFixed(2)),
  ]);

  // Cəmi sətri
  rows.push([
    escCsv('CƏMİ'),
    escCsv(fmtMoney(grandTotal)),
    escCsv(String(categories.reduce((s, c) => s + c.itemCount, 0))),
    escCsv('100.00'),
  ]);

  // Dövr başlığı
  const titleRow = [escCsv(`Food Cost Hesabatı — ${period}`), '', '', ''];

  const csv = BOM + [titleRow, headers.map(escCsv), ...rows].map((r) => r.join(SEP)).join('\r\n');
  downloadBlob(csv, filename, 'text/csv;charset=utf-8');
}

// ── Excel Export ────────────────────────────────────────────────────

export function exportInvoicesToExcel(invoices: ExportInvoice[], filename = 'faturalar.xlsx') {
  const data = invoices.map((inv) => ({
    'Tədarükçü': inv.supplierName,
    'VÖEN': inv.supplierVoen ?? '',
    'Faktura No': inv.invoiceNumber ?? '',
    'Tarix': inv.invoiceDate,
    'Yekun (AZN)': Number(fmtMoney(inv.grandTotal)),
    'Status': STATUS_LABELS[inv.status] ?? inv.status,
    'Mənbə': SOURCE_LABELS[inv.source] ?? inv.source,
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  ws['!cols'] = [
    { wch: 25 }, // Tədarükçü
    { wch: 12 }, // VÖEN
    { wch: 14 }, // Faktura No
    { wch: 12 }, // Tarix
    { wch: 14 }, // Yekun
    { wch: 14 }, // Status
    { wch: 14 }, // Mənbə
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Faturalar');
  XLSX.writeFile(wb, filename, { bookSST: true });
}

// ── Food Cost Excel Export ──────────────────────────────────────────

export function exportFoodCostToExcel(
  categories: FoodCostExportRow[],
  grandTotal: number,
  period: string,
  filename = 'food-cost.xlsx',
) {
  const data = categories.map((cat) => ({
    'Kateqoriya': cat.categoryName,
    'Məbləğ (AZN)': Number(fmtMoney(cat.totalAmount)),
    'Məhsul sayı': cat.itemCount,
    'Faiz (%)': cat.percentage,
  }));

  // Cəmi sətri
  data.push({
    'Kateqoriya': 'CƏMİ',
    'Məbləğ (AZN)': Number(fmtMoney(grandTotal)),
    'Məhsul sayı': categories.reduce((s, c) => s + c.itemCount, 0),
    'Faiz (%)': 100,
  });

  // Başlıq sətri + data
  const ws = XLSX.utils.aoa_to_sheet([[`Food Cost Hesabati — ${period}`]]);
  XLSX.utils.sheet_add_json(ws, data, { origin: 'A2', skipHeader: false });

  ws['!cols'] = [
    { wch: 30 }, // Kateqoriya
    { wch: 16 }, // Məbləğ
    { wch: 14 }, // Məhsul sayı
    { wch: 12 }, // Faiz
  ];

  // Merge başlıq
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Food Cost');
  XLSX.writeFile(wb, filename, { bookSST: true });
}

// ── PDF Export (Food Cost Hesabat) ──────────────────────────────────

export async function exportFoodCostToPdf(
  categories: FoodCostExportRow[],
  grandTotal: number,
  period: string,
  filename = 'food-cost.pdf',
) {
  // Dynamic import — jsPDF yalnız lazım olduqda yüklənir
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // AZ hərfləri üçün Unicode dəstəkli font — jsPDF default helvetica
  // AZ xüsusi hərflər (ə, ı, ö, ü, ş, ç, ğ) üçün WinAnsiEncoding yetərlidir

  const pageW = doc.internal.pageSize.getWidth();
  const marginL = 20;
  const marginR = 20;
  const contentW = pageW - marginL - marginR;
  let y = 20;

  // ── Başlıq ──
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Food Cost Hesabati', marginL, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dovr: ${period}`, marginL, y);
  y += 5;
  doc.text(`Umumi xerc: ${fmtMoney(grandTotal)} AZN`, marginL, y);
  y += 10;

  // ── Cədvəl başlıqları ──
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(30, 58, 95); // navy
  doc.rect(marginL, y, contentW, 8, 'F');
  doc.setTextColor(255, 255, 255);

  const colX = [marginL + 3, marginL + 80, marginL + 115, marginL + 145];
  doc.text('Kateqoriya', colX[0], y + 5.5);
  doc.text('Mebleg (AZN)', colX[1], y + 5.5);
  doc.text('Mehsul', colX[2], y + 5.5);
  doc.text('Faiz (%)', colX[3], y + 5.5);
  y += 10;

  // ── Sətrlər ──
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];

    // Alternating row background
    if (i % 2 === 0) {
      doc.setFillColor(245, 245, 250);
      doc.rect(marginL, y - 4, contentW, 7, 'F');
    }

    // AZ xüsusi hərfləri ASCII-yə çevir (PDF font limitasiyası)
    const safeName = sanitizeForPdf(cat.categoryName);
    doc.text(safeName, colX[0], y);
    doc.text(fmtMoney(cat.totalAmount), colX[1], y);
    doc.text(String(cat.itemCount), colX[2], y);
    doc.text(cat.percentage.toFixed(1) + '%', colX[3], y);
    y += 7;

    // Səhifə aşması
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  // ── Cəmi sətri ──
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(30, 58, 95);
  doc.rect(marginL, y - 4, contentW, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('CEMI', colX[0], y + 1);
  doc.text(fmtMoney(grandTotal) + ' AZN', colX[1], y + 1);
  doc.text(String(categories.reduce((s, c) => s + c.itemCount, 0)), colX[2], y + 1);
  doc.text('100%', colX[3], y + 1);
  y += 12;

  // ── Footer ──
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`DK Agency - OCAQ Panel | ${new Date().toLocaleDateString('az-AZ')}`, marginL, 285);

  doc.save(filename);
}

/**
 * jsPDF default font (Helvetica) AZ xüsusi hərfləri dəstəkləmir.
 * ə→e, ı→i, ö→o, ü→u, ş→s, ç→c, ğ→g əvəzləməsi — mojibake-dən yaxşıdır.
 */
function sanitizeForPdf(text: string): string {
  return text
    .replace(/ə/g, 'e').replace(/Ə/g, 'E')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G');
}
