# FATURA OCR MASTERPLAN — DK Agency

> Tarix: 27 Aprel 2026
> Hazırlayan: Doğan + Claude CTO
> Versiya: 1.0
> Status: PLAN — İcra gözləyir

---

## VİZYON

Azərbaycan HoReCa bazarında İLK və TƏK fatura/çek OCR + food cost avtomatlaşdırma sistemi.
Dünya bazarında $100-300/ay satılan xidmət (Apicbase, MarketMan, BlueCart).
DK Agency-nin killer feature-u — tək başına məhsul ola bilər.

---

## RƏQABƏT ANALİZİ

| Xüsusiyyət | Apicbase | MarketMan | BlueCart | **DK Agency** |
|-------------|----------|-----------|----------|---------------|
| Fatura OCR | + | + | - | **+** |
| AZ dili / VÖEN | - | - | - | **+** |
| Manual giriş | + | + | + | **+** |
| Excel import | + | + | - | **+** |
| PDF import | - | + | - | **+** |
| Mobil kamera | - | Zəif | - | **+ (prioritet)** |
| Kateqoriya idarəsi | + | + | + | **+** |
| Çoxlu əlavə/silmə | + | + | - | **+** |
| Food cost auto | + | + | + | **+** |
| AI sorğu (KAZAN) | - | - | - | **+** |
| Qiymət: | $299/ay | $199/ay | $149/ay | **$49-99/ay** |

**Üstünlüyümüz:** VÖEN tanıma, AZ dili, AQTA uyğunluq, KAZAN AI, yerli qiymət.

---

## FAZA 0 — MÖVCUD VƏZİYYƏT (Hazır olan)

```
lib/invoice-ocr/
├── types.ts          — ParsedInvoice, InvoiceItem, OcrProvider tipləri
├── ocr-prompt.ts     — AZ dilində fatura parse prompt (10 qayda)
├── ocr-providers.ts  — Gemini Vision (primary) + DeepSeek Text (fallback)

app/api/invoice-ocr/
└── route.ts          — POST API (FormData → AI → JSON)
```

Hazır: Backend OCR pipeline (Gemini → DeepSeek zənciri)
Əskik: UI, DB, admin panel, mobil, import/export, kateqoriya, food cost bağlantısı

---

## FAZA 1 — DATA MODEL + DB (Həftə 1)

### 1.1 Drizzle Schema

```
invoice_categories (kateqoriya idarəsi)
├── id              UUID PK
├── name            TEXT NOT NULL        — "Ət və balıq", "Süd məhsulları", "İçkilər"...
├── slug            TEXT UNIQUE          — "et-balik", "sud"
├── color           TEXT                 — "#E11D48" (admin UI üçün rəng)
├── icon            TEXT                 — "beef", "milk", "wine" (lucide icon adı)
├── sortOrder       INT DEFAULT 0
├── isActive        BOOLEAN DEFAULT true
├── createdAt       TIMESTAMP
├── updatedAt       TIMESTAMP

invoices (ana fatura cədvəli)
├── id              UUID PK
├── userId          UUID FK → users      — kim yüklədi
├── supplierName    TEXT NOT NULL         — Tədarükçü adı
├── supplierVoen    TEXT                  — VÖEN (10 rəqəm)
├── invoiceNumber   TEXT                  — Faktura nömrəsi
├── invoiceDate     DATE NOT NULL         — Faktura tarixi
├── subtotal        INT NOT NULL          — Cəmi (qəpiklə: 1250 = 12.50 AZN)
├── vatAmount       INT DEFAULT 0         — ƏDV məbləği (qəpiklə)
├── grandTotal      INT NOT NULL          — Yekun (qəpiklə)
├── currency        TEXT DEFAULT 'AZN'
├── status          TEXT DEFAULT 'draft'  — draft | confirmed | disputed | archived
├── source          TEXT NOT NULL         — ocr_camera | ocr_upload | manual | excel | pdf
├── ocrProvider     TEXT                  — gemini | deepseek-text | null (manual)
├── ocrConfidence   REAL                  — 0.0-1.0
├── originalFileUrl TEXT                  — Orijinal fayl linki (compressed)
├── originalFileSize INT                  — Orijinal fayl ölçüsü (byte)
├── compressedSize  INT                  — Sıxılmış fayl ölçüsü (byte)
├── notes           TEXT
├── branchId        UUID FK → branches   — Hansı filial (çoxlu şubə)
├── createdAt       TIMESTAMP
├── updatedAt       TIMESTAMP
├── confirmedAt     TIMESTAMP            — Təsdiqlənmə vaxtı
├── confirmedBy     UUID FK → users      — Kim təsdiqlədi

invoice_items (fatura sətirləri — FIELD BY FIELD)
├── id              UUID PK
├── invoiceId       UUID FK → invoices   — Hansı faturaya aid
├── categoryId      UUID FK → invoice_categories — Kateqoriya
├── name            TEXT NOT NULL         — Məhsul adı
├── quantity        REAL NOT NULL         — Miqdar (1.5, 0.75)
├── unit            TEXT NOT NULL         — kq, litr, əd, qutu, paket, şüşə, bağ
├── unitPrice       INT NOT NULL          — Vahid qiymət (qəpiklə)
├── totalPrice      INT NOT NULL          — Cəmi (qəpiklə)
├── sortOrder       INT DEFAULT 0
├── isEdited        BOOLEAN DEFAULT false — OCR sonrası manual düzəliş edildimi?
├── createdAt       TIMESTAMP

invoice_imports (toplu import tarixçəsi)
├── id              UUID PK
├── userId          UUID FK → users
├── source          TEXT NOT NULL         — excel | pdf | bulk_manual
├── fileName        TEXT
├── totalRows       INT
├── successRows     INT
├── failedRows      INT
├── errorLog        JSONB                — Sətir bazasında xətalar
├── status          TEXT DEFAULT 'processing' — processing | completed | failed
├── createdAt       TIMESTAMP
```

