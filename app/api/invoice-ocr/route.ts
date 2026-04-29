/**
 * @file route.ts
 * @purpose Invoice OCR API — fatura şəkli yüklə, AI oxusun, JSON qaytarsın
 * @critical KAZAN AI Invoice OCR — Həftə 1 POC
 */

import { NextRequest, NextResponse } from 'next/server';
import { runInvoiceOcr } from '@/lib/invoice-ocr/ocr-providers';
import type { OcrApiResponse } from '@/lib/invoice-ocr/types';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest): Promise<NextResponse<OcrApiResponse>> {
  const start = Date.now();

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Fayl tapılmadı. "file" field ilə FormData göndərin.' },
        { status: 400 },
      );
    }

    // Validate type
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: `Yalnız JPEG, PNG, WebP qəbul olunur. Göndərilən: ${file.type}` },
        { status: 400 },
      );
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: `Fayl çox böyükdür (${(file.size / 1024 / 1024).toFixed(1)}MB). Maks: 5MB` },
        { status: 400 },
      );
    }

    // Convert to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');

    // Run OCR
    const result = await runInvoiceOcr(base64, file.type);

    if (!result.data) {
      return NextResponse.json(
        { success: false, error: result.error || 'Fatura oxuna bilmədi', processingTimeMs: Date.now() - start },
        { status: 422 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      processingTimeMs: Date.now() - start,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: `Server xətası: ${String(err)}`, processingTimeMs: Date.now() - start },
      { status: 500 },
    );
  }
}
