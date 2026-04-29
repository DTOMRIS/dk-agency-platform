/**
 * @file ocr-providers.ts
 * @purpose Multi-provider OCR chain: Gemini → DeepSeek Vision → DeepSeek Text
 */

import { INVOICE_OCR_PROMPT, INVOICE_OCR_SYSTEM } from './ocr-prompt';
import type { ParsedInvoice, OcrProvider, OcrProviderResult } from './types';

// ── Gemini Vision (PRIMARY) ─────────────────────────────────────────

async function callGeminiVision(
  base64: string,
  mimeType: string,
): Promise<OcrProviderResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, error: 'GEMINI_API_KEY not set', provider: 'gemini' };

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-04-17';
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: base64 } },
            { text: INVOICE_OCR_PROMPT },
          ],
        },
      ],
      config: {
        systemInstruction: INVOICE_OCR_SYSTEM,
        temperature: 0.1,
      },
    });

    const text = response.text ?? '';
    if (!text) return { ok: false, error: 'Gemini empty response', provider: 'gemini' };

    return { ok: true, rawText: text, provider: 'gemini' };
  } catch (err) {
    return { ok: false, error: String(err), provider: 'gemini' };
  }
}

// ── DeepSeek Text (FALLBACK — vision dəstəkləmir, yalnız text parse) ─

// DeepSeek-chat vision dəstəkləmir. Bu fallback yalnız əl ilə daxil
// edilmiş fatura mətni üçündür (gələcək: Tesseract.js client-side OCR → text → DeepSeek)
async function callDeepSeekText(
  invoiceText: string,
): Promise<OcrProviderResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return { ok: false, error: 'DEEPSEEK_API_KEY not set', provider: 'deepseek-text' };

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.1,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: INVOICE_OCR_SYSTEM },
          { role: 'user', content: `Bu faktura mətnini JSON formatına çevir:\n\n${invoiceText}\n\n${INVOICE_OCR_PROMPT}` },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: `DeepSeek ${response.status}: ${body}`, provider: 'deepseek-text' };
    }

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content ?? '';
    if (!text) return { ok: false, error: 'DeepSeek empty response', provider: 'deepseek-text' };

    return { ok: true, rawText: text, provider: 'deepseek-text' };
  } catch (err) {
    return { ok: false, error: String(err), provider: 'deepseek-text' };
  }
}

// ── JSON Parse with fallback ────────────────────────────────────────

function extractJsonFromText(text: string): string {
  // Try to find JSON in markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Try to find raw JSON object
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) return braceMatch[0];

  return text;
}

export function parseOcrResponse(rawText: string, provider: OcrProvider): ParsedInvoice | null {
  const jsonStr = extractJsonFromText(rawText);

  try {
    const parsed = JSON.parse(jsonStr);

    // Validate required fields
    if (!parsed.items || !Array.isArray(parsed.items)) return null;

    return {
      supplier: parsed.supplier?.trim() || '?',
      supplierVoen: parsed.supplierVoen?.trim() || null,
      date: parsed.date || new Date().toISOString().slice(0, 10),
      invoiceNumber: parsed.invoiceNumber || null,
      items: parsed.items.map((item: Record<string, unknown>, i: number) => ({
        name: String(item.name || '?'),
        quantity: Number(item.quantity) || 0,
        unit: String(item.unit || 'əd'),
        unitPrice: Number(item.unitPrice) || 0,
        totalPrice: Number(item.totalPrice) || 0,
        _sortOrder: i,
      })),
      subtotal: Number(parsed.subtotal) || 0,
      vat: Number(parsed.vat) || 0,
      grandTotal: Number(parsed.grandTotal) || 0,
      currency: parsed.currency || 'AZN',
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
      notes: parsed.notes || null,
      provider,
    };
  } catch {
    return null;
  }
}

// ── Main OCR function ───────────────────────────────────────────────

export async function runInvoiceOcr(
  base64: string,
  mimeType: string,
): Promise<{ data: ParsedInvoice | null; error?: string; provider: OcrProvider }> {
  // 1. Try Gemini vision (primary — şəkil oxuyur)
  const geminiResult = await callGeminiVision(base64, mimeType);
  if (geminiResult.ok && geminiResult.rawText) {
    const parsed = parseOcrResponse(geminiResult.rawText, 'gemini');
    if (parsed) return { data: parsed, provider: 'gemini' };
  }

  // 2. Gemini uğursuz → xəta qaytarırıq
  // DeepSeek-chat vision dəstəkləmir, yalnız text parse edə bilər
  // Gələcəkdə: client-side Tesseract.js → text → callDeepSeekText()
  return {
    data: null,
    error: geminiResult.error || 'Gemini OCR uğursuz oldu. GEMINI_API_KEY yoxlayın.',
    provider: 'gemini',
  };
}

// Text-based parse (KAZAN AI chat-dan manual fatura mətni üçün)
export async function runInvoiceTextParse(
  invoiceText: string,
): Promise<{ data: ParsedInvoice | null; error?: string; provider: OcrProvider }> {
  const dsResult = await callDeepSeekText(invoiceText);
  if (dsResult.ok && dsResult.rawText) {
    const parsed = parseOcrResponse(dsResult.rawText, 'deepseek-text');
    if (parsed) return { data: parsed, provider: 'deepseek-text' };
  }
  return { data: null, error: dsResult.error || 'Text parse failed', provider: 'deepseek-text' };
}