### 1.2 Qiymət strategiyası: Qəpik

Bütün qiymətlər qəpiklə saxlanılır (integer):
- 12.50 AZN = 1250 qəpik
- Float xəta yox, dəqiq hesablama
- UI-da bölmə: `(amount / 100).toFixed(2)`

### 1.3 Seed Data — Default Kateqoriyalar

```
1.  Ət və balıq məhsulları
2.  Süd və süd məhsulları
3.  Meyvə və tərəvəz
4.  Dənli və un məhsulları
5.  Yağlar
6.  İçkilər (alkoqolsuz)
7.  İçkilər (alkoqollu)
8.  Baharatlar və souslar
9.  Qablaşdırma materialları
10. Təmizlik və gigiyena
11. İnventar və avadanlıq
12. Sair (digər)
```

---

## FAZA 2 — FATURA YÜKLƏMƏSİ + OCR (Həftə 1-2)

### 2.1 Mobil-First Kamera UI

**Route:** `/b2b-panel/fatura` (B2B Panel) + `/dashboard/faturalar` (Admin)

```
┌─────────────────────────────────┐
│  Fatura Əlavə Et                │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │     📷 Kamera ilə çək    │  │  ← Mobil: birbaşa kamera açılır
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────┐ ┌───────┐ ┌───────┐ │
│  │ Qaleriya│ │ Excel │ │  PDF  │ │  ← 3 əlavə seçim
│  └───────┘ └───────┘ └───────┘ │
│                                 │
│  ┌───────────────────────────┐  │
│  │  ✏️ Manual daxil et       │  │  ← Form açılır
│  └───────────────────────────┘  │
│                                 │
│  Son yüklənənlər:               │
│  ├─ Metro #4521 — 245.80₼ ✅   │
│  ├─ Bravo #891  — 89.20₼  ⏳   │
│  └─ Manual      — 156.00₼ ✅   │
└─────────────────────────────────┘
```

### 2.2 Şəkil Sıxılma Pipeline (Client-side)

**QAYDAL:** Server-ə yüklənmədən ƏVVƏL client-də sıxılır.

```
Orijinal foto (4-8MB, 4032x3024)
    ↓
browser-image-compression (npm package)
    ↓
Hədəf: max 1MB, max 2048px en, quality 0.7
    ↓
WebP çevrilmə (dəstəklənirsə)
    ↓
Server-ə göndər (1MB əvəzinə 5MB yox)
```

**Nəticə göstərici:**
```
Orijinal: 4.2 MB → Sıxılmış: 0.8 MB (81% azalma)
```

Mobil üçün KRİTİK — 3G/4G-də 5MB göndərmək 10+ saniyədir, 0.8MB 2 saniyə.

