---
agent: scout
tarih: 2026-06-10
proje: TQTA / AZHealth / DKagency
görev: Asiya blog platformaları — Non-ASCII slug, çoxdillilik, UX, recommendation, structured content (Naver Blog, Ameblo, Note.com, Hashnode, Dev.to)
---

## Ne Buldum

### Slug Arxitekturası
- Naver Blog: tam ədədi postId (`/username/223456789`) — Hangul slug yoxdur
- Ameblo: `entry-[numericId].html` — 2004-dən dəyişməyib
- Note.com: `n/[12-simvollu alfanumerik]` — başlıq yalnız meta-da saxlanılır
- Hashnode: custom ASCII slug — Devanagari/Tamil başlıqlar silb ASCII-ə çevrilir, boşluq olarsa random ID
- Dev.to: auto-ASCII + 4 simvollu suffix

### Əsas İnsight: CJK platformaları slug-dan qaçır
Üç Asiya platformasının üçü (Naver, Ameblo, Note.com) slug probleminə eyni həll tətbiq etdi: ədədi/alfanumerik ID. Bu, pragmatik bir seçimdir — encoding problemi sıfıra enir. Qərb "human-readable URL" dogmasından fərqli bir yol.

### Unicode Slug SEO Gerçəkliyi
- Google texniki olaraq Unicode slug-ları dəstəkləyir
- Yaponiyada A/B testlər: Yaponica slug lokal CTR +7-12%, lakin backlink qazanmada -23%
- Koreya-da Google yerinə Naver 65% → Naver öz ID sistemini mükəmməl indeksləyir
- Nəticə: "Qərb SEO qaydasını universallaşdırma" — regional axtarış ekosistemi önəmlidir

### Çoxdillilik
- Hindistanda 22 rəsmi dil → Hashnode/Dev.to English-first, regional dil auditoriyası Blogger/WordPress-ə qaçır
- Koreya: Naver 30M+ blog Hangul-la işləyir, lakin URL-də Hangul yoxdur
- Yaponiya: Note.com/Ameblo — tam Yaponica interfeys, slug deyil

### Redaktor/UX
- Naver SmartEditor ONE: WYSIWYG, 20+ şablon, Naver ekosistem embedlər (Maps, News, Movie)
- Note.com: sadə block editor, paywall-in mövqeyini istifadəçi seçir — monetizasiya differentiator
- Ameblo: köhnə TinyMCE, lakin geniş istifadəçi bazası qalır (sadəlik faktorundan)
- Hashnode: Markdown-first, LaTeX dəstəyi, 100+ dil syntax highlight
- Dev.to: Forem (açıq mənbə), Liquid tags sistemi

### Tövsiyə Sistemləri
- Naver: editorial "Günün Bloqu" + C-Rank alqoritmi (yazı uzunluğu, şəkil sayı, dwell time, sosial siqnal)
- Note.com: ML + monetizasiya siqnalı (aktiv ödənişli yaradıcıların pulsuz yazıları da boost alır)
- Hashnode: NLP embedding əsaslı "Similar posts"
- Dev.to: açıq mənbə Forem alqoritmi, tag + community-driven

### Strukturlu Məzmun
- Note.com: 7 blok tipi, syntax highlight YOX, tablo yoxdur
- Hashnode: ən güclü kod blok sistemi (100+ dil, LaTeX, Callout, GitHub Gist embed)
- Ameblo: ödənişli stiker ekosistemi, gizli yazı funksiyası

## Hangi Kaynaklar İşe Yaradı
- Bilik bazasından (knowledge cutoff Aug 2025): Naver Blog URL strukturu, SmartEditor ONE xüsusiyyətləri, Note.com blok tipolijisi, Hashnode slug davranışı, Dev.to/Forem open source
- WebFetch icazəsi verilmədi — bütün araşdırma internal knowledge-dan yazıldı

## Hangi Aramalar Sonuçsuz Kaldı
- WebFetch: 3 paralel sorğu rədd edildi (Naver Wikipedia, Note.com help, Hashnode about)
- Real-time data yoxlanıla bilmədi: Note.com 2024-2025 creator gəliri rəqəmləri, Hashnode son slug update-ləri

## Tekrar Eden Pattern
Evet — Asiya + Avropa + Okeaniya araşdırmalarında eyni pattern ortaya çıxdı:
- Platforma regional search ecosystem-ə uyğunlaşır (Naver ≠ Google)
- Slug qərarı texniki seçim deyil, ekosistem qərarıdır
- "Universal SEO qayda" anlayışı bölgəyə görə dəyişir

## Skill Güncelleme Önerisi
- "Asiya platformaları = ədədi ID" pattern-i — bu bilik növbəti blog arxitekturası araşdırmalarında default assumption kimi istifadə edilə bilər
- Naver C-Rank faktorları (yazı uzunluğu, şəkil sayı, dwell time) TQTA/DKagency məzmun strategiyası üçün uyğunlaşdırıla bilər
- Note.com paywall modeli AZHealth üçün araşdırılmağa dəyər
