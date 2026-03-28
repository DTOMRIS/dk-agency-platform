# DK Agency Devir & Satis Feature Spec

Tarix: 2026-03-28
Status: Arasdirma + mehsul spesifikasiyasi
Hazirlayan: Codex analizi

## 1. Meqsed

DK Agency ucun HoReCa fokuslu `Devir & Satis` marketplace modulu qurmaq.
Bu modul restoran, kafe, bar, franchise, ortakliq, obyekt icaresi ve ekipman kimi elan novlerini tek sistemde birlesdirir.

Bu sened kod deyil. Mehsul dizayni, axin, data toplama ve texniki stack ucun yol xeritesidir.

## 2. Arasdirma Yekunu

### 2.1 Dunya numunelerinden cixan ortaq pattern

#### Devir / emlak marketplace pattern

- `Emlakjet` list view-da sira ile guclu filter verir:
  - kateqoriya
  - satici tipi
  - qiymet araligi
  - m2
  - satiliq / kiraliq
  - lista / xerite
- Kartlarda qisa amma karar verdiren melumat var:
  - basliq
  - alt-kateqoriya
  - lokasiya
  - m2
  - oda / giris tipi
  - qiymet
  - birincil CTA: `Telefona Bak`
- `Hepsiemlak` oxsar olaraq:
  - `Telefonu Goster`
  - `Mesaj`
  - `Whatsapp`
  kimi friction-i azaldan CTA-lar verir.
- `Tap.az` elan detail pattern-i:
  - coxlu sekil
  - qisa atribut siyahisi
  - elan sahibi ile elaqe
  - sikayet mekanizmi
  - mobil prioritetli detail qurulusu

#### Franchise directory pattern

- `Franchising.com`:
  - industry
  - location
  - max investment
  - opportunity type
  filterleri ile directory qurur.
- Esas meqsed e-commerce deyil, `lead capture`-dir.
- Franchise detayinda esas CTA `Request Information` modelidir.
- Bir nece brendi secib tek form ile maraq gondermek modeli var.
- `Franchise.org` ve IFA etrafindaki ekosistem:
  - guven / etika / credible guide qatini guclendirir
  - lead form, membership info, supplier request formalari var
  - content + directory birlikde isleyir

#### Ekipman catalog pattern

- `Alibaba`:
  - cox genis filter
  - MOQ / supplier / capability / region
  - sekil + spesifikasiya + supplier credibility
  - bulk inquiry birinci dereceli CTA
- `WebstaurantStore`:
  - product detail cox qati spesifikasiya ile qurulur
  - SKU, stock, shipping, specs, reviews
  - satinalma birinci derecelidir

#### B2B marketplace pattern

- `IndiaMART` ve `Thomasnet` ortaq olaraq:
  - guclu search
  - capability-based filter
  - supplier shortlisting
  - RFI / RFQ
  - profile + catalog + trust badges
- `Thomasnet` xususen gucludur:
  - supplier profile
  - shortlist
  - CSV export
  - RFQ builder
  - bir nece supplier-e birdefelik sorqu gonderme

### 2.2 Bu pattern-lardan DK ucun cixan netice

DK Agency ucun esas model `marketplace + lead gen + admin moderation` olmalidir.

Bu, ne tam emlak sayti kimidir, ne de tam e-commerce.
En duzgun model:

- list page + filter
- detail page + gallery + specs
- `Maraqlaniram` lead formu
- admin incelemesi
- vitrinde yalniz onaylanmis ilanlar
- AI analiz ile ic quality gate

## 3. Ozbahceci Analizi

### 3.1 Vitrin slider mentiqi

Ozbahceci repo-sunda `vitrin.php` daxilinde slider ve vitrin kart axini var.

Slider mentiqi:

- yuxarida `featuredSlider`
- `slider_projects` son showcase layihelerinden secilir
- her slaydda:
  - boyuk sekil
  - tip badge
  - sektor tag
  - 1 setirlik / qisa description
  - CTA
- arrow + dot navigation var
- touch swipe desteklenir
- auto-rotate mentiqi var
- hover edende auto-stop olur

Bu UX DK ucun uygundur, amma daha temiz React komponent kimi qurulmalidir.

### 3.2 Vitrin kart mentiqi

Ozbahceci vitrin kartinda bunlar var:

- cover image
- type badge
- logo
- sektor
- basliq
- qisa description
- tag-lar
- 3 statistik:
  - toplanan
  - hedef
  - investor sayi
- 2 CTA:
  - `Ilgileniyorum`
  - `Detaylar`

DK Agency ucun bu kart tipi qorunmalidir, amma HoReCa uygun metriklerle:

- devir qiymeti
- ayliq dovriyye
- kira
- seher
- obyekt novu
- franchise haqqi ve ya investisiya araligi