### 2.3 OCR Flow

```
[Şəkil yüklə] → [Client sıxılma] → [POST /api/invoice-ocr]
                                           ↓
                                    [Gemini Vision]
                                           ↓ (uğursuz?)
                                    [DeepSeek Text + Tesseract.js]
                                           ↓
                                    [JSON ParsedInvoice]
                                           ↓
                              [Review ekranı — field-by-field]
                                           ↓
                              [Təsdiqlə → DB-yə yaz]
```

### 2.4 OCR Nəticə Review Ekranı (Field-by-Field)

```
┌─────────────────────────────────────────┐
│ Fatura Review                    [Orijinal şəkil 👁️] │
│                                                       │
│ Tədarükçü: [Metro Cash & Carry    ▼] ← editable      │
│ VÖEN:      [1234567890           ] ← editable         │
│ Tarix:     [2026-04-27           ] ← date picker      │
│ Nömrə:     [FC-004521            ] ← editable         │
│ Confidence: ████████░░ 82%                            │
│                                                       │
│ ┌─────┬────────────┬─────┬──────┬────────┬─────────┐ │
│ │ ☐   │ Məhsul     │Miq. │Vahid │Qiymət  │Cəmi     │ │
│ ├─────┼────────────┼─────┼──────┼────────┼─────────┤ │
│ │ ☐   │ Toyuq eti  │ 5.0 │ kq   │ 8.50₼  │ 42.50₼  │ │  ← hər hücrə editable
│ │ ☐   │ Zeytun yağı│ 2.0 │litr  │12.00₼  │ 24.00₼  │ │
│ │ ☐   │ Kartof     │10.0 │ kq   │ 1.20₼  │ 12.00₼  │ │
│ │ ☐   │ ????       │ 1.0 │ əd   │ 0.00₼  │  0.00₼  │ │  ← OCR oxuya bilmədi
│ └─────┴────────────┴─────┴──────┴────────┴─────────┘ │
│                                                       │
│ [+ Sətir əlavə et]  [🗑️ Seçilmişləri sil]            │
│                                                       │
│ Ara cəm:  79.50₼                                     │
│ ƏDV(18%): 14.31₼                                     │
│ ───────────────────                                   │
│ YEKUN:    93.81₼                                      │
│                                                       │
│ Kateqoriya: [Ət və balıq ▼] ← hər sətir üçün ayrı   │
│                                                       │
│ [Ləğv et]              [✅ Təsdiqlə və saxla]         │
└───────────────────────────────────────────────────────┘
```

**Hər hücrə:**
- Klik → inline edit
- Tab → növbəti hücrə
- Dəyişdirilmiş hücrə sarı fond ilə göstərilir (isEdited=true)

---

## FAZA 3 — MANUAL GİRİŞ + TOPLU ƏLAVƏ (Həftə 2)

### 3.1 Manual Fatura Formu

OCR-sız, əl ilə daxil etmək üçün:

```
┌─────────────────────────────────────────┐
│ Yeni Fatura (Manual)                    │
│                                         │
│ Tədarükçü: [____________] 🔍 son 10    │  ← autocomplete (son tədarükçülər)
│ VÖEN:      [____________]               │
│ Tarix:     [📅 27.04.2026 ]            │
│ Nömrə:     [____________] (optional)    │
│ Filial:    [Baş ofis ▼]                │  ← çoxlu şubə
│                                         │
│ MƏHSULLAR:                              │
│ ┌──────────┬─────┬────┬───────┬──────┐  │
│ │ Ad       │Miq. │Vah.│Qiymət │Kat.  │  │
│ ├──────────┼─────┼────┼───────┼──────┤  │
│ │ [      ] │[   ]│[▼] │[     ]│[ ▼]  │  │  ← sətir 1
│ │ [      ] │[   ]│[▼] │[     ]│[ ▼]  │  │  ← sətir 2
│ │ [      ] │[   ]│[▼] │[     ]│[ ▼]  │  │  ← sətir 3
│ └──────────┴─────┴────┴───────┴──────┘  │
│                                         │
│ [+ 1 sətir]  [+ 5 sətir]  [+ 10 sətir] │  ← toplu sətir əlavəsi
│                                         │
│ Yekun: 0.00₼  ƏDV: 0.00₼               │
│                                         │
│ [Qaralama saxla]    [✅ Təsdiqlə]       │
└─────────────────────────────────────────┘
```

