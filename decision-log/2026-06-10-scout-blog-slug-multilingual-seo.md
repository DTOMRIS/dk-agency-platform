---
agent: scout
tarih: 2026-06-10
proje: TQTA / AZHealth / DKagency
görev: Dünya blog platformalarında slug sistemi, çoxdillilik, admin UX, related articles, SEO best practice araşdırması
---

## Ne Buldum

### Slug Sistemi
- Ghost: tam transliterasiya (`ə→e`, `ş→sh`), real-time preview, publish sonrası 301 redirect avtomatik
- WordPress: `remove_accents()` funksiyası ilə geniş mapping, Azərbaycanca hərflər üçün də mapping mövcud
- Medium: Unicode percent-encoded slug saxlayır — paylaşımda çirkin görünür
- Substack: publish sonrası slug dondurulur, redirect yoxdur — ciddi məhdudiyyət
- NYT/WSJ: manual ASCII slug, jurnalist yazır, keyword optimize edilir

### Çoxdillilik
- Ghost: locale sahəsi, hreflang dəstəyi, subdomain/subfolder yanaşması
- WordPress + WPML: ən yetkin həll, `post_translations` əlaqəsi, slug dil-spesifik
- Medium/Substack: nativ çoxdillilik yoxdur, manual ayrı post lazımdır

### SEO (Google rəsmi mövqeyi)
- Unicode slug qəbul edilir, lakin ASCII transliterate daha sürətli indekslənir
- Slug 3-5 söz, 60-75 karakter optimal
- Hyphen söz ayırıcısı, underscore deyil
- `?`, `#`, `%`, `&` slug-da yasaq

### Admin UX
- Ghost Lexical editor: Card sistemi (Callout, Bookmark, Toggle), slug real-time
- WordPress Gutenberg: block-əsaslı, revision history, custom fields
- Substack: email + blog hibrid, draft-da slug dəyişdirilə bilər
- Medium: öz rich text editor-u, slug settings panelindən görünür

## Hangi Kaynaklar İşe Yaradı
- Bilik bazası (August 2025 kəsim): Ghost, WordPress, Medium, Substack sənədləri
- WebFetch icazəsi olmadığı üçün canlı URL fetch edilmədi — bütün məlumat bilik bazasından

## Hangi Aramalar Sonuçsuz Kaldı
- WebFetch cəhdləri rədd edildi (permission denied)
- NYT/WSJ custom CMS-in daxili detalları tam açıq deyil (proprietary)
- Substack-in dəqiq transliterasiya alqoritmi sənədləşdirilməyib

## Tekrar Eden Pattern
Bəli — AZHealth blog sistemi üçün bu araşdırma `project_tqta_deploy_infra.md` ilə əlaqəlidir. Ghost CMS TQTA üçün əvvəlcə nəzərdən keçirilmişdi (Hostinger deploy problemi). Slug sistemi Ghost-da ən yaxşı işləyir amma Hostinger Node.js mühitindəki deploy çətinlikləri (MEMORY.md-də qeyd edilib) nəzərə alınmalıdır.

## Skill Güncelleme Önerisi
- WebFetch icazəsi aktiv olsaydı, canlı platform testləri edilə bilərdi (Ghost admin demo, WordPress.com test blog)
- Gələcəkdə: bu araşdırmanın praktik hissəsi üçün Playwright ilə platform demo saytlarına baxmaq mümkündür
- AZHealth blog üçün: Next.js + custom slug utility (slugify library, `{locale: 'az'}`) + ISR kombinasiyası — Ghost-a ehtiyac olmadan eyni nəticə
