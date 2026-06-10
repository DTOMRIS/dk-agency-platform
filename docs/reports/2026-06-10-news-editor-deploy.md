# 2026-06-10 — Manuel Haber Editörü Deploy + Hotfix Raporu

> **Yapılan iş:** SportArena.az admin paneli stilinde manuel haber editörü
> ve sade sosyal paylaşım butonları DK Agency Platform'a eklendi.
> Schema + frontend + backend + paylaşım. Deploy sırasında 1 lint hatası
> CI'yi kırdı, hotfix ile düzeltildi. Son durum: **canlı**.

---

## TL;DR

- ✅ TASK-0252 mergelendi (PR #335) — backend tamam
- ✅ TASK-0253 hotfix mergelendi (PR #336) — CI 503 çözüldü
- ✅ Site canlı, manuel haber yazılabilir, paylaş butonları aktif
- ⏳ B adımı (AI başlık+özet+SEO — DeepSeek) bekliyor — TASK-0254 olacak
- ⏳ Bilinen sınırlamalar var (rich editor, Cloudinary media library, Telegram bot)

---

## 1. Eklenen Özellikler

### Frontend
- **`components/dashboard/NewsEditorForm.tsx`** (883 satır)
  - 4 dilde başlık/özet/içerik (AZ/RU/EN/TR)
  - Slug auto-generate (Azerice harf dönüşümü: ə→e, ş→s, ç→c, ğ→g, ı→i)
  - Kategori seçici (finance, operations, growth, market, technology)
  - Yazar, yayın tarihi, status (draft/published/archived)
  - SEO title (max 70) + SEO description (max 160)
  - Featured image (Cloudinary upload + `compressImage` + `validateImage`)
  - **SportArena özel toggle'lar:**
    - `Xəbər manşet olsun?` (boolean — ana sayfa hero)
    - `Xəbər top olsun?` (boolean — top widget)
    - `Xəbər gündəm olsun?` (boolean — trending)
    - `Xəbərin tipi?` (radio: foto/video/heç biri)
    - `Telegram kanalına göndərilsin?` (flag — gerçek bot integration sonra)
    - `Şəkilin üzərinə loqo vurulsun?` (flag — Cloudinary overlay sonra)
  - Auto-save localStorage her 30 saniye
  - Submit handler: `POST /api/news/admin` + redirect `/dashboard/xeberler`

- **`components/news/ShareButtons.tsx`** — sade sosyal paylaşım
  - **WhatsApp:** `wa.me/?text=${title}+${url}`
  - **Telegram:** `t.me/share/url?url=${url}&text=${title}`
  - **Facebook:** `facebook.com/sharer/sharer.php?u=${url}`
  - **Copy URL:** `navigator.clipboard.writeText` + i18n toast
  - Twitter/LinkedIn/Email YOK (Tomris seçti — sade set)

- **Routes:**
  - `app/dashboard/xeberler/yeni/page.tsx`
  - `app/[locale]/dashboard/xeberler/yeni/page.tsx` (i18n)

- **Dashboard'a buton:** `app/dashboard/xeberler/page.tsx:485` → "+ Yeni Xəbər" `<Link>` (hotfix sonrası)

### Backend
- **`app/api/news/admin/route.ts`** (113 satır)
  - GET (mevcut) — admin haber listesi
  - **POST (yeni)** — Zod `CreateNewsSchema` ile validation:
    - En az 1 dilde başlık zorunlu (`.refine()`)
    - Tüm dil alanları optional
    - Kategori enum, status enum, news_type enum
    - SEO title max 70, SEO description max 160
  - Auth: `canAccessNewsAdmin` (mevcut helper)
  - 400 / 403 / 500 / 201 dönüş

- **`lib/repositories/newsRepository.ts`**
  - `CreateNewsInput` interface (tüm alanlar)
  - **`createNewsArticle(input)`** fonksiyonu:
    - Slug üretimi (AZ harf dönüşümü + 240 char cap)
    - `external_url` synthetic fallback: `manual:{slug}:{Date.now()}`
      (DB'de `external_url` `NOT NULL UNIQUE` olduğu için zorunlu)
    - Title fallback zinciri: AZ → TR → EN → RU → "Başlıqsız xəbər"
    - Summary fallback zinciri: AZ → TR → EN → RU → null
    - Drizzle insert + `.returning({ id, slug })`

### Database Schema
- **`lib/db/schema.ts`** `newsArticles` tablosuna **12 yeni kolon** eklendi:

```typescript
contentAz: text('content_az'),
contentRu: text('content_ru'),
contentEn: text('content_en'),
contentTr: text('content_tr'),
isManset: boolean('is_manset').notNull().default(false),
isTop: boolean('is_top').notNull().default(false),
isGundem: boolean('is_gundem').notNull().default(false),
newsType: varchar('news_type', { length: 10 }).default('none'),
telegramSend: boolean('telegram_send').notNull().default(false),
logoOverlay: boolean('logo_overlay').notNull().default(false),
seoTitle: varchar('seo_title', { length: 70 }),
seoDescription: varchar('seo_description', { length: 160 }),
```

### Migration SQL (Neon'da çalıştırıldı)
```sql
ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS content_az TEXT,
  ADD COLUMN IF NOT EXISTS content_ru TEXT,
  ADD COLUMN IF NOT EXISTS content_en TEXT,
  ADD COLUMN IF NOT EXISTS content_tr TEXT,
  ADD COLUMN IF NOT EXISTS is_manset BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_top BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_gundem BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS news_type VARCHAR(10) DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS telegram_send BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS logo_overlay BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS seo_title VARCHAR(70),
  ADD COLUMN IF NOT EXISTS seo_description VARCHAR(160);
```

---

## 2. PR'lar

### PR #335 — [TASK-0252] feat(news): manual news editor backend
- **URL:** https://github.com/DTOMRIS/dk-agency-platform/pull/335
- **Branch:** `feat/manual-news-editor` → `main`
- **Files:** 3 dosya, 231 satır
  - `app/api/news/admin/route.ts` (POST + Zod)
  - `lib/repositories/newsRepository.ts` (`createNewsArticle`)
  - `docs/tasks/TASK-0252.md`
- **Status:** merged ✅
- **Pre-push hook:** `schema.ts` protected file uyarısı çıktı, `ALLOW_PROTECTED=1` ile geçildi (schema değişiklikleri main'de zaten vardı, başka commit'le gelmişti)

### PR #336 — [TASK-0253] hotfix(news): use Next Link for "Yeni Xəbər" button
- **URL:** https://github.com/DTOMRIS/dk-agency-platform/pull/336
- **Branch:** `hotfix/news-link` → `main`
- **Files:** 2 dosya, 13 satır
  - `app/dashboard/xeberler/page.tsx` (Link import + `<a>` → `<Link>`)
  - `docs/tasks/TASK-0253.md`
- **Status:** merged ✅
- **Sebep:** ESLint `@next/next/no-html-link-for-pages` kuralı internal navigation için `<a>` kullanımını error olarak işaretliyor. CI fail + Vercel build fail = site 503.

---

## 3. Yaşanan Sorunlar (Post-mortem)

### Sorun 1: Önceki agent eksik teslim etti
- İlk builder agent run'ı (115 saniye, izin yok) → fail
- İkinci builder agent run'ı (704 saniye, izin verildi) → tamamlandı **DEDİ** ama
  - ✅ Schema değişiklikleri main'e mergelenmiş
  - ✅ Frontend (NewsEditorForm, ShareButtons, route, button) mergelenmiş
  - ❌ POST endpoint **YOKTU**
  - ❌ `createNewsArticle()` fonksiyonu **YOKTU**
  - Sonuç: Form aç → doldur → "Saxla" → 404
- **Çözüm:** Backend'i ben elle yazdım (TASK-0252)

### Sorun 2: Schema'da kolonlar duruyor ama route+repo değişikliklerim silinmiş
- İlk yazımda `Write` ve `Edit` komutları başarılı dönmüştü
- Sonra dosyaları kontrol edince:
  - `schema.ts`'de 12 kolon ✅
  - `route.ts` 22 satır (POST silinmiş) ❌
  - `newsRepository.ts` 548 satır (createNewsArticle silinmiş) ❌
- Muhtemelen linter/format/auto-revert oldu. Tekrar yazdım, sonra `wc -l` + `grep -c` ile DİSK doğrulaması yaptım.
- **Çözüm:** Yazdıktan sonra her zaman disk doğrulaması yap (`grep -c "export async function POST"` gibi).

### Sorun 3: CI lint hatası — `<a>` vs `<Link>`
- Frontend agent "+Yeni Xəbər" butonunu `<a href="/dashboard/xeberler/yeni">` ile yapmış
- Next.js ESLint kural `@next/next/no-html-link-for-pages` bunu error olarak işaretliyor
- 10 instance (her locale build için ayrı sayı)
- Vercel build fail → site 503
- **Çözüm:** Hotfix TASK-0253, `<a>` → `<Link>`, `import Link from 'next/link'`

### Sorun 4: Pre-commit hook'lar (proje convention)
- `verify-task-card` → Commit message'da `[TASK-XXXX]` formatı ve `docs/tasks/TASK-XXXX.md` dosyası zorunlu
- `verify-protected` → `lib/db/schema.ts` ve diğer kritik dosyalar için `ALLOW_PROTECTED=1` flag gerek
- `verify-encoding` → UTF-8 BOM ve LF kuralları

---

## 4. Bilinen Sınırlamalar (devam edecek)

1. **Rich text editor yok** — `contentAz/Ru/En/Tr` düz `<textarea>`. Tiptap veya Lexical eklenecek (B adımı veya ayrı task).
2. **"Bazadan şəkil axtar" butonu placeholder** — şu an sadece toast gösteriyor. Cloudinary Media Library widget veya kendi listeleme UI'si yapılacak.
3. **Logo overlay flag inactive** — `logo_overlay` true yazılıyor ama Cloudinary transformation (`l_text` veya overlay) entegre değil. Yayın sırasında resmi işle.
4. **Telegram send flag inactive** — `telegram_send` true yazılıyor ama Telegram Bot API entegrasyonu yok. Bir cron veya post-publish webhook ile gerçek post atılacak.
5. **Haber detay sayfası `summary` gösteriyor** — `contentAz` field'ı render etmek için `app/[locale]/haberler/[slug]/page.tsx` ve `app/haberler/[slug]/page.tsx` güncellenmeli.
6. **External URL synthetic** — manuel haberlerde `manual:{slug}:{ts}` değeri kullanılıyor (DB constraint için). Frontend bu değeri "kaynak link" olarak göstermemeli, gizlemeli.
7. **Yorum sistemi yok** — Tomris karar verdi: şimdilik yok, sonra eklenecek (Disqus/Giscus/kendi sistem seçimi sonra).

---

## 5. B Adımı — AI Butonları (Bekleyen TASK-0254)

`NewsEditorForm.tsx`'te slot'lar bırakıldı:
- Satır ~335: `{/* TODO B-step: AI title suggest button */}`
- Satır ~430: `{/* TODO B-step: AI content translate button */}`

### Planlanan AI Özellikleri (DeepSeek API ile)

> **ÖNEMLİ:** AI provider **DeepSeek** (Gemini DEĞİL). `package.json`'da
> `@google/genai` görünebilir ama o eski/test artifact. DeepSeek SDK / API
> kullanılacak.

1. **AI Başlık Önerisi**
   - Buton: "AI ilə başlıq təklif et"
   - Input: content (AZ veya başka dil)
   - Output: 3 farklı tarzda başlık (haber, tıklanan, soru)
   - UI: dropdown veya modal, biri seçilir → ilgili dil alanına yazılır

2. **AI Özet Üretici**
   - Buton: "Özetlə"
   - Input: content
   - Output: 2-3 cümle özet
   - UI: textarea'nın üstüne yapıştırır

3. **AI SEO Meta Description**
   - Buton: "SEO təsviri yarat"
   - Input: title + summary
   - Output: 150-160 karakter, anahtar kelime odaklı
   - UI: `seoDescription` alanına yazar

4. **Otomatik Çoklu Dil Çevirisi**
   - Buton: "AZ → digər dillərə çevir"
   - Input: titleAz + summaryAz + contentAz
   - Output: TR, EN, RU versiyonları
   - Mevcut `app/api/news/translate/route.ts` veya `app/api/news-pipeline/translate/route.ts` reuse edilebilir
   - UI: tek tıkla tüm dilleri doldurur

5. **AI Kategori + Etiket Önerisi**
   - İçerikten otomatik kategori öner (mevcut 5 kategoriden)
   - Etiketleri çıkar (NER tarzı, sektör/kişi/şirket isimleri)

---

## 6. C Adımı — Trend Araştırması (Bekleyen, opsiyonel)

2026'da modern news editor / CMS trendleri scout araştırması:
- Notion + Linear + Substack + Ghost CMS modern editor patterns
- Inline embed (YouTube, Twitter, TikTok, Instagram)
- Inline poll/quiz
- Live collaboration (Google Docs tarzı)
- Auto-save server-side (not just localStorage)
- AI co-writer (Notion AI, Grammarly tarzı)
- A/B test başlık
- Schedule + auto-distribute (Buffer/Hootsuite tarzı)

> Bilgi raporu, kod değil. Tomris karar verince scout agent ile yapılır.

---

## 7. Test Sırası

### Yerel test (gerçek dev sunucusunda)
```bash
cd C:\codelar\dk-agency-platform
git pull origin main  # En güncel main (TASK-0252 + TASK-0253 dahil)
npm run dev
```

### Browser test adımları
1. `http://localhost:3000/dashboard/xeberler` aç
   - Sağ üstte "+ Yeni Xəbər" butonu görünmeli
2. Butona tıkla → `/dashboard/xeberler/yeni` açılmalı
3. Formu doldur:
   - AZ başlık (zorunlu, Zod kontrol ediyor)
   - Kategori seç
   - Yazar adı (default "DK Agency")
   - Görsel yükle (Cloudinary upload preview döner)
   - Manşet/Top/Gündəm toggle'larını test et
4. **"Qaralama olaraq saxla"** tıkla → 201 OK + redirect `/dashboard/xeberler`
5. Listede yeni haber görünmeli
6. DB doğrulama (Neon konsolu):
   ```sql
   SELECT id, slug, title, is_manset, is_top, content_az, news_type, telegram_send
   FROM news_articles ORDER BY id DESC LIMIT 1;
   ```
   Yeni eklenen kayıt + tüm yeni kolonlar dolu olmalı.

### Paylaş test
1. `/haberler/[herhangi-slug]` veya `/xeberler/[slug]` aç
2. Başlığın altında **4 ikon** görünmeli: WhatsApp, Telegram, Facebook, Copy
3. **Copy** tıkla → toast "Link kopyalandı" çıkmalı, clipboard'da URL olmalı
4. **WhatsApp** tıkla → yeni sekmede `wa.me/?text=Başlık%20https://...`
5. **Telegram** tıkla → `t.me/share/url?...`
6. **Facebook** tıkla → `facebook.com/sharer/sharer.php?u=...`

### Edge case testleri
- Boş başlıkla submit → 400 "Ən azı bir dildə başlıq tələb olunur"
- Login'siz POST (örn. `curl -X POST .../api/news/admin`) → 403 "Admin girisi teleb olunur"
- SEO description 200 char yaz → Zod 400 (max 160)
- 30 saniye formda bekle → localStorage'a auto-save (DevTools → Application → Local Storage)

---

## 8. Bir Sonraki Claude Code Oturumuna Brief

Eğer bu işin devamında yeni bir CC oturumu açılırsa:

### Bağlam
- DKAgency platform, Next.js 16 + React 19 + Drizzle + Neon + Cloudinary + DeepSeek
- AI provider **DeepSeek** (Gemini değil), `package.json`'daki `@google/genai` eski artifact
- TASK-0252 + TASK-0253 mainde — manuel haber editörü çalışıyor
- TASK-0254 sırada bekliyor — AI butonları (başlık + özet + SEO + çeviri)

### Hangi dosyalar referans
- `components/dashboard/NewsEditorForm.tsx` — AI button slot'ları var (TODO B-step yorumları)
- `components/dashboard/BlogEditorForm.tsx` — başka bir referans (blog için)
- `app/api/news/translate/route.ts` — mevcut çeviri endpoint'i, reuse edilebilir
- `app/api/news-pipeline/translate/route.ts` — pipeline çeviri
- `lib/news/` klasörü — RSS pipeline, mevcut helpers
- `docs/reports/2026-06-10-news-editor-deploy.md` — bu rapor

### Proje convention'ları (commit/push için)
1. Her commit'te `[TASK-XXXX]` ID gerekli
2. Her commit için `docs/tasks/TASK-XXXX.md` dosyası gerekli (kısa scope + reason + affected + DoD)
3. `lib/db/schema.ts` ve diğer protected file değişikliklerinde `ALLOW_PROTECTED=1` flag
4. ESLint kural: internal navigation için **DAİMA `<Link>`**, `<a href="/...">` yasak
5. Branch convention: `feat/`, `fix/`, `hotfix/`, `chore/`
6. PR title format: `[TASK-XXXX] type(scope): description`

### Mevcut git durumu
- Branch: `main` (TASK-0252 + TASK-0253 dahil)
- Son commit hash: `3833783` (hotfix merge)
- Çalışan dizin temiz (`git status` → clean)

---

## 9. Yapılan Dosya Değişikliklerinin Tam Listesi

### TASK-0252 (PR #335)
| Dosya | Değişiklik | Satır |
|---|---|---|
| `app/api/news/admin/route.ts` | POST endpoint + Zod | +93 |
| `lib/repositories/newsRepository.ts` | CreateNewsInput + createNewsArticle | +122 |
| `docs/tasks/TASK-0252.md` | Task card | +16 |

### TASK-0253 hotfix (PR #336)
| Dosya | Değişiklik | Satır |
|---|---|---|
| `app/dashboard/xeberler/page.tsx` | `<a>` → `<Link>` + import | +3, -2 |
| `docs/tasks/TASK-0253.md` | Task card | +10 |

### Önceki agent run'larında zaten mergelenenler (referans)
- `components/dashboard/NewsEditorForm.tsx` (883 satır)
- `components/news/ShareButtons.tsx`
- `app/dashboard/xeberler/yeni/page.tsx`
- `app/[locale]/dashboard/xeberler/yeni/page.tsx`
- `lib/db/schema.ts` (12 yeni kolon `newsArticles`'a)
- `app/dashboard/xeberler/page.tsx` ("+ Yeni Xəbər" butonu eklendi — sonra hotfix ile düzeltildi)
- `app/haberler/[slug]/page.tsx` (ShareButtons import + locale prop)

---

**Tarih:** 2026-06-10
**Operatör:** Doğan Tomris (dotomris@gmail.com)
**Yardımcı:** Claude Code (Opus 4.7)
**Status:** ✅ Production'da canlı
**Sonraki adım:** TASK-0254 (AI butonları) veya farklı bir feature (Tomris kararı)