**Smart Features:**
- Məhsul adı yazarkən autocomplete (əvvəlki faturalardan)
- Son istifadə olunan vahid yadda qalır
- Son istifadə olunan kateqoriya yadda qalır
- Tab ilə sürətli naviqasiya
- Enter → növbəti sətir avtomatik açılır

### 3.2 Toplu Əlavə (Bulk Add)

```
[+ 5 sətir] → 5 boş sətir açılır
[+ 10 sətir] → 10 boş sətir açılır
[Clipboard-dən yapışdır] → Excel-dən copy-paste (tab-separated)
```

### 3.3 Toplu Silmə (Bulk Delete)

```
☑️ Hamısını seç (15 sətir)
☑️ Toyuq eti — 42.50₼
☑️ Zeytun yağı — 24.00₼
☐  Kartof — 12.00₼

[🗑️ 2 seçilmişi sil]  ← confirmation dialog
```

Fatura səviyyəsində də toplu silmə:
```
Fatura siyahısı:
☑️ Metro #4521 — 245.80₼
☑️ Bravo #891 — 89.20₼
☐  Manual — 156.00₼

[🗑️ 2 faturanı sil]  [📥 2 faturanı export et]
```

---

## FAZA 4 — EXCEL + PDF İMPORT (Həftə 2-3)

### 4.1 Excel Import

**Dəstəklənən formatlar:** .xlsx, .xls, .csv

```
┌─────────────────────────────────────────┐
│ Excel-dən Fatura Import                 │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │  📄 Excel faylı buraya sürükləyin │   │
│ │     və ya [Fayl seçin]            │   │
│ └───────────────────────────────────┘   │
│                                         │
│ Şablon yüklə: [📥 DK Fatura Şablonu]  │  ← standart Excel template
│                                         │
│ Sütun uyğunlaşdırma:                    │
│ ┌──────────────┬───────────────────┐    │
│ │ Bizim sahə   │ Excel sütunu      │    │
│ ├──────────────┼───────────────────┤    │
│ │ Məhsul adı   │ [A — Product ▼]  │    │  ← dropdown mapping
│ │ Miqdar        │ [B — Qty ▼]      │    │
│ │ Vahid         │ [C — Unit ▼]     │    │
│ │ Vahid qiymət  │ [D — Price ▼]    │    │
│ │ Kateqoriya    │ [Auto-detect ▼]  │    │
│ └──────────────┴───────────────────┘    │
│                                         │
│ Önizləmə (ilk 5 sətir):                │
│ ┌────────────┬─────┬────┬───────┐       │
│ │ Toyuq eti  │ 5.0 │ kq │ 8.50  │ ✅   │
│ │ Zeytun yağı│ 2.0 │ lt │12.00  │ ✅   │
│ │ ???        │ abc │ ?? │ xyz   │ ❌   │  ← xətalı sətir
│ └────────────┴─────┴────┴───────┘       │
│                                         │
│ 47 sətir tapıldı: 45 ✅ / 2 ❌         │
│                                         │
│ [Ləğv et]  [Xətalıları atla + Import]  │
└─────────────────────────────────────────┘
```

**Excel Template Strukturu:**

| Sütun | Ad | Nümunə | Tələb |
|-------|-----|--------|-------|
| A | Tədarükçü | Metro | zorunlu |
| B | Tarix | 27.04.2026 | zorunlu |
| C | Faktura No | FC-4521 | optional |
| D | Məhsul | Toyuq eti | zorunlu |
| E | Miqdar | 5.0 | zorunlu |
| F | Vahid | kq | zorunlu |
| G | Vahid qiymət | 8.50 | zorunlu |
| H | Kateqoriya | Ət | optional (auto-detect) |

**Texnologiya:** `xlsx` (SheetJS) npm paketi — server-side parse, browser uyğun.

### 4.2 PDF Import

**PDF Fatura Tipləri:**
1. **Digital PDF** (Metro, Bravo rəsmi faturaları) → text extract (pdf-parse)
2. **Scan PDF** (skan edilmiş kağız fatura) → OCR pipeline-a yönləndir

