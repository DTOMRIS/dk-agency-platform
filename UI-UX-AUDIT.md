# DK Agency UI/UX + Admin Audit

Tarix: 10 aprel 2026  
Branch: `audit/ui-admin`  
Base: `main`  
Audit tipi: Production URL-ləri əsasında  
Base URL: `https://dk-agency-platform.vercel.app`

Qeyd: Local dev redirect loop bu auditdə əsas prioritet sayılmadı, çünki production-da təkrarlanmadı. Ayrı development bug kimi aşağıda qeyd olunub.

## 1. Production Status Check

| Route | Status | Title | H1 | Qısa nəticə |
|---|---:|---|---|---|
| `/` | 200 | `DK Agency | Azərbaycanın İlk AI-Dəstəkli HoReCa Platforması` | `Restoranın niyəpul itirdiyinibilmirsən?` | İşləyir, amma hero mətnində boşluq problemi var. |
| `/ilanlar` | 200 | `HoReCa Elanları` | `HoReCa Elanları` | İşləyir. API production DB-dən 6 showcase elan qaytarır. |
| `/haberler` | 200 | `Haberler | DK Agency` | `Sektor Nəbzi` | İşləyir. Editor pick var, amma listdə hələ ingiliscə xəbərlər görünür. |
| `/blog` | 200 | `DK Agency | Azərbaycanın İlk AI-Dəstəkli HoReCa Platforması` | `DK Agency Blog` | İşləyir. API production DB-dən 13 post qaytarır, amma title generikdir. |
| `/kazan-ai` | 200 | `KAZAN AI — HoReCa Məsləhətçin` | `KAZAN AI — Restoranının AI danışmanı` | İşləyir. API POST `deepseek-chat` / `deepseek` provider cavabı verdi. |
| `/toolkit` | 200 | `DK Agency | Azərbaycanın İlk AI-Dəstəkli HoReCa Platforması` | `DK Agency Toolkit` | İşləyir. 10 tool linki görünür. |
| `/dashboard` | 200 | `DK Agency | Azərbaycanın İlk AI-Dəstəkli HoReCa Platforması` | `Idareetme merkezi` | Açılır. Admin ana səhifə real DB + fallback qarışığıdır. |

## 2. Public Səhifələr

### `/` Homepage

Section-lar:
- Hero: restoranın pul itirməsi mesajı, OCAQ/KAZAN yönləndirməsi, CTA-lar.
- Partner/trust band: `TƏRƏFDAŞLARIMIZ`, sektor tərəfdaşları.
- Toolkit preview: P&L, Food Cost, Menyu Matrisi.
- Necə işləyir: addım-addım platform izahı.
- Stage selector: `Başla`, `Böyüt`, `Devir & Satış`.
- Blog preview: food cost və menyu mühəndisliyi yazıları.

İşləyən hissələr:
- `/toolkit`, `/blog`, `/haberler`, `/ilanlar`, `/auth/register` linkləri production-da görünür.
- OCAQ/KAZAN konsepti aydındır.
- Public HTML 200 qaytarır.

Boş/mock hisslər:
- Hero və bəzi platform blokları real data yox, marketing/static məzmun kimi görünür.
- Partner/trust band real loqo/sübut səviyyəsində güclü deyil.
- Homepage preview blokları DB ilə tam bağlı görünmür.

Top 3 problem:
- H1-də boşluq bug-u var: `niyəpul`, `itirdiyinibilmirsən?`.
- Header production-da hələ `Trendlər` göstərir; PR-dakı `Sektor Nəbzi` düzəlişi production HTML-də görünmür.
- Homepage bəzi yerlərdə məhsul demo/placeholder hissi verir; real müştəriyə göstərmək üçün daha çox real proof lazımdır.

### `/ilanlar`

Section-lar:
- Hero/listing shell: `HoReCa Elanları`.
- Client-side listing vitrini.
- Filterlər və modal UX komponentləri client tərəfdə işləyəcək şəkildə qurulub.
- `İlan ver` və `B2B panel` linkləri var.

İşləyən hissələr:
- Production status 200.
- `/api/listings?showcase=true` DB source ilə 6 elan qaytarır.
- Elan data-ları real DB-dən gəlir: devir, franchise, obyekt, ekipman, investor/franchise axtarışı.
- Empty state komponenti kod səviyyəsində var.

