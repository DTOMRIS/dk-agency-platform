/**
 * @file ocr-prompt.ts
 * @purpose Structured prompt for parsing Azerbaijani invoices via AI vision
 */

export const INVOICE_OCR_PROMPT = `Sən faktura OCR ekspertisən. Bu şəkildəki Azərbaycan fakturasını analiz et.

YALNIZ JSON formatında cavab ver, heç bir izahat əlavə etmə:

{
  "supplier": "Tədarükçü/mağaza adı",
  "supplierVoen": "VÖEN (10 rəqəm, varsa, yoxsa null)",
  "date": "YYYY-MM-DD (faktura tarixi)",
  "invoiceNumber": "Faktura/çek nömrəsi (varsa, yoxsa null)",
  "items": [
    {
      "name": "Məhsul adı (orijinal dildə)",
      "quantity": 0.0,
      "unit": "kq|litr|əd|qutu|paket|şüşə|bağ",
      "unitPrice": 0.00,
      "totalPrice": 0.00
    }
  ],
  "subtotal": 0.00,
  "vat": 0.00,
  "grandTotal": 0.00,
  "currency": "AZN",
  "confidence": 0.0,
  "notes": null
}

QAYDALAR:
1. Bütün qiymətlər AZN-dir (başqa göstərilmədikcə)
2. Tarix DD.MM.YYYY formatındadırsa, YYYY-MM-DD-yə çevir
3. Miqdarı onluq kəsr ilə yaz (1.5, 0.75)
4. Oxunmayan hissədə "?" yaz, UYDURMA
5. confidence: 0.95+ = əla oxunur, 0.7-0.95 = yaxşı, <0.7 = bulanıq/əyri
6. Azərbaycan/Kiril/Türk dilindəki məhsul adlarını dəyişmə, olduğu kimi yaz
7. Əgər şəkil faktura deyilsə, boş items array qaytar, confidence: 0, notes: "Bu faktura deyil"
8. subtotal/vat/grandTotal ayrıca göstərilmirsə, items cəmindən hesabla
9. VÖEN adətən 10 rəqəmdir, "VÖEN:" və ya "TIN:" yanında olur
10. Vahid abbreviatura: кг/kq=kq, л/l=litr, шт/əd=əd, кор/qut=qutu`.trim();

export const INVOICE_OCR_SYSTEM = `Sən dəqiq və etibarlı faktura OCR sistemisən. Yalnız JSON çıxışı ver. Heç vaxt uydurma məlumat əlavə etmə. Oxuya bilmədiklərini "?" ilə işarələ.`.trim();
