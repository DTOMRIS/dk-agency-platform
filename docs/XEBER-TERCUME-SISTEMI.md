# Xəbər Tərcümə Sistemi — Texniki Sənəd

## Nə quruldu?

RSS feedlərdən HoReCa xəbərləri çəkilir, Azərbaycan dilinə tərcümə olunur və admin təsdiqindən sonra saytda göstərilir.

---

## Axın (Flow)

```
RSS Feeds (EN/TR/AZ)
       ↓
  fetch-news.mjs
       ↓
  Tərcümə (DeepSeek/Gemini API)
       ↓
  pendingNews.json (gözləyən)
       ↓
  Admin panel (/dashboard/haberler → RSS Növbəsi)
       ↓
  Təsdiq / Rədd
       ↓
  curatedNews.json (təsdiqlənmiş)
       ↓
  /haberler səhifəsi (ictimai)
```

---

## Nə tərcümə olunur?

| Sahə | Mənbə | Tərcümə |
|-----|-------|---------|
| **title** | RSS başlığı | → titleAz |
| **excerpt** | RSS qısa xülasə (ilk ~300 simvol) | → excerptAz |

**Mənbə:** RSS feedləri yalnız **başlıq** və **qısa xülasə** verir. Tam mətn (full article body) RSS-də yoxdur.

---

## Fayl strukturu

```
lib/data/
├── curatedNews.json   # Təsdiqlənmiş xəbərlər (saytda görünür)
├── pendingNews.json   # Gözləyən xəbərlər (admin təsdiqi lazımdır)
```

**Hər xəbər obyekti:**
```json
{
  "id": "curated-xxx",
  "title": "Original English title",
  "excerpt": "Original English excerpt...",
  "titleAz": "Azərbaycan dilində başlıq",
  "excerptAz": "Azərbaycan dilində xülasə",
  "sourceUrl": "https://...",
  "source": "Hospitality Net",
  "date": "...",
  "category": "Report",
  "type": "Report",
  "image": "...",
  "author": "..."
}
```

---

## Tərcümə API

- **DeepSeek** (prioritet): `DEEPSEEK_API_KEY` — `.env.local` və ya GitHub Secrets
- **Gemini** (alternativ): `GEMINI_API_KEY`
- AZ dilində mənbələr (Turizmplus, Turizm Media): tərcümə olunmur

**Skript:** `scripts/fetch-news.mjs`  
**Əmrlər:**
```bash
npm run fetch:news                    # Tərcümə ilə
npm run fetch:news -- --no-translate   # Tərcümə olmadan
npm run fetch:news -- --limit=5        # Max 5 yeni xəbər
```

---

## UI-da göstərilən

`lib/data/editorialContent.ts` → `getCuratedNews()`:
- `titleAz || title` — başlıq
- `excerptAz || excerpt` — xülasə

Yəni tərcümə varsa AZ göstərilir, yoxdursa orijinal.

---

## Problem: "Başlıq tərcümə oldu, xəbər qaldı"

**Mümkün səbəblər:**

1. **RSS-də tam mətn yoxdur**  
   RSS yalnız qısa xülasə (excerpt) verir. Tam məqalə mətni çəkilmir və tərcümə olunmur.

2. **excerptAz boş və ya səhv**  
   API xətası, timeout və ya limit səbəbilə excerpt tərcümə olmaya bilər. Bu halda `excerptAz` əvəzinə orijinal `excerpt` göstərilir.

3. **Tam məqalə tərcüməsi istəyirsinizsə**  
   Bu halda:
   - `sourceUrl`-dən tam səhifə çəkmək (fetch/scrape)
   - Tam mətni tərcümə etmək
   - Öz məqalə səhifəmizdə göstərmək  

   lazımdır. Hazırda bu addım yoxdur.

---

## Növbəti addımlar (təklif)

Əgər **tam xəbər mətni** Azərbaycan dilində lazımdırsa:

1. **Full article fetch**  
   `sourceUrl`-ə HTTP request, HTML-dən mətn çıxarma (cheerio, puppeteer və s.).

2. **Uzun mətn tərcüməsi**  
   DeepSeek/Gemini API limitləri (məs. 2000 simvol) üçün mətni hissələrə bölüb tərcümə etmək.

3. **Öz məqalə səhifəsi**  
   `/haberler/[slug]` kimi səhifədə tərcümə olunmuş tam mətn göstərmək (indiki sistem yalnız excerpt + link verir).

---

## Əlaqədar fayllar

| Fayl | Vəzifə |
|------|--------|
| `scripts/fetch-news.mjs` | RSS çək, tərcümə et, pending-ə yaz |
| `scripts/approve-news.mjs` | Lokal təsdiq (pending → curated) |
| `lib/data/editorialContent.ts` | curatedNews oxu, NewsItem-a map |
| `lib/data/editorialTypes.ts` | NewsItem tipi |
| `components/editorial/HaberlerPageClient.tsx` | /haberler UI |
| `app/dashboard/haberler/page.tsx` | Admin RSS növbəsi |
| `app/api/admin/news/*` | Təsdiq/rədd API |
