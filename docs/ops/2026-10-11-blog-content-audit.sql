-- TASK-0545 · Doğan işlədir (Claude production DB-yə yazmır):  psql "$DATABASE_URL" -f docs/ops/2026-10-11-blog-content-audit.sql
-- Bloq məzmun auditi (37 yazı): uydurma sitatlar, mövcud olmayan alət/xidmət iddiaları, mənbəsiz rəqəmlər, səhv linklər,
-- «12 il» → «40 il», «franchise» → «françayz», köhnə «Kateqoriya | Oxu müddəti» sətirləri. Hesabat: docs/reports/2026-10-11-blog-content-audit.md
-- Hər UPDATE yazının indiki mətninin md5-inə bağlıdır: arada kimsə yazını dəyişibsə «UPDATE 0» olur, heç nə üstünə yazılmır.
-- Silinən 30 sitatın tam mətni: docs/ops/2026-10-11-guru-boxes-deleted.json (geri qaytarmaq üçün).
BEGIN;

-- 1) Yazılar (37 yazı)
-- insaatdan-acilisa-checklist
UPDATE blog_posts SET content_az = $dkq$---

İcarə bağladın. Açar əlində. İndi nə? Ustabaşı gəldi, "başlayaq" dedi. Amma **nəyi, hansı sırayla, nə qədər vaxtda?** Bunu bilmədən başlasan — iş iki dəfə uzanar, büdcə isə nəzərdə tutduğundan xeyli çox olar.

İnşaat prosesi restoran açılışının **ən bahalı, ən stresli, ən çox problem çıxaran** mərhələsidir. Amma sistemli planlaşdırma ilə həm vaxt, həm pul, həm əsəb qənaət edə bilərsən.

Bu yazıda inşaatı **5 fazaya** bölürəm. Hər fazanın checklist-ini verirəm. Çap et, ustabaşına ver, hər gün yoxla.

---

## FAZA 1: ÖN HAZIRLIQ (İnşaatdan əvvəl — 2-4 həftə)

Bu mərhələdə **əlinə kərpic götürmə.** Əvvəlcə sənədləri, icazələri, texniki yoxlamaları tamamla.

| # | Maddə | Qeyd | ☐ |
|---|---|---|---|
| 1 | 3 faza elektrik yoxlaması | ASAN Kommunal → Azərişıq texniki yoxlama | ☐ |
| 2 | Təbii qaz bağlantısı yoxlaması | Qaz xətti varmı? Yeni çəkilməlidirsə — büdcə əlavə et | ☐ |
| 3 | Su və kanalizasiya giriş nöqtələri | Harada? Mətbəx planına uyğundur? | ☐ |
| 4 | Baca çıxış nöqtəsi | Harada olacaq? Komşu münaqişəsi riski? | ☐ |
| 5 | Tavan hündürlüyü ölçümü | Minimum 3 metr — asma tavan + havalandırma üçün | ☐ |
| 6 | Obyekt kodu yoxlaması | Əvvəlki kirayəçinin vergi/DSMF borcu? | ☐ |
| 7 | İnşaat layihəsi (plan) hazırlanması | Mətbəx, zal, anbar, tualet — hər şeyin yeri | ☐ |
| 8 | İnşaat büdcəsi hazırlanması | Kaba + incə iş + ehtiyat fond (15%) | ☐ |
| 9 | Ustabaşı/podratçı seçimi | Minimum 3 təklifdən müqayisə et | ☐ |
| 10 | İnşaat müqaviləsi | Vaxt, qiymət, material, cərimə şərtləri yazılı | ☐ |
| 11 | AQTA qeydiyyatı | ASAN Xidmət/KOBİA — PULSUZDUR | ☐ |
| 12 | FHN icazəsi müraciəti | Yanğın təhlükəsizliyi planı | ☐ |

> ⚠️ **Xəbərdarlıq:** 3 faza elektrik, təbii qaz və baca — bu üçünü yoxlamadan İNŞAATA BAŞLAMA. Bu üçü tək başına layihəni öldürə bilər. "12 Səhv" yazımızda detallı izah etmişik.

---

## FAZA 2: KABA İŞLƏR (3-6 həftə)

Kaba işlər — binanın "skeletidir." Divarlar, döşəmə, tavan, su/elektrik/qaz xətləri.

| # | Maddə | Qeyd | ☐ |
|---|---|---|---|
| 13 | Sökmə işləri | Köhnə divarlar, döşəmə, asma tavan | ☐ |
| 14 | Yeni divar qurulması | Mətbəx-zal ayrılması, tualet, anbar | ☐ |
| 15 | Su təsisatı (çəkilməsi) | Mətbəx lavaboları, tualet, qabyuyan yeri | ☐ |
| 16 | Kanalizasiya çəkilməsi | Yağ tutucu (grease trap) mütləqdir | ☐ |
| 17 | Elektrik xətləri çəkilməsi | 3 faza + ayrı xətlər: mətbəx, zal, işıq | ☐ |
| 18 | Qaz xəttinin çəkilməsi | Təbii qaz — propan istifadə etmə! | ☐ |
| 19 | Havalandırma kanalları | Mətbəx — ayrı, zal — ayrı sistem | ☐ |
| 20 | Baca quraşdırılması | Baca filtrləri, yanğın söndürücü sistem | ☐ |
| 21 | Döşəmə hazırlığı | Mətbəxdə sürüşməyən, yuyula bilən | ☐ |
| 22 | Tavan hazırlığı | Asma tavan üçün konstruksiya | ☐ |
| 23 | Yanğın söndürmə sistemi | Sprinkler və ya söndürücü — FHN tələbi | ☐ |
| 24 | İzolyasiya | Səs izolyasiyası (komşu şikayəti üçün) + istilik | ☐ |

---

## FAZA 3: İNCƏ İŞLƏR (3-5 həftə)

İncə işlər — müştərinin görəcəyi hissədir. Divar boyası, döşəmə örtüyü, işıqlandırma, mebel.

| # | Maddə | Qeyd | ☐ |
|---|---|---|---|
| 25 | Divar boyası / örtüsü | Konseptə uyğun rənglər | ☐ |
| 26 | Döşəmə örtüsü | Zal: parket/keramika, Mətbəx: sürüşməyən keramika | ☐ |
| 27 | Asma tavan quraşdırılması | İşıq nöqtələri əvvəlcədən planlanmalı | ☐ |
| 28 | İşıqlandırma sistemi | Dimmer (tənzimləyici) mütləqdir — gündüz/axşam fərqi | ☐ |
| 29 | Klima sistemi | Mətbəx + zal + anbar — ayrı zonalar | ☐ |
| 30 | Tualet remontu | Müştəri tualeti + işçi tualeti ayrı olmalıdır | ☐ |
| 31 | Bar/kassa sahəsi | POS yeri, pul saxlama, elektrik çıxışları | ☐ |
| 32 | Vitrin / giriş dizaynı | İlk təəssürat — "Atmosfer" yazımızda detallı | ☐ |
| 33 | Tabela quraşdırılması | Reklam (tabela) icazəsini unutma! | ☐ |
| 34 | Mebel quraşdırılması | Masalar, sandalyələr — konseptə uyğun | ☐ |
| 35 | Dekor elementləri | Rəsmlər, bitkılər, aksesuarlar | ☐ |
| 36 | Musiqi sistemi | Səs sistemi + biznes musiqi abunəliyi | ☐ |

---

## FAZA 4: AVADANLIQ VƏ TEXNOLOGİYA (1-2 həftə)

| # | Maddə | Qeyd | ☐ |
|---|---|---|---|
| 37 | Sənaye sobası/ocaq quraşdırılması | 3 fazaya qoşulma, qaz bağlantısı | ☐ |
| 38 | Soyuducular quraşdırılması | Temperatur yoxlaması, 24 saat test | ☐ |
| 39 | Dondurucu quraşdırılması | -18°C test | ☐ |
| 40 | Qabyuyan maşın | Su bağlantısı + drenaj | ☐ |
| 41 | Hazırlıq masaları (stainless steel) | Paslanmaz polad — gigiyena tələbi | ☐ |
| 42 | POS sistemi quraşdırılması | Kassa + planşetlər + printer | ☐ |
| 43 | İnternet / Wi-Fi | POS üçün sabit internet mütləqdir | ☐ |
| 44 | Kamera sistemi | Mətbəx, kassa, giriş — minimum 4 kamera | ☐ |
| 45 | Siqnalizasiya sistemi | Bağlanış sonrası təhlükəsizlik | ☐ |

> ⚠️ **Xəbərdarlıq:** Avadanlığı **icarə ilə almaq** büdcəyə daha uyğun ola bilər. 50.000₼-lik avadanlığı birbaşa almaq əvəzinə, leasing (lizinq) ilə aylıq ödəniş edə bilərsən — başlanğıc büdcəyə daha az yük düşür.

---

## FAZA 5: AÇILIŞ HAZIRLIĞI (1-2 həftə)

İnşaat bitdi. İndi açılışa hazırlaş.

| # | Maddə | Qeyd | ☐ |
|---|---|---|---|
| 46 | AQTA son yoxlaması | Gigiyena tələbləri tam ödənilir? | ☐ |
| 47 | FHN son yoxlaması | Yanğın avadanlığı, çıxışlar | ☐ |
| 48 | İşçilərin işə götürülməsi | İşə qəbul + tibbi arayışlar | ☐ |
| 49 | Təlim dövrü (min 1-2 həftə) | Menyu, xidmət, POS, gigiyena | ☐ |
| 50 | Soft opening (yumşaq açılış) | Dostlar, ailə — 3-5 gün test | ☐ |
| 51 | Menyu son yoxlaması | Qiymətlər, food cost, dizayn | ☐ |
| 52 | Grand opening (rəsmi açılış) | Marketinq, sosial media, dəvətlilər | ☐ |

---

---

## Büdcə planlaması — təxmini çərçivə

Kiçik-orta ölçülü restoran (50-80 m², 30-40 nəfərlik) üçün təxmini inşaat büdcəsi:

| Faza | Təxmini xərc (₼) | Faiz |
|---|---|---|
| Ön hazırlıq (sənədlər, layihə) | 2.000-5.000 | 3-5% |
| Kaba işlər | 20.000-40.000 | 30-35% |
| İncə işlər | 15.000-30.000 | 20-25% |
| Avadanlıq | 25.000-50.000 | 30-35% |
| Açılış hazırlığı (təlim, soft opening) | 3.000-5.000 | 3-5% |
| **Ehtiyat fond (15%)** | **10.000-20.000** | **15%** |
| **TOPLAM** | **75.000-150.000₼** | **100%** |

> ⚠️ **Xəbərdarlıq:** Bu rəqəmlər **çox dəyişkəndir** — binanın vəziyyəti, lokasiya, konsept, material seçimi hər şeyi dəyişir. Amma ehtiyat fondu **mütləqdir** — minimum 15%. "Gizli Xərclər" yazımızda dediyimiz kimi: gözlənilməyən xərclər HƏMİŞƏ olur.

---

## Ən yayğın inşaat səhvləri

| Səhv | Nəticə | Həll |
|---|---|---|
| 3 fazanı yoxlamadan başlamaq | Böyük əlavə xərc, gecikmə | İnşaatdan ƏVVƏL yoxla |
| "Ucuz usta" tutmaq | Yarımçıq iş, yenidən düzəltmə | 3 təklifdən müqayisə et, ən ucuzu seçmə |
| Yazılı müqavilə etməmək | Vaxt uzanır, qiymət artır, iddia edə bilmirsən | Hər şeyi yazılı razılaş |
| Mətbəx planını aşpazsız çəkmək | Avadanlıq yerləşmir, iş axını pozulur | Aşpazbaşını planlamaya daxil et |
| Ehtiyat fond ayırmamaq | Gözlənilməyən xərc büdcəni çökdürür | Minimum 15% ehtiyat |
| İcazəsiz tabela qoymaq | Cərimə | Əvvəlcə icazə al |
| Komşularla danışmadan baca qurmaq | Şikayət, bələdiyyə problemi | Əvvəlcədən məlumatlandır |

---

> 📝 **DOĞAN NOTU:** "Bir sahibkar gəldi, dedi 'remont 2 aya bitəcək.' 5 aya bitdi. Niyə? Çünki plan yox idi. Ustabaşı bu gün boya gətirir, sabah su borusu çəkir, o biri gün yenə boyaya qayıdır. Fazalar qarışdı, hər iş iki dəfə edildi. Bu checklist-i versəydi ustabaşına — 2.5 aya bitərdi. Fazalı iş = vaxt qənaəti = pul qənaəti."

---

> **💡 DK Agency:** İnşaat nəzarəti və layihə idarəetməsi istəyirsiniz? Bu siyahının interaktiv variantı — hər maddəyə qeyd və şəkil əlavə etməklə — DK Agency-nin pulsuz «İnşaatdan açılışa: yoxlama siyahısı» alətindədir. Layihənizi birlikdə planlamaq istəyirsinizsə, bizə yazın.
>
> 📧 info@dkagency.com.tr | 🔧 [İnşaatdan açılışa yoxlama siyahısı](/toolkit/insaat-checklist) | 🌐 [Marketinq Ocağı](/marketinq)
$dkq$, updated_at = now()
WHERE id = 14 AND md5(content_az) = '5a5165815063d077091ef3fcf7c65bea' AND md5(coalesce(dogan_note, '')) = '601305d5c4f9b115a7061f17bdbd6956';

-- isleyen-franchise-devralmaq
UPDATE blog_posts SET content_az = $dkq$Yeni bir kafe və ya restoran açmaq romantik səslənir. Amma 2026-da ağıllı sahibkar bir sual verir: niyə sıfırdan qurum, əgər artıq işləyən, müştərisi olan bir biznesi ala bilərəmsə?

Françayz dünyasında buna **devir** deyilir — yəni mövcud françayz sahibinin işini olduğu kimi almaq. İki yol var: ya boş bir məkanı sıfırdan qurursan, ya da artıq pul qazanan bir şöbəni devralırsan. Fərq sadəcə zövq məsələsi deyil — pul və risk məsələsidir.

## 1. Sıfırdan qurmaq: uzun və qeyri-müəyyən

Sıfırdan açanda ən böyük problem **vaxt və gözlənilməz xərclərdir.**

- Tikinti, icazələr, avadanlıq, dizayn — bütün bunlar aylarla çəkir. Bu müddətdə məkan bağlıdır, pul gəlmir, amma xərclər davam edir.
- Büdcə demək olar ki, həmişə aşılır: tikinti bahalaşır, tədarük gecikir, bir şey əskik çıxır.
- Ən vacibi: açıldıqdan sonra da müştərinin gəlib-gəlməyəcəyini **heç kim zəmanət verə bilmir.** Hər şey kağız üstündəki proqnoza əsaslanır.

## 2. Devir: ilk gündən qazanc

İşləyən bir françayz alanda fərqli bir mənzərə var:

- **Satış ilk gündən var.** Müştəri var, komanda var, avadanlıq qurulub. Sən sıfırdan başlamırsan — gedən bir maşına minirsən.
- **Risk daha aşağıdır**, çünki lokasiya və müştəri kütləsi artıq sınanıb. "Bura işləyirmi?" sualının cavabı bəlli.
- **Real rəqəmlər masadadır:** keçmiş satışlar, vergi bəyannamələri, kâr/zərər cədvəli. Sən təxminlə yox, faktla qərar verirsən.

> **Praktik fərq:** Sıfırdan qurulumda əlində bir Excel proqnozu olur — arzu. Devirdə isə əlində bank hesabı çıxarışı olur — həqiqət.

## 3. Devirin gizli üstünlüyü: böyümə

Pul qazanan bir şöbəni almaq banklar üçün də daha etibarlı profildir. İşləyən biznes ikinci, üçüncü şöbəni açmaq üçün lazım olan gücü öz içindən yarada bilir. Yəni devir tək bir dükan deyil — planlı böyümənin başlanğıcıdır.

## Müqayisə cədvəli

| Meyar | Sıfırdan qurulum | İşləyən françayz (devir) |
|---|---|---|
| Başlanğıc riski | Yüksək — lokasiya sınanmayıb | Aşağı — müştəri və yer sübut olunub |
| Büdcənin aşması | Çox vaxt aşılır | Daha az ehtimal |
| Pul nə vaxt gəlir | Aylar sonra | Satış ilk gündən var |
| Qərar nəyə əsaslanır | Təxminə (proqnoz) | Real rəqəmə (keçmiş satış) |
| Komanda | Sıfırdan işə qəbul | Hazır, təcrübəli komanda |

## Bir şərt: ön yoxlama (due diligence)

Devirin tək riski var — satıcının rəqəmlərinin doğru olub-olmadığını yoxlamamaq. Buna görə devirdən əvvəl mütləq:

1. Son 2-3 ilin real satış və vergi sənədlərini gör.
2. Satıcıya "niyə satırsan?" sualını ver. *(Qeyd: satışın səbəbi həmişə biznesin batması olmur — təqaüd, köç kimi şəxsi səbəblər də ola bilər. Səbəbi sənədlə yoxla.)*
3. Müqavilədə devir hüququnu yoxla — françayz verən bu devri təsdiqləməlidir.

> **Qızıl qayda:** Sermayeni xərcləməzdən əvvəl biznesin "sağlamlıq skorunu" gör. Şəffaf rəqəm olmadan devir alma.

---

### Faydalı alətlər
- [ROI Kalkulyatoru — françayz geri dönüş hesabla →](/franchise/roi-kalkulyatoru)
- [Devir elanlarına bax →](/ilanlar?type=devir)

## DK Agency necə kömək edir?

DK Agency-nin [devir elanları](/ilanlar?type=devir) məhz bunun üçündür: işləyən françayz və bizneslərin satış elanlarını bir yerdə toplayır. Beləcə alıcı sermayeni xərcləməzdən əvvəl operasiyanı görür, satıcı isə düzgün alıcı tapır. Çünki bizim üçün devir təkcə alqı-satqı deyil, etibarın nişanıdır: *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** İşləyən bir françayz almaq və ya öz biznesini devr etmək istəyirsən? DK Agency Devir platformasına bax və ya pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.
$dkq$, updated_at = now()
WHERE id = 28 AND md5(content_az) = '1f004928af1a397e07427fe5a3c426c4' AND md5(coalesce(dogan_note, '')) = 'd41d8cd98f00b204e9800998ecf8427e';

-- restoran-acarken-sehvler
UPDATE blog_posts SET content_az = $dkq$---

Hər il Azərbaycanda yüzlərlə yeni restoran açılır. Sahibkar açılış gününə qədər həyəcanlıdır — banner asılıb, lentlər kəsilib, dostlar gəlib, instagrama hekayə qoyulub. **6 ay sonra** isə eyni adam başqa restoran açılış lentini izləyir — bu dəfə öz restoranı bağlandığı üçün.

Bakıda və regionlarda açılan restoranların xeyli hissəsi ilk ili başa vurmadan bağlanır. Səbəb? "Müştəri yox idi" deyirlər. "Krizis vardı" deyirlər. "Lokasiya pis çıxdı" deyirlər.

**Həqiqət başqadır.** Restoranlar müştəri çatışmazlığından bağlanmır — **açılışdan əvvəl edilən strateji səhvlərdən** bağlanır. Açılış günü gec olur. Səhvlər artıq edilib.

Bu yazıda Bakıda və Azərbaycan regionlarında müşahidə etdiyimiz **12 ən bahalı səhvi** sənə təqdim edirik. Hər birinə həll yolu, real nümunə, və harada kömək tapacağın göstərilir.

---

---

## 1. Konseptsiz Açılış

"Hamı üçün hər şey" restoranı **heç kəs üçün heç nə** olmağa məhkumdur. Sahibkar deyir: "Mənim restoranımda hər kəs öz istədiyini tapacaq." Bu, marketinq fəlakətidir.

Hədəf müştərini bilmirsənsə — ailə, biznes nahar müştərisi, gənclər, turist — onda menyu, dizayn, qiymət, lokasiya, hətta musiqi səviyyəsi belə yanlış olur. Hər şey konseptdən çıxır. Konsept yoxdursa, **hər qərar təxmindir.**

**Bakı reallığı:** Yasamalda açılan restoran. Sahibi 45 yaşında, "ailə restoranı" istəyir, amma menyuda nargilə var. Pəncərələri böyük, amma içəridə dim işıq və yüksək musiqi var. Ailə müştərisi gəlib çıxır — uşağı üçün uyğunsuz mühit görür. Gənclər gəlir — atmosfer ailə tipli, onlara cazib deyil. 4 ay sonra bağlanır.

**Həll:** Açılışdan əvvəl **1 səhifəlik konsept sənədi** yaz. İçindəkilər:
- Hədəf müştəri (3 cümlədə təsvir et — yaş, gəlir, motivasiya)
- Qiymət aralığı (orta check)
- Atmosfer açar sözləri (5-7 söz)
- Menyu mərkəz xətti (3 yemək kateqoriyası)
- Ünvan profili (hansı lokasiya tipi uyğundur?)

Bu sənəd sənin biznesinin **konstitusiyasıdır**. Hər qərarda bura qayıt.

---

## 2. Lokasiya Yanlışı

Restoran biznesində **ən bahalı və ən geri-dönülməz qərar** lokasiyadır. Səhv lokasiya = 6-12 ay zərər + köç xərci + brand zədəsi.

**4 sual lokasiyanı seçməzdən əvvəl:**

1. **Cəphə neçə metr?** Döner restoranı üçün minimum 4m (vitrin nümayişi vacib), kafe üçün 6m+, fine dining üçün 5m+. 3m cəphə ilə döner açan sahibkar "müştəri görmür" deyir — görür, amma içəri baxa bilmir.

2. **Gündəlik piyada trafikası neçə nəfər?** 9:00-22:00 arası. Bunu özün say: seçdiyin nöqtənin qarşısında müxtəlif günlərdə və saatlarda keçən adamları hesabla.

3. **500m radiusda hansı rəqib hansı qiymət aralığında?** Eyni konseptdə 3+ rəqib varsa, qiymət döyüşünə düşürsən. Heç biri yoxdursa, ya qızıl mədəni tapmısan, ya da bazar tələbi yoxdur.

4. **Park yeri varmı? AVM-də qovşaq nöqtəsindədir?** Bakı park problemini hesablamayan sahibkar müştərinin bir hissəsini itirir — onlar küçədə fırlanır, başqa restorana gedir.

**Bakı reallığı:** 28 May metrosu yanında biznes nahar restoranı açan sahibkar 4 ayda breakeven keçir. Eyni konsepti Bayılda açan 8 aydan sonra hələ də zərərdədir. Yer = trafic = gəlir.

---

## 3. Maya Dəyərini Bilməmək (Food Cost)

Bu, restoranı **ölümə aparan** ən səssiz qatildir. Azərbaycanda çox restoran hər porsiyanın əsl maya dəyərini bilmir.

Sahibkar deyir: "Toyuq sac 18 manata satıram. Mənfəət gözəldir." Hesab göstərir:
- Ət xərci: 2 AZN
- Tərəvəz: 0.5 AZN  
- Yağ + ədviyyat: 0.3 AZN
- **"Cəmi 2.8 AZN. 18-2.8 = 15.2 AZN mənfəət. Möhtəşəm!"**

**Səhv.** Hesablanmayanlar:
- Trim loss (toyuqdan sümük çıxır, 15% itki = 0.3 AZN əlavə)
- Operational loss (yandırılan, geri qaytarılan, israfat = 3% = 0.08 AZN)
- Salfet, çubuq, paket (delivery üçün) = 0.5 AZN
- Qab-qaşıq amortizasiya, qırılma = 0.15 AZN

Real food cost: **3.83 AZN**. 18 AZN-dən qalanı 14.17 AZN. Bundan hələ personal, icarə, kommunal, vergi çıxmalıdır — porsiyada qalan pul düşündüyündən xeyli azdır. Bu nəzəri mənfəətdir; reallıqda çox vaxt **mənfi**dir.

**Həll:** [Food Cost necə hesablanır](/blog/1-porsiya-food-cost-hesablama) bələdçimizə bax. Gram-gram resept, trim loss daxil, operational loss qatılı.

---

---

## 4. Çox Geniş Menyu

Yeni başlayan sahibkar 80-100 maddəlik menyu yığır. Məntiq: "müştəri çox seçim istəyir." Nəticə fəlakətdir:

- **Anbar şişir** — 100 yemək = yüzlərlə ingrediyent = böyük anbar
- **İsrafat artır** — az satılan yeməyin ərzağı xarab olur
- **Mətbəx zamanı uzanır** — aşpaş 100 reseptə yetişməz, keyfiyyət düşür
- **Müştəri qərarsızlaşır** — Cheesecake Factory effekti, qərar yorğunluğu

Faktiki olaraq müştəri eyni **15 yeməyi** sifariş edir. Qalan 65 maddə yalnız xərc və qarışıqlıq yaradır.

**Həll:** Açılış menyusu **25-35 maddə** ilə başla. 3 ay sonra POS data-na bax: **alt 20% yeməyi çıxar** (Menyu Mühəndisliyi məntiqi). Qalanı dərinləşdir — daha yaxşı resept, daha yüksək marja. [Menyu Mühəndisliyi yazısına](/blog/menyu-muhendisliyi-satis) bax.

**Bakı reallığı:** Nizami küçəsində iki yeni restoran açıldı. Biri 95 maddəlik menyu ilə, ikincisi 28 maddəlik. 6 ay sonra: 95-maddəli bağlandı, 28-maddəli genişləndi. Az menyu = fokus = keyfiyyət = sədaqət.

---

## 5. Marka Yoxluğu (Yalnız Loqo)

"Mən loqo yapdım, qırmızı rəngdə, restoran adı altında. Gözəldir." Bu **marka deyil — yalnız möhürdür.**

Marka, müştərinin restoranını **hiss etdiyi** şeydir. Bu, çox abstract səslənir, amma operativ səviyyədə son dərəcə konkretdir:

- **Qarşılama** — qapıda nə baş verir? Salam? Boş baxış?
- **Qoxu** — içəri girəndə nə hiss edirsən? Yemək? Təmizlik? Köhnəlik?
- **Musiqi** — səviyyə, janr, vaxt-vaxt dəyişiklik
- **İşıq** — gündüz, axşam, romantik, biznes
- **Qab-qaşıq** — keramika? Şüşə? Ucuz porselen?
- **Personal dili** — necə danışırlar? Hörmətlə? Kobudca?
- **Çatdırılma ritmi** — masaya nə vaxt nə gəlir?

Bunların hamısı markadır. Loqo yalnız **bu hisslərə qoyulan möhürdür**. Loqo başlatma yox, sonlandırma addımıdır.

**Həll:** Açılışdan əvvəl 5 sualı cavablandır:
1. Restoranımı **3 sözlə** təsvir et
2. Müştəri çıxarkən nə **hiss etməlidir**?
3. Hansı musiqi yoxdursa restoranım deyil?
4. Hansı 1 detal **heç bir rəqibimizdə** yoxdur?
5. Müştəri dostuna restoranımı **necə danışar**?

Bu 5 cavab markandır. Loqo bundan sonra gəlir.

---

## 6. Personal Strategiyası Yoxdur

"Aşpaz tapdım, ofisiant tapdım, başladım." Bu **personal alımı deyil — paniki tələsmədir.**

Yığım olmayan suallar:
- Hansı pozisiyalar **kritikdir**? (aşpaş + sahib + qonaq idarəçi)
- Hansılar **dəyişdirilə bilər**? (köməkçilər)
- Hansılar **outsource** ola bilər? (təmizlik, mühasibat)
- Hər biri üçün **job description** var?
- **Yetişdirmə (training)** sistemi var? Yoxsa "iş prosesində öyrənəcək" deyirsən?
- İşdən **çıxma** hallarında plan? (Bakıda ofisiant tez-tez dəyişir)

**Həll:** Açılışdan əvvəl org chart hazırla. 60 yerlik restoran üçün minimum:
- Aşbaş + 2 mətbəx köməkçisi (1 hot kitchen, 1 cold kitchen)
- 4 ofisiant (2 növbə)
- 1 qonaq idarəçi / kassir
- 1 bar idarəçi (içki menyusu varsa)
- 1 təmizlik / bulaşıxsi
- 1 menecer (sən özün yaxud işə götürülmüş)

Hər pozisiya üçün **yazılı sənəd**: vəzifə təsviri, gündəlik checklist, qiymət aralığı, dəyərləndirmə kriteryası. [İşçi saxlama yazısına](/blog/isci-saxlama-7-strategiya) bax — 7 saxlama sistemi.

---

---

## 7. AQTA-ya Hazır Deyildiniz

AQTA (Azərbaycan Qida Təhlükəsizliyi Agentliyi) müfəttişi **xəbərdarlıq etmədən** gəlir. Səhv anlarda gəlir — pik saatda, açılış həftəsində, ya da müştəri şikayətindən sonra.

Hazır deyilsənsə:
- Soyuducu temperatur qeydi yoxdur → cərimə riski
- HACCP planı kağız üzərində yoxdur → 300 AZN
- Personalın sağlamlıq kitabçası vaxtı keçib → adam başı 100-150 AZN
- Mətbəxdə hörümçək toru, gəmirici izi → ağır cərimə və fəaliyyətin dayandırılması riski
- Anbarın temperatur kayıtı yoxdur → 200-400 AZN
- Tualet kağızı, sabun yoxdur (təftiş zamanı) → 100 AZN

Cərimə ilə yanaşı fəaliyyətin dayandırılması da mümkündür. Yeni açılan restoranın belə bir zərbəni qaldırması praktiki olaraq mümkün deyil.

**Həll:** Açılışdan əvvəl DK Agency-nin [AQTA yoxlamasına hazırlıq](/toolkit/aqta-checklist) siyahısını tamamla. Daxil olanlar: HACCP planı, sıcaqlıq kayıtı şablonu (gündəlik dolduruluqlu), personal sağlamlıq kitabçası (hər personal üçün), təmizlik planı kağız üzərində + tətbiqdə (kim, nə vaxt, nə təmizləyir). [AQTA yoxlamasına hazırlıq](/blog/aqta-cerime-checklist) yazımıza bax.

**Vacib:** AQTA-ya müraciəti özün edə bilərsən — vasitəçiyə pul verməzdən əvvəl rəsmi qaydanı ASAN xidmətdən öyrən.

---

## 8. Qiymət Strategiyası Yanlış

"Rəqibim 15 manata satır, mən də 14 manata satıram. Az endirim ilə müştəri qazanacağam." Bu **rəqabət deyil — intihardır.**

Səbəbi sadədir: **rəqibinin food cost-u, icarə xərci, personal səviyyəsi sənindən fərqlidir**. Onun 15 AZN-i ola bilər sağlam mənfəət, sənin 14 AZN-in zərərdə.

Bakı reallığı:
- Eyni Yasamal kebabçısı, fərqli sahibkarlar
- Birində kebab 14 AZN — sahibkar deyir "Yaxşıdır, dolu işləyirik"
- O biri 16 AZN — "Yaxşıdır, sakit amma mənfəətli"
- Üçüncü 12 AZN — 3 ayda bağlandı

**Həll:** Qiymət **food cost-dan və hədəf mənfəətdən** çıxır, rəqibdən deyil:

```
Satış Qiyməti = Food Cost ÷ Hədəf Food Cost %
```

Nümunə: 6 AZN food cost ÷ 30% hədəf = 20 AZN minimum satış. Rəqib 17 AZN-ə satsa belə sən 20 manatdan **aşağı** qoymamalısan — yoxsa hər porsiyada gizli zərərdəsən.

**İstisna:** Açılış kampaniyası ilk 30 gün ərzində 15-20% endirim olar (acquisition marketing xərci kimi). Sonra normal qiymətə qayıt.

---

## 9. P&L (Mənfəət/Zərər) Oxuya Bilməmək

Sahibkar hər axşam kassaya baxır: "Bu gün 3000 AZN gəldi, gözəl gün." Ayın sonunda mühasib hesabatı gətirir — **4000 AZN zərər**. Necə?

Cavab sadədir: **kassa hesabatı deyil**. P&L-dir. Hər gün 3000 AZN qazansan da, hər gün 3200 AZN xərcləyirsənsə, ay sonunda təxminən 6000 AZN itki çıxır.

P&L-in 5 sətri:
1. **Net Gəlir** — vergidən sonra satış (100%)
2. **COGS (Ərzaq)** — 28-32% hədəf
3. **Əmək Xərci** — 25-30% hədəf
4. **Sabit Xərc** — 15-20% hədəf
5. **EBITDA (Əsl Mənfəət)** — 15-25% hədəf

Hər birinə ayrıca trend olaraq izlən. **3 ayın P&L-ini yan-yana qoy** — problem 1 ay daxilində özünü göstərir, 2 ay içində həll edilir.

**Həll:** [P&L Hesabatı yazımıza](/blog/pnl-oxuya-bilmirsen) bax. Ayda 1 saat ayır — illik 12 saat = sənin maliyyə həqiqətinə açılan göz.

---

---

## 10. Açılış Marketinqi Plansız

"Açıldıq, müştərilər gələcək." Bu **plan deyil — ümiddir**. Ümid strategiya deyil.

İlk 30 gün açılış pəncərəsidir. Bakıda yeni açılan restoran qarşısında "trial müştəri" axını olur — adamlar yenilik üçün gəlir. Bu pəncərəni **planla idarə etmirsənsə**, çox az müştəri sədaqətli olur, qalanı bir dəfə gəlib gedir.

**Açılış marketinqi 3 fazada:**

**T-30 gün (açılışdan 1 ay əvvəl):**
- Lokal Instagram + Facebook hesabları yarat
- 4-5 hazırlıq postu (behind-the-scenes, mətbəx hazırlığı, aşbaş tanıtımı)
- Lokal hashtag-lər (#bakirestoranlari #yasamalrestoran)
- Google My Business profili qur, foto əlavə et

**T-14 gün (açılışdan 2 həftə əvvəl):**
- Mikro-influencer-ləri (5K-20K follower, lokal AZ food bloggers) dəvət et
- Açılış öncəsi tasting — 3-4 kişi, hər birinə 3 yemək göstər, fotoğraf çəkdir
- Press release — yerli food blog-lara, Lokal.az, Trip.az kimi platformalara
- Lokal Telegram qruplarında ön-tanıtım

**T-0 (açılış həftəsi):**
- Açılış kampaniyası — "ilk 50 müştəriyə 30% endirim" ya da "menyu kompleti 25 AZN"
- 30 gün davam etdir, sonra sədaqət proqramına keç
- Hər müştərinin telefonunu / instagram-ı topla — retargeting üçün
- Yandex.Direct + Facebook Ads — 200-500 AZN/həftə test büdcəsi

---

## 11. Wolt/Bolt/Yango-nu Müttəfiq Saymaq

Delivery platformaları sənin tərəfdaşın deyil — onlar **vasitəçi-vergi yığandır**. 30 manatlıq sifarişdən:

- Platforma komissiyası sifarişin xeyli hissəsini aparır — dəqiq faizi öz müqavilənizdən götürün

Sən ərzaq + paketləmə + sürücüyə hazırlama vaxtı çıxdıqdan sonra **2 manatla** qalırsan, ya da zərərdə.

**Bakı reallığı:** Yasamal kafe sahibi 2 ay sonra Wolt-dan çıxdı. "Ayda 4000 AZN delivery gəliri görünürdü, amma əsl olaraq 800 AZN qaldı. Komissiya + paket + əlavə işçi = qalan hissə yox idi."

**Həll:** Üç variant:
1. **Delivery menusu ayrı qiymət ver** — daxili menudan 15-20% yüksək. Müştəriyə xəbərdarlıq olaraq əlavə et menyu altında: "Platforma sifarişlərində qiymət komissiya daxildir."
2. **Daxili delivery qura** — kuryer, telefon sifariş xətti, Telegram bot. İlk aylar zərər ola bilər — hesabı əvvəlcədən apar.
3. **Yalnız 1 platforma seç** — ən az komissiyalı, ona fokuslan, sədaqət qur. 3-də olmaqdan 1-də güclü olmaq daha yaxşıdır.

[Wolt/Bolt/Yango Komissiya Riyaziyyatı](/blog/wolt-bolt-komissiyon) yazımıza bax — detallı hesab.

---

## 12. Sahibkar Mətbəxdə Qalır

"Mən özüm aşbaşam, açılışda bütün yeməkləri özüm hazırlayacam." Bu strategiya **3 ay davam edir**. 4-cü ayda sən:

- Fiziki yorulursan (12 saat ayağa duraraq mətbəxdə)
- Mətbəxdən çıxa bilmirsən (səndən başqa kim biləcək?)
- Finansa baxa bilmirsən (vaxt yoxdur)
- Marketinq edə bilmirsən (vaxt + enerji yoxdur)
- **Biznesə baxa bilmirsən**

Restoran satışdan çox **sahibkarın enerjisindən** yaşayır. Sahibkarın enerjisi bitəndə restoran da bitir.

**Həll:** İlk gündən aşbaş **işə götür**. Sən sahibkar-sahibsən, yeməyi yox, **biznesi idarə etməlisən**. Hər gün mətbəxdə 12 saat duran sahibkar 6 ayda yanır. Aşbaş əlavə xərcdir — amma sənin diqqətin biznesə qalır və bu xərc öz qaytarır.

Sahibkarın günü belə olmalıdır:
- **Səhər (2 saat):** P&L, sifarişlər, anbar yoxlaması
- **Pik saatda (3 saat):** salonda — müştərilərlə danış, problem həll et, personal idarə et
- **Axşamdan sonra (2 saat):** marketinq, dəyərləndirmə, strategiya

Mətbəxdə durmaq — **operasiya işçisi olmaqdır, sahibkar yox**.

---

---

---

## Yekun — 12 Səhv Yığımı

Bunlar yalnız siyahı deyil — restoranı ölümə aparan ölümcül qrafdır. Birini etsən, qurtular ola bilər. **2-3-nü etsən, yığıram olur.**

| # | Səhv | Risk səviyyəsi |
|---|---|---|
| 1 | Konseptsiz açılış | 🔴 Kritik |
| 2 | Lokasiya yanlışı | 🔴 Kritik (geri-dönülməz) |
| 3 | Food cost bilməmək | 🔴 Kritik |
| 4 | Çox geniş menyu | 🟡 Orta |
| 5 | Yalnız loqo, marka yox | 🟡 Orta |
| 6 | Personal strategiyası yoxdur | 🟡 Orta |
| 7 | AQTA hazırlığı yoxdur | 🔴 Kritik (cərimə + bağlama) |
| 8 | Qiymət strategiyası yanlış | 🔴 Kritik |
| 9 | P&L oxuya bilməmək | 🔴 Kritik |
| 10 | Açılış marketinqi plansız | 🟡 Orta |
| 11 | Delivery komissiyasını saymamaq | 🟡 Orta |
| 12 | Sahibkar mətbəxdə qalır | 🔴 Kritik (uzun müddətli) |

7 **kritik** səhv var. Hər biri restoranın ömrünü qısaldır; bir neçəsi birlikdə olanda risk çox böyüyür. Üçünü etsən — açılış gününə kimi gəlsə yaxşı.

---

## CHECKLIST — Açılışdan Əvvəl

| # | Addım | Status |
|---|---|---|
| 1 | 1 səhifəlik konsept sənədi yaz | ☐ |
| 2 | Lokasiya üçün 4 sual cavablandır + 3 rəqib analizi | ☐ |
| 3 | Bütün yeməklərin food cost-unu gram-gram hesabla | ☐ |
| 4 | Menyunu 25-35 maddəyə endir | ☐ |
| 5 | Marka 5 sualına cavab ver, sonra loqo | ☐ |
| 6 | Org chart + hər pozisya üçün job description | ☐ |
| 7 | AQTA 47-maddəlik checklist tamamla | ☐ |
| 8 | Qiymət strategiyası formulla hesablan | ☐ |
| 9 | P&L şablonunu öyrən, 1 ay nümunə doldur | ☐ |
| 10 | 30-14-0 marketinq planı hazırla | ☐ |
| 11 | Delivery menyusu ayrı qiymət, 1 platforma seç | ☐ |
| 12 | Aşbaş işə götür — mətbəxdən çıx | ☐ |

12/12 tamamlandıqdan sonra açılış — yoxsa **gözləmə daha bahalı olar**.

---

## DK Agency Necə Kömək Edir?

DK Agency-nin pulsuz alətləri bu səhvləri **açılışdan əvvəl** görməyə kömək edir:

- 🎯 **[Lokasyon Analiz](/marketinq/lokasyon-analiz)** — yeri meyarlar üzrə qiymətləndirir, risk siqnallarını və başa-baş satışı göstərir
- 🍳 **[Food cost](/toolkit/food-cost)** — inqrediyent-inqrediyent, trim loss daxil porsiya maya dəyəri və hədəf faizə görə satış qiyməti
- 📊 **[Mənfəət və zərər hesabatı (P&L)](/toolkit/pnl)** — ayın satış və xərclərindən xalis mənfəəti göstərir
- 📋 **[AQTA yoxlamasına hazırlıq](/toolkit/aqta-checklist)** — gigiyena, sənədlər, ərzaq saxlama üzrə bölmə-bölmə yoxlama
- 🎨 **[Markalaşma bələdçisi](/toolkit/branding-guide)** — marka adı, marka sözü, qonaq, rənglər və 12 addımlıq siyahı

[Pulsuz alətləri gör →](/toolkit)

Açılışın ən bahalı səhvi başqasının səhvini təkrarlamaqdır. Bu yazıdakı 12 səhvi bilərək açılsan — sən onsuz da **yarısından çoxunu** atmısan.
$dkq$, dogan_note = $dkq$Mən 40 ildir HoReCa sektorunda işləyirəm. Bakıda da, İstanbulda da, Ankarada da gördüyüm hər bağlanan restoranın hekayəsi bu 12 səhvdən birinə (və ya bir neçəsinə) söykənir. Açılan zaman sahibkar deyir: 'Bu mənim ehtirasım, məhəbbətim.' Bağlanan zaman deyir: 'Restoran biznesi mənim üçün deyilmiş.' **İkisi də səhvdir.** Restoran biznesi ehtiras yox — **sistemdir.** Sistemi qurursan, qazanırsan. Sistemi pozursan, batırsan. Hətta ehtiras dolu olsa belə.$dkq$, updated_at = now()
WHERE id = 3 AND md5(content_az) = '2f268f39bf9f323a4cb967a417f3fe55' AND md5(coalesce(dogan_note, '')) = '352e758e958fde021e79f40ae9584ae3';

-- ilk-5-deqiqe-qonaq-qarsilama
UPDATE blog_posts SET content_az = $dkq$Qonaq qapıdan girəndə beynində bir hökm formalaşır — və bu hökm **ilk 5 dəqiqədə** verilir. Ev səliqəlidirmi? Səni gözləyirdilərmi? Burada özünü rahat hiss edəcəksənmi? Bu ilk təəssürat sonradan yazılacaq rəyi, veriləcəyi ulduzu və təkrar gəlib-gəlməyəcəyini müəyyən edir.

Yaxşı xəbər: bu ilk təəssüratı yaratmaq baha deyil. Bir neçə manatlıq jest, düzgün anda, qonağı aşiq edə bilər.

## 1. Niyə məhz ilk 5 dəqiqə?

Çünki qonaq hələ heç nəyi sınamamış olsa da, **hiss üzərindən qərar verir.** Soyuq, boş, "sənədli" qarşılama qonağı ehtiyatlı edir — sonra hər kiçik qüsuru böyüdür. İsti, şəxsi qarşılama isə qonağı "tərəfdaş" edir — sonra kiçik problemləri bağışlayır.

Yəni ilk 5 dəqiqə təkcə nəzakət deyil — **rəyini və təkrar gəlişini qabaqcadan qazanmaqdır.**

## 2. Kiçik xərc, böyük təsir

Qarşılama jesti baha olmamalıdır. Əksinə — **yerli və səmimi** olanı daha çox təsir edir:

- Bir stəkan təzə dəmlənmiş yerli çay və ya soyuq su.
- Kiçik bir kasada yerli mürəbbə, qoz və ya quru meyvə.
- Əl ilə yazılmış kiçik bir salam notu (çap deyil — əl yazısı).
- Wi-Fi parolu və qısa "ev bələdçisi" səliqəli bir vərəqdə.

Bunların hamısı bir neçə manata başa gəlir, amma qonaq bunu **şəkil çəkib paylaşır** — yəni sənə pulsuz reklam olur.

### Faydalı məlumat qutusu
5 ucuz, amma güclü qarşılama jesti: (1) yerli şirniyyat və ya çay, (2) əl yazısı salam notu, (3) qonağın adının yazıldığı kiçik kart, (4) bölgə tövsiyələri siyahısı ("ən yaxşı çörəkçi buradadır"), (5) gediş günü kiçik bir "yol hədiyyəsi" (bir paket çay, kiçik mürəbbə). Heç biri bahalı deyil — hamısı yaddaqalandır.

## 3. Şəxsiləşdir — adını çağır

İnsanlar öz adını eşidəndə özlərini xüsusi hiss edir. Qonağın adını qarşılama notunda yaz. Əgər səbəbi bilirsənsə (bal ayı, ad günü, ailə səfəri), kiçik bir uyğun jest əlavə et — bal ayı üçün bir gül, uşaqlı ailə üçün kiçik şirniyyat.

Bu, "otaq satan" ev sahibi ilə "təcrübə yaşadan" ev sahibi arasındakı fərqdir.

## 4. Məmnun qonağı rəyə çevir

Qonaq ən məmnun olduğu an — adətən gəlişin ilk günü və ya əla bir təcrübədən dərhal sonradır. Düzgün anda, təvazökarla rəy iste:

- Yüksələn təcrübədən sonra: "Hər şey qaydasındadırsa, bizim üçün qısa bir rəy yazsanız çox sevinərik."
- Gediş günü təşəkkürlə birlikdə.

Çox rəy = platformada daha yuxarı sıra = daha çox yeni qonaq. Yəni bir kasa mürəbbə, vaxtla, yeni rezervasiyaya çevrilir.

### Doğan Notu
"Bir dəfə Xınalıqda qonaq qaldığım evdə sahibə əl ilə dəmlədiyi dağ çayını və ev mürəbbəsini gətirdi — heç nə soruşmadan. O an o evi heç vaxt unutmadım. Texnologiya yox, **insan toxunuşu** idi. Kiçik sahibkarın ən güclü silahı budur: böyük zəncirlər bunu sistemləşdirə bilmir, sən isə təbii edirsən. Bunu itirmə — əksinə, sistemləşdir."

## Yekun

Qonaq təcrübəsi qapıda başlayır. İlk 5 dəqiqədə isti, şəxsi və yerli bir qarşılama qur; kiçik jestlərlə qonağı aşiq et; məmnun anda rəy iste. Bu, ən ucuz, amma ən güclü marketinqdir — çünki onu **qonağın özü** danışır.

---

## DK Agency necə kömək edir?

DK Agency kiçik ev və otel sahiblərinə qonaq təcrübəsini sistemə çevirməkdə kömək edir — qarşılamadan rəyə qədər. Çünki bizim üçün qonaqpərvərlik təkcə xidmət deyil, qurulan etibardır: *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Qonaqlarını daimi müştəriyə çevirmək istəyirsən? DK Agency ilə pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.
$dkq$, updated_at = now()
WHERE id = 33 AND md5(content_az) = '14cefc80c34ed872e5140a86d4c4aa67' AND md5(coalesce(dogan_note, '')) = 'd41d8cd98f00b204e9800998ecf8427e';

-- mulki-mecelle-726-franchise-devri
UPDATE blog_posts SET content_az = $dkq$## İnvestor üçün hüquqi due diligence (ön yoxlama) rəhbəri

Françayz devri yalnız hazır biznes almaq deyil. Burada üç aktiv birlikdə devr olunur: **marka istifadə hüququ, işləyən əməliyyat sistemi və gələcək nakit axını.** Buna görə devir sadə alqı-satqı kimi yox, hüquqi, maliyyə və operativ risklərin birlikdə yoxlandığı proses kimi aparılmalıdır.

Azərbaycanda bu mövzunun hüquqi dayağı Mülki Məcəllənin françayzinq müddəalarıdır: tərəflər françayz sistemi ilə bağlı şərtləri bir-birinə açıq və dürüst bildirməli, əldə etdikləri məxfi məlumatları müqavilə bağlanmasa belə qorumağa borcludurlar. 

Bu maddə bir şeyi göstərir: **françayz danışıqlarında məlumat gizlətmək yalnız etik problem deyil, hüquqi riskdir.**

---

## 1. Niyə m.726 investor üçün önəmlidir?

İnvestor çox vaxt satıcının rəqəmlərinə əsaslanır. Bu məlumatlar tam və şəffaf deyilsə, qərar səhv verilə bilər. Məsələn: satıcı real food cost-u gizlədirsə, POS datası ilə vergi dövriyyəsi uyğun gəlmirsə, françayz verən royalty artımını açıqlamırsa, kirayədə riskli xitam şərti varsa, ərazi qoruması əslində yoxdursa, və ya devir üçün françayz verənin yazılı razılığı tələb olunduğu halda bu açıqlanmırsa.

### Hüquqi risk qutusu
Françayz devrində ən təhlükəli cümlə budur: **"Bunu sonra danışarıq."** Due diligence mərhələsində "sonra" yoxdur — hər şey müqavilədən əvvəl yazılı, sənədli və ölçülə bilən olmalıdır.

---

## 2. Françayz devrində 3 tərəf var

Adi biznes satışında iki tərəf olur. Françayz devrində faktiki olaraq **üç tərəf** var: **satan françayz alan**, **alan investor** və **françayz verən marka.** Maraqları eyni deyil — satan yüksək qiymət, alan aşağı risk, marka isə davamlılıq və standart istəyir.

Buna görə yalnız satıcı ilə razılaşmaq kifayət deyil. Marka sahibinin devrə razılığı, yeni alıcının təsdiqi, təlim öhdəlikləri və müqavilə müddəti ayrıca yoxlanmalıdır.

---

## 3. İnvestor hansı sənədləri görməlidir?

**Maliyyə:** son 12–24 aylıq POS satışları, vergi bəyannamələri, bank hərəkətləri, kâr/zərər hesabatları, təchizatçı borcları, əməkhaqqı, royalty/reklam ödənişləri, delivery komissiyaları, kommunal/kirayə.

**Hüquqi:** françayz müqaviləsi, devrə icazə maddəsi, marka istifadə şərtləri, ərazi qoruması, müqavilə bitmə tarixi, xitam/uzatma, kirayə müqaviləsi, lisenziyalar, işçi və təchizatçı müqavilələri.

**Operativ:** menyu/resept kartları, food cost kartları, anbar sayım proseduru, təlim materialları, gigiyena prosedurları, müştəri bazası, online satış hesabatları.

### Faydalı məlumat qutusu
Satıcı "bizdə hər şey qaydasındadır" deyir, amma sənəd verə bilmirsə — bu qırmızı bayraqdır. **Restoranın divarları yox, sənədləri danışmalıdır.**

---

## 4. Qiymət necə formalaşmalıdır?

Qiymət "bu obyektə bu qədər xərc çəkmişəm" məntiqi ilə yox, "bu biznes gələcəkdə nə qədər təmiz qazanc yaradacaq?" sualı ilə hesablanmalıdır. Nəzərə alınmalı: son 12 aylıq FAVÖK və onun təkrarlanma gücü, kirayə/ciro nisbəti, food cost sabitliyi, müqavilənin qalan müddəti, françayz verənin devrə münasibəti, gələcək investisiya tələbi və multi-unit genişlənmə imkanı.

### Qırmızı bayraqlar
- Satış datası yalnız şifahi təqdim olunur
- Vergi dövriyyəsi POS datasından çox fərqlidir
- Kirayə müddəti françayz müqaviləsindən qısadır
- Françayz verənin devrə yazılı razılığı yoxdur
- Əsas aşpaz/menecer getmək istəyir
- Food cost son aylarda süni şəkildə aşağı göstərilib
- Borclar tam açıqlanmayıb

---

## 5. Azərbaycan üçün tövsiyə olunan devir modeli

1. **NDA + ilkin məlumat paketi** (NDA gizliliyi yazılı və konkret edir)
2. **Françayz verənin ilkin razılığı**
3. **Maliyyə due diligence** (POS, vergi, bank, borclar)
4. **Hüquqi due diligence** (françayz, kirayə, əmək, lisenziya)
5. **Operativ audit** (mətbəx, servis, komanda, food cost)
6. **Qiymətləndirmə və şərtli təklif** (FAVÖK + risk əsaslı)
7. **Devir müqaviləsi və keçid planı** (satıcı müəyyən müddət dəstək verir)

---

## Nəticə

Hüquq və maliyyə ayrı düşünülməməlidir: ən yaxşı satış datası belə zəif müqavilə ilə dəyər itirir. M.726-nın mesajı aydındır — **tərəflər bir-birini tam, dürüst və vaxtında məlumatlandırmalıdır.**

### Final investor sualı
**"Mən bu biznesin yalnız yaxşı tərəflərini görürəm, yoxsa bütün risklərini sənəd üzərində ölçə bilirəm?"** Risklər ölçülürsə, qiymət danışılır. Risklər gizlidirsə, qiymət yox — təhlükə var.

---

### Faydalı alətlər
- [Françayz Alıcı Çek-listi — devrdan əvvəl yoxla →](/franchise/alici-cheklisti)
- [Devir elanlarına bax →](/ilanlar?type=devir)

## DK Agency necə kömək edir?
DK Agency **Devir** platforması və françayz danışmanlığı ilə devrin hüquqi və maliyyə ön yoxlamasını sistemləşdirir. *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Devir düşünürsən? DK Agency ilə pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.

*Qeyd: Bu yazı ümumi məlumat üçündür, hüquqi məsləhət deyil. Konkret addımlar üçün hüquqşünasa müraciət edin.*
$dkq$, updated_at = now()
WHERE id = 30 AND md5(content_az) = 'f441f12e1d9e4de4bca4bc5081d4de6f' AND md5(coalesce(dogan_note, '')) = 'd41d8cd98f00b204e9800998ecf8427e';

-- marka-starbucks-sansi-burger-king-dersi
UPDATE blog_posts SET content_az = $dkq$Ağrı dağının ətəyində, Doğubeyazıtda mütəvazı bir çay evi "Starbucks" adıyla məşhurlaşdı. Əsl Starbucks bunu görəndə nə etdi? Məhkəməyə verib bağlaya bilərdi. Amma **getdi, kahvə dəmlədi, hədiyyə verdi** və bu hekayəni öz markasının bir parçasına çevirdi — hətta bu hekayə haqqında sənədli film çəkildi.

Gözəl hekayə. Amma diqqət: bu, **şansdır, qayda deyil.** Sən o qədər şanslı olmaya bilərsən. Bu yazı markada həm şansı, həm də real riski göstərir.

## 1. Şanslı hekayə: marka özünə güvənəndə

Starbucks niyə belə davrandı? Çünki marka **öz adına tam sahibdir** — heç bir təhdid hiss etmir. Ona görə münaqişəni reklama çevirə bildi. Bu, güclü markanın lüksüdür: əvəzində dünyaca yayılan müsbət bir hekayə qazandı.

Bir neçə dünya markası da oxşar "nəzakətli" yol seçib — məsələn, bəzi böyük brendlər kiçik pərəstişkarlara sərt məhkəmə əvəzinə dostca, hətta yumoristik xəbərdarlıq göndərib və bundan müsbət reputasiya qazanıb. Amma bunlar **istisnadır** — xəbər olur, çünki nadirdir.

## 2. Amma sən o qədər şanslı olmaya bilərsən

Reallıq budur: markaların çoxu belə davranmır. Adını icazəsiz işlədən kiçik biznesi **xəbərdarlıq, məhkəmə və bağlanma** gözləyir. Sən nə Starbucks-san ki, böyük bir marka sənə gəlib kahvə dəmləsin — əksinə, böyük marka sənin qapına vəkil məktubu ilə gələ bilər.

Başqasının markası üzərində biznes qurmaq — **onun mərhəmətinə qalmaqdır.** İstədiyi gün adından məhrum olarsan, illərin əməyi, tabela, müştəri tanınırlığı bir anda gedər.

## 3. Burger King'in dərsi: dev belə bloklana bilər

Ən güclü nümunə bir nəhəngdir. 1971-ci ildə Burger King Avstraliyaya girmək istəyəndə gördü ki, "Burger King" adı **artıq yerli bir sahibkar tərəfindən qeydiyyatdan keçirilib** (Adelaidedə kiçik bir yeməkxananın sahibi tərəfindən).

Nəticə? Dünyanın ən böyük fast-food markalarından biri **öz adını işlədə bilmədi** və Avstraliyada "Hungry Jack's" adı ilə fəaliyyətə başladı — şirkətin tarixində adını dəyişməyə məcbur olduğu yeganə yer. Sonradan adını geri almağa çalışdı, məhkəmədə uduzdu və yerli françayz alana təxminən 47 milyon dollar təzminat ödədi.

Dərs aydındır: **bir ölkədə qeydiyyat başqa ölkədə hüquq vermir; yerli qeydiyyat qlobal şöhrətdən güclüdür.** Əgər Burger King belə bloklana bilirsə, kiçik bir sahibkar daha asanlıqla bloklanar.

### Faydalı məlumat qutusu

Markada 3 sərt həqiqət: (1) **Əvvəl qeydiyyat** — adını qeydiyyatdan keçirməsən, başqası keçirə bilər və səni öz adından məhrum edər. (2) **Bir ölkə ≠ dünya** — hər bazarda ayrıca qeydiyyat lazımdır. (3) **Başqasının adı üstündə qurma** — bu, sənin yox, onun aktividir.

## 4. "Squatter" riski: adını səndən əvvəl alanlar

Daha bir təhlükə: kimsə sənin marka adını **səndən əvvəl** qeydiyyatdan keçirə bilər. Sonra ya onu səndən baha qiymətə "geri satar", ya da ümumiyyətlə verməz — və sən tamamilə yeni bir ad qurmağa məcbur olarsan. Bu, həm pul, həm vaxt, həm də biznes dəyəri itkisidir.

Üstəlik, marka qorunmayanda **ümumi sözə** çevrilib hüquqi qorumasını da itirə bilər — tarixdə bir çox məşhur ad bu yolla müstəsna hüququnu itirib.

## 5. Dərs: marka şans işi deyil

Starbucks şanslı idi — daha doğrusu, **güclü idi**, çünki adına sahib idi. Sən də o gücü qazana bilərsən, amma yalnız bir yolla: **öz markanı, öz adını — əvvəlcədən — qeydiyyatdan keçirməklə.**

### Doğan Notu

"Hamı Starbucks'ın o gözəl hekayəsini paylaşır — amma əsl dərsi qaçırır. Starbucks ona görə cömərd ola bildi ki, adı möhkəm onundur. Burger King isə dünya nəhəngi olduğu halda, bir kiçik sahibkar onu öz ölkəsində adından etdi. Fərq şansda yox, **qeydiyyatdadır.** Mən sahibkarlara hər zaman deyirəm: tabelanı asmadan əvvəl adını qeydiyyatdan keçir. Marka sənin ən dəyərli, amma ən çox unutduğun sərmayəndir."

## Yekun

"Orada bir Starbucks var uzaqda" — gözəl hekayə, amma bir şans hekayəsidir. Sən şansa güvənə bilməzsən. Burger King kimi nəhəng belə öz adını qoruya bilmədikdə, kiçik sahibkar üçün qayda daha sərtdir: **markanı əvvəlcədən qeydiyyatdan keçir, başqasının adı üzərində qurma.** Əsl güc cömərdlikdə yox, sahiblikdədir.

---

## DK Agency necə kömək edir?

DK Agency sahibkarları öz markalarını qurmaq, qeydiyyatdan keçirmək və qorumaqda dəstəkləyir — coğrafi işarədən françayz sisteminə qədər. AFA-nın qurucusu olaraq, marka hüququ bizim işimizin mərkəzindədir. Çünki bizim üçün marka təkcə ad deyil, qorunmalı bir aktivdir: *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Markanı qeydiyyatdan keçirməyi düşünürsən? DK Agency ilə pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.

*Mənbə: Starbucks Türkiyə rəsmi paylaşımı və "The Sweetest Branch / Ağrı Dağı Çay Evi'ndən Starbucks'a" (2024) sənədli filmi; Burger King – Hungry Jack's Avstraliya marka mübahisəsi (Wikipedia, CWB IP, World Trademark Review). Bu yazı ümumi məlumatdır, hüquqi məsləhət deyil.*
$dkq$, updated_at = now()
WHERE id = 149 AND md5(content_az) = '6acceebd32445555f4514669b8ffdf0e' AND md5(coalesce(dogan_note, '')) = 'bf902db44d157d6715b1dfc6a319e823';

-- servis-haqqi-kimin-pulu-nece-paylanmalidir
UPDATE blog_posts SET content_az = $dkq$Son illərdə Azərbaycan restoranlarında hesabın sonunda yeni bir sətir daha çox görünməyə başladı: **“servis haqqı”** — faizlə hesablanan əlavə məbləğ.

Müştəri sual verir: “Bu nədir, niyə ödəyirəm?”
Ofisiant sual verir: “Bu pul mənə çatacaqmı?”
Sahibkar isə düşünür: “Bunu necə tətbiq edim ki, həm personal motivasiya olsun, həm də hüquqi risk yaranmasın?”

Servis haqqı özü-özlüyündə pis mexanizm deyil. Düzgün qurulanda personalın gəlirini qoruyan, xidməti stimullaşdıran və komanda motivasiyasını artıran sistem ola bilər. Amma yanlış qurulanda müştəri etibarını zədələyir, personalda narazılıq yaradır və biznes üçün hüquqi riskə çevrilir.

Bu yazıda məsələni sahibkar gözü ilə açırıq: servis haqqı nədir, necə göstərilməlidir, kimin pulu sayılmalıdır və ən sağlam paylaşım modeli necə qurulmalıdır?

> ⚠️ **Hüquqi qeyd:** Bu yazı ümumi məlumat xarakterlidir, hüquqi məsləhət deyil. Konkret tətbiqi hüquqşünas və mühasiblə dəqiqləşdirin.

## 1. Servis haqqı niyə yarandı?

Əsas səbəblərdən biri ödəniş davranışının dəyişməsidir.

Əvvəllər müştəri hesabı nağd ödəyirdi və masada ofisianta ayrıca “çay pulu” qoyurdu. Kart ödənişləri artdıqca bu vərdiş zəiflədi. Müştəri hesabı kartla ödəyir, masada nağd pul qalmır, nəticədə ofisiantın ənənəvi bəxşiş gəliri azalır.

Restoranlar bu boşluğu doldurmaq üçün hesaba “servis haqqı” əlavə etməyə başladılar.

Niyyət çox vaxt pis deyil: personalın gəlirini qorumaq, xidməti stimullaşdırmaq, komanda daxilində daha ədalətli paylaşım yaratmaq.

Amma problem tətbiq formasında başlayır:

- servis haqqı menyuda yazılmır;
- müştəri əvvəlcədən məlumatlandırılmır;
- qəbzdə aydın göstərilmir;
- personal pulu necə aldığını bilmir;
- bəzən müəssisə bu məbləğin bir hissəsini özündə saxlayır.

Bu nöqtədə servis haqqı motivasiya aləti olmaqdan çıxır, etibar probleminə çevrilir.

## 2. Servis haqqı, bəxşiş və xidmət qiyməti eyni şey deyil

Əvvəlcə anlayışları ayırmaq lazımdır.

### Bəxşiş

Bəxşiş müştərinin könüllü verdiyi əlavə məbləğdir. Müştəri xidmətdən razı qaldığı üçün ofisianta və ya komandaya əlavə ödəniş edir. Məbləğ müştərinin qərarından asılıdır.

### Servis haqqı

Servis haqqı restoranın hesabda ayrıca göstərdiyi əlavə xidmət məbləğidir. Müştəri bunu hesabda görür. Burada əsas məsələ şəffaflıqdır: bu məbləğ əvvəlcədən menyuda və ya qiymət məlumatında açıq göstərilməlidir.

### Xidmətin qiymətə daxil edilməsi

Ən təmiz modellərdən biri xidmət xərclərinin məhsul qiymətinin içinə daxil edilməsidir. Bu halda müştəri menyuda gördüyü qiyməti ödəyir, əlavə sətir çıxmır. Personal motivasiya sistemi isə müəssisənin daxili əməkhaqqı və bonus siyasəti ilə qurulur.

Sahibkar hansı modeli seçirsə seçsin, əsas prinsip dəyişmir: **müştəri əvvəlcədən nə ödəyəcəyini bilməlidir.**

## 3. Azərbaycanda hüquqi risk haradadır?

Azərbaycanda restoran servis haqqını ayrıca və bütün detalları ilə tənzimləyən xüsusi norma göstərmək çətindir. Buna görə məsələ istehlakçı hüquqları, qiymət şəffaflığı, ictimai iaşə qaydaları, vergi uçotu və əmək münasibətləri kontekstində qiymətləndirilməlidir.

Burada sahibkar üçün əsas risklər bunlardır:

### 1. Müştərinin əvvəlcədən məlumatlandırılmaması

Əvvəlcədən açıq göstərilməyən və sonradan hesaba əlavə edilən servis haqqı istehlakçı hüquqları baxımından mübahisəlidir. Müştəri bunu gizli əlavə kimi qəbul edə bilər.

### 2. Qəbzdə aydın göstərilməməsi

Servis haqqı alınırsa, bu məbləğin qəbzdə düzgün və şəffaf göstərilməsi vacibdir. Müəssisəyə daxil olan hər məbləğ uçot və vergi baxımından düzgün rəsmiləşdirilməlidir.

### 3. Personalın pay bölgüsünün qeyri-şəffaf olması

Servis haqqı personal üçün yığılırsa, komanda bu pulun necə bölündüyünü bilməlidir. Əks halda sistem motivasiya yaratmaq yerinə daxili narazılıq yaradır.

### 4. Müəssisənin pulu “xərc” adı ilə saxlaması

Bəzi restoranlarda servis haqqının bir hissəsi peçetə, süfrə, qırılan qab, POS komissiyası və ya digər xərclər adı ilə saxlanılır. Bu mövzu Azərbaycanda ayrıca və açıq tənzimlənmədiyi üçün mübahisə yarada bilər. İdarəetmə baxımından da risklidir: personal bu məbləği xidmətinə görə toplanan pul kimi görür, müəssisənin saxlamasını isə ədalətsiz qəbul edə bilər.

Sahibkar üçün daha təhlükəsiz prinsip belədir:

**Açıq göstər, düzgün rəsmiləşdir, yazılı paylaşım qaydası yarat və personalın payını şəffaf böl.**

## 4. Dünya təcrübəsi nə deyir?

Bir çox ölkədə servis haqqı və bəxşiş məsələsi daha ciddi tənzimlənir. Ən aydın nümunələrdən biri Böyük Britaniyadır.

İngiltərə, Şotlandiya və Uelsdə 1 oktyabr 2024-cü ildən qüvvəyə minən qaydalara görə, işəgötürənin qəbul etdiyi və ya bölgüsünə nəzarət etdiyi bəxşiş, gratuity və servis haqları məhdud vergi istisnaları xaricində kəsintisiz şəkildə işçilərə ötürülməlidir. Rəsmi kodeks ədalətli bölgü, yazılı siyasət və bölgü qeydlərinin saxlanmasını da tələb edir.

Burada iki prinsip xüsusilə önə çıxır:

- servis haqqı və bəxşiş sahibkarın əlavə gəliri kimi deyil, personalın haqqı kimi qəbul edilir;
- paylaşım yalnız ofisiantlar arasında yox, xidmət təcrübəsinə töhfə verən komanda arasında obyektiv meyarlarla aparılır.

Bu yanaşma Azərbaycan üçün qanuni məcburiyyət kimi yox, **beynəlxalq yaxşı idarəetmə nümunəsi** kimi oxunmalıdır.

Yəni dünya trendi belədir:
**servis haqqı varsa, şəffaflıq olmalıdır; personal üçün toplanırsa, personal almalıdır.**

## 5. Servis haqqı yalnız ofisiantındırmı?

Bu, restoranlarda ən çox mübahisə yaradan suallardan biridir.

Müştəri ofisiantı görür, ona görə servis haqqının yalnız ofisianta aid olduğunu düşünə bilər. Amma qonaq təcrübəsini yalnız ofisiant yaratmır.

Bir masa təcrübəsində iştirak edənlər:

- ofisiant;
- runner;
- hostes;
- barmen;
- barista;
- aşpaz;
- soyuq və isti mətbəx komandası;
- qabyuyan;
- kassir;
- növbə meneceri.

Yemək gecikirsə, qonaq ofisianta əsəbiləşir. Boşqab çirklidirsə, qonaq restoranı günahlandırır. Qəhvə pisdirsə, ümumi təcrübə zəifləyir. Yəni servis yalnız masada baş verən hərəkət deyil; bütün əməliyyatın nəticəsidir.

Ona görə sağlam model servis haqqının komanda daxilində ədalətli bölüşdürülməsidir.

## 6. Düzgün paylaşım modeli necə qurula bilər?

Hər restoranın formatı fərqlidir. Fine dining, casual dining, fast casual, coffee shop və otel restoranı eyni bölgü modelindən istifadə etməyə bilər.

Amma baza prinsiplər eyni qalmalıdır:

### 1. Yazılı siyasət olmalıdır

Servis haqqı necə toplanır, kimlərə paylanır, hansı dövrdə ödənilir və hansı meyarla bölünür — hamısı yazılı olmalıdır.

### 2. Personal əvvəlcədən bilməlidir

İşçi işə başlayanda servis haqqı siyasətini bilməlidir. “Ayın sonunda baxarıq” yanaşması narazılıq yaradır.

### 3. Salon və mətbəx balansı qurulmalıdır

Servis haqqının tamamını yalnız salona vermək mətbəxdə motivasiya problemi yarada bilər. Tamamını bərabər bölmək də hər zaman ədalətli olmaya bilər. Vəzifə, iş saatı, performans və komanda töhfəsini nəzərə alan balanslı model qurulmalıdır.

### 4. Sahibkar pay almamalıdır

DK Agency-nin tövsiyə etdiyi ən təmiz və mübahisəsiz modeldə sahibkar və yuxarı rəhbərlik servis haqqından pay götürmür. Menecerin pay alıb-almaması isə onun real əməliyyatdakı roluna görə ayrıca və açıq qaydada müəyyən edilməlidir.

### 5. Hesabat verilməlidir

Ay sonunda komandaya nə qədər servis haqqı toplandığı və hansı prinsip üzrə bölündüyü ümumi şəkildə açıqlanmalıdır. Şəffaflıq motivasiyanı artırır.

## 7. Sahibkar üçün tövsiyə olunan model

DK Agency yanaşması ilə sağlam model belədir:

### Müştəri tərəfi

Menyuda və ya masa üzərində aydın yazılır:

> “Restoranımızda hesabınıza 10% servis haqqı əlavə olunur. Bu məbləğ xidmət komandasının motivasiya fonduna yönəldilir. Servis haqqı ilə bağlı sualınız olarsa, zəhmət olmasa menecerə müraciət edin.”

Əgər servis haqqı könüllüdürsə, bu da açıq yazılmalıdır:

> “Servis haqqı könüllüdür. Xidmətdən razı qalmadığınız halda menecerə bildirərək bu məbləğin hesabdan çıxarılmasını istəyə bilərsiniz.”

### Qəbz tərəfi

Servis haqqı ayrıca sətirdə göstərilir. Vergi və uçot qaydaları mühasib və hüquqşünasla dəqiqləşdirilir.

### Personal tərəfi

Daxili sənəd hazırlanır:

- servis haqqı hansı fonda yığılır;
- kimlər iştirak edir;
- neçə faiz salon, neçə faiz mətbəx və dəstək komandası arasında bölünür;
- ödəniş hansı tarixdə edilir;
- iş saatı və performans necə nəzərə alınır;
- intizam pozuntusu və ya şikayət hallarında qayda necə tətbiq olunur.

### İdarəetmə tərəfi

Servis haqqı sahibkar üçün gizli gəlir mənbəyi deyil, personal motivasiya sistemi kimi qurulur.

Ən təmiz prinsip:

**Servis haqqı — personalın motivasiya fondudur. Sahibkarın əməliyyat xərci deyil.**

## 8. Sahibkarın etməməli olduğu 5 səhv

### 1. Servis haqqını gizlətmək

Müştəri hesab gələndə ilk dəfə servis haqqını görürsə, bu artıq etibar problemidir.

### 2. “Hamıda var” məntiqi ilə tətbiq etmək

Başqa restoranın etməsi modelin düzgün olduğu anlamına gəlmir. Hər sistem hüquqi, vergi və əməliyyat baxımından ayrıca qurulmalıdır.

### 3. Personalı məlumatlandırmamaq

Servis haqqının necə bölündüyünü bilməyən işçi motivasiya olmur, əksinə narazı qalır.

### 4. Müəssisə xərclərini servis haqqından çıxmaq

Peçetə, süfrə, qab-qacaq, POS komissiyası və qırılan inventar kimi xərclər restoranın əməliyyat xərcləridir. Bunları servis haqqından çıxmaq həm komanda etibarını zədələyir, həm də mübahisə yarada bilər.

### 5. Qəbzdən kənar yığmaq

Qəbzdən kənar alınan hər məbləğ biznes üçün vergi və reputasiya riskidir.

## 9. Nümunə daxili bölgü modeli

Bu sadəcə nümunədir. Hər restoran öz formatına uyğun ayrıca model qurmalıdır.

Toplanan servis haqqı 100% personal fonduna gedir.

Bölgü belə ola bilər:

- 55% salon komandası: ofisiant, runner, hostes;
- 25% mətbəx komandası: isti mətbəx, soyuq mətbəx, hazırlıq;
- 10% bar və barista komandası;
- 10% dəstək komandası: qabyuyan, təmizlik, kassir.

Daha sonra hər qrupun içində bölgü iş saatı, növbə sayı və performans meyarlarına görə aparılır.

Bu modelin üstünlüyü odur ki, həm qonaqla birbaşa çalışan personal motivasiya olur, həm də arxa planda xidməti mümkün edən komanda sistemdən kənarda qalmır.

## Yekun

Servis haqqı düzgün qurulanda restoran üçün güclü motivasiya alətidir. Yanlış qurulanda isə müştəri narazılığı, personal etibarsızlığı və hüquqi risk yaradır.

Əsas prinsip üç sözdədir:

**Şəffaflıq. Ədalət. Uçot.**

Müştəri əvvəlcədən bilməlidir. Personal paylaşım qaydasını anlamalıdır. Müəssisə isə aldığı hər məbləği düzgün rəsmiləşdirməlidir.

Dünya trendi aydındır: servis haqqı sahibkarın gizli gəliri deyil, xidməti yaradan komandanın motivasiya fondudur.

> 🔧 **Faydalı alətlər:** Bölgü modelinin əməkhaqqı və mənfəətə təsirini [Mənfəət və zərər hesabatı (P&L)](/toolkit/pnl) ilə hesabla; komanda motivasiyası və dəyişmə riskini [İşçi Saxlama aləti](/toolkit/staff-retention) ilə ölç.

## DK Agency necə kömək edir?

DK Agency restoran sahiblərinə şəffaf, ədalətli və idarə oluna bilən servis haqqı sistemi qurmaqda dəstək verir.

Biz bu prosesi yalnız “faiz neçə olsun?” sualı kimi görmürük. Əsas məsələ sistemdir:

- menyu və qəbz kommunikasiya dili;
- personal üçün yazılı paylaşım siyasəti;
- salon–mətbəx balansı;
- mühasibat və vergi uyğunluğu;
- motivasiya və performans modeli;
- müştəri şikayətlərinin idarə olunması.

Çünki ədalətli sistem yalnız personalı deyil, markanı da qoruyur.

> **Növbəti addım:** Restoranınızda servis haqqı siyasətini şəffaf və risksiz qurmaq istəyirsinizsə, [DK Agency ilə ilkin dəyərləndirmə üçün əlaqə saxlayın →](/elaqe).

*Mənbə qeydi: Azərbaycan Respublikasında istehlakçı hüquqları, ictimai iaşə və vergi uçotu ilə bağlı ümumi prinsiplər; Böyük Britaniya Employment (Allocation of Tips) Act 2023 və rəsmi “Code of practice on fair and transparent distribution of tips” sənədləri. Bu yazı ümumi məlumat xarakterlidir, hüquqi məsləhət deyil.*
$dkq$, updated_at = now()
WHERE id = 65 AND md5(content_az) = '62fc766ed9601fab885ffbdab0206e58' AND md5(coalesce(dogan_note, '')) = '91c5a2ce52f5a923125831a71664ebbc';

-- bir-elan-on-platforma-ev-kirayesi
UPDATE blog_posts SET content_az = $dkq$Tutaq ki, Bakıda və ya Xınalıqda kirayə vermək istədiyin bir evin var. Onu yalnız bir saytda elan edirsən — bəlkə Airbnb-də, bəlkə bir yerli qrupda. Nəticə: ayın yarısı ev boş qalır, çünki sənin elanını görən az adam var. Halbuki eyni evi eyni anda bir neçə platformada göstərə bilsən, daha çox göz, daha çox rezervasiya deməkdir.

Bu yazı kiçik ev sahibinin əsl problemini və sadə həllini izah edir.

## 1. Problem: tək yerdə elan = boş günlər

Çox ev sahibi belə düşünür: "Bir saytda elan verdim, kifayətdir." Amma hər platformanın öz auditoriyası var:

- Bəzi turist yalnız Airbnb-yə baxır.
- Bəzisi yalnız Booking istifadə edir.
- Yerli qonaq isə bəlkə birbaşa WhatsApp və ya yerli elan saytı axtarır.

Sən yalnız bir yerdə görünürsənsə, qalan bütün qonaqları **itirirsən.** Ev isə boş qalanda pul qazanmır — amma kommunal, təmizlik və bütün xərclər davam edir.

## 2. Həll: hamısını bir yerdən idarə et

Burada işə **kanal meneceri** girir — yəni bütün elanlarını tək bir yerdən idarə edən bir alət. Bir dəfə elanını yazırsan (şəkil, qiymət, qaydalar), alət onu eyni anda bir neçə platformaya yayır.

Ən vacib faydası: **təqvim sinxronu.** Yəni evi Booking-də biri rezerv edəndə, Airbnb-də həmin günlər avtomatik bağlanır. Beləcə eyni gecəyə iki nəfərə yer satmaq kimi xəcalətli vəziyyət yaranmır.

### Faydalı məlumat qutusu
Bir kiçik ev sahibi üçün başlanğıc dəsti adətən belədir: bir beynəlxalq platforma (Airbnb), bir rezervasiya saytı (Booking), bir yerli kanal (WhatsApp Biznes və ya yerli elan saytı), və hamısını birləşdirən kanal meneceri. Üç yer, bir idarə paneli.

## 3. Necə qurarsan? (4 addım)

1. **Platformaları seç.** Hədəf qonağın kimdir? Xarici turistdirsə — Airbnb + Booking. Yerli qonaqdırsa — yerli sayt + WhatsApp da əlavə et.
2. **Bir güclü elan hazırla.** Aydın şəkillər (gündüz işığında, səliqəli), dürüst təsvir, dəqiq qaydalar. Bu eyni elan hər yerə gedəcək.
3. **Kanal menecerinə bağla.** Bütün platformaları bir panelə bağlayırsan; təqvim avtomatik sinxronlaşır.
4. **Qiymət qaydası qoy.** Həftəsonu, bayram, mövsüm — fərqli qiymət. Çox platforma bunu avtomatik tənzimləyə bilir.

> Qeyd: platformalar hər rezervasiyadan komissiya alır (adətən faizlə). Bunu qiymətini quranda nəzərə al — komissiya itki deyil, görünürlük üçün ödənişdir.

## 4. Ən qiymətli kanal: öz birbaşa qonağın

Platformalar yeni qonaq gətirir — bu yaxşıdır. Amma hər rezervasiyada komissiya verirsən. Ona görə ağıllı ev sahibi **öz birbaşa kanalını** da qurur:

- İlk dəfə platformadan gələn qonağa əla təcrübə yaşat.
- Çıxarkən təvazökar şəkildə "növbəti dəfə birbaşa bizə yaz" de (WhatsApp və ya kiçik vizit kartı ilə).
- Təkrar gələn qonaq komissiyasız gəlir — yəni xalis qazanc.

### Doğan Notu
"Rayonlarda gözəl evlər görmüşəm — Xınalıqda, Şəkidə, Lənkəranda — amma sahibləri yalnız 'tanış vasitəsilə' kirayə verir. Ev ayda 4-5 gün dolur. Halbuki düzgün elan + bir neçə platforma + təqvim sinxronu ilə həmin ev ayda 15-20 gün dolur. Fərq texnologiyada deyil, **sistemdə**. Bir dəfə qurursan, sonra ev özü işləyir."

## Yekun

Kiçik ev sahibi üçün qayda sadədir: **bir yerdə görünmək azdır.** Bir elan hazırla, onu bir neçə platformaya yay, təqvimi sinxronla və öz birbaşa qonağını qur. Beləcə ev daha çox dolur, daha az komissiya verirsən və idarəetmə bir paneldən keçir.

---

## DK Agency necə kömək edir?

DK Agency kiçik ev və otel sahiblərinə rəqəmsal görünürlük qurmaqda kömək edir — düzgün elan, platforma seçimi, qiymət strategiyası və qonaq təcrübəsi. Çünki bizim üçün kirayə təkcə bir ev deyil, qurulan etibardır: *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Evini daha çox doldurmaq istəyirsən? DK Agency ilə pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.
$dkq$, updated_at = now()
WHERE id = 34 AND md5(content_az) = '6d8cc436364329883aa232ab96ca1a06' AND md5(coalesce(dogan_note, '')) = 'd41d8cd98f00b204e9800998ecf8427e';

-- 1-porsiya-food-cost-hesablama
UPDATE blog_posts SET content_az = $dkq$---

Sən bir porsiya Toyuq Sac-ı 18₼-a satırsan. Ərzaq xərci 6₼ çıxır. "12₼ qazandım" deyirsən.

**Qazanmadın.**

O 18₼-ın içindən icarə çıxır, işçi maaşı çıxır, qaz çıxır, elektrik çıxır, qırılan boşqab çıxır, atılan materialın xərci çıxır, DSMF çıxır, vergi çıxır. Sonda baxırsan ki, 18₼-dan əlində **1-2₼ qalıb.** Bəlkə heç qalmayıb. Bəlkə **mənfi**dir — amma sən bilmirsən, çünki hesablamamısan.

Bu, Azərbaycanda çox restoranın xəstəliyidir: food cost-u (ərzaq maya dəyərini) bilmədən işləyirlər. Menyu qiymətlərini "rəqib nə yazıb, mən də o qədər" prinsipi ilə qoyurlar. Nəticə? Hər satışda pul itirirlər, amma bunu **aylar sonra** anlayırlar — kassada pul qalmayanda.

---

---

## Food cost nədir? Ən sadə izah

Food cost (ərzaq maya dəyəri) — **bir porsiya yeməyin hazırlanması üçün sərf olunan ərzaq xərcidir.** Yalnız ərzaq. İşçi maaşı, icarə, qaz — bunlar ayrıdır. Food cost yalnız boşqağa düşən materialın dəyəridir.

**Formula:**

```
Food Cost % = (Ərzaq xərci ÷ Satış qiyməti) × 100
```

**Nümunə:**
- Toyuq Sac üçün ərzaq xərci: 6₼
- Satış qiyməti: 18₼
- Food cost: (6 ÷ 18) × 100 = **33.3%**

Bu rəqəm nə deməkdir? Hər 18₼-lıq satışdan **6₼-ı** ərzağa gedir. Qalanı — 12₼ — digər xərcləri ödəməli və mənfəət qoymalıdır.

---

## "Yaxşı" food cost neçə faizdir?

Dünya standartı:

| Restoran tipi | İdeal Food Cost |
|---|---|
| Fast food / fast-casual | 25-30% |
| Casual dining (adi restoran) | 28-35% |
| Fine dining (lüks restoran) | 30-40% |
| Kafe / qəhvəxana | 25-35% |
| Pizza / xəmir bazalı | 20-28% |

**Azərbaycan reallığı:** Bakıda bir çox restoranın food cost-u bu hədlərdən yuxarıdır. Niyə? Çünki:
- Resept standartlaşdırması yoxdur (hər aşpaz öz istədiyi qədər qoyur)
- Porsiyon ölçüsü nəzarətsizdir
- Ərzaq itkisi (waste — tullantı) hesablanmır
- Mövsümi qiymət dəyişiklikləri izlənmir
- Firmalardan endirimsiz, müqayisəsiz alış edilir

---

## Resept kartı — hər şeyin əsası

Resept kartı (recipe costing card) — hər yeməyin **standart reseptidir.** İçində:
- Hər ingrediyentin miqdarı (qram, ml, ədəd)
- Hər ingrediyentin alış qiyməti
- Hazırlıq itkisi (trim loss — təmizlənmə itkisi)
- Hazır porsiyanın ümumi ərzaq xərci
- Satış qiyməti və food cost faizi

**Niyə bu qədər vacibdir?**

Resept kartı olmadan:
- Aşpaz A toyuğu 250 qram qoyur, Aşpaz B 350 qram qoyur — eyni yemək, fərqli xərc
- Mövsüm dəyişir, pomidorun qiyməti 2 qat artır — sən eyni qiymətlə satmağa davam edirsən
- Yeni aşpaz gəlir, resepti bilmir, "göz ölçüsü" ilə işləyir — keyfiyyət və xərc hər gün fərqli olur

**Resept kartı ilə:**
- Hər porsiya eynidir — keyfiyyət sabitdir
- Xərc dəqiqdir — food cost-u bilirsən
- Yeni işçi resepti görür, öyrənir — təlim sürəti artır
- Qiymət dəyişəndə kartı yeniləyirsən — satış qiymətini dəyişmək lazım olub-olmadığını dərhal görürsən

---

## Praktik nümunə: Toyuq Sac resept kartı

Gəlin real bir hesablama edək:

| İnqrediyent | Miqdar | Vahid qiymət | Xərc |
|---|---|---|---|
| Toyuq but (sümüksüz) | 250 qr | 12₼/kq | 3.00₼ |
| Kartof | 150 qr | 1.50₼/kq | 0.23₼ |
| Bibər (rəngli) | 80 qr | 6₼/kq | 0.48₼ |
| Soğan | 50 qr | 1₼/kq | 0.05₼ |
| Pomidor | 80 qr | 4₼/kq | 0.32₼ |
| Yağ (ərimə) | 30 ml | 8₼/litr | 0.24₼ |
| Ədviyyat mix | 10 qr | 15₼/kq | 0.15₼ |
| Duz, istiot | 5 qr | 3₼/kq | 0.02₼ |
| Lavash | 1 ədəd | 0.30₼ | 0.30₼ |
| **TOPLAM ƏRZAQ XƏRCİ** | | | **4.79₼** |

Satış qiyməti: **16₼**
Food cost: (4.79 ÷ 16) × 100 = **29.9%**

Bu, sağlam rəqəmdir. Amma gəlin trim loss-u (hazırlıq itkisini) əlavə edək:

**Trim loss nədir?** Toyuq aldın 1 kq — təmizlədikdən sonra əlində 800-850 qr qalır. Yəni 15-20% itki var. Kartof soyulur — 10% itki. Bibər təmizlənir — 15% itki.

| İnqrediyent | Satın alınan | Trim loss | İstifadə olunan | Düzəldilmiş xərc |
|---|---|---|---|---|
| Toyuq but | 295 qr | 15% | 250 qr | 3.54₼ |
| Kartof | 167 qr | 10% | 150 qr | 0.25₼ |
| Bibər | 94 qr | 15% | 80 qr | 0.56₼ |

**Düzəldilmiş toplam: 5.43₼** (əvvəlki 4.79₼ deyil)
**Düzəldilmiş food cost: 33.9%** (əvvəlki 29.9% deyil)

> ⚠️ **Xəbərdarlıq:** Trim loss hesablamasan, food cost-un **real dəyərindən 3-5% aşağı** görünür. Kağız üzərində qazanırsan, kassada itirirsən. Hər reseptdə trim loss-u mütləq nəzərə al.

---

---

## Menyu qiymətini necə qoymaq lazımdır?

"Rəqib 16₼ yazıb, mən də 16₼ yazım" — **bu ölüm formuludur.** Çünki rəqibin xərci səninkindən fərqlidir. Onun icarəsi aşağı ola bilər, ərzağı ucuz ala bilər, işçisinə az ödəyə bilər. Eyni qiyməti yazsan, o qazanır, sən itirirsən.

**Düzgün formula:**

```
Satış qiyməti = Ərzaq xərci ÷ Hədəf food cost %
```

**Nümunə:**
- Ərzaq xərci (trim loss daxil): 5.39₼
- Hədəf food cost: 30%
- Satış qiyməti: 5.39 ÷ 0.30 = **17.97₼ → yuvarlaqlaşdır: 18₼**

Əgər rəqib 16₼ yazıbsa və sənin food cost-un 30%-ə uyğun qiymətin 18₼-dırsa — **16₼ yazma.** Ya food cost-u azalt (daha ucuz ərzaq, daha kiçik porsiya, resepti optimallaşdır), ya da 18₼-a sat və **dəyər** yarat ki müştəri ödəsin.

---

---

## Ərzaq itkisi (waste) — gizli qatil

Hər restoranda ərzaq itkisi var. Sual budur: **nə qədər?**

Bakıda çox restoranda bu itki gözləniləndən böyükdür, çünki:

- **Yanlış saxlama:** Soyuducunun temperaturu düzgün deyil, ərzaq vaxtından əvvəl xarab olur
- **Həddindən artıq hazırlıq (over-prep):** Sabah 50 porsiya lazımdır, aşpaz 80 porsiyalıq hazırlayır — 30-u atılır
- **FIFO qaydası bilinmir:** FIFO (First In, First Out — ilk girən, ilk çıxan) — köhnə ərzağı əvvəl istifadə et. Çox sadə qayda, amma Bakıda restoranların əksəriyyətində yeni gələn ərzaq köhnənin üstünə qoyulur, köhnə dibdə qalır, xarab olur
- **Porsiyon nəzarətsizliyi:** Aşpaz "bir az daha" qoyur — hər porsiyada 10-15% artıq material gedir

**Waste-i necə azaltmaq olar?**

1. **Gündəlik waste log (tullantı jurnalı) tutun.** Hər gün atılan ərzağın siyahısını yazın: nə, nə qədər, niyə. Həftə sonunda baxın — nümunələr (patterns) görəcəksiniz.

2. **Prep sheet (hazırlıq vərəqi) istifadə edin.** Hər səhər aşpazbaşı yazır: bu gün nə qədər hazırlanacaq. Dünənki satışa, bu günkü rezervasiyalara görə.

3. **FIFO-nu fiziki olaraq tətbiq edin.** Soyuducuda rəfləri etiketləyin. Yeni ərzaq arxaya, köhnə önə. Bu, 5 dəqiqəlik təşkilatdır — amma aylıq yüzlərlə manat qoruyar.

4. **Cross-utilization (çarpaz istifadə) düşünün.** Qalan toyuq sümüklərindən bulyon hazırlayın. Kəsilmiş tərəvəz qırıntılarından şorba bazası edin. Bayat çörəkdən kruton edin. Atılacaq ərzağı başqa yeməyə çevirin.

---

---

## Firma seçimi — "aşpazın adamı" tələsi

Bu, "Gizli Xərclər" yazımızda "kresloya yapışan sahibkar" sindromu ilə bağlıdır. Təkrar edirəm, çünki **food cost-un böyük hissəsi firma seçimindən asılıdır.**

Problem: Aşpazbaşı "öz adamı" olan firmadan alır. Qiymət müqayisəsi yoxdur. Sahibkar bilmir ki eyni toyuğu başqa firmadan **daha ucuza** ala bilərdi.

**Həll:**

1. **Minimum 3 firmadan qiymət al.** Hər ay, hər əsas ərzaq maddəsi üçün.
2. **Alışı sahibkar və ya maliyyəçi təsdiqləsin.** Aşpaz tək başına firma seçə bilməsin.
3. **Aylıq firma müqayisə cədvəli tut.** Sadə Excel cədvəli — firma adı, məhsul, qiymət, keyfiyyət qeydi.
4. **Kontrakt (müqavilə) bağla.** Sabit qiymət üçün 3-6 aylıq müqavilə imzala — mövsümi şişmələrdən qorunursan.

> 📝 **DOĞAN NOTU:** "Çalana deyil, çaldırana bax. Aşpaz firmadan 10 manat əlavə alırsa — günahkar aşpaz deyil, sistem qurmayan sahibkardır. 3 firmadan qiymət almaq 10 dəqiqəlik işdir. Bu 10 dəqiqəyə ayda 2000-3000₼ qoruyursan."

---

## Mövsümi qiymət riski — menyunu nə vaxt dəyişmək lazımdır?

Pomidorun qiyməti yayda 2₼/kq, qışda 6₼/kq olur. Bu, **3 qat** fərqdir. Əgər pomidor olan yeməyin qiymətini dəyişməsən, qışda food cost-un hiss olunacaq qədər artır — sadəcə bir ingrediyentdən.

**Strategiya:**

1. **Mövsümi menyu tətbiq et.** Yay menyusu, qış menyusu — ən azı il ərzində 2 dəfə menyu yenilə.
2. **"Mövsümi yemək" bölməsi yarat.** Menyu sabitdir, amma 4-5 yemək **mövsümə görə dəyişir** — bu, həm food cost-u optimallaşdırır, həm müştəriyə "yenilik" hissi verir.
3. **Əsas ərzaqların aylıq qiymət izləmə cədvəli tut.** Toyuq, mal əti, kartof, soğan, pomidor, yağ — 10 əsas ərzağın qiymətini hər ay yaz. Trend-i (meyli) gör.
4. **Menyu qiymətinə "bufer" (buffer — yastıq) qoy.** Food cost-u 30%-ə hədəfləmək əvəzinə, **28%-ə** hədəflə — mövsümi artım üçün 2% ehtiyat.

---

---

## Satınalma nəzarəti — "inanıram" əvəzinə "yoxlayıram"

Food cost-u aşağı saxlamağın ən effektiv yolu **satınalma prosesini sistemləşdirməkdir:**

### Gündəlik:
- ☐ Gələn ərzağı **çəkidə yoxla** — firma 10 kq yazdısa, tərəziyə qoy, 10 kq-dırmı?
- ☐ Keyfiyyəti yoxla — ətin rəngi, tərəvəzin təzəliyi, tarixlər
- ☐ Fakturanı (invoice — qaimə) saxla, sahibkara/maliyyəçiyə göndər

### Həftəlik:
- ☐ Stok (anbar) sayımı — nə qədər var, nə qədər istifadə olunub, nə qədər itib?
- ☐ Waste log-u yoxla — nümunələr var?
- ☐ Ən çox satılan və ən az satılan 5 yeməyin food cost-unu yoxla

### Aylıq:
- ☐ Firma müqayisəsi — minimum 3 firmadan qiymət yenilə
- ☐ Resept kartlarını yenilə — qiymətlər dəyişibsə, food cost yenidən hesabla
- ☐ Menyu analizi — hansı yemək qazandırır, hansı itirdirir?
- ☐ **Actual vs Theoretical food cost** (real vs nəzəri food cost) müqayisəsi: nəzəri olaraq 30% olmalıdır, reallıqda neçədir? Fərq **2%-dən** çoxdursa — problem var.

---

## Theoretical vs Actual Food Cost — ən vacib rəqəm

**Theoretical food cost** (nəzəri food cost) — bütün reseptlər mükəmməl izlənsə, heç bir itki olmasa, olacaq food cost.

**Actual food cost** (real food cost) — ayın sonunda real hesablama:

```
Actual Food Cost = (Ay əvvəli stok + Ay ərzində alışlar - Ay sonu stok) ÷ Aylıq ərzaq satışı × 100
```

**Nümunə:**
- Ay əvvəli stok: 5.000₼
- Ay ərzində alışlar: 25.000₼
- Ay sonu stok: 4.000₼
- İstifadə olunan ərzaq: 5.000 + 25.000 - 4.000 = **26.000₼**
- Aylıq ərzaq satışı: 80.000₼
- Actual food cost: 26.000 ÷ 80.000 × 100 = **32.5%**

Əgər theoretical food cost 29% olarsa, arada **3.5% fərq** var. 80.000₼ satışda bu = **2.800₼ aylıq itki.** İldə **33.600₼.**

Bu fərq haradan gəlir? Oğurluq, waste, porsiyon nəzarətsizliyi, firma qiymət şişirməsi, düzgün sayılmayan stok. **Sistemi qursan — bu fərqi 1-1.5%-ə endirə bilərsən.** Yəni ildə **təxminən 19.000-24.000₼ qoruyursan.**

> ⚠️ **Xəbərdarlıq:** Actual və theoretical food cost arasındakı fərq **2%-dən** çoxdursa, problemin var. 5%-dən çoxdursa, **ciddi problemin** var. Bu rəqəmi hər ay hesabla — bu, restoranının "sağlıq analizi"dir.

---

## FOOD COST CHECKLIST — Bu Gün Başla

| # | Addım | Status |
|---|---|---|
| 1 | Hər yeməyin resept kartını yaz (ingrediyent, miqdar, qiymət) | ☐ |
| 2 | Trim loss-u hər reseptə əlavə et | ☐ |
| 3 | Hər yeməyin food cost %-ni hesabla | ☐ |
| 4 | Satış qiymətini food cost formuluna görə yoxla | ☐ |
| 5 | Minimum 3 firmadan aylıq qiymət müqayisəsi et | ☐ |
| 6 | FIFO sistemini soyuducuda tətbiq et | ☐ |
| 7 | Gündəlik waste log başlat | ☐ |
| 8 | Həftəlik stok sayımı başlat | ☐ |
| 9 | Aylıq actual vs theoretical food cost hesabla | ☐ |
| 10 | Mövsümi qiymət dəyişikliklərini izlə, menyunu uyğunlaşdır | ☐ |

---

> 📝 **DOĞAN NOTU:** "Bir sahibkara dedim ki food cost-un 42%-dir, o dedi 'olar da, hamının belədir.' Hamının belə olması sənin batmayacağın demək deyil — hamının birlikdə batdığı deməkdir. Fərqli ol. Hesabla."

---

> **💡 DK Agency:** Resept kartı hazırlamağı bilmirsən? DK Agency-nin pulsuz [Food cost](/toolkit/food-cost) alətində inqrediyentləri (trim loss daxil) yazırsan — porsiyanın maya dəyəri və satış qiyməti avtomatik hesablanır. Aylıq food cost auditi, satınalma sistemi qurulması, menyu optimallaşdırması üçün danışmanlıq xidmətimiz mövcuddur.
>
> 📧 info@dkagency.com.tr | 🔧 [Food cost aləti](/toolkit/food-cost) | 🌐 [Marketinq Ocağı](/marketinq)
$dkq$, updated_at = now()
WHERE id = 7 AND md5(content_az) = 'aca2e047f3466201a7ffdc86621e1326' AND md5(coalesce(dogan_note, '')) = 'e9a15ec624270b5d2958f88a08858aab';

-- marka-qeydiyyati-azerbaycan
UPDATE blog_posts SET content_az = $dkq$Françayz verməyi düşünürsənsə, hər şeydən əvvəl bir sual: **markan rəsmi qeydiyyatdan keçibmi?** Çünki qeydiyyatdan keçməyən markanı françayz vermək, sahibi olmadığın evi icarəyə vermək kimidir. Eyni şəkildə, françayz alanda da almaq istədiyin markanın Azərbaycanda qorunub-qorunmadığını bilməlisən.

Bu yazı marka qeydiyyatının necə işlədiyini sadə dildə izah edir.

## Marka qeydiyyatı kimin işidir?

Azərbaycanda markaları **Əqli Mülkiyyət Agentliyi** qeydiyyata alır. Bu qurum müraciətləri yoxlayır, dövlət marka reyestrini aparır və markaların qorunmasını təmin edir. Yoxlamanı Agentliyin Patent və Markaların Ekspertizası Mərkəzi həyata keçirir.

## Neçə vaxt çəkir, kim müraciət edə bilər?

- Qeydiyyat bir neçə ay çəkir; dəqiq müddəti və sürətləndirilmiş rejimin şərtlərini Agentlikdən öyrən.
- **Yerli şəxs və şirkətlər birbaşa müraciət edə bilər.**
- **Xarici şəxs və şirkətlər isə yalnız qeydiyyatdan keçmiş patent vəkili vasitəsilə** müraciət edə bilər. Bu, Türkiyə və ya başqa ölkədən gələn brendlər üçün vacib detaldır.
- Müraciət Azərbaycan dilində, markanın aydın təsviri və malların/xidmətlərin siyahısı (Nitsa təsnifatı) ilə verilir.
- Qeydiyyat **10 il** etibarlıdır və yenilənə bilər.

## Niyə bu, françayz üçün kritikdir?

Françayz əslində üç şeyin icarəsidir: **marka, nou-hau (iş bilgisi) və ticari sirr.** Bunların ən görünəni markadır.

- **Françayz verənsənsə:** markan qeydiyyatda deyilsə, onu hüquqi olaraq verə bilməzsən. Qeydiyyat olmadan başqası sənin adını kopyalaya bilər və sən qarşısını ala bilməzsən.
- **Françayz alansansa:** ödədiyin pul markanın gücünə görədir. Əgər marka Azərbaycanda qeydiyyatda deyilsə, pulunu hüquqi qorunması olmayan bir ada verirsən.

> **Praktik qayda:** Müqavilə imzalamazdan əvvəl markanın Əqli Mülkiyyət Agentliyində qeydiyyatda olduğunu yoxla. Bu, ən sadə, amma ən vacib yoxlamadır.

## Markanı dünyaya necə daşıyırsan? (Madrid Protokolu)

Burada xoş xəbər var: Azərbaycan **Madrid Protokoluna** tərəfdir. Bu o deməkdir ki, bir müraciətlə markanı bir neçə ölkədə eyni anda qoruya bilirsən. Yəni "Azərbaycandan dünya brendi çıxarmaq" arzusu sadəcə şüar deyil — bunun hüquqi mexanizmi mövcuddur. (Azərbaycan həm də WIPO üzvüdür və Paris Konvensiyasına tərəfdir.)

Əgər hədəfin yerli markanı qlobala daşımaqdırsa, bu mexanizm AzQuality kimi markalaşma təşəbbüslərinin praktik təməlidir.

---

### Faydalı alət
- [Françayz Hazırlıq Testi — markan françayz verməyə hazırdırmı? →](/franchise/hazirliq-testi)

## DK Agency necə kömək edir?

DK Agency françayz yolunun hər addımında yanındadır — marka hazırlığından françayz sisteminin qurulmasına qədər. Markanı françayz üçün hazırlamaq, sənədləri düzgün sıralamaq və düzgün uzmanlara (patent vəkili, hüquqşünas) yönləndirmək — biz bu yolu sadələşdiririk. Çünki bizim üçün marka tabela yox, etibarın nişanıdır: *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Markan françayz verməyə hazırdırmı? DK Agency Françayz Hazırlıq Testini doldur və ya pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.

*Qeyd: Bu yazı ümumi məlumat üçündür, hüquqi məsləhət deyil. Konkret addımlar üçün patent vəkili və ya hüquqşünasa müraciət edin.*
$dkq$, updated_at = now()
WHERE id = 29 AND md5(content_az) = 'dddc4092d4d15631466dbc349c1fa80d' AND md5(coalesce(dogan_note, '')) = 'd41d8cd98f00b204e9800998ecf8427e';

-- sifirdan-yoxsa-isleyen-franchise-devri
UPDATE blog_posts SET content_az = $dkq$## 2026 bazarında risk, nakit axını və FAVÖK baxışı

2026-cı ildə HoReCa sektorunda yatırım qərarı artıq "gözəl məkan açaq" düşüncəsi ilə verilmir. Kirayə xərcləri, əməkhaqqı təzyiqi, food cost dalğalanması, avadanlıq qiymətləri və istehlakçının daha seçici davranması restoran yatırımını texniki bir qərara çevirib.

Bu bazarda investor üçün əsas sual dəyişib: **"Mən brend qururam, yoxsa artıq işləyən nakit axınını satın alıram?"**

Sıfırdan restoran yaratmaq hələ də mümkündür, amma yüksək qeyri-müəyyənlik daşıyır. İşləyən françayz şöbəsini devralmaq isə doğru analiz edildikdə daha ölçülə bilən, daha tez test edilən və daha sürətli geri dönüş potensialı yaradır. Məsələ yalnız restoran almaq deyil — **riskin qiymətini düzgün hesablamaqdır.**

---

## 1. Sıfırdan qurulum (greenfield, yəni sıfırdan tikmək): gözəl ideya, yüksək qeyri-müəyyənlik

**Birincisi, ilkin investisiya riski (CAPEX).** Tikinti, dekorasiya, mətbəx avadanlığı, havalandırma, POS sistemi, mebel, fasad — kağız üzərində planlanan büdcə açılışa yaxın xeyli arta bilər.

**İkincisi, zaman riski.** Məkan açılmayıbsa, pul işləmir. İnvestor kapital qoyur, amma 3–6 ay satış yoxdur. Bu müddətdə kirayə, komanda, dizayn dəyişiklikləri və lisenziyalar kapitalı "ölü zaman"a bağlayır.

**Üçüncüsü, bazar uyğunluğu riski.** Lokasiya, menyu, qiymət və xidmət sürəti yalnız açılışdan sonra real test olunur. Açılış öncəsi Excel modeli bazarın davranışını tam göstərmir.

### Investor qutusu
**Greenfield yatırımda əsas sual:** "Bu konseptin işləyəcəyinə inanırıq, yoxsa bunu sübut edən real satış datası var?" Cavab yalnız "inanırıq"dırsa, bu investisiya yox, yüksək riskli konsept testidir.

---

## 2. İşləyən françayz devri: "real data" üstünlüyü

İşləyən şöbəni devralanda investor sıfırdan mətbəx qurmur, komanda axtarmır, müştəri davranışını təxmin etmir — artıq işləyən sistemin içinə daxil olur. Masaya bu məlumatlarla otura bilər: son 12–24 aylıq satışlar, food cost, əməkhaqqı yükü, kirayə/ciro nisbəti, müştəri təkrarlanması, online satış payı, ortalama çek, FAVÖK marjası, mövsümi dəyişikliklər və vergi tarixçəsi.

Bu, riski azaldır — çünki qərar "gələcək ehtimalı"na yox, **keçmiş performansa** əsaslanır.

### Faydalı məlumat qutusu
İşləyən françayz devrində investor yalnız avadanlıq almır. O, bunları alır: kanıtlanmış lokasiya, hazır müştəri bazası, təlim keçmiş personal, oturmuş tədarük, marka tanınması, gündəlik nakit axını və ölçülə bilən FAVÖK. Yəni fiziki məkana yox, **işləyən iqtisadi vahidə** pul ödəyir.

### Guru Kutusu
> **Warren Buffett:** "Qiymət ödədiyindir, dəyər aldığındır."
> *(Investor üçün: satış qiyməti yox, biznesin yaratdığı real qazanc əsasdır.)*

---

## 3. Pul nə vaxt işləməyə başlayır? (Time-to-Money)

Sıfırdan qurulan restoranda pul əvvəl layihəyə, tikintiyə, komandaya, açılışa gedir; satış bütün bunlardan sonra başlayır. İşləyən devirdə isə **ilk gündən satış davam edir** — müştəri gəlir, POS işləyir, komanda xidmətdədir. Bu fərq geri dönüş müddətinə ciddi təsir edir.

### Sadə müqayisə

| Kriteriya | Sıfırdan yatırım | İşləyən françayz devri |
|---|---|---|
| Satışın başlanması | Açılışdan sonra (aylar) | İlk gündən |
| İlkin xərc sapması | Yüksək | Aşağı |
| Komanda riski | Yüksək | Orta/aşağı |
| Müştəri datası | Yoxdur | Var |
| Food cost tarixi | Yoxdur | Var |
| FAVÖK analizi | Proyeksiya | Gerçək nəticə |
| Bank/kredit baxışı | Daha riskli | Daha ölçülə bilən |
| Çıxış (exit) potensialı | Konsept sübut olunmalıdır | Performans sübut edilə bilər |

---

## 4. FAVÖK nə deyir?

FAVÖK (yəni faiz, vergi və amortizasiyadan əvvəlki əməliyyat qazancı) restoranın əsl sağlamlıq göstəricisidir. Yüksək ciro həmişə sağlam biznes demək deyil: restoran 100.000 AZN ciro edə bilər, amma food cost, əməkhaqqı və kirayə düzgün deyilsə, real qazanc zəif qalar.

### FAVÖK yoxlama qutusu
Devirdən əvvəl bu sualları ver:
- Son 12 ayda FAVÖK sabitdir, yoxsa bir neçə ayın təsiri ilə şişib?
- Food cost artanda marja necə qorunub?
- Kirayə yenilənəndə FAVÖK nə qədər azalacaq?
- Royalty və reklam fondu tam nəzərə alınıbmı?
- Sahibkarın şəxsi xərcləri kâr/zərər cədvəlindən təmizlənibmi?
- Delivery komissiyaları real hesablanıbmı?

---

## 5. Azərbaycan bazarında devir niyə aktualdır?

Üç paralel proses var: yaxşı lokasiyalar məhduddur və kirayə yüksəlir; istehlakçı artıq sürətə, dad stabilliyinə və qiymət balansına baxır; bəzi sahibkarlar yaxşı konsept qursa da, maliyyə idarəetməsi və sistemləşmədə zəif qalır. Sonuncusu investor üçün fürsətdir — zəif idarə olunan, amma potensiallı işi alıb sistemlə böyütmək.

Devir zamanı üç sahə ayrıca analiz edilməlidir: **hüquqi uyğunluq** (müqavilə, devrə icazə, ərazi qoruması, xitam), **maliyyə şəffaflığı** (POS, vergi, bank, borclar), **operativ davamlılıq** (komanda, mətbəx standartları, tədarük).

---

## Nəticə: romantika yox, ölçülə bilən yatırım

İnvestor üçün sual sadədir: "Bu kapital nə vaxt və hansı risklə geri dönəcək?" İşləyən françayz devri düzgün ön yoxlama (due diligence) ilə aparıldıqda daha rasional seçimdir — burada fikir yox performans, dekorasiya yox nakit axını alınır.

### Final investor qutusu
Devirdən əvvəl son sual: **"Bu biznes mənsiz də işləyirmi?"** Cavab bəlidirsə, bu artıq restoran deyil — yatırım aktividir.

---

### Faydalı alət
- [ROI Kalkulyatoru — françayz geri dönüş hesabla →](/franchise/roi-kalkulyatoru)

## DK Agency necə kömək edir?
DK Agency-nin [devir elanları](/ilanlar?type=devir) işləyən françayz və biznesləri bir yerdə göstərir; qərardan əvvəl rəqəmləri ROI Kalkulyatoru ilə yoxla. *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Devir platformasına bax və ya ROI Kalkulyatoru ilə öz rəqəmlərini hesabla.
$dkq$, updated_at = now()
WHERE id = 31 AND md5(content_az) = '639df017b79d12057d1514078535b389' AND md5(coalesce(dogan_note, '')) = 'd41d8cd98f00b204e9800998ecf8427e';

-- musteri-her-zaman-haqli-sikayet
UPDATE blog_posts SET content_az = $dkq$“Müştəri həmişə haqlıdır.”

Restoran, otel və xidmət sektorunda bu cümləni hamı eşidib. Amma bu cümlə çox vaxt yanlış başa düşülür.

Müştəri hər istədiyində haqlı deyil. Müştəri qaydanı pozanda, digər qonaqları narahat edəndə, personalı təhqir edəndə və ya mümkün olmayan bir tələb irəli sürəndə “haqlıdır” deyə bilmərik.

Daha doğru prinsip budur:

**Müştəri həmişə hörmətə layiqdir. Məqbul tələbi isə həmişə ciddi qəbul olunmalıdır.**

Məsələn, siqaret çəkilməyən salonda qonaq “mən burada siqaret çəkmək istəyirəm” deyirsə, ona “siz haqlısınız” deyə bilməzsən. Çünki bu halda bir müştərinin istəyi naminə qaydanı, digər qonaqların rahatlığını və personalın iş mühitini qurban vermiş olarsan.

Amma qonaq yeməyin soyuq gəldiyini, servisin gecikdiyini, hesabda səhv olduğunu və ya personal davranışından narazı qaldığını deyirsə, bu artıq müdafiəyə keçiləcək məsələ deyil. Bu, dinlənməli və idarə olunmalı siqnaldır.

Çünki restoran üçün ən dəyərli müştərilərdən biri şikayət edən müştəridir.

## 1. “Müştəri həmişə haqlıdır” nə demək idi?

Bu şüar 1900-cü illərin əvvəllərində pərakəndəçilik dünyasında məşhurlaşdı. Selfridge, Marshall Field və John Wanamaker kimi ticarət liderləri müştəri məmnuniyyətini önə çəkir, müştəri şikayətlərinin ciddi qəbul olunmasını müdafiə edirdilər.

Amma bu fikir heç vaxt “müştəri nə desə, onu et” mənasına gəlməməlidir.

Əsl mesaj daha sadə idi:

- müştərini dinlə,
- onu aldatma,
- şikayətinə yuxarıdan baxma,
- problemi araşdır,
- mümkün olduqda həll et.

Yəni bu şüarın ruhu kor-koranə itaət deyil. Şüarın ruhu müştəriyə etibar və hörmətdir.

## 2. İki təhlükəli uc

Restoran idarəçiliyində bu mövzuda iki səhv uc var.

### Birinci səhv: müştəriyə hər şeyə icazə vermək

Bəzi restoranlar “müştəri həmişə haqlıdır” düşüncəsi ilə hər tələbə razı olurlar.

Qonaq qaydanı pozur — susurlar.
Personalı aşağılayır — “dözün” deyirlər.
Digər masaları narahat edir — müdaxilə etmirlər.
Siqaret çəkilməyən yerdə siqaret istəyir — “qonağı itirməyək” deyirlər.

Bu yanaşma təhlükəlidir. Çünki bir qonağı qorumağa çalışarkən 10 qonağı itirə bilərsən. Üstəlik, personalın gözündə rəhbərlik ədalətsiz görünər.

Personal qorunmadığı yerdə xidmət keyfiyyəti uzun müddət yüksək qala bilməz.

### İkinci səhv: heç bir tənqidi qəbul etməmək

Digər tərəfdə isə tam əksi var: hər şikayəti düşmənçilik kimi görmək.

“Bizdə səhv olmaz.”
“Müştəri başa düşmür.”
“Hamı bəhanə edir.”
“Rəylər yalandır.”
“Kim narazıdırsa, gəlməsin.”

Bu yanaşma da eyni dərəcədə zərərlidir. Çünki şikayəti rədd edən restoran öz kor nöqtələrini görmür.

Məşhur restoran proqramlarında da bunu dəfələrlə görmüşük: bəzi müəssisələr müştəri rəyini, personal xəbərdarlığını və əməliyyat problemlərini qəbul etmədiyi üçün böhranı daha da dərinləşdirir.

Doğru yer bu iki ucun ortasındadır:

**Müştərini dinlə. Məqbul tələbi həll et. Qaydanı və personalı qoru.**

## 3. Şikayət hücum deyil, məlumatdır

Restoran rəhbərinin şikayətə baxış bucağı bütün komandanın davranışını dəyişir.

Əgər rəhbər şikayəti hücum kimi görürsə, personal da müdafiəyə keçir.
Əgər rəhbər şikayəti məlumat kimi görürsə, personal həll axtarır.

Şikayət edən müştəri əslində belə deyir:

**“Mən narazıyam, amma hələ getməmişəm. Sənə düzəltmək üçün şans verirəm.”**

Bu çox qiymətli siqnaldır.

Çünki narazı qonaqların böyük hissəsi şikayət etmir. Sadəcə bir daha gəlmir. Sən problemi heç vaxt öyrənmirsən.

Daha pisi, həmin qonaq öz çevrəsinə danışır:

“Getdik, yaxşı deyildi.”
“Servis zəif idi.”
“Hesabda problem oldu.”
“Bir də getmərəm.”

Bu, restoran üçün görünməyən reputasiya itkisidir.

Şikayət edən müştəri isə sənə fürsət verir: problemi gör, həll et, münasibəti xilas et.

## 4. Ən yaxşı müştəri niyə şikayət edəndir?

Çünki şikayət edən müştəri hələ əlaqəni kəsməyib.

Tam narazı və ümidsiz müştəri çox vaxt danışmır. Gedib başqa restorana keçir.

Şikayət edən müştəri isə hələ səninlə dialoqdadır. Bu, sahibkar üçün ikinci şansdır.

Düzgün idarə olunan şikayət üç nəticə yarada bilər:

- qonaq sakitləşir,
- restoran səhvini öyrənir,
- müştəri daha sadiq olur.

Bəzən şikayəti yaxşı həll olunan müştəri, heç problem yaşamamış müştəridən daha sadiq olur. Çünki o, restoranın böhran anında necə davrandığını görür.

Xidmət markası normal gündə yox, problem anında tanınır.

## 5. Azərbaycan konteksti: qonaqpərvərlik var, şikayət mədəniyyəti zəifdir

Azərbaycan cəmiyyətində qonağa hörmət, süfrəyə hörmət və çalışan insana hörmət güclü dəyərdir. Bu çox qiymətlidir.

Amma bunun yanında bir problem də var: şikayət çox vaxt düzgün idarə olunmur.

Müştəri narazılığını deyəndə personal sıxılır.
Menecer müdafiəyə keçir.
Sahibkar bunu şəxsi hücum kimi qəbul edir.
Qonaq isə “dediyimə peşman oldum” hissinə düşür.

Halbuki şikayət anında ilk cümlə çox sadə olmalıdır:

“Bizi xəbərdar etdiyiniz üçün təşəkkür edirik.”
“Sizi başa düşürəm, dərhal baxırıq.”
“Bu halı yaşadığınız üçün üzr istəyirik.”
“İcazə verin, məsələni indi həll edək.”

Bu cümlələr günahı kor-koranə qəbul etmək deyil. Bu cümlələr müştərinin duyğusunu qəbul etməkdir.

Müştəri ilk növbədə haqlı çıxmaq istəmir. O, eşidilmək istəyir.

## 6. Şikayəti ələ almağın 5 addımı

Restoranda şikayət idarəetməsi şəxsi bacarığa buraxılmamalıdır. Bunun sistemi olmalıdır.

### 1. Dinlə

Müştərinin sözünü kəsmə. İlk anda izah verməyə çalışma. Qonaq əvvəlcə eşidildiyini hiss etməlidir.

### 2. Təşəkkür et

Şikayət etdiyi üçün təşəkkür et. Çünki çox müştəri heç nə demədən gedir.

### 3. Üzr istə

Üzr istəmək hər zaman “biz tam günahkarıq” demək deyil. Bəzən bu, qonağın yaşadığı narahatlığı qəbul etməkdir.

“Bu narahatlığı yaşadığınız üçün üzr istəyirik” cümləsi çox şeyi yumşaldır.

### 4. Həll təklif et

Şikayət havada qalmamalıdır. Konkret addım olmalıdır:

- yeməyi dəyişmək,
- məhsulu yenidən hazırlamaq,
- hesabı düzəltmək,
- menecerin masaya gəlməsi,
- uyğun kompensasiya təklif etmək,
- gələcək ziyarət üçün qeyd götürmək.

### 5. Kök səbəbi düzəlt

Əsl idarəetmə burada başlayır. Şikayət sadəcə həmin masanın problemi deyil. Eyni problem təkrarlanırsa, sistemdə boşluq var.

Yemək soyuq gəlirsə, mətbəx–servis axınına bax.
Hesab səhv çıxırsa, POS və sifariş proseduruna bax.
Ofisiant kobud davranırsa, təlim və nəzarətə bax.
Gecikmə çoxdursa, masa dövriyyəsi və personal planlamasına bax.

Şikayət sadəcə söndürüləcək yanğın deyil. Şikayət sistem diaqnostikasıdır.

## 7. Absürd görünən şikayət belə ciddi siqnal ola bilər

Müştəri xidmətində məşhur bir hekayə var: bir müştəri avtomobilinin yalnız vanil dondurma aldıqdan sonra işə düşmədiyini deyir. İlk baxışda bu, absurd görünür. Amma hekayəyə görə məsələ araşdırılır və problemin dondurma ilə yox, mağazadan qayıtma müddəti ilə bağlı olduğu anlaşılır. Vanil daha tez alındığı üçün motor soyumağa vaxt tapmır və texniki problem ortaya çıxır.

Bu hekayə tarixi fakt kimi yox, xidmət dünyasında klassik dərs kimi oxunmalıdır:

**Müştərinin ifadəsi absurd görünə bilər, amma arxasında real problem ola bilər.**

Restoranlarda da belədir.

“Bu masa həmişə gecikir.”
“Bu salonda çay soyuq gəlir.”
“Bu filialda yeməyin dadı fərqlidir.”
“Eyni yemək hər dəfə başqa cür çıxır.”
“Garson sifarişimi başa düşmədi.”

Bəzən qonaq problemi texniki dildə izah edə bilmir. Amma hiss etdiyi narahatlıq realdır.

Sahibkarın işi müştərinin sözünü lağa qoymaq deyil. Arxasındakı sistemi oxumaqdır.

## 8. Personalı necə qorumalı?

Şikayəti dinləmək personalı qurban vermək demək deyil.

Əgər müştəri personalı təhqir edirsə, sərhəd qoyulmalıdır. Əgər qonaq qaydanı pozursa, menecer müdaxilə etməlidir. Əgər tələb digər qonaqların rahatlığına zərər verirsə, nəzakətlə “yox” demək lazımdır.

Restoranın qaydası belə olmalıdır:

- müştəriyə hörmət var,
- personalın ləyaqəti qorunur,
- digər qonaqların rahatlığı pozulmur,
- qanun və daxili qaydalar güzəştə getmir.

Menecerin gücü burada görünür. Həm qonağı sakitləşdirməli, həm personalı əzməməli, həm də restoranın qaydasını qorumalıdır.

Nəzakətli “yox” da xidmət mədəniyyətinin bir hissəsidir.

Məsələn:

“Çox istərdik sizə kömək edək, amma bu salonda siqaret çəkməyə icazə verilmir. İstəsəniz, sizi uyğun zonaya yönləndirə bilərik.”

Bu cümlədə həm qayda qorunur, həm qonağa hörmət edilir.

## 9. Sahibkar üçün şikayət sistemi

Restoranda şikayət idarəetməsi təsadüfi olmamalıdır. Sahibkar bunun üçün sadə, amma işlək sistem qurmalıdır.

### Şikayət qeyd forması

Hər ciddi şikayət qeyd olunmalıdır:

- tarix,
- masa nömrəsi,
- məsələ,
- cavabdeh şöbə,
- görülən tədbir,
- nəticə,
- təkrar risk.

### Gündəlik menecer icmalı

Günün sonunda menecer 5 dəqiqəlik icmal etməlidir:

- bu gün neçə şikayət oldu?
- səbəblər nə idi?
- hansı şikayət təkrarlanır?
- hansı əməkdaşın təlimə ehtiyacı var?
- hansı məhsul və ya proses problem yaradır?

### Şikayət kateqoriyaları

Şikayətlər qruplaşdırılmalıdır:

- yemək keyfiyyəti,
- gecikmə,
- servis davranışı,
- hesab səhvi,
- gigiyena,
- rezervasiya problemi,
- səs-küy və atmosfer,
- çatdırılma problemi.

### Təkrar şikayət alarmı

Eyni mövzudan 3 dəfə şikayət gəlirsə, artıq bu “müştərinin kaprizi” deyil. Bu, əməliyyat problemidir.

## 10. Sosial media şikayəti: cavab sürəti markanı qoruyur

Bu gün şikayət yalnız masada olmur. Instagram, Google Review, TikTok, WhatsApp və çatdırılma platformalarında da olur.

Sosial mediada şikayətə cavab verməmək ən böyük səhvlərdən biridir. Çünki o cavabı yalnız şikayət edən görmür. Onu yüzlərlə potensial müştəri də görür.

Cavab modeli belə olmalıdır:

- sakit ton,
- müdafiəsiz dil,
- təşəkkür,
- üzr,
- araşdırma və əlaqə təklifi,
- şəxsi məlumatları açıqda müzakirə etməmək.

Pis cavab nümunəsi:

“Belə şey ola bilməz, siz səhv başa düşmüsünüz.”

Yaxşı cavab nümunəsi:

“Rəyiniz üçün təşəkkür edirik. Bu təcrübəni yaşadığınız üçün təəssüf edirik. Məsələni araşdırmaq və sizinlə əlaqə saxlamaq istəyərik. Zəhmət olmasa, əlaqə nömrənizi şəxsi mesajla paylaşın.”

Bu cümlə mübahisə yaratmır, prosesi idarə edir.

## Doğan Notu

Bizim cəmiyyət qonaqpərvərdir, amma şikayət deyəndə çox vaxt hamı narahat olur. Sanki dava başlayır.

Mən isə əksini öyrədirəm: müştəri şikayət edəndə əvvəlcə təşəkkür et.

Çünki o, sənə getmədən əvvəl bir şans verdi. Susub gedən müştərini geri qaytarmaq daha çətindir.

“Müştəri həmişə haqlıdır” demirəm. Mən belə deyirəm:

**Müştəriyə həmişə hörmət. Məqbul tələbə həmişə həll. Qaydaya və personala həmişə qoruma.**

Bu üçü birlikdə olmasa, restoranın idarəetmə mədəniyyəti oturmaz.

Şikayət təhdid deyil. Şikayət sistemin aynasıdır. O aynaya baxmağı bacaran restoran böyüyür.

## Yekun

Müştəri həmişə haqlı deyil. Amma müştəri həmişə hörmətə layiqdir.

Məqbul tələb dinlənməli və həll edilməlidir. Qeyri-məqbul tələb isə nəzakətlə, qaydanı qoruyaraq rədd olunmalıdır.

Ən yaxşı müştəri çox vaxt şikayət edən müştəridir. Çünki o, sənə problemi düzəltmək üçün ikinci şans verir.

Güclü restoran şikayətdən qaçmır. Onu dinləyir, qeyd edir, həll edir və sistemini düzəldir.

Şikayəti hədiyyə kimi qəbul edən restoran, müştəri itirmədən inkişaf etməyi bacarır.

---

## DK Agency necə kömək edir?

DK Agency restoranlara şikayət idarəetməsini və qonaq təcrübəsini sistemə çevirməkdə dəstək verir.

Biz bu mövzuya yalnız “müştəriyə nə cavab verək?” kimi baxmırıq. Əsas məsələ sistemdir:

- şikayət qarşılama skriptləri,
- menecer müdaxilə qaydaları,
- personalı qoruyan sərhədlər,
- sosial media cavab protokolu,
- şikayət qeyd forması,
- kök səbəb analizi,
- qonaq təcrübəsi təlimi.

Çünki şikayət düzgün idarə olunanda təhdid deyil, inkişaf fürsətidir.

> **Faydalı alət:** Müştəri şikayətlərini sistemli toplamaq və təhlil etmək üçün [Şikayət analitikasına bax →](/marketinq/sikayat-analizi).

**Növbəti addım:** Komandanı şikayətləri peşəkar idarə etməyə hazırlamaq istəyirsinizsə, [DK Agency ilə əlaqə saxlayın →](/elaqe).

*Mənbə qeydi: “The customer is always right” şüarının tarixi haqqında pərakəndəçilik mənbələri; restoran transformasiya proqramlarında göstərilən ümumi əməliyyat nümunələri; müştəri xidməti ədəbiyyatında geniş istifadə olunan Pontiac/vanil dondurma anekdotu.*
$dkq$, updated_at = now()
WHERE id = 67 AND md5(content_az) = '2bcd9c19e555cdabbb190d64bb3e8121' AND md5(coalesce(dogan_note, '')) = 'd41d8cd98f00b204e9800998ecf8427e';

-- aha-ulduz-sertifikati-otel-hazirliq
UPDATE blog_posts SET content_az = $dkq$---

Azərbaycanda otel açan hər sahibkar eyni anı yaşayır: açılış lentini kəsir, ilk müştərini qarşılayır, Booking.com-da profilini yaradır. Bir neçə ay sonra fərq edir — Booking-də "ulduzsuz mehmanxana" görünür. Müştəri sayı az qalır. Niyə?

**Ulduz təsnifatı qonağın gözündə otelin səviyyəsini göstərir** — və müraciətə hazırlıq vaxt tələb edir. Cari qaydaları Dövlət Turizm Agentliyindən dəqiqləşdirin.

Bu yazıda Milli Ulduz Təsnifatının nə olduğunu, hansı qurumun verdiyini, 248 meyarın necə işlədiyini, hansı 5 səhvin müraciəti puç etdiyini, və otelinizi 3 ay içində hazırlamağın yolunu göstəririk.

---

---

## Milli Ulduz Təsnifatı nədir?

**Milli Ulduz Təsnifatı (MUT)** — Azərbaycanda otellərin xidmət və infrastruktur səviyyəsinin rəsmi qiymətləndirmə sistemidir. Sistemi **Azərbaycan Turizm Bürosu (ATB)** və **Azərbaycan Otellər Assosiasiyası (AHA)** birgə həyata keçirir.

Sistem **Hotelstars Union**-un (Avropa Mehmanxanalar Assosiasiyası) standartlarına əsaslanır. Azərbaycan 2025-ci ildən Hotelstars Union-un tam üzvüdür — yəni ulduzlar birliyin üzv ölkələrində eyni meyarlarla tanınır.

**Niyə vacibdir?**
- Rəsmi ulduz rezervasiya saytlarında otelin səviyyəsini qonağa aydın göstərir
- Beynəlxalq turist 4-5 ulduz axtarır — sertifikatsız oteli süzgəcdə görmür
- Hüquqi tələbləri (məcburi olub-olmaması, müddətlər) Dövlət Turizm Agentliyindən dəqiqləşdirin

---

## 248 Meyar — Nələri Yoxlayırlar?

Meyarlar bir neçə əsas sahəni əhatə edir:

| # | Kateqoriya | Nəyi yoxlayır |
|---|------------|---------------|
| 1 | İnfrastruktur | Otaq sayı, lift, park yeri, ümumi sahələr |
| 2 | Otaq Standartı | Ölçü (m²), mebel keyfiyyəti, iqlim sistemi |
| 3 | Sanitariya | Təmizlik qrafiki, yataq dəyişdirmə tezliyi |
| 4 | Resepsiya | İş saatları, dil bacarıqları, idarəetmə sistemi |
| 5 | Yemək Xidməti | Səhər yeməyi, restoran, bar, otaq xidməti |
| 6 | Personal | Təlim, peşəkarlıq, sertifikatlar |
| 7 | Texnologiya | Wi-Fi, PMS, mobil tətbiq, smart room |
| 8 | Təhlükəsizlik | Yanğın sistemi, kamera, seyf, key card |
| 9 | Əlavə Xidmətlər | SPA, fitness, konfrans, bassein |
| 10 | Sənədləşmə | Vergi, gigiyena arayışı, yanğın sertifikatı |
| 11 | Onlayn Varlıq | Booking, TripAdvisor, TrustYou reytinqi |
| 12 | AHA Hazırlığı | Müraciət sənədləri, rüsum, audit hazırlığı |

Hər kateqoriyada **ulduz dərəcəsinə görə fərqli minimum şərtlər** var. Məsələn:
- Otaq sahəsi, resepsiyanın iş saatları, dil bacarıqları və əlavə xidmətlər ulduz artdıqca sərtləşir — dəqiq rəqəmləri rəsmi meyarlar cədvəlindən yoxlayın.
- **3 ulduz:** otaq ən az 14 m², resepsiya 16 saat işləməli, Wi-Fi sürətli olmalı
- **5 ulduz:** otaq ən az 26 m², 24 saat resepsiya, multilingual personal, premium əlavə xidmətlər

---

## Müraciət Prosesi — 5 Mərhələ

### Mərhələ 1: Sənədlərin Hazırlanması (2-4 həftə)
- Vergi ödəyicisi şəhadətnaməsi
- Gigiyena və epidemiologiya arayışı
- Yanğın təhlükəsizliyi sertifikatı
- Otelin texniki vəziyyəti və təhlükəsizliyi formu
- Personal sağlamlıq kitabçaları

### Mərhələ 2: Onlayn Müraciət
**aha.tourismboard.az** veb-saytında ərizə doldurulur. Rüsumun məbləğini müraciətdən əvvəl rəsmi saytdan dəqiqləşdirin.

### Mərhələ 3: Auditor Ziyarəti (1-2 həftə sonra)
AHA-nın akkreditasiyalı auditoru otelə gəlir, **248 meyarın hamısını yerində yoxlayır**. Bu sürpriz ziyarət deyil — vaxt razılaşdırılır.

### Mərhələ 4: Keyfiyyət və Qərəzsizlik Komissiyası
Auditor hesabatı komissiyaya təqdim edir. Komissiya iddia edilən ulduz dərəcəsinə uyğunluğu qiymətləndirir. Tələblər yerinə yetirilməyibsə — yazılı bildiriş.

### Mərhələ 5: Sertifikat (3 il müddətli)
Uğurlu nəticədə sertifikat verilir, 3 il etibarlıdır. Bu müddət ərzində mütəmadi nəzarət, **TrustYou** beynəlxalq qonaq rəy platforması vasitəsilə xidmət səviyyəsi izlənir.

---

---

## 5 ƏN BƏHALI SƏHV — Müraciətdən Əvvəl Bilməlisiniz

### Səhv 1: İddia Edilən Ulduzdan Yuxarı Vurmaq

Sahibkar deyir: "Otelimə 4 ulduz layiqdir." Auditor gəlir, otaq sahəsi 13 m² — 4 ulduz üçün minimum 16 m² lazımdır. Müraciət rədd edilir, **rüsum geri qaytarılmır**.

**Həll:** İddiadan əvvəl **özünüqiymətləndirmə** ilə real tier müəyyən et. [Otel Hazırlıq Testimiz](/toolkit/otel-hazirlig-testi) bu addımı sistemli edir — 12 sual üzrə hazırlıq balı göstərir.

### Səhv 2: TrustYou Reytinqini Saymamaq

Fiziki şərait qədər qonaq rəyləri də vacibdir — zəif onlayn reytinq ulduz iddiasını zəiflədir. Auditor "şərait varsa belə, qonaq təcrübəsi yoxdur" deyir.

**Həll:** Müraciətdən əvvəl 6-12 ay onlayn reytinq üzərində işləməyə başla. Hər qonaq fikrinə cavab ver, sıxıntıları sistemli həll et.

### Səhv 3: Sənəd Yığımını Sona Saxlamaq

Bir çox sahibkar sənədləşmə işini "audit gələndə hazırlayarıq" düşünür. Gigiyena arayışı 2 həftə, yanğın sertifikatı 3-4 həftə çəkə bilər. Auditor ziyarəti gecikəndə **rüsum yenidən ödənir**.

**Həll:** Müraciətdən **2 ay əvvəl** bütün sənədlər hazır olmalıdır. Şəbəkə list — vergi → gigiyena → yanğın → personal sağlamlıq kitabçaları → otelin texniki vəziyyəti formu.

### Səhv 4: Personal Təliminin Olmaması

3 ulduz tələbi: resepsiya AZ + RU + EN dillərini bilməlidir. 4-5 ulduzda buna **peşəkar geyim, sertifikat və davamlı təlim sistemi** əlavə olunur. Auditor personal ilə birbaşa danışır — formal təlim olmayanda bu açıq görünür.

**Həll:** Müraciətdən 3 ay əvvəl personal təlim proqramı başlamalıdır. Dil kursları, hospitality təlimləri, sertifikatlı təlim mərkəzləri.

### Səhv 5: Yanlış Auditor Hazırlığı

Auditor ziyarətində bəzi sahibkarlar **gizlədir, danır, mübahisə edir**. Bu yanlışdır. Auditorun məqsədi sizi rədd etmək deyil — **uyğunluq nöqtələrini düzəltməyə kömək** etməkdir. Açıq danışmaq, çatışmazlıqları kabul etmək uzun müddətdə qalibiyyət gətirir.

**Həll:** Audit günü əvvəl auditorla məsləhət sessiyası istə. Çatışmaz nöqtələri əvvəlcədən təsbit et, audit zamanı düzəliş planı təqdim et.

---

---

## Otelinizin Hansı Ulduza Hazır Olduğunu Necə Bilmək?

DK Agency-nin **Otel Hazırlıq Testi** 12 sualla (təxminən 4 dəqiqə) milli ulduz meyarlarına əsaslanan ilkin yoxlama aparır. Test sonunda:

- ✅ Otelinizin real ulduz tier-i (pansiyon, 1-2, 3, 4, 5 ulduz)
- ✅ Ən zəif sahənizin təfsilatı
- ✅ Süni intellektlə hazırlanan şəxsi hesabat (nəticəni PNG şəkil kimi yükləmək olar)
- ✅ Pulsuz fərdi məsləhət imkanı

[Otel Hazırlıq Testinə başla →](/toolkit/otel-hazirlig-testi)

---

---

## CHECKLIST — Müraciətdən Əvvəl Bunları Et

| # | Addım | Vaxt | Status |
|---|-------|------|--------|
| 1 | Otel Hazırlıq Testimizdə real tier müəyyən et | 4 dəq | ☐ |
| 2 | Ən zəif 3 sahəni təsbit et | 1 saat | ☐ |
| 3 | Vergi, gigiyena, yanğın sənədlərini yenilə | 4-6 həftə | ☐ |
| 4 | Personal təlim proqramı başlat (dil + hospitality) | 3 ay | ☐ |
| 5 | Booking.com / TripAdvisor reytinqini 7.5+ səviyyəyə qaldır | 6-12 ay | ☐ |
| 6 | PMS (idarəetmə sistemi) qur, kağız qeydiyyatı sonlandır | 1 ay | ☐ |
| 7 | İddia ediləcək ulduz tier-i üçün minimum şərtləri yoxla | 2 həftə | ☐ |
| 8 | aha.tourismboard.az saytında ərizəni doldur | 1 gün | ☐ |
| 9 | Rüsumu ödə (800 AZN-dən başlayır) | 1 gün | ☐ |
| 10 | Auditor ziyarətinə hazırlaş — açıq danış, düzəliş planı təqdim et | Audit günü | ☐ |

---

## Yekun

AHA Milli Ulduz Təsnifatı **bir bürokratik addım deyil** — Azərbaycan otelçiliyinin beynəlxalq görünürlüyə qoşulma sənədidir. 248 meyar sərt görünə bilər, lakin sistemli yanaşma ilə 3-4 ayda real nəticə verir.

Ulduz təsnifatı **sistemli hazırlaşan otel üçün rəqiblərdən fərqlənmək imkanıdır**.

İlk addım: 4 dəqiqəlik testimizdə real tier-inizi müəyyən edin. Sonrası — birlikdə qurarıq.

[Otel Hazırlıq Testinə başla →](/toolkit/otel-hazirlig-testi) | [Pulsuz məsləhət istə →](/elaqe)

---

*Mənbə: AHA (Azərbaycan Hotel Assosiasiyası), Dövlət Turizm Agentliyi rəsmi açıqlamaları, Hotelstars Union 2024 standartları.*
$dkq$, dogan_note = $dkq$Ulduz hazırlığında ən çox vaxt itirən yer sənəd çatışmazlığıdır. Fərq prosesin sistemləşməsindədir. Sahibkar 'mən özüm bacararam' deyəndə adətən rüsum itər, vaxt itər, marka zədələnir. Bu, çoxlu bilik və sənayə təcrübəsi tələb edən prosesdir — amma sistemləşdirilirsə, 3-4 ayda nəticə var.$dkq$, updated_at = now()
WHERE id = 32 AND md5(content_az) = '08d18cba1fb86531ce5cc9b1f50f8ae6' AND md5(coalesce(dogan_note, '')) = 'c1ef4f3557f679f2dcfc0560e2965d61';

-- ai-ile-favok-qorumasi
UPDATE blog_posts SET content_az = $dkq$## Françayz və HoReCa şəbəkələrində qazancı qorumağın yeni yolu

HoReCa-da bir çox sahibkar ciro artımını uğur sayır. Amma 2026-da yalnız ciroya baxmaq təhlükəlidir: satış arta bilər, qazanc azala bilər. Əsas sual: **"Restoran daha çox satır, yoxsa daha sağlam qazanır?"**

Françayz və çoxşubəli modeldə bu daha kritikdir. Bir şöbə 20% FAVÖK (faiz, vergi, amortizasiyadan əvvəlki əməliyyat qazancı) marjası ilə işləyərkən, eyni marka altında digər şöbə 7% ilə işləyə bilər. Problem çox vaxt satışda yox, **görünməyən əməliyyat sızmalarındadır.** Bunları vaxtında görmək üçün artıq Excel kifayət etmir.

---

## 1. FAVÖK-ü aşağı salan əsas faktorlar
Food cost artımı, porsiya sapması, fire/itki nəzarətsizliyi, personal saatlarının pis planlanması, kirayə/kommunal artımı, delivery komissiyaları, ölçülməyən endirimlər, aşağı marjalı məhsulların çox satılması, zəif anbar sayımı.

### Sadə nümunə qutusu
Aylıq 100.000 AZN ciro edən restoran: food cost 32%→37% olarsa 5.000 AZN, personal +2% olarsa 2.000 AZN, ölçülməyən kampaniyalar 3.000 AZN marja itirə bilər. Ciro eyni qalsa belə aylıq **10.000 AZN FAVÖK** itir. Bu "xərc artdı" deyil — **investor dəyərinin azalmasıdır.**

---

## 2. AI HoReCa-da nəyi dəyişir?
AI restoranı idarə etmir — idarəçinin görmədiyi sapmaları daha tez göstərir. Dörd sahədə kömək edir: **anomaliya aşkarlanması** (food cost birdən qalxanda siqnal), **satış/məhsul mix analizi** (hansı məhsul çox satır amma az qazandırır), **personal planlama** (hansı saatda artıq personal var), **proqnozlaşdırma** (mövsüm/hava/satışa görə alış planı).

### Faydalı məlumat qutusu
AI-nin əsl faydası "robot kimi qərar vermək" deyil — **problem böyümədən əvvəl siqnal almaqdır.**

---

## 3. Françayz sistemində AI niyə daha vacibdir?
5-20 şöbəli sistemdə hər şöbənin kirayəsi, personalı, müştərisi, food cost davranışı fərqlidir. Mərkəz bunu eyni sistemdə izləmirsə, problem yalnız aylıq hesabatda görünür — və o zaman gec olur. AI burada **mərkəzi sinir sistemi** kimi işləyir.

### Françayz mərkəzi panelində görünməli 10 göstərici
Şöbə üzrə günlük ciro · FAVÖK marjası · food cost sapması · əməkhaqqı/ciro · ortalama çek · saatlıq satış · ən çox qazandıran məhsullar · fire/zay · müştəri şikayətləri · royalty/reklam ödəniş uyğunluğu.

### Françayz üçün qırmızı bayraq
Françayz verən yalnız royalty alır, amma food cost, xidmət keyfiyyəti, POS datası və müştəri təcrübəsini izləmirsə — bu françayz deyil, **sadəcə ad istifadəsidir.**

---

## 4. AI ilə FAVÖK qoruması necə qurulur?

**1. Data təmizliyi:** məhsul adları standart, resept kartları rəqəmsal, porsiya sabit, təchizat qiymətləri sistemdə. Data qarışıqdırsa, AI səhv nəticə verir.

**2. KPI xəritəsi:** food cost %, labor cost %, prime cost, FAVÖK marjası, ortalama çek, müştəri təkrarlanması, delivery marjası, fire %, məhsul üzrə gross margin.

**3. Erkən xəbərdarlıq:** hər gün — hansı şöbədə food cost normadan çıxıb? hansı məhsul marjanı aşağı salır? hansı şöbədə FAVÖK düşür amma ciro artdığı üçün gizlənir?

**4. Müdaxilə planı:** hər siqnalın qarşısında aksiyon olmalıdır (food cost↑ → resept/porsiya/alış yoxla; labor cost↑ → növbə planı; FAVÖK↓ → 7 günlük operativ audit).

### ⚠️ Vacib qeyd
AI yalnız sizin real məlumatlarınızla işləməlidir — özündən qiymət və ya kampaniya uydurmamalıdır.

### Guru Kutusu
> **İdarəetmədə məşhur bir söz:** "Allaha güvənirik — qalan hamı data gətirsin."
> *(Restoran üçün: hiss yox, ölçülmüş rəqəm.)*

---

## 5. Azərbaycan bazarında tətbiq modeli
**Kiçik başla, düzgün qur.** İlk mərhələdə 3–5 şöbə üçün kifayətdir: POS datasının gündəlik çıxarılması, məhsul üzrə satış analizi, food cost kartlarının yenilənməsi, personal saatlarının satışla müqayisəsi, delivery marjasının ayrıca analizi, şöbə üzrə FAVÖK paneli, həftəlik risk siqnalı.

### Praktik tətbiq qutusu
İlk 5 siqnal: (1) food cost normadan 3% yuxarı, (2) labor cost +2%, (3) ortalama çek 10 gün ardıcıl azaldı, (4) delivery artdı amma marja düşdü, (5) ən çox satılan məhsulun marjası mənfiyə yaxınlaşdı.

---

## Nəticə: AI restoranı yox, marjanı idarə edir
2026-da rəqabət menyu və lokasiyada yox, bu sualın cavabında olacaq: **"Kim marjanı daha tez görür, daha tez qoruyur və daha sistemli böyüdür?"** Cavabı olan françayz sistemi investor üçün daha qiymətlidir.

### Son sual
Restoranınız bu gün işləyir. Bəs sisteminiz sabah siz olmadan da işləyəcəkmi?

---

### Faydalı alətlər
- [KAZAN AI — Restoran süni intellekt köməkçisi →](/kazan-ai)
- [Restoran Audit aləti →](/marketinq/restoran-audit)

## DK Agency necə kömək edir?
DK Agency-nin **KAZAN AI** və **OCAQ** sahibkar paneli məhz bu FAVÖK qoruma sistemini qurur: data görünür hala gəlir, şöbələr müqayisə olunur, risk siqnalları erkən gəlir. AI Restoran Operasiya Audit xidməti ilə hansı sızmanın harada olduğunu göstəririk. *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Şəbəkənizin FAVÖK sağlamlığını ölçmək üçün DK Agency AI audit ilə pulsuz ilkin dəyərləndirmə al.
$dkq$, updated_at = now()
WHERE id = 27 AND md5(content_az) = '7906f7671bf0a1d0f9bb295a01d1b43b' AND md5(coalesce(dogan_note, '')) = 'd41d8cd98f00b204e9800998ecf8427e';

-- menyu-muhendisliyi-satis
UPDATE blog_posts SET content_az = $dkq$---

Menyunda 45 yemək var. Bildin ki hansı 5-i sənə pul qazandırır, hansı 10-u pul itirdirir? Bilmirsən. Çünki menyuya **"yemək siyahısı"** kimi baxırsan, amma əslində menyu **satış alətidir.**

Menyu mühəndisliyi (menu engineering) — hər yeməyi 2 ölçüyə görə qiymətləndirmək: **nə qədər satılır** (populyarlıq) və **nə qədər qazandırır** (mənfəətlilik). Bu iki ölçünü birləşdirəndə 4 kateqoriya yaranır — və sənin hər yeməyin bu 4 kateqoriyadan birindədir.

Bu yazıda sənə bu sistemi sıfırdan öyrədirəm. Heç bir MBA lazım deyil. Kalkulyator və Excel kifayətdir.

---

---

## Menyu Matrisi — 4 kateqoriya

Bu sistemi Boston Consulting Group-un (BCG) məşhur matrisi əsasında restoran sektoru üçün uyğunlaşdırıblar. Hər yeməyin 2 göstəricisi var:

- **Populyarlıq:** Çox satılır, ya az?
- **Mənfəətlilik (contribution margin):** Hər porsiyadan nə qədər qazanc qalır?

Bu iki göstəriciyə görə 4 kateqoriya:

| | Yüksək Mənfəət | Aşağı Mənfəət |
|---|---|---|
| **Çox satılır** | ⭐ ULDUZ (Star) | 🐴 AT (Plowhorse) |
| **Az satılır** | 🧩 PUZZLE (Puzzle) | 🐕 İT (Dog) |

### ⭐ ULDUZ — Çox satılır + Çox qazandırır
Bu, menyunun qəhrəmanıdır. Qorumaq lazımdır. Qiymətini artırma (hələlik), keyfiyyətini düşürmə, menyuda görünən yerdə saxla.

### 🐴 AT — Çox satılır + Az qazandırır
Populyardır, amma sənə az pul qoyur. Strategiya: **ya food cost-unu azalt** (daha ucuz ingrediyent, porsiyon optimallaşdır), **ya qiymətini bir az artır**, ya da **yüksək marjlı yan yeməklə birləşdir** (combo et).

### 🧩 PUZZLE — Az satılır + Çox qazandırır
Pul qazandırır, amma heç kim sifariş etmir. Strategiya: **görünürlüyünü artır** — menyuda daha yaxşı yerə qoy, ofisiant tövsiyə etsin, "şefin seçimi" etiketi yapışdır, sosial mediada tanıt.

### 🐕 İT — Az satılır + Az qazandırır
Nə satılır, nə qazandırır. Strategiya: **öldür.** Menyudan çıxar. Yer tutur, ərzaq ehtiyatı saxlatdırır, mətbəxi yavaşladır. Sentimentallıq etmə — "amma bu bizim klassikimizdir" demə. Əgər satılmırsa və qazandırmırsa — menyuda yeri yoxdur.

---

---

## Addım-addım: Menyu analizini necə etmək?

### Addım 1: Satış datası topla
Son 3 ayın satış hesabatından hər yeməyin **satış sayını** çıxar. POS sisteminiz varsa — bu avtomatikdir. POS yoxdursa — əl ilə saymalısınız (amma ciddi deyirəm, POS alın).

### Addım 2: Hər yeməyin contribution margin-ini hesabla

```
Contribution Margin = Satış qiyməti - Food cost
```

Nümunə:
- Toyuq Sac: Satış 18₼, Food cost 5.43₼ → CM = **12.57₼**
- Qiymə kabab: Satış 14₼, Food cost 6.80₼ → CM = **7.20₼**

### Addım 3: Orta göstəriciləri hesabla
- **Orta populyarlıq:** Bütün yeməklərin toplam satış sayı ÷ yemək sayı
- **Orta CM:** Bütün yeməklərin CM-lərinin ortası

### Addım 4: Hər yeməyi matrisə yerləşdir

| Yemək | Satış (ay) | CM (₼) | Populyarlıq | Mənfəətlilik | Kateqoriya |
|---|---|---|---|---|---|
| Toyuq Sac | 320 | 12.61 | Yuxarı | Yuxarı | ⭐ Ulduz |
| Qiymə kabab | 280 | 7.20 | Yuxarı | Aşağı | 🐴 At |
| Dana medallion | 45 | 18.50 | Aşağı | Yuxarı | 🧩 Puzzle |
| Tərəvəz qratin | 22 | 4.30 | Aşağı | Aşağı | 🐕 İt |

İndi **hər yeməyin strateji planı** var.

---

---

## Menyunun dizaynı — göz hara baxır?

Menyu mühəndisliyinin ikinci hissəsi **vizual yerləşdirmədir.** Araşdırmalar göstərir ki, insanın gözü menyuda müəyyən nöqtələrə **ilk** baxır:

**Tək səhifəli menyu:** Göz ortada başlayır, sonra sağ yuxarı, sonra sol yuxarıya gedir.

**İkiqatlı (bifold) menyu:** Göz sağ səhifənin yuxarı ortasına ilk baxır — burası **"golden triangle"** (qızıl üçbucaq) adlanır. Ən yüksək marjlı yeməkləri **buraya** qoy.

**Üçqatlı (trifold) menyu:** Göz orta panelin yuxarısına ilk baxır.

**Praktik qaydalar:**

1. **Ən qazanclı yeməkləri gözün ilk toxunduğu nöqtəyə qoy** — sağ yuxarı və ya ortanın yuxarısı.
2. **Kutu (box) ilə vurğula.** Ən yüksək marjlı yeməyin ətrafına incə çərçivə çək — göz avtomatik oraya gedir.
3. **"Şefin tövsiyəsi" etiketi qoy.** Bu, puzzle kateqoriyasındakı yeməklər üçün idealdır — qazanclıdır amma az satılır, etiket satışı artırır.
4. **Qiymətləri düzün (sütun halında) yazmayın.** Qiymət sağda düz sütunda yazılırsa, insan ən ucuzunu axtarır. Qiyməti yeməyin təsvirinin sonunda, nöqtəsiz yazın — **diqqəti yeməyə yönəldir, qiymətə yox.**
5. **Valyuta işarəsi (₼) qoyma.** Araşdırmalar göstərir ki, valyuta simvolu insanlara "pul xərcləyirəm" hissini xatırladır. Sadəcə rəqəm yaz: "18" — "18₼" deyil.

---

## Upselling — ofisiant satışı

Menyu mühəndisliyinin üçüncü ayağı **ofisiant satışıdır.** Menyu düzgün qurulub, amma ofisiant "nə istəyirsiniz?" deyib gözləyirsə — mühəndisliyin yarısı itir.

**Ofisiant nə etməlidir?**

- **Puzzle yeməkləri aktiv tövsiyə etsin.** "Şefimizin bu günkü xüsusi seçimi dana medallion-dur, çox tövsiyə edirəm" — bu cümlə **satış cümləsidir.**
- **Desert və içki təklif etsin — HƏR MASAYA.** "Desert istəyirsiniz?" deyil — **"Bu gün cheesecake-imiz əladır, bir paylaşımlıq gətirimmı?"** — konkret, təsvirli, hərəkətə çağıran.
- **Combo (birləşmə) təklif etsin.** "Kabab sifariş etdiniz — yanına içki istəyirsiniz? Ayranımız ev yapımıdır" — cross-selling (çarpaz satış) budur.

---

---

## Menyu ölçüsü — "çox" həmişə "pis"dir

Bakıda çox restoran həddindən artıq uzun menyularla işləyir. Bu, **fəlakətdir.** Niyə?

- **Stok şişir:** 80 yeməyin ingrediyentlərini saxlamaq = böyük anbar, çox soyuducu, çox waste
- **Mətbəx yavaşlayır:** Aşpaz 80 yeməyi yadda saxlaya bilmir, keyfiyyət düşür
- **Müştəri çaşır:** 80 yemək arasında seçim paradoxu (choice paradox) — çox seçim = heç seçə bilməmək = narazılıq
- **Food cost artır:** Az satılan yeməklərin ərzağı xarab olur

**İdeal menyu ölçüsü:**

| Restoran tipi | İdeal yemək sayı |
|---|---|
| Fast-casual | 15-20 |
| Casual dining | 25-35 |
| Fine dining | 12-20 |
| Kafe | 15-25 |
| Kebabçı / xüsusi konsept | 10-15 |

> 📝 **DOĞAN NOTU:** "80 yeməkli menyu görəndə bilirəm ki o restoranda 'hər şeydən bir az' var, amma heç birindən 'yaxşı' yoxdur. Ən yaxşı restoranlar 20-30 yeməklə işləyir — amma hər biri mükəmməldir. Az amma yaxşı > çox amma orta."

---

## Menyu yeniləmə təqvimi

Menyunu bir dəfə hazırlayıb unudursan? **Böyük səhv.**

| Tezlik | Nə etmək |
|---|---|
| **Hər həftə** | Satış datası yoxla — hansı artıb, hansı düşüb? |
| **Hər ay** | Food cost yenilə — qiymətlər dəyişibsə, menyu matrix-i yenidən hesabla |
| **Hər 3 ayda** | Menyu analizi et — itləri çıxar, puzzle-ları tanıt, yeni yemək sına |
| **Hər 6 ayda** | Mövsümi menyu yeniləməsi — yaz/qış menyusu |
| **İldə 1** | Tam menyu auditi — dizayn, qiymətləndirmə, kateqoriya balansı |

---

## MENYU MÜHƏNDİSLİYİ CHECKLIST

| # | Addım | Status |
|---|---|---|
| 1 | Hər yeməyin food cost-unu hesabla (resept kartından) | ☐ |
| 2 | Hər yeməyin contribution margin-ini hesabla | ☐ |
| 3 | Son 3 ayın satış datasını topla (POS-dan) | ☐ |
| 4 | Menyu matrisini qur: Ulduz, At, Puzzle, İt | ☐ |
| 5 | İtləri menyudan çıxar | ☐ |
| 6 | Puzzle-ları menyuda daha görünən yerə qoy | ☐ |
| 7 | Atların food cost-unu optimallaşdır və ya qiymətini artır | ☐ |
| 8 | Ofisiantlara "satılacaq yeməklər" siyahısı ver | ☐ |
| 9 | Menyu dizaynında qızıl üçbucağa ən qazanclı yeməyi qoy | ☐ |
| 10 | Qiymətləri valyuta işarəsiz, sütun halında olmadan yaz | ☐ |

---

> **💡 DK Agency:** Menyu analizini özün etmək çətindir? DK Agency-nin pulsuz [Menyu matrisi](/toolkit/menu-matrix) alətinə satış sayını və food cost-u daxil et — hər yemək üçün addımı göstərir: qoru, qiymətini düzəlt, tanıt və ya çıxar. Menyu optimallaşdırması, qiymətləndirmə strategiyası, ofisiant satış təlimi üçün danışmanlıq xidmətimiz mövcuddur.
>
> 📧 info@dkagency.com.tr | 🔧 [Menyu matrisi](/toolkit/menu-matrix) | 🌐 [Marketinq Ocağı](/marketinq)
$dkq$, updated_at = now()
WHERE id = 10 AND md5(content_az) = 'b71a993745f8a79fd3137605c659c8eb' AND md5(coalesce(dogan_note, '')) = '5c2af37aa453050d840e9efccd7eae07';

-- restoran-markalasma-konsept
UPDATE blog_posts SET content_az = $dkq$---

Sahibkar dizaynerə gedir: "Loqo lazımdır." Dizayner loqo çəkir — gözəl rənglər, şrift, ikon. Sahibkar razıdır. "Markamız hazırdır!" deyir.

**Markası hazır deyil.**

Marka = loqo deyil. Loqo markanın **üzüdür** — amma markanın özü **hissdir.** Müştəri restoranını xatırlayanda nə hiss edir? Nə yadına düşür? Adını eşidəndə hansı emosiya oyanır? **Budur marka.**

Starbucks-ın loqosu sirena — gözəldir. Amma Starbucks-ı Starbucks edən sirena deyil. **"Üçüncü yer" konseptidir** — ev ilə iş arasında rahatlanacağın yer. Bunu Howard Schultz qurdu və dünyanın hər yerində eyni hissi verir.

Sənin restoranın da bir hiss verir — ya bilərəkdən, ya təsadüfən. Bu yazıda o hissi **bilərəkdən yaratmağı** öyrədirik.

---

---

## Marka nədir? 3 səviyyə

### Səviyyə 1: Vizual kimlik (gözlə görünən)
- Loqo, rənglər, şrift
- Menyu dizaynı
- İnteryer, dekor
- İşçi geyimi (uniforma)
- Qablaşdırma, tabela
- Sosial media vizualları

Bu, markanın **ən asan** hissəsidir. Dizayner hazırlayır, bitir.

### Səviyyə 2: Dil və ton (qulağa gələn)
- Müştəri ilə necə danışırsan?
- Sosial mediada hansı dildə yazırsan?
- Menyu təsvirləri necədir — rəsmi? qeyri-rəsmi? zarafatlı?
- Telefona necə cavab verirsən?

**Nümunə:**
- ❌ "Salam, X restoranına zəng etdiniz, sizi necə yönləndirə bilərəm?" (bank deyilsən)
- ✅ "Salam! X restoranından buyurun, nə edə bilərik?" (isti, qeyri-rəsmi)

- ❌ Menyu: "Toyuq filesi 250qr, garnir ilə" (hospital menyusu)
- ✅ Menyu: "Közlənmiş toyuq file — xüsusi ədviyyat qarışığı ilə, kərə yağlı kartof ilə" (hekayə danışır)

### Səviyyə 3: Mədəniyyət və dəyərlər (hiss olunan)
- İşçilər müştəriyə necə yanaşır?
- Problem olanda necə həll olunur?
- Sahibkar nəyə inanır — bu, komandaya necə yansıyır?
- Müştəri çıxanda nə hiss edir?

Bu, markanın **ən çətin**, amma **ən dəyərli** hissəsidir. Bunu dizayner hazırlaya bilmir — bunu **sən** yaradırsan.

---

---

## Marka = Söz vermək

Hər güclü marka bir **söz verir** — və hər dəfə o sözü tutur.

| Marka | Söz | Hər dəfə necə tutur |
|---|---|---|
| McDonald's | Sürətli, sabit, eyni dad | Speedee System, standart resept |
| Starbucks | Rahat "üçüncü yer" | Eyni atmosfer, eyni dil, eyni fincan |
| Ritz-Carlton | Mükəmməl xidmət | "Xanımlar və cənablar" mədəniyyəti |
| Nusret | Show, təcrübə, status | Dramaturji servis, sosial media effekti |

**Sənin restoranın nə söz verir?** Bu suala 1 cümlə ilə cavab verə bilmirsənsə — marka problemindir.

**Nümunələr:**
- "Bakının ən təzə dəniz məhsulları — sakit, ailə mühitində"
- "Sürətli, ucuz, doyurucu — işçi naharı üçün ideal"
- "Azərbaycan mətbəxinin modern interpretasiyası — xüsusi axşamlar üçün"

Bu cümləni yaz. Divara yapışdır. Hər qərarında bu cümləyə bax — menyu, dekor, musiqi, işçi geyimi, sosial media — hamısı bu cümləyə uyğun olmalıdır.

---

---

## Vizual kimliyin 7 elementi

Dizaynerlə işləyəndə bu 7 şeyi tələb et:

### 1. Loqo
- Sadə olsun — kiçik tabletdə, vizitkada, qablaşdırmada oxunmalıdır
- Rəngli və ağ-qara versiyası olmalıdır
- Konseptə uyğun — fast-casual üçün cəsarətli, fine-dining üçün minimal

### 2. Rəng paleti
- Maximum **3-4 əsas rəng**
- Əsas rəng + ikinci rəng + aksent rəng
- Rənglər emosiya yaradır: qırmızı = enerji/iştah, mavi = güvən, yaşıl = təzəlik, qara = lüks

### 3. Tipografiya (şrift)
- Maximum **2 şrift** — başlıq üçün 1, mətn üçün 1
- Oxunaqlı olmalıdır — menyuda, tabelada, sosial mediada

### 4. Fotoqrafiya stili
- Yemək fotoları eyni stildə olmalıdır — işıq, bucaq, fon
- Ən yaxşısı: peşəkar fotoqrafla 1 gün çəkiliş — bütün menyunu çək

### 5. Menyu dizaynı
- Menyu mühəndisliyi yazımızdakı qaydalarla birləşdir
- Vizual kimlik ilə uyğun rənglər, şrift, düzən

### 6. Sosial media şablonları
- Instagram, Facebook postları üçün hazır şablonlar
- Eyni rəng, eyni şrift, eyni stil — tanınırlıq yaradır

### 7. Qablaşdırma dizaynı
- Delivery qabları, salfetlər, paketlər — brendli olsun
- Kiçik stiker belə fərq yaradır

---

---

## Onlayn marka — sosial media strategiyası

2026-cı ildə restoran **sosial mediada yoxdursa — yoxdur.** Amma sosial media = "gündə 1 post" demək deyil. **Strategiya** lazımdır.

### Hansı platforma?
| Platforma | Nə üçün | Nə paylaş |
|---|---|---|
| **Instagram** | Vizual, gənc kütlə | Yemək foto/video, atmosfer, behind-the-scenes |
| **TikTok** | Viral potensial, Z nəsli | Qısa mətbəx videoları, "gün ərzində" formatı |
| **Google Business** | Axtarışda görünmə | Fotoşəkillər, iş saatları, rəylər |
| **Facebook** | 30+ yaş kütlə | Kampaniyalar, tədbirlər, menyu yenilikləri |

### Kontent qaydaları:
- **80/20 qaydası:** 80% dəyər verən kontent (yemək, atmosfer, hekayə), 20% satış (kampaniya, endirim)
- **İnsanları göstər:** Aşpaz işləyərkən, ofisiant gülümsəyərkən — insanlar insanlara baxır
- **Məkan hissi ver:** Video ilə musiqi, işıq, müştərilərin sevinci — "burada olmaq istəyirəm" hissi yarat
- **Rəylərə cavab ver:** Həm müsbət, həm mənfiyə. Mənfiyə peşəkar cavab — markanın imicini qoruyur

---

---

## Ağızdan-ağıza marketinq — Azərbaycanda ən güclü kanal

Bakıda reklam büdcəsi ilə müştəri qazanmaq **çətindir** — çünki insanlar reklama az güvənir. Amma **dostunun sözünə güvənir.** Bu, "Gizli Xərclər" yazımızda danışdığımız "banketdən banket tutmaq" prinsipinin genişlənmiş versiyasıdır.

**Ağızdan-ağıza marketinqi necə gücləndirmək:**

1. **Gözləntini aş.** Standart xidmət tövsiyə gətirmir. **Gözlənilməz** bir şey et — pulsuz kiçik desert, "buyurun çay bizdən", ad günü sürprizi. Will Guidara buna "ağlagəlməz qonaqpərvərlik" deyir.

2. **"Paylaşıla bilən an" yarat.** İnstagram-a çəkiləcək bir boşqab dizaynı, fərqli bir servis tərzi, diqqəti çəkən dekor elementi. İnsanlar bunu çəkir, paylaşır — pulsuz reklam.

3. **Müştəri əlaqəsini davam etdir.** WhatsApp qrupu, sadiqlik kartı, ad günü mesajı — "sən bizim üçün vacibsən" mesajı.

4. **Banketdən banket tut.** "Gizli Xərclər" yazımızdakı qaydaları tətbiq et — 3 gün sonra zəng, VIP kart, növbəti banketdə endirim.

---

## MARKALAŞMA CHECKLIST

| # | Maddə | Status |
|---|---|---|
| 1 | Restoranın 1 cümləlik "söz"ünü yaz | ☐ |
| 2 | Hədəf kütlənin profilini müəyyən et (yaş, gəlir, həyat tərzi) | ☐ |
| 3 | Loqo hazırla (rəngli + ağ-qara) | ☐ |
| 4 | Rəng paleti müəyyən et (maks 3-4 rəng) | ☐ |
| 5 | Şrift seç (maks 2 şrift) | ☐ |
| 6 | Menyu dizaynını brend kimliyi ilə uyğunlaşdır | ☐ |
| 7 | Yemək fotoçəkilişi et (peşəkar) | ☐ |
| 8 | Sosial media şablonları hazırla | ☐ |
| 9 | Google Business profilini yarat/yenilə | ☐ |
| 10 | İşçilərlə "marka dili" təlimi keçir | ☐ |
| 11 | Qablaşdırma materiallarını brendlə | ☐ |
| 12 | Ağızdan-ağıza strategiya planla (referral, VIP, sürpriz xidmət) | ☐ |

---

> **💡 DK Agency:** Restoran markası qurmaq istəyirsən? DK Agency-nin pulsuz [Markalaşma bələdçisi](/toolkit/branding-guide) ilə başla: marka adı, bir cümləlik marka sözü, qonaq, danışıq tərzi və rənglər, sonra 12 addımlıq siyahı.
>
> 📧 info@dkagency.com.tr | 🔧 [Markalaşma bələdçisi](/toolkit/branding-guide) | 🌐 [Marketinq Ocağı](/marketinq)
$dkq$, updated_at = now()
WHERE id = 15 AND md5(content_az) = '8ba64d52770301edfa9a6835417afd7b' AND md5(coalesce(dogan_note, '')) = '51859de75d42a03c5f4cd02a14d122a4';

-- rayonda-ev-kirayesi-sistem
UPDATE blog_posts SET content_az = $dkq$Azərbaycanın rayonlarında — Xınalıqda, Şəkidə, Lənkəranda, Qəbələdə — gözəl evlər var. Mənzərə möhtəşəm, qonaqpərvərlik səmimi, təbiət bənzərsiz. Amma bir problem var: çox ev sahibi evini **yalnız yaxın çevrəsi vasitəsilə** kirayə verir. Nəticədə ev ayda cəmi bir neçə gün dolur, qalan vaxt boş qalır.

Problem evdə deyil — **sistemdə.** Bu yazı rayonda ev kirayəsini necə düzgün quracağını addım-addım göstərir.

---

## 1. Problem: ev var, bilik yox

Rayonda ev sahibi adətən üç sualın cavabını bilmir:

- Evi qonağa necə hazırlamalıyam?
- Düzgün qiymət nə qədərdir?
- Tanımadığım adamı evimə necə təhlükəsiz buraxım?

Bu suallar cavabsız qalanda sahib geri çəkilir, evi boş saxlayır. Halbuki hər üçünün sadə cavabı var.

---

## 2. Evi hazırla — minimum standart

Qonaq lüks gözləmir, amma **təmizlik, təhlükəsizlik və əsas rahatlıq** gözləyir. Minimum dəst:

- Tərtəmiz yataq dəsti və hamam (ən kritik nöqtə — qonaq bunu bağışlamır).
- İsti su və işləyən tualet.
- Soyuq gecələr üçün istilik (soba, kondisioner və ya yorğan-döşək).
- Mümkünsə internet (rayonda belə qonaq bunu axtarır).
- Kiçik mətbəx imkanı və ya səhər yeməyi təklifi.

### Faydalı məlumat qutusu
Kənd evi üçün minimum hazırlıq siyahısı: (1) təmiz yataq + hamam, (2) isti su, (3) istilik, (4) işıq və elektrik təhlükəsizliyi, (5) əsas mətbəx ləvazimatı, (6) aydın "ev qaydaları" vərəqi, (7) ilkin yardım qutusu, (8) qonağın asanlıqla tapması üçün dəqiq ünvan/yol təlimatı. Bu səkkizi hazır olan ev artıq kirayəyə hazırdır.

---

## 3. Düzgün qiymət qoy

Qiyməti "qonşu nə deyir" ilə yox, **müqayisə ilə** qur:

- Eyni bölgədə oxşar evlərin qiymətinə bax (platformalarda axtar).
- Mövsümə görə dəyiş: yay, bayram, festival vaxtı yüksək; ölü mövsümdə endir.
- Təmizlik haqqı və ya depozit qoyursansa, əvvəlcədən aydın yaz.

Çox aşağı qiymət "ucuz, deməli keyfiyyətsiz" təəssüratı yarada bilər; çox yüksək qiymət evi boş saxlayır. Orta, müqayisəli qiymət ən sağlamıdır.

---

## 4. Təhlükəsiz kirayə ver

Tanımadığın adamı evinə buraxmaq qorxulu gəlir — amma sistemlə bu risk azalır:

- **Platforma üzərindən** kirayə ver — qonağın profili, əvvəlki rəyləri görünür.
- Ödənişi mümkünsə qabaqcadan və ya platforma üzərindən al.
- **Yazılı qaydalar** qoy: neçə nəfər, siqaret, səs-küy, ev heyvanı.
- Kiçik **depozit** al (zərər halında).
- Qonşu və ya yaxın bir nəfərlə əlaqə saxla — sən orada deyilsənsə, kimsə açar versin və göz olsun.

---

## 5. Görünürlük — ən vacib addım

Ən gözəl ev belə, görünmürsə, boş qalır. Evi bir neçə platformada eyni anda elan et və təqvimini sinxronla. Bunu necə edəcəyini ayrıca izah etmişik — [**"Bir Elan, On Platforma"** yazımıza bax →](/blog/bir-elan-on-platforma-ev-kirayesi).

Qonağı düzgün qarşılayıb rəyə çevirmək üçün isə [**"İlk 5 Dəqiqə"** yazımıza bax →](/blog/ilk-5-deqiqe-qonaq-qarsilama).

---

---

## Yekun

Rayonda ev kirayəsi şans işi deyil — sistemdir. Evi minimum standarta hazırla, müqayisəli qiymət qoy, platforma üzərindən təhlükəsiz kirayə ver və görünürlüyü qur. Bu dördünü edəndə ev xeyli çox dolur.

**Bu yazı "Başla seriyası — Kirayə" silsiləsinin 3-cü hissəsidir:**
1. [İlk 5 Dəqiqə: Qonağı Kiçik Hədiyə ilə Necə Aşiq Edirsən?](/blog/ilk-5-deqiqe-qonaq-qarsilama)
2. [Bir Elan, On Platforma: Evini Hər Yerdə Eyni Anda Necə Kirayə Verirsən?](/blog/bir-elan-on-platforma-ev-kirayesi)
3. **Bu yazı** — Rayonda Ev Kirayəsini Necə Qurarsan?

---

## DK Agency necə kömək edir?

DK Agency rayon ev sahiblərinə kirayəni sistemə çevirməkdə kömək edir — hazırlıqdan qiymətə, təhlükəsizlikdən rəqəmsal görünürlüyə qədər. [DK Agency alət dəsti](/toolkit) ilə qonaq təcrübəsini ölçülə bilən hala gətir. *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Rayonda evin var, amma necə kirayə verəcəyini bilmirsən? DK Agency ilə pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.
$dkq$, updated_at = now()
WHERE id = 35 AND md5(content_az) = '2b6c61a90914eba2437392f1b0cbe53f' AND md5(coalesce(dogan_note, '')) = '6ce4cd114888c1869ab9d56cdc1a75e7';

-- orta-cek-acik-suallar-ehtiyac
UPDATE blog_posts SET content_az = $dkq$“Orta çek” bir müştərinin restoranda orta hesabla xərclədiyi məbləğdir. Hər sahibkar onu böyütmək istəyir. Amma çox restoran bu mövzuda səhv yola gedir: **daha çox satmağa** çalışır.

Halbuki orta çeki böyüdən şey təzyiq deyil. Orta çeki böyüdən şey **düzgün sual vermək, ehtiyacı anlamaq və qonağa qərar verməkdə kömək etməkdir.**

Yaxşı satış “sırımaq” deyil. Yaxşı satış qonağın masasında çatışmayanı görmək, ehtiyacını oxumaq və doğru anda doğru təklifi verməkdir.

## 1. Səhv yanaşma: “nə qədər çox təklif etsəm, o qədər çox sataram”

Təcrübəsiz ofisiant düşünür ki, nə qədər çox məhsul desə, o qədər çox satış olacaq. Bu, çox vaxt yanlışdır.

Qonaq restorana yalnız yemək yeməyə gəlmir. O, rahat oturmaq, qərar vermək, söhbət etmək və özünü yaxşı hiss etmək istəyir. Ofisiant hər üç dəqiqədən bir yeni məhsul təklif edəndə qonaq bunu xidmət kimi yox, təzyiq kimi hiss edir.

Təzyiqli satışın nəticəsi:

- qonaq narahat olur;
- “mənə nəsə sırıyırlar” hissi yaranır;
- şikayət riski artır;
- bəlkə həmin gün çek böyüyür, amma qonaq geri qayıtmır.

Orta çek yalnız bir masa üçün düşünülməməlidir. Əsas sual budur: **bu qonaq yenə gələcəkmi?**

## 2. Doğru yanaşma: ehtiyacı tap

Yaxşı satış əslində köməkdir.

Ofisiantın işi qonağın cibindən daha çox pul çıxarmaq deyil. Onun işi qonağın təcrübəsini tamamlayacaq ehtiyacı tapmaqdır. Bunu da sual verməklə etmək olur.

Qonağın tələsdiyini, ailəsi ilə gəldiyini, banket sahibi olduğunu, ilk dəfə restoranda olduğunu, menyunu tanımadığını, büdcəyə diqqət etdiyini və ya xüsusi gün keçirdiyini düzgün oxuyan ofisiant satışda daha uğurlu olur.

İnsan ona zorla satılan məhsulu deyil, öz ehtiyacına uyğun təklif edilən məhsulu rahat alır.

## 3. Açıq uclu sual sənəti

Qapalı sual qonağa “yox” demək imkanı verir:

- “İçki istəyirsiniz?”
- “Şirniyyat olsun?”
- “Başqa nəsə lazımdır?”
- “Salat alırsınız?”

Açıq və yönləndirici sual isə qonağı seçim üzərində düşündürür:

- “Bu yeməyin yanında sizə soyuq içki, yoxsa ayran daha uyğun olar?”
- “Ət yeməyinizin yanına yüngül salat, yoxsa isti qəlyanaltı gətirim?”
- “Şirniyyatı yeməkdən sonra təqdim edək, yoxsa çayla birlikdə?”
- “Sizin üçün acılı, yoxsa daha yumşaq dad uyğun olar?”
- “Bu gün daha yüngül yemək istəyirsiniz, yoxsa doyumlu seçim edək?”

Ofisiant qonağı sıxmır; qərar verməsinə kömək edir.

> 💡 **Faydalı məlumat:** Qapalı sualı açıq seçimə çevir. “Su?” yerinə “Suyu qazlı, qazsız, yoxsa otaq temperaturunda gətirim?”; “Şirniyyat?” yerinə “Çayın yanında ən çox seçilən ev şirniyyatımız var, təqdim edimmi?”; “Böyük olsun?” yerinə “Standart porsiya, yoxsa paylaşmaq üçün böyük porsiya hazırlayaq?” Məqsəd qonağı sıxmaq yox, ona rahat seçim yaratmaqdır.

## 4. Müştərini oxu: nə vaxt təklif etməli, nə vaxt susmalı

Yaxşı satışın yarısı danışmaqdırsa, yarısı da susmağı bilməkdir.

### Təklif etmək olar

- Qonaq menyuya uzun baxırsa.
- Qərarsız görünürsə.
- “Siz nə məsləhət görürsünüz?” deyirsə.
- Ailə və ya qrup olaraq paylaşım üçün sifariş verirsə.
- Yeməyin yanında içki, salat və ya əlavə sous çatışmırsa.
- Qonaq xüsusi gün qeyd edirsə.

### Təklif etməmək daha doğrudur

- Qonaq “hamısı budur” deyirsə.
- Qonaq tələsdiyini bildirirsə.
- Qonaq büdcəyə diqqət etdiyini açıq göstərirsə.
- Qonaq artıq bir dəfə “yox” deyibsə.
- Masa gərgin və ya narahat görünürsə.
- Valideyn razılığı olmadan uşağa məhsul təklif etmək lazım gəlirsə.

Yaxşı ofisiant yalnız menyunu bilən deyil; masanın psixologiyasını oxuyandır.

## 5. Azərbaycan reallığı: banket satışında ən böyük risk

Bizim bazarda orta çek mövzusunda ən ciddi risklərdən biri banket və böyük masa sifarişlərində yaranır.

Banket sahibi əvvəlcədən qənaət etmək istəyir: “Az yazın, sonra baxarıq.” Qonaqlar gələndən sonra isə “Masada boşluq qalmasın”, “Qonaqlar nə istəyirsə verin”, “İçkiləri saxlamayın” deyə bilər.

Ofisiant bunu satış imkanı kimi görür. Yemək, içki, əlavə qəlyanaltı, meyvə, şirniyyat və çay artır. Gecənin sonunda isə mübahisə başlayır: “Bu nə hesabdır?”, “Mən bunu deməmişdim”, “Kim icazə verdi?”

Burada problem satış yox, **nəzarətsiz satışdır.**

### Banketdə qızıl qayda

Banketdə hər əlavə sifariş ev sahibi və ya əvvəlcədən təyin olunmuş məsul şəxslə təsdiqlənməlidir:

- banketdən əvvəl bir məsul şəxs seçilir;
- əlavə sifarişlər yalnız həmin şəxsin təsdiqi ilə yazılır;
- kritik mərhələlərdə ev sahibi məlumatlandırılır;
- içki və əlavə yeməklər üçün limit müəyyən edilir;
- gecə sonunda sürpriz hesab çıxmır.

Ofisiantın işi “nə qədər çox yazım” deyil. Onun işi masanı idarə etmək, qonağı razı salmaq və ev sahibini hesabdan xəbərdar saxlamaqdır.

## 6. Riskli qonaq qrupları: hər kəsə eyni satış olmaz

### Uşaqlara təklif

Uşağa birbaşa “Dondurma istəyirsən?” və ya “Şirniyyat gətirim?” demək risklidir. Uşaq “hə” deyə bilər, amma qərarı verən valideyndir.

Doğru yanaşma: “Uşaq üçün yüngül bir seçim istəyirsinizsə, menyuda uyğun variantımız var.” Təklif uşağa yox, valideynə edilir.

### Yaşlı və məhdud büdcəli qonaqlar

Bu qonaqlara qiyməti açıq demək və seçim vermək lazımdır:

- “Daha sadə və münasib seçimimiz də var.”
- “Bu məhsul daha böyük porsiyadır, qiyməti də fərqlidir.”
- “İstəsəniz, paylaşım üçün daha sərfəli variant təklif edə bilərəm.”

Bu, həm satışdır, həm hörmətdir.

### Gənc qonaqlar və hesab riski

Bəzi gənc qonaqlar qarşı tərəfi təsirləndirmək üçün rahat sifariş verir, hesab gələndə çətinlik yaşayır. Personal əlavə sifarişləri təsdiqsiz artırmamalı, bahalı məhsulun qiymətini gizlətməməli və hesab riskini hiss etdikdə menecerə məlumat verməlidir.

Satış yaxşıdır, amma hesabın ödənilməsi riski varsa, bu artıq satış deyil — əməliyyat riskidir.

## 7. Kombo menyu: orta çeki artıran ən sadə sistem

Kombo menyu qonağa tək-tək seçim etdirmək əvəzinə hazır və məntiqli paket təqdim edir:

- burger + kartof + içki;
- qutab seti + ayran + salat;
- səhər yeməyi + çay;
- coffee + kruassan;
- şorba + əsas yemək + kompot;
- dörd nəfərlik ailə seti.

Qonaq “əlavə nə alım?” deyə düşünmür. Restoran onun yerinə məntiqli kombinasiya hazırlayır.

Kombo düzgün qurulmalıdır: qonaq real fayda hiss etməli, məhsullar bir-birini tamamlamalı, qiymət ayrıca almağa nisbətən məntiqli görünməli və personal kombonu sadə izah etməlidir.

Kombo menyu ucuzlaşdırma deyil; **qərar asanlaşdırma və səbətli satış sistemidir.**

## 8. Qiymət psixologiyası: seçim memarlığı qur

Orta çek yalnız ofisiantın danışığı ilə böyümür. Menyu qiymətləndirməsi də satışın bir hissəsidir.

Məsələn:

- Kiçik: 4.50 AZN
- Orta: 5.50 AZN
- Böyük: 6.00 AZN

Müştəri kiçiklə orta arasında bir manat, orta ilə böyük arasında isə yalnız 50 qəpik fərq görür və böyük ölçünü daha məntiqli saya bilər. Restoran qonağı məcbur etmir; seçim arxitekturası qurur.

Bu üsul standart/böyük porsiya, tək məhsul/içkili menyu, sadə/premium səhər yeməyi, klassik burger/burger set və çay/çay + şirniyyat seçimlərində tətbiq oluna bilər.

Əsas prinsip budur: qonaq daha yüksək seçimə keçəndə real dəyər görməlidir.

## 9. “Almaq istəyirsiniz?” ifadəsindən uzaq dur

“Bunu da almaq istəyirsiniz?”, “Şirniyyat alacaqsınız?” və “Əlavə nəsə alırsınız?” kimi cümlələr qonağı müdafiəyə keçirir.

Daha peşəkar ifadələr:

- “Bu yeməyi tamamlayan ən uyğun içki ayrandır, təqdim edim?”
- “Çaydan əvvəl yüngül bir şirniyyat məsləhət görərdim.”
- “Bu porsiya iki nəfər üçün az qala bilər, paylaşım üçün böyük variant daha rahat olar.”
- “Əgər daha doyumlu seçim istəyirsinizsə, bu set daha uyğundur.”
- “Qonaqlarınız gələnə qədər masaya yüngül qəlyanaltı düzək?”

Dilin fərqi satışın nəticəsini dəyişir.

## 10. Şikayətə çevrilməməsi üçün 6 qayda

1. **Bir dəfə təklif et.** Qonaq “yox” dedisə, təzyiq etmə.
2. **Qiyməti gizlətmə.** Bahalı məhsulun qiyməti açıq olmalıdır.
3. **Uşağa yox, valideynə danış.** Qərarı valideyndən al.
4. **Banketdə ev sahibini məlumatlandır.** Əlavə sifariş üçün təsdiq al.
5. **Yaşlı və həssas qonağı sıxma.** Satışdan əvvəl rahatlığı düşün.
6. **Personalı “nə qədər çox yazsan, o qədər yaxşıdır” düşüncəsi ilə yetişdirmə.** Bu yanaşma marka etibarını zədələyər.

## 11. Sahibkar üçün sistem: orta çek təsadüfə buraxılmaz

Orta çek yalnız ofisiantın bacarığına buraxılmamalıdır. Sistem bunları əhatə etməlidir:

- menyu mühəndisliyi;
- kombo menyular;
- qiymət pillələri;
- personal satış təlimi;
- banket əlavə sifariş qaydası;
- şikayət idarəetmə proseduru;
- gündəlik orta çek analizi;
- məhsul üzrə satış hesabatı;
- performans bonus modeli.

Ofisianta “sat” demək kifayət deyil. Ona nəyi, nə vaxt, kimə və necə təklif edəcəyini öyrətmək lazımdır.

## Yekun

Orta çeki böyütmək təzyiq sənəti deyil. Bu, sual vermə, ehtiyacı anlama, seçim qurma və riski idarə etmə sənətidir.

Düzgün satış qonağı narahat etmir; ona daha yaxşı təcrübə yaşadır. Qonağa satma, kömək et. Banketdə əlavə sifarişi nəzarətsiz buraxma. Həssas qonaq qruplarını sıxma. Kombo menyularla qərarı asanlaşdır. Qiymət pillələri ilə seçimi ağıllı qur. Personalı sadəcə xidmətə yox, satış mədəniyyətinə hazırla.

Belə olanda həm orta çek böyüyür, həm şikayət azalır, həm də qonaq geri qayıdır.

> 🔧 **Faydalı alətlər:** Məhsulların satış və mənfəət gücünü [Menyu Matrisi](/toolkit/menu-matrix) ilə ölç; təklif və kombo ssenarilərinin nəticəsini [Başabaş Kalkulyatoru](/toolkit/basabas) ilə yoxla.

## DK Agency necə kömək edir?

DK Agency restoranlara orta çekin artırılmasını təsadüfi satış davranışından çıxarıb sistemə çevirməkdə dəstək verir.

Biz bu mövzuya yalnız “ofisiant nə desin?” sualı kimi baxmırıq. Sistem menyu mühəndisliyi, kombo menyu dizaynı, qiymət pillələndirməsi, banket satış proseduru, salon komandası üçün açıq sual təlimi, şikayət riskinin azaldılması, orta çek və məhsul satış analizi və personal motivasiya modelini birlikdə əhatə edir.

Çünki satış təzyiq deyil. Satış düzgün qurulmuş qonaq təcrübəsinin nəticəsidir.

> **Növbəti addım:** Komandanın satış bacarığını artırmaq və orta çeki sistemli böyütmək istəyirsinizsə, [DK Agency / TQTA təlim proqramları üçün əlaqə saxlayın →](/elaqe).
$dkq$, updated_at = now()
WHERE id = 66 AND md5(content_az) = '069cf3e4ae4f5e19b9e3a5fd2a50d406' AND md5(coalesce(dogan_note, '')) = 'a57364705af66abbe764ba59094c54f2';

-- isci-saxlama-7-strategiya
UPDATE blog_posts SET content_az = $dkq$---

Aşpaz 3 ayda getdi. Ofisiant 2 həftədə. Barmen 6 ayda. Hər dəfə "yaxşı adam idi, amma başqa yerə getdi" deyirsən.

Doğru sual bu deyil: "Niyə getdi?"

Doğru sual budur: **"Niyə qalmalı idi?"**

Əgər bu suala konkret cavab verə bilmirsənsə — problem işçidə deyil. Problem **səndədir.** Daha dəqiq desək — sənin **sistemindədir.** Çünki insanlar işdən getmir, **sahibkardan** gedir. Pis idarəetmədən gedir. Görünməzlikdən gedir. Perspektivsizlikdən gedir.

Azərbaycan HoReCa sektorunda işçi dönüşüm nisbəti (staff turnover rate — işçi axını) dünya ortalamasından çox yüksəkdir. Bakıda bəzi restoranlarda il ərzində komandanın böyük hissəsi dəyişir — yəni **il ərzində bütün komanda 1-1.5 dəfə tamamilə dəyişir.**

Hər gedən işçi sənə **pul itirir:** təlim xərci, verimlilik itkisi, müştəri memnuniyyəti düşüşü, digər işçilərin moral itkisi. Bir ofisiantın yerini doldurmağın xərcini [İşçi saxlama kalkulyatoru](/toolkit/staff-retention) ilə öz rəqəmlərinlə hesabla.

---

---

## Strategiya 1: Düzgün işə götür — "nəfəs alan hər kəs" yanaşmasını burax

Azərbaycanda restoran sahibkarlarının ən böyük səhvi: **möhtac vaxtda işə götürmək.** Ofisiant getdi, sabah lazımdır, ilk gələni götürürsən. Bu, fəlakətin başlanğıcıdır.

Yanlış adam **təkcə pis işləmir** — digər işçilərin motivasiyasını da öldürür. Komandanın ən güclü üzvü, ən zəif üzv səviyyəsinə düşür — çünki "o etmir, mən niyə edim?" düşüncəsi yayılır.

**Necə düzgün işə götürmək:**

- **"Texniki bacarıq" yox, "münasibət" axtar.** Ofisiantlıq öyrədilə bilər, gülümsəmək öyrədilə bilməz. Danny Meyer bunu "hire for attitude, train for skill" (münasibətə görə işə götür, bacarığı öyrət) adlandırır.
- **Sınaq günü tətbiq et.** 1 gün sınaq shift-i — həm sən onu görürsən, həm o mühiti görür. Əvvəlcədən razılaşın, sınaq günü üçün ödəniş olsun.
- **3 sual soruş:** (1) Niyə əvvəlki işindən getdin? (2) Ən çətin müştərini necə həll etdin? (3) Bizim restoranda nə gördün ki gəlmək istədin? — bu 3 sual insanı **açır.**
- **Reference (istinad) yoxla.** Əvvəlki iş yerinə zəng et. Bakıda bunu heç kim etmir — amma etməlisən.

---

---

## Strategiya 2: İlk 2 həftə — ən kritik dövr

İşçi ilk 2 həftədə qərar verir: **qalacam ya gedəcəm.** Bu müddət ərzində onun təəssüratı formalaşır. Əgər ilk gündən "burada heç kim mənə nə isə izah etmədi" hiss edərsə — 1 ayda gedəcək.

**Onboarding (işə başlama) prosesi:**

1. **İlk gün — tour (tur).** Məkanı göstər. Hər bölməni tanıt. İşçilərlə tanış et. "Xoş gəldin" mesajı ver — verbal yox, yazılı olsa daha yaxşıdır.
2. **İlk həftə — mentor təyin et.** Təcrübəli işçi yenisini öz qanadına alır. Suallarını cavablandırır. Bu, "buddy system" (dost sistemi) adlanır.
3. **İlk 2 həftə — cross-training (çarpaz təlim).** Ofisiant mətbəxi görsün, aşpaz zalı görsün. Hər kəs digərinin işini anlasın.
4. **2-ci həftənin sonunda — geribildirim söhbəti.** "Necəsən? Nə çətindir? Nə xoşuna gəlir?" — 15 dəqiqəlik söhbət, amma **saxlama üçün** çox dəyərlidir.

> ⚠️ **Xəbərdarlıq:** İlk gün işçini birbaşa işə salıb "öyrən get" demək — ən yayğın və ən baha başa gələn səhvdir. İlk 2 həftəyə investisiya et — 6 ay sonra geri dönəcək.

---

## Strategiya 3: Maaşdan artıq nə verirsən?

Bakıda "maaş artır, qalar" düşüncəsi var. Maaş vacibdir — amma **tək faktor deyil.** Təcrübədə insanlar iş yerini adətən bu səbəblərə görə tərk edir:

1. **Pis rəhbərlik** (1 nömrəli səbəb — maaş deyil!)
2. İnkişaf imkanının olmaması
3. Tanınmamaq / görünməzlik
4. Maaş narazılığı
5. İş-həyat balansı

Gördün? **Maaş 4-cü yerdədir.** 1 nömrəli səbəb sənin rəhbərlik keyfiyyətindir.

**Maaşdan artıq nə verə bilərsən?**

- **Yemək:** Hər shift-də pulsuz yemək (staff meal — işçi yeməyi). Bu, kiçik xərcdir, amma böyük loyal yaradır.
- **Elastik iş qrafiki:** Mümkün olan yerdə işçinin fərdi ehtiyaclarına uyğunlaşdır — universitet oxuyan ofisiant üçün axşam shift-ləri, övladı olan aşpaz üçün gündüz shift-ləri.
- **Təlim investisiyası:** Barmen kursuna göndər, aşpaza yeni texnika öyrət — insanlar inkişaf etmək istəyir.
- **"Ayın işçisi" tanınması:** Sadədir, amma effektivdir. Divarda şəkli, kiçik bonus, komanda önündə elan.

---

---

## Strategiya 4: Pre-shift meeting — gündəlik 10 dəqiqə

Hər shift-dən əvvəl **10 dəqiqəlik komanda görüşü.** Dünya restoranlarının ən yaxşıları bunu edir — Bakıda isə demək olar ki heç kim etmir.

**Nə danışılır?**

- Bu günkü rezervasiyalar, VIP qonaqlar
- Günün xüsusi yeməyi (əgər varsa)
- Dünənki problem və ya müştəri şikayəti — necə həll etdik?
- Kiçik təlim: "Bu gün hər ofisiant ən azı 1 desert tövsiyə etsin"
- Motivasiya: "Dünən Elvin 8 masa döndərdi — əla iş!"

**Niyə bu qədər vacibdir?**

- Komanda **məlumatlandırılmış** olur — sürpriz azalır, stress azalır
- İşçi özünü **hissənin parçası** hiss edir — təcrid olunmur
- Kiçik problemlər **böyüməmiş** həll olunur
- Gündəlik təlim funksiyası daşıyır — bacarıqlar artır

---

---

## Strategiya 5: Tip (bahşiş) sistemi — şəffaf et

Bakıda tip sistemi xaotikdir. Bəzi yerlərdə tip kassaya gedir, bəzilərində ofisiant özü saxlayır, bəzilərində "pooling" (ortaq bölüşmə) var.

Problem: **İşçi bilmir tip-in nə olacağını.** Bu, narazılıq yaradır. "Kassa götürür" şayiəsi yayılır.

**Həll:**

1. **Tip siyasətini yazılı müəyyən et.** "Tip-lərin 100%-i işçilərə aiddir" və ya "Tip pool: 70% ofisiant, 20% mətbəx, 10% barmen" — nə olarsa olsun, **yazılı** olsun.
2. **Həftəlik tip hesabatı paylaş.** İşçilər bilsin bu həftə nə qədər tip yığıldı, necə bölündü.
3. **Kartla tip imkanı yarat.** Bakıda nağdsız ödəniş artır — tip-in kartla verilə bilməsi lazımdır. POS sisteminiz buna imkan verirmi?

---

## Strategiya 6: İnkişaf yolu göstər — "sonsuza qədər ofisiant" olmasın

İşçi bilir ki 3 il sonra da eyni masaları silkələyəcək? **Gedəcək.**

İnkişaf yolu (career path — karyera yolu) göstər:

```
Stajyer Ofisiant → Ofisiant → Baş Ofisiant → Shift Manager → Restoran Müdiri
```

```
Aşpaz köməkçisi → Hazırlıq aşpazı → Xətt aşpazı → Sous Chef → Aşpazbaşı
```

Hər pilləyə:
- **Müddət:** "Minimum 6 ay bu roldda"
- **Bacarıqlar:** "Bu 5 şeyi öyrənməlisən"
- **Maaş artımı:** Hər pillədə konkret artım
- **Məsuliyyət artımı:** Yeni rolla nə dəyişir

Bunu yazılı şəkildə, **işə qəbul zamanı** göstər. İşçi bilsin ki burada gələcək var.

---

---

## Strategiya 7: Çıxış müsahibəsi — gedəni dinlə

İşçi gedir. Əksər sahibkar "yaxşı yol" deyib unudur. **Böyük səhv.**

**Çıxış müsahibəsi (exit interview)** apar — 15 dəqiqəlik söhbət:

- Niyə gedirsən? (Real səbəbi öyrən, "ailə" cavabına razılaşma)
- Nə dəyişsəydi, qalardın?
- Ən çox nədən narazı idin?
- Komandada kimi ən güclü, kimi ən zəif görürdün?
- Yeni iş yerində nə fərqli olacaq?

Bu cavabları **yaz** və **nümunə axtar.** 3 nəfər eyni səbəbə görə gedirsə — problem sənin sistemindədir.

> 📝 **DOĞAN NOTU:** "3 ofisiant ardıcıl getdi, hamısı 'maaş azdır' dedi. Maaşı artırdıq — 4-cü ofisiant da getdi. Çıxış müsahibəsini ciddi apardıq. Real səbəb maaş deyilmiş — shift manager onlara lazımsız yerə qışqırırmış. Manageri dəyişdik — 6 aydır heç kim getməyib. Problem maaş deyildi, problem idarəetmə idi."

---

## İŞÇİ SAXLAMA CHECKLIST

| # | Addım | Status |
|---|---|---|
| 1 | İşə qəbul prosesini standartlaşdır — sınaq günü, 3 sual, reference | ☐ |
| 2 | Onboarding sistemi qur — ilk gün tour, mentor, cross-training | ☐ |
| 3 | 2 həftəlik geribildirim söhbəti başlat | ☐ |
| 4 | Pre-shift meeting-ə başla — hər gün 10 dəqiqə | ☐ |
| 5 | Tip siyasətini yazılı müəyyən et, şəffaf paylaş | ☐ |
| 6 | Karyera yolu (career path) yaz və işə qəbulda göstər | ☐ |
| 7 | Staff meal sistemi qur | ☐ |
| 8 | "Ayın işçisi" tanınma proqramı başlat | ☐ |
| 9 | Çıxış müsahibəsi hər gedən işçi ilə apar | ☐ |
| 10 | Hər rübdə (3 ayda bir) turnover rate hesabla, trend izlə | ☐ |

---

> **💡 DK Agency:** İşçi saxlama sistemi qurmaq istəyirsən? DK Agency-nin pulsuz [İşçi saxlama kalkulyatoru](/toolkit/staff-retention) işçi dəyişmə faizini, bir işçinin yerini doldurmağın xərcini və ildə itən pulu hesablayır. Kadr auditi, təlim proqramı dizaynı, motivasiya sistemi qurulması üçün danışmanlıq xidmətimiz mövcuddur.
>
> 📧 info@dkagency.com.tr | 🔧 [İşçi saxlama kalkulyatoru](/toolkit/staff-retention) | 🌐 [Marketinq Ocağı](/marketinq)
$dkq$, updated_at = now()
WHERE id = 9 AND md5(content_az) = 'd41c40299b7a7c8d13281860e5533041' AND md5(coalesce(dogan_note, '')) = '2ee9acb273e3f62f90ae7953e6876e40';

-- sertifikatli-komanda-cth-portal-karyera
UPDATE blog_posts SET content_az = $dkq$Əvvəlki yazımızda dedik: xidmətin pis olmasının kökü çox vaxt təlimsiz kadrdadır *(bax: [Peşə Məktəbi Ölkə Məsələsidir](/blog/pese-mektebi-olke-meselesi))*. Bəs həll nədir? Gözləmədən, bu gün **sertifikatlı, izlənə bilən və beynəlxalq standartda kadr** yetişdirmək.

TQTA-da məqsəd təkcə dərs keçmək deyil. Məqsəd tələbənin öyrənməsini, praktikasını, davamiyyətini və karyera yolunu sistemli şəkildə izləməkdir.

## 1. Niyə sertifikat vacibdir?

Sertifikat bir kağız parçası deyil — **standartın sübutudur.** Sertifikatlı işçi:

- Eyni keyfiyyəti hər dəfə təkrarlayır.
- Gigiyena, təhlükəsizlik, servis və əməliyyat qaydalarını bilir.
- İşlədiyi müəssisənin xidmət səviyyəsini sabit saxlayır.
- Komandaya “kim necə öyrənibsə elə işləyir” yox, ortaq standart gətirir.
- İşçinin karyera yolunu görünən və ölçülə bilən hala gətirir.

Yəni sertifikat həm işçinin şəxsi inkişafı, həm də sahibkarın keyfiyyət zəmanətidir.

## 2. CTH nədir?

**CTH (Confederation of Tourism & Hospitality)** — Böyük Britaniya mərkəzli, turizm və qonaqpərvərlik sahəsində beynəlxalq tanınan təhsil və sertifikatlaşdırma qurumudur.

CTH proqramları fərqli səviyyələr üzrə qurulur. Başlanğıc və əməliyyat bacarıqlarından idarəetmə və rəhbərlik kompetensiyalarına qədər mərhələli inkişaf yolu yaradır. TQTA CTH tərəfindən təsdiqlənmiş tədris mərkəzi kimi aşpazlıq, barista bacarıqları, restoran xidməti və turizm-qonaqpərvərlik ingiliscəsi proqramları təqdim edir.

Bu yanaşma nəzəri biliklə praktiki bacarığı birləşdirir. TQTA-da bu standartlar tələbənin real öyrənmə prosesi ilə birlikdə izlənir.

> 💡 **Faydalı məlumat:** CTH-nin rəsmi mərkəz məlumatında TQTA Sumqayıtda Approved Teaching Centre kimi göstərilir. Təklif olunan proqramlar arasında Level 2 Cookery Skills, Level 2 Barista Skills, Level 2 Professional Restaurant Front of House Service və Level 1 English for Tourism and Hospitality yer alır.

## 3. TQTA fərqi: tələbə portalı ilə izlənən təhsil

Bu gün təhsil yalnız sinifdə deyil. Tələbə dərsdən sonra da sistemdə qalmalıdır. TQTA-da bunun üçün tələbə portalı var.

Tələbə portalda:

- Öz dərslərini və modullarını görə bilir.
- Keçdiyi mövzuları izləyir.
- Dərs materiallarına yenidən baxır.
- Audio dərsləri dinləyə bilir.
- Tapşırıqları və gündəlik öyrənmə addımlarını izləyir.
- Öz inkişafını təkcə müəllimdən deyil, sistemdən də görür.

Bu, işləyən və ya vaxtı məhdud olan tələbə üçün böyük üstünlükdür. Çünki öyrənmə yalnız dərs saatı ilə məhdudlaşmır. Tələbə yolda, evdə, fasilədə audio dərsi dinləyib mövzunu təkrar edə bilir.

## 4. Onlayn + üz-üzə: işləyən insan üçün real model

Ən böyük maneə adətən budur: “İşçim işləyir, təlimə vaxtı yoxdur.”

TQTA modeli bunu daha praktik həll edir:

- **Onlayn modullar** — nəzəri hissə portal üzərindən izlənir.
- **Audio dərslər** — tələbə mövzunu dinləyərək təkrar edə bilir.
- **Üz-üzə praktika** — mətbəx, servis və bacarıq tələb edən hissə canlı öyrədilir.
- **Modullu struktur** — tələbə addım-addım irəliləyir.
- **İzlənən inkişaf** — sistem tələbənin harada olduğunu göstərir.

Beləliklə təlim işdən ayrı bir yükə çevrilmir. İşin bir hissəsinə çevrilir.

## 5. Karyera portalı: təlimdən işə gedən yol

Sertifikatlı təhsil yalnız dərs bitirmək deyil. Əsas sual budur: bu tələbə sonra hara gedəcək?

TQTA sistemində karyera tərəfi də ayrıca düşünülüb. Karyera portalı vasitəsilə:

- Tələbənin CV və müraciətləri izlənir.
- İş elanları və uyğunluq prosesi sistemə düşür.
- İşəgötürənlər və tərəfdaş şirkətlər karyera zəncirinə qoşulur.
- Təklif, qəbul və yerləşdirmə mərhələləri izlənə bilir.

Bu, “kurs bitdi, tələbə getdi” modeli deyil. Məqsəd tələbənin təlimdən sonra real iş dünyasına bağlanmasıdır.

Sahibkar üçün də bu vacibdir: o, sadəcə “işçi axtarmır”; təlim keçmiş, izlənmiş və uyğunluğu görünən namizədlə qarşılaşır.

## 6. Kimə uyğundur?

Bu sistem komandanın fərqli həlqələri üçün uyğundur:

- **Aşpaz** — resept, gigiyena, food cost, mətbəx intizamı.
- **Ofisiant** — servis, satış, qonaq təcrübəsi.
- **Otel personalı** — resepsiya, qonaqpərvərlik, əməliyyat qaydaları.
- **Menecer** — komanda idarəetməsi, keyfiyyət nəzarəti, proses qurmaq.

Hər kəs üçün məqsəd eynidir: işi təsadüfə yox, standarta bağlamaq.

## 7. Sahibkara faydası

Sertifikatlı və sistemlə izlənən təhsil sahibkara bir neçə üstünlük verir:

- **Hazır təlimli kadr** — sıfırdan öyrətmə yükü azalır.
- **Stabil keyfiyyət** — kadr dəyişsə belə, standart qalır.
- **İzlənən inkişaf** — tələbənin hansı mərhələdə olduğu görünür.
- **Karyera bağlantısı** — təlim iş dünyası ilə bağlanır.
- **İşçi sadiqliyi** — inkişaf yolu olan işçi özünü daha dəyərli hiss edir.

## Yekun

Sertifikatlı komanda təsadüf deyil — qərardır. CTH standartı, tələbə portalı, audio dərslər, üz-üzə praktika və karyera portalı birlikdə işləyəndə təhsil real nəticəyə çevrilir.

Nəticə: daha hazırlıqlı işçi, daha sabit xidmət, daha güclü müəssisə və daha görünən karyera yolu.

> 🔧 **Faydalı alət:** Mövcud komandanın turnover və inkişaf ehtiyacını ölçmək üçün [İşçi Saxlama alətini aç →](/toolkit/staff-retention).

## DK Agency necə kömək edir?

TQTA (Turan Qastro Turizm Akademiyası) — DK Agency ekosisteminin təhsil qoludur. Burada məqsəd yalnız kurs keçmək deyil; qastro və turizm sektorunda ölçülə bilən, izlənən və karyeraya bağlanan təhsil modeli qurmaqdır.

CTH standartı, tələbə portalı, audio dərslər, praktiki təlim və karyera portalı ilə aşpaz, ofisiant, otel personalı və menecerlərin inkişaf yolunu sistemə bağlayırıq.

Bizim üçün kadr markanın görünməyən təməlidir: *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Komandanı sertifikatlı kadra çevirmək və ya özün sertifikat almaq istəyirsənsə, [TQTA proqramları üçün əlaqə saxla →](/elaqe).

*Qeyd: CTH (Confederation of Tourism & Hospitality) Böyük Britaniya mərkəzli beynəlxalq qonaqpərvərlik təhsil qurumudur.*
$dkq$, updated_at = now()
WHERE id = 37 AND md5(content_az) = 'fe4584b695b1f61f1851fb971c748bff' AND md5(coalesce(dogan_note, '')) = 'da5dd9bb7e575f738b247b820358dfe5';

-- pese-mektebi-olke-meselesi
UPDATE blog_posts SET content_az = $dkq$Restoran sahibindən ən çox eşitdiyim şikayət budur: **“Yaxşı aşpaz, yaxşı garson tapa bilmirəm.”**

Bu cümlə təkcə bir restoranın problemi deyil. Bu, bütün HoReCa sektorunun struktur problemidir. Çünki bazarda kadr var, amma **sistemli hazırlanmış, ölçülə bilən, sertifikatlı və işə hazır kadr** azdır.

Bir restoran işçi götürür, sıfırdan öyrədir, işçi gedir, keyfiyyət yenidən düşür. Bir otel yeni personal qəbul edir, yenidən eyni təlimi verir. Bir kafe barista yetişdirir, sonra həmin əməkdaş başqa yerə keçir. Nəticədə sahibkar davamlı olaraq eyni problemi yaşayır: **kadr tapmaq, kadr yetişdirmək, kadr saxlamaq.**

Bu problem yalnız maaşla, elanla və ya “tanış vasitəsilə işçi tapmaqla” həll olunmur. Çünki məsələ fərdi işçi problemi deyil — **peşə təhsili sisteminin zəifliyidir.**

Ona görə bu mövzu artıq bir restoranın yox, bir sektorun; bir sektorun yox, bir ölkənin məsələsidir.

## 1. Problem: təlimli və sertifikatlı kadr çatışmazlığı

Xidmət niyə dəyişkən olur?

Çünki aşpaz, ofisiant, barista, barmen, housekeeping əməkdaşı və resepsionist çox vaxt işə başlamazdan əvvəl sistemli peşə təlimindən keçmir. Bir çox halda gənc işə daxil olur və peşəni iş yerində öyrənməyə başlayır.

Bu isə üç ciddi nəticə yaradır:

- Sahibkar hər yeni işçiyə zaman və pul xərcləyir.
- Xidmət keyfiyyəti işçinin şəxsi bacarığından asılı qalır.
- Standartlaşma olmadığı üçün qonaq təcrübəsi dəyişkən olur.

Restoran və otel biznesində ən təhlükəli vəziyyət budur: **keyfiyyətin sistemə yox, təsadüfə bağlı qalması.**

Bir gün yaxşı xidmət, bir gün zəif xidmət; bir filialda yaxşı servis, digər filialda qarışıq əməliyyat; bir aşpazla stabil dad, o aşpaz gedəndə dağılan mətbəx sistemi.

Bu problemin kökü işçidə deyil. Kök problem, onu yetişdirən sistemin tam formalaşmamasındadır.

## 2. Türkiyə nümunəsi: “Meslek Lisesi Memleket Meselesi”

Türkiyədə bu mövzuya strateji yanaşan ən güclü nümunələrdən biri Koç Holdinqin başlatdığı **“Meslek Lisesi Memleket Meselesi”** proqramıdır.

2006-cı ildə Koç Holdinq, Türkiyə Milli Təhsil Nazirliyi və Vehbi Koç Vəqfi ilə birlikdə peşə təhsilini sadəcə təhsil layihəsi kimi yox, ölkənin iqtisadi gələcəyi üçün əsas məsələ kimi gündəmə gətirdi.

Bu modelin gücü yalnız verdiyi təqaüddə deyildi. Əsas güc onun sistem qurmasında idi:

- Peşə məktəbləri prosesə daxil edildi.
- Şirkətlər məktəblərlə əlaqələndirildi.
- Şagirdlərə təqaüd, mentorluq və staj imkanları yaradıldı.
- İş dünyası ilə təhsil sistemi arasında real körpü quruldu.
- Peşə təhsili “ikinci dərəcəli seçim” olmaqdan çıxarılaraq iqtisadi inkişafın vacib elementi kimi təqdim edildi.

Koç Holdinqin rəsmi məlumatına görə proqram 264 peşə məktəbini əhatə etdi və 8 mindən çox şagirdə dəstək verdi. Model zamanla **“Məktəb–Müəssisə Əməkdaşlığı”** yanaşması kimi formalaşdı.

Əsas mesaj sadə idi: **Peşə məktəbi yalnız məktəbin məsələsi deyil. Sənayenin, dövlətin və cəmiyyətin ortaq məsələsidir.**

## 3. Koç modelinin sirri nə idi?

Koç modelini uğurlu edən məsələ yalnız böyük şirkət adı deyildi. Model üç dayağın üzərində qurulmuşdu:

### Dövlət

Dövlət məktəbi, təhsil infrastrukturu və rəsmi çərçivəni təmin edir.

### Sənaye

Şirkətlər real iş mühitini, staj imkanını, mentorluğu və gələcək iş imkanlarını verir.

### Vəqf və korporativ dəstək

Təqaüd, davamlılıq, layihə idarəçiliyi və sosial məsuliyyət tərəfi təmin olunur.

> 💡 **Faydalı məlumat:** Koç modelinin gücü dövlət, sənaye və korporativ dəstəyin eyni nəticəyə bağlanmasındadır. Bu tərəflər ayrı işləyəndə təsir məhdud qalır; birlikdə işləyəndə sadə kurs deyil, milli kadr hazırlığı sistemi yaranır.

Bu model Azərbaycan üçün də çox qiymətlidir. Çünki bizim HoReCa və turizm sektorunda problem eynidir: bazar böyüyür, restoranlar artır, otellər genişlənir, qastronomiya turizmi gündəmə gəlir, amma işə hazır kadr bazası eyni sürətlə böyümür.

## 4. Azərbaycan üçün fürsət: kadr məsələsini milli sistemə çevirmək

Azərbaycanda qastronomiya və turizm sahəsi son illərdə daha çox strateji əhəmiyyət qazanır. Regionların turizm potensialı, yerli mətbəxin tanıdılması, qastronomiya marşrutları, xidmət keyfiyyəti və beynəlxalq qonaq təcrübəsi artıq ölkə brendinin bir hissəsinə çevrilir.

Amma bu brendin arxasında insan dayanır.

Ən gözəl restoran konsepti, ən bahalı avadanlıq, ən yaxşı interyer belə zəif xidmətlə dəyərini itirir. Qonaq üçün marka yalnız loqo deyil; onu qarşılayan ofisiant, yeməyi hazırlayan aşpaz, qəhvəni təqdim edən barista, otağı hazırlayan housekeeping əməkdaşı və ilk təəssüratı yaradan resepsionistdir.

Bu səbəbdən Azərbaycanın turizm və qastronomiya hədəfləri üçün kadr hazırlığı artıq ikinci dərəcəli məsələ deyil. Bu, sektorun böyüməsi üçün əsas infrastruktur məsələsidir.

Bu nöqtədə TİKA dəstəyi ilə qurulan Turan Qastro Turizm Akademiyası — TQTA — Azərbaycan üçün real və tətbiq edilə bilən model kimi önə çıxır.

## 5. TQTA: Koç modelinin Azərbaycan üçün praktik tərcüməsi

Turan Qastro Turizm Akademiyası Sumqayıtda qurulmuş müasir qastronomiya və turizm təhsil mərkəzidir. Akademiya TİKA-nın dəstəyi ilə yaradılmış təlim infrastrukturu və sektor tərəfdaşlıqları üzərində fəaliyyət göstərir.

Bu, sadəcə bir kurs mərkəzi deyil. Doğru idarə edildikdə TQTA Azərbaycan üçün **“Məktəb–Sənaye Əməkdaşlığı Sumqayıt Modeli”** ola bilər.

Modelin əsas məntiqi belədir:

- Tələbə peşəni yalnız nəzəriyyə ilə yox, real avadanlıq və praktiki mühitdə öyrənir.
- Sənaye müəssisələri tələbələr üçün staj və təcrübə sahəsi yaradır.
- Sahibkar hazır və sınaqdan keçmiş kadrla tanış olur.
- Gənc işsiz və ya peşə axtaran şəxs bazarın tələb etdiyi bacarıqları qazanır.
- Akademiya isə sektorla dövlət və iş dünyası arasında körpü rolunu oynayır.

Bu model düzgün böyüdülərsə, Sumqayıtdan başlayıb Bakı, Gəncə, Şəki, Qəbələ, Lənkəran, Naftalan və digər turizm bölgələrinə yayıla bilər.

## 6. TİKA-nın rolu: avadanlıqdan daha böyük təsir

TİKA-nın bu layihədə rolu yalnız avadanlıq təmin etmək kimi oxunmamalıdır. Burada daha strateji məsələ var: **Türkiyə təcrübəsinin Azərbaycan peşə təhsili sisteminə transferi.**

Layihə yanaşmasında bu istiqamətlər önə çıxır:

- Turizm və xidmət sektorunda ara kadr ehtiyacına cavab vermək.
- Gəncləri işə hazır bacarıqlarla təmin etmək.
- Aşpazlıq, ofisiantlıq, barista, housekeeping, resepsion və turizm xidmətləri kimi sahələrdə praktiki təlim yaratmaq.
- Təlimi işəgötürənlərlə əməkdaşlıq və məşğulluq imkanları ilə bağlamaq.
- Sumqayıtda qurulan modeli digər bölgələr üçün də tətbiq edilə bilən hala gətirmək.

Bu yanaşma çox vacibdir. Çünki peşə təhsili yalnız dərs keçmək deyil; **məşğulluq, sosial inkişaf, sektor keyfiyyəti və regional iqtisadiyyat** məsələsidir.

TİKA dəstəyi ilə qurulan mətbəx, təlim zalları və praktiki təlim infrastrukturu bu baxımdan bir başlanğıcdır. Əsl dəyər isə bu infrastrukturu davamlı kadr sisteminə çevirməkdədir.

## 7. CTH əməkdaşlığı: yerli təlimə beynəlxalq çərçivə

TQTA-nın digər vacib üstünlüyü CTH — Confederation of Tourism and Hospitality tərəfindən təsdiqlənmiş tədris mərkəzi olmasıdır.

Bu, Azərbaycan üçün iki səbəbdən önəmlidir.

Birincisi, yerli təlim beynəlxalq standartlarla uyğunlaşır. Bu, proqramların yalnız “yerli kurs” kimi yox, daha ölçülə bilən və keyfiyyətə bağlı sistem kimi qurulmasına imkan verir.

İkincisi, məzun üçün sertifikatın dəyəri artır. HoReCa və turizm sektoru getdikcə daha mobil bazara çevrilir. Yaxşı aşpaz, yaxşı barista və yaxşı otel personalı yalnız bir şəhərdə deyil, ölkə daxilində və beynəlxalq bazarda da tələb olunur.

CTH-nin rəsmi mərkəz məlumatında TQTA-nın aşpazlıq, barista bacarıqları, restoran xidməti və turizm-qonaqpərvərlik ingiliscəsi proqramları təqdim etdiyi göstərilir.

Bu baxımdan TQTA modeli Azərbaycan gənclərinə yalnız peşə yox, **karyera yolu** təqdim etməlidir.

## 8. Sahibkara nə düşür?

Dövlətin böyük sistemi qurmasını gözləmək düzgün yanaşma deyil. Sahibkar bu gündən prosesin bir parçası ola bilər.

### 1. Kadrı təsadüfi yox, sistemli yetişdirmək

Yeni işçini sadəcə “yanında öyrənsin” prinsipi ilə buraxmaq doğru deyil. Hər vəzifə üçün standart təlim planı olmalıdır: giriş təlimi, gigiyena, məhsul bilgisi, servis qaydası, satış bacarığı, qonaqla davranış, şikayət idarəetməsi və komanda intizamı.

### 2. Akademiyalarla əməkdaşlıq etmək

TQTA kimi mərkəzlərlə əməkdaşlıq edən sahibkar həm stajyer kadr bazası qazanır, həm də gələcək əməkdaşlarını real iş mühitində tanımaq imkanı əldə edir. Bu, işə qəbul riskini azaldır.

### 3. Sertifikatlı kadrı üstün tutmaq

Sertifikat təkcə kağız deyil. Doğru sistemdə sertifikat işçinin müəyyən standartdan keçdiyini göstərir. Sahibkar üçün bu, işə qəbulda ilkin filtr rolunu oynayır.

> 💡 **Praktik nəticə:** Sertifikatlı və təlimli kadr daha stabil xidmət yaradır. Stabil xidmət daha məmnun qonaq, təkrar satış və daha güclü marka deməkdir.

## 9. Sahibkar üçün iqtisadi məntiq

Kadr hazırlığı çox vaxt xərc kimi görülür. Əslində isə bu, gizli zərərin qarşısını alan investisiyadır.

Təlimsiz kadrın sahibkara yaratdığı xərclər çox vaxt görünmür:

- Yanlış servis səbəbindən itirilən qonaq.
- İsraf edilən məhsul.
- Səhv porsiya və food cost problemi.
- Şikayətlər.
- Komanda daxilində intizamsızlıq.
- Menecerin davamlı eyni problemi həll etməyə sərf etdiyi vaxt.
- Brend reputasiyasının zəifləməsi.

Təlimli kadr isə yalnız işi icra etmir. O, sistemi qoruyur. Sahibkarın qurduğu markanı qonaq qarşısında təmsil edir.

Bu səbəbdən kadr hazırlığı restoran və otel biznesində **xərc maddəsi deyil, risk idarəetmə alətidir.**

## 10. Azərbaycan üçün təklif: Sumqayıt Modelindən Milli Kadr Platformasına

TQTA təcrübəsi daha geniş sistemə çevrilə bilər. Bunun üçün model mərhələli şəkildə qurulmalıdır.

### Birinci mərhələ: Sumqayıt pilot modeli

TQTA-nın mövcud infrastrukturu, tədris mətbəxi, barista və barmen avadanlığı, servis təlimləri və turizm proqramları strukturlaşdırılmalıdır. Hər proqram üzrə nəticə ölçülməlidir: neçə tələbə başladı, neçə nəfər bitirdi, neçə nəfər staj keçdi, neçə nəfər işə yerləşdi.

### İkinci mərhələ: İşəgötürən şəbəkəsi

Restoranlar, otellər, kafelər, turizm şirkətləri və qida istehsalı müəssisələri ilə rəsmi əməkdaşlıq şəbəkəsi qurulmalıdır. Hər müəssisə hansı sahədə neçə stajyer və neçə məzun qəbul edə biləcəyini bildirməlidir.

### Üçüncü mərhələ: Sertifikat və keyfiyyət sistemi

Təlim proqramları yalnız iştirak sertifikatı ilə məhdudlaşmamalıdır. Praktiki imtahan, bacarıq matrisi, işə hazırlıq qiymətləndirməsi və davranış standartları da ölçülməlidir.

### Dördüncü mərhələ: Regional genişlənmə

Model Sumqayıtdan sonra turizm potensialı olan bölgələrə uyğunlaşdırıla bilər. Hər regionun ehtiyacı fərqlidir: Naftalanda sağlamlıq turizmi personalı, Qəbələdə otel və servis kadrları, Şəkidə yerli qastronomiya, Lənkəranda regional mətbəx və turizm bələdçiliyi daha ön planda ola bilər.

### Beşinci mərhələ: Rəqəmsal kadr platforması

Məzunların portfeli, sertifikatları, staj keçdiyi müəssisələr, bacarıq səviyyəsi və işə uyğunluğu rəqəmsal sistemdə izlənməlidir. Bu, sahibkar üçün işə qəbul prosesini sürətləndirər, akademiya üçün isə nəticələri ölçülə bilən edər.

## Yekun

Azərbaycanda HoReCa və turizm sektoru böyüyür. Amma sektorun böyüməsi üçün yalnız yeni restoran, yeni otel və yeni konsept kifayət deyil. Bu böyümənin arxasında sistemli hazırlanmış insan kapitalı olmalıdır.

Koç modelinin Türkiyədə göstərdiyi əsas dərs budur: peşə təhsili yalnız məktəbin işi deyil. Dövlət, sənaye, vəqf, akademiya və sahibkar birlikdə işləməlidir.

TİKA dəstəyi ilə Sumqayıtda qurulan TQTA bu baxımdan Azərbaycan üçün real başlanğıc nöqtəsidir. Bu model düzgün idarə olunarsa, təkcə bir akademiya yox, ölkə miqyasında kadr hazırlığı sisteminin nüvəsinə çevrilə bilər.

Xidmətin kökü kadrdadır.
Kadrın kökü təhsildədir.
Təhsilin gücü isə sistemdədir.

## DK Agency necə kömək edir?

DK Agency və TQTA — Turan Qastro Turizm Akademiyası — HoReCa və turizm sektorunda təlimli, sertifikatlı və işə hazır kadrların yetişdirilməsi üçün çalışır.

Bizim yanaşmamız sadədir: kadr xərc deyil, markanın təməlidir.

TQTA aşpazlıq, qənnadçılıq, ofisiantlıq, barista, barmen, housekeeping, resepsion, turizm və xidmət sahələrində praktiki təlim proqramları ilə gəncləri və mövcud sektor əməkdaşlarını işə hazırlayır. DK Agency isə sahibkarlara bu kadr sistemini restoran, kafe və otel əməliyyatlarına inteqrasiya etməkdə dəstək verir.

Məqsədimiz yalnız kurs keçmək deyil. Məqsədimiz Azərbaycan HoReCa sektorunda ölçülə bilən, davamlı və sertifikatlı kadr ekosistemi qurmaqdır.

> **Növbəti addım:** Komandanı sistemli yetişdirmək və işə hazır kadr bazasına qoşulmaq istəyirsinizsə, DK Agency / TQTA təlim proqramları üçün əlaqə saxlayın.

*Mənbə qeydi: Koç Holdinq “Meslek Lisesi Memleket Meselesi” proqramının rəsmi açıqlamaları; CTH-nin TQTA Approved Teaching Centre məlumatı; TQTA və TİKA dəstəkli akademiya materialları.*
$dkq$, updated_at = now()
WHERE id = 36 AND md5(content_az) = '9a533b63b7fde8f562a26286274f4a26' AND md5(coalesce(dogan_note, '')) = '7d44e4e71d51a78f24078fe7429123ff';

-- azerbaycan-qastronomiya-2030-strateji-yol-xeritesi
UPDATE blog_posts SET content_az = $dkq$Azərbaycan qastronomiyası artıq yalnız “dadlı mətbəx” mövzusu deyil. Bu sahə turizm, ixrac, yerli məhsul, kadr hazırlığı, regional inkişaf və ölkə brendi ilə birbaşa bağlı strateji istiqamətə çevrilir.

Bu baxımdan **“Qastronomiya Turizmi Strateji İnkişaf Planı (2025–2030)”** sənədi sektor üçün önəmli bir yol xəritəsi kimi oxunmalıdır. Sənəd Dövlət Turizm Agentliyinin elan etdiyi strateji hədəflərlə ahəng təşkil edən, dövlət–özəl sektor əməkdaşlığını, assosiasiyaları, sahibkarları və təhsil qurumlarını eyni masa ətrafında düşünməyə çağıran fəaliyyət çərçivəsi kimi dəyərləndirilə bilər.

Bu yazıda sənədə sahibkar gözü ilə baxırıq: restoran, otel, kafe, yerli məhsul istehsalçısı və turizm xidməti göstərən biznes üçün bu yol xəritəsi nə deməkdir?

## 1. Qastronomiya artıq təkcə yemək deyil — ölkə brendidir

Planın əsas fəlsəfəsi sadədir: Azərbaycan mətbəxi yalnız süfrə mədəniyyəti kimi deyil, qlobal turizm məhsulu kimi təqdim olunmalıdır.

Bu yanaşma sahibkar üçün çox vacibdir. Çünki gələcəkdə qastronomiya sahəsində rəqabət yalnız “dadlı yemək” üzərindən getməyəcək. Rəqabət daha geniş olacaq:

- məhsulun hekayəsi,
- xidmət standartı,
- qonaq təcrübəsi,
- yerli irsə bağlılıq,
- sertifikat və keyfiyyət sistemi,
- rəqəmsal görünürlük,
- beynəlxalq tanınma.

Yəni gələcəyin qastronomiya biznesi təkcə mətbəxdə deyil, marka, təcrübə və sistem üzərində qurulacaq.

## 2. Dörd böyük hədəf: sahibkar üçün siqnal

Sənəddə 2030-a qədər iddialı və ölçülə bilən hədəflər göstərilir:

- **beynəlxalq səviyyədə tanınan restoran keyfiyyəti**
- **coğrafi işarə qeydiyyatlarının artırılması**
- **müəssisələrin sertifikatlaşdırılması**
- **işçilərin peşə səviyyəsinin artırılması**

Bu rəqəmlər yalnız makro hədəf deyil. Hər biri sahibkar üçün ayrıca fürsət qapısıdır.

Michelin hədəfi restoranlara deyir ki, beynəlxalq səviyyədə servis, məhsul, təqdimat və davamlı keyfiyyət artıq gündəmə gəlir.

Coğrafi işarə hədəfi yerli məhsul istehsalçılarına deyir ki, Şəki halvası, Lənkəran çayı, Qarabağ mətbəxi, regional pendirlər, mürəbbələr, bal və digər yerli dəyərlər sadəcə məhsul deyil, qorunan brendə çevrilə bilər.

Sertifikatlaşdırma hədəfi HoReCa sahibkarına deyir ki, gələcək bazarda standartı olan müəssisə daha güclü mövqe tutacaq.

290.000 işçinin peşə səviyyəsinin artırılması isə sektorun ən ağrılı yerinə toxunur: kadr.

> 💡 **Faydalı məlumat:** Bu yol xəritəsini oxuyarkən 4 istiqaməti yadda saxlamaq lazımdır: keyfiyyət, coğrafi işarə, sertifikat və kadr. Bunlar sadəcə statistik göstərici deyil; sahibkar üçün gələcək investisiya, təlim, sertifikat və marka qərarlarının istiqamətidir.

## 3. “Beş Duyu” yanaşması: yemək yox, təcrübə satmaq

Planın ən maraqlı tərəflərindən biri qastronomiya turizmini beş duyğu üzərindən qurmasıdır: dad, qoxu, görmə, səs və toxunuş.

Bu yanaşma restoran və turizm sahibkarı üçün çox dəyərlidir. Çünki müasir turist yalnız yemək yemək istəmir. O, hekayə, atmosfer, mədəniyyət və xatirə axtarır.

Məsələn, Lənkəran çayı yalnız stəkanda təqdim olunan içki deyil. O, çay plantasiyasının qoxusu, armudu stəkanın forması, samovarın səsi, çay yarpağının toxunuşu və süfrənin vizual mədəniyyəti ilə birlikdə tam təcrübəyə çevrilə bilər.

Eyni məntiq Şəki halvası, Quba alması, Qarabağ mətbəxi, Naxçıvan məhsulları, Abşeron ənənələri və Bakı restoran konseptləri üçün də keçərlidir.

Sahibkar üçün nəticə sadədir: **Təkcə yemək satma. Təcrübə dizayn et.**

## 4. Küçə yeməkləri: kiçik biznes üçün böyük fürsət

Qastronomiya turizminin ən sürətli böyüyən sahələrindən biri küçə yeməkləridir. Qutab, təndir çörəyi, dönər, peraşki, düşbərə, qutab növləri, şirniyyatlar və regional qəlyanaltılar düzgün standartlaşdırıldıqda turizm məhsuluna çevrilə bilər.

Amma bunun üçün üç şərt vacibdir:

- gigiyena,
- standart resept və porsiya,
- düzgün brend təqdimatı.

Kiçik bir satıcı belə, bu üç məsələni həll etdikdə beynəlxalq turist üçün maraqlı nöqtəyə çevrilə bilər. Burada fürsət yalnız böyük restoranlarda deyil. Əksinə, yerli və kiçik biznes üçün də böyük qapı açılır.

Sahibkar üçün mesaj budur: **Ənənəvi məhsulu sadəcə satma — onu standartlaşdır, paketlə, hekayələşdir və görünən et.**

## 5. Coğrafi işarə: yerli məhsulun hüquqi və ticari dəyəri

Planın əsas istiqamətlərindən biri coğrafi işarələrin artırılmasıdır. Bu, sahibkar üçün çox strateji mövzudur.

Coğrafi işarə yalnız hüquqi qoruma deyil. O, məhsula premium dəyər qazandırır. Müştəri bilir ki, aldığı məhsul konkret coğrafiya, ənənə və keyfiyyətlə bağlıdır.

Bu yanaşma Azərbaycan üçün çox önəmlidir. Çünki ölkənin bölgələrində ciddi məhsul potensialı var:

- Şəki halvası,
- Lənkəran çayı,
- Quba alması,
- Qarabağ mətbəx nümunələri,
- Naxçıvan məhsulları,
- regional bal, pendir, mürəbbə və un məmulatları.

Bu məhsullar sadəcə yerli bazarda satılmamalıdır. Onlar turizm, e-ticarət, ixrac və hədiyyəlik məhsul bazarına çıxarılmalıdır.

Sahibkar üçün nəticə: **Qorunan məhsul daha yüksək qiymətlə satılır. Hekayəsi olan məhsul daha rahat ixrac olunur.**

Bu mövzunu praktik şəkildə davam etdirmək üçün [Coğrafi işarə ilə yerli ləzzəti qoruma bələdçisinə](/blog/cografi-isare-yerli-lezzet) bax.

## 6. Sertifikatlaşma: gələcəyin bazarında seçim meyarı

25.000 müəssisənin sertifikatlaşdırılması hədəfi HoReCa sektoru üçün çox ciddi siqnaldır.

Bu o deməkdir ki, gələcəkdə restoran, kafe, otel və qida xidməti göstərən müəssisələr üçün keyfiyyət standartı daha vacib olacaq. Gigiyena, xidmət, məhsul təhlükəsizliyi, kadr hazırlığı, müştəri təcrübəsi və əməliyyat sistemi artıq daha çox ölçüləcək.

Sahibkar üçün bu, risk deyil — fürsətdir.

Çünki standartı erkən quran müəssisə bazarda daha güclü mövqe tutur. Sertifikatlı biznes həm müştəri qarşısında, həm tərəfdaş qarşısında, həm də turizm ekosistemində daha etibarlı görünür.

Bu gün sistem quran sahibkar sabah sertifikat prosesində çətinlik çəkmir.

## 7. Kadr hazırlığı: planın ən kritik hissəsi

290.000 işçinin peşə səviyyəsinin artırılması hədəfi sektorun əsas problemini göstərir: kadr.

Restoran, otel və kafe sahiblərinin ən böyük çətinliyi keyfiyyətli aşpaz, ofisiant, barista, barmen, housekeeping və resepsion personalı tapmaqdır.

Bu problem yalnız iş elanları ilə həll olunmur. Bunun üçün peşə təhsili, sertifikatlı proqramlar, staj, işəgötürənlərlə əməkdaşlıq və real iş mühiti lazımdır.

Bu nöqtədə TQTA kimi akademiyalar strateji əhəmiyyət daşıyır. Çünki qastronomiya turizmi yalnız yaxşı konseptlə böyümür; yaxşı hazırlanmış insan kapitalı ilə böyüyür.

Sahibkar üçün ən doğru yanaşma budur:

- kadrı təsadüfi seçmə,
- daxili təlim sistemi qur,
- sertifikatlı təlim mərkəzləri ilə əməkdaşlıq et,
- stajyer və məzun bazasını izləməyə başla,
- xidmət standartlarını yazılı hala gətir.

## 8. Dövlət–özəl sektor əməkdaşlığı: masada olmaq lazımdır

Planın ruhunda bir məqam çox aydındır: qastronomiya turizmi yalnız dövlət qurumlarının işi deyil. Burada sahibkarlar, assosiasiyalar, təlim qurumları, istehsalçılar, aşpazlar, dizaynerlər, turizm şirkətləri və yerli icmalar birlikdə işləməlidir.

Sənəddə Dövlət Turizm Agentliyi nəzdində **“Azərbaycan Qastronomiya Turizmi Koordinasiya Şurası”** yaradılması təklifi də bu əməkdaşlıq ehtiyacını göstərir.

Bu, DK Agency üçün də önəmli mövqedir. Çünki gələcək dövrdə uğurlu sahibkar yalnız öz restoranına baxan sahibkar olmayacaq. O, ekosistemin içində yer alan, əməkdaşlığa açıq, standartlara uyğunlaşan və öz markasını ölkə brendi ilə əlaqələndirən sahibkar olacaq.

Bu səbəbdən sahibkarın sualı belə olmalıdır:

“Mən bu strategiyadan necə faydalanaram?” yox, **“Mən bu strategiyanın hansı hissəsində rol ala bilərəm?”**

## 9. Sahibkar bu gün nə etməlidir?

2030 uzaq görünə bilər, amma HoReCa sektorunda hazırlıq vaxt alır. Bu gün başlayan sahibkar üstünlük qazanacaq.

### 1. Müəssisəni standartlaşdır

Resept, porsiya, servis, gigiyena, şikayət idarəetməsi və personal davranışı yazılı standartlara çevrilməlidir.

### 2. Kadrı sistemli yetişdir

Təlimsiz komanda ilə qlobal səviyyəyə çıxmaq mümkün deyil. Kadr hazırlığı büdcə maddəsi deyil, marka investisiyasıdır.

### 3. Yerli məhsulunu hekayələşdir

Məhsulun haradan gəldiyini, kim tərəfindən hazırlandığını, hansı ənənəyə bağlı olduğunu izah et.

### 4. Sertifikat prosesinə hazırlaş

Gələcəkdə standart və sertifikat rəqabət üstünlüyünə çevriləcək. Bu gündən gigiyena, əməliyyat və xidmət sistemini düzəlt.

### 5. Rəqəmsallaş

Onlayn görünürlük, rezervasiya, menyu, müştəri datası, satış analizi və reputasiya idarəetməsi artıq seçim deyil, zərurətdir.

### 6. Təcrübə dizayn et

Qonaq yalnız yeməyi yox, atmosferi, hekayəni, təqdimatı və xatirəni alır.

> 🔧 **Faydalı alət:** Müəssisənin marketinq və əməliyyat boşluqlarını görmək üçün [Restoran Audit alətini aç →](/marketinq/restoran-audit). Marka hekayəsini sistemləşdirmək üçün [Markalaşma bələdçisindən istifadə et →](/toolkit/branding-guide).

## Yekun

Azərbaycan qastronomiyası yerli ləzzətdən qlobal markaya doğru gedə bilər. Bunun üçün yalnız gözəl yeməklər kifayət deyil. Sistemli təlim, sertifikatlaşma, coğrafi işarə, qonaq təcrübəsi, rəqəmsallaşma və dövlət–özəl sektor əməkdaşlığı lazımdır.

Qastronomiya Turizmi Strateji İnkişaf Planı bu baxımdan sahibkar üçün bir xəbərdarlıq və fürsət xəritəsidir.

Kim erkən hazırlaşsa, gələcək bazarda daha güclü mövqe tutacaq. Kim gözləsə, standartlar formalaşanda uyğunlaşmaqda çətinlik çəkəcək.

Yol xəritəsi var. İndi məsələ sahibkarın öz yolunu bu xəritəyə necə bağlamasıdır.

## DK Agency necə kömək edir?

DK Agency HoReCa və qastronomiya sektorunda sahibkarlara bu keçid prosesində dəstək verir: əməliyyat standartları, kadr təlimi, marka yerləşdirməsi, françayz sistemi, yerli məhsulun kommersiyalaşdırılması və rəqəmsal idarəetmə.

TQTA — Turan Qastro Turizm Akademiyası ilə birlikdə isə sektor üçün təlimli və sertifikatlı kadr hazırlığı istiqamətində çalışırıq.

Bizim üçün qastronomiya yalnız yemək deyil. Bu, ölkənin dünyaya açılan mədəni, iqtisadi və turizm qapısıdır.

> **Növbəti addım:** Restoranınızı, kafenizi, otelinizi və ya yerli məhsul markanızı 2030 qastronomiya turizmi dalğasına hazırlamaq istəyirsinizsə, [DK Agency ilə əlaqə saxlayın →](/elaqe).

*Mənbə qeydi: “Azərbaycan Respublikası Qastronomiya Turizmi Strateji İnkişaf Planı (2025–2030)” sənədi və sənəddə göstərilən qastronomiya turizmi hədəfləri.*
$dkq$, updated_at = now()
WHERE id = 38 AND md5(content_az) = 'e6a5a893d97f4439d046b3b136ca690a' AND md5(coalesce(dogan_note, '')) = '698bb6e7dc42139bcc25f187779457fd';

-- garson-satis-upsell-salon-gelir
UPDATE blog_posts SET content_az = $dkq$---

Çox restoran sahibi garsonu "sifariş alan" adam kimi görür. Halbuki yaxşı garson **satışçıdır** — və bir cümlə ilə çeki böyüdə bilər. Heç bir əlavə müştəri, heç bir əlavə reklam xərci olmadan. Bu, salonda gizlənmiş gəlirdir — sadəcə açılmağı gözləyir.

---

## 1. Problem: "sifariş alıcı" garson

Tipik səhnə: müştəri "bir kabab" deyir, garson yazır, gedir. Bitdi. Halbuki həmin anda garson soruşa bilərdi: "Yanında ayran və ya təzə salat istəyirsiniz?" — və çek böyüyərdi.

Garson satış fürsətini görməyəndə, restoran hər masada **pul itirir** — özü də bunu heç hiss etmədən.

## 2. Upsell (yuxarı satış) sənəti

Upsell zorla satmaq deyil — **kömək etmək**dir. Müştəriyə təcrübəsini yaxşılaşdıracaq bir şey təklif etmək:

- **Tamamlayıcı**: "Bu yeməyin yanında ən çox X içkisi sevilir."
- **Premium**: "Adi yox, böyük porsiya alsanız, ikiyə bölüb paylaşa bilərsiniz."
- **Şirniyyat/içki**: yeməyin sonunda "Çay və ya ev şirniyyatımız var, dadmaq istəyərsiniz?"

Hər biri bir cümlə — amma birlikdə çeki ciddi böyüdür.

> ╔══════════════════════════════════════════════════════════╗
> ║ 💡 **5 SADƏ UPSELL CÜMLƏSİ**                            ║
> ║                                                           ║
> ║ 1. "Yanında nə içki gətirim?"                            ║
> ║ 2. "Bu yeməklə ən çox X gedir"                           ║
> ║ 3. "Başlanğıc üçün salat/şorba istəyirsiniz?"            ║
> ║ 4. "Böyük porsiya cəmi bir az fərqlidir, paylaşmaq       ║
> ║     üçün idealdır"                                        ║
> ║ 5. "Sonunda çay və ev şirniyyatımızı dadın"              ║
> ║                                                           ║
> ║ 🔗 Beş cümlə — sıfır xərc.                              ║
> ╚══════════════════════════════════════════════════════════╝

## 3. Doğru an + doğru söz

Upsell-in sirri **zamanlamadır:**

- **Sifariş anında** — tamamlayıcı təklif (içki, başlanğıc).
- **Ana yemək gələndə** — "hər şey qaydasındadırmı?" + kiçik əlavə.
- **Yemək bitəndə** — şirniyyat və çay (ən yüksək qəbul anı).

Söz təbii olmalıdır — əzbər yox, səmimi tövsiyə kimi. Müştəri "satılır" hiss etməməlidir, "qayğı görür" hiss etməlidir.

## 4. Garsonu satışa motivasiya et

Garson niyə satış etsin? Çünki ona dəyər. Sadə motivasiya sistemləri:

- Kiçik bonus (ən çox şirniyyat/içki satan garsona həftəlik mükafat).
- Kiçik yarış (komanda arasında oyunlaşdırma).
- Tanınma (ayın garsonu).

Motivasiya olan garson satır; olmayan sadəcə sifariş alır.

## 5. Aşırıya qaçma — bu, ən vacib qaydadır

Zorla, təkrar-təkrar satış müştərini **qaçırır.** Qayda sadədir: bir dəfə təklif et, "yox" deyilsə geri çəkil. Upsell köməkdir — təzyiq deyil.

---

---

## Yekun

Garson təkcə sifariş daşıyan deyil — restoranın salondakı satış komandasıdır. Doğru anda, səmimi bir tövsiyə ilə çek böyüyür, müştəri təcrübəsi yaxşılaşır və restoran heç bir əlavə xərc olmadan daha çox qazanır. Sirr: kömək et, satma.

---

> 💡 **DK Agency:** Komandanın satış bacarığını artırmaq istəyirsən? DK Agency / TQTA təlim proqramları üçün əlaqə saxla.
>
> 📧 info@dkagency.com.tr | 🌐 [Əlaqə](/elaqe)
$dkq$, updated_at = now()
WHERE id = 39 AND md5(content_az) = '6f958a72b0a8ab82517ed4d7e741a7a2' AND md5(coalesce(dogan_note, '')) = 'a26bf636a6e5099ce70b3918ca44d648';

-- cografi-isare-yerli-lezzet
UPDATE blog_posts SET content_az = $dkq$---

Niyə dünyada "Antep baklavası" adı bu qədər dəyərlidir? Çünki bu ad **qorunur.** Onu yalnız Qaziantepdə, müəyyən üsulla istehsal edən istifadə edə bilər. Bu qoruma məhsulu adi bir şirniyyatdan beynəlxalq markaya çevirir.

Azərbaycanın da belə xəzinələri var — Şəki halvası, Quba alması, Lənkəran çayı, Abşeron zəfəranı. Sual budur: biz də onları qoruyub qızıla çevirə bilərikmi?

---

## 1. Coğrafi işarə nədir?

**Coğrafi işarə** — bir məhsulun müəyyən bir yerlə bağlı adının hüquqi qorunmasıdır. Yəni "Şəki halvası" adını yalnız Şəkidə, ənənəvi üsulla istehsal edən şəxs istifadə edə bilər. Başqa bölgədə hazırlanan halva "Şəki halvası" adı ilə satıla bilməz.

Bu, sadəcə hüquqi formal deyil — bir bölgənin ləzzətini, əməyini və adını **mənimsənilməkdən qoruyan** mexanizmdir.

## 2. Türkiyə nümunəsi: ad qorunanda dəyər artır

Türkiyə bu yolda dünya nümunəsidir. Bu gün Türkiyədə mindən çox qeydiyyatdan keçmiş coğrafi işarə var; təkcə Qaziantep şəhərinin yüzdən çox tescilli məhsulu mövcuddur. Ən simvoliki isə Antep baklavasıdır — Avropa İttifaqında qeydiyyatdan keçən ilk Türk məhsulu oldu.

Nəticə nə oldu? Ad qorunanda:
- Təqlid azaldı, əsl məhsulun dəyəri artdı.
- İxrac qiyməti yüksəldi — "qorunan ad" beynəlxalq bazarda pul deməkdir.
- Bölgə turizm üçün cəlbedici oldu — insanlar "əslini yerində dadmaq" üçün gəldi.

> Bir cümlə ilə: coğrafi işarə bir məhsulu "ucuz qida"dan "qorunan marka"ya çevirir.

## 3. Azərbaycan üçün fürsət

Yaxşı xəbər: Azərbaycan bu istiqamətdə artıq hərəkətə keçib. Qastronomiya turizmi üzrə strateji yanaşmalarda coğrafi işarə qeydiyyatlarının artırılması əsas istiqamətlərdən biridir. Qeydiyyatı **Əqli Mülkiyyət Agentliyi** aparır.

Potensial namizədlərə misal: Şəki halvası, Quba alması, Lənkəran çayı, Abşeron zəfəranı.

> ╔══════════════════════════════════════════════════════════╗
> ║ 💡 **COĞRAFİ İŞARƏ SAHİBKARA NƏ QAZANDIRIR?**           ║
> ║                                                           ║
> ║ 1. Təqliddən hüquqi qorunma                              ║
> ║ 2. Daha yüksək satış qiyməti                             ║
> ║ 3. İxrac üstünlüyü                                       ║
> ║ 4. Turizm cəlbi ("əslini yerində dad")                   ║
> ║ 5. Bölgənin bütöv bir marka kimi tanınması               ║
> ║                                                           ║
> ║ 🔗 Bir məhsul — beş fayda.                               ║
> ╚══════════════════════════════════════════════════════════╝

## 4. İstehsalçı/sahibkar üçün praktik məna

Əgər müəyyən bölgədə ənənəvi bir məhsul istehsal edirsənsə, coğrafi işarə sənin üçün:

- **Qalxan**dır — adını başqası mənimsəyə bilməz.
- **Qiymət gücü**dür — "qorunan əsl məhsul" daha baha satılır.
- **Turizm bağı**dır — qastro turist əsl məhsulu yerində axtarır, sənin bölgənə gəlir.

Yəni coğrafi işarə təkcə bir kağız deyil — bölgə iqtisadiyyatını canlandıran bir alətdir.

## 5. Necə müraciət edilir? (qısa)

Müraciət **Əqli Mülkiyyət Agentliyinə** edilir; məhsul "mənşə adı" və ya "coğrafi göstəriş" kimi qeydiyyatdan keçirilir. Proses bölgə ilə əlaqəni, istehsal üsulunu və ənənəni sənədləşdirməyi tələb edir. Bu, çox vaxt fərdi yox, **bölgədəki istehsalçıların birliyi** tərəfindən aparılır.

---

---

## Yekun

Coğrafi işarə yerli ləzzəti qızıla çevirən mexanizmdir. Türkiyə bunu sübut etdi; Azərbaycan isə dövlət dəstəyi ilə həmin yola çıxıb. Bir bölgədə ənənəvi məhsul istehsal edirsənsə, adını qorumaq — onu beynəlxalq markaya çevirməyin ilk addımıdır.

---

> 💡 **DK Agency:** Yerli məhsulunu və ya markanı qorumağı düşünürsən? DK Agency ilə pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.
>
> 📧 info@dkagency.com.tr | 🌐 [Əlaqə](/elaqe)

*Mənbə: T.C. coğrafi işarə qeydiyyatı statistikası; Azərbaycan Respublikası Qastronomiya Turizmi Strateji İnkişaf Planı (2025-2030); Əqli Mülkiyyət Agentliyi. Bu yazı ümumi məlumatdır, hüquqi məsləhət deyil.*
$dkq$, updated_at = now()
WHERE id = 40 AND md5(content_az) = 'e2b61499deaee801412fcad6269c26f9' AND md5(coalesce(dogan_note, '')) = 'a8dc3bc7b8bfd94d5a0b0682bccf508e';

-- pnl-oxuya-bilmirsen
UPDATE blog_posts SET content_az = $dkq$---

Sahibkar hər axşam kassaya baxır. "Bu gün 3000₼ gəldi" deyir. Sevinclidir. Amma ayın sonunda hesaba baxır — **pul yoxdur.** Harada itdi? Bilmir. Çünki **P&L hesabatı** oxumur. Bəlkə P&L-in nə olduğunu belə bilmir.

Bu, Azərbaycanda yüzlərlə restoranın hekayəsidir. Kassa dolur, cib boşalır. Çünki **gəlir ≠ mənfəət.** Gəlir sənin kassana gələn puldur. Mənfəət isə — bütün xərcləri çıxdıqdan sonra **əlində qalan puldur.** Bu ikisi arasındakı fərqi görməyin **yeganə yolu** P&L hesabatıdır.

---

---

## P&L nədir? 3 cümlə ilə

**P&L (Profit & Loss Statement)** — Gəlir və Xərc hesabatı. Bir müddət ərzində (adətən 1 ay) **nə qədər pul gəldi, nə qədər xərcləndi, nə qədər qaldı** — bunları göstərən bir vərəqdir.

Bu, restoranının **sağlıq kartıdır.** Doktor qan analizinə baxıb "şəkərin yüksəkdir" deyir. P&L-ə baxıb "food cost-un yüksəkdir" deyirsən. Eyni şeydir — amma bu dəfə xəstə restoranındır.

---

## P&L-in quruluşu — ən sadə izah

P&L-i 5 hissəyə bölürük:

### 1. GƏLİR (Revenue / Satışlar)

Kassadan gələn bütün pul. Yeməkdən, içkidən, banketdən, delivery-dən — hamısı.

```
Yemək satışı:         65.000₼
İçki satışı:          15.000₼
Delivery satışı:      12.000₼
Banket gəliri:         8.000₼
─────────────────────────────
TOPLAM GƏLİR:        100.000₼
```

### 2. ƏRZAQ XƏRCİ (COGS — Cost of Goods Sold)

Satılan yeməklərin ərzaq dəyəri. Food cost buraya düşür.

```
Yemək ərzağı:          30.000₼
İçki ərzağı:            4.500₼
Qablaşdırma (delivery): 1.200₼
─────────────────────────────
TOPLAM COGS:           35.700₼
COGS %:                35.7%
```

### 3. ÜMUMİ MƏNFƏƏT (Gross Profit)

```
Gross Profit = Gəlir - COGS
100.000 - 35.700 = 64.300₼ (64.3%)
```

Bu, "xam mənfəət"dir — hələ icarə, maaş, kommunal ödənilməyib.

### 4. ƏMƏLİYYAT XƏRCLƏRİ (Operating Expenses)

Burada hər şey var:

```
İşçi maaşları:         25.000₼  (25%)
İcarə:                 10.000₼  (10%)
Kommunal (elektrik,qaz,su): 3.500₼  (3.5%)
Digər rüsumlar:         1.000₼  (1%)
Marketinq/reklam:        1.500₼  (1.5%)
Təmir/texniki xidmət:      800₼  (0.8%)
Sığorta:                   500₼  (0.5%)
Musiqi lisenziyası:        100₼  (0.1%)
Mühasibat/hüquqi:          600₼  (0.6%)
Digər xərclər:           1.000₼  (1%)
─────────────────────────────
TOPLAM ƏMƏLİYYAT:      44.000₼  (44%)
```

### 5. XALİS MƏNFƏƏT (Net Profit)

```
Net Profit = Gross Profit - Operating Expenses
64.300 - 44.000 = 20.300₼
Net Profit %: 20.3%
```

**Bu rəqəm — 20.300₼ — sənin real qazancındır.** 100.000₼ gəlirdən əlində bu qalır.

> ⚠️ **Xəbərdarlıq:** Yuxarıdakı nümunə ideallaşdırılmışdır. Real həyatda xalis mənfəət faizi çox vaxt bundan xeyli aşağı olur. 20% görürsənsə — çox yaxşı idarə edirsən. 5%-in altındadırsa — təhlükə zonasındasan.

---

## İdeal faizlər — restoranın "sağlam qan dəyərləri"

Bu rəqəmləri yadda saxla — bunlar sənin "normal"ın olmalıdır:

| Xərc maddəsi | İdeal % (gəlirə nisbətən) | Təhlükə həddi |
|---|---|---|
| Food cost (ərzaq) | 28-33% | 38%+ |
| İşçi xərcləri (maaş + DSMF) | 25-30% | 35%+ |
| İcarə | 6-10% | 12%+ |
| Kommunal | 3-5% | 7%+ |
| **Toplam xərclər** | **85-92%** | **95%+** |
| **Net profit** | **8-15%** | **5% altı** |

**Qızıl qayda:** Food cost + İşçi xərcləri = **Prime Cost** (əsas xərc). Bu, gəlirin **55-65%-indən** çox olmamalıdır. 65%-i keçirsə — **xəbərdarlıq.** 70%-i keçirsə — **fövqəladə vəziyyət.**

---

---

## P&L-i necə oxumaq — 5 dəqiqəlik analiz

P&L əlinə gəldi. 5 dəqiqədə nəyə baxmalısan?

**Dəqiqə 1: Food cost %-ə bax.** 33%-dən yuxarıdırsa — mətbəxdə problem var. Resept kartları yoxlanmalı, waste azaldılmalı, firmalar müqayisə olunmalıdır.

**Dəqiqə 2: İşçi xərclərinə bax.** 30%-dən yuxarıdırsa — ya çox adam var, ya əməliyyat effektiv deyil. Shift (növbə) planlamasını yoxla — pik saatlarda çoxmu, sakit saatlarda azmı?

**Dəqiqə 3: Prime Cost-a bax.** Food cost + işçi = 65%-dən yuxarıdırsa — ciddi dəyişiklik lazımdır. Bu iki maddə restoranı batıran əsas amildir.

**Dəqiqə 4: İcarə %-ə bax.** 10%-dən yuxarıdırsa — ya satışları artırmalısan (icarə sabitdir, satış artdıqca % düşür), ya da icarə danışıqlarına girməlisən.

**Dəqiqə 5: Net profit-ə bax.** 8%-dən aşağıdırsa — problemlər yığılıb. Yuxarıdakı maddələrin hansında problem olduğunu artıq bilirsən.

---

---

## P&L-in aylıq müqayisəsi — trend-i gör

Bir aylıq P&L faydalıdır. Amma **əsl güc aylıq müqayisədədir.** 3 ayın P&L-ini yan-yana qoy:

| Maddə | Yanvar | Fevral | Mart | Trend |
|---|---|---|---|---|
| Gəlir | 85.000₼ | 92.000₼ | 88.000₼ | ↗️ sonra ↘️ |
| Food cost % | 32% | 34% | 37% | ⚠️ Artır! |
| İşçi % | 28% | 27% | 29% | → Sabit |
| Net profit % | 12% | 10% | 6% | 🔴 Düşür! |

Bu cədvəldən görürsən: gəlir sabit qalıb, amma food cost **5 faizdə** artıb (32%→37%). Nəticədə net profit **yarıya** düşüb (12%→6%). Problem **mətbəxdədir** — ərzaq xərci artır, ya firmalar bahalaşıb, ya waste artıb, ya porsiyon böyüyüb.

**Bunu görmədən — "hər şey yaxşıdır" deyirsən.** P&L ilə — problemi 1 ayda görürsən, 2-ci ayda həll edirsən, 3-cü ayda kassa düzəlir.

---

---

## "Amma mənim muhasibçim var" — yetərli deyil

Muhasibçi **vergi** üçün işləyir. O, sənin vergini düzgün hesablayır, DSMF-ni ödəyir, deklarasiyanı verir. Amma muhasibçinin işi **sənin restoranının gəlirliliyini artırmaq deyil.**

P&L-i oxumaq **sənin** işindir. Çünki:
- Muhasibçi food cost-un niyə artdığını bilmir — sən mətbəxi tanıyırsan
- Muhasibçi işçi effektivliyini ölçmür — sən shift-ləri bilirsən
- Muhasibçi menyu dəyişikliyi təklif etmir — sən müştərini tanıyırsan
- Muhasibçi firma müqayisəsi etmir — sən ərzağı bilirsən

**Muhasibçi sənə rəqəm verir. Sən o rəqəmi oxuyub qərar verirsən.** Bu ayrı-ayrı işlərdir.

---

## P&L — aylıq yox, həftəlik bax

Dünya standartı: **aylıq** P&L. Amma Bakıda, xüsusilə yeni açılan restoranlar üçün tövsiyəm: **həftəlik mini P&L.**

Tam P&L deyil — sadələşdirilmiş versiya:

```
Bu həftə:
├── Gəlir:           18.500₼
├── Ərzaq alışları:    6.200₼  (33.5%)
├── İşçi xərcləri:    5.100₼  (27.6%)
├── Prime Cost:       11.300₼  (61.1%) ✅
└── Digər sabit:       4.500₼
    ────────────────────
    Həftəlik nəticə:   2.700₼  (14.6%) ✅
```

Bu, 5 dəqiqəlik hesablamadır. Hər bazar günü otur, bu rəqəmləri yaz. **4 həftə yaz — trend-i görəcəksən.** Problemlər aylıq P&L-i gözləmədən, **həftələr əvvəl** görünəcək.

---

---

## P&L CHECKLIST — Bu Ay Başla

| # | Addım | Status |
|---|---|---|
| 1 | Muhasibçidən son 3 ayın P&L-ini istə | ☐ |
| 2 | Food cost %-ni yoxla (33%-dən yuxarıdırsa — "Food Cost" yazımıza bax) | ☐ |
| 3 | Prime Cost-u hesabla (Food + İşçi, 65%-dən aşağı olmalı) | ☐ |
| 4 | İcarə %-ni hesabla (10%-dən aşağı olmalı) | ☐ |
| 5 | Net profit %-ni hesabla (8%+ olmalı) | ☐ |
| 6 | 3 ayın trend-ini müqayisə et — artıb, azalıb? | ☐ |
| 7 | Həftəlik mini P&L-ə başla — hər bazar günü 5 dəqiqə | ☐ |
| 8 | Prime Cost 65%-i keçirsə — fövqəladə görüş: mətbəx + maliyyə | ☐ |

---

> **💡 DK Agency:** P&L şablonunu hazır istəyirsən? DK Agency-nin pulsuz [Mənfəət və zərər hesabatı (P&L)](/toolkit/pnl) alətində ayın satış və xərclərini yaz — xalis mənfəəti və əsas xərci görəcəksən. Üzvlər üçün 12 aylıq P&L Excel şablonu da var ([Excel şablonları](/toolkit/excel-sablonlar)). Aylıq maliyyə auditi, food cost optimallaşdırması, büdcə planlaşdırması üçün danışmanlıq xidmətimiz mövcuddur.
>
> 📧 info@dkagency.com.tr | 🔧 [P&L aləti](/toolkit/pnl) | 🌐 [Marketinq Ocağı](/marketinq)
$dkq$, updated_at = now()
WHERE id = 8 AND md5(content_az) = 'cf36b5f4137f02c37c2bbc5a0cd2b38e' AND md5(coalesce(dogan_note, '')) = 'cdaed058c9cce09296d1049e1e3a8960';

-- isiq-qoxu-musiqi-ayrilma-ani
UPDATE blog_posts SET content_az = $dkq$*Seriya: Məkan pul qazandırırmı? — 3/3*

---

Bir restorana girirsən. Yemək dadlıdır, qiymət normaldır. Amma 40 dəqiqədən çox otura bilmirsən: göz yorulur, baş ağrıyır, içində səbəbsiz tələsiklik var. Hesabı istəyib çıxırsan.

Başqa bir yerə çay içməyə girirsən — saat yarım keçir, fərqinə varmırsan. Bir qəhvə də, bir desert də sifariş edirsən.

Fərq aşpazda deyil. **Fərq işıqda, qoxuda, səsdə və son təəssüratdadır.** Qonaq yeməkdən əvvəl bunları «yeyir».

[1-ci yazıda](/blog/memarla-ortaq-dil-restoran-konsepti) məkanın 7 dayağını, [2-ci yazıda](/blog/qonaq-ve-isci-axini-zal-trafiki) axını danışdıq. Bu yazıda qalan üç dayağı — **işıq, hiss və ayrılma** — açırıq.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DOĞAN TOMRİS**                                      ║
> ║ DK Agency qurucusu, 40 illik HoReCa təcrübəsi            ║
> ║                                                          ║
> ║ *"İşıq yeməyin duzu kimidir. Çox olanda gözü yandırar,    ║
> ║  az olanda zülmət olar, səhv rəngdə olanda ən bahalı      ║
> ║  steyki boz göstərər."*                                   ║
> ║                                                          ║
> ║ 📖 Sahə qeydi                                             ║
> ╚══════════════════════════════════════════════════════════╝

---

## 1. İşığın üç qatı

Təcrübəsiz layihədə tavana bərabər aralıqla iyirmi soyuq ağ lampa düzülür və iş bitmiş sayılır. Bu, restoran deyil — əməliyyat otağıdır.

```
[1. ÜMUMİ İŞIQ]  ──► zalın yumşaq fonu, gözə birbaşa vurmur
[2. MASA İŞIĞI]  ──► boşqabın ortasına düşən isti, dar işıq
[3. VURĞU İŞIĞI] ──► şərab dolabını, barı, daş divarı göstərən spot
```

1. **Ümumi işıq:** gizli karnizlərdən, divar apliklərindən gələn yumşaq fon. Axşam azalır — **tənzimləyici (dimmer)** vacibdir.
2. **Masa işığı:** hər masanın üstündə, **qonağın gözünə yox, boşqabın ortasına** düşən isti işıq. Lampanın **rəng ötürmə göstəricisi (CRI) 90-dan yuxarı** olsun — ət, pomidor, göyərti öz rəngində görünsün. Ucuz lampa steyki boz göstərir.
3. **Vurğu işığı:** şərab kolleksiyası, vitrindəki desert, daş divar. Göz ən parlaq nöqtəyə gedir — oranı sən seç.

**Qonaq zalı** üçün isti işıq (**2700–3000K**). **Mətbəx başqadır:** orada aşpazın yeməyin rəngini düzgün görməsi üçün neytral, güclü iş işığı lazımdır.

**Uzaqdan fərq edilmək** üçün fasad və lövhə işığı — [1-ci yazıda](/blog/memarla-ortaq-dil-restoran-konsepti).

---

## 2. İmza qoxu

Qapıdan girən qonağın burnuna gələn ilk qoxu bütün təcrübəni rəngləyir.

**Qadağandır:** döşəmə yuyan xlor, tualet təmizləyicisi, köhnə qızartma yağı, ağır kimyəvi otaq ətri.

**Seç:** konseptinə uyğun **bir** təbii istiqamət:
- kafe, şirniyyat: təzə üyüdülmüş qəhvə, şokolad, vanil;
- çörək, pizza: təzə bişmiş xəmir;
- premium restoran: odun kömürü, təzə göyərti.

**Necə:**
- Qəhvə dəyirmanını, fırını, vitrini **girişə və zala yaxın** qoy — qoxu təbii yayılsın.
- Havalandırma elə qurulsun ki, **tualet və qabyuyan havası zala qayıtmasın.**
- Qoxu üçün mətbəx sorucusunu küçəyə, qapı önünə yönləndirmə — qonşu, sanitar və yanğın normaları problemi yaradır. Bunu layihəçi ilə həll et.

---

## 3. Musiqi: gün hissəsinə görə temp

Musiqi boşluq dolduran səs deyil, **məkanın ritmidir.**

Real araşdırma var: Ronald Milliman 1986-cı ildə bir restoranda yavaş və sürətli fon musiqisini müqayisə edib. **Yavaş musiqidə qonaqlar masada daha uzun qalıb və bar hesabı artıb;** yemək xərci isə demək olar dəyişməyib (*Journal of Consumer Research*, 1986).

Buradan çıxan praktik qayda:
- **Nahar:** templi, enerjili musiqi — qonaq tələsdirilmir, amma masa ləngimir.
- **Günorta ölü saatlar:** sakit, fon musiqisi.
- **Axşam:** yavaş caz, akustik, sakit — qonaq rahatlaşır, ikinci içkini, deserti sifariş edir.
- **Səs səviyyəsi:** qonaq qarşısındakı ilə qışqırmadan danışa bilməlidir.
- Musiqini işçinin zövqünə buraxma. Hər gün hissəsi üçün hazır siyahı olsun. Gün hissələrinin özünü [bu yazıda](/blog/gun-hisseleri-olu-saatlar-gelir) açmışıq.

---

## 4. Toxunma: qabın ağırlığı

Oksford Universitetindən Çarlz Spens və həmkarlarının araşdırmaları göstərir ki, **ağır qab və ağır çəngəl-bıçaqla verilən yemək daha keyfiyyətli qəbul edilə bilər.**

- Bahalı steyki yüngül, əyilən çəngəllə vermə.
- Qəhvəni nazik birdəfəlik stəkanda deyil, qalın divarlı, isti saxlayan fincanda ver.
- Menyunun kağızı, masanın səthi, stulun oturacağı — hamısı qonağa qiymət haqqında bir şey deyir.

---

## 5. Ayrılma anı: zirvə-son qaydası

Nobel mükafatı laureatı psixoloq **Daniel Kahneman** və həmkarları göstərib ki, insan bir təcrübəni bütöv yox, **əsasən iki an üzrə** xatırlayır və qiymətləndirir: **ən güclü an** və **son an** (*peak-end rule*).

Yemək nə qədər əla olsa da, sonda:
- hesab 15 dəqiqə gəlmirsə,
- kassa önündə növbə və sıxlıq varsa,
- çıxışda heç kim «sağ olun, yenə gözləyirik» demirsə,
- qarderobda palto gözlənilirsə —

qonağın yaddaşında restoran «yorucu yer» kimi qalır.

**Yaxşı ayrılma:**
- **Sürətli ödəniş:** hesab istəndikdən 2–3 dəqiqə ərzində bağlansın; masada kartla ödəniş imkanı olsun.
- **Son isti toxunuş:** qapıda təbəssüm və təşəkkür; kiçik şokolad, uşağa kiçik hədiyyə.
- **Yumşaq çıxış işığı:** qapıda qəfil parlaq ağ işıq olmasın — qonaq zalın ab-havasından küçəyə yumşaq keçsin.
- **Son marka mesajı:** çıxan hər qonağın ağlında bir şey qalsın — bir cümlə, bir dad, bir jest.

---

## YOXLAMA SİYAHISI — Məkanın hissi

| # | Sahə | Yoxla | Status |
|---|---|---|---|
| 1 | İşıq rəngi | Qonaq zalında isti işıq (2700–3000K); mətbəxdə ayrıca iş işığı | ☐ |
| 2 | Masa işığı | İşıq qonağın gözünə yox, boşqaba düşür | ☐ |
| 3 | Tənzimləyici | Axşam ümumi işıq azaldılır | ☐ |
| 4 | Qoxu | Girişdə kimyəvi yox, imza qoxu hiss olunur | ☐ |
| 5 | Havalandırma | Tualet və qabyuyan havası zala qayıtmır | ☐ |
| 6 | Musiqi | Hər gün hissəsi üçün ayrı siyahı var | ☐ |
| 7 | Ödəniş | Hesab istəndikdən 2–3 dəqiqəyə bağlanır | ☐ |
| 8 | Son təəssürat | Çıxan hər qonağa təşəkkür edilir | ☐ |

---

> 📝 **DOĞAN NOTU:** "Qonaq çıxarkən dönüb bir də restorana baxırsa, təbrik edirəm — qarın doyurmadın, iz qoydun. O qonaq qayıdacaq. Qapıdan qaçaraq çıxırsa, deməli sən məkanı yox, məkan səni idarə edir."

---

> **💡 DK Agency:** Markanın hiss və dil standartları üçün [Markalaşma bələdçisi](/toolkit/branding-guide). Qonaq təcrübəsinin keyfiyyət nişanı — [ŞEDD Rozeti](/sedd-rozeti).
>
> 🌐 dkagency.com.tr | 📍 Bakı, Azərbaycan
$dkq$, updated_at = now()
WHERE id = 158 AND md5(content_az) = '7b47c256b8e7db42e34903f9f42372b0' AND md5(coalesce(dogan_note, '')) = 'd41d8cd98f00b204e9800998ecf8427e';

-- aqta-cerime-checklist
UPDATE blog_posts SET content_az = $dkq$---

Bir gün AQTA (Azərbaycan Qida Təhlükəsizliyi Agentliyi) müfəttişi qapıdan içəri girir. Xəbərdarlıq etmir. Proqramına uyğun gəlir. Yoxlama aparır. Və sən **cərimə ilə qalırsan** — çünki hazır deyildin.

Bu, Bakıda hər gün baş verir. Sahibkar "sonra düzəldərik" deyir, sonra isə cərimə yazılır. Bəzən fəaliyyət dayandırılır. Ən pis halda — **obyekt bağlanır.**

Bu yazıda AQTA-nın nəyə baxdığını, hansı pozuntulara cərimə yazdığını və sənin restoran/kafe/çay evinin tam hazır olması üçün nə etməli olduğunu bir-bir yazıram. Checklist-i çap et, divara yapışdır.

---

---

## AQTA nəyə baxır? 8 əsas sahə

### 1. Ərzaq saxlama şərtləri

- **Soyuducu temperaturu:** +2°C ilə +6°C arasında olmalıdır. Müfəttiş termometr ilə yoxlayır.
- **Dondurucu temperaturu:** -18°C və aşağı.
- **Çiy və hazır ərzaq ayrı saxlanmalıdır.** Çiy toyuq hazır salatın üstünə damcılayırsa — cərimə.
- **Ərzaqlar yerdən minimum 15-20 sm yuxarıda** olmalıdır — rəfdə, paletdə.
- **FIFO (First In, First Out) qaydası:** Köhnə ərzaq öndə, yeni arxada. Tarix etiketi hər qabın üstündə.
- **Son istifadə tarixləri:** Vaxtı keçmiş ərzaq tapılarsa — ciddi pozuntu.

> ⚠️ **Xəbərdarlıq:** Soyuducunun temperaturu düzgün olsa belə, **qapısı sıx bağlanmırsa** — temperatur dəyişir, ərzaq xarab olur, cərimə yazılır. Soyuducu qapısının contasını mütəmadi yoxlayın.

### 2. Şəxsi gigiyena

- **Tibbi arayış:** Hər işçinin aktual tibbi arayışı olmalıdır. Müfəttiş soruşur, göstərə bilmirsənsə — cərimə.
- **İş geyimi:** Təmiz, açıq rəngli, üstü qapalı. Mətbəx işçisinin **baş örtüyü (bone)** olmalıdır.
- **Əl yuma:** Mətbəxdə əl yuma lavabosu ayrı olmalıdır (ərzaq yuma lavabosu ilə eyni olmamalı). Sabun, quruducu dəsmal, dezinfeksiya maddəsi.
- **Dırnaq, bəzək:** Uzun dırnaq, lak, üzük, bilərlik — mətbəxdə yasaqdır.
- **Tütün:** Mətbəxdə və ərzaq saxlama sahələrində qətiyyən yasaqdır.

### 3. Mətbəx gigiyenası

- **İş səthlərinin təmizliyi:** Kəsmə taxtaları, masalar, bıçaqlar — hər istifadədən sonra təmizlənməli.
- **Rəng kodlu kəsmə taxtaları:** Çiy ət üçün qırmızı, tərəvəz üçün yaşıl, çörək üçün ağ və s. Eyni taxtada çiy toyuq və salat kəsilməsi — ciddi çarpaz kontaminasiya (cross-contamination) riskidir.
- **Zibil qutuları:** Qapaqlı, pedallı. Zibil taşması — cərimə.
- **Zərərvericilərlə mübarizə:** Hamamböcəyi, siçan, milçək — bunların **izinin** belə olmaması lazımdır. Müfəttiş ərazini yoxlayır.

### 4. Su keyfiyyəti

- **İçməli su:** Şəbəkə suyu istifadə olunursa — filtr sistemi olmalıdır.
- **Buz:** Buz maşını təmiz olmalıdır, buz əl ilə götürülməməlidir (maşa və ya kürək ilə).

### 5. Yemək hazırlama prosesi

- **Pişirmə temperaturu:** Toyuq minimum **74°C** daxili temperatura çatmalıdır. Mal əti (well-done) **71°C**. Müfəttiş termometr ilə yoxlaya bilər.
- **Saxlama temperaturu:** Hazır yemək **2 saatdan** çox otaq temperaturunda qalmamalıdır. 2 saatdan sonra ya soyudulmalı, ya atılmalıdır.
- **Yenidən qızdırma:** Əvvəlcədən hazırlanmış yemək yenidən qızdırılırsa, **74°C-dən** yuxarıya çatmalıdır.

### 6. Sənədləşdirmə

- **AQTA qeydiyyatı:** Fəaliyyət göstərmək üçün AQTA-da qeydiyyatdan keçməlisən. ASAN Xidmət və ya KOBİA vasitəsilə **pulsuzdur.**
- **Gigiyena jurnalı:** Gündəlik temperatur qeydləri, təmizlik qeydləri. Müfəttiş jurnalı istəyir.
- **Ərzaq mənbəyi:** Hər ərzağın haradan alındığını göstərən sənəd (faktura, qəbz). İzlənə bilirlik (traceability) tələbidir.

### 7. Zal və ümumi sahələr

- **Tualet:** Təmiz, sabun, quruducu, işləyən su. Mətbəxdən ayrı girişli.
- **Havalandırma:** Mətbəxdən zala qoxu keçməməli.
- **Ümumi təmizlik:** Döşəmə, divarlar, tavan — ümumi sanitariya vəziyyəti.

### 8. Allergen (alergen) məlumatlandırması

Menyuda alergen məlumatı olmalıdır — fındıq, süd, gluten, yumurta və s. Bu tələb getdikcə güclənir.

---

---

## Ən yayğın cərimə səbəbləri

Bakıda AQTA müfəttişlərinin ən çox yazdığı pozuntular:

| # | Pozuntu | Cərimə riski |
|---|---|---|
| 1 | Tibbi arayışların olmaması | Yüksək |
| 2 | Vaxtı keçmiş ərzaq tapılması | Çox yüksək |
| 3 | Soyuducu temperaturu norma xaricində | Yüksək |
| 4 | Çiy və hazır ərzaq birlikdə saxlanması | Çox yüksək |
| 5 | Əl yuma imkanının olmaması | Yüksək |
| 6 | Gigiyena jurnalının olmaması | Orta |
| 7 | Zərərverici izlərinin tapılması | Çox yüksək |
| 8 | Ərzaq mənbəyi sənədlərinin olmaması | Orta |
| 9 | İş geyiminin uyğunsuzluğu | Orta |
| 10 | Tualet sanitariyasının uyğunsuzluğu | Yüksək |

---

---

## Gündəlik, həftəlik, aylıq gigiyena rejimi

### Hər gün:
- ☐ Soyuducu/dondurucu temperaturlarını yoxla, jurnala yaz
- ☐ İş səthlərini təmizlə və dezinfeksiya et
- ☐ Zibil qutularını boşalt, təmizlə
- ☐ FIFO yoxlaması — vaxtı keçmiş ərzaq var?
- ☐ Əl yuma stansiyalarını yoxla — sabun, quruducu var?
- ☐ İşçilərin iş geyimini yoxla

### Hər həftə:
- ☐ Soyuducuların daxilini tam təmizlə
- ☐ Zərərverici yoxlaması — bütün küncləri, rəflərin arxasını yoxla
- ☐ Kəsmə taxtalarını yoxla — çatları, çürümə əlamətləri?
- ☐ Havalandırma filtrini yoxla
- ☐ Tualet gigiyenasını dərindən yoxla

### Hər ay:
- ☐ Tibbi arayışların vaxtını yoxla — yenilənməli olan var?
- ☐ Ərzaq mənbəyi sənədlərini arxivlə — fakturalar düzgün saxlanılır?
- ☐ Bütün avadanlığın texniki vəziyyətini yoxla — sobalar, soyucular, qabyuyan
- ☐ İşçilərə qısa gigiyena təlimatı keçir (15 dəqiqə kifayətdir)
- ☐ Zərərvericilərlə mübarizə xidmətini çağır (peşəkar ilaçlama)

---

## "AQTA hazırlıq" checklist — divara yapışdır

Bu siyahını çap et, mətbəxin girişinə yapışdır. Hər gün yoxla.

| # | Maddə | Gündəlik ☐ |
|---|---|---|
| 1 | Soyuducu: +2°C — +6°C | ☐ |
| 2 | Dondurucu: -18°C və aşağı | ☐ |
| 3 | Çiy/hazır ərzaq ayrıdır | ☐ |
| 4 | Ərzaqlar yerdən yuxarıdadır | ☐ |
| 5 | Vaxtı keçmiş ərzaq yoxdur | ☐ |
| 6 | FIFO qaydası izlənir | ☐ |
| 7 | İş səthləri təmizdir | ☐ |
| 8 | Zibil qutuları boşdur, qapaqlıdır | ☐ |
| 9 | Əl yuma: sabun, quruducu var | ☐ |
| 10 | İşçi geyimləri uyğundur | ☐ |
| 11 | Baş örtüyü (bone) taxılıb | ☐ |
| 12 | Temperatur jurnalı doldurulub | ☐ |
| 13 | Tualet təmizdir | ☐ |
| 14 | Havalandırma işləyir | ☐ |
| 15 | Zərərverici əlaməti yoxdur | ☐ |

---

> ⚠️ **Xəbərdarlıq:** AQTA icazəsi **PULSUZDUR.** Bəzi "vasitəçilər" pul istəyir — VERMƏYİN. ASAN Xidmət mərkəzinə və ya KOBİA evinə özünüz gedin, formaları doldurun.

---

## Cross-contamination — ən təhlükəli, ən az bilinən risk

Cross-contamination (çarpaz kontaminasiya) — çiy ərzaqdakı bakteriyaların hazır yeməyə keçməsidir. Bu, qida zəhərlənməsinin əsas səbəblərindən biridir.

**Ən yayğın yollar:**
- Çiy toyuq kəsilən taxtada salat kəsmək
- Çiy ət tutduqdan sonra əl yumadan çörəyə toxunmaq
- Soyuducuda çiy ətin altından hazır yeməyə maye damcılaması
- Eyni əlcəklə çiy və bişmiş ərzağa toxunmaq

**Həll:**
- Rəng kodlu kəsmə taxtaları: qırmızı = çiy ət, yaşıl = tərəvəz, sarı = toyuq, mavi = balıq
- Əl yuma 20 saniyə, sabunla, hər dəfə ərzaq dəyişəndə
- Soyuducuda çiy ərzaq aşağı rəfə, hazır ərzaq yuxarı rəfə
- Əlcək dəyişdirmə qaydası — hər ərzaq qrupunda yeni əlcək

---

> **💡 DK Agency:** AQTA yoxlamasına hazır olduğunuzdan əmin deyilsiniz? DK Agency komandası **gigiyena auditi** həyata keçirir — AQTA müfəttişinin baxdığı hər maddəni yoxlayırıq, yazılı hesabat və düzəltmə planı təqdim edirik. Gigiyena təlimi, HACCP planı hazırlanması, sənədləşdirmə sistemi qurulması üçün bizimlə əlaqə saxlayın.
>
> 📧 info@dkagency.com.tr | 🔧 [AQTA hazırlıq aləti](/toolkit/aqta-checklist) | 🌐 [Marketinq Ocağı](/marketinq)
$dkq$, updated_at = now()
WHERE id = 11 AND md5(content_az) = 'cbfc8fd46db5f4a336a2eab4b5af93dc' AND md5(coalesce(dogan_note, '')) = '5ce4eda4c5729a10c66bb80e60a7a763';

-- wolt-bolt-komissiyon
UPDATE blog_posts SET content_az = $dkq$---

"Wolt-a qoşulduq, sifarişlər gəlir, hər şey əla!" Əladır? Gəl rəqəmlərlə danışaq.

Sən Wolt-dan 30₼-lıq sifariş aldın. Komissiya 30%-dir. Wolt 9₼ götürdü. Əlində 21₼ qaldı. Bu 21₼-dan ərzaq xərci 10₼-dir (food cost 33%). Əlində 11₼ qaldı. Qablaşdırma materialı 1.50₼. Əlində 9.50₼ qaldı. İşçi xərci (hazırlıq vaxtı) ~3₼. Əlində **6.50₼** qaldı — icarə, kommunal, vergi çıxmamış. Çıxdıqdan sonra? **2-3₼. Bəlkə 0₼. Bəlkə mənfi.**

Eyni sifarişi restoranda versəydi: 30₼ tam sənin. Komissiya yox. Qablaşdırma yox. Əlində **12-15₼** qalardı.

**Delivery platformaları pis deyil — amma riyaziyyatını bilmədən qoşulsan, hər sifarişdə pul itirə bilərsən.** Bu yazıda bu riyaziyyatı açıram.

---

---

## Platformaların komissiyon strukturu

Bakıda aktiv olan əsas delivery platformalar və təxmini komissiyon dərəcələri:

| Platforma | Komissiyon (təxmini) | Qeyd |
|---|---|---|
| **Wolt** | Müqaviləyə görə | Faizi öz müqavilənizdən yoxlayın |
| **Bolt Food** | Müqaviləyə görə | Faizi öz müqavilənizdən yoxlayın |
| **Yango Deli** | Müqaviləyə görə | Kampaniya dövrlərində şərtlər dəyişə bilər |

Bu rəqəmlər müqaviləyə, sifarişin tipinə, promosyonlara görə dəyişə bilər. **Mütləq öz müqavilənizi oxuyun** — xüsusilə kiçik hərflərlə yazılmış hissələri.

> ⚠️ **Xəbərdarlıq:** Bəzi platformalar promosyon kampaniyalarında **endirimin bir hissəsini sizin hesabınıza** yazır. Yəni platforma "20% endirim" kampaniyası edir, amma endirimin yarısını siz qarşılayırsınız. Bu, müqavilədə yazılıdır — oxuyun.

---

## Real hesablama — 100₼-lıq delivery vs restoran satışı

| Maddə | Restoran (dine-in) | Delivery |
|---|---|---|
| Satış | 100₼ | 100₼ |
| Platforma komissionu (30%) | 0₼ | -30₼ |
| **Netto gəlir** | **100₼** | **70₼** |
| Food cost (33%) | -33₼ | -33₼ |
| Qablaşdırma | 0₼ | -5₼ |
| İşçi xərci | -25₼ | -28₼ |
| Digər əməliyyat xərcləri | -25₼ | -15₼ |
| **Xalis nəticə** | **+17₼** | **-11₼** |

Bu hesablama **şokdur** — amma realdır. Əgər food cost-un yüksəkdirsə və qiymətini uyğunlaşdırmamısansa, delivery hər sifarişdə sənə **pul itirdirə bilər.**

---

## O zaman niyə delivery edir hamı?

Yaxşı sual. Çünki delivery-nin **birbaşa mənfəətdən** başqa dəyərləri var:

1. **Müştəri bazası genişlənir** — restoranına gəlməyən insanlara çatırsan
2. **Brend görünürlüyü** — platformada olmaq pulsuz reklam effekti yaradır
3. **Sakit saatlarda əlavə gəlir** — 14:00-17:00 arası restoran boşdur, delivery dolur
4. **Yeni müştəri qazanma** — delivery-dən bəyənən insan sonra restorana gələ bilər
5. **Mətbəx yüklənməsi** — mətbəx boş durmur, işçilər hər zaman məşğuldur

Amma bu faydalar **yalnız riyaziyyatını düzgün qursan** işləyir. Əks halda, həcm artdıqca **itki** artır.

---

---

## Delivery-ni mənfəətli etməyin 7 yolu

### 1. Ayrı delivery menyusu yarat

Bütün menyunu delivery-yə qoşma. Yalnız **food cost-u aşağı, qablaşdırmaya uyğun, daşınmada keyfiyyətini itirməyən** yeməkləri seç.

**Delivery-yə uyğun:** Burger, wrap, pizza, plov, qutab, pasta, soyuq sandviç
**Delivery-yə uyğun DEYİL:** Dondurma (əriyir), qızardılmış balıq (yumuşayır), steyk (soyuyur, keyfiyyəti düşür), çorba (tökülür)

Delivery menyusu restoran menyusunun **40-60%-i** olmalıdır — yalnız mənfəətli və daşınabilən hissəsi.

### 2. Delivery qiymətini artır

Bir çox restoran delivery menyusunda qiymətləri **10-20% yuxarı** yazır. Müştəri bunu qəbul edir — çünki rahatlıq üçün ödəyir. Platformalar buna icazə verir.

**Nümunə:**
- Restoranda Toyuq Sac: 18₼
- Delivery-də Toyuq Sac: 21₼ (+17%)

Bu 3₼ fərq komissiyanın bir hissəsini kompensasiya edir. Kiçik dəyişiklik, böyük təsir.

### 3. Combo (set menyu) sat

Tək yemək əvəzinə combo sat: yemək + içki + desert. Combo-nun toplam marjı tək yeməkdən yüksəkdir. Üstəlik **orta sifariş dəyəri (average order value — AOV)** artır.

**Nümunə combo:**
- Tək burger: 12₼ (food cost 4₼, CM: 8₼)
- Burger combo (burger + kartof + içki): 18₼ (food cost 5.50₼, CM: 12.50₼)
- Marj artımı: **56%**

Platformalarda combo sifarişlər adətən orta sifariş dəyərini artırır.

### 4. Qablaşdırma xərcini optimallaşdır

- **Toplu alış et** — böyük partiya ilə alınan qab vahid başına xeyli ucuz olur
- **Ölçüləri standartlaşdır** — 3-4 ölçüdə qab bütün menyunu qarşılasın, 10 fərqli ölçü olmasın
- **Ekoloji qablaşdırma istəyirsənsə** — qiymətə daxil et, ayrıca itirmə
- **Brendli qablaşdırma** — kiçik stiker belə brend tanınırlığı yaradır, xərci minimumdur

### 5. Öz delivery sisteminizi qurun — amma tələsməyin

Platformaların gücü **müştəri gətirməsidir.** Amma sadiq müştəri bazanız varsa — öz saytınızdan və ya WhatsApp/Telegram-dan sifariş qəbul edin, öz kuryerinizlə göndərin. Komissiyon: sıfır.

**Amma hesabla:**
- Kuryerin maaşı
- Motosiklet/avtomobil xərci: benzin, təmir, sığorta
- Sifariş idarəetmə sistemi
- **Minimum gündə 20-30 sifariş** olmadan öz delivery sisteminiz mənfəətsizdir

**Strategiya:** Platformalarda başla → sadiq müştəri qazan → onları öz kanalına yönləndir → tədricən platformadan asılılığı azalt.

### 6. Platform promosyonlarını strateji istifadə et

Platformalar müntəzəm "pulsuz çatdırılma", "endirim" kampaniyaları edir. **Diqqət:**

| Promosyon tipi | Kim qarşılayır? | Sənin strategiyan |
|---|---|---|
| Platformanın öz kampaniyası | Platforma | ✅ Qoşul — pulsuz reklam |
| Bölüşdürülmüş endirim | 50/50 | ⚠️ Hesabla — mənfəətlidirmi? |
| Sənin hesabına endirim | Sən | ❌ Çox ehtiyatlı ol |

### 7. Delivery datanızı hər ay izləyin

| Göstərici | Bu ay | Keçən ay | Trend |
|---|---|---|---|
| Toplam sifariş sayı | | | |
| Orta sifariş dəyəri (AOV) | | | |
| Toplam delivery gəliri | | | |
| Komissiyon ödənişi | | | |
| Qablaşdırma xərci | | | |
| Delivery food cost % | | | |
| **Delivery xalis mənfəəti** | | | |

Bu cədvəli hər ay doldur. **Delivery ayrı biznes kimi idarə olunmalıdır** — restoran mənfəətinə qarışdırma.

---

---

## Platformlarla müqavilə bağlayarkən diqqət

Müqavilə imzalamadan əvvəl bu sualları soruşun:

1. **Komissiyon dərəcəsi neçədir?** Sabit mi, yoxsa sifarişin tipinə görə dəyişirmi?
2. **Ödəniş müddəti nədir?** Həftəlik, aylıq? Gecikdirmə olurmu?
3. **Promosyon kampaniyalarının şərtləri nədir?** Endirimi kim qarşılayır?
4. **Müqavilənin müddəti nədir?** Çıxış şərtləri nədir? Cərimə varmı?
5. **Qiymət dəyişikliyi edə bilirəmmi?** Delivery menyusunda fərqli qiymət qoya bilirəmmi?
6. **Reyting sistemi necə işləyir?** Aşağı reyting bizə necə təsir edir?
7. **Əlavə xidmətlər (reklam, vurğulama) nə qədərdir?** Platformada "yuxarı çıxmaq" üçün əlavə ödəniş varmı?

> ⚠️ **Xəbərdarlıq:** Müqaviləni imzalamadan ƏVVƏL muhasibçinizə və ya hüquqi məsləhətçinizə göstərin. Kiçik hərflərdə gizlənən şərtlər ola bilər — xüsusilə promosyon xərc bölüşdürməsi və çıxış cərimələri.

---

---

## DELIVERY CHECKLIST

| # | Addım | Status |
|---|---|---|
| 1 | Hər platformanın komissiyon dərəcəsini öyrən | ☐ |
| 2 | Delivery üçün ayrı menyu yarat (yalnız uyğun yeməklər) | ☐ |
| 3 | Delivery menyusunda qiymətləri 10-20% artır | ☐ |
| 4 | Combo/set menyular hazırla | ☐ |
| 5 | Qablaşdırma materialını toplu al, xərcini hesabla | ☐ |
| 6 | Hər ay delivery P&L-ini ayrıca hesabla | ☐ |
| 7 | Platform promosyonlarının şərtlərini oxu — kimin hesabına? | ☐ |
| 8 | Orta sifariş dəyərini (AOV) izlə, artırmağa çalış | ☐ |
| 9 | Müqavilə şərtlərini muhasibçiyə göstər | ☐ |
| 10 | Öz delivery kanalını (WhatsApp/sayt) sadiq müştərilər üçün hazırla | ☐ |

---

> **💡 DK Agency:** Delivery kanalınızı optimallaşdırmaq istəyirsiniz? DK Agency-nin pulsuz [Çatdırılma komissiyası kalkulyatoru](/toolkit/delivery-calc) Wolt, Bolt Food, Yango və öz kuryeriniz üçün komissiyadan sonra bir sifarişdən nə qaldığını hesablayır. Delivery menyu strategiyası, qiymətləndirmə, qablaşdırma optimallaşdırması üçün danışmanlıq xidmətimiz mövcuddur.
>
> 📧 info@dkagency.com.tr | 🔧 [Çatdırılma kalkulyatoru](/toolkit/delivery-calc) | 🌐 [Marketinq Ocağı](/marketinq)
$dkq$, updated_at = now()
WHERE id = 12 AND md5(content_az) = 'f44019c81857e6f7a40a907467a1640e' AND md5(coalesce(dogan_note, '')) = 'd059698d9a8f0d92f999cfb49b67d58e';

-- kurumsal-kitabca-emeliyyat
UPDATE blog_posts SET content_az = $dkq$---

Aşpazbaşı xəstələndi. Yerinə gələn aşpaz soruşur: "Toyuq Sac-a nə qədər toyuq qoyulur?" Heç kim dəqiq bilmir. Biri 200 qram deyir, biri 300. Müştəri şikayət edir: "Keçən həftə porsiya böyük idi, bu dəfə kiçikdir."

Ofisiant yenidir. "Müştəri hesab istəyir — kart qəbul edirik?" Heç kim dəqiq cavab vermir. Biri "hə" deyir, biri "nağd istə."

Təmizlik vaxtı gəldi. Kim nəyi təmizləyir? Heç kim bilmir. Hamı bir-birini gözləyir. Heç kim etmir.

**Bu, sistem yoxluğunun nəticəsidir.** Və bu, Bakıda çox restoranın gündəlik reallığıdır. Hər kəs öz başının diktəsi ilə işləyir, çünki **yazılı standart yoxdur.**

Kurumsal kitabça (operations manual — əməliyyat təlimatnamələri) bu xaosu bitirən sənəddir. Bu yazıda nə olduğunu, niyə lazım olduğunu və necə hazırlanacağını izah edirəm.

---

---

## Kurumsal kitabça nədir?

Sadə dillə: **restoranın "dərslik kitabı."** İçində restoranın hər prosesinin — mətbəxdən zala, açılışdan bağlanışa, işə qəbuldan müştəri şikayətinə qədər — **yazılı qaydaları** var.

Niyə "kitabça"? Çünki yeni işçi gəlir, bunu oxuyur, nə etməli olduğunu bilir. Sahibkar olmasa da restoran **eyni keyfiyyətdə** işləyir. Heç kim "amma mən belə bilirdim" demir — çünki **yazılıb.**

McDonald's-ın 38.000+ restoranı dünyanın hər yerində **eyni standartda** işləyir. Tokioda da, Bakıda da, Des Plaines-da da hamburger eyni dadda gəlir. Bu, təsadüf deyil — **ətraflı əməliyyat təlimatnaməsi** sayəsindədir. McDonald's qardaşları 1948-ci ildə "Speedee Service System" yaratdılar, Ray Kroc bunu kitabça halına gətirdi, bu gün dünyada ən böyük restoran sistemidir.

Sən 38.000 restoran idarə etmirsən — amma 1 restoranın da kitabçası yoxdursa, **1 restoran belə düzgün işləmir.**

---

---

## Kitabçada nə olmalıdır? 8 bölmə

### Bölmə 1: Restoranın missiyası və dəyərləri
- Biz kimuq? Nə üçün mövcuduq?
- Müştəriyə nə söz veririk?
- Komandanın davranış prinsipləri

Bu, "gözəl sözlər" deyil — **qərar alma çərçivəsidir.** İşçi çətin vəziyyətdə qalırsa, missiyaya baxır, nə etməli olduğunu bilir.

### Bölmə 2: İş təsvirləri (job descriptions)
Hər pozisiya üçün:
- Vəzifə adı
- Kimə hesabat verir
- Əsas məsuliyyətlər (5-7 maddə)
- Gözlənilən bacarıqlar
- İş saatları, shift sistemi

**Nümunə — Ofisiant iş təsviri:**
- Hesabat verir: Baş Ofisiant / Shift Manager
- Məsuliyyətlər: Müştəri qarşılama, sifariş alma, yemək servisi, hesab təqdimi, masanın hazırlanması
- Bacarıqlar: Ünsiyyət, POS istifadəsi, menyu biliyi, upselling
- Shift: Saat 10:00-22:00, rotation sistemi

### Bölmə 3: Reseptlər və porsiyon standartları
- Hər yeməyin standart resepti (resept kartı)
- Porsiyon ölçüsü (qram, şəkil ilə)
- Boşqaba düzülmə qaydası (plating — süslənmə)
- Food cost və satış qiyməti

Bu bölmə **"Food Cost" yazımızdakı** resept kartı sisteminin genişlənmiş versiyasıdır.

### Bölmə 4: Xidmət standartları (Service SOP)
SOP — Standard Operating Procedure (Standart Əməliyyat Proseduru):

- Müştəri gələndə ilk **30 saniyə** ərzində salamlanmalıdır
- Su **2 dəqiqə** ərzində masaya qoyulmalıdır
- Sifariş alındıqdan sonra yemək **15-20 dəqiqə** ərzində gəlməlidir (konseptə görə)
- Hesab istənildikdə **3 dəqiqə** ərzində gətirilməlidir
- Müştəri gedəndə "xoş vaxt keçirdiniz?" sualı verilməlidir

Bu sürətlər **ölçülməlidir** — "Atmosfer" yazımızda dediyimiz kimi, stopwatch ilə müştəri yolunu ölçün.

### Bölmə 5: Açılış və bağlanış prosedurları
**Açılış checklist-i (hər gün):**
- Soyuducu temperaturlarını yoxla, jurnala yaz
- Mətbəx stansiyalarını hazırla
- Zalı hazırla — masalar, sandalyələr, menyu, ədviyyat
- POS-u aç, kassanı yoxla
- Musiqi sistemini aç, playlist-i seç
- İşıqları yoxla
- Tualetləri yoxla
- Pre-shift meeting keçir

**Bağlanış checklist-i (hər gün):**
- Kassanı say, hesabatı çap et
- Mətbəxi təmizlə, avadanlığı söndür
- Soyuducu temperaturlarını son dəfə yoxla
- Zalı təmizlə
- Qapıları kilidlə, siqnalizasiyanı qoş

### Bölmə 6: Gigiyena qaydaları
**AQTA yazımızdakı** bütün gigiyena standartlarının daxili versiyası:
- Gündəlik, həftəlik, aylıq təmizlik cədvəli
- FIFO qaydası
- Cross-contamination qaydaları
- Tibbi arayış yeniləmə təqvimi
- Zərərvericilərlə mübarizə planı

### Bölmə 7: Böhran idarəetməsi
- Müştəri şikayəti → 5 addımlıq həll proseduru
- Qida zəhərlənməsi iddiası → nə etməli?
- İşçi iş yerində yaralanma → ilk yardım, sənədləşdirmə
- Elektrik/su kəsilməsi → alternativ plan
- Yanğın → təxliyə planı, FHN proseduru
- Sosial media böhranı → kim cavab verir, necə?

### Bölmə 8: Maliyyə qaydaları
- Kassanın gündəlik sayılma proseduru
- Satınalma qaydaları (minimum 3 firmadan qiymət)
- Stok sayım tezliyi və proseduru
- P&L-ə kimin baxdığı, nə vaxt baxıldığı

---

---

---

## Kitabçanı necə hazırlamaq? 4 addım

### Addım 1: Mövcud prosesləri yazın
İndi necə işləyirsiniz? Aşpazbaşı, baş ofisiant, shift manager — hər birindən proseslərini danışdır, yaz. "Biz bunu belə edirik" — yazıya çevir.

### Addım 2: Standartlaşdırın
"Belə edirik" → "belə etməliyik" çevrilməsi. Hər prosesin **bir düzgün yolu** olsun. Vaxt limitləri, ölçülər, ardıcıllıq — dəqiq yaz.

### Addım 3: Vizuallaşdırın
Yalnız mətn yetərli deyil. **Şəkillər** əlavə et:
- Boşqaba düzülmə şəkli
- Soyuducunun düzgün düzülməsinin şəkli
- Masa düzəninin şəkli

### Addım 4: Təlim keçirin və yeniləyin
Kitabça yazıldı — amma rəfdə qalsa dəyəri sıfırdır. Hər yeni işçi ilk həftədə kitabçanı oxumalı, imza atmalıdır. Hər 6 ayda kitabça yenilənməlidir — proseslər dəyişir, menyu dəyişir.

---

## "Amma vaxtım yoxdur" — ən yayğın bəhanə

Kitabçanı bir gecədə yazmaq lazım deyil. **Hər həftə 1 bölmə** yaz:

| Həftə | Bölmə | Təxmini vaxt |
|---|---|---|
| 1 | Missiya + dəyərlər | 1 saat |
| 2 | İş təsvirləri | 2 saat |
| 3 | Açılış/bağlanış checklist-i | 1 saat |
| 4 | Xidmət standartları | 2 saat |
| 5 | Gigiyena qaydaları | 1.5 saat |
| 6 | Resept kartları (ilk 10 yemək) | 3 saat |
| 7 | Böhran idarəetməsi | 1.5 saat |
| 8 | Maliyyə qaydaları | 1 saat |

**8 həftə — 13 saat — kitabçanız hazırdır.** 13 saat investisiya, illərlə fayda.

---

## KURUMSAL KİTABÇA CHECKLIST

| # | Bölmə | Hazırdır? |
|---|---|---|
| 1 | Missiya və dəyərlər yazılıb | ☐ |
| 2 | Hər pozisiya üçün iş təsviri var | ☐ |
| 3 | Resept kartları (ən azı top 20 yemək) hazırdır | ☐ |
| 4 | Xidmət SOP-ları yazılıb (vaxt limitləri daxil) | ☐ |
| 5 | Açılış checklist-i var | ☐ |
| 6 | Bağlanış checklist-i var | ☐ |
| 7 | Gigiyena qaydaları yazılıb | ☐ |
| 8 | Böhran idarəetmə planı var | ☐ |
| 9 | Maliyyə qaydaları (satınalma, kassa, stok) yazılıb | ☐ |
| 10 | Kitabça yeni işçi onboarding-ə daxil edilib | ☐ |

---

> **💡 DK Agency:** Kurumsal kitabça hazırlamaq vaxt alır — biz sizin üçün hazırlayırıq. DK Agency komandası restoranınıza gəlir, bütün prosesləri qeydə alır, standartlaşdırır, **hazır kitabça** təqdim edir. Xidmət SOP-ları, resept kartları, gigiyena qaydaları, təlim materialları — hamısı daxildir.
>
> 📧 info@dkagency.com.tr | 🔧 [Pulsuz alətlər](/toolkit) | 🌐 [Marketinq Ocağı](/marketinq)
$dkq$, updated_at = now()
WHERE id = 13 AND md5(content_az) = 'dde2d1aba0c413c4b50a9ba8de5fc036' AND md5(coalesce(dogan_note, '')) = '5a10b0ee73e451da0e33c7ff13ebf72e';

-- basabas-noqtesi-hesablama
UPDATE blog_posts SET content_az = $dkq$---

Sahibkar deyir: "Günə 50 müştəri gəlir, yaxşıdır." Yaxşıdırmı? Bilmirsən. Çünki **sənin günə neçə müştəriyə ehtiyacın olduğunu hesablamamısan.**

Başabaş nöqtəsi (break-even point) — restoran nə qazanır, nə itirir — **sıfırda qalır.** Bu nöqtədən aşağısan — pul itirirsən. Bu nöqtədən yuxarısan — pul qazanırsan.

Ən vacib suallara cavab verir: **gündə neçə müştəri lazımdır ki batmayasan? Ayda nə qədər satmalısan ki xərcləri ödəyəsən?** Bu rəqəmi bilmədən restoran idarə etmək — qaranlıqda yol getməkdir.

---

---

## Başabaş nöqtəsi nədir? Ən sadə izah

**Sabit xərclərin** (fixed costs — dəyişməyən xərclər) hamısını ödəmək üçün nə qədər satış lazımdır.

**Sabit xərclər** — müştəri gəlsə də gəlməsə də ödəyəcəyin maddələr:
- İcarə
- İşçi maaşları (əsas komanda)
- DSMF
- Kommunal (minimum)
- Sığorta
- Kredit ödənişi (varsa)
- Musiqi, internet, telefon
- Mühasibat

**Dəyişən xərclər** (variable costs) — satışla birlikdə artan maddələr:
- Ərzaq (food cost)
- Qablaşdırma (delivery)
- Əlavə işçi (pik saatlarda)
- Kommunal artımı

---

## Formula — sadə versiya

```
Başabaş Nöqtəsi (₼) = Sabit Xərclər ÷ (1 - Dəyişən Xərc %)
```

**Nümunə:**
- Aylıq sabit xərclər: 25.000₼
- Dəyişən xərc %: 40% (food cost 33% + qablaşdırma + əlavə işçi)
- Contribution margin: 1 - 0.40 = **0.60 (60%)**

```
Başabaş = 25.000 ÷ 0.60 = 41.667₼
```

Yəni: ayda **minimum 41.667₼** satmalısan ki xərcləri ödəyəsən. Bir qəpik belə qazanmırsan — sadəcə **batmırsan.**

---

## Bu rəqəmi gündəlik müştəriyə çevirək

Davam edək:
- Aylıq başabaş: 41.667₼
- Ayda işlənən gün: 30
- **Gündəlik başabaş: 1.389₼**

Orta hesab (average check — hər müştərinin orta xərcləməsi): 25₼

```
Gündəlik lazım olan müştəri = 1.389 ÷ 25 = 55.6 → minimum 56 müştəri/gün
```

**56 müştəri gələndə — sıfırdasan.** 57-ci müştəridən qazanmağa başlayırsan.

Əgər gündə 50 müştəri gəlirsə — **hər gün təxminən 83₼ itirirsən**, ayda **təxminən 2.500₼ mənfiyədə** olursan.

---

> ⚠️ **Xəbərdarlıq:** "Günə 50 müştəri gəlir, yaxşıdır" — bu, ən təhlükəli cümlədir. 50 müştəri yetərlidirmi, yetərli deyilmi — bunu **başabaş nöqtəsini hesablamadan** bilmək mümkün deyil.

---

---

## Real ssenari: Bakıda kiçik restoran

Gəlin real rəqəmlərlə hesablayaq:

**Sabit xərclər (aylıq):**

| Maddə | Məbləğ |
|---|---|
| İcarə | 4.000₼ |
| İşçi maaşları (8 nəfər) | 12.000₼ |
| DSMF (maaşa görə hesablanır) | 800₼ |
| Kommunal (sabit hissə) | 1.500₼ |
| Mühasibat | 500₼ |
| İnternet, telefon | 150₼ |
| Musiqi lisenziyası | 50₼ |
| Sığorta | 200₼ |
| Kredit ödənişi | 2.000₼ |
| **TOPLAM SABİT** | **21.200₼** |

**Dəyişən xərc faizi:** 38% (food cost 33% + kommunal artımı 3% + digər 2%)

```
Başabaş = 21.200 ÷ (1 - 0.38) = 21.200 ÷ 0.62 = 34.194₼/ay
```

**Gündəlik:** 34.194 ÷ 30 = **1.140₼/gün**

**Orta hesab 22₼ ilə:** 1.140 ÷ 22 = **52 müştəri/gün**

Restoranda 30 oturma yeri varsa, gündə **minimum 1.7 dəfə** dolmalıdır (lunch + dinner).

---

## Başabaşı aşağı salmaq — 3 yol

### Yol 1: Sabit xərcləri azalt
- İcarəni yenidən danış — uzunmüddətli müqavilə ilə endirim al
- Shift planlamasını optimallaş — sakit saatlarda daha az işçi
- Enerji qənaəti — LED işıq, enerji effektiv avadanlıq

### Yol 2: Dəyişən xərcləri azalt
- Food cost-u optimallaş — "Food Cost" yazımızdakı 10 addımı tətbiq et
- Waste-i azalt — prep sheet, FIFO, waste log
- Firma müqayisəsi — "Çalana deyil, çaldırana bax"

### Yol 3: Orta hesabı artır (ən effektiv)
- Menyu mühəndisliyi — yüksək marjlı yeməkləri ön plana çıxar
- Upselling — ofisiantlar desert, içki, yan yemək təklif etsin
- Combo/set menyu — orta sifariş dəyərini artır

**Orta hesab 22₼-dan 28₼-a artsa:**
- Gündəlik başabaş: 1.140 ÷ 28 = **41 müştəri** (52 əvəzinə!)
- **11 müştəri daha az** lazımdır — eyni xərclərlə

---

---

## Başabaşın ötəsində — hədəf mənfəət

Başabaş "batmamaq" üçündür. Amma sən **qazanmaq** istəyirsən. O zaman hədəf mənfəəti əlavə et:

```
Hədəf satış = (Sabit xərclər + Hədəf mənfəət) ÷ Contribution Margin
```

**Nümunə:**
- Sabit xərclər: 21.200₼
- Hədəf mənfəət: 8.000₼/ay
- Contribution Margin: 62%

```
Hədəf satış = (21.200 + 8.000) ÷ 0.62 = 47.097₼/ay
```

Gündə: 47.097 ÷ 30 = **1.570₼**
Orta hesab 22₼ ilə: 1.570 ÷ 22 = **72 müştəri/gün**

Bu, sənin **real hədəfin**dir — 72 müştəri gəlsə, ayda 8.000₼ qazanacaqsan.

---

## Mövsümi başabaş — yayda başqa, qışda başqa

Bakıda restoran biznesi **mövsümidir.** Yay aylarında trafik düşür (insanlar şəhərdən çıxır), Novruz və yeni il ərəfəsində artır. Buna görə başabaş nöqtəsini **yalnız illik orta** ilə hesablama — **mövsümə görə** planla:

| Mövsüm | Gözlənilən gündəlik müştəri | Strategiya |
|---|---|---|
| Yüksək mövsüm (oktyabr-dekabr) | 65-80 | Mənfəət yığ, ehtiyat fond doldur |
| Normal mövsüm (mart-iyun, sentyabr) | 50-65 | Başabaşı keç, stabil qal |
| Aşağı mövsüm (iyul-avqust) | 30-45 | Xərcləri azalt, delivery-yə fokuslan |
| Bayram dövrü (Novruz, Yeni il) | 80-100+ | Banketləri maksimuma çıxar |

Aşağı mövsümdə başabaş nöqtəsinə çatmırsan — **normaldır.** Amma bunu bilməlisən ki yüksək mövsümdə o fərqi qapada biləsən.

---

## BAŞABAŞ NÖQTƏSI CHECKLIST

| # | Addım | Status |
|---|---|---|
| 1 | Bütün sabit xərcləri siyahıya al (aylıq) | ☐ |
| 2 | Dəyişən xərc faizini hesabla | ☐ |
| 3 | Aylıq başabaş nöqtəsini hesabla (₼) | ☐ |
| 4 | Gündəlik başabaş nöqtəsini hesabla (₼) | ☐ |
| 5 | Orta hesabı (average check) hesabla | ☐ |
| 6 | Gündəlik lazım olan müştəri sayını hesabla | ☐ |
| 7 | Hədəf mənfəəti müəyyən et, hədəf satışı hesabla | ☐ |
| 8 | Mövsümi plan hazırla — yüksək/normal/aşağı dövrləri ayır | ☐ |
| 9 | Orta hesabı artırmaq üçün menyu mühəndisliyini tətbiq et | ☐ |
| 10 | Hər ay actual vs başabaş müqayisəsi et | ☐ |

---

> **💡 DK Agency:** Başabaş nöqtənizi hesablamaq istəyirsiniz? DK Agency-nin pulsuz [Zərərsiz nöqtə (başa-baş)](/toolkit/basabas) aləti var — sabit xərcləri, dəyişən xərcləri, orta hesabı daxil edin, sistem gündəlik lazım olan müştəri sayını avtomatik hesablasın. Maliyyə planlaması, büdcə optimallaşdırması üçün danışmanlıq xidmətimiz mövcuddur.
>
> 📧 info@dkagency.com.tr | 🔧 [Başa-baş aləti](/toolkit/basabas) | 🌐 [Marketinq Ocağı](/marketinq)
$dkq$, updated_at = now()
WHERE id = 16 AND md5(content_az) = 'cc2bcd5fc2ae9279aaf5d9c671e6896c' AND md5(coalesce(dogan_note, '')) = '43ac53b6f3625f24cb1ec63262f61237';

-- franchise-bedelleri-ad-haqqi-royalti-reklam
UPDATE blog_posts SET content_az = $dkq$Françayz almaq istəyən sahibkarın qarşısına adətən üç əsas bədəl çıxır: ad haqqı, royalti və reklam bədəli.

Çox sahibkar bu rəqəmlərə ayrı-ayrı baxır:
“Ad haqqı nə qədərdir?”
“Royalti neçə faizdir?”
“Reklam pulu varmı?”

Əsl sual isə başqadır: bu ödənişlərin qarşılığında işləyən sistem alırsan, yoxsa sadəcə markanın adını kirayə götürürsən?

Françayz modelində bədəl normaldır. Problem bədəl ödəməkdə deyil; problem qarşılığı olmayan, şəffaf izah edilməyən və müqavilədə tam görünməyən bədəldədir.

Bu yazı françayz ödənişlərini sahibkar gözü ilə deyil, investor gözü ilə oxumağa kömək edir.

## 1. Ad haqqı — qapıdan giriş bileti deyil, sistemə giriş haqqıdır

Ad haqqı françayz sisteminə daxil olarkən bir dəfə ödənən məbləğdir. Bəzən “giriş bədəli”, “françayz fee” və ya “initial fee” kimi də göstərilir.

Bu məbləğ yalnız markanın lövhəsini asmaq üçün ödənməməlidir. Sağlam françayz modelində ad haqqının qarşılığında konkret paket olmalıdır:

ilkin təlim;
açılış öncəsi dəstək;
əməliyyat kitabçası;
menyu və məhsul standartları;
personal hazırlığı;
lokasiya seçimi və açılış planı;
sistem, proqram və hesabat strukturu;
açılışdan sonrakı ilk nəzarət.

Yəni sahibkar ad yox, işləyən əməliyyat modeli almalıdır.

Əgər marka böyük ad haqqı istəyir, amma “nə daxildir?” sualına konkret cavab verə bilmirsə, bu artıq risk siqnalıdır.

DK baxışı

Ad haqqını tək rəqəm kimi yox, sistem transferinin qiyməti kimi oxumaq lazımdır. Bahalı ad haqqı pis deyil; qarşılığı olmayan ad haqqı pisdir.

2. Royalti — davam edən tərəfdaşlıq haqqıdır

Royalti françayz alanın françayz verənə mütəmadi ödədiyi davamlı haqqdır. Adətən aylıq dövriyyənin müəyyən faizi kimi hesablanır.

Məsələn, restoran ayda 100.000 AZN dövriyyə edirsə və royalti 5%-dirsə, françayz alan 5.000 AZN royalti ödəyir.

Royalti nəyə görə ödənir?

marka gücünün qorunması;
davamlı əməliyyat dəstəyi;
məhsul və menyu yenilikləri;
təlim və audit;
texnologiya və sistem inkişafı;
şəbəkənin böyüməsi;
standartların qorunması.

Ən sağlam modeldə françayz verənin gəliri françayz alanın uğuru ilə bağlı olur. Yəni françayz alan böyüdükcə françayz verən də böyüyür.

Amma burada kritik fərq var: faizli royalti və sabit royalti.

Faizli royalti dövriyyəyə bağlıdır. Dövriyyə azalsa, ödəniş də azalır. Sabit royalti isə satışdan asılı olmayaraq eyni qalır. Bu model bəzi hallarda işləyə bilər, amma zəif lokasiya, mövsümi eniş və ya ilk ayların yüklü xərcləri zamanı françayz alanı sıxa bilər.

Müqavilədən əvvəl soruş

Royalti dövriyyədən hesablanır, yoxsa xalis mənfəətdən?
Minimum royalti varmı?
Zərər edilən aylarda da ödənirmi?
Royaltiyə hansı xidmətlər daxildir?
Françayz verən bu ödənişin qarşılığında hansı davamlı dəstəyi verir?

3. Reklam bədəli — ortaq fond, yoxsa görünməyən xərc?

Reklam bədəli şəbəkənin ortaq marketinq xərcləri üçün toplanan fonddur. Adətən dövriyyənin kiçik faizi kimi hesablanır.

Bu fondun məntiqi doğrudur: tək bir sahibkarın edə bilməyəcəyi reklamı bütün şəbəkə birlikdə edir. Marka görünürlük qazanır, müştəri trafiki artır, kampaniyalar mərkəzdən idarə olunur.

Amma burada əsas məsələ şəffaflıqdır.

Yaxşı françayz verən reklam fondunun necə xərcləndiyini izah edir. Hansı kampaniyalar aparılıb, hansı kanallara pul ayrılıb, françayz alanların satışına necə təsir edib — bunlar ölçülməlidir.

Zəif modeldə isə reklam bədəli toplanır, amma hesabat verilmir. Françayz alan pul ödəyir, nəticəni görmür.

Düzgün sual

“Reklam bədəli neçə faizdir?” sualı yetərli deyil.

Düzgün sual budur: bu fond necə idarə olunur, kim qərar verir və hesabatı necə verilir?

4. Gizli bədəl tələsi: ucuz royalti, bahalı məcburi alış

Bəzi françayz modellərində ad haqqı aşağı, royalti də aşağı göstərilir. İlk baxışda fürsət kimi görünür.

Amma sonra məlum olur ki, françayz alan bütün məhsulu, qablaşdırmanı, xammalı, avadanlığı və proqram təminatını yalnız françayz verənin göstərdiyi mənbədən almalıdır. Bəzən bu məhsullar bazar qiymətindən ciddi baha olur.

Belə hallarda françayz verən royalti ilə yox, məcburi mal satışından qazanır.

Bu, françayz alan üçün ən təhlükəli tələlərdən biridir. Çünki sahibkar müqaviləyə baxanda royalti aşağı görür, amma P&L hesabına baxanda real marjanın əridiyini anlayır.

Əsas qayda

Françayz bədəllərini ayrı-ayrı yox, birlikdə hesabla:

Ad haqqı + royalti + reklam bədəli + məcburi alış + proqram xərci + audit xərci + yenilənmə xərci + gizli marja

Əsl yük bu toplamda görünür.

Aşağı royalti bəzən ucuzluq deyil, sadəcə fərqli yerdən alınan puldur.

5. “Bədəlsiz françayz” həqiqətən bədəlsizdirmi?

Bazarda “ad haqqı yoxdur”, “royalti yoxdur” deyən modellər də var. Bu, xüsusilə kiçik büdcəli sahibkar üçün cəlbedici görünür.

Amma biznesdə bədəlsiz model çox nadir hallarda həqiqətən bədəlsiz olur.

Belə modellərdə qazanc adətən üç yerdən çıxır:

françayz alana satılan məhsuldan;
aylıq minimum satış hədəfindən;
məcburi satınalma sistemindən.

Bu model pis model deyil. Hətta bəzi sektorlar üçün çox uyğun ola bilər. Amma sual dəyişmir:

Məhsulun qiyməti bazarla müqayisədə ədalətlidirmi?
Satış hədəfi realdırmı?
Məcburi alış françayz alanın marjasını öldürürmü?

Əgər məhsul qiyməti bazardan xeyli yuxarıdırsa, “royalti yoxdur” ifadəsi sahibkarı aldatmamalıdır. Royalti sadəcə məhsulun içinə gizlədilmiş ola bilər.

6. Françayz bədəllərini investor kimi necə oxumaq lazımdır?

Françayz almaq emosional qərar deyil. “Marka məşhurdur”, “loqosu güclüdür”, “hamı tanıyır” — bunlar yetərli deyil.

Investor françayz təklifinə üç sualla baxır:

1. Bu sistem mənim riskimi azaldırmı?

Françayzın əsas vədi budur: sən sıfırdan öyrənmirsən, sınanmış sistemə daxil olursan. Əgər sistem səni yenə tək buraxırsa, françayz almağın mənası azalır.

2. Bu bədəllər mənim marjamı qoruyurmu?

Restoran və kafe biznesində dövriyyə böyük görünə bilər, amma xalis mənfəət incədir. Food cost, əmək haqqı, kirayə, kommunal, vergi və platforma komissiyaları çıxıldıqdan sonra royalti və reklam bədəli real mənfəətə ciddi təsir edir.

3. Françayz verən mənim uğurumdan qazanırmı?

Ən sağlam modeldə françayz verən yalnız satış anında qazanmır. O, françayz alan böyüdükcə qazanır. Bu isə tərəflərin maraqlarını eyni istiqamətə gətirir.

Əgər françayz verən əsas pulu giriş bədəlindən və məcburi məhsul satışından qazanırsa, onun sənin uzunmüddətli uğuruna marağı zəifləyə bilər.

7. Müqavilədən əvvəl 10 sual

Françayz müqaviləsini imzalamazdan əvvəl bu suallar yazılı cavablandırılmalıdır:

Ad haqqına konkret nə daxildir?
Təlim neçə gün davam edir və kimlər üçün məcburidir?
Açılış öncəsi və açılış sonrası dəstək varmı?
Royalti faizlədir, yoxsa sabit məbləğdir?
Minimum royalti öhdəliyi varmı?
Reklam fondu necə xərclənir və hesabatı verilirmi?
Məcburi mal və avadanlıq alışı varmı?
Məcburi alış qiymətləri bazarla müqayisədə ədalətlidirmi?
Müqavilə müddəti bitəndə yenilənmə haqqı varmı?
Françayz alan müqavilədən çıxmaq istəsə, hansı şərtlər tətbiq olunur?

Bu sualların cavabı şifahi yox, yazılı olmalıdır.

Françayzda şifahi vəd riskdir. Yazılı öhdəlik isə due diligence-in başlanğıcıdır.

Yekun

Ad haqqı, royalti və reklam bədəli françayz sisteminin normal hissəsidir. Bu bədəllər düzgün qurulanda françayz alanın riskini azaldır, markanın gücünü qoruyur və şəbəkənin böyüməsinə xidmət edir.

Amma şəffaflıq yoxdursa, eyni bədəllər sahibkar üçün yükə çevrilir.

Françayz təklifinə baxanda yalnız “neçə faizdir?” sualını vermə. Daha dərin bax:

Nəyə ödəyirəm?
Qarşılığında nə alıram?
Bu ödəniş mənim marjamı necə dəyişir?
Françayz verən mənim uğurumdan qazanırmı?
Gizli xərclər haradadır?

Düzgün françayz modeli xərc yaratmır; sahibkarın təkbaşına qurmaqda çətinlik çəkəcəyi sistemi ona hazır verir.

DK Agency necə kömək edir?

DK Agency françayz müqaviləsindən əvvəl bədəl strukturunu, gizli xərcləri, məcburi alışları və müqavilə şərtlərini sahibkar adına dəyərləndirir.

Biz françayza sadəcə marka alışı kimi baxmırıq. Bizim üçün françayz iki tərəfin qazandığı, sistemi olan, ölçülə bilən və uzunmüddətli tərəfdaşlıq modelidir.

DK Agency ilə ilkin dəyərləndirmədə baxdığımız əsas sahələr:

ad haqqının qarşılığı;
royalti və reklam bədəlinin P&L təsiri;
məcburi satınalma şərtləri;
lokasiya və satış potensialı;
geri dönüş müddəti;
müqavilə riskləri;
françayz verənin real dəstək gücü;
mövcud françayz alanların təcrübəsi.

Növbəti addım: Qarşında françayz təklifi varsa, imzadan əvvəl DK Agency ilə ilkin dəyərləndirmə et. Françayz sövdələşmə deyil; doğru qurulanda sahibkar üçün riskin idarə olunduğu böyümə modelidir.

Mənbə xətti: beynəlxalq françayz təcrübəsi, FTC Françayz Disclosure Document yanaşması, IFA françayz bazarı məlumatları, Michael H. Seid və MSA Worldwide-un françayz due diligence yanaşması. Bu yazı ümumi məlumatdır, maliyyə və hüquqi məsləhət deyil.
$dkq$, dogan_note = $dkq$Sahibkar mənə gələndə ilk sualı çox vaxt bu olur: “Ad haqqı neçəyədir?”

Mən isə əvvəl bunu soruşuram: “Qarşılığında nə alırsan?”

Çünki françayzda bahalı görünən model bəzən daha təhlükəsiz ola bilər.$dkq$, updated_at = now()
WHERE id = 151 AND md5(content_az) = '1bb0fcdb4221cf8af31047cb88d274b3' AND md5(coalesce(dogan_note, '')) = '83bd87ed4b6b387d1c89632f47517d8d';

-- haccp-restoranlar-ucun-yeni-teleb-deyil-yeni-olan-onun-olculeceyidir
UPDATE blog_posts SET content_az = $dkq$Yeni Dövlət Proqramı ilə bağlı xəbərlərin əksəriyyətində eyni başlıq var: "qida müəssisələrinin 80%-ində HACCP tətbiq olunacaq."

Sənədi tam incələdim. Bu başlıq doğrudur, amma tək başına yanlış təəssürat yaradır. Çünki HACCP ictimai iaşə üçün yeni gələn bir tələb deyil.

## Əvvəlcə faktı dəqiqləşdirək

"Qida təhlükəsizliyi haqqında" Azərbaycan Respublikasının Qanunu, maddə 19.3: qida subyektləri qida məhsullarının istehlak olunduğu ictimai iaşə və xidmət obyektlərində HACCP-a əsaslanan prosedurları tətbiq etməli və bu prinsiplərə əsaslanan qida təhlükəsizliyinə daxili nəzarət sisteminə malik olmalıdırlar.

Yəni öhdəlik artıq mövcuddur.

Onda Dövlət Proqramı nə gətirir? Bir cümlə ilə: ölçmə.

Təcrübəmə görə, tənzimləmədə ən böyük fərq qaydanın yazılması ilə onun ölçülməyə başlanması arasındadır. Yazılmış, amma ölçülməyən qayda zamanla formallaşır. Ölçülməyə başlayan qayda isə real əməliyyat məsələsinə çevrilir.

Proqram ölçməni necə qurur

Dörd tədbir birlikdə oxunmalıdır.

8.4.1 — metodiki tövsiyələr hazırlanır, təlimlər keçirilir, sonda 80% hədəfi ölçülür. Diqqət çəkən məqam 6.1.4.4 bəndindədir: orada "HACCP-ın düzgün tətbiq edilməməsi" ayrıca risk kimi göstərilir və bunun yoxlanılması nəzərdə tutulur. Yəni yalnız sənədin varlığı deyil, düzgün tətbiqi yoxlanacaq.

8.8.3 — AQTİS-də vahid izləmə altsistemi. İstehsaldan son istehlakçıya qədər hər mərhələ. Restoran bu zəncirin son halqasıdır.

8.8.1 — AQTA ilə Səhiyyə, İqtisadiyyat, Kənd Təsərrüfatı nazirlikləri və digər qurumlar arasında real vaxt rejimində məlumat mübadiləsi.

8.8.7 — AQTİS-də risklərin və potensial problemlərin təhlili üçün süni intellekt modeli (2027–2030).

Bunları yan-yana qoyanda mənim proqnozum belədir: yoxlama prioritetləri təsadüfi seçilməyəcək. Şikayət, zəhərlənmə halı və laborator nəticə müəssisənin risk profilinə daha sürətlə əks olunacaq. Məlumatı səliqəli olan daha seyrək, dağınıq olan daha tez-tez yoxlanacaq.

Qeyd: 80% hədəfinin hansı bazadan hesablanacağı sənəddə göstərilməyib. Bu, dəqiqləşdirilməli məsələdir.

Sistemin işlədiyini göstərən beş şey

Müşavir kimi bir çox müəssisədə eyni mənzərəni gördüm: HACCP qovluğu var, amma jurnallar boşdur. Yoxlanacaq olan budur.

Temperatur qeydləri — hər gün, boşluqsuz. Ən çox rast gəldiyim nöqsan həftəsonu boşluqlarıdır.
Tədarükün qəbul qeydi — kimdən, nə vaxt, hansı temperaturda, hansı vəziyyətdə.
Təmizlik cədvəli — imzalı və real.
Düzəldici tədbir qeydi — problem yazılıb, həlli də yazılıb. Heç bir problemin qeyd olunmadığı jurnal inandırıcı deyil.
Heyət təlimi — kim, nə vaxt, nəyi öyrənib.

Bunların hamısı kağızla da aparıla bilər. Amma rəqəmsal jurnal və avtomatik temperatur sensoru həm vaxt qazandırır, həm də gələcək AQTİS inteqrasiyası üçün hazır məlumat yaradır.

Tədarük sənədi artıq mühasibat işi deyil

İzləmə sistemi qurulduqda "bu məhsulu haradan aldınız" sualına sənədlə cavab verə bilməyən müəssisə çətin vəziyyətdə qalır.

Qaimə, baytarlıq sənədi, partiya nömrəsi və son istifadə tarixi — bunlar müəssisənin hüquqi müdafiəsidir. Ən zəif halqa sənədsiz tədarükçüdür.

Nə vaxt nə olacaq
2027–2028: metodiki tövsiyələr, təlimlər, pilot layihələr — hazırlıq dövrü
2029-dan sonra: ölçmə və hesabatlılıq
2031–2032: hədəflərin qiymətləndirilməsi

Nəzarət quruluşuna da diqqət yetirmək lazımdır: Sərəncama əsasən icraya nəzarəti AQTA aparır və ildə bir dəfə Prezidentə hesabat verir; monitorinq və qiymətləndirməni isə İqtisadi İslahatların Təhlili və Kommunikasiya Mərkəzi həyata keçirir. 

Yerinizdə olsam, 2027-ni gözləməzdim. Bu gün jurnalları açıb son bir həftəyə baxardım. Orada gördüyünüz mənzərə, 2029-da yoxlayıcının görəcəyi mənzərədir.

Sənəd sektora yeni bir yük gətirmir. Sistemli işləyən müəssisə ilə işləməyəni bir-birindən ayırır.
$dkq$, updated_at = now()
WHERE id = 152 AND md5(content_az) = 'e228a608911d69643b582fb1c7a46cce' AND md5(coalesce(dogan_note, '')) = 'd7b7ec5946e9c2ca3eaaeb6a1149b8ca';

-- qonaq-ve-isci-axini-zal-trafiki
UPDATE blog_posts SET content_az = $dkq$*Seriya: Məkan pul qazandırırmı? — 2/3*

---

Restorana girirsən. Hər şey gözəldir, amma içində bir narahatlıq var:
- ofisiant arxandan hər keçəndə stuluna toxunur,
- tualetə getmək üçün üç masanın arasından yan-yana keçirsən,
- mətbəx qapısı hər açılanda qazan səsi və qızartma qoxusu üzünə vurur,
- əlində isti şorba olan ofisiantla tualetdən qayıdan uşaq qapıda az qala toqquşur.

Buna **kor plan** deyilir. [1-ci yazıda](/blog/memarla-ortaq-dil-restoran-konsepti) məkanın 7 dayağını, [spagetti diaqramında](/blog/metbexde-her-gun-itirilen-metrler-spagetti-diaqrami-ile-addim-xeritesi) bir işçinin yolunu xəritəyə çəkməyi danışdıq. Bu yazıda iki böyük axını — **qonaq axını** ilə **işçi axınını** — bir-birinə mane olmadan necə quracağımızı açırıq.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DOĞAN TOMRİS**                                      ║
> ║ DK Agency qurucusu, 40 illik HoReCa təcrübəsi            ║
> ║                                                          ║
> ║ *"Çirkli qabla təzə yemək eyni yoldan keçirsə,            ║
> ║  ofisiantla qonaq eyni dəhlizdə toqquşursa —              ║
> ║  orada servis yoxdur, qəzanı gözləyən xaos var."*         ║
> ║                                                          ║
> ║ 📖 Sahə qeydi                                             ║
> ╚══════════════════════════════════════════════════════════╝

---

## 1. Zalda məsafələr

Sahibkar düşünür: *«On masa da artıq qoysam, çox qazanaram.»* Zal həddən artıq dolanda qonaq qonşu masanın söhbətini eşidir, stulunu çəkmək məcburiyyətində qalır — və bir daha gəlmir.

> ⚠️ **Xəbərdarlıq:** Aşağıdakılar **tövsiyə aralığıdır**, standart deyil. Konsept, qonaq tipi, yanğın və əlçatanlıq normalarına görə layihəçin dəqiqləşdirməlidir.

- **Əsas keçid** (qapı → kassa → tualet): təxminən **110–120 sm** — iki nəfər rahat keçsin.
- **Arxa-arxaya oturan iki masanın stulları arası:** təxminən **90–105 sm** — ofisiant əlində podnosla heç kimə toxunmadan keçsin.
- **Kvadrat yemək masası:** təxminən **80 × 80 sm.** Masaya ortaq qablar çox gəlirsə, masanı enindən yox, uzunundan böyüt (məs. 120 × 80 sm).

---

## 2. Qonaq tipinə görə zonalar

Bütün qonaqları eyni yerə oturtma:

1. **Tək gələnlər:** böyük masanın ortasında tək oturmaq istəmir. Bar piştaxtası, pəncərə önü hündür stul, divar boyu kiçik masa — küçəyə və ya barmenə baxa bilsin.
2. **Cütlüklər:** kənar, künc, divanlı künc masası. Qapı ağzına və tualet yoluna oturtma.
3. **Qruplar və ailələr:** zalın mərkəzi, birləşdirilə bilən böyük masalar — canlılıq ora yaraşır.
4. **İş görüşü:** sakit, səsi az olan, rozetkası olan yer.

---

## 3. Mətbəxlə zal arasında üçbucaq

Ofisiantın dövrəsi: çıxış pəncərəsi → masa → boşalan boşqab → qabyuyan → servis stansiyası → yenə pəncərə.

- **Çıxış pəncərəsi, qabyuyanın qəbul yeri və servis stansiyası** bir-birinə ən yaxın nöqtədə olmalıdır.
- Ofisiantın yolu **dairəvi** olmalıdır — geri qayıdan, kəsişən xətt olmasın.
- Menecer zalı və çıxış pəncərəsini mümkün qədər bir yerdən görə bilməlidir. Görünməyən künc — idarə olunmayan küncdür.

---

## 4. Məhsulun yolu: qəbuldan boşqaba

Hər restoranda məhsulun təbii yolu var:

**Mal qəbulu → yoxlama → soyuq/quru anbar → hazırlıq → bişirmə → çıxış pəncərəsi → servis → kirli qayıdış → yuma → təmiz saxlama**

Bu yol **geri qayıdırsa, kəsişirsə, bir yerdə sıxılırsa** — hər gün əlavə addım, gözləmə və səhv doğurur. Mal qəbulu qonaq girişindən keçməməlidir.

---

## 5. Qabyuyan: tək istiqamət qaydası

**Kirli qəbul → qalıqların sıyrılması → ön yuma → maşın → təmiz çıxış → rəf**

- Kirli qab bir tərəfdən girir, təmiz qab o biri tərəfdən çıxır. Heç vaxt eyni masada görüşmürlər.
- **Kirli qab masasını böyük qoyma.** Böyük masa dolur — kirli qab yığılır, heç kim yumur, təmiz boşqab qurtarır. Kiçik qəbul yeri axını maşına məcbur edir.
- Təmiz boşqab çıxış pəncərəsinin rəflərinə ən qısa yoldan çatmalıdır.

---

## 6. Kuryer yolu və sürət

Wolt, Bolt, Yango kuryeri böyük çantası ilə romantik şam edən cütlüyün yanından keçəndə bütün ab-hava dağılır.

- Çatdırılma sifarişləri üçün **ayrıca kuryer pəncərəsi və ya yan qapı.** Kuryer qonaq zalına girməməlidir.
- **Sürət bizim DNA-mızdır:** mükəmməl olmaqdan əvvəl sürətli olmaq — şikayətə tez cavab, problemi tez aradan qaldırmaq, tez qərar, tez sifariş, tez çatdırılma. Plan buna kömək etməlidir, mane yox.

---

## 7. Təhlükəsizlik və əlçatanlıq

- **Təxliyə yolu** qonaq axını çəkiləndən sonra əlavə edilən detal deyil — əvvəlcədən planlanır və heç vaxt bağlanmır.
- Əlil arabası ilə gələn qonaq girişdən masaya və tualetə maneəsiz çata bilməlidir.
- İsti qazan xətti ilə ofisiant keçidi kəsişməməlidir.

---

## YOXLAMA SİYAHISI — Zalın trafiki

| # | Sahə | Yoxla | Status |
|---|---|---|---|
| 1 | Əsas keçid | Qapıdan tualetə yol təxminən 110 sm-dən dar deyil | ☐ |
| 2 | Masalar arası | Stullar arxasında ofisiant yolu var | ☐ |
| 3 | Tək qonaq | Pəncərə önü və ya bar kənarında tək oturacaq var | ☐ |
| 4 | Üçbucaq | Pəncərə, qabyuyan qəbulu, servis stansiyası yaxındır | ☐ |
| 5 | Qabyuyan | Kirli giriş və təmiz çıxış ayrıdır | ☐ |
| 6 | Mal qəbulu | Qonaq girişindən keçmir | ☐ |
| 7 | Kuryer | Zala girmədən sifarişi götürür | ☐ |
| 8 | Təxliyə | Yol açıqdır, işarələnib | ☐ |

---

> 📝 **DOĞAN NOTU:** "Restoranda menyudan əvvəl masaların arasına baxıram. Ofisiant yemək gətirəndə qonşu masadakı qonaq stulunu çəkməyə məcbur olursa, orada servis yoxdur. Qonağa ən böyük hörmət onun yerinə, məsafəsinə hörmətdir."

---

> **💡 DK Agency:** Növbə yükü və işçi sayı üçün [İşçi planlayıcısı](/toolkit/personel-planlayici), mətbəx stansiyaları üçün [Mətbəx stansiyaları](/toolkit/metbex-istasyon).
>
> 🌐 dkagency.com.tr | 📍 Bakı, Azərbaycan
$dkq$, updated_at = now()
WHERE id = 157 AND md5(content_az) = 'eb5dd03e24db9ca4dd8af2650f5055f1' AND md5(coalesce(dogan_note, '')) = 'd41d8cd98f00b204e9800998ecf8427e';

-- vitrin-isti-noqteler-kassa-onu
UPDATE blog_posts SET content_az = $dkq$Qonaq piştaxtaya yaxınlaşır. Sizcə vitrindəki hər şeyi oxuyur, tərkibini müqayisə edir, sonra ən ağıllı seçimi edir?

**Xeyr.** Bir neçə saniyə baxır. Gözü bütün vitrini görmür — yalnız ilk düşdüyü bir-iki nöqtəni görür. Bunlara **isti nöqtələr** deyilir.

Ən çox qazandıran məhsulun vitrinin alt küncündə, qaranlıq yerdədirsə, orada quruyub gedəcək. Həmin məhsulu isti nöqtəyə qoysan, heç kim bir söz deməsə də daha çox satılacaq.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DOĞAN TOMRİS**                                      ║
> ║ DK Agency qurucusu, 40 illik HoReCa təcrübəsi            ║
> ║                                                          ║
> ║ *"Yaxşı vitrin dilsiz satıcıdır. Qonaq vitrinə             ║
> ║  baxıb 'burada nə var?' deyə soruşursa,                   ║
> ║  o vitrin işini görmür."*                                 ║
> ║                                                          ║
> ║ 📖 Sahə qeydi                                             ║
> ╚══════════════════════════════════════════════════════════╝

---

## 1. Göz səviyyəsi — satış səviyyəsi

Pərakəndə satışın köhnə qaydası: **«göz səviyyəsi — alış səviyyəsi».** İnsan yuxarı baxmağı, aşağı əyilməyi sevmir. Böyük adamın göz xətti təxminən döşəmədən **120–150 sm** hündürlükdədir — vitrinin ən qiymətli zolağı budur.

- Bu zolağa **ən çox qazandıran** məhsulu qoy. Ən bahalını yox, ən **marjalısını**.
- Hansının marjalı olduğunu bilmirsənsə, əvvəl [Menyu Matrisi](/toolkit/menu-matrix) ilə «ulduz» məhsullarını tap.
- Aşağı rəflər: ucuz, tez satılan, soruşulan məhsullar — onları qonaq onsuz da axtarır.

**Sağ tərəf haqqında:** bir çox satış məsləhətçisi gözün mərkəzdən sağa sürüşdüyünü müşahidə edir. Bunu qanun kimi qəbul etmə — **sına.** Ulduz məhsulu 2 həftə mərkəzdə, 2 həftə mərkəz-sağda saxla, satışı müqayisə et.

---

## 2. Kassa önü: anlıq alış

Qonaq sifarişi verib, kartını çıxarıb. Qərar verilib, müqavimət düşüb. Bu anda kassanın yanında gözünə dəyən kiçik, ucuz, ələ tez gələn məhsul — peçenye, paketli qoz-fındıq, kiçik şokolad — asanlıqla «bunu da əlavə edin» olur.

Qaydalar:
- Kassa önünə **böyük, ağır, bahalı** məhsul qoyma.
- Tək götürülən, çeki çox böyütməyən, 1,5–3₼ aralığında məhsul.
- Gün ərzində **yenilə:** səhər qəhvə yanına kiçik bulka, günorta şokolad, axşam evə aparmaq üçün desert.

**Nümunə hesablama** *(öz rəqəmlərini qoy)*: gündə 300 çek, onların 10%-i kassa önündən 2₼-lıq məhsul alır → gündə 60₼, ayda (30 gün) **1 800₼** əlavə dövriyyə.

---

## 3. Saata görə dəyişən vitrin

Vitrini səhər necə düzürsənsə, axşama qədər elə saxlama. Gün hissələri dəyişdikcə isti nöqtədəki məhsul da dəyişməlidir:

| Saat | İsti nöqtədə | Məqsəd |
|---|---|---|
| 08:00 | Təzə kruassan, isti bulka, qəhvə | Tələsən qonağa hazır səhər yeməyi |
| 12:30 | Günün dəsti, təzə salat, sendviç | Qərarsız qonağı tez sifarişə gətirmək |
| 15:30 | Parlaq desertlər, çizkeyk, vafli | Qəhvənin yanına desert satmaq |
| 19:00 | Premium desert, imza yeməyin görüntüsü | Çeki və təcrübəni böyütmək |

Niyə bu saatlar — [Gün Hissələri](/blog/gun-hisseleri-olu-saatlar-gelir) yazısında.

---

## 4. İşıq: yemək əvvəl gözlə yeyilir

- Vitrində **soyuq ağ və ya mavimtıl işıq** yeməyi cansız göstərir. İsti işıq (**2700–3000K**) bulkanın qızılı rəngini, ətin şirəsini göstərir.
- Bütün vitrini eyni işıqla doldurma. **2–3 ulduz məhsulun üstünə** ayrıca spot yönəlt — göz ən parlaq nöqtəyə gedir.
- İşıq şüşədə əks olunmamalıdır — qonaq yeməyi yox, lampanı görər.

İşığın bütün məkandakı qatlarını [3 Qatlı İşıq](/blog/isiq-qoxu-musiqi-ayrilma-ani) yazısında açırıq.

---

## YOXLAMA SİYAHISI — Bu gün vitrinə bax

| # | Addım | Status |
|---|---|---|
| 1 | Göz səviyyəsində hansı məhsul durur? Ən marjalı məhsuldurmu? | ☐ |
| 2 | Ulduz məhsullar Menyu Matrisi ilə təyin edilib | ☐ |
| 3 | Vitrindəki soyuq işıq isti işıqla əvəz olunub | ☐ |
| 4 | Kassa yanında 1,5–3₼-lıq anlıq alış məhsulu var | ☐ |
| 5 | Saat 15:00-da vitrini desertə çevirmək komandaya tapşırılıb | ☐ |
| 6 | Mərkəz / mərkəz-sağ sınağı üçün 4 həftəlik qeyd cədvəli açılıb | ☐ |

---

> 📝 **DOĞAN NOTU:** "Ən bahalı vitrini alıb içinə ucuz soyuq lampa taxan çox görmüşəm. Desert keçən həftədən qalmış kimi görünür. Restoran işi xırdalıqların elmidir — bəzən bir lampa bütün vitrini dəyişir."

---

> **💡 DK Agency:** Hansı məhsul ulduzdur, hansı zərər edir — [Menyu Matrisi](/toolkit/menu-matrix). Ofisiantın masada satışı üçün — [Garson Sifariş Almır, Satış Edir](/blog/garson-satis-upsell-salon-gelir).
>
> 🌐 dkagency.com.tr | 📍 Bakı, Azərbaycan
$dkq$, updated_at = now()
WHERE id = 155 AND md5(content_az) = '11eeca46265f698831f0a1d80ad06d81' AND md5(coalesce(dogan_note, '')) = 'd41d8cd98f00b204e9800998ecf8427e';

-- memarla-ortaq-dil-restoran-konsepti
UPDATE blog_posts SET content_az = $dkq$*Seriya: Məkan pul qazandırırmı? — 1/3*

---

Sahibkar memar tapır və deyir: *«Filan yerdə gözəl restoran var, İnstaqramda hamı bəyənir. Mənə də elə bir şey çək — modern olsun, fərqli olsun.»*

Memar kompüterdə gözəl rənglər, çılçıraqlar, divar örtükləri çəkir. Şəkil nağıl kimidir.

İnşaat bitir, böyük pul xərclənir, qapı açılır. Və ilk həftə başlayır:
- girişdə adamlar bir-birinə dəyir,
- ofisiant mətbəxdən çıxanda qonağın dirsəyinə toxunur,
- tualetin qapısı birbaşa masanın üstünə açılır,
- barmen stəkan yumaq üçün qonağa arxasını çevirir.

Sahibkar memarı günahlandırır. Memar deyir: *«Sən gözəl şəkil istədin, mən də çəkdim.»*

**Günahkar kimdir? İkisi də.** Aralarında ortaq dil yox idi. Sahibkar əməliyyatı texniki dillə danışa bilmir. Memar restoranın içində kimin hara qaçacağını bilmir.

Restoran memarlığı gözəl şəkil deyil. **Satan, işçini yormayan, qonağı rahatlayan bir iş məkanı qurmaqdır.** Dünyada buna xidmət məkanı psixologiyası (*servicescape*) deyilir. Bu seriyada həmin dili addım-addım qururuq.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DOĞAN TOMRİS**                                      ║
> ║ DK Agency qurucusu, 40 illik HoReCa təcrübəsi            ║
> ║                                                          ║
> ║ *"Memar məkanın libasını tikir, amma o libasın            ║
> ║  içində qaçan sənin ofisiantındır. Dizaynerə               ║
> ║  'məni bəzə' demə — ona işin anatomiyasını ver."*         ║
> ║                                                          ║
> ║ 📖 Sahə qeydi                                             ║
> ╚══════════════════════════════════════════════════════════╝

---

## Məkanın 7 dayağı — qonağın yolu ilə

Məkanı divar kimi yox, qonağın addım-addım keçdiyi yol kimi düşün.

```
[1. İLK TƏSİR] ──► [2. GİRİŞ ANI] ──► [3. AXIN]
 (küçə, fasad)      (rahatlama)        (görünməz trafik)
                                              │
                                              ▼
[7. AYRILMA] ◄── [6. İŞIQ] ◄── [5. MARKA] ◄── [4. NÜMAYİŞ]
 (son yaddaş)                                 (canlı mətbəx, bar)
```

### 1. İlk təsir — qonaq hələ içəri girməyib
Qarşı səkidən keçən adam bir neçə saniyədə qərar verir: *«Girim, yoxsa keçim?»*
- **Fasad** qiymət səviyyəsini küçəyə deyir: təbii ağac, daş, qara metal — hər biri fərqli mesajdır.
- **Pəncərəni bağlama.** Qonaq içəridəki həyatı görməlidir: işləyən usta, dolu masa, işıq. Kampaniyanı pəncərədə **birtərəfli görünən plyonka** ilə elan edə bilərsən — içəridən baxış kəsilmir.
- **Uzaqdan görünən işıq.** Gecə də oxunan, uzaqdan seçilən lövhə və fasad işığı.
- **Foto guşəsi.** Qonağın öz telefonu ilə çəkmək istəyəcəyi bir yer — marketinq komandası ilə birlikdə planla.
- Küçə reklamı və görünüş üzərində marketinqlə ayrıca işlə.

### 2. Giriş anı — rahatlama zonası
Qapı açıldı. Qonaq küçənin səs-küyünü, küləyini, tələsikliyini çöldə qoymalıdır.
- **Girişdə daralma olmasın.** Qapıdan dərhal masa, kassa, növbə çıxmamalıdır. Giriş geniş və nəfəs alan olmalıdır.
- **Küçədən giriş və zala giriş ayrı planlanır.** Qapının önü bir iş görür, zala keçid başqa iş görür.
- **Bizim qoxumuz.** Məkanın imza qoxusu seçilir: təzə qəhvə, şokolad, təzə çörək. Girişdə gül.
- **Girən qonaqla çıxan qonaq sürtünməsin.**
- Qarşılamanın insan tərəfini [İlk 5 Dəqiqə Hər Şeyi Həll Edir](/blog/ilk-5-deqiqe-qonaq-qarsilama) yazısında danışmışıq.

### 3. Axın — görünməz trafik
Qonaq heç bir ox işarəsi olmadan kassanı, boş masanı, tualeti tapmalıdır. İşçinin yolu ilə qonağın yolu kəsişməməlidir. Ölçülər, zonalar və mətbəx-zal əlaqəsi seriyanın 2-ci yazısındadır: [Qonaq və İşçi Axını](/blog/qonaq-ve-isci-axini-zal-trafiki).

### 4. Nümayiş və təmas — yeməyi səhnəyə çıxar
- Şüşə arxasında xəmir açan usta, parlayan qəhvə maşını, şərab dolabı, ət yetişdirmə soyuducusu — məkanın görünən yerinə.
- **Sıra və sifariş idarəsi:** qonaq harada gözləyir, harada sifariş verir, harada götürür? Növbə zalın içinə uzanmamalıdır.
- **Kassa və texnologiya:** ödəniş yeri, ekranlar, QR menyu — sonradan divara yapışdırılmasın, planda olsun.
- **Gələcəyi düşün:** mətbəx bu gün bir menyu üçün qurulur, sabah menyu böyüyəcək. Avadanlıq üçün yer, elektrik və su ehtiyatı saxla.
- Vitrinin öz qaydaları — [Vitrinin İsti Nöqtələri](/blog/vitrin-isti-noqteler-kassa-onu).

### 5. Marka toxunuşu
Marka divara 3 metrlik loqo deyil. Marka **materialda, rəngdə, formada** hiss olunur. Təbii və sağlam konseptsənsə — canlı bitki, gil qab, yonulmamış ağac. Məkanın içində mesajların iyerarxiyası olsun: hansı mesaj girişdə, hansı masada, hansı kassada? Hər divara hər şeyi yazma. Markanın özünü [Restoran Markası = Loqo Deyil](/blog/restoran-markalasma-konsept) yazısında açmışıq.

### 6. İşıq
Məkanın ruhunu ən çox dəyişən qat. Üç qatlı işıq sistemi seriyanın 3-cü yazısındadır.

### 7. Ayrılma
Qonaq hesabı ödəyib çıxanda ağlında nə qalır? Çıxan hər qonağın yaddaşında bir marka mesajı qalmalıdır. Bunun psixologiyası da 3-cü yazıdadır: [İşıq, Qoxu, Musiqi və Ayrılma Anı](/blog/isiq-qoxu-musiqi-ayrilma-ani).

---

## Memara 12 sual — təmirdən əvvəl bu sənəd hazır olsun

Memara «sən bilərsən» demə. Ona aşağıdakı sualların **yazılı cavabını** ver. Cavabı olmayan sual — gələcəkdə sökülən divardır.

| # | Sual | Niyə vacibdir |
|---|---|---|
| 1 | Konsept nədir, hədəf qonaq kimdir? (gənclər, ailə, iş adamları, turist) | Material, işıq, masa ölçüsü bundan asılıdır |
| 2 | Gün hissələri: səhər, nahar, axşam — hansılarda işləyirik, pikdə neçə qonaq? | Kassa, növbə yeri, mətbəx gücü |
| 3 | Menyu və avadanlıq siyahısı — ölçüləri, elektrik gücü, su və qaz ehtiyacı ilə | Memar avadanlığı bilmədən mətbəx çəkə bilməz |
| 4 | Oturacaq sayı və zona qarışığı: tək, cüt, qrup, ailə, iş görüşü | Zalın bölgüsü |
| 5 | Mal qəbulu hansı qapıdan? Anbar, soyuq anbar harada? | Məhsul yolu qonaq yolunu kəsməməlidir |
| 6 | Mətbəx, çıxış pəncərəsi, bar, qabyuyan bir-birinə necə bağlanır? | Hər gün ödənən addım |
| 7 | Kuryer haradan girir, harada gözləyir? | Kuryer zala girməməlidir |
| 8 | Havalandırma: mətbəx və tualet qoxusu zala qayıtmasın; imza qoxu haradan gəlir? | Qoxu ilk təəssüratdır |
| 9 | İşıq ssenarisi: səhər, nahar, axşam — hər biri necə görünür? | İşığı sonradan dəyişmək bahadır |
| 10 | Əlçatanlıq və təxliyə yolu | Qanun və təhlükəsizlik — sonradan əlavə olunmur |
| 11 | Texniki infrastruktur: baca, elektrik gücü, su, drenaj — mövcud bina buna imkan verirmi? | Ucuz obyekt bahalı çıxmasın |
| 12 | Büdcə tavanı + ehtiyat, və təsdiq mərhələləri: eskiz → axın yoxlaması → texniki layihə → smeta → tikinti | Hər mərhələdə sən imza atırsan, sonra yox |

> ⚠️ **Axın yoxlaması (12-ci sualın ən vacib mərhələsi):** Memarın eskizi gələndə onun üstündə [spagetti diaqramı](/blog/metbexde-her-gun-itirilen-metrler-spagetti-diaqrami-ile-addim-xeritesi) çək — bir ofisiantın, bir aşpazın, bir qonağın yolunu. Xətlər kəsişirsə, texniki layihəyə keçmə.

---

## Bir memarla uzun müddət işlə

Hər yeni filialda yeni memar — hər dəfə sıfırdan dil öyrətmək deməkdir. Səninlə davamlı işləyən, sənin standartlarını bilən bir memarlıq firması tap. **İstiqaməti sən ver**, layihəni o çəksin. Marka zamanla yenilənəcək — bunu da o firma səninlə birlikdə edəcək.

---

> 📝 **DOĞAN NOTU:** "Memara 'sən bilərsən' deyən sahibkar, altı ay sonra divarı çəkiclə sökən sahibkardır. Memar sənətkardır, xəyalları gözəldir. Amma o restoranda kirayəni sənət yox, düzgün işləyən kvadratmetr ödəyəcək."

---

> **💡 DK Agency:** Təmirə başlamazdan əvvəl [İnşaatdan açılışa: yoxlama siyahısı](/toolkit/insaat-checklist). Açılışda edilən ən bahalı səhvlər — [Restoran Açarkən Səhvlər](/blog/restoran-acarken-sehvler). Planını bizə göndərmək istəyirsənsə — [əlaqə](/elaqe).
>
> 🌐 dkagency.com.tr | 📍 Bakı, Azərbaycan
$dkq$, updated_at = now()
WHERE id = 156 AND md5(content_az) = '01ebaec6caf77a03f9a7ba2dbcb77628' AND md5(coalesce(dogan_note, '')) = 'd41d8cd98f00b204e9800998ecf8427e';

-- gun-hisseleri-olu-saatlar-gelir
UPDATE blog_posts SET content_az = $dkq$Saat 15:30. Zalda 20 masadan 2-si doludur. Ofisiantlar küncdə telefona baxır, işıqlar yanır, kondisioner işləyir, icarə saatı işləyir.

Sahibkar deyir: *«Nahar birtəhər, axşam birtəhər. Arada restoran boşdur.»*

Səbəb qonaqlar deyil. Səbəb odur ki, restorana **tək bir iş** kimi baxırsan. Səhər də, nahar da, günorta da, axşam da — eyni menyu, eyni vitrin, eyni musiqi.

Halbuki səhər tələsən qonaqla axşam dostları ilə oturan qonaq eyni adam deyil. Uğurlu restoran gün ərzində **5 fərqli iş** kimi işləyir. Dünyada buna *day part*, bizdə **gün hissələri idarəetməsi** deyilir.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DOĞAN TOMRİS**                                      ║
> ║ DK Agency qurucusu, 40 illik HoReCa təcrübəsi            ║
> ║                                                          ║
> ║ *"Səhər tələsən adamla axşam məclis quran adam            ║
> ║  eyni masada otura bilər, amma eyni qonaq deyil.          ║
> ║  Onlara eyni menyunu versən, günün yarısını itirərsən."*  ║
> ║                                                          ║
> ║ 📖 Sahə qeydi                                             ║
> ╚══════════════════════════════════════════════════════════╝

---

## Bir gün — beş fərqli qonaq

> *Saatlar tipikdir. Öz saatlarını kassa (POS) hesabatından götür.*

### 1. Səhər (06:30–10:30): tələsən qonaq
- **Nə istəyir:** sürət, təzəlik, enerji. Oturmağa vaxtı yoxdur.
- **Nə təklif et:** təzə qəhvə, isti kruassan, sendviç, **götürüb aparmaq üçün** hazır qablaşdırma.
- **Hədəf:** sürətli çek, növbə yaranmasın.

### 2. Nahar (11:30–14:30): vaxtı az qonaq
- **Nə istəyir:** doyumlu yemək, ağlabatan qiymət, tez servis. Fasiləsi 45–60 dəqiqədir.
- **Nə təklif et:** günün nahar dəsti (şorba + əsas yemək + içki), menyunun ən tez çıxan yeməkləri önə.
- **Hədəf:** masa dövriyyəsi — qonaq doysun, tələsdirilmədən vaxtında getsin, yerinə növbəti otursun.

### 3. Günorta — ölü saatlar (14:30–17:00): fürsət saatı
- **Kimdir:** sərbəst işləyənlər, tələbələr, qeyri-rəsmi görüşlər, alış-verişdən yorulanlar.
- **Nə istəyir:** rahatlıq, sakitlik, şirin bir şey.
- **Nə təklif et:** əsas yemək yox — «qəhvə + desert» dəsti, çay dəsti, vafli, krep, yüngül qəlyanaltı.
- **Hədəf:** boş duran işçi və icarə saatını yüksək marjalı satışla ödəmək.

### 4. Axşam (18:00–21:30): əsas qazanc
- **Kimdir:** ailələr, cütlüklər, dostlar. Tələsmir, 1,5–2 saat qalmaq istəyir.
- **Nə istəyir:** diqqətli servis, ləzzət, təqdimat.
- **Nə təklif et:** imza yeməklər, qril, ortaq qəlyanaltı boşqabları, içki və desert.
- **Hədəf:** orta çeki böyütmək. Burada tələsdirmək zərərdir — ikinci içkini, deserti təklif et. Necə təklif edəcəyini [Garson Sifariş Almır, Satış Edir](/blog/garson-satis-upsell-salon-gelir) yazısında danışmışıq.

### 5. Gecə (22:00-dan sonra): gənclər və gec işləyənlər
- **Nə təklif et:** tez hazırlanan, əllə yeyilən qəlyanaltılar, souslu qanadlar, burger, isti çörək arası.
- **Hədəf:** yüksək marjalı qəlyanaltı və içki. Ağır qazan yeməyi bu saatın məhsulu deyil.

---

## Xülasə cədvəli

| Saat | Qonaq | Menyu önə | Vitrinin mərkəzi | Atmosfer | Hədəf |
|---|---|---|---|---|---|
| 06:30–10:30 | Tələsir | Qəhvə, kruassan, sendviç | Təzə bulka, qəhvə stəkanları | Gümrah, işıqlı | Sürətli çek |
| 11:30–14:30 | Vaxtı azdır | Nahar dəsti, günün şorbası | Günün dəsti, salatlar | Templi | Masa dövriyyəsi |
| 14:30–17:00 | Dincəlir | Qəhvə + desert | Parlaq desertlər | Sakit | Ölü saatı canlandır |
| 18:00–21:30 | Məclis qurur | İmza yemək, qril, içki | Premium desert | Yavaş, isti işıq | Orta çek |
| 22:00+ | Əylənir | Qəlyanaltı, burger | Qəlyanaltı | Canlı | Marjalı qəlyanaltı |

Vitrini saata görə dəyişməyi [Vitrinin İsti Nöqtələri](/blog/vitrin-isti-noqteler-kassa-onu), musiqi və işığı [3 Qatlı İşıq, Qoxu və Ayrılma Anı](/blog/isiq-qoxu-musiqi-ayrilma-ani) yazısında açırıq.

---

## Həftənin günləri də fərqlidir

Bazar ertəsinin nahar qonağı ilə cümə axşamının axşam qonağı eyni deyil. Həftəsonu səhər yeməyi ayrıca bir iş ola bilər. Cədvəli yalnız saata görə yox, **günə görə** də qur: hansı gün hansı hissə güclüdür, hansı zəifdir?

---

## Haradan başlamaq? 4 həftəlik plan

1. **1-ci həftə:** kassa sistemindən saatlıq satış hesabatını çıxar. Ən zəif 2 saatı tap.
2. **2-ci həftə:** o saatlar üçün **bir** təklif hazırla (məs. «qəhvə alana desert yarı qiymətə»). Menyuya, vitrinə, girişə qoy. Ofisiantlara nə deyəcəklərini öyrət.
3. **3-cü həftə:** hər gün həmin saatların çek sayını və orta çekini yaz.
4. **4-cü həftə:** müqayisə et. İşləyirsə saxla, işləmirsə təklifi dəyiş — saatı yox.

**Nümunə hesablama** *(öz rəqəmlərini qoy)*: 14:30–17:00 arasına gündə 15 əlavə çek × 7₼ × 26 gün = **2 730₼ əlavə dövriyyə/ay.** Marjanı [Menyu Matrisi](/toolkit/menu-matrix) ilə yoxla — ucuz deyil, **qazandıran** məhsul təklif et.

---

## YOXLAMA SİYAHISI

| # | Addım | Status |
|---|---|---|
| 1 | Saatlıq satış hesabatı çıxarıldı, ən zəif 2 saat tapıldı | ☐ |
| 2 | 14:30–17:00 üçün bir təklif hazırdır | ☐ |
| 3 | Nahar menyusunda ən tez çıxan yeməklər önə çəkildi | ☐ |
| 4 | Səhər və axşam üçün ayrı musiqi siyahısı var | ☐ |
| 5 | Ofisiantlar nahar sürəti və axşam təklifi üçün ayrıca təlimatlandırıldı | ☐ |
| 6 | Vitrinin saata görə dəyişmə qrafiki yazıldı | ☐ |

---

> 📝 **DOĞAN NOTU:** "Kabab axşamındır. Bəs saat üçün pulunu kim ödəyəcək? Restoran saatla nəfəs almalıdır — səhər bir, günorta başqa, axşam başqa."

---

> **💡 DK Agency:** Aylıq gəlir-xərc balansını [Mənfəət və zərər hesabatı (P&L)](/toolkit/pnl), hansı məhsulun həqiqətən qazandırdığını [Menyu Matrisi](/toolkit/menu-matrix) ilə yoxla.
>
> 🌐 dkagency.com.tr | 📍 Bakı, Azərbaycan
$dkq$, updated_at = now()
WHERE id = 154 AND md5(content_az) = 'b05a3f875a44b5755ffdaf8c1889da01' AND md5(coalesce(dogan_note, '')) = 'd41d8cd98f00b204e9800998ecf8427e';

-- metbexde-her-gun-itirilen-metrler-spagetti-diaqrami-ile-addim-xeritesi
UPDATE blog_posts SET content_az = $dkq$Pik saatdır. Mətbəxə baxırsan: hamı tər içində, hamı qaçır. Zalda ofisiantlar o baş-bu başa gedir. Amma sifarişlər yenə gecikir.

Ağlına ilk gələn: **«Adam çatmır. Bir nəfər də götürməliyəm.»**

**Dayan. Tələsmə.**

Çox vaxt problem işçinin azlığı deyil. Problem odur ki, işçin **yemək bişirmir — yol gedir.** Salat aşpazı hər sous üçün mətbəxin o biri başındakı soyuducuya gedir. Ofisiant hər boşqab üçün zalı başdan-başa keçir. Sən də ay sonunda bu addımlara maaş ödəyirsən.

Bunu görməyin ən sadə, ən ucuz yolu var: **spagetti diaqramı (addım xəritəsi).** Bir vərəq, bir qələm, yarım saat.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DOĞAN TOMRİS**                                      ║
> ║ DK Agency qurucusu, 40 illik HoReCa təcrübəsi            ║
> ║                                                          ║
> ║ *"Planı səhv çəkilmiş mətbəxi dünyanın ən yaxşı           ║
> ║  aşpazı da xilas edə bilməz. Səhv çəkilmiş xətt           ║
> ║  hər ay kassadan pul aparır."*                            ║
> ║                                                          ║
> ║ 📖 Sahə qeydi                                             ║
> ╚══════════════════════════════════════════════════════════╝

---

## Spagetti diaqramı nədir?

Məkanın planını kağıza çəkirsən. Bir işçini seçirsən. O hara gedirsə, qələmlə xətt çəkirsən. Yarım saat sonra vərəqə baxanda xətlər bir-birinə dolaşıb boşqabdakı spagettiyə bənzəyir. Adı buradan gəlir.

**Xətlər harada qalınlaşırsa, tıxac və pul itkisi oradadır.** Xətlər harada kəsişirsə, toqquşma və qəza riski oradadır.

---

## 5 addımda necə çəkilir?

1. **Planı çək.** Ölçüyə yaxın sadə eskiz kifayətdir. Qeyd et: soyuducular, anbar, hazırlıq masası, plitə/qril, çıxış pəncərəsi (pass), qabyuyan sahəsi, servis stansiyası (qaşıq, salfet, su), kassa, masalar.
2. **Kimi izləyəcəyini seç.** İki ayrı xəritə çək — onlar fərqli problemləri göstərir:
   - **Mətbəx xəritəsi:** bir aşpaz (məs. salat və ya qril) — hazırlıq, soyuducu, ədviyyat, zibil arasında.
   - **Servis xəritəsi:** bir ofisiant — masa, kassa, çıxış pəncərəsi, qabyuyan, servis stansiyası arasında.
3. **30 dəqiqə pik saatda izlə.** Hər hərəkəti xəttlə birləşdir. Eyni yol təkrarlandıqca üstündən yenə çək — xətt qalınlaşsın.
4. **Say və ölç.** Ən qalın 3 xətt hansı iki nöqtə arasındadır? Neçə dəfə gedildi? Aradakı məsafə neçə metrdir? Hər gediş neçə saniyə çəkir?
5. **Bir şeyi dəyiş, yenidən çək.** Avadanlığın yerini, ədviyyat rəfini, zibil qutusunu, servis stansiyasını yaxınlaşdır. Bir həftə sonra eyni işçini yenə 30 dəqiqə izlə və iki vərəqi yan-yana qoy.

---

## Nümunə hesablama: salat aşpazı və uzaq soyuducu

> *Bu, riyazi nümunədir — öz mətbəxinin rəqəmlərini qoy.*

- Salat stansiyası ilə ümumi soyuducu arası: **9 metr**
- Hər salat sifarişində aşpaz bir dəfə soyuducuya gedib qayıdır: **18 metr**
- Gündə **120** salat sifarişi
- **120 × 18 m = 2 160 m** — gündə 2 km-dən çox yalnız sous üçün yol
- Hər gediş-qayıdış qapı açıb axtarmaqla **45 saniyə** çəkirsə: **120 × 45 s = 90 dəqiqə** — hər gün bir saat yarım

**Həll:** salat stansiyasının altına **soyuduculu hazırlıq dəzgahı** qoyulur. Souslar, doğranmış tərəvəz, pendir əlin altında, qapaqlı qastronorm qablarda saxlanır. Aşpaz yerindən tərpənmir — sadəcə əlini uzadır.

Gündə 90 dəqiqə geri qayıdır. Bu vaxt ya daha çox sifariş, ya daha sakit növbə, ya da daha az əlavə saat deməkdir.

---

## Zal tərəfi: ofisiantın marşrutu

Ofisiantın xəritəsində iki şeyə bax:

**1. Boş gediş.** Ofisiant masaya əli boş gedirsə, qayıdanda da əli boşdursa, yarım yol hədərdir. Köhnə qayda «dolu get, dolu gəl» doğrudur, amma kifayət deyil. Hər çıxışda üç sual:
- İndi nə aparıram?
- Gedərkən yolda nəyə baxıram? (boş stəkan, gözləyən qonaq, təmizlənəcək masa)
- Qayıdanda nə gətirirəm?

**2. Üçbucaq.** Çıxış pəncərəsi, qabyuyanın qəbul yeri və servis stansiyası bir-birinə yaxın olmalıdır. Pəncərə zalın bir küncündə, qabyuyan o biri küncündədirsə, ofisiant hər masadan sonra bütün zalı keçir. Bu mövzunu zal ölçüləri ilə birlikdə [Qonaq və İşçi Axını](/blog/qonaq-ve-isci-axini-zal-trafiki) yazısında açırıq.

**Çıxış pəncərəsində 5 saniyə.** Ofisiant boşqabın daşıyıcısı deyil, qonağa çatmadan əvvəl son yoxlamadır. Götürməzdən əvvəl: düzgün masa? yemək isti/soyuq olması lazım olduğu kimi? təqdimat menyudakı kimi? sous və qarnir yerində? boşqabın kənarı təmiz?

---

## Təhlükəsizlik: kəsişən xətlər

Spagetti diaqramı təkcə vaxt deyil, **sağlamlıq** da qoruyur. Mətbəxdə ən ağır hadisələr — qaynar yağ, qaynar qazan, bıçaq — çox vaxt iki insanın yolu kəsişəndə baş verir.

- İsti bişirmə xəttinin arxasından ümumi keçid yolu keçməməlidir.
- Ofisiant mətbəxin içinə girməməlidir. Onun sərhədi çıxış pəncərəsidir.
- Kirli qabın gəldiyi yol ilə təmiz yeməyin çıxdığı yol ayrı olmalıdır.

---

## Adətən nə dəyişdirilir?

| Xəritədə görünən | Tipik həll |
|---|---|
| Aşpaz tez-tez uzaq soyuducuya gedir | Stansiyaya alt soyuducu, gündəlik hazırlığı əl altına |
| Ədviyyat və qab-qacaq üçün əyilmək, axtarmaq | Göz və əl səviyyəsində rəf, asılqan |
| Boşqab sıyırmaq üçün zibil qutusu uzaqdır | Qutunu qabyuyanın qəbul yerinə qoy |
| Ofisiant qaşıq-salfet üçün mətbəxə gedir | Zalda servis stansiyası |
| Ofisiantla aşpazın yolu qapıda kəsişir | Giriş-çıxış istiqamətini ayır, qapı yerini dəyiş |

---

## Pulun hesabı — öz rəqəmlərinlə

> **Artıq yol dəqiqəsi × işçi sayı × saatlıq əmək haqqı ÷ 60 × iş günü = ayda boş yola ödənən pul**

*Misal:* 3 işçi, hər biri gündə 40 dəqiqə artıq yol, saatlıq əmək haqqı 6₼, ayda 26 gün:
40 × 3 × 6 ÷ 60 × 26 = **312₼/ay**. Bu, yalnız maaşdır — gecikən sifariş, soyuyan yemək və yorğunluqdan işdən çıxma buna daxil deyil.

---

## YOXLAMA SİYAHISI — Sabah mətbəxdə

| # | Yoxla | Status |
|---|---|---|
| 1 | Salat/soyuq stansiyada əl altında soyuducu varmı? | ☐ |
| 2 | Ədviyyat və souslar bir addım məsafədədirmi? | ☐ |
| 3 | Qril ustası maşa və qab üçün yerindən tərpənirmi? | ☐ |
| 4 | Ofisiant çıxış pəncərəsində dayanır, yoxsa mətbəxə girir? | ☐ |
| 5 | Kirli qab yolu ilə təmiz yemək yolu kəsişirmi? | ☐ |
| 6 | Boşqab sıyırmaq üçün zibil qutusu 3 addımdan uzaqdırmı? | ☐ |
| 7 | Bu həftə ən azı bir işçinin 30 dəqiqəlik xəritəsi çəkildimi? | ☐ |

---

> 📝 **DOĞAN NOTU:** "Mətbəx qapısından baxanda hamı bir-birinin üstünə qışqırırsa və əlində tava ilə o baş-bu başa qaçırsa, orada tənbəllik yoxdur — orada səhv plan var. Mətbəx saat mexanizmi kimi olmalıdır: hər kəs yerində dönür, heç kim yerindən qaçmır."

---

> **💡 DK Agency:** Boş yola gedən vaxtın aylıq maaş itkisini [Addım xərci kalkulyatoru](/toolkit/addim-xerci) ilə hesabla. Stansiya sayı və növbə yükü üçün [Mətbəx stansiyaları](/toolkit/metbex-istasyon) və [İşçi planlayıcısı](/toolkit/personel-planlayici). Yeni məkan açırsansa — [İnşaatdan Açılışa Checklist](/toolkit/insaat-checklist).
>
> 🌐 dkagency.com.tr | 📍 Bakı, Azərbaycan
$dkq$, dogan_note = $dkq$"Planı səhv çəkilmiş mətbəxi dünyanın ən yaxşı aşpazı da xilas edə bilməz. Səhv çəkilmiş xətt hər ay kassadan pul aparır."$dkq$, updated_at = now()
WHERE id = 153 AND md5(content_az) = 'fc559066220ef83d865f0dd2b4dcecea' AND md5(coalesce(dogan_note, '')) = '7f46d40d67555755e5aaa8041adf98d4';

-- 2) «12 il» digər dillərdə (restoran-acarken-sehvler)
UPDATE blog_posts SET dogan_note_tr = replace(dogan_note_tr, '12 yıldır', '40 yıldır'), dogan_note_en = replace(replace(dogan_note_en, '12 years', '40 years'), 'twelve years', '40 years'), dogan_note_ru = replace(replace(dogan_note_ru, '12 лет', '40 лет'), '12 год', '40 год') WHERE slug = 'restoran-acarken-sehvler';

-- 3) Uydurma sitatlar: 30 qutu silinir (müəllif belə bir söz deməyib və ya mənbə tapılmadı)
DELETE FROM guru_boxes WHERE id IN (12, 13, 15, 17, 18, 19, 20, 21, 22, 23, 24, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 46, 47, 48, 49, 50, 51, 52);

-- 4) Fikir müəllifindir, cümlə uydurma idi → həqiqi cümlənin tərcüməsi (en = orijinal)
UPDATE guru_boxes SET quote_az = $dkq$Restoran sahibi olmaq istəyi qəribə və dəhşətli bir xəstəlik ola bilər.$dkq$, quote_en = $dkq$To want to own a restaurant can be a strange and terrible affliction.$dkq$, quote_tr = NULL, quote_ru = NULL WHERE id = 42 AND blog_post_id = 14;
UPDATE guru_boxes SET quote_az = $dkq$Qonaqpərvərlik əvvəlcə işçilərə göstərilir, sonra qonaqlara, cəmiyyətə, təchizatçılara və ən sonda investorlara.$dkq$, quote_en = $dkq$Enlightened hospitality: employees first, then guests, community, suppliers and investors.$dkq$, quote_tr = NULL, quote_ru = NULL WHERE id = 14 AND blog_post_id = 3;
UPDATE guru_boxes SET quote_az = $dkq$İnsana təvazökarlığı həmişəlik aşılayan bir şey varsa, o da restoran biznesidir.$dkq$, quote_en = $dkq$If anything is good for pounding humility into you permanently, it's the restaurant business.$dkq$, quote_tr = NULL, quote_ru = NULL WHERE id = 16 AND blog_post_id = 3;
UPDATE guru_boxes SET quote_az = $dkq$Biz heç vaxt insanlara xidmət edən qəhvə biznesində olmamışıq; biz qəhvə təqdim edən insan biznesindəyik.$dkq$, quote_en = $dkq$We were never in the coffee business serving people, we were in the people business serving coffee.$dkq$, quote_tr = NULL, quote_ru = NULL, book = $dkq$CBS This Morning, 2011$dkq$ WHERE id = 43 AND blog_post_id = 15;
UPDATE guru_boxes SET quote_az = $dkq$Böyük marketoloqlar xüsusiyyətlərdən, hətta faydalardan danışmır. Onlar hekayə danışır — inanmaq istədiyimiz bir hekayə.$dkq$, quote_en = $dkq$Great marketers don't talk about features or even benefits. Instead, they tell a story—a story we want to believe.$dkq$, quote_tr = NULL, quote_ru = NULL WHERE id = 45 AND blog_post_id = 15;
UPDATE guru_boxes SET quote_az = $dkq$Qonaqpərvərlik əvvəlcə işçilərə göstərilir, sonra qonaqlara, cəmiyyətə, təchizatçılara və ən sonda investorlara.$dkq$, quote_en = $dkq$Enlightened hospitality: employees first, then guests, community, suppliers and investors.$dkq$, quote_tr = NULL, quote_ru = NULL WHERE id = 26 AND blog_post_id = 9;
UPDATE guru_boxes SET quote_az = $dkq$İnsanlara gözlədiklərindən artığını verməyin heyrətamiz gücü.$dkq$, quote_en = $dkq$The remarkable power of giving people more than they expect.$dkq$, quote_tr = NULL, quote_ru = NULL, book = $dkq$Unreasonable Hospitality (kitabın alt başlığı)$dkq$ WHERE id = 29 AND blog_post_id = 9;
UPDATE guru_boxes SET quote_az = $dkq$İnsanlar sənin nə etdiyini yox, niyə etdiyini alır.$dkq$, quote_en = $dkq$People don't buy what you do, they buy why you do it.$dkq$, quote_tr = NULL, quote_ru = NULL WHERE id = 44 AND blog_post_id = 15;
UPDATE guru_boxes SET quote_az = $dkq$İnsana təvazökarlığı həmişəlik aşılayan bir şey varsa, o da restoran biznesidir.$dkq$, quote_en = $dkq$If anything is good for pounding humility into you permanently, it's the restaurant business.$dkq$, quote_tr = NULL, quote_ru = NULL WHERE id = 25 AND blog_post_id = 8;

-- Yoxlama: hər yazıda neçə sitat qaldı
SELECT p.slug, count(g.id) AS sitat FROM blog_posts p LEFT JOIN guru_boxes g ON g.blog_post_id = p.id GROUP BY p.slug HAVING count(g.id) > 0 ORDER BY p.slug;

COMMIT;