Boş/mock hisslər:
- Şəkillər hələ `/images/listings/placeholder-*.svg` ilə gəlir.
- Server HTML-də kartlar görünmür, əsas content client-side API ilə gəlir.
- Real istifadəçi üçün placeholder görsəllər satış keyfiyyətini aşağı salır.

Top 3 problem:
- Elan şəkilləri real foto deyil, placeholder SVG-dir.
- SEO/non-JS baxışda kartlar HTML-də yoxdur; yalnız shell görünür.
- `Ətraflı bax` davranışı modal/card interaction-dır, ayrıca detail səhifə hissi vermir.

### `/haberler`

Section-lar:
- `Sektor Nəbzi` ana başlıq.
- Editor pick blok.
- Category tab-ları: restoran, franchise, delivery, tech, market, world.
- Xəbər grid-i və pagination.

İşləyən hissələr:
- Production status 200.
- Editor pick görünür: `Coca-Cola Arby's, Wendy's, Domino's və Digərləri...`.
- Category tab linkləri və pagination linkləri HTML-də var.
- `Sektor Nəbzi` title/H1 doğru görünür.

Boş/mock hisslər:
- Editor pick üçün real image problemi qalır; gradient/fallback vizual zəifdir.
- Grid-də hələ ingiliscə xəbərlər görünür: `Jack in the Box...`, `Del Taco...`, `Whit’s Frozen Custard...`.
- Header nav-da production hələ `Trendlər` göstərir.

Top 3 problem:
- Tərcüməsiz xəbərlər public grid-də qalır; yalnız editor pick-i təmizləmək kifayət etməyib.
- Editor pick və xəbər kartları üçün real image policy lazımdır.
- Category tab-ları işləyir, amma UX olaraq aktiv tab/data loading daha aydın göstərilməlidir.

### `/blog`

Section-lar:
- `DK Agency Blog` başlıq.
- Blog list shell.
- API-backed post list.

İşləyən hissələr:
- Production status 200.
- `/api/blog` DB source ilə `total: 13` post qaytarır.
- Postlarda cover image var; bir hissəsi `picsum.photos`, bir hissəsi Unsplash.
- Detail route-lar açılacaq slug-larla gəlir.

Boş/mock hisslər:
- Page title generikdir: `DK Agency | Azərbaycanın İlk AI-Dəstəkli HoReCa Platforması`, blog-specific metadata yoxdur.
- HTML-də list content zəifdir; əsas post data API/client ilə gəlir.
- Bəzi seeded yazılarda content çox qısadır və markdown başlığı summary/meta sahələrində təkrar görünür.

Top 3 problem:
- Blog SEO metadata düzəlməlidir.
- Detail səhifələrdə `Doğan Notu` və `guruBoxes` content modelinə baxmayaraq dolu/render olunan sistem kimi görünmür.
- Seed/premium yazılar real editorial keyfiyyətindən geri qalır.

### `/kazan-ai`

Section-lar:
- KAZAN AI hero.
- Sample suallar.
- Chat input/cavab sahəsi.
- Toolkit/blog daxili linkləri.

İşləyən hissələr:
- Production status 200.
- API POST cavab verdi: `provider: deepseek`, `model: deepseek-chat`.
- Cavab strukturlu idi: addımlar, qiymət strategiyası, toolkit/blog linkləri.
- Mobile üçün əsas chat flow mövcuddur.

Boş/mock hisslər:
- Terminal output UTF-8 mojibake göstərdi; bu production UI-də yoxlanmalı encoding riski kimi saxlanmalıdır.
- Chat cavabında `/dashboard` linki public istifadəçini admin yönünə çəkir; bu müştəri UX-i üçün qarışıqdır.
- Sample suallar daha çox real restoran sahibinin gündəlik problemi kimi kəskinləşdirilə bilər.

Top 3 problem:
- Cavablarda public istifadəçiyə admin `/dashboard` CTA-sı verilməməlidir; uyğun CTA OCAQ waitlist/register olmalıdır.
- Encoding render-i browser-də ayrıca yoxlanmalıdır.
- Mobile-da uzun cavablar üçün readability və spacing audit edilməlidir.

### `/toolkit`

Section-lar:
- `DK Agency Toolkit` başlıq.
- `Restoran Açırsan?` qrupu.
- `Mövcud Restoranı Optimallaşdır` qrupu.
- 10 tool linki.

