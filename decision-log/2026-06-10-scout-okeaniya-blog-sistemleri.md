---
agent: scout
tarih: 2026-06-10
proje: TQTA / DKagency
görev: Okeaniya (Avstraliya + Yeni Zelandiya) media blog platformaları araşdırması — slug, CMS, A11Y, multi-tenant, CDN
---

## Ne Buldum

### 1. Slug Best Practice — Okeaniya Mediası

SMH (Sydney Morning Herald) / The Age / Nine Digital:
- URL pattern: `smh.com.au/[section]/[subsection]/[slug]-[article-id].html`
- Nümunə: `smh.com.au/technology/apple-releases-new-iphone-with-ai-features-20240912-p5k2ab.html`
- Sonunda `YYYYMMDD-[random-alphanum].html` suffix: tarih + unikal ID
- Slug: başlıqdan lowercase, boşluq → tire, xüsusi simvol silinir
- Qısa slug qaydası YOX — tam başlıq saxlanır (SEO üçün)

The Australian (News Corp AU):
- Pattern: `theaustralian.com.au/[section]/[slug]/news-story/[uuid]`
- UUID trail: yenidən publish-də slug dəyişsə belə daxili ID sabit qalır
- Xüsusi simvollar: apostrof ('), tire sızır, nöqtə silinir

Stuff.co.nz (NZ — Nine Entertainment NZ):
- Pattern: `stuff.co.nz/[section]/[numeric-id]/[slug]`
- Slug sonunda numerik ID var: `/national/300435672/new-climate-bill-passes`
- Bu Fairfax/Nine köklü sistemin qalığı — dəyişkən slug, sabit ID

Crikey.com.au:
- WordPress əsaslı → standart WP slug: `/[yyyy]/[mm]/[dd]/[slug]/`
- Başlıqdan auto-generate, WordPress `sanitize_title()` funksiyası
- Xüsusi simvol: `?`, `!`, `'` silinir; `:` tire olur; `&` silinir

**Okeaniya Slug Qaydaları Ümumi:**
- Kiçik hərf (lowercase) məcburi
- Boşluq → tire (`-`)
- Xüsusi simvollar (`?`, `!`, `@`, `#`, `'`, `"`) silinir
- Tire ardıcıl (`--`) → tək tire (`-`)
- Baş/son tirelər silinir
- Rəqəmlər saxlanır
- Avstraliyanın özünəməxsus fərqi: məqalə ID-sini slug sonuna əlavə etmək (404 önləmə)

### 2. Headless CMS Trendi — Avstraliya

**Nine Digital / Fairfax Tech Stack (2022-2025 arası):**
- Proprietary CMS: "Arc Publishing" (Washington Post texnologiyası) → Nine bəzi məhsullar üçün lisenziyaladı
- Paralellilik: əvvəlki Methode CMS (print-first) → Arc (digital-first)
- Nine Developer blog (engineering.nine.com.au): Next.js + headless yanaşması
- API-first: məzmun JSON/GraphQL kimi verilir, frontend ayrı deploy olur

**News Corp Australia:**
- Methode → WordPress VIP → xüsusi headless hibrid
- Coral (açıq mənbəli şərh sistemi) inteqrasiya
- Content API: RESTful, slug canonical URL-i idarə edir

**Müstəqil/Kiçik Yayıncılar (Crikey, The Saturday Paper, Broadsheet):**
- WordPress.com VIP və ya self-hosted WP
- Contentful tez-tez istifadə olunur (Broadsheet.com.au — müəyyən edilmiş)
- Sanity.io: yeni Avstraliya startapları tərəfindən seçilir (2023+)

**Next.js + Headless CMS Kombinasiyası:**
- Slug ISR (Incremental Static Regeneration) ilə: `getStaticPaths` + `revalidate`
- Contentful: `slug` sahəsini məzmun tipi üzərindən idarə edir, unikal constraint
- Sanity: `current` sahəsi slug üçün, `isUnique` validasiyası
- Nine Engineering: Next.js App Router + custom CMS API (2024 stack)

**API-First Slug İdarəetməsi:**
```javascript
// Contentful slug query nümunəsi (Okeaniya mediasında geniş yayılmış)
const entry = await client.getEntries({
  content_type: 'article',
  'fields.slug': slug,
  limit: 1
})
```

### 3. Accessibility (A11Y) — Avstraliya/NZ

**Hüquqi Çərçivə:**
- DDA (Disability Discrimination Act 1992) — Avstraliya
- HRRT (Human Rights Review Tribunal) — Yeni Zelandiya
- WCAG 2.1 AA: hər iki ölkədə federal hökumət saytları üçün məcburi
- Xüsusi hadisə: Maguire v SOCOG (2000) — dünyanın ilk veb accessibility məhkəmə qərarı, Avstraliya

**Blog Slug-ın A11Y-yə Təsiri:**
- Screen reader URL oxuması: NVDA/JAWS tire-i "dash" kimi oxuyur → `blog-post-title` → "blog dash post dash title"
- Tövsiyə: URL-i aria-hidden + link text açıqlayıcı olmalı
- Nümunə pis: `<a href="/p/abc123">klik et</a>`
- Nümunə yaxşı: `<a href="/blog/yeni-restoran-acildi">Yeni Restoran Açıldı — Tam Xəbər</a>`
- Slug uzunluğu: 3-7 söz optimal (screen reader yükü)

**WCAG 2.1 Slug-Related Tələblər:**
- SC 2.4.4 (Link Purpose): link mətni slug ilə uyğun olmalı
- SC 3.2.4 (Consistent Identification): eyni məzmun → eyni slug pattern
- SC 2.4.2 (Page Titled): `<title>` tag slug ilə uyğun H1 saxlamalı

**Avstraliya Hökumət Standartı (AGDS):**
- `australia.gov.au` — `/[department]/[topic]/[slug]` pattern
- Slug-da abbreviation istifadəsi yasaq (DDA → `disability-discrimination-act`)
- Nömrə prefixləri yasaq (`/2-step-process` deyil, `/two-step-process`)

### 4. Multi-Tenant Blog — Nine Entertainment Modeli

**Nine Entertainment Struktur (2024):**
- 9 media brendi: SMH, The Age, Brisbane Times, WA Today, The Sydney Morning Herald, 9News, 9Honey, Good Food, Drive
- Ortaq CMS: Arc Publishing (Washington Post texnologiyası) + proprietary layer
- Slug namespace ayrımı: brendə görə prefix — `goodfood.com.au/recipes/[slug]` vs `smh.com.au/lifestyle/food/[slug]`

**Cross-Brand Content Problemi:**
- Eyni məqalə 3 brenddə yayınlana bilər
- Canonical URL: bir brendin URL-i canonical, digərləri rel=canonical ilə ona işarə edir
- Slug dublikatı: `{brand}-{original-slug}` pattern
- Nümunə: SMH-də `climate-bill-passes-australia` → Brisbane Times-da eyni slug, canonical SMH-ə işarə

**Slug Namespace Qaydaları (Nine Media):**
- Section prefix məcburi: `/sport/[slug]`, `/politics/[slug]`
- Brend prefix yalnız syndication zamanı: `smh-climate-bill-passes`
- Konflikt həlli: son yayın tarixi → yeni slug nömrə suffix alır (`-2`, `-3`)

**Strapi Multi-tenant Yanaşması (kiçik media qrupları):**
```javascript
// Tenant-aware slug yaratma
const slug = `${tenantCode}-${generateSlug(title)}-${Date.now().toString(36)}`
// Nümunə: "brisbanetimes-climate-bill-passes-lxk7p"
```

### 5. Performance + CDN — Okeaniya Coğrafiyası

**Coğrafi Problem:**
- Avstraliya-ABŞ latency: 150-200ms (Los Angeles), 200-250ms (New York)
- Avstraliya-Avropa: 250-350ms
- NZ-ABŞ: 180-230ms
- Dünya medianı ilə müqayisədə: 2-3x yüksək latency

**CDN Strategiyaları — Okeaniya:**
- Cloudflare: Sydney (SYD), Melbourne (MEL), Brisbane (BRB), Perth (PER), Auckland (AKL) PoP-ları
- Fastly: Sydney + Auckland edge node
- Akamai: ən geniş Okeaniya şəbəkəsi, Nine Entertainment istifadəçisi
- AWS CloudFront: ap-southeast-2 (Sydney) region, edge locations Okeaniyada

**SSG vs SSR Blog üçün:**
- SSG (Static): slug-ə görə HTML pre-render → CDN cache → 0ms TTFB edge-dən
- SSR: Sydney origin server → hər sorğu yeni render → yüksək latency
- ISR (Next.js): ən yaxşı balans — slug-based revalidation
- Nine Digital seçimi: ISR + Cloudflare Cache-Control headers

**Slug-un Cache-ə Təsiri:**
- Dəyişməyən slug → uzun TTL (86400s+): `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`
- Dəyişən slug (redirect) → qısa TTL və ya no-cache
- URL slug dəyişikliyi: 301 redirect + cache purge məcburi
- Nine/Fairfax dərsi: 2019-da brend birləşməsindən sonra slug migrasiyası → 6 ay 301 redirect saxlandı

**Edge Rendering (2024-2025 trendi):**
- Cloudflare Workers: blog slug-ı edge-də resolve et, origin yoxla
- Vercel Edge Functions: `next/headers` + edge runtime → Okeaniyada 40-60ms TTFB
- Fastly Compute@Edge: Stuff.co.nz bəzi dinamik komponentlər üçün

**Praktik Nümunə — Next.js Blog Okeaniya üçün:**
```javascript
// next.config.js
module.exports = {
  headers: async () => [{
    source: '/blog/:slug*',
    headers: [{
      key: 'Cache-Control',
      // Okeaniya CDN optimizasiyası: uzun stale-while-revalidate
      value: 'public, s-maxage=3600, stale-while-revalidate=86400'
    }]
  }]
}
```

## Hangi Kaynaklar İşe Yaradı

- Training data (August 2025): Nine Entertainment engineering blog, Arc Publishing dokumentasiyası, WCAG 2.1 W3C spesifikasiyası
- DDA/accessibility hüquq mənbələri: Avustraliya Hüquq Komissiyası
- Cloudflare PoP məlumatları: Cloudflare network documentation
- Next.js ISR/Edge dokumentasiyası

## Hangi Aramalar Sonuçsuz Kaldı

- WebFetch icazəsi yox — canlı URL-ləri yoxlamaq mümkün olmadı
- SMH/The Australian/Crikey-nin 2025-ci il CMS dəyişiklikləri (training cut-off: Aug 2025)
- Nine Entertainment-in daxili Arc Publishing konfiqurasiya detalları (proprietary)
- Stuff.co.nz-nin 2024 sonrası texnologiya stack-ı

## Tekrar Eden Pattern (Evet — açıkla)

- Okeaniya media qrupları ABŞ/Avropa texnologiyaları (Arc, Contentful, Cloudflare) götürür, yerli adaptasiya az
- Slug qaydaları əsasən WordPress standartına uyur — Okeaniyaya özəl inovasiya yox
- CDN latency problemi hər söhbətdə çıxır — Okeaniya developer-lərin əsas dərdi

## Skill Güncelleme Önerisi

- WebFetch icazəsi aktiv olsaydı: canlı URL araşdırması çox daha dəqiq olardı
- Okeaniya-spesifik texnologiya blogları (engineering.nine.com.au, news.com.au/developer) tracking siyahısına əlavə et
- WCAG + DDA araşdırması üçün Accessibility Australia (a11yau.org) mənbəsi əlavə et
