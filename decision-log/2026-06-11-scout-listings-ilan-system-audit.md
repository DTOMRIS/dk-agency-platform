---
agent: scout
tarih: 2026-06-11
proje: DKagency
görev: İlanlar/Listings sistemi tam audit — mock vs real, CRUD capability, admin create, devir sub-categories
---

## Ne Buldum

### Tam dosya haritası (mock/real durumu ile)

| Dosya | Ne Yapar | Mock/Real |
|-------|----------|-----------|
| `lib/data/mockListings.ts` | 12 adet hardcoded örnek ilan | PURE MOCK |
| `lib/data/listingCategories.ts` | 7 kategori config (devir, franchise-vermek, franchise-almaq, ortak-tapmaq, yeni-investisiya, obyekt-icaresi, horeca-ekipman) | Config (statik) |
| `lib/data/listingSectors.ts` | 7 sektor: restoran, kafe, bar-pub, fast-food, otel-pansiyon, catering, diger | Config (statik) |
| `lib/data/listingFieldConfig.ts` | Her kategori için type-specific alan tanımları + sector-conditional location fields | Config (statik) |
| `lib/data/listingConcepts.ts` | Sector → Concept mapping (doner, fine-dining, specialty-coffee vb.) | Config (statik) |
| `lib/db/schema.ts` | `listings` tablosu Drizzle schema | REAL DB (PostgreSQL pgEnum) |
| `lib/db/listings-repository.ts` | Public getListings, getListingById — DB fallback mock | DB varsa REAL, yoksa MOCK |
| `lib/repositories/listingRepository.ts` | Admin getAdminListings, updateListingStatus, createListingReview, getOwnerListings | DB varsa REAL, yoksa MOCK |
| `app/api/listings/route.ts` | GET (public/admin/owner scopes) + POST (create) | REAL (DB insert + mock fallback) |
| `app/api/listings/[id]/route.ts` | GET (detail) + PATCH (owner edit, whitelisted fields) | REAL |
| `app/api/listings/[id]/status/route.ts` | PATCH (admin status change + email) | REAL |
| `app/api/listings/[id]/reviews/route.ts` | POST (admin review note) | REAL |
| `app/api/listings/[id]/leads/route.ts` | Lead management | REAL |
| `app/api/listings/batch-status/route.ts` | PATCH toplu status değişimi | REAL |
| `app/dashboard/ilanlar/page.tsx` | Admin listing tablosu — API çağırır, fallback mock | API çağırır (DB + mock fallback) |
| `app/dashboard/ilanlar/[id]/page.tsx` | Admin detail + status yönetimi + review notes | API çağırır |
| `app/dashboard/ilan-onaylari/page.tsx` | Onay kuyruğu — ESKİ SAYFA | PURE MOCK (hardcoded array) |
| `app/b2b-panel/ilanlarim/page.tsx` | Owner listing listesi — API çağırır | API çağırır |
| `app/b2b-panel/yeni-ilan/page.tsx` | B2B üyesi için yeni ilan formu | API çağırır (gerçek POST) |
| `app/[locale]/ilanlar/page.tsx` | Public vitrin | API çağırır |
| `components/listings/CreateListingForm.tsx` | 5 adımlı public ilan formu (public/B2B kullanıcı için) | API çağırır |
| `components/listings/ListingForm.tsx` | B2B panel yeni-ilan formu (eski, dinamik) | API çağırır |
| `lib/utils/listingStatus.ts` | Status workflow, transitions | Config |

---

## CEO'nun Soruları İçin Cevaplar

### Admin EL İLE yeni ilan girebilir mi?

**HAYIR — şu anda YOKTUR.**

Dashboard'da (`/dashboard/ilanlar/`) "Yeni Elan" butonu mevcut değil. Admin sadece:
- Gelen ilanları görüntüleyebilir
- Status değiştirebilir (submitted → committee_review → showcase_ready / rejected)
- Review notu ekleyebilir
- Batch status update yapabilir

Yeni ilan girişi sadece iki yoldan mümkün:
1. B2B panel → `/b2b-panel/yeni-ilan` (üye olarak giriş yapılmış hesap gerekli)
2. Public `/ilan-ver` sayfası (aynı CreateListingForm)

Her iki yol da önce `submitted` statüsüne düşürür ve admin onayı bekler. Admin kendi kafasına göre "şimdi direkt showcase" giremez.

### İlanlar şu an mock mu?

**KISMİ CEVAP — DB bağlıysa real, değilse mock.**

Kod şu pattern'i kullanıyor:
```typescript
if (!db) return MOCK_LISTINGS;  // DB yoksa mock döner
```