```
PDF yüklə → pdf-parse ilə text çıxar
    ↓
Text tapıldı? → DeepSeek text parse → JSON → Review ekranı
    ↓ (text yox — skan)
Hər səhifəni şəklə çevir → Gemini Vision OCR → JSON → Review ekranı
```

**PDF Xüsusiyyətləri:**
- Çox səhifəli PDF → hər səhifə ayrı fatura kimi parse
- Batch import: 1 PDF-dən 5 fatura çıxa bilər
- Import tarixçəsi log-lanır (invoice_imports cədvəli)

### 4.3 Import Xəta İdarəsi

Hər import prosesində:
```json
{
  "totalRows": 47,
  "successRows": 45,
  "failedRows": 2,
  "errorLog": [
    { "row": 23, "field": "unitPrice", "value": "abc", "error": "Rəqəm deyil" },
    { "row": 41, "field": "quantity", "value": "-5", "error": "Mənfi miqdar" }
  ]
}
```

Admin xəta log-unu görür, xətalı sətirləri manual düzəldə bilər.

---

## FAZA 5 — KATEQORİYA İDARƏSİ (Həftə 3)

### 5.1 Admin Kateqoriya Paneli

**Route:** `/dashboard/fatura-kateqoriyalar`

```
┌─────────────────────────────────────────────┐
│ Fatura Kateqoriyaları          [+ Yeni]     │
│                                             │
│ ┌─────┬──────────────────┬──────┬────┬────┐ │
│ │ ☐   │ Ad               │Rəng  │Sıra│ #  │ │
│ ├─────┼──────────────────┼──────┼────┼────┤ │
│ │ ☐   │ 🥩 Ət və balıq   │ 🔴   │ 1  │ 47 │ │  ← 47 məhsul bu kateqoriyada
│ │ ☐   │ 🥛 Süd məhsulları│ 🔵   │ 2  │ 23 │ │
│ │ ☐   │ 🥕 Meyvə/tərəvəz │ 🟢   │ 3  │ 61 │ │
│ │ ☐   │ 🍷 İçkilər (alko) │ 🟣   │ 4  │ 12 │ │
│ │ ☐   │ 🧹 Təmizlik       │ 🟡   │ 5  │ 8  │ │
│ └─────┴──────────────────┴──────┴────┴────┘ │
│                                             │
│ [🗑️ Seçilmişləri sil]  [Sıralamany dəyiş]  │
│                                             │
│ ⚠️ Silmə: kateqoriya silinərsə, aid        │
│    məhsullar "Sair" kateqoriyasına keçir.   │
└─────────────────────────────────────────────┘
```

### 5.2 AI Auto-Categorization

OCR və ya manual giriş zamanı, məhsul adına görə avtomatik kateqoriya təxmini:

```
"Toyuq eti" → 🥩 Ət və balıq (95%)
"Coca Cola 1L" → 🥤 İçkilər - alkoqolsuz (99%)
"Fairy 500ml" → 🧹 Təmizlik (98%)
```

İstifadəçi dəyişə bilər — dəyişiklik gələcək üçün öyrənilir (keyword → category mapping DB-də).

### 5.3 Kateqoriya Qaydaları (Auto-mapping)

```
category_rules (keyword → category mapping)
├── id          UUID PK
├── keyword     TEXT NOT NULL    — "toyuq", "mal əti", "dana"
├── categoryId  UUID FK
├── createdBy   TEXT             — 'system' | 'user_manual' | 'ai_learned'
├── confidence  REAL DEFAULT 1.0
```

---

## FAZA 6 — FAYL SIXILMA SİSTEMİ (Həftə 3)

### 6.1 Client-Side Sıxılma (Yükləmədən əvvəl)

```typescript
// browser-image-compression istifadəsi
const options = {
  maxSizeMB: 1,           // Max 1MB
  maxWidthOrHeight: 2048, // Max 2048px
  useWebWorker: true,     // UI bloklanmır
  fileType: 'image/webp', // WebP çevrilmə (dəstəklənirsə)
  initialQuality: 0.7,    // 70% keyfiyyət
};
```

### 6.2 Server-Side Backup Sıxılma

Client sıxılma uğursuz olarsa (köhnə brauzer):
- `sharp` npm paketi ilə server-də resize + compress
- Max 2048px, quality 70, WebP output

### 6.3 Sıxılma Göstəricisi (UX)

