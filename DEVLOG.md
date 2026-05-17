# DEVLOG — DK Agency Platform

## 2026-05-17 - TASK-0148 Marketinq: Sosial Media Metrik Analizatoru

**Niyə:** Restoran sahibləri "ER nədir, hansı kontent daha yaxşıdır" sualına cavab tapa bilmir. ER hesablama mənbədən-mənbəyə fərqlidir (follower-bazlı vs reach-bazlı vs impressions-bazlı) — istifadəçi qarışır. Bu tool bir formul seçir və HoReCa sektoru üçün doğru benchmark ilə müqayisə edir.

**Formula (Instagram):** ER = (likes+comments+saves+shares) / (posts × followers) × 100. 2026-da save və share daxildir (əvvəlki formullardan fərq). Reach-bazlı ER opsionaldır (varsa göstərilir).

**Formula (TikTok):** ER = (likes+comments+shares+saves) / totalViews × 100 (views-bazlı — platforma standartı).

**HoReCa Benchmark-lar (2025-2026, Socialinsider/RivalIQ):** IG <10K: 2.53%, IG 10K-100K: 1.18%, IG 100K+: 0.70%. TikTok F&B: 2.65% (views-bazlı).

**Sağlamlıq balı:** 0-100 skala — 50 = benchmark-da dəqiq, 100 = 2x benchmark, 0 = sıfır ER. Rəng kodlu (yaşıl/qızıl/qırmızı).

**Kontent tipi ranking (Instagram, opsional):** Reels > Carousel > Single (2025-2026 data). İstifadəçi hər tip üçün ayrıca interaksiya daxil edirsə, real ranking göstərilir.

**Aksiyon tövsiyələri (statik, araşdırma əsaslı):** Video/Reels-ə keç (2-5x ER artım), şərhlərə 1h-da cavab (+23% gələcək ER), save-fokuslu kontent artır. Info bloku: "ER niyə aşağıdır" izahı (platforma səviyyəsində düşüş trendi).

**Test dataseti (IG):** 8500 follower, 10 post, 1200 like + 85 comment + 140 save + 45 share = 1470 total. ER = 1470 / (10×8500) × 100 = 1.73%. Nano tier benchmark: 2.53%. Delta: -0.80%. Status: average. Health score: 34.

## 2026-05-17 - TASK-0146 Marketinq: Sezon Analitikası

**Niyə:** Kiçik restoranlarda cash-flow proqnozu çox vaxt intuisiya ilə aparılır. Pik ayda az staff və az inventar fürsəti qaçırır, ölü ayda artıq alış və uzun növbə nağd pulu yandırır. Rəqib ümumi kalkulyatorlardan fərq olaraq bu tool AZ-spesifik sezonları — Novruz, Ramazan pəncərəsi, sahil turizmi, Şahdağ/Qəbələ qış sezonu və toy-banket aylarını — deterministik əmsala çevirir.

**Arxitektura:** Hesablama `lib/marketing-tools/sezon-analitikasi.ts` util-indədir; component yalnız input, validation və vizual nəticəni render edir. Matrix 5 restoran tipi x 12 ay əmsalından ibarətdir. Hər ay üçün dövriyyə, işçi büdcəsi və inventar büdcəsi hesablanır; ən zəif 3 ay, ən güclü 3 ay və `<0.80` ölü ay xəbərdarlığı çıxarılır.

**Tier:** KALFA (89 AZN/ay). Tool `sezon-analitikasi` slug-u ilə `marketing-tools-config.ts` single source of truth-a əlavə edildi, `aiProvider: none` saxlandı, çünki hesab deterministikdir.

**Test dataseti:** 25,000 AZN orta dövriyyə, şəhər restoranı, 28% işçi xərci, 32% food cost. Yanvar `18,750`, mart `30,000`, işçi büdcəsi müvafiq `5,250` və `8,400`, inventar büdcəsi `6,000` və `9,600` olmalıdır. Sahil-kurort fevral `13,750`, iyul `36,250`; dağ-kurort yanvar `33,750`, avqust `18,750`.

**Qeyd:** Prompt `recharts` istəyirdi, amma repo dependency-lərində `recharts` yoxdur və task yeni paket qadağan edir. Ona görə mövcud stack ilə responsive SVG bar/line chart quruldu; chart `data-testid="season-chart"` ilə smoke üçün yoxlanır.

## 2026-05-17 - TASK-0145 Marketinq: Müştəri Persona Yaradıcısı

**Niyə:** Restoran sahibi müştərisini tanımır — "kim gəlir, nə istəyir, harada tapıram?" suallarına cavab yoxdur. Ümumi persona tool-larından fərqli olaraq bu tool AZ/TR restoran sektoru üçün xüsusidir: Bakı vs Gəncə müştərisi, lokal ödəmə vərdişləri, WhatsApp statusu vs Instagram, ailə yönümlü vs fərdi yemək vərdişi.