İşləyən hissələr:
- Production status 200.
- 10 tool route linki görünür:
  `concept-checklist`, `insaat-checklist`, `aqta-checklist`, `food-cost`, `pnl`, `menu-matrix`, `basabas`, `delivery-calc`, `branding-guide`, `staff-retention`.
- Food cost, P&L, branding, staff retention kimi tool-lar daha dolu görünür.

Boş/mock/yarmçıq hisslər:
- Bəzi tool-lar tam məhsuldan çox checklist/CTA hissi verir.
- Bəzi nəticələr OCAQ upsell ilə bitir, real export/save flow yoxdur.
- Tool-ların completion status-u istifadəçiyə görünmür.

Top 3 problem:
- 10 tool eyni keyfiyyət səviyyəsində deyil; yarım olanlar tamamlanmalıdır.
- Nəticə saxlama/export/paylaşma yoxdur.
- Tool page metadata/title-lar generik qalır.

## 3. Admin Audit

Bu hissə əvvəlki kod və local DB audit nəticəsinə əsasən saxlanılıb. Production `/dashboard` 200 açılır, amma admin alt səhifələrin real/mock statusu kod/data mənbəyinə görə belədir:

| Admin route | Status | Data mənbəyi | Qeyd |
|---|---|---|---|
| `/dashboard` | REAL + fallback | DB repositories | Stats, son elanlar, lead-lər, blog yazıları real data ilə gəlir; fallback var. |
| `/dashboard/ilanlar` | REAL | DB | List, filter, status update repository/API ilə bağlıdır. |
| `/dashboard/ilanlar/[id]` | REAL | DB | Detail və status əməliyyatları real flow-dadır. |
| `/dashboard/xeberler` | REAL | DB/RSS pipeline | News list, approve/reject real pipeline ilə bağlıdır. |
| `/dashboard/xeberler/rss` | REAL | RSS/DB | RSS fetch və import flow-u var. |
| `/dashboard/blog` | REAL | DB | Blog list real DB-dən gəlir. |
| `/dashboard/blog/new` | REAL | DB | Yeni yazı yaratmaq flow-u var. |
| `/dashboard/blog/[slug]` | REAL | DB | Edit flow real DB ilə işləyir. |
| `/dashboard/ayarlar` | REAL, amma boş | `site_settings` | Real DB model var; row/data doldurulmayıbsa default hissi verir. |
| `/dashboard/hero` | MOCK | Static/admin shell | Admin polish lazımdır. |
| `/dashboard/toolkit` | MOCK | Static/admin shell | Tool idarəetməsi real persistence deyil. |
| `/dashboard/site` | MOCK/duplicate | Static/admin shell | `ayarlar` ilə konsept overlap var. |
| `/dashboard/users` | MOCK | Static/admin shell | Real user management kimi görünmür. |
| `/dashboard/kullanicilar` | MOCK/duplicate | Static/admin shell | Dil/route duplicate problemi var. |
| `/dashboard/haberler` | MOCK/legacy | Static/old route | `xeberler` ilə duplicate/legacy görünür. |
| `/dashboard/trends` | MOCK/legacy | Static | Yeni naming ilə uyğun deyil. |
| `/dashboard/b2b-yonetimi` | MOCK | Static | Real B2B admin flow deyil. |
| `/dashboard/duyurular` | MOCK | Static | Real CRUD görünmür. |
| `/dashboard/etkinlikler` | MOCK | Static | Real CRUD görünmür. |
| `/dashboard/mesajlar` | MOCK | Static | Real message inbox deyil. |
| `/dashboard/loglar` | MOCK | Static | Real audit log deyil. |
| `/dashboard/raporlar` | MOCK | Static | Real reporting deyil. |
| `/dashboard/roller` | MOCK | Static | Real RBAC deyil. |
| `/dashboard/aqta-checklist` | MOCK | Static | Toolkit/admin overlap. |
| `/dashboard/ilan-onaylari` | MOCK/legacy | Static | `ilanlar` status flow ilə duplicate. |
| `/dashboard/pipeline` | MOCK | Static | Termin də dizayn qaydasına görə problemli: `Pipeline` sözü qadağan edilmişdi. |
| `/dashboard/settings` | MOCK/duplicate | Static | `ayarlar` ilə duplicate. |

Admin nəticəsi:
- Real admin nüvəsi: `dashboard`, `ilanlar`, `xeberler`, `blog`, `ayarlar`.
- Mock/cleanup zonası: Hero, Toolkit, Site, Users və legacy türk/ingilis route-lar.
- Ən böyük admin riski duplicate route-lardır: `xeberler/haberler`, `users/kullanicilar`, `ayarlar/settings/site`.

## 4. Design Audit

Header:
- Production public səhifələrdə `Trendlər` hələ görünür.
- `Sektor Nəbzi` də səhifə/footer/news context-də görünür, amma nav fix production-da tam oturmayıb.
- Header nav deploy/cache yoxlanmalıdır.

Footer:
- Production HTML-də əsas linklər görünür və əvvəlki footer fix-i pozulmuş görünmür.
- Link naming yenə `Trendlər` qalıqları ilə audit edilməlidir.

Rənglər:
- Brand rəngləri kodda istifadə olunur: navy `#1A1A2E`, gold `#C5A022`, red `#E94560`, white background.
- Bəzi hero/dark bloklar premium görünür, amma audit qaydasına görə dark background yalnız utility bar + KAZAN widget xaricində məhdudlaşdırılmalıdır.

Font:
- Headings üçün Playfair Display, body üçün DM Sans hədəfi qorunmalıdır.
- Production vizualında metadata/SSR yox, browser screenshot ilə font load final yoxlanmalıdır.

Mobile:
- Production route-lar 200 olduğuna görə mobile bloklanmır.
- Əsas risklər: long hero text wrap, KAZAN uzun cavab readability, listing modal scroll, toolkit card grid spacing.

## 5. Top 10 Prioritet Fix

Bu siyahı production-da real istifadəçinin gördüyü problemlərə görə sıralanıb. Local dev redirect loop bu siyahıya daxil edilməyib.

1. Header production deploy/cache düzəldilsin: `Trendlər` tam silinsin, nav-da yalnız `Sektor Nəbzi` qalsın.
2. `/haberler` public grid tərcüməsiz xəbərləri göstərməsin; `titleAz`/contentAz olmayan approved news public-dən gizlənsin.
3. News editor pick və news kartları üçün real image məcburi olsun; gradient fallback yalnız son çarə kimi qalsın.
4. `/ilanlar` real elan fotoları ilə yenilənsin; placeholder SVG-lər müştəri vitrini üçün uyğun deyil.
5. `/ilanlar` server-render/prefetch edilsin ki SEO və ilk HTML-də 6 showcase elan görünsün.
6. `/blog` metadata düzəldilsin: title, description, OG image blog-specific olsun.
7. Blog detail render-i tamamlanmalıdır: `Doğan Notu`, `guruBoxes`, markdown table/code blocks və CTA-lar editorial formatda görünsün.
8. KAZAN AI cavab CTA-ları public istifadəçiyə uyğunlaşdırılsın; `/dashboard` əvəzinə register/OCAQ onboarding və uyğun toolkit linkləri verilsin.
9. Homepage hero copy və spacing düzəldilsin: `niyəpul`, `itirdiyinibilmirsən?` boşluq bug-u aradan qalxsın, proof blokları real data ilə güclənsin.
10. Admin mock route-lar təmizlənsin və ya real persistence-ə bağlansın: Hero, Toolkit, Site, Users, legacy duplicate route-lar.

## 6. Ayrı Development Bug

Local dev redirect loop:
- Local environment-də redirect loop müşahidə olunmuşdu.
- Production URL-lərdə eyni problem təkrarlanmadı: bütün tələb olunan public route-lar və `/dashboard` status 200 qaytardı.
- Bu bug developer productivity üçün ayrıca izlənməlidir, amma müştəriyə görünən production prioritetlərinə daxil edilməməlidir.

## 7. Qısa Nəticə

Production hazırkı vəziyyət:
- Sayt açılır və əsas public route-lar 200-dür.
- `/ilanlar` və `/blog` real DB data qaytarır.
- `/kazan-ai` production-da DeepSeek ilə cavab verir.
- `/haberler` artıq `Sektor Nəbzi` səhifəsi kimi işləyir, amma tərcüməsiz grid və image problemi qalır.

Müştəriyə göstərmək üçün ən kritik xətt:
- Header naming.
- News translation/image polish.
- Listing real images.
- Blog detail/SEO polish.
- Admin mock route cleanup.