Yani:
- DB bağlı + gerçek ilan girilmişse → REAL data
- DB bağlı ama ilan girilmemişse → boş liste (ama dashboard mock'a fallback yapıyor)
- DB bağlı değilse → MOCK_LISTINGS (12 hardcoded ilan)

**Dashboard şu an muhtemelen MOCK_LISTINGS gösteriyor** çünkü gerçek ilan girilmemiş.

### Eski `ilan-onaylari` sayfası problemi

`app/dashboard/ilan-onaylari/page.tsx` — bu sayfa TAMAMEN MOCKTUR. Hardcoded 6 ilan var, approve/reject butonları çalışmıyor (e.stopPropagation() var ama API çağrısı yok). Bu sayfa işlevsiz.

Gerçek onay akışı `app/dashboard/ilanlar/[id]/page.tsx` üzerinden çalışıyor.

---

## CRUD Capability Matrix

| İşlem | Admin Dashboard | B2B Panel | Public | API |
|-------|----------------|-----------|--------|-----|
| CREATE | YOKTUR | Var (yeni-ilan) | Var (ilan-ver) | POST /api/listings |
| READ | Var (tablo + detail) | Var (kendi ilanları) | Var (showcase_ready'ler) | GET /api/listings |
| UPDATE (status) | Var (admin) | Yok | Yok | PATCH /api/listings/[id]/status |
| UPDATE (content) | YOKTUR | Var (submitted/docs_requested'da) | Yok | PATCH /api/listings/[id] |
| DELETE | YOKTUR | YOKTUR | Yok | YOKTUR |

---

## Kategori Yapısı

### 7 Ana Kategori (type)
1. `devir` — İşletme devri
2. `franchise-vermek` — Franchise satmak
3. `franchise-almaq` — Franchise almak
4. `ortak-tapmaq` — Ortak bulmak
5. `yeni-investisiya` — Yeni yatırım
6. `obyekt-icaresi` — Mekan kiralama
7. `horeca-ekipman` — Ekipman

### 7 Sektör (sector — type'tan bağımsız)
- restoran, kafe, bar-pub, fast-food, otel-pansiyon, catering, diger

### Devir içinde Alt Kategori VAR MI?

Teknik olarak **HAYIR** — devir için ayrı bir `subType` alanı şemada yok.

Ancak GERÇEKTE mevcut sistem bunu iki yolla simüle ediyor:
1. **sector** alanı: Restoranmı? kafemi? otelmi? `sector` bunu tanımlıyor
2. **typeSpecificData.concepts**: Hangi konsept? (doner, fine-dining, specialty-coffee vb.) Bu da location requirement'larını etkiliyor

CEO'nun istediği "devir içinde alt kategori" muhtemelen şu anlama gelir:
- Restoran devri
- Kafe devri  
- Bar devri
- Dark kitchen devri
- Otel devri

Bu zaten `type=devir + sector=restoran/kafe/bar-pub/otel-pansiyon` ile çözülüyor. **AMA** bu ayırımın UI'da görünür bir filtre olarak çalışması için devir sayfasında "sector" filtresinin aktif olması lazım.

---

## DB Schema — listings tablosu kolonları

```sql
id serial PRIMARY KEY
tracking_code varchar(20) UNIQUE NOT NULL
type enum('devir','franchise-vermek','franchise-almaq','ortak-tapmaq','yeni-investisiya','obyekt-icaresi','horeca-ekipman')
status enum('submitted','ai_checked','committee_review','shortlisted','docs_requested','showcase_ready','rejected','sold','expired')
sector varchar(50)  -- restoran, kafe, bar-pub, fast-food, otel-pansiyon, catering, diger
is_showcase boolean DEFAULT false
is_featured boolean DEFAULT false
owner_id integer FK users.id
owner_name varchar(150) NOT NULL
phone varchar(30) NOT NULL
email varchar(255) NOT NULL
contact_name varchar(150)
contact_phone varchar(30)
contact_email varchar(255)
city varchar(120) NOT NULL
district varchar(120)
lat, lng numeric
slug varchar(255) UNIQUE
title text NOT NULL
title_az, title_ru, title_en, title_tr text  -- i18n
description text NOT NULL
description_az, description_ru, description_en, description_tr text  -- i18n
price integer
price_label varchar(50)
currency varchar(5) DEFAULT 'AZN'
type_specific_data jsonb  -- kategori'ye özel alanlar
equipment jsonb DEFAULT []
images jsonb DEFAULT []  -- NOT USED (listingMedia tablosu var)
ai_analysis jsonb
ai_check_result jsonb
committee_notes text
approved_at, approved_by, rejected_reason
view_count integer DEFAULT 0
expired_at, deleted_at, created_at, updated_at, published_at
```

---

## Hangi Kaynaklar İşe Yaradı

- Direkt dosya okuma: `lib/db/listings-repository.ts`, `lib/repositories/listingRepository.ts`, `app/api/listings/route.ts` — gerçek iş mantığını ortaya çıkardı
- `lib/db/schema.ts` — DB yapısını tam gösterdi
- `lib/data/mockListings.ts` — CEO'nun gördüğü 12 mock ilanın kaynağı

## Hangi Aramalar Sonuçsuz Kaldı

- Admin "yeni ilan" butonu/formu arandı → YOKTUR. Dashboard'da create functionality yok.
- Devir için "subType" alanı arandı → YOKTUR (sector + concepts kombinasyonu bunu karşılıyor)

## Tekrar Eden Pattern

Evet — `if (!db) return MOCK_LISTINGS` pattern HER yerde tekrarlanıyor. Bu sistemik.

## Skill Güncelleme Önerisi

CEO'nun ihtiyacı için yapılması gereken üç şey:

1. **Admin Create Formu**: Dashboard'a `/dashboard/ilanlar/yeni` sayfası ekle. CreateListingForm veya ListingForm'u wrap et, ama status'u direkt `showcase_ready` olarak seçme imkanı ver (admin bypass).

2. **Admin Direct Publish**: API `POST /api/listings`'e admin session varsa `status: 'showcase_ready'` ve `isShowcase: true` gönderebilmeli. Şu an kod `isDraft ? 'submitted' : 'submitted'` diyor — her zaman submitted koyuyor.

3. **Devir Alt Kategorisi**: Yeni bir `subType` alanı eklemeye gerek yok. Mevcut `type=devir` + `sector` filtresi yeterli. Ancak ilanlar sayfasında "Devir" seçilince sector filter aktif hale gelmeli.