```
┌──────────────────────────────────┐
│ 📷 fatura_metro.jpg              │
│ Orijinal: 4.2 MB                │
│ Sıxılmış: 0.8 MB  ✅ 81% azalma │
│ ████████████████░░░░ Yüklənir... │
└──────────────────────────────────┘
```

### 6.4 Storage Strategiyası

- **İnkişaf:** Supabase Storage (ilk 1GB pulsuz)
- **Production:** Cloudflare R2 (10GB pulsuz, $0.015/GB sonra)
- Orijinal SAXLANILMIR — yalnız sıxılmış versiya
- 90 gündən köhnə fatura şəkilləri avtomatik silinir (məlumat qalır)

---

## FAZA 7 — ADMİN + SUPER ADMİN PANEL (Həftə 3-4)

### 7.1 Rol İcazələri

| Əməliyyat | B2B Üzv (Sahib) | Admin | Super Admin |
|-----------|-----------------|-------|-------------|
| Öz faturalarını görmək | ✅ | ✅ | ✅ |
| Fatura əlavə etmək | ✅ | ✅ | ✅ |
| Öz faturalarını silmək | ✅ | ✅ | ✅ |
| Bütün faturaları görmək | ❌ | ✅ | ✅ |
| Kateqoriya idarəsi | ❌ | ✅ | ✅ |
| Toplu silmə | ❌ | ✅ | ✅ |
| Import/Export | ✅ (öz) | ✅ (hamı) | ✅ (hamı) |
| OCR provider ayarları | ❌ | ❌ | ✅ |
| İstifadə statistikası | ❌ | ✅ | ✅ |
| API key idarəsi | ❌ | ❌ | ✅ |

### 7.2 Admin Fatura Paneli

**Route:** `/dashboard/faturalar`

```
┌──────────────────────────────────────────────────────┐
│ Faturalar                    [+ Yeni] [📥 Import]   │
│                                                      │
│ Filter: [Hamısı ▼] [Bu ay ▼] [Metro... 🔍] [Kat. ▼]│
│                                                      │
│ ☑️ Hamısını seç (3/156)                              │
│ ┌────┬───────────┬──────────┬────────┬───────┬─────┐ │
│ │ ☐  │Tədarükçü  │Tarix     │Yekun   │Mənbə  │Stat │ │
│ ├────┼───────────┼──────────┼────────┼───────┼─────┤ │
│ │ ☑️ │Metro #4521│27.04.2026│245.80₼ │📷 OCR │ ✅  │ │
│ │ ☑️ │Bravo #891 │26.04.2026│ 89.20₼ │📷 OCR │ ⏳  │ │
│ │ ☐  │Manual     │25.04.2026│156.00₼ │✏️ Əl  │ ✅  │ │
│ │ ☑️ │Excel batch│24.04.2026│1240.00₼│📊 XLS │ ✅  │ │
│ └────┴───────────┴──────────┴────────┴───────┴─────┘ │
│                                                      │
│ [🗑️ 3 sil] [📥 CSV Export] [📊 Excel Export]        │
│                                                      │
│ Pagination: ← 1 2 3 ... 16 →                        │
│                                                      │
│ 📊 Bu ay: 156 fatura | 12,450.80₼ | Ort: 79.81₼    │
└──────────────────────────────────────────────────────┘
```

### 7.3 Super Admin — OCR Statistika

```
┌──────────────────────────────────────────┐
│ OCR Statistika (Super Admin)             │
│                                          │
│ Bu ay:                                   │
│ ├─ Gemini Vision: 89 fatura (ort 2.1s)  │
│ ├─ DeepSeek Text: 12 fatura (ort 3.4s)  │
│ ├─ Manual: 45 fatura                    │
│ ├─ Excel: 23 import (412 sətir)         │
│ └─ PDF: 8 import (31 sətir)             │
│                                          │
│ OCR Dəqiqlik: 87% (field-by-field)      │
│ Ort. düzəliş: 1.3 sahə/fatura          │
│                                          │
│ API Xərci:                               │
│ ├─ Gemini: $0.42 (89 req × ~$0.005)     │
│ ├─ DeepSeek: $0.02 (12 req × ~$0.002)   │
│ └─ Cəmi: $0.44                           │
│                                          │
│ Storage: 67 MB (89 şəkil, ort 0.75 MB)  │
└──────────────────────────────────────────┘
```

