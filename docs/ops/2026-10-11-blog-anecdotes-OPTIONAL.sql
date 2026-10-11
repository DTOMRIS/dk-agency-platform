-- TASK-0545 · İSTƏYƏ BAĞLI — yalnız Doğan bilir. Əsas faylı (2026-10-11-blog-content-audit.sql) işlətdikdən SONRA.
-- 24 maddə: sizin anekdotlarınız (müştəri rəqəmləri, «Bakı reallığı» nümunələri) və DK haqqında iddialar (AFA, AzQuality, OCAQ, audit xidməti, CTH).
-- Doğrudursa həmin UPDATE-i SİLİN (toxunmayın). Uydurmadırsa saxlayın. Sonra:  psql "$DATABASE_URL" -f docs/ops/2026-10-11-blog-anecdotes-OPTIONAL.sql
BEGIN;

-- [insaatdan-acilisa-checklist] First-person client anecdote with specific figures (2→5→2.5 months) inside a fake 'DOĞAN NOTU' in content; likely invented. Also check '2.5 aya bitərdi' later i
--   İNDİ: "Bir sahibkar gəldi, dedi 'remont 2 aya bitəcək.' 5 aya bitdi.
--   YENİ: "Çox sahibkar 'remont 2 aya bitəcək' deyir, sonra aylarla uzanır.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$"Bir sahibkar gəldi, dedi 'remont 2 aya bitəcək.' 5 aya bitdi.$dkq$, $dkq$"Çox sahibkar 'remont 2 aya bitəcək' deyir, sonra aylarla uzanır.$dkq$), updated_at = now() WHERE slug = 'insaatdan-acilisa-checklist';

-- [restoran-acarken-sehvler] Specific invented-looking case (district, owner age, '4 ay sonra bağlanır').
--   İNDİ: **Bakı reallığı:** Yasamalda açılan restoran. Sahibi 45 yaşında, "ailə restoranı" istəyir, amma menyuda nargilə var.
--   YENİ: **Tipik nümunə:** "ailə restoranı" istəyən, amma menyuya nargilə qoyan sahibkar.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$**Bakı reallığı:** Yasamalda açılan restoran. Sahibi 45 yaşında, "ailə restoranı" istəyir, amma menyuda nargilə var.$dkq$, $dkq$**Tipik nümunə:** "ailə restoranı" istəyən, amma menyuya nargilə qoyan sahibkar.$dkq$), updated_at = now() WHERE slug = 'restoran-acarken-sehvler';

-- [restoran-acarken-sehvler] Invented-looking client comparison with specific months.
--   İNDİ: **Bakı reallığı:** 28 May metrosu yanında biznes nahar restoranı açan sahibkar 4 ayda breakeven keçir. Eyni konsepti Bayılda açan 8 aydan sonra hələ də zərərdədir.
--   YENİ: **Qayda:** eyni konsept iki fərqli küçədə tamam fərqli nəticə verə bilər.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$**Bakı reallığı:** 28 May metrosu yanında biznes nahar restoranı açan sahibkar 4 ayda breakeven keçir. Eyni konsepti Bayılda açan 8 aydan sonra hələ də zərərdədir.$dkq$, $dkq$**Qayda:** eyni konsept iki fərqli küçədə tamam fərqli nəticə verə bilər.$dkq$), updated_at = now() WHERE slug = 'restoran-acarken-sehvler';

-- [restoran-acarken-sehvler] Invented-looking specific case.
--   İNDİ: **Bakı reallığı:** Nizami küçəsində iki yeni restoran açıldı. Biri 95 maddəlik menyu ilə, ikincisi 28 maddəlik. 6 ay sonra: 95-maddəli bağlandı, 28-maddəli genişləndi.
--   YENİ: **Qayda:** qısa menyu ilə açılan restoran fokusunu saxlayır, uzun menyu ilə açılan isə anbarda boğulur.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$**Bakı reallığı:** Nizami küçəsində iki yeni restoran açıldı. Biri 95 maddəlik menyu ilə, ikincisi 28 maddəlik. 6 ay sonra: 95-maddəli bağlandı, 28-maddəli genişləndi.$dkq$, $dkq$**Qayda:** qısa menyu ilə açılan restoran fokusunu saxlayır, uzun menyu ilə açılan isə anbarda boğulur.$dkq$), updated_at = now() WHERE slug = 'restoran-acarken-sehvler';

