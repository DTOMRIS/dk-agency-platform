/**
 * @file types.ts
 * @purpose Invoice OCR type definitions for KAZAN AI fatura parsing
 */

export interface InvoiceItem {
  name: string;
  quantity: number;
  unit: string; // kq, litr, əd, qutu, paket
  unitPrice: number; // AZN (float for display, stored as qəpik in DB)
  totalPrice: number;
}

export interface ParsedInvoice {
  supplier: string;
  supplierVoen: string | null;
  date: string; // YYYY-MM-DD
  invoiceNumber: string | null;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  grandTotal: number;
  currency: string; // default "AZN"
  confidence: number; // 0.0 - 1.0
  notes: string | null;
  provider: OcrProvider;
}

export type OcrProvider = 'gemini' | 'deepseek-vision' | 'deepseek-text';

export interface OcrApiResponse {
  success: boolean;
  data?: ParsedInvoice;
  error?: string;
  processingTimeMs?: number;
}

export interface OcrProviderResult {
  ok: boolean;
  rawText?: string;
  error?: string;
  provider: OcrProvider;
}