### 3.3 Modal mentiqi

`project-modal.php` daxilinde quick preview modal var:

- sol sekil
- sag tip badge
- title
- qisa description
- lokasiya
- tag-lar
- progress / finansal xulase
- CTA

Bu pattern DK ucun de yararlidir:

- vitrinden cixmadan ilkin baxis
- sonra `Detayli Bax`
- sonra `Maraqlaniram`

### 3.4 Admin workflow mentiqi

Ozbahceci admin fayli `public_html/turan/admix/projeler.php` daxilinde axin bele qurulub:

1. basvuru daxil olur
2. status `submitted` / `ai_checked`
3. admin `Komiteye Gonder`
4. admin `Incele`
5. admin `Red`
6. admin `Vitrin`

Istifade olunan decision stage-ler:

- `submitted`
- `ai_checked`
- `committee_review`
- `shortlisted`
- `docs_requested`
- `showcase_ready`
- `due_diligence`
- `rejected`

Bu stage modeli DK ucun cox deyerlidir.

### 3.5 Ozbahceci-den goturulecekler

- tracking nomre mentiqi
- admin decision stages
- showcase publish modeli
- project media modeli
- lead capture modeli
- status email hadiseleri
- slider + modal UX istiqameti

### 3.6 Ozbahceci-den goturulmeyecekler

- raw PHP code
- local upload path hack-leri
- runtime migration/alter logic
- duplicated upload ve path normalization
- hardcoded secrets

## 4. DK Agency Ictimai Vitrin Modeli

### 4.1 Ilan tiplari

1. Devir
2. Franchise Vermek
3. Franchise Almaq
4. Ortaq Tapmaq
5. Yeni Investisiya
6. Obyekt Icaresi
7. HORECA Ekipman

## 5. Her ilan tipi ucun form spec

### 5.1 Devir

Meqsed:
Hazir restoran, kafe, bar, dark kitchen ve benzeri obyektin devri / satisi.

Form field-leri:

- elan sahibi adi
- telefon
- email
- seher
- rayon
- obyekt tipi
- brend adi
- konsept
- sahesi m2
- oturacaq sayi
- ayliq kira
- devr qiymeti
- ayliq dovriyye araligi
- ayliq menfeet araligi
- personal sayi
- obyektin veziyyeti
- avadanliq daxildir? yes/no
- alkoqol lisenziyasi var? yes/no
- obyekt sekilleri
- menu PDF / operation files
- qisa xulase
- devr sebebi
- exact unvan gizli / aciq secimi

Detail page layout:

- gallery
- yuxari summary badge-lar
- qiymet
- seher / rayon
- obyekt tipi
- dovriyye / kira / menfeet snapshot
- konsept izahi
- included assets
- lokasiya xususiyyetleri
- admin verified section
- `Maraqlaniram` formu

Admin workflow:

- submitted
- AI analyzed
- committee_review
- docs_requested
- approved_showcase
- rejected

### 5.2 Franchise Vermek

Meqsed:
Oz konseptini franchise kimi satan operator.

Form field-leri:

- brend adi
- sektor / konsept
- filial sayi
- is tecrubesi ili
- franchise fee
- royalty modeli
- reklam fee
- total startup investment
- required area
- seherler
- support package
- training details
- payback estimate
- ideal franchisee profili
- brand presentation PDF
- FDD / muqavile numunesi
- sekiller / logo / video

Detail page layout:

- hero gallery + brand logo
- fee summary cards
- investment breakdown
- support / training
- required location specs
- ideal operator profile
- muvaffeqiyyet numuneleri
- FAQ
- `Franchise ile Maraqlaniram` formu

Admin workflow:

- submitted
- AI analyzed
- shortlist
- docs_requested
- showcase_ready
- rejected

### 5.3 Franchise Almaq

Meqsed:
Franchise almaq isteyen sahibkarin profili.

Form field-leri:

- ad soyad / sirket
- telefon
- email
- hedef seher
- maraqlandigi sektorler
- butce araligi
- oz investisiya meblegi
- tecrube seviyesi
- idare edecek komandasi var?
- lokasiya var / yoxdur
- ne vaxt baslamaq isteyir
- qisa motivasiya

Detail page layout:

- profile-style card
- budget range
- target sector / city
- experience
- readiness score
- matching brands section
- `Elaqe saxla` formu

Admin workflow:

- submitted
- reviewed
- matched
- showcase_ready
- rejected

### 5.4 Ortaq Tapmaq

Meqsed:
Mali, strateji veya operational ortaq axtaran obyekt / layihə.

Form field-leri:

- brend / layihə adi
- seher
- sektor
- aktiv obyekt sayi
- ortaq tipi
- teleb olunan mebleg
- ne qeder pay teklif olunur
- ortagin rolu
- niye ortaq axtarilir
- mali gostəricilər
- sekiller / deck