-- [restoran-acarken-sehvler] Invented-looking client quote with numbers; continues with 'Komissiya + paket + əlavə işçi = qalan hissə yox idi."' — remove that tail too.
--   İNDİ: **Bakı reallığı:** Yasamal kafe sahibi 2 ay sonra Wolt-dan çıxdı. "Ayda 4000 AZN delivery gəliri görünürdü, amma əsl olaraq 800 AZN qaldı.
--   YENİ: **Tipik hal:** dövriyyədə böyük görünən çatdırılma gəliri komissiya, paket və əlavə işçidən sonra çox az qalır.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$**Bakı reallığı:** Yasamal kafe sahibi 2 ay sonra Wolt-dan çıxdı. "Ayda 4000 AZN delivery gəliri görünürdü, amma əsl olaraq 800 AZN qaldı.$dkq$, $dkq$**Tipik hal:** dövriyyədə böyük görünən çatdırılma gəliri komissiya, paket və əlavə işçidən sonra çox az qalır.$dkq$), updated_at = now() WHERE slug = 'restoran-acarken-sehvler';

-- [restoran-acarken-sehvler] Specific invented-looking case ('Üçüncü 12 AZN — 3 ayda bağlandı').
--   İNDİ: - Eyni Yasamal kebabçısı, fərqli sahibkarlar
--   YENİ: - Eyni küçədə üç kebabçı, fərqli sahibkarlar
UPDATE blog_posts SET content_az = replace(content_az, $dkq$- Eyni Yasamal kebabçısı, fərqli sahibkarlar$dkq$, $dkq$- Eyni küçədə üç kebabçı, fərqli sahibkarlar$dkq$), updated_at = now() WHERE slug = 'restoran-acarken-sehvler';

-- [restoran-acarken-sehvler] 'real nümunə' claim — the 'Bakı reallığı' cases look invented.
--   İNDİ: Bu yazıda Bakıda və Azərbaycan regionlarında müşahidə etdiyimiz **12 ən bahalı səhvi** sənə təqdim edirik. Hər birinə həll yolu, real nümunə, və harada kömək tapacağın göstərilir.
--   YENİ: Bu yazıda Bakıda və Azərbaycan regionlarında müşahidə etdiyimiz **12 ən bahalı səhvi** sənə təqdim edirik. Hər birinə həll yolu və harada kömək tapacağın göstərilir.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$Bu yazıda Bakıda və Azərbaycan regionlarında müşahidə etdiyimiz **12 ən bahalı səhvi** sənə təqdim edirik. Hər birinə həll yolu, real nümunə, və harada kömək tapacağın göstərilir.$dkq$, $dkq$Bu yazıda Bakıda və Azərbaycan regionlarında müşahidə etdiyimiz **12 ən bahalı səhvi** sənə təqdim edirik. Hər birinə həll yolu və harada kömək tapacağın göstərilir.$dkq$), updated_at = now() WHERE slug = 'restoran-acarken-sehvler';

-- [ilk-5-deqiqe-qonaq-qarsilama] First-person anecdote with a specific place in a 'Doğan Notu' written in content (doganNote field is empty) — confirm with Doğan or make general.
--   İNDİ: "Bir dəfə Xınalıqda qonaq qaldığım evdə sahibə əl ilə dəmlədiyi dağ çayını və ev mürəbbəsini gətirdi — heç nə soruşmadan. O an o evi heç vaxt unutmadım.
--   YENİ: "Qonaq evində sahibənin heç nə soruşmadan gətirdiyi bir stəkan dağ çayı və ev mürəbbəsi illərlə yadda qalır.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$"Bir dəfə Xınalıqda qonaq qaldığım evdə sahibə əl ilə dəmlədiyi dağ çayını və ev mürəbbəsini gətirdi — heç nə soruşmadan. O an o evi heç vaxt unutmadım.$dkq$, $dkq$"Qonaq evində sahibənin heç nə soruşmadan gətirdiyi bir stəkan dağ çayı və ev mürəbbəsi illərlə yadda qalır.$dkq$), updated_at = now() WHERE slug = 'ilk-5-deqiqe-qonaq-qarsilama';