**Arxitektura:** 3 mərhələli UI (restoran profili + müştəri müşahidələri + AI persona generasiyası). DeepSeek server action JSON formatında cavab qaytarır, 18 sahəli persona kartı yaradır. Cookie-based rate limit: 10 dəqiqədə 5 persona. localStorage-da son 3 persona tarixi saxlanılır.

**Tier:** USTA (149 AZN/ay). KALFA və ŞAGIRD üçün upgrade CTA göstərilir. Config: `musteri-persona` slug, tier `usta`-ya dəyişdirildi (əvvəl `kalfa` idi, amma prompt USTA tələb edir).

**Test ssenarisi:** Milli Mətbəx, Bakı, 15-30 AZN, Zal + Çatdırılma. Yaş 25-34 + 35-44, Qadın 60%. Nahar + Axşam, Həftədə 2-3, Masa 2 + 3-4, Kart + Nağd, Piyada + Taksi. AI Bakılı, 28-38 yaş, orta-yüxsək gəlirli, Instagram aktiv persona qaytarmalıdır. Persona kartı: profil (sol) + insights (sağ) + marketinq tövsiyələri (alt) layout.

**Qeyd:** DeepSeek response_format: json_object istifadə olunur — JSON parse uğursuzluğu üçün ayrıca error tipi (`json-parse`) əlavə edildi. Temperature 0.7 (ROI-dan yüksək) — kreativ persona üçün daha yaxşı nəticə verir.

## 2026-05-17 - TASK-0144 Marketinq: ROI Kalkulatoru v2

**Niyə:** Mövcud Promosyon ROI v1 baz həftə ilə promo həftəni müqayisə edirdi. ROI v2 restoran sahibinin "hansı kanala pul xərcləməliyəm?" sualına cavab verir: Instagram, Google, WhatsApp, flyer və digər kanallar eyni cədvəldə ROI, ROAS, CAC, LTV:CAC və payback ilə müqayisə olunur.

**Formula:** Kanal ROI % = (gəlir - xərc) / xərc * 100. ROAS = gəlir / xərc. CAC = xərc / yeni müştəri sayı. Payback gün = CAC / (orta çek * gündəlik ziyarət tezliyi). Ümumi ROI = (ümumi gəlir - ümumi xərc) / ümumi xərc * 100. LTV = orta çek * aylıq ziyarət * loyallıq müddəti. LTV:CAC = LTV / ümumi CAC.

**Test dataseti nəticəsi:** Instagram 500 xərc, 1800 gəlir, 15 yeni müştəri -> ROI 260%, ROAS 3.6x, CAC 33.3 AZN. Google Ads 800/1200/8 -> ROI 50%, ROAS 1.5x, CAC 100 AZN. Flyer 200/300/3 -> ROI 50%, ROAS 1.5x, CAC 66.7 AZN. Orta çek 25 AZN, aylıq ziyarət 2, loyallıq 12 ay -> LTV 600 AZN, ümumi CAC 57.7 AZN, LTV:CAC 10.4:1. Ən yaxşı kanal Instagramdır.

**AI təhlükəsizliyi:** DeepSeek çağırışı `app/actions/roi-ai-analysis.ts` server action-dadır. Input max 8 kanal, xərc > 0, gəlir >= 0 sanitizasiyası ilə qorunur. Cookie əsaslı limit: 10 dəqiqədə 3 analiz. `DEEPSEEK_API_KEY` client bundle-a düşmür.

---

## 2026-05-17 - TASK-0143 Marketinq: P&L Simulyatoru

**Niyə:** USTA tier üçün restoran sahibinin rəqəmləri real vaxtda görməsi lazımdır: satış, yemək məsrəfi, işçi xərci, əsas xərc, overhead, xalis mənfəət və zərərsizlik nöqtəsi eyni paneldə oxunur. Mövcud P&L səthi saxlanmadı; dashboard wrapper yeni mobil-first komponentə bağlandı ki iki fərqli P&L davranışı qalmasın.

**Formula:** Ümumi satış = yemək satışı + içki satışı + digər. COGS = başlanğıc stok + alışlar - son stok. Yemək məsrəfi % = COGS / satış * 100. İşçi xərci % = işçi xərci / satış * 100. Prime Cost = COGS + işçi xərci. Prime Cost % = Prime Cost / satış * 100. Xalis mənfəət = satış - COGS - işçi xərci - overhead. Zərərsizlik nöqtəsi = overhead / (1 - dəyişkən xərc %).

**Benchmark:** Yemək məsrəfi <=30% yaxşı, 30-35% diqqət, >35% kritik. İşçi xərci <=30% yaxşı, 30-35% diqqət. Prime Cost <=60% yaxşı, 60-70% diqqət, >70% kritik. Xalis mənfəət >=5% sağlam, 3-5% diqqət, <3% riskli.

