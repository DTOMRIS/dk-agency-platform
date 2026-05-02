/**
 * @file pdf-parser.ts
 * @purpose PDF fatura import — digital PDF text extract + skan PDF OCR fallback
 *
 * Digital PDF (Metro, Bravo rəsmi faturaları) → pdf-parse ilə text çıxar → DeepSeek parse
 * Skan PDF (kağız skan) → text çıxmazsa → OCR pipeline-a yönləndir
 */

// Server-side only — pdf-parse Node.js tələb edir
// Bu fayl yalnız API route-dan çağrılır

export interface PdfParseResult {
  success: boolean;
  type: 'digital' | 'scanned' | 'error';
  text: string;
  pageCount: number;
  error?: string;
}

export interface PdfInvoiceItem {
  supplier: string;
  productName: string;
  quantity: number | null;
  unit: string;
  unitPrice: number | null;
  date: string | null;
}

export interface PdfImportResult {
  rows: PdfInvoiceItem[];
  errors: Array<{ row: number; field: string; error: string }>;
  successRows: number;
  failedRows: number;
  sourceType: 'digital' | 'scanned';
  rawText: string;
}

/**
 * PDF-dən text çıxar (server-side).
 * Digital PDF → text, Skan PDF → boş text (OCR lazım).
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfParseResult> {
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: new Uint8Array(buffer) });

    // getText bütün səhifələri parse edir
    const result = await parser.getText();
    const text = result.text?.trim() ?? '';
    const pageCount = result.total ?? 1;

    await parser.destroy();

    if (text.length < 20) {
      return {
        success: false,
        type: 'scanned',
        text: '',
        pageCount,
        error: 'PDF skan edilmiş görünür — text tapılmadı. OCR istifadə edin.',
      };
    }

    return {
      success: true,
      type: 'digital',
      text,
      pageCount,
    };
  } catch (err) {
    return {
      success: false,
      type: 'error',
      text: '',
      pageCount: 0,
      error: `PDF oxunma xətası: ${String(err)}`,
    };
  }
}

/**
 * PDF text-ini AI ilə parse et (DeepSeek və ya Gemini).
 * Nəticə: strukturlaşdırılmış fatura sətirləri.
 */
export async function parsePdfTextToInvoice(text: string): Promise<PdfImportResult> {
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

  const prompt = `Aşağıdakı text bir və ya bir neçə faturadır. Hər faturadan məhsul sətrlərini çıxar.
JSON formatında cavab ver — başqa heç nə yazma.

Format:
{
  "invoices": [
    {
      "supplier": "Tədarükçü adı",
      "date": "YYYY-MM-DD",
      "items": [
        {
          "productName": "Məhsul adı",
          "quantity": 5.0,
          "unit": "kq",
          "unitPrice": 8.50
        }
      ]
    }
  ]
}

Qaydalar:
- Vahidlər: kq, litr, əd, qutu, paket, şüşə, bağ
- Qiymət AZN-dir (ondalıq nöqtə ilə: 8.50)
- Tarix DD.MM.YYYY formatındadırsa YYYY-MM-DD-yə çevir
- VÖEN varsa supplier-ə daxil etmə, ayrıca verilməyəcək
- Text AZ, TR, RU və ya EN ola bilər

TEXT:
${text.slice(0, 8000)}`;

  try {
    if (deepseekApiKey) {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          temperature: 0.1,
          max_tokens: 2000,
          messages: [
            { role: 'system', content: 'Sən fatura text parser-isən. Yalnız JSON cavab ver.' },
            { role: 'user', content: prompt },
          ],
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const rawJson = payload.choices?.[0]?.message?.content?.trim() ?? '';
        return parseAiResponse(rawJson, text);
      }
    }

    // Fallback: regex parse (AI yoxdursa)
    return regexParseFallback(text);
  } catch {
    return regexParseFallback(text);
  }
}

function parseAiResponse(rawJson: string, rawText: string): PdfImportResult {
  try {
    // JSON blokundan çıxar (markdown fence ola bilər)
    let json = rawJson;
    const fenceMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) json = fenceMatch[1];

    const parsed = JSON.parse(json) as {
      invoices?: Array<{
        supplier?: string;
        date?: string;
        items?: Array<{
          productName?: string;
          quantity?: number;
          unit?: string;
          unitPrice?: number;
        }>;
      }>;
    };

    const rows: PdfInvoiceItem[] = [];
    const errors: Array<{ row: number; field: string; error: string }> = [];
    let rowIdx = 0;

    for (const inv of parsed.invoices ?? []) {
      const supplier = inv.supplier ?? 'Naməlum';
      const date = inv.date ?? null;

      for (const item of inv.items ?? []) {
        rowIdx++;
        if (!item.productName) {
          errors.push({ row: rowIdx, field: 'productName', error: 'Məhsul adı boş' });
          continue;
        }
        rows.push({
          supplier,
          productName: item.productName,
          quantity: item.quantity ?? null,
          unit: item.unit ?? 'əd',
          unitPrice: item.unitPrice ?? null,
          date,
        });
      }
    }

    return {
      rows,
      errors,
      successRows: rows.length,
      failedRows: errors.length,
      sourceType: 'digital',
      rawText,
    };
  } catch {
    return regexParseFallback(rawText);
  }
}

/**
 * AI olmadıqda sadə regex ilə parse cəhdi.
 * Əksər hallarda yaxşı nəticə vermir — AI əsasdır.
 */
function regexParseFallback(text: string): PdfImportResult {
  const rows: PdfInvoiceItem[] = [];
  const lines = text.split('\n').filter((l) => l.trim().length > 5);

  // Sadə pattern: "Məhsul adı  5.0 kq  8.50"
  const lineRegex = /^(.{3,40}?)\s+([\d.,]+)\s*(kq|litr|əd|qutu|paket|şüşə|bağ|ed|kg|lt|pcs)\s+([\d.,]+)/i;

  let supplier = 'PDF Import';
  // Tədarükçü adı ilk sətrdə ola bilər
  if (lines.length > 0 && !lineRegex.test(lines[0])) {
    supplier = lines[0].trim().slice(0, 60);
  }

  for (const line of lines) {
    const m = line.match(lineRegex);
    if (m) {
      rows.push({
        supplier,
        productName: m[1].trim(),
        quantity: parseFloat(m[2].replace(',', '.')),
        unit: normalizeUnit(m[3]),
        unitPrice: parseFloat(m[4].replace(',', '.')),
        date: null,
      });
    }
  }

  return {
    rows,
    errors: [],
    successRows: rows.length,
    failedRows: 0,
    sourceType: 'digital',
    rawText: text,
  };
}

function normalizeUnit(u: string): string {
  const map: Record<string, string> = {
    kg: 'kq', lt: 'litr', pcs: 'əd', ed: 'əd',
  };
  return map[u.toLowerCase()] ?? u.toLowerCase();
}