-- [marka-starbucks-sansi-burger-king-dersi] Unverified institutional claim (DK/Doğan as founder of 'AFA'); not found in site texts (only 'AFA Akademiya outline'). Keep only if Doğan confirms.
--   İNDİ: AFA-nın qurucusu olaraq, marka hüququ bizim işimizin mərkəzindədir.
--   YENİ: Marka hüququ bizim işimizin mərkəzindədir.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$AFA-nın qurucusu olaraq, marka hüququ bizim işimizin mərkəzindədir.$dkq$, $dkq$Marka hüququ bizim işimizin mərkəzindədir.$dkq$), updated_at = now() WHERE slug = 'marka-starbucks-sansi-burger-king-dersi';

-- [marka-starbucks-sansi-burger-king-dersi] Roughly right (2001, ~A$46.9m, Hungry Jack's v Burger King) but the case was about breach of the franchise agreement, not 'getting the name back'; safer to gene
--   İNDİ: Sonradan adını geri almağa çalışdı, məhkəmədə uduzdu və yerli françayz alana təxminən 47 milyon dollar təzminat ödədi.
--   YENİ: Sonralar yerli françayz alanla məhkəmə çəkişməsində uduzdu və böyük təzminat ödədi.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$Sonradan adını geri almağa çalışdı, məhkəmədə uduzdu və yerli françayz alana təxminən 47 milyon dollar təzminat ödədi.$dkq$, $dkq$Sonralar yerli françayz alanla məhkəmə çəkişməsində uduzdu və böyük təzminat ödədi.$dkq$), updated_at = now() WHERE slug = 'marka-starbucks-sansi-burger-king-dersi';

-- [bir-elan-on-platforma-ev-kirayesi] UNSOURCED occupancy figures inside a content 'Doğan Notu' (doganNote field empty).
--   İNDİ: Ev ayda 4-5 gün dolur. Halbuki düzgün elan + bir neçə platforma + təqvim sinxronu ilə həmin ev ayda 15-20 gün dolur.
--   YENİ: Ev ayın çox hissəsi boş qalır. Halbuki düzgün elan + bir neçə platforma + təqvim sinxronu ilə həmin ev xeyli çox dolur.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$Ev ayda 4-5 gün dolur. Halbuki düzgün elan + bir neçə platforma + təqvim sinxronu ilə həmin ev ayda 15-20 gün dolur.$dkq$, $dkq$Ev ayın çox hissəsi boş qalır. Halbuki düzgün elan + bir neçə platforma + təqvim sinxronu ilə həmin ev xeyli çox dolur.$dkq$), updated_at = now() WHERE slug = 'bir-elan-on-platforma-ev-kirayesi';

-- [1-porsiya-food-cost-hesablama] UNSOURCED figure in content 'DOĞAN NOTU'.
--   İNDİ: Bu 10 dəqiqəyə ayda 2000-3000₼ qoruyursan."
--   YENİ: Bu 10 dəqiqə ilə ayda xeyli pul qoruyursan."
UPDATE blog_posts SET content_az = replace(content_az, $dkq$Bu 10 dəqiqəyə ayda 2000-3000₼ qoruyursan."$dkq$, $dkq$Bu 10 dəqiqə ilə ayda xeyli pul qoruyursan."$dkq$), updated_at = now() WHERE slug = '1-porsiya-food-cost-hesablama';

-- [1-porsiya-food-cost-hesablama] Specific client anecdote with number in content 'DOĞAN NOTU'; generalize unless Doğan confirms.
--   İNDİ: "Bir sahibkara dedim ki food cost-un 42%-dir, o dedi 'olar da, hamının belədir.'
--   YENİ: "Sahibkara food cost-un çox yüksəkdir deyəndə çox vaxt eyni cavabı alıram: 'olar da, hamının belədir.'
UPDATE blog_posts SET content_az = replace(content_az, $dkq$"Bir sahibkara dedim ki food cost-un 42%-dir, o dedi 'olar da, hamının belədir.'$dkq$, $dkq$"Sahibkara food cost-un çox yüksəkdir deyəndə çox vaxt eyni cavabı alıram: 'olar da, hamının belədir.'$dkq$), updated_at = now() WHERE slug = '1-porsiya-food-cost-hesablama';

