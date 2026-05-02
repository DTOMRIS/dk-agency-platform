import { NextRequest, NextResponse } from 'next/server';
import { extractPdfText, parsePdfTextToInvoice } from '@/lib/invoice-ocr/pdf-parser';

// POST /api/invoice-pdf — PDF fatura import
// Body: FormData with "file" field
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'PDF faylı göndərilmədi.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Yalnız PDF faylları qəbul edilir.' }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'PDF faylı 10MB-dan böyükdür.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 1: Text çıxar
    const extractResult = await extractPdfText(buffer);

    if (!extractResult.success) {
      return NextResponse.json({
        success: false,
        type: extractResult.type,
        error: extractResult.error,
        pageCount: extractResult.pageCount,
      }, { status: 200 });
    }

    // Step 2: AI parse
    const parseResult = await parsePdfTextToInvoice(extractResult.text);

    return NextResponse.json({
      success: true,
      type: 'digital',
      pageCount: extractResult.pageCount,
      rows: parseResult.rows,
      errors: parseResult.errors,
      successRows: parseResult.successRows,
      failedRows: parseResult.failedRows,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'PDF import xətası.', details: String(error) },
      { status: 500 },
    );
  }
}