---

## FAZA 8 — MOBİL UX (BÜTÜN FAZALARDA)

### 8.1 Mobil Dizayn Qaydaları

```
QAYDAL — HƏR EKRAN MOBİL-FIRST!

1. Touch target: minimum 44x44px
2. Form input: minimum 48px hündürlük
3. Kamera butonu: ekranın ən böyük elementi
4. Tablo → Kart görünüşü (mobil-də)
5. Swipe-to-delete (sətir silmə)
6. Bottom sheet (modal əvəzinə)
7. Floating action button (+ Fatura)
8. Offline-first: draft lokal saxlanılır, internet olanda sync
```

### 8.2 Mobil Kart Görünüşü (Tablo əvəzinə)

Desktop-da cədvəl, mobil-də kart:

```
┌────────────────────────┐
│ Metro Cash & Carry     │
│ #FC-4521 · 27.04.2026 │
│                        │
│ 12 məhsul · 245.80₼   │
│                        │
│ 📷 OCR · ✅ Təsdiqlənib│
│                        │
│ [Bax]    [✏️]    [🗑️] │
└────────────────────────┘
```

### 8.3 Kamera İntegrasiyası

```html
<!-- Mobil-də birbaşa kamera açılır -->
<input
  type="file"
  accept="image/*"
  capture="environment"  ← arxa kamera (fatura çəkmək üçün)
/>
```

Xüsusiyyətlər:
- Arxa kamera default (environment)
- Flash dəstəyi (qaranlıq mühit)
- Crop/rotate imkanı (client-side)
- Çoxlu şəkil seçimi (galleriyadan)

---

## FAZA 9 — FOOD COST BAĞLANTISI (Həftə 4-5)

### 9.1 Avtomatik Food Cost Hesablama

Fatura təsdiqlənəndən sonra:

```
invoice_items → kateqoriya üzrə cəmlə → food_cost_report
```

```
Bu ay Food Cost:
├─ Ət və balıq:     2,450.00₼  (28%)
├─ Meyvə/tərəvəz:  1,200.00₼  (14%)
├─ Süd məhsulları:    890.00₼  (10%)
├─ İçkilər:         1,100.00₼  (13%)
├─ Sair:            3,060.00₼  (35%)
├─ ──────────────────────────────────
└─ CƏMİ:           8,700.00₼  (100%)

Gəlir (bu ay):    28,000.00₼
Food Cost %:           31.1%   ← SAĞLAM (hədəf: 28-35%)
```

### 9.2 KAZAN AI Bağlantısı

KAZAN AI-ya yeni qabiliyyət:

```
İstifadəçi: "Bu ay ən çox nəyə xərcləmişəm?"
KAZAN:      "Bu ay ən böyük xərc kateqoriyanız Ət və balıq (2,450₼, 28%).
             Keçən aya nisbətən 12% artıb. Tövsiyə: tədarükçü müqayisəsi edin."

İstifadəçi: "Metro ilə Bravo-nu müqayisə et"
KAZAN:      "Metro: 45 fatura, ort. 189₼, ən çox Ət kateqoriyası
             Bravo: 23 fatura, ort. 156₼, ən çox İçki kateqoriyası
             Metro toyuq əti: 8.50₼/kq, Bravo: 9.20₼/kq — Metro 8% ucuz."
```

### 9.3 Toolkit Food Cost Kalkulyatoru Yeniləməsi

Mövcud `/toolkit/food-cost` → real data ilə işləyəcək:

```
Giriş mənbəyi: [Manuel ▼]  →  [Faturalardan avtomatik ▼]
                                ↑ YENİ — real fatura data-sı
```

---

## FAZA 10 — EXPORT + HESABAT (Həftə 5)

### 10.1 Export Formatları

| Format | Məzmun | İstifadə |
|--------|--------|----------|
| CSV | Fatura sətirləri | Excel-ə import |
| Excel (.xlsx) | Fatura + xülasə vərəqi | Mühasibat |
| PDF | Formatlı fatura hesabatı | Çap/arxiv |
| JSON | API data | Entegrasiya |

Bütün exportlar: **UTF-8 BOM** (`\uFEFF`) — Azərbaycan hərfləri (ə, ı, ö, ü, ş, ç, ğ) düzgün görünsün.

### 10.2 Aylıq Hesabat

