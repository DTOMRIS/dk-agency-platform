/**
 * @file export-utils.ts
 * @purpose Fatura export — CSV və Excel (UTF-8 BOM ilə AZ hərfləri düzgün)
 */

import * as XLSX from 'xlsx';

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

// ── CSV Export (UTF-8 BOM) ──────────────────────────────────────────

export function exportInvoicesToCsv(invoices: ExportInvoice[], filename = 'faturalar.csv') {
  const BOM = '\uFEFF';
  const headers = ['Tədarükçü', 'VÖEN', 'Faktura No', 'Tarix', 'Yekun', 'Valyuta', 'Status', 'Mənbə'];
  const rows = invoices.map((inv) => [
    inv.supplierName,
    inv.supplierVoen ?? '',
    inv.invoiceNumber ?? '',
    inv.invoiceDate,
    (inv.grandTotal / 100).toFixed(2),
    inv.currency,
    inv.status,
    inv.source,
  ]);

  const csv = BOM + [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadBlob(csv, filename, 'text/csv;charset=utf-8');
}

// ── Excel Export ────────────────────────────────────────────────────

export function exportInvoicesToExcel(invoices: ExportInvoice[], filename = 'faturalar.xlsx') {
  const data = invoices.map((inv) => ({
    'Tədarükçü': inv.supplierName,
    'VÖEN': inv.supplierVoen ?? '',
    'Faktura No': inv.invoiceNumber ?? '',
    'Tarix': inv.invoiceDate,
    'Yekun (AZN)': (inv.grandTotal / 100).toFixed(2),
    'Status': inv.status === 'confirmed' ? 'Təsdiqlənib' : inv.status === 'draft' ? 'Qaralama' : inv.status,
    'Mənbə': inv.source,
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  // Sütun genişlikləri
  ws['!cols'] = [
    { wch: 25 }, // Tədarükçü
    { wch: 12 }, // VÖEN
    { wch: 14 }, // Faktura No
    { wch: 12 }, // Tarix
    { wch: 12 }, // Yekun
    { wch: 14 }, // Status
    { wch: 12 }, // Mənbə
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Faturalar');
  XLSX.writeFile(wb, filename);
}

// ── Download helper ─────────────────────────────────────────────────

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