-- [marka-qeydiyyati-azerbaycan] 'AzQuality' initiative unverified (not in site texts); remove unless Doğan confirms it exists.
--   İNDİ: Əgər hədəfin yerli markanı qlobala daşımaqdırsa, bu mexanizm AzQuality kimi markalaşma təşəbbüslərinin praktik təməlidir.
--   YENİ: Əgər hədəfin yerli markanı qlobala daşımaqdırsa, bu mexanizm praktik təməldir.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$Əgər hədəfin yerli markanı qlobala daşımaqdırsa, bu mexanizm AzQuality kimi markalaşma təşəbbüslərinin praktik təməlidir.$dkq$, $dkq$Əgər hədəfin yerli markanı qlobala daşımaqdırsa, bu mexanizm praktik təməldir.$dkq$), updated_at = now() WHERE slug = 'marka-qeydiyyati-azerbaycan';

-- [ai-ile-favok-qorumasi] Unverified: OCAQ is a separate product; branch comparison / early risk signals and an 'AI Restoran Operasiya Audit xidməti' are not confirmed in this platform's
--   İNDİ: DK Agency-nin **KAZAN AI** və **OCAQ** sahibkar paneli məhz bu FAVÖK qoruma sistemini qurur: data görünür hala gəlir, şöbələr müqayisə olunur, risk siqnalları erkən gəlir.
--   YENİ: DK Agency-nin **KAZAN AI** köməkçisi və [Restoran Audit](/marketinq/restoran-audit) aləti marjanı aşağı salan sahələri görməyə kömək edir.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$DK Agency-nin **KAZAN AI** və **OCAQ** sahibkar paneli məhz bu FAVÖK qoruma sistemini qurur: data görünür hala gəlir, şöbələr müqayisə olunur, risk siqnalları erkən gəlir.$dkq$, $dkq$DK Agency-nin **KAZAN AI** köməkçisi və [Restoran Audit](/marketinq/restoran-audit) aləti marjanı aşağı salan sahələri görməyə kömək edir.$dkq$), updated_at = now() WHERE slug = 'ai-ile-favok-qorumasi';

-- [menyu-muhendisliyi-satis] UNSOURCED client results (20%/30%); the 42-dish client case itself is unverified.
--   İNDİ: 8-ni çıxardıq, mətbəx sürəti 20% artdı, waste 30% azaldı.
--   YENİ: 8-ni çıxardıq — mətbəx yüngülləşdi, israf azaldı.
UPDATE blog_posts SET dogan_note = replace(dogan_note, $dkq$8-ni çıxardıq, mətbəx sürəti 20% artdı, waste 30% azaldı.$dkq$, $dkq$8-ni çıxardıq — mətbəx yüngülləşdi, israf azaldı.$dkq$), updated_at = now() WHERE slug = 'menyu-muhendisliyi-satis';

-- [rayonda-ev-kirayesi-sistem] Specific occupancy number as promise; unsourced.
--   İNDİ: Bir sahibə dedim: 'Bu evi düzgün elan etsən, ayda 15 gün dolar.' İnanmadı.
--   YENİ: Bir sahibə dedim: 'Bu evi düzgün elan etsən, xeyli çox dolar.' İnanmadı.
UPDATE blog_posts SET dogan_note = replace(dogan_note, $dkq$Bir sahibə dedim: 'Bu evi düzgün elan etsən, ayda 15 gün dolar.' İnanmadı.$dkq$, $dkq$Bir sahibə dedim: 'Bu evi düzgün elan etsən, xeyli çox dolar.' İnanmadı.$dkq$), updated_at = now() WHERE slug = 'rayonda-ev-kirayesi-sistem';