**Test dataseti nəticəsi:** Aylıq satış 18,000 AZN. COGS 6,500 AZN, Food Cost 36.1% -> kritik/diqqət zonası. İşçi xərci 5,800 AZN, Labor 32.2% -> diqqət. Prime Cost 12,300 AZN, 68.3% -> diqqət. Overhead 2,800 AZN. Xalis mənfəət 2,900 AZN, 16.1% -> yaxşı. Zərərsizlik nöqtəsi dəqiq formula ilə 8,842 AZN-dir; cari satış BEP-dən yuxarıdır.

**AI təhlükəsizliyi:** DeepSeek çağırışı `app/actions/pl-ai-analysis.ts` server action-dadır. `DEEPSEEK_API_KEY` client bundle-a düşmür. Cookie əsaslı limit: 10 dəqiqədə 3 analiz. Xalis mənfəət mənfi ola bildiyi üçün server action bu sahədə signed number qəbul edir.

---

## 2026-05-17 - TASK-0141 Marketinq: Menyu Analitiği

**Niyə:** Köhnə Menyu Analitiği AI tahmininə çox bağlı idi. KALFA səviyyəsində satıla bilən tool üçün kateqoriyalaşdırma deterministik olmalıdır: CM, Food Cost %, Menu Mix % və orta eşiklər istifadə olunur; AI yalnız tövsiyə qatıdır.

**Formula:** CM = satış qiyməti - yemək məsrəfi. Food Cost % = məsrəf / qiymət * 100. Menu Mix % = item satışı / ümumi satış * 100. Orta CM item-lərin CM ortalamasıdır, orta Mix isə 100 / item sayı.

**Test dataseti nəticəsi:** Plov 8/2.5/120 -> CM 5.50, FC 31.25%, Mix 42.11%, ULDUZ. Dolma 7/3/45 -> CM 4.00, FC 42.86%, Mix 15.79%, BULMACA. Qutab 4/1.2/90 -> CM 2.80, FC 30.00%, Mix 31.58%, İŞ ATI. Bozbas 6/2.8/30 -> CM 3.20, FC 46.67%, Mix 10.53%, İT.

**Qeyd:** Prompt-da Qutab üçün "BULMACA və ya ULDUZ" ehtimalı yazılmışdı, amma məcburi formula ilə Qutab orta CM-dən aşağı, orta Mix-dən yuxarıdır. Ona görə doğru kateqoriya İŞ ATI-dır.

**AI təhlükəsizliyi:** DeepSeek çağırışı `app/actions/menu-analytics-ai.ts` server action-dadır. Input max 20 item, item adı max 50 simvol, 10 dəqiqədə 3 çağırış cookie əsaslı rate limit ilə qorunur. API key client bundle-a düşmür.

---

## 2026-05-17 - TASK-0140 Admin: İstifadəçi Sil (Soft Delete + Bulk)

**Niyə hard delete rədd edildi:** Audit log-da `targetUserId` referansları var. Hard delete sonra bu referanslar qırılır — "kim silindi?" sualı cavabsız qalır. Soft delete (deletedAt timestamp) bütün referansları qoruyur.

**Dual-table soft delete:** `users` (auth) + `memberProfiles` (admin panel) — hər ikisində deletedAt set olunmalıdır. `users`-ı email ilə tapırıq (id-lər fərqli ola bilər). Gələcəkdə bu iki cədvəl birləşdirildikdə (tech debt) bir update kifayət edəcək.

**Login bloklama:** deletedAt check emailVerified-dən ƏVVƏL qoyulub — silinmiş user "email təsdiqləyin" mesajı görmür, birbaşa "hesab deaktiv" görür. Bu, XSS/phishing kontekstində daha təhlükəsizdir.

**Bulk limit 50:** DoS qoruma — bir request-də 50-dən çox silmə bloklayır. Admin özünü bulk-dan da silə bilmir (id filter).

**Double confirm:** Detail page-də təsadüfi klik qarşısını almaq üçün 2 addım: (1) window.confirm, (2) "SİL" yazma + button disabled until match. MembersTable-da isə tək confirm (daha sürətli workflow).

---

## 2026-05-17 - TASK-0139 Admin: Şifrə Sıfırla

**Niyə:** Admin istifadəçinin şifrəsini bilmir və bilməməlidir. Amma istifadəçi şifrəsini unutduqda admin-dən kömək istəyə bilər. Admin-initiated reset flow: admin düyməyə basır → sistem token yaradır → email gedir → user özü şifrəni seçir.

**Admin heç vaxt şifrəni görmür:** Token plain-text email-dən keçir amma bu one-time-use + 1 saat expire. Şifrə özü heç vaxt göndərilmir. Audit log-a da token/hash yazılmır (OWASP).

**Niyə ayrı template?** Mövcud `passwordReset` template "Siz bu sorğunu göndərdiniz" deyir — admin-initiated olduqda bu yanlışdır. `adminPasswordReset` template "administrator tərəfindən sorğu göndərildi" + "əgər siz göndərməmisinizsə nəzərə almayın" deyir.

**Token expire 1 saat (24 yox):** TASK-0136 invite-da 24 saat idi çünki passiv onboarding. Burada isə admin-user aktiv ünsiyyətdədir — "indi sıfırladım, bax emailinə" deyir. 1 saat kifayətdir.

---

## 2026-05-17 - TASK-0138 Admin: İstifadəçi Detail Səhifəsi

**Niyə:** Siyahıdan user-ı seçib profil, audit tarixçəsi və əməliyyatları bir yerdə görmək lazımdır. Əvvəl yalnız cədvəl var idi — admin context almadan rol dəyişirdi.

**Sensitiv sahə qoruma:** `memberProfiles` cədvəlində passwordHash yoxdur (o `users` cədvəlindədir), ona görə select-dən explicit exclude lazım olmadı. Amma yenə də named select istifadə etdim — gələcəkdə sütun əlavə olunsa avtomatik leak olmasın.

**Audit preview:** Detail page-də istifadəçiyə aid son 10 audit log göstərilir. Bu, TASK-0137-in `adminAuditLogs.targetUserId` index-indən istifadə edir — ayrıca query, join yox. Əgər log sıfırdırsa "Əməliyyat yoxdur" mesajı.

**MembersTable link:** Eye icon + "Bax" linki — mövcud cədvəl sütunlarına təsir etmir, sadəcə sonda əlavə sütun.

---

## 2026-05-17 - TASK-0137 Admin: Audit Log

**Niyə:** TASK-0135/0136 admin əməliyyatları (rol dəyiş, user yarat) izlənmirdi. Audit log olmadan "kim nə etdi?" cavabsız qalır. Sonar + OWASP 2025 standartlarına görə hər admin əməliyyatı immutable log cədvəlinə yazılmalıdır.

**OWASP 2025 riayəti:**
- Timestamp UTC (`with timezone`) — locale-independent
- Admin kimliyi (id + email) — JWT-dən gəlir
- Target kimliyi (id + email) — kimin üzərində əməliyyat edilib
- metadata jsonb — əlavə kontekst (oldRole→newRole kimi)
- Credentials HEÇ VAXT log-a düşmür (password, token, hash)
- Log immutable — DELETE endpoint YOX, UI-da silmə düyməsi YOX

**Dizayn qərarları:**
- `writeAuditLog()` utility: fire-and-forget pattern (audit failure main operation-u bloklamamalı)
- serial id (uuid yerine) — mövcud schema pattern-ə uyğundur, performans üstünlüyü
- 3 index (admin_id, action, created_at) — filter/sort performance
- Retroaktiv yazma: TASK-0135 PATCH + TASK-0136 POST artıq audit qeyd edir

**Gələcək:** `member.deleted` action hazırdır — TASK-0140 silmə endpoint-i yaradılanda avtomatik istifadə olunacaq.

---

## 2026-05-17 - TASK-0136 Admin: Manuel İstifadəçi Əlavə Et

**Niyə:** Admin paneldən istifadəçi siyahısını görmək (TASK-0134) və rol dəyişmək (TASK-0135) mövcuddur, amma yeni istifadəçi əlavə etmək yox idi. Bu, onboarding zamanı admin-in əl ilə hesab yaratmasını tələb edir.

**Seçim: OPTION B (passwordless invite):** OWASP 2025 tövsiyəsinə görə temp şifrə email-dən keçirmək pis praktikadır. Forgot-password token flow-unu yenidən istifadə etmək həm daha təhlükəsiz, həm kod duplikasiyasını aradan qaldırır. Bu pattern-i TASK-0139 (şifrə sıfırla link-i yenidən göndər) üçün də hazırlamış oluruq — task-lar bir-birini tamamlayır.

**İkili cədvəl problemi:** Platform-da `users` (auth) və `memberProfiles` (admin panel) ayrıdır. Login `users.id`-dən JWT sign edir, admin panel isə `memberProfiles`-dan oxuyur. Admin-created user hər ikisində olmalıdır. Token `passwordResetTokens` → `users.id` referans edir. Gələcəkdə bu iki cədvəl birləşdirilməlidir (tech debt).

**emailVerified = true niyə?** Login endpoint `!emailVerified` bloklayır. Admin trust model: admin email-in düzgünlüyünə cavabdehdir. passwordHash=null zaten unauthorized access-i bloklayır. User link-ə klik edib şifrə set etdikdə — email sahibliyi onsuz da sübut olunur.