```
📊 Aprel 2026 Fatura Hesabatı

Ümumi fatura sayı:     156
Ümumi xərc:        12,450.80₼
Ort. fatura:           79.81₼
Ən böyük fatura:      890.00₼ (Metro, 15 Aprel)
Ən çox tədarükçü:     Metro (45 fatura)

Kateqoriya dağılımı:
████████████░░░░  Ət: 28%
████████░░░░░░░░  İçki: 13%
███████░░░░░░░░░  M/T: 14%
```

---

## TEXNİK STACK

| Komponent | Texnologiya | Qeyd |
|-----------|-------------|------|
| OCR (Primary) | Gemini 2.5 Flash Vision | Şəkil → JSON, ~$0.005/req |
| OCR (Fallback) | DeepSeek Chat | Text → JSON, ~$0.002/req |
| Client OCR | Tesseract.js (gələcək) | Offline OCR, pulsuz |
| Şəkil sıxılma | browser-image-compression | Client-side, WebP |
| Server sıxılma | sharp | Backup, resize |
| Excel parse | SheetJS (xlsx) | .xlsx/.xls/.csv |
| PDF parse | pdf-parse | Digital PDF → text |
| PDF render | pdf-lib / canvas (gələcək) | Skan PDF → image → OCR |
| DB | Neon PostgreSQL + Drizzle | Qəpik bazalı qiymətlər |
| Storage | Supabase Storage → R2 | Sıxılmış fayllar |
| UI Framework | React + Tailwind + shadcn | Mövcud stack |

---

## TƏQVİM

| Həftə | Faza | Nəticə |
|-------|------|--------|
| **1** | DB Schema + OCR Review UI | Fatura yüklə → AI oxusun → field-by-field redaktə → DB-yə yaz |
| **2** | Manual giriş + Excel import | Əl ilə fatura daxil et, Excel-dən toplu import |
| **3** | PDF import + Kateqoriya + Sıxılma | PDF fatura, kateqoriya idarəsi, client-side sıxılma |
| **4** | Admin panel + Toplu əməliyyatlar | Dashboard, bulk delete, filter, export |
| **5** | Food cost bağlantısı + KAZAN AI | Avtomatik food cost, AI sorğu, hesabatlar |

---

## UĞUR METRİKLƏRİ

| Metrik | Hədəf |
|--------|-------|
| OCR dəqiqliyi | >85% field-by-field |
| Ortalama OCR vaxtı | <5 saniyə |
| Şəkil sıxılma | >70% azalma |
| Mobil istifadə nisbəti | >60% |
| Excel import uğuru | >95% sətir |
| Aylıq fatura sayı/müştəri | >20 |
| Food cost hesablama dəqiqliyi | >95% |

---

## RİSKLƏR VƏ AZALTMA

| Risk | Ehtimal | Təsir | Azaltma |
|------|---------|-------|---------|
| Gemini API limiti | Orta | Yüksək | DeepSeek fallback + client Tesseract.js |
| Bulanıq şəkil | Yüksək | Orta | Confidence <0.7 → manual review məcburi |
| AZ dilində OCR xətası | Orta | Orta | Kril/latın dual parse, dictionary-based correction |
| Mobil kamera keyfiyyəti | Orta | Orta | Client-side enhance (contrast, brightness) |
| Storage xərci | Aşağı | Aşağı | Sıxılma + 90 gün auto-delete + R2 (ucuz) |

---

## ÖNCƏLİK SIRASI — İCRA PLANI

```
1. DB Migration (schema yaz, push et)           ← İLK ADDIM
2. Review UI (OCR nəticəni field-by-field göstər)
3. Client sıxılma + kamera
4. Manual giriş formu
5. Kateqoriya CRUD
6. Admin panel (siyahı + filter + bulk ops)
7. Excel import
8. PDF import
9. Export (CSV/Excel/PDF)
10. Food cost bağlantısı
11. KAZAN AI invoice sorğu
12. Çoxlu şubə
```

---

> Bu plan DK Agency-nin **dünya çapında rəqabət edə biləcək** bir məhsulunun texniki yol xəritəsidir.
> Azərbaycan bazarında BU İMKAN HEÇ KİMDƏ YOXDUR.
> İcra sürəti hər şeyi müəyyən edir — Supy gəlmədən bazar tutulmalıdır.