-- [isci-saxlama-7-strategiya] UNSOURCED client results (150%→80%).
--   İNDİ: Bir restoranda işçi dönüşümü ildə 150% idi. Tək bir dəyişiklik etdik: hər shift-dən əvvəl 10 dəqiqəlik görüş başlatdıq. 6 ayda dönüşüm 80%-ə düşdü.
--   YENİ: Bir restoranda işçilər bir-birinin ardınca gedirdi. Tək bir dəyişiklik etdik: hər növbədən əvvəl 10 dəqiqəlik görüş başlatdıq. Gedənlərin sayı nəzərəçarpacaq dərəcədə azaldı.
UPDATE blog_posts SET dogan_note = replace(dogan_note, $dkq$Bir restoranda işçi dönüşümü ildə 150% idi. Tək bir dəyişiklik etdik: hər shift-dən əvvəl 10 dəqiqəlik görüş başlatdıq. 6 ayda dönüşüm 80%-ə düşdü.$dkq$, $dkq$Bir restoranda işçilər bir-birinin ardınca gedirdi. Tək bir dəyişiklik etdik: hər növbədən əvvəl 10 dəqiqəlik görüş başlatdıq. Gedənlərin sayı nəzərəçarpacaq dərəcədə azaldı.$dkq$), updated_at = now() WHERE slug = 'isci-saxlama-7-strategiya';

-- [isci-saxlama-7-strategiya] Client anecdote with specifics ('6 aydır heç kim getməyib') in content 'DOĞAN NOTU'; confirm or generalize.
--   İNDİ: "3 ofisiant ardıcıl getdi, hamısı 'maaş azdır' dedi. Maaşı artırdıq — 4-cü ofisiant da getdi.
--   YENİ: "Çox vaxt gedən ofisiant 'maaş azdır' deyir, maaşı artırırsan — yenə gedirlər.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$"3 ofisiant ardıcıl getdi, hamısı 'maaş azdır' dedi. Maaşı artırdıq — 4-cü ofisiant da getdi.$dkq$, $dkq$"Çox vaxt gedən ofisiant 'maaş azdır' deyir, maaşı artırırsan — yenə gedirlər.$dkq$), updated_at = now() WHERE slug = 'isci-saxlama-7-strategiya';

-- [sertifikatli-komanda-cth-portal-karyera] Verify against CTH centre listing: TQTA project rules document only Level 2 Award in Cookery Skills (QAN 603/6705/2) as the active CTH pilot; other programmes u
--   İNDİ: Təklif olunan proqramlar arasında Level 2 Cookery Skills, Level 2 Barista Skills, Level 2 Professional Restaurant Front of House Service və Level 1 English for Tourism and Hospitality yer alır.
--   YENİ: Təklif olunan proqramlar arasında Level 2 Award in Cookery Skills yer alır.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$Təklif olunan proqramlar arasında Level 2 Cookery Skills, Level 2 Barista Skills, Level 2 Professional Restaurant Front of House Service və Level 1 English for Tourism and Hospitality yer alır.$dkq$, $dkq$Təklif olunan proqramlar arasında Level 2 Award in Cookery Skills yer alır.$dkq$), updated_at = now() WHERE slug = 'sertifikatli-komanda-cth-portal-karyera';

-- [aqta-cerime-checklist] Unverified audit service with written report; the real asset is /toolkit/aqta-checklist (30 items, 8 sections, daily/weekly/monthly plan). Keep the service sent
--   İNDİ: DK Agency komandası **gigiyena auditi** həyata keçirir — AQTA müfəttişinin baxdığı hər maddəni yoxlayırıq, yazılı hesabat və düzəltmə planı təqdim edirik.
--   YENİ: DK Agency-nin pulsuz [AQTA yoxlamasına hazırlıq](/toolkit/aqta-checklist) alətində gigiyena, sənədlər və ərzaq saxlama üzrə bölmə-bölmə özünü yoxla.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$DK Agency komandası **gigiyena auditi** həyata keçirir — AQTA müfəttişinin baxdığı hər maddəni yoxlayırıq, yazılı hesabat və düzəltmə planı təqdim edirik.$dkq$, $dkq$DK Agency-nin pulsuz [AQTA yoxlamasına hazırlıq](/toolkit/aqta-checklist) alətində gigiyena, sənədlər və ərzaq saxlama üzrə bölmə-bölmə özünü yoxla.$dkq$), updated_at = now() WHERE slug = 'aqta-cerime-checklist';