Detail page layout:

- partner thesis
- teklif olunan pay / rol
- mali snapshot
- growth plan
- current team
- riskler
- `Ortaqliga maraqliyam` formu

Admin workflow:

- submitted
- committee_review
- due_diligence
- showcase_ready
- rejected

### 5.5 Yeni Investisiya

Meqsed:
Yeni restoran / HoReCa konsepti ucun investor axtarisi.

Form field-leri:

- layihə adi
- one-liner
- seher
- konsept
- target audience
- capex
- required investment
- opening timeline
- unit economics
- founder info
- deck
- mockup / location visuals

Detail page layout:

- concept hero
- investment ask
- use of funds
- unit economics
- timeline
- founder profile
- deck / media
- `Maraqlaniram` formu

Admin workflow:

- submitted
- AI analyzed
- committee_review
- shortlisted
- showcase_ready
- rejected

### 5.6 Obyekt Icaresi

Meqsed:
Restoran acmaq ucun uygun obyekt / commercial space.

Form field-leri:

- elan sahibi
- seher / rayon
- unvan
- obyekt novu
- sahesi
- vitrini / fasad uzunlugu
- qaz / su / elektrik
- baca / havalandirma statusu
- kitchen uyqunluqu
- ayliq kira
- depozit
- mulkiyyet statusu
- parking
- sekiller / plan

Detail page layout:

- gallery
- map
- utility badges
- m2 / kira / depozit
- restoran ucun uygunluq analizi
- location notes
- `Baxisa yazil` / `Maraqlaniram` formu

Admin workflow:

- submitted
- reviewed
- showcase_ready
- rejected

### 5.7 HORECA Ekipman

Meqsed:
Yeni ve ya ikinci el restoran avadanligi, bulk və ya tekli satış.

Form field-leri:

- seller info
- mehsul adi
- kateqoriya
- marka
- model
- veziyyet
- il
- qiymet
- say
- bulk sale yes/no
- texniki specs
- enerji telebi
- olcu / weight
- seher
- teslimat var?
- quraşdırma var?
- sekiller
- video

Detail page layout:

- gallery
- title + price
- condition badge
- specs table
- quantity / bulk notes
- seller credibility
- shipping / install notes
- `Toplu teklif iste` formu

Admin workflow:

- submitted
- reviewed
- showcase_ready
- rejected

## 6. Umumi Feature-ler

### 6.1 List page

Vitrin listesi bunlari desteklemelidir:

- category filter
- city filter
- price range
- status / availability
- sort:
  - en yeni
  - qiymete gore
  - spotlight
- search by:
  - title
  - keyword
  - city
  - brand

Kart strukturu:

- 16:10 cover image
- tip badge
- city badge
- title
- 2 setir xulase
- 3 qisa metric
- CTA:
  - `Detay`
  - `Maraqlaniram`

### 6.2 Vitrin slider

Ana vitrin ustunde `featured` slider olacaq.

Slider mentiqi:

- maksimum 5 featured elan
- auto-rotate
- manual arrows
- dots
- touch swipe
- hover stop
- her slide:
  - tam sekil
  - tip badge
  - title
  - qisa teaser
  - CTA

### 6.3 Vitrin modal

Kart kliklenende iki variant:

- desktop: quick preview modal
- mobile: birbasa detail page

Modal daxilinde:

- 1 boyuk sekil
- 4-6 summary stat
- qisa description
- CTA

### 6.4 Detail page

Detay səhifəsi type-based olacaq, amma skelet ortaq qalacaq:

- gallery / media
- basic specs
- type-specific block
- CTA lead form
- trust / admin verified info
- related listings

### 6.5 Maraqlaniram formu

Lead capture formunda:

- name
- phone
- email
- company
- message
- preferred contact method
- NDA request optional

Lead sonrasi:

- user confirmation email
- admin alert
- listing owner notification optional
- CRM log

### 6.6 Tracking nomresi

Format:

- `DK-2026-0001`

Qaydalar:

- illik artan sequence
- type-dan asili olmayan tək sıra
- admin ve user her yerdə gorur

### 6.7 AI analiz raporu

Her basvuru ucun avtomatik AI analysis:

- completeness score
- trust/risk flags
- category suggestions
- required docs checklist
- publish recommendation

Admin ekraninda:

- `AI score`
- `risk flags`
- `publish recommendation`

### 6.8 Email hadiseleri

Ilk versiyada 3 mecburi email:

1. Red
2. Incele / qisa siyahi / elave melumat
3. Vitrin / yayinda

Tovsiyə olunan əlavə email-lər:

- basvuru qebul olundu
- maraq formu geldi
- admin notes

## 7. Admin Panel Spec

### 7.1 Siyahi ekran

Admin listing table:

- tracking no
- title
- type
- city
- owner
- created at
- AI score
- status
- featured
- leads count

Filterler:

- status
- type
- city
- featured
- AI risk

### 7.2 Detail / moderation ekran

Bloklar:

- listing overview
- owner info
- media manager
- AI report
- docs
- admin notes
- status actions
- email composer
- lead history

Action-lar:

- review-ə al
- əlavə sənəd istə
- red et
- vitrinə çıxar
- featured et
- gizlət

### 7.3 Media manager

- çoxlu şəkil yükləmə
- silmə
- reorder
- cover seçmə
- video URL

Cloudinary istifadə olunacaq:

- folder by listing type
- auto derived thumbnails
- admin crop optional

### 7.4 Lead panel

- maraqlananlar siyahisi
- status:
  - new
  - contacted
  - qualified
  - closed
- export CSV

## 8. Texniki Stack

- Next.js App Router
- Server Actions + Route Handlers
- PostgreSQL:
  - Supabase ve ya Neon
- Drizzle ORM
- Cloudinary
- Resend ve ya SendGrid
- zod validation
- cron / queue for AI and email retries

## 9. Schema istiqameti

Minimal esas cədvəllər:

- `marketplace_listings`
- `listing_media`
- `listing_contacts`
- `listing_ai_reports`
- `listing_reviews`
- `listing_status_logs`
- `listing_leads`
- `listing_feature_flags`
- `tracking_sequences`

## 10. DK Agency ucun UX qaydalari

- HoReCa-specific copy
- light theme, premium ama sade
- restaurant sahibkarinin 30 saniyede anlamasi ucun qisa kartlar
- listing kartda eyni anda hem emosional, hem ticari data
- mobilde CTA her zaman asagida gorunmeli

## 11. MVP Scope

Birinci release ucun:

- 7 listing type
- submit form
- Cloudinary image upload
- tracking code
- admin moderation
- vitrin list page
- featured slider
- detail page
- lead form
- 3 email
- AI score

Release 2:

- compare
- shortlist
- bulk inquiry for equipment
- saved listings
- advanced analytics
- owner dashboard

## 12. Rewrite vs Adapt

Qerar:

Sifirdan yazmaq daha dogrudur.

Sebebler:

- Ozbahceci biznes mentiqi gucludur
- kod bazasi ise legacy PHP monolitdir
- local upload ve path bug-lari tekrar olunmamalidir
- secrets source code-a yazilmasi tekrarlanmamalidir

Adaptasiya olunacaq hisse:

- status axini
- tracking no
- showcase/vitrin mentiqi
- modal + slider UX
- email hadiseleri
- type-based listing schema

Adaptasiya olunmayacaq hisse:

- PHP form pages
- runtime migration fayllari
- local upload path mentiqi
- copy-paste helper architecture

## 13. Menim CTO Tovsiyem

DK Agency `Devir & Satis` modulu emlak sayti kimi yox, `HoReCa operating marketplace` kimi qurulmalidir.

Yəni:

- Devir
- Franchise
- Ortakliq
- Investisiya
- Icare
- Ekipman

hamisi tek admin pipeline ve tek vitrin sistemi ile idarə olunmalıdır.

Bu yanaşma DK-ni sadə elan saytından çıxarıb, doğruca `HoReCa transaction + lead intelligence platform` səviyyəsinə qaldırır.

## 14. Istifade olunan menbeler

### Dunya numuneleri

- Emlakjet devren isyeri listingleri: https://www.emlakjet.com/devren-isyeri/
- Hepsiemlak devren isyeri listingleri: https://www.hepsiemlak.com/
- Tap.az elan detail modeli: https://tap.az/
- Franchising.com franchise search ve request flow: https://www.franchising.com/find_a_franchise/
- Franchising.com request flow: https://www.franchising.com/checkout.html
- Franchise.org lead/form/content modeli: https://www.franchise.org/
- Alibaba equipment listing modeli: https://www.alibaba.com/
- WebstaurantStore product detail/spec modeli: https://www.webstaurantstore.com/
- Thomasnet supplier discovery / RFQ modeli: https://www.thomasnet.com/
- Thomasnet smart search / shortlist / RFQ: https://help.thomasnet.com/search-for-suppliers
- Thomasnet quote axini: https://help.thomasnet.com/how-to-get-a-quote-from-suppliers-on-the-thomas-platform

### Lokal repo

- `README.md`
- `CTO_LOGS.md`
- `DEVELOPER_GUIDE.md`
- `ROADMAP.md`
- `vitrin.php`
- `project-modal.php`
- `proje-detay.php`
- `public_html/turan/admix/projeler.php`
- `services/MediaService.php`
- `services/ProjectService.php`
- `helpers.php`
- `inc/config_email.php`
- `inc/tracking_helpers.php`
- `proje-ekle-premium.php`