**Token 24 saat:** Forgot-password 1 saatdır (user aktiv istəyir). Admin-invite isə passiv — gecə göndərilib səhər baxıla bilər.

**Email fail graceful:** User yaradılsa amma email göndərilə bilməzsə — rollback YOX. Admin-ə `emailSent: false` qaytarılır, UI-da warning göstərilir. Admin sonra resend edə bilər (gələcək feature).

---

## 2026-05-17 - TASK-0135 Admin Role Management

**Niyə:** TASK-0134 ilə admin paneldə real istifadəçi siyahısı canlıdır. Adminin digər istifadəçilərin rolunu UI-dan dəyişə bilməsi lazımdır (member ↔ admin).

**Nə dəyişdi:** PATCH `/api/admin/members/[id]` endpoint yaradıldı — JWT auth, self-role protection (öz ID-nə 403), valid role check. MembersTable-da rol sütununa select dropdown əlavə edildi — cari admin-in öz sətirində badge-only (disabled, tooltip ilə). Local state optimistic update + error toast. 4 dil i18n tam (`dashboard.members.roles.*`).

**Dizayn qərarı:** Self-role protection həm API-da (403), həm UI-da (disabled select → badge) tətbiq olundu. İkili qat: frontend yanlışlıqla göndərsə belə backend bloklayır. `currentUserId` əlavə API sorğusu əvəzinə GET members response-una əlavə edildi (1 fetch = members + stats + currentUserId).

**Dərs:** Admin role dəyişikliyi təhlükəli əməliyyatdır — self-protection olmadan admin özünü kilidləyə bilər. Həmişə "özünə" qaydası əlavə et.

---

## 2026-05-16 - TASK-0134-FIX Validator Block Resolution

**Niyə:** PR #134 dk-validator tərəfindən BLOCK edildi: (1) E2E spec-də `/${locale}/dashboard/users` istifadə olunurdu — dashboard route-ları locale-independent-dir; (2) Component içində inline pageCopy obyekti L-004 pozuntusudur.

**Nə dəyişdi:** E2E spec-dən locale prefix silindi (`/dashboard/users` birbaşa istifadə), page.tsx + MembersTable.tsx-dəki bütün UI mətnləri `messages/*.json` fayllarına `dashboard.members.*` namespace altına köçürüldü, component-lərdə `useTranslations('dashboard.members')` istifadə edilir. 4 dil (az/en/ru/tr) tam.

**Dərs:** Dashboard route-ları Next.js app router-da `app/dashboard/` altındadır, `app/[locale]/dashboard/` yox. E2E spec-lər real routing strukturuna uyğun yazılmalıdır. Inline UI mətnləri nə qədər kiçik olsa da messages/*.json-a getməlidir — validator L-004 qaydası istisnasızdır.

---

## 2026-05-15 - TASK-0127 Food Cost Calculator Repair

**Niye:** PR #126 TASK-0127-ni tamamlanmis kimi merge etdi, amma main-de sadece task card var idi. `app`, `components`, `lib` altinda `yemek-xerci` implementasiyasi yox idi.

**Ne deyisdi:** `yemek-xerci` Marketinq Ocagi live SAGIRD tool kimi elave edildi. Client-side resept karti, coxlu mehsul setri, trim loss, porsiya maya deyeri, food cost %, ideal qiymet, CSV ve Excel export hazirlandi. API/AI route elave edilmedi.

**Ders:** Task card merge etmek feature merge etmek deyil. Bundan sonra acceptance criteria konkret route + ekran + klikli yoxlama ile baglanmalidir.

---

## 2026-05-14 - TASK-0125 Readability Fix

**Niye:** Sikayet Analitigi screenshot-da info box metni oxunmurdu, eyni mesaj ikinci sari blokda tekrar olunurdu, Menbe/date sutunlari dar gorunurdu. Menyu Analitigi ve diger marketing tools info box pattern-i de eyni kontrast problemini dasiyirdi.

**Ne deyisdi:** 7 marketing tool-da "Niye bu vacibdir?" info box blue contrast card-a kecdi. Sikayet duplicate warning silindi, Menbe select genislendi, backend-compatible source value-lari saxlanildi, date secilende DD.MM.YYYY label gosterilir.

**Ders:** Screenshot-da gorunen oxunurluq problemi production-critical UX bug-dur; content dogru olsa da kontrast ve grid onu istifade olunmaz ede biler.

---

## 2026-05-14 - TASK-0124 Quick UX Wins (Senbe pitch hazirligi)

**Niye:** 16 May yatirimci pitch ucun 14 May screenshot-larinda gorunen UX surtunmeleri temizlendi: Gross Margin AZ istifadecisi ucun aydin deyildi, Working Capital yox idi, date format browser default idi, Menyu input placeholder-leri kesilirdi.

**Ne deyisdi:** Promosyon ROI AZ terminology + tooltip + Stok Tamponu + Working Capital output, Sikayet DD.MM.YYYY display, Menyu responsive input grid + BCG izahi, Sezon Planlama premium optional fields quick render.

**Ders:** Yerli istifadeci ucun dil tercumesi kifayet deyil; termin ve cash-flow mentiqi de lokallasmalidir.

---

## 2026-05-14 - TASK-0123 Brain Foundation

**Niyə:** Sezon Planlama TASK-0122 sonra işləyirdi, amma çıxış ümumi AI cavabı səviyyəsində qalırdı. Bu task Doğan Dersleri, KAHI nümunələri və 2026 trendlərini təkrar istifadə edilən brain modulu kimi qurur.

**Yaranır:** `lib/marketing-tools/_brain/` modulu - Dogan Dersleri, KAHI examples, 2026 trends, methodology, AZ teqvim. Marketing alətlər `buildBrainContext(slug)` ilə uyğun hissələri prompt-a inject edə bilir.

**Sezon Planlama:** Schema yeni strateji sahələrlə genişləndi: `executiveSummary`, `methodology`, `doganRule`, `aeoRecommendations`, `risksWatchout`. Legacy quick-view sahələri saxlandı ki, TASK-0125 frontend render gələnə qədər mövcud kartlar qırılmasın.

**Dərs:** Premium AI cavabı yalnız JSON key alignment deyil; domain brain + struktur + frontend render ayrıca fazalarla getməlidir.

---

## 2026-05-14 - TASK-0122 Faza 2 (REAL FIX)

**Kok sebeb:** TASK-0122 Faza 1 debug log-u gosterdi ki, DeepSeek AZ acarlar (kampaniya_takvimi, tovsiyeler) qaytarir, Zod schema EN acarlar (calendar, topRecommendations) gozleyir. PR #117-den beri uyğunsuzluq var idi.

**Fix:** Inline Sezon Planlama prompt-a strict English JSON structure telebi elave edildi. Schema deyismir.

**Ders:**
1. Schema/Prompt eyni anda yoxlanmalidir.
2. Her yeni marketing tool ucun prompt-da JSON numunesi mutleqdir.
3. Faza 1 debug olmadan korleme fix riski cox yuksekdir.

**TODO:** 6 diger marketing tool yoxlanilmalidir — eyni problem ola biler.

---
## 2026-05-14 - TASK-0122 Faza 1

**Problem:** TASK-0120 (PR #119) deploy oldu, amma istifadeci `ai-output-invalid` aldi. DeepSeek call success qaytardi, Zod parse fail oldu.

**Faza 1:** Raw output capture deploy edilir. Dogan submit edib real DeepSeek output-u ve Zod error-u alacaq.

**Faza 2:** Real output elde edildikden sonra schema/prompt align edilecek.

**Ders:** "JSON mode bunu toparlar" varsayimi PR #119-da yanlis idi. DeepSeek valid JSON verir, amma Zod schema-ya birebir uygunluq garanti yoxdur.

---
## 2026-05-13 - TASK-0120

**Problem:** Sezon Planlama 502 davam edirdi (PR #117 + #118 sonrasi).
**Diaqnoz:** `/tmp/TASK-0114-DIAGNOSE-RAPORT.md` - non-streaming + proxy timeout + 3000 token output.
**Fix:** AI router streaming + AbortController timeout + DeepSeek JSON mode. Schema sert geri qaytarildi.
**Ders:** Schema gevsedilmesi simptom ortmesi idi. Kok sebeb diaqnozu edilmeden eyni problem tekrar ede bilerdi.

---

Sessiya qeydləri. Hər iş sessiyasının nəticəsi burada.

---

## 2026-05-10 — KST Yoxlayici Live (TASK-0103)

**Problem:** SAGIRD pillesinde 2-ci alet lazimdir. Marka Kompasi bazardaki yeri verir, KST ise daxili real veziyyeti olcur.

**Hell:**
1. API endpoint `app/api/marketing-tools/kst-yoxlayici/route.ts` — Marka Kompasi pattern ile eyni
2. Reusable `LikertScale` komponenti `shared/` qovlugunda — memo-optimized, gelecek aletler ucun
3. `KSTQuestionnaireForm` — 30 sual, 3 section accordion, useReducer state, progress bar
4. `KSTResultCard` — overall skor, 3 kateqoriya, benchmark muqayise, 3 kritik problem, 30 gunluk plan
5. `KSTYoxlayiciPage` — MarkaKompasiPage ile eyni orchestrator pattern (loading/form/result)

**Marka Kompasi dersinden:**
- `callAIJson` `{ data, meta }` qaytarir (meta.provider, meta.tokensUsed, meta.costAzn)
- Auth: `getAuthFromCookie()` → `JwtPayload` (userId, email, role)
- Dashboard i18n: inline copy pattern (useTranslations istifade olunmur)

**Build:** PASS
**Novbeti:** TASK-0104 — GBP Qurucu ve ya Gorunurluk Testi

---

## 2026-05-09 — Marka Kompasi Live (TASK-0102)

**Problem:** Marketinq Ocagi 12 aletden ibaret toolkit idi, lakin hec biri canli deyildi. Marka Kompasi butun diger aletlerin kontekst menbeyi oldugu ucun ilk implement edilmeliydi.

**Hell:**
1. API endpoint `app/api/marketing-tools/marka-kompasi/route.ts`:
   - POST: zod input validation → gating check → Claude AI call (callAIJson) → zod output validation → DB insert
   - GET: son ugurlu run-u qaytarir (history)
   - Auth: `getAuthFromCookie()` JWT pattern istifade edildi
   - Error handling: AI fail → DB-de `status: 'error'` + `errorMessage` yazilir

2. UI komponentleri (3 fayl):
   - `MarkaKompasiPage.tsx` — orchestrator (loading → form → result state machine)
   - `QuestionnaireForm.tsx` — 5 sual (3 select + 1 textarea + 1 text input)
   - `ResultCard.tsx` — tagline (copy button), ICP, value prop, differentiators, useThisIn

3. `[slug]/page.tsx` yenilendi: `slug === 'marka-kompasi' && status === 'live'` → MarkaKompasiPage render
4. Config update: `status: 'planned'` → `'live'`, field adlari spec-e uygunlasdirildi

**Sprint 1 infra istifade:**
- `callAIJson<T>()` — AI router isledi, meta (provider, tokens, cost) qaytardir
- `checkToolAccess()` — gating isledi, `mapPlanToTier()` ile MemberPlan→MarketingToolTier cevirme
- `marketingToolRuns` schema — DB insert/update isledi, nullable `db` check var
- `getToolConfig()` — config-den slug ile tool tapma

**Qerar:** `zod` dependency elave edildi (validation ucun). `dependencies`-e qoyuldu (Hostinger dersi).

**Build:** PASS
**Protected violations:** 0
**New TS errors:** 0

**Novbeti:** TASK-0103 — KST Yoxlayici (SAGIRD, ikinci alet)

### TASK-0102 netice (2026-05-10)
- Sprint 2 tam tamamlandi
- Marka Kompasi canlidir: /dashboard/marketinq-ocagi/marka-kompasi
- Ilk run: user_id=13, status=success, ai_provider=deepseek (Claude fallback),
  tokens=760, cost=0.000228 AZN, completion=5s
- Fallback mexanizmi production-da test edildi, isleyir
- Novbeti: TASK-0103 (KST Yoxlayici) — SAGIRD pille, ikinci alet

### Cetinlikler ve dersler
- Sprint 1 spec-de is_premium column elave edilmesi planlanmisdi, lakin
  agent qisa yoldan getdi (mapPlanToTier shortcut). TD-001 yaradildi,
  Stripe inteqrasiyasina qeder nezere alinmir.
- Pre-commit/pre-push hook ile main-e direct push qadagasi, her
  deyisiklik ucun PR — bu standart isledi, qoruyucu subut oldu.
- AI fallback (Claude→DeepSeek) esl production sinaginda ilk defe
  test edildi, problemsiz kecdi.

---

## 2026-05-09 — Marketinq Ocagi Faza 0 Infrastructure (TASK-0101)

**Problem:** DK Agency platformasinda restoran sahiblari ucun marketinq aletleri yox idi. Movcud toolkit (food cost, P&L, checklist) emeliyyat fokusludur. Marketinq — SMM, branding, reqib analizi, AEO — tamam bos idi.

**Kok sebeb:** Marketinq alet kategoriyasi hec vaxt planlanmamisdi. "Marketinq el kitabi 2023" senedi B2C doner brendi ucun yazilibdi, yeni B2B HoReCa vizyonuna uygun deyildi.

**Hell:**
Sprint 1 (Faza 0) — yalniz infrastruktur, hec bir alet implement edilmir:

1. `lib/marketing-tools-config.ts` — 12 aletin single source of truth konfiqurasiyasi
   - 4 kateqoriya: Gorunurluk, Kontent, Strateji, Reputasiya
   - 3 pille: SAGIRD (pulsuz, 4 alet), KALFA (49 AZN, +5), USTA (149 AZN, +3)
   - Her aletin slug, AI provider, input schema, run limiti var
   - `getToolConfig()`, `getToolsByTier()`, `canAccessTool()` helper-leri

2. `lib/ai-router.ts` — vahid AI gateway
   - DeepSeek primary, Claude fallback (Sarmal anti-pattern yasaq)
   - `callAI()` ve `callAIJson<T>()` funksiyalari
   - Token tracking + AZN cost hesablama
   - Movcud KAZAN AI route-undan model/baseUrl pattern-i oyrenilib

3. `lib/marketing-gating.ts` — tier erisim kontrolu
   - `MemberPlan` → `MarketingToolTier` mapping (free→sagird, member→kalfa, admin→usta)
   - Ayliq run limit check (DB query ile)
   - `db` null check (Neon baglantisi olmadiqda graceful degrade)

4. `lib/db/schema.ts` — `marketing_tool_runs` cedveli
   - userId, toolSlug, inputData (jsonb), outputData, aiProvider, tokensUsed, costAzn, status
   - 3 index: user, slug, createdAt

5. Dashboard sehifeleri
   - `/dashboard/marketinq-ocagi` — 12 kart, 4 kateqoriya, 4 dil inline copy
   - `/dashboard/marketinq-ocagi/[slug]` — placeholder ("Tezlikle")
   - Sidebar-a Sparkles icon ile yeni entry (4 dil)

6. i18n — `messages/az.json`-a `marketing.*` acarlari elave edildi

**Spec-den ferqler:**
- Spec `/[locale]/ocaq/marketinq-ocagi/` isteyirdi → real codebase `/dashboard/` istifade edir (i18n middleware-den xaric), ona uygunlasdirildi
- Spec `messages/az/marketing.json` isteyirdi → real struktur tek `messages/az.json` faylidir, nested keys elave edildi
- Spec `drizzle/schema/marketing-tools.ts` isteyirdi → real schema tek `lib/db/schema.ts` faylidir, ora elave edildi

**Cetinlikler:**
- `db` exportu nullable (`neon` connection yoksa null) — gating-de null check lazim oldu
- `sql` adi drizzle-orm import ile `@neondatabase/serverless` import-u toqqusudu — `dsql` alias istifade edildi

**Build:** PASS
**Protected violations:** 0
**Encoding issues:** 0
**Yeni TS xetalari:** 0 (movcud 7 xeta evvelden var)

**Novbeti:** TASK-0102 — Marka Kompasi tam implementasiya (5 sual UI + Claude AI cagirisi + JSON output)

---

## 2026-05-07 — Password Reset Real DB + Deployment Docs (TASK-0078, TASK-0081)

**Problem:** Audit (5 May) qeyd etdi ki forgot-password və reset-password route-ları mock-state istifadə edir. Server restart-da bütün tokenlar itir. Production-da işləmir.

**Kök səbəb:** İlkin development zamanı `lib/auth/mock-state.ts` ilə yazılmışdı, login/register real DB-yə keçirilmişdi amma forgot/reset keçirilməmişdi.

**Həll:**
1. `app/api/auth/forgot-password/route.ts` — Drizzle DB ilə yenidən yazıldı (register pattern)
2. `app/api/auth/reset-password/route.ts` — Drizzle DB ilə yenidən yazıldı (bcrypt + token validation)
3. `RATE_LIMITS.authResetPassword` əlavə edildi (5/saat/IP)
4. `docs/DEPLOYMENT.md` yaradıldı — tam deploy bələdçisi

**Build:** PASS
**Protected violations:** 0

---

## 2026-05-03 — Auth Frontend Fix (TASK-0022)

**Problem:** Login/register formları köhnə `/api/member/auth` endpoint-inə gedirdi (400 error), locale auth route-ları 404 qaytarırdı, password input-larda autocomplete yox idi.

**Həll:**
1. Login form: `/api/member/auth` → `/api/auth/login` (JWT response ilə MemberSession yaradılır)
2. Register form: `/api/member/auth` → `/api/auth/register` (verificationRequired flow)
3. Locale wrappers: `app/[locale]/auth/login/page.tsx` + `register/page.tsx` yaradıldı
4. Autocomplete: `current-password` (login), `new-password` (register + reset)

**Commits:**
- `ae740ae` — fix(auth): update login/register form endpoints
- `6ea8320` — feat(auth): add locale route wrappers for login/register
- `82972a7` — fix(auth): add autocomplete attributes to password inputs

**Build:** PASS (26.6s)
**Protected violations:** 0
**Encoding issues:** 0
## 2026-05-09 — TASK-0100: P&L Simulator Pattern C → A

**Changed:**
- P&L Simulator copy moved to `messages/*.json` under `toolkit.pnl`.
- Component now uses `useTranslations('toolkit.pnl')` and `useLocale()`.
- Currency and percent output use `Intl.NumberFormat`.
- Inputs parse locale-aware decimal formats for AZ/RU/TR and EN.
- Added Playwright smoke coverage for the P&L simulator in 4 locales.

**Out of scope:** other toolkit calculators, migrations, protected files.

---