-- [wolt-bolt-komissiyon] Specific client case with numbers (and follow-up '15% artırdıq... 3.500₼') likely invented; delete the next sentence too or confirm with Doğan.
--   İNDİ: Bir restoran sahibi gəldi, dedi 'Wolt-dan ayda 15.000₼ gəlir gəlir, əla!' Hesab etdik — komissiyon 4.500₼, qablaşdırma 750₼, əlavə işçi 2.000₼. 15.000₼ gəlirdən xalis qazanc 800₼ idi.
--   YENİ: Çox sahibkar deyir: 'Wolt-dan ayda yaxşı gəlir gəlir, əla!' Hesablayanda komissiya, qablaşdırma və əlavə işçidən sonra xalis qazancın çox az qaldığı çıxır.
UPDATE blog_posts SET dogan_note = replace(dogan_note, $dkq$Bir restoran sahibi gəldi, dedi 'Wolt-dan ayda 15.000₼ gəlir gəlir, əla!' Hesab etdik — komissiyon 4.500₼, qablaşdırma 750₼, əlavə işçi 2.000₼. 15.000₼ gəlirdən xalis qazanc 800₼ idi.$dkq$, $dkq$Çox sahibkar deyir: 'Wolt-dan ayda yaxşı gəlir gəlir, əla!' Hesablayanda komissiya, qablaşdırma və əlavə işçidən sonra xalis qazancın çox az qaldığı çıxır.$dkq$), updated_at = now() WHERE slug = 'wolt-bolt-komissiyon';

-- [kurumsal-kitabca-emeliyyat] Unverified on-site manual-writing service; real asset is /franchise/francbuk-generatoru (AI handbook skeleton). Keep service text only if Doğan confirms.
--   İNDİ: Kurumsal kitabça hazırlamaq vaxt alır — biz sizin üçün hazırlayırıq. DK Agency komandası restoranınıza gəlir, bütün prosesləri qeydə alır, standartlaşdırır, **hazır kitabça** təqdim edir.
--   YENİ: Kurumsal kitabça hazırlamaq vaxt alır. Başlanğıc üçün DK Agency-nin [Françbuk generatoru](/franchise/francbuk-generatoru) ilə süni intellektlə əl kitabının skeletini (6 mərhələ) çıxar, sonra öz proseslərinlə doldur.
UPDATE blog_posts SET content_az = replace(content_az, $dkq$Kurumsal kitabça hazırlamaq vaxt alır — biz sizin üçün hazırlayırıq. DK Agency komandası restoranınıza gəlir, bütün prosesləri qeydə alır, standartlaşdırır, **hazır kitabça** təqdim edir.$dkq$, $dkq$Kurumsal kitabça hazırlamaq vaxt alır. Başlanğıc üçün DK Agency-nin [Françbuk generatoru](/franchise/francbuk-generatoru) ilə süni intellektlə əl kitabının skeletini (6 mərhələ) çıxar, sonra öz proseslərinlə doldur.$dkq$), updated_at = now() WHERE slug = 'kurumsal-kitabca-emeliyyat';

-- [basabas-noqtesi-hesablama] Specific client numbers (52/45 customers, 2.000₼/month, +6₼) likely invented; confirm or generalize.
--   İNDİ: 6 ayda çatmadı — hər ay 2.000₼ itirdi. Sonra menyu mühəndisliyi etdik, orta hesabı 6₼ artırdıq. İndi 45 müştəri ilə **mənfəətdədir.**
--   YENİ: Çatmadı — hər ay zərər yazdı. Sonra menyu mühəndisliyi ilə orta hesabı artırdıq və eyni müştəri sayı ilə mənfəətə çıxdı.
UPDATE blog_posts SET dogan_note = replace(dogan_note, $dkq$6 ayda çatmadı — hər ay 2.000₼ itirdi. Sonra menyu mühəndisliyi etdik, orta hesabı 6₼ artırdıq. İndi 45 müştəri ilə **mənfəətdədir.**$dkq$, $dkq$Çatmadı — hər ay zərər yazdı. Sonra menyu mühəndisliyi ilə orta hesabı artırdıq və eyni müştəri sayı ilə mənfəətə çıxdı.$dkq$), updated_at = now() WHERE slug = 'basabas-noqtesi-hesablama';

COMMIT;