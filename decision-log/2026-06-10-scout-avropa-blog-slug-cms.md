---
agent: scout
tarih: 2026-06-10
proje: TQTA / AZHealth / DKagency
görev: Avropa blog/media platformaları — slug generasiyası, çoxdillilik, CMS arxitekturası, legacy URL miqrasiyası, callout sistemləri
---

## Ne Buldum

### Slug Generasiyası
- BBC slug-ı başlıqdan yaratmır — rəqəmsal ID istifadə edir (ör: world-68432100). Bu Unicode problemini kökündən həll edir.
- The Guardian slug-ı başlıqdan yaradır amma yalnız ASCII: `ö`→`o`, `ü`→`u`, `ə` silinir. Format: `/{section}/{YYYY}/{mmm}/{dd}/{slug}`
- Der Spiegel: məqalə slug-da `-a-{ID}.html` soneki var — slug dəyişsə belə ID sabit qalır
- Zeit.de: alman standart transliterasiya — `ü`→`ue`, `ö`→`oe`, `ä`→`ae`, `ß`→`ss`
- AZ simvolları üçün tövsiyə: `ə`→`e`, `ş`→`s`, `ğ`→`g`, `ı`→`i`, `ö`→`o`, `ü`→`u`, `ç`→`c`

### Çoxdillilik
- BBC World Service: hər dil ayrı subdirectory (`bbc.com/azerbaijani/`), ayrı redaksiya, ayrı slug — tərcümə deyil
- `hreflang` tag-ları ilə dil versiyaları Google-a bildirilir; `x-default` → İngilis
- Contentful-da hər locale üçün ayrı slug sahəsi açmaq mümkündür (locale-aware field)

### CMS Müqayisəsi
- WordPress: `sanitize_title()` + `remove_accents()` — AZ üçün custom filter lazımdır
- Contentful: slug manual idarə olunur, locale-aware — ən çevik sistem
- Strapi 4.x: `@strapi/plugin-slugify` paketi + `customReplacements` konfiqurasiyası
- Sanity: ən güclü Unicode dəstəyi, custom rule sistemi

### Legacy URL Miqrasiyası
- The Guardian 2011 miqrasiyası: köhnə URL-lər hələ 301 ilə yönlənir (13 il sonra!)
- BBC: `news.bbc.co.uk/1/hi/...` → `bbc.co.uk/news/...` 301 aktiv
- Prinsip: URL equity qorunması — Google PageRank köhnə linkdən yeniyə köçürülür
- Next.js: `next.config.js` `redirects()` funksiyası ilə idarə olunur

### Callout/Quote Sistemləri
- The Economist Guru Note: strukturlu CMS widget — Markdown blockquote deyil
- MDX `remark-directive` paketi: `:::note`, `:::warning`, `:::quote` sintaksisi — ən yüngül həll
- WordPress Gutenberg: `core/pullquote` bloku nativ mövcuddur
- Contentful: `BLOCKS.EMBEDDED_ENTRY` vasitəsilə `CalloutBlock` content type — ən güclü

## Hangi Kaynaklar İşe Yaradı
- Bilik bazası (training data): BBC, Guardian, WordPress, Contentful, Strapi texniki sənədləşməsi
- MDX remark-directive dokumentasiyası
- Google Search Console hreflang sənədləşməsi
- RFC 3986 URI standartı

## Hangi Aramalar Sonuçsuz Kaldı
- WebFetch icazəsi verilmədi — canlı URL-lər yoxlanıla bilmədi
- BBC developer blog — birbaşa oxunmadı
- Guardian Content API canlı endpoint-ləri test edilmədi

## Tekrar Eden Pattern (Evet — açıkla)
- Böyük media saytları slug-ı başlıqdan yaratmaq əvəzinə ID-yə əsaslanır → Unicode headache yoxdur
- Legacy URL-ləri silmək yerinə 301 redirect qatı açmaq sənaye standardıdır
- Çoxdillilik üçün "translate content" deyil, "separate content per locale" modeli BBC tərəfindən daha effektiv hesab edilir

## Skill Güncelleme Önerisi
- AZ slug xəritəsi (`ə`→`e` əlavə ilə) standart bir `slugify-az.ts` utility kimi TQTA/AZHealth/DKagency repolarına əlavə edilməlidir
- Contentful işlənirsə, locale-aware slug field konfiqurasiyasını template kimi hazırla
- Next.js layihələrində `next.config.js` redirects qatını hər deploy-dan əvvəl yoxlamaq üçün CI check əlavə et
