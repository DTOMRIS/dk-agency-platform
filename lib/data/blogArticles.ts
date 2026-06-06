// lib/data/blogArticles.ts
// DK Agency Blog v4 — Profesyonel HoReCa Yazıları
// TQTA yerine DK Agency branding

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  categoryEmoji: string;
  stage?: 'Başla' | 'Böyüt' | 'Devir';
  readingTime: number; // dəqiqə - 160 söz/dəq ilə hesablanır
  wordCount: number;
  author: string;
  publishDate: string;
  updatedAt: string;
  tags: string[];
  metaDescription: string;
  focusKeyword: string;
  summary: string;
  content: string;
  isPremium: boolean;
  relatedArticles?: string[]; // slug-lar
  coverImage: string; // Kapak resmi URL'i
  coverImageAlt: string; // Kapak resmi alt text
}

export const BLOG_ARTICLES: BlogArticle[] = [
  // ═══════════════════════════════════════════════════════════════
  // YAZI 1: FOOD COST
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-001',
    slug: '1-porsiya-food-cost-hesablama',
    title: '1 Porsiya Sənə Neçəyə Başa Gəlir? Food Cost-un Qanlı Həqiqəti',
    subtitle: 'Food cost-u bilməmək — gözübağlı avtomobil sürmək kimidir',
    category: 'maliyye',
    categoryEmoji: '💰',
    readingTime: 12,
    wordCount: 1900,
    author: 'Doğan Tomris',
    publishDate: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-20T09:00:00Z',
    tags: ['food cost', 'resept kartı', 'maliyyə', 'restoran', 'P&L'],
    metaDescription: 'Restoran sahibi olaraq food cost-u necə hesablamalı? Resept kartı nədir? Azərbaycanda ideal food cost faizi neçədir? Praktik hesablama qaydaları.',
    focusKeyword: 'food cost hesablama',
    summary: 'Sən bir porsiya Toyuq Sac-ı 18₼-a satırsan. Ərzaq xərci 6₼ çıxır. "12₼ qazandım" deyirsən. Qazanmadın. Bu yazıda food cost-un necə hesablandığını, resept kartının nə olduğunu və xərcləri necə optimallaşdıracağını öyrən.',
    content: `# 1 Porsiya Sənə Neçəyə Başa Gəlir? Food Cost-un Qanlı Həqiqəti

*Kateqoriya: 💰 Maliyyə | Oxu müddəti: 10-12 dəq*

---

Sən bir porsiya Toyuq Sac-ı 18₼-a satırsan. Ərzaq xərci 6₼ çıxır. "12₼ qazandım" deyirsən.

**Qazanmadın.**

O 18₼-ın içindən icarə çıxır, işçi maaşı çıxır, qaz çıxır, elektrik çıxır, qırılan boşqab çıxır, atılan materialın xərci çıxır, DSMF çıxır, vergi çıxır. Sonda baxırsan ki, 18₼-dan əlində **1-2₼ qalıb.** Bəlkə heç qalmayıb. Bəlkə **mənfi**dir — amma sən bilmirsən, çünki hesablamamısan.

Bu, Azərbaycanda restoranların **90%-inin** xəstəliyidir: food cost-u (ərzaq maya dəyərini) bilmədən işləyirlər. Menyu qiymətlərini "rəqib nə yazıb, mən də o qədər" prinsipi ilə qoyurlar. Nəticə? Hər satışda pul itirirlər, amma bunu **aylar sonra** anlayırlar — kassada pul qalmayanda.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DAVID SCOTT PETERS**                                ║
> ║ TheRestaurantExpert.com qurucusu, food cost ustası        ║
> ║                                                           ║
> ║ *"Food cost-u bilməmək — gözübağlı avtomobil              ║
> ║  sürmək kimidir. Hara getdiyini bilmirsən,                ║
> ║  nə vaxt qəza olacağını da bilmirsən."*                   ║
> ║                                                           ║
> ║ 📖 Restaurant Prosperity Formula                          ║
> ║ 🔗 Bakıda da eynidir — hər gün gözübağlı sürənlər var.   ║
> ╚══════════════════════════════════════════════════════════╝

---

## Food cost nədir? Ən sadə izah

Food cost (ərzaq maya dəyəri) — **bir porsiya yeməyin hazırlanması üçün sərf olunan ərzaq xərcidir.** Yalnız ərzaq. İşçi maaşı, icarə, qaz — bunlar ayrıdır. Food cost yalnız boşqağa düşən materialın dəyəridir.

**Formula:**

\`\`\`
Food Cost % = (Ərzaq xərci ÷ Satış qiyməti) × 100
\`\`\`

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

**Azərbaycan reallığı:** Bakıda əksər restoranlar **35-45%** food cost ilə işləyir. Bu, çox yüksəkdir. Niyə? Çünki:
- Resept standartlaşdırması yoxdur (hər aşpaz öz istədiyi qədər qoyur)
- Porsiyon ölçüsü nəzarətsizdir
- Ərzaq itkisi (waste — tullantı) hesablanmır
- Mövsümi qiymət dəyişiklikləri izlənmir
- Firmalardan endirimsiz, müqayisəsiz alış edilir

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **ROGER FIELDS**                                      ║
> ║ "Restaurant Success by the Numbers" müəllifi              ║
> ║                                                           ║
> ║ *"Restoranların əksəriyyəti pis yemək üzündən yox,        ║
> ║  pul idarəetməsi üzündən batır. Food cost                 ║
> ║  bunun 1 nömrəli göstəricisidir."*                        ║
> ║                                                           ║
> ║ 📖 Restaurant Success by the Numbers                      ║
> ║ 🔗 Bakıda "food cost nədir?" sualına cavab verə bilməyən  ║
> ║    sahibkar — Fields-in dediyi statistikanın içindədir.    ║
> ╚══════════════════════════════════════════════════════════╝

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

**Düzəldilmiş toplam: 5.39₼** (əvvəlki 4.79₼ deyil)
**Düzəldilmiş food cost: 33.7%** (əvvəlki 29.9% deyil)

> ⚠️ **Xəbərdarlıq:** Trim loss hesablamasan, food cost-un **real dəyərindən 3-5% aşağı** görünür. Kağız üzərində qazanırsan, kassada itirirsən. Hər reseptdə trim loss-u mütləq nəzərə al.

---

> 📝 **DK AGENCY NOTU:** "Food cost hesablamayan sahibkar mənə gəlir, deyir 'hər şey yaxşıdır, amma pul qalmır.' Reseptlərinə baxıram — göz ölçüsü. Firmalarına baxıram — müqayisə yox. Aşpaza soruşuram neçə qram qoyursan — 'bilmirəm, göz ölçüsü.' Budur sənin pulun haraya getdiyi."

---

## Menyu qiymətini necə qoymaq lazımdır?

"Rəqib 16₼ yazıb, mən də 16₼ yazım" — **bu ölüm formuludur.** Çünki rəqibin xərci səninkindən fərqlidir. Onun icarəsi aşağı ola bilər, ərzağı ucuz ala bilər, işçisinə az ödəyə bilər. Eyni qiyməti yazsan, o qazanır, sən itirirsən.

**Düzgün formula:**

\`\`\`
Satış qiyməti = Ərzaq xərci ÷ Hədəf food cost %
\`\`\`

**Nümunə:**
- Ərzaq xərci (trim loss daxil): 5.39₼
- Hədəf food cost: 30%
- Satış qiyməti: 5.39 ÷ 0.30 = **17.97₼ → yuvarlaqlaşdır: 18₼**

Əgər rəqib 16₼ yazıbsa və sənin food cost-un 30%-ə uyğun qiymətin 18₼-dırsa — **16₼ yazma.** Ya food cost-u azalt (daha ucuz ərzaq, daha kiçik porsiya, resepti optimallaşdır), ya da 18₼-a sat və **dəyər** yarat ki müştəri ödəsin.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DONALD BURNS**                                      ║
> ║ "The Restaurant Coach", ABŞ-ın tanınmış restoran danışmanı║
> ║                                                           ║
> ║ *"Restoran sahibləri menyu dizayn etməyə aşiqdir,         ║
> ║  amma P&L hesabatı oxumaqdan qaçır. Menyu gözəl            ║
> ║  görünür, kassa isə boşdur."*                              ║
> ║                                                           ║
> ║ 📖 Your Restaurant Sucks!                                 ║
> ║ 🔗 Bakıda menyuya saatlarla dizayn verib, bir dəfə belə   ║
> ║    food cost hesablamayan sahibkar tanıyıram. Sən o olma.  ║
> ╚══════════════════════════════════════════════════════════╝

---

## Ərzaq itkisi (waste) — gizli qatil

Hər restoranda ərzaq itkisi var. Sual budur: **nə qədər?**

Dünya ortalaması: restoranlar satın aldığı ərzağın **4-10%-ini** itirir. Bakıda bu rəqəm **10-20%** arasındadır, çünki:

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

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **ANTHONY BOURDAIN**                                  ║
> ║ Şef, müəllif, Kitchen Confidential                        ║
> ║                                                           ║
> ║ *"Şans biznes modeli deyil."*                              ║
> ║                                                           ║
> ║ 📖 Kitchen Confidential                                   ║
> ║ 🔗 Food cost-u bilmədən, waste-i izləmədən, göz ölçüsü    ║
> ║    ilə restoran idarə etmək — şansa güvənməkdir.           ║
> ║    Şans isə Bourdain-in dediyi kimi, biznes modeli deyil.  ║
> ╚══════════════════════════════════════════════════════════╝

---

## Firma seçimi — "aşpazın adamı" tələsi

Bu, "Gizli Xərclər" yazımızda "kresloya yapışan sahibkar" sindromu ilə bağlıdır. Təkrar edirəm, çünki **food cost-un 50%-i firmalardan asılıdır.**

Problem: Aşpazbaşı "öz adamı" olan firmadan alır. Qiymət müqayisəsi yoxdur. Sahibkar bilmir ki eyni toyuğu başqa firmadan **10-15% ucuza** ala bilərdi.

**Həll:**

1. **Minimum 3 firmadan qiymət al.** Hər ay, hər əsas ərzaq maddəsi üçün.
2. **Alışı sahibkar və ya maliyyəçi təsdiqləsin.** Aşpaz tək başına firma seçə bilməsin.
3. **Aylıq firma müqayisə cədvəli tut.** Sadə Excel cədvəli — firma adı, məhsul, qiymət, keyfiyyət qeydi.
4. **Kontrakt (müqavilə) bağla.** Sabit qiymət üçün 3-6 aylıq müqavilə imzala — mövsümi şişmələrdən qorunursan.

> 📝 **DK AGENCY NOTU:** "Çalana deyil, çaldırana bax. Aşpaz firmadan 10 manat əlavə alırsa — günahkar aşpaz deyil, sistem qurmayan sahibkardır. 3 firmadan qiymət almaq 10 dəqiqəlik işdir. Bu 10 dəqiqəyə ayda 2000-3000₼ qoruyursan."

---

## Mövsümi qiymət riski — menyunu nə vaxt dəyişmək lazımdır?

Pomidorun qiyməti yayda 2₼/kq, qışda 6₼/kq olur. Bu, **3 qat** fərqdir. Əgər pomidor olan yeməyin qiymətini dəyişməsən, qışda food cost-un **10-15% artır** — sadəcə bir ingrediyentdən.

**Strategiya:**

1. **Mövsümi menyu tətbiq et.** Yay menyusu, qış menyusu — ən azı il ərzində 2 dəfə menyu yenilə.
2. **"Mövsümi yemək" bölməsi yarat.** Menyu sabitdir, amma 4-5 yemək **mövsümə görə dəyişir** — bu, həm food cost-u optimallaşdırır, həm müştəriyə "yenilik" hissi verir.
3. **Əsas ərzaqların aylıq qiymət izləmə cədvəli tut.** Toyuq, mal əti, kartof, soğan, pomidor, yağ — 10 əsas ərzağın qiymətini hər ay yaz. Trend-i (meyli) gör.
4. **Menyu qiymətinə "bufer" (buffer — yastıq) qoy.** Food cost-u 30%-ə hədəfləmək əvəzinə, **28%-ə** hədəflə — mövsümi artım üçün 2% ehtiyat.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **JIM SULLIVAN**                                      ║
> ║ Sullivision.com qurucusu, restoran satış ustası            ║
> ║                                                           ║
> ║ *"Hər ofisiant satıcıdır — ya bilinçli satır,              ║
> ║  ya bilinçsiz itirdir."*                                    ║
> ║                                                           ║
> ║ 📖 Multiunit Leadership                                   ║
> ║ 🔗 Menyunun ən yüksək marjlı yeməyini ofisiant bilmirsə,  ║
> ║    hər masada pul itirirsən. Food cost yalnız mətbəxin      ║
> ║    deyil, zalın da işidir.                                  ║
> ╚══════════════════════════════════════════════════════════╝

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

\`\`\`
Actual Food Cost = (Ay əvvəli stok + Ay ərzində alışlar - Ay sonu stok) ÷ Aylıq ərzaq satışı × 100
\`\`\`

**Nümunə:**
- Ay əvvəli stok: 5.000₼
- Ay ərzində alışlar: 25.000₼
- Ay sonu stok: 4.000₼
- İstifadə olunan ərzaq: 5.000 + 25.000 - 4.000 = **26.000₼**
- Aylıq ərzaq satışı: 80.000₼
- Actual food cost: 26.000 ÷ 80.000 × 100 = **32.5%**

Əgər theoretical food cost 29% olarsa, arada **3.5% fərq** var. 80.000₼ satışda bu = **2.800₼ aylıq itki.** İldə **33.600₼.**

Bu fərq haradan gəlir? Oğurluq, waste, porsiyon nəzarətsizliyi, firma qiymət şişirməsi, düzgün sayılmayan stok. **Sistemi qursan — bu fərqi 1-1.5%-ə endirə bilərsən.** Yəni ildə **16.000-24.000₼ qoruyursan.**

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

> 📝 **DK AGENCY NOTU:** "Bir sahibkara dedim ki food cost-un 42%-dir, o dedi 'olar da, hamının belədir.' Hamının belə olması sənin batmayacağın demək deyil — hamının birlikdə batdığı deməkdir. Fərqli ol. Hesabla."

---

> **💡 DK Agency Danışmanlıq:** Resept kartı hazırlamağı bilmirsən? DK Agency Toolkit-də **hazır resept kartı şablonu** var — doldurursan, food cost avtomatik hesablanır. Aylıq food cost auditi, satınalma sistemi qurulması, menyu optimallaşdırması üçün danışmanlıq xidmətimiz mövcuddur.
>
> 📧 info@dkagency.com.tr | 🔧 dkagency.com.tr/toolkit | 🌐 dkagency.com.tr/danismanlik`,
    isPremium: false,
    relatedArticles: ['pnl-oxuya-bilmirsen', 'basabas-noqtesi-hesablama'],
    coverImage: '/images/blog-01.png',
    coverImageAlt: '1 porsiya food cost hesablama',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 2: P&L
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-002',
    slug: 'pnl-oxuya-bilmirsen',
    title: 'P&L Oxuya Bilmirsən? O Zaman Restoran Sahibi Deyilsən',
    subtitle: 'Gəlir-xərc hesabatının ən sadə izahı',
    category: 'maliyye',
    categoryEmoji: '💰',
    readingTime: 12,
    wordCount: 1800,
    author: 'Doğan Tomris',
    publishDate: '2026-02-14T09:00:00Z',
    updatedAt: '2026-02-20T09:00:00Z',
    tags: ['P&L', 'gəlir xərc', 'maliyyə', 'restoran idarəetməsi'],
    metaDescription: 'P&L (Profit & Loss) hesabatı nədir? Restoran sahibi olaraq necə oxumalı? Ən sadə izah və praktik nümunələrlə P&L-i anla.',
    focusKeyword: 'P&L hesabatı restoran',
    summary: 'Sahibkar hər axşam kassaya baxır. "Bu gün 3000₼ gəldi" deyir. Amma ayın sonunda hesaba baxır — pul yoxdur. Harada itdi? P&L-i oxumursa bilməyəcək.',
    content: `# P&L Oxuya Bilmirsən? O Zaman Restoran Sahibi Deyilsən

*Kateqoriya: 💰 Maliyyə | Oxu müddəti: 10-12 dəq*

---

Sahibkar hər axşam kassaya baxır. "Bu gün 3000₼ gəldi" deyir. Sevinclidir. Amma ayın sonunda hesaba baxır — **pul yoxdur.** Harada itdi? Bilmir. Çünki **P&L hesabatı** oxumur. Bəlkə P&L-in nə olduğunu belə bilmir.

Bu, Azərbaycanda yüzlərlə restoranın hekayəsidir. Kassa dolur, cib boşalır. Çünki **gəlir ≠ mənfəət.** Gəlir sənin kassana gələn puldur. Mənfəət isə — bütün xərcləri çıxdıqdan sonra **əlində qalan puldur.** Bu ikisi arasındakı fərqi görməyin **yeganə yolu** P&L hesabatıdır.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **ROGER FIELDS**                                      ║
> ║ "Restaurant Success by the Numbers" müəllifi              ║
> ║  Həm mühasib, həm restoran sahibi olmuş nadir adamlardan   ║
> ║                                                           ║
> ║ *"Restoranların 90%-i batır, amma batanların əksəriyyəti    ║
> ║  pis yemək üzündən yox, pul idarəetməsi üzündən batır."*   ║
> ║                                                           ║
> ║ 📖 Restaurant Success by the Numbers                      ║
> ║ 🔗 P&L bu "pul idarəetməsi"nin ən əsas alətidir.          ║
> ║    Bunu oxumursan — gözübağlı idarə edirsən.               ║
> ╚══════════════════════════════════════════════════════════╝

---

## P&L nədir? 3 cümlə ilə

**P&L (Profit & Loss Statement)** — Gəlir və Xərc hesabatı. Bir müddət ərzində (adətən 1 ay) **nə qədər pul gəldi, nə qədər xərcləndi, nə qədər qaldı** — bunları göstərən bir vərəqdir.

Bu, restoranının **sağlıq kartıdır.** Doktor qan analizinə baxıb "şəkərin yüksəkdir" deyir. P&L-ə baxıb "food cost-un yüksəkdir" deyirsən. Eyni şeydir — amma bu dəfə xəstə restoranındır.

---

## P&L-in quruluşu — ən sadə izah

P&L-i 5 hissəyə bölürük:

### 1. GƏLİR (Revenue / Satışlar)

Kassadan gələn bütün pul. Yeməkdən, içkidən, banketdən, delivery-dən — hamısı.

\`\`\`
Yemək satışı:         65.000₼
İçki satışı:          15.000₼
Delivery satışı:      12.000₼
Banket gəliri:         8.000₼
─────────────────────────────
TOPLAM GƏLİR:        100.000₼
\`\`\`

### 2. ƏRZAQ XƏRCİ (COGS — Cost of Goods Sold)

Satılan yeməklərin ərzaq dəyəri. Food cost buraya düşür.

\`\`\`
Yemək ərzağı:          30.000₼
İçki ərzağı:            4.500₼
Qablaşdırma (delivery): 1.200₼
─────────────────────────────
TOPLAM COGS:           35.700₼
COGS %:                35.7%
\`\`\`

### 3. ÜMUMİ MƏNFƏƏT (Gross Profit)

\`\`\`
Gross Profit = Gəlir - COGS
100.000 - 35.700 = 64.300₼ (64.3%)
\`\`\`

Bu, "xam mənfəət"dir — hələ icarə, maaş, kommunal ödənilməyib.

### 4. ƏMƏLİYYAT XƏRCLƏRİ (Operating Expenses)

Burada hər şey var:

\`\`\`
İşçi maaşları:         25.000₼  (25%)
İcarə:                 10.000₼  (10%)
Kommunal (elektrik,qaz,su): 3.500₼  (3.5%)
DSMF:                   1.000₼  (1%)
Marketinq/reklam:        1.500₼  (1.5%)
Təmir/texniki xidmət:      800₼  (0.8%)
Sığorta:                   500₼  (0.5%)
Musiqi lisenziyası:        100₼  (0.1%)
Mühasibat/hüquqi:          600₼  (0.6%)
Digər xərclər:           1.000₼  (1%)
─────────────────────────────
TOPLAM ƏMƏLİYYAT:      44.000₼  (44%)
\`\`\`

### 5. XALİS MƏNFƏƏT (Net Profit)

\`\`\`
Net Profit = Gross Profit - Operating Expenses
64.300 - 44.000 = 20.300₼
Net Profit %: 20.3%
\`\`\`

**Bu rəqəm — 20.300₼ — sənin real qazancındır.** 100.000₼ gəlirdən əlində bu qalır.

> ⚠️ **Xəbərdarlıq:** Yuxarıdakı nümunə ideallaşdırılmışdır. Bakıda əksər restoranların net profit %-i **5-15%** arasındadır. 20% görürsənsə — çox yaxşı idarə edirsən. 5%-in altındadırsa — təhlükə zonasındasan.

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

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DONALD BURNS**                                      ║
> ║ "The Restaurant Coach", restoran danışmanı                 ║
> ║                                                           ║
> ║ *"Restoran sahibləri menyu dizayn etməyə aşiqdir,         ║
> ║  amma P&L hesabatı oxumaqdan qaçır. Menyunun              ║
> ║  gözəl görünməsi sənin kassanı doldurmur."*                ║
> ║                                                           ║
> ║ 📖 Your Restaurant Sucks!                                 ║
> ║ 🔗 Bakıda bu, epidemiya səviyyəsindədir. Sahibkar         ║
> ║    menyunun dizaynına 2 həftə, P&L-ə 0 dəqiqə vaxt verir.║
> ╚══════════════════════════════════════════════════════════╝

---

## P&L-i necə oxumaq — 5 dəqiqəlik analiz

P&L əlinə gəldi. 5 dəqiqədə nəyə baxmalısan?

**Dəqiqə 1: Food cost %-ə bax.** 33%-dən yuxarıdırsa — mətbəxdə problem var. Resept kartları yoxlanmalı, waste azaldılmalı, firmalar müqayisə olunmalıdır.

**Dəqiqə 2: İşçi xərclərinə bax.** 30%-dən yuxarıdırsa — ya çox adam var, ya əməliyyat effektiv deyil. Shift (növbə) planlamasını yoxla — pik saatlarda çoxmu, sakit saatlarda azmı?

**Dəqiqə 3: Prime Cost-a bax.** Food cost + işçi = 65%-dən yuxarıdırsa — ciddi dəyişiklik lazımdır. Bu iki maddə restoranı batıran əsas amildir.

**Dəqiqə 4: İcarə %-ə bax.** 10%-dən yuxarıdırsa — ya satışları artırmalısan (icarə sabitdir, satış artdıqca % düşür), ya da icarə danışıqlarına girməlisən.

**Dəqiqə 5: Net profit-ə bax.** 8%-dən aşağıdırsa — problemlər yığılıb. Yuxarıdakı maddələrin hansında problem olduğunu artıq bilirsən.

---

> 📝 **DK AGENCY NOTU:** "P&L oxumağı öyrənmək 1 saatlıq işdir. Amma bu 1 saat sənə ayda minlərlə manat qoruyacaq. Sahibkara deyirəm 'P&L-nə baxaq,' o deyir 'muhasibçim baxır.' Muhasibçin baxır — amma muhasibçi sənin restoranını idarə etmir. Sən idarə edirsən. Sən oxumalısan."

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

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DANNY MEYER**                                      ║
> ║ Union Square Hospitality Group qurucusu, NYC              ║
> ║                                                           ║
> ║ *"Əsl liderlik kreslodan yox, rəqəmlərdən başlayır.      ║
> ║  İşçilərini tanımayan, proseslərinə nəzarət etməyən       ║
> ║  sahibkar müştərisinə də nəzarət edə bilməz."*            ║
> ║                                                           ║
> ║ 📖 Setting the Table                                      ║
> ║ 🔗 Meyer 100+ restoran idarə edir. Hər birinin aylıq       ║
> ║    P&L-i onun masasının üstündədir. Sən 1 restoranın       ║
> ║    P&L-ini oxumursan?                                      ║
> ╚══════════════════════════════════════════════════════════╝

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

\`\`\`
Bu həftə:
├── Gəlir:           18.500₼
├── Ərzaq alışları:    6.200₼  (33.5%)
├── İşçi xərcləri:    5.100₼  (27.6%)
├── Prime Cost:       11.300₼  (61.1%) ✅
└── Digər sabit:       4.500₼
    ────────────────────
    Həftəlik nəticə:   2.700₼  (14.6%) ✅
\`\`\`

Bu, 5 dəqiqəlik hesablamadır. Hər bazar günü otur, bu rəqəmləri yaz. **4 həftə yaz — trend-i görəcəksən.** Problemlər aylıq P&L-i gözləmədən, **həftələr əvvəl** görünəcək.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **ANTHONY BOURDAIN**                                  ║
> ║ Şef, müəllif, Kitchen Confidential                        ║
> ║                                                           ║
> ║ *"Restoran biznesi insana daim təvazökarlıq               ║
> ║  aşılayır."*                                               ║
> ║                                                           ║
> ║ 📖 Kitchen Confidential                                   ║
> ║ 🔗 P&L bu təvazökarlığın rəqəmsal formasıdır.             ║
> ║    Kassada 100.000₼ gördüyün zaman əlində 8.000₼           ║
> ║    qaldığını göstərir. Amma bu 8.000₼-ı görmək üçün        ║
> ║    əvvəlcə P&L-i açmalısan.                                ║
> ╚══════════════════════════════════════════════════════════╝

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

> **💡 DK Agency Danışmanlıq:** P&L şablonunu hazır istəyirsən? DK Agency Toolkit-də **Azərbaycan reallığına uyğun P&L şablonu** var — doldurmağa başla, rəqəmlər özü danışacaq. Aylıq maliyyə auditi, food cost optimallaşdırması, büdcə planlaşdırması üçün danışmanlıq xidmətimiz mövcuddur.
>
> 📧 info@dkagency.com.tr | 🔧 dkagency.com.tr/toolkit | 🌐 dkagency.com.tr/danismanlik`,
    isPremium: false,
    relatedArticles: ['1-porsiya-food-cost-hesablama', 'basabas-noqtesi-hesablama'],
    coverImage: '/images/blog-02.png',
    coverImageAlt: 'P&L hesabatı analiz',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 3: İŞÇİ SAXLAMA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-003',
    slug: 'isci-saxlama-7-strategiya',
    title: 'İşçin Getdi? Problem Onda Deyil, Səndə — 7 Saxlama Sistemi',
    subtitle: 'Kadr itkisinin əsl səbəbi: sistemsizlik',
    category: 'kadr',
    categoryEmoji: '👥',
    readingTime: 12,
    wordCount: 1850,
    author: 'Doğan Tomris',
    publishDate: '2026-02-13T09:00:00Z',
    updatedAt: '2026-02-20T09:00:00Z',
    tags: ['kadr', 'işçi saxlama', 'HR', 'restoran', 'turnover'],
    metaDescription: 'Restoran işçiləri niyə gedir? 7 sistem ilə kadr itkisini azalt. Danny Meyer, Horst Schulze strategiyaları.',
    focusKeyword: 'restoran işçi saxlama',
    summary: 'Aşpaz 3 ayda getdi. Ofisiant 2 həftədə. Hər dəfə "yaxşı adam idi" deyirsən. Problem işçidə deyil — sənin sistemindədir.',
    content: `# İşçin Getdi? Problem Onda Deyil, Səndə — 7 Saxlama Sistemi

*Kateqoriya: 👥 Kadr & İşçi İdarəetməsi | Oxu müddəti: 10-12 dəq*

---

Aşpaz 3 ayda getdi. Ofisiant 2 həftədə. Barmen 6 ayda. Hər dəfə "yaxşı adam idi, amma başqa yerə getdi" deyirsən.

Doğru sual bu deyil: "Niyə getdi?"

Doğru sual budur: **"Niyə qalmalı idi?"**

Əgər bu suala konkret cavab verə bilmirsənsə — problem işçidə deyil. Problem **səndədir.** Daha dəqiq desək — sənin **sistemindədir.** Çünki insanlar işdən getmir, **sahibkardan** gedir. Pis idarəetmədən gedir. Görünməzlikdən gedir. Perspektivsizlikdən gedir.

Azərbaycan HoReCa sektorunda işçi dönüşüm nisbəti (staff turnover rate — işçi axını) dünya ortalamasından çox yüksəkdir. Dünyada restoran sektoru üçün orta **60-80%**-dir (yəni hər il işçilərin yarıdan çoxu dəyişir). Bakıda bu rəqəm bəzi yerlərdə **100-150%**-ə çatır — yəni **il ərzində bütün komanda 1-1.5 dəfə tamamilə dəyişir.**

Hər gedən işçi sənə **pul itirir:** təlim xərci, verimlilik itkisi, müştəri memnuniyyəti düşüşü, digər işçilərin moral itkisi. Bir hesablamaya görə, bir ofisiantın dəyişdirilməsi restorana **2-3 aylıq maaşı** qədər xərc çıxarır.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DANNY MEYER**                                      ║
> ║ Union Square Hospitality Group qurucusu, NYC              ║
> ║                                                           ║
> ║ *"Əvvəlcə komandana bax. Məmnun işçi məmnun              ║
> ║  müştəri deməkdir. Müştəriyə hörməti əvvəlcə              ║
> ║  işçiyə göstərməlisən."*                                   ║
> ║                                                           ║
> ║ 📖 Setting the Table — "Enlightened Hospitality"          ║
> ║ 🔗 Meyer bunu "maarifləndirici qonaqpərvərlik" adlandırır. ║
> ║    Prioritet sırası: 1) İşçilər 2) Müştərilər 3) İcma      ║
> ║    4) Təchizatçılar 5) İnvestorlar. İşçi BİRİNCİdir.       ║
> ╚══════════════════════════════════════════════════════════╝

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

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **ANTHONY BOURDAIN**                                  ║
> ║ Şef, müəllif, Kitchen Confidential                        ║
> ║                                                           ║
> ║ *"Bacarıqları öyrətmək olar. Xarakter ya var,              ║
> ║  ya yoxdur."*                                               ║
> ║                                                           ║
> ║ 📖 Kitchen Confidential                                   ║
> ║ 🔗 Aşpaz, ofisiant, barmen — hamısına texniki bacarıq       ║
> ║    öyrədə bilərsən. Amma işinə hörmət, komandaya sadiqlik,  ║
> ║    müştəriyə diqqət — bunlar xarakterdədir. İşə götürərkən  ║
> ║    buna bax.                                                ║
> ╚══════════════════════════════════════════════════════════╝

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

Bakıda "maaş artır, qalar" düşüncəsi var. Maaş vacibdir — amma **tək faktor deyil.** Araşdırmalar göstərir ki, insanlar iş yerlərini 5 əsas səbəbə görə tərk edir:

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

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **HORST SCHULZE**                                     ║
> ║ Ritz-Carlton Hotels qurucusu                               ║
> ║                                                           ║
> ║ *"Biz xanımlar və cənablarıq, xanımlara və cənablara       ║
> ║  xidmət edirik."*                                           ║
> ║                                                           ║
> ║ 📖 Excellence Wins                                        ║
> ║ 🔗 Schulze Ritz-Carlton-da hər yeni işçinin ilk günü        ║
> ║    bu cümləni öyrədir. Məqsəd: işçiyə "sən xidmətçi        ║
> ║    deyilsən, peşəkarsan" mesajı vermək. İşçi özünü          ║
> ║    dəyərli hiss etdikdə — qalır.                            ║
> ╚══════════════════════════════════════════════════════════╝

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

> 📝 **DK AGENCY NOTU:** "Bir restoranda işçi dönüşümü ildə 150% idi. Tək bir dəyişiklik etdik: hər shift-dən əvvəl 10 dəqiqəlik görüş başlatdıq. 6 ayda dönüşüm 80%-ə düşdü. İşçilər dedilər: 'İlk dəfədir ki kimsə bizimlə danışır.' Bu cümlə sənin üçün dərs olsun."

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

\`\`\`
Stajyer Ofisiant → Ofisiant → Baş Ofisiant → Shift Manager → Restoran Müdiri
\`\`\`

\`\`\`
Aşpaz köməkçisi → Hazırlıq aşpazı → Xətt aşpazı → Sous Chef → Aşpazbaşı
\`\`\`

Hər pilləyə:
- **Müddət:** "Minimum 6 ay bu roldda"
- **Bacarıqlar:** "Bu 5 şeyi öyrənməlisən"
- **Maaş artımı:** Hər pillədə konkret artım
- **Məsuliyyət artımı:** Yeni rolla nə dəyişir

Bunu yazılı şəkildə, **işə qəbul zamanı** göstər. İşçi bilsin ki burada gələcək var.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **WILL GUIDARA**                                      ║
> ║ Eleven Madison Park, "Unreasonable Hospitality" müəllifi   ║
> ║                                                           ║
> ║ *"Qonaqpərvərlik qaydası: gözləntini aş,                   ║
> ║  standartı yox."*                                           ║
> ║                                                           ║
> ║ 📖 Unreasonable Hospitality                               ║
> ║ 🔗 Bu, müştəri üçün olduğu qədər işçi üçün də keçərlidir.  ║
> ║    İşçinin gözləntisi maaşdır. Gözləntisini aş — tanınma,   ║
> ║    inkişaf, hörmət ver. O zaman qalacaq.                     ║
> ╚══════════════════════════════════════════════════════════╝

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

> 📝 **DK AGENCY NOTU:** "3 ofisiant ardıcıl getdi, hamısı 'maaş azdır' dedi. Maaşı artırdıq — 4-cü ofisiant da getdi. Çıxış müsahibəsini ciddi apardıq. Real səbəb maaş deyilmiş — shift manager onlara lazımsız yerə qışqırırmış. Manageri dəyişdik — 6 aydır heç kim getməyib. Problem maaş deyildi, problem idarəetmə idi."

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

> **💡 DK Agency Danışmanlıq:** İşçi saxlama sistemi qurmaq istəyirsən? DK Agency Toolkit-də **işə qəbul forması, onboarding checklist, çıxış müsahibəsi şablonu, pre-shift meeting planı** hazırdır. Kadr auditi, təlim proqramı dizaynı, motivasiya sistemi qurulması üçün danışmanlıq xidmətimiz mövcuddur.
>
> 📧 info@dkagency.com.tr | 🔧 dkagency.com.tr/toolkit | 🌐 dkagency.com.tr/danismanlik`,
    isPremium: false,
    relatedArticles: ['kurumsal-kitabca-emeliyyat', 'menyu-muhendisliyi-satis'],
    coverImage: '/images/blog-03.png',
    coverImageAlt: 'İşçi saxlama strategiyaları',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 4: MENYU MÜHƏNDİSLİYİ
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-004',
    slug: 'menyu-muhendisliyi-satis',
    title: 'Menyu Mühəndisliyi: Hansı Yemək Sənə Pul Qazandırır, Hansını Öldür',
    subtitle: 'Ulduz, At, Puzzle, İt — hər yeməyin kateqoriyası',
    category: 'satis',
    categoryEmoji: '📈',
    readingTime: 12,
    wordCount: 1750,
    author: 'Doğan Tomris',
    publishDate: '2026-02-12T09:00:00Z',
    updatedAt: '2026-02-20T09:00:00Z',
    tags: ['menyu', 'satış', 'food cost', 'restoran', 'mənfəətlilik'],
    metaDescription: 'Menyu mühəndisliyi nədir? BCG matrisi ilə yeməkləri necə analiz etmək? Hansı yeməyi menyudan çıxarmalı?',
    focusKeyword: 'menyu mühəndisliyi',
    summary: 'Menyunda 45 yemək var. Hansı 5-i sənə pul qazandırır, hansı 10-u pul itirdirir? Bilmirsənsə — bu yazı sənin üçündür.',
    content: `# Menyu Mühəndisliyi: Hansı Yemək Sənə Pul Qazandırır, Hansını Öldür

*Kateqoriya: 📈 Satış & Menyu | Oxu müddəti: 10-12 dəq*

---

Menyunda 45 yemək var. Bildin ki hansı 5-i sənə pul qazandırır, hansı 10-u pul itirdirir? Bilmirsən. Çünki menyuya **"yemək siyahısı"** kimi baxırsan, amma əslində menyu **satış alətidir.**

Menyu mühəndisliyi (menu engineering) — hər yeməyi 2 ölçüyə görə qiymətləndirmək: **nə qədər satılır** (populyarlıq) və **nə qədər qazandırır** (mənfəətlilik). Bu iki ölçünü birləşdirəndə 4 kateqoriya yaranır — və sənin hər yeməyin bu 4 kateqoriyadan birindədir.

Bu yazıda sənə bu sistemi sıfırdan öyrədirəm. Heç bir MBA lazım deyil. Kalkulyator və Excel kifayətdir.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **JIM SULLIVAN**                                      ║
> ║ Sullivision.com qurucusu, restoran satış ustası            ║
> ║                                                           ║
> ║ *"Hər ofisiant satıcıdır — ya bilinçli satır,              ║
> ║  ya bilinçsiz itirdir."*                                    ║
> ║                                                           ║
> ║ 📖 Multiunit Leadership                                   ║
> ║ 🔗 Menyu mühəndisliyi ofisiantın nəyi satacağını da         ║
> ║    müəyyən edir. Ofisiant bilməlidir ki hansı yeməkdən      ║
> ║    restoran qazanır — onu tövsiyə etsin.                    ║
> ╚══════════════════════════════════════════════════════════╝

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

> 📝 **DK AGENCY NOTU:** "Bir restoranda menyu analizi etdik. 42 yemək var idi. 8-i 'it' çıxdı — nə satılırdı, nə qazandırırdı. Sahibkar dedi 'amma babamın reseptidir, çıxara bilmərəm.' Dedim: 'Babana hörmət et, amma kassana da hörmət et.' 8-ni çıxardıq, mətbəx sürəti 20% artdı, waste 30% azaldı."

---

## Addım-addım: Menyu analizini necə etmək?

### Addım 1: Satış datası topla
Son 3 ayın satış hesabatından hər yeməyin **satış sayını** çıxar. POS sisteminiz varsa — bu avtomatikdir. POS yoxdursa — əl ilə saymalısınız (amma ciddi deyirəm, POS alın).

### Addım 2: Hər yeməyin contribution margin-ini hesabla

\`\`\`
Contribution Margin = Satış qiyməti - Food cost
\`\`\`

Nümunə:
- Toyuq Sac: Satış 18₼, Food cost 5.39₼ → CM = **12.61₼**
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

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **GREGG RAPP**                                        ║
> ║ Menyu mühəndisi, "Menu Engineer" kimi tanınır               ║
> ║                                                           ║
> ║ *"Menyu restoranın ən güclü satış alətidir —                ║
> ║  amma əksər sahibkarlar onu yemək siyahısı kimi             ║
> ║  istifadə edir."*                                           ║
> ║                                                           ║
> ║ 🔗 Bakıda menyuya saatlarla dizayn verilir — amma           ║
> ║    yeməklərin hansının qazandırdığını heç kim bilmir.        ║
> ║    Dizayn gözəldir, strategiya sıfırdır.                    ║
> ╚══════════════════════════════════════════════════════════╝

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

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DONALD BURNS**                                      ║
> ║ "The Restaurant Coach"                                     ║
> ║                                                           ║
> ║ *"Restoran sahibləri menyu dizayn etməyə aşiqdir,          ║
> ║  amma menyunun hansı yeməyinin pul qazandırdığını           ║
> ║  bilmir. Bu, silahı doldurub gözübağlı atəş açmaq kimidir."*║
> ║                                                           ║
> ║ 📖 Your Restaurant Sucks!                                 ║
> ║ 🔗 Menyu analizi et. Ulduzlarını qoru, itləri öldür,        ║
> ║    puzzle-ları tanıt, atları optimallaşdır. Bu, pulsuz       ║
> ║    satış artımıdır.                                         ║
> ╚══════════════════════════════════════════════════════════╝

---

## Menyu ölçüsü — "çox" həmişə "pis"dir

Bakıda restoranlar 60-80 yeməklik menyularla işləyir. Bu, **fəlakətdir.** Niyə?

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

> 📝 **DK AGENCY NOTU:** "80 yeməkli menyu görəndə bilirəm ki o restoranda 'hər şeydən bir az' var, amma heç birindən 'yaxşı' yoxdur. Ən yaxşı restoranlar 20-30 yeməklə işləyir — amma hər biri mükəmməldir. Az amma yaxşı > çox amma orta."

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

> **💡 DK Agency Danışmanlıq:** Menyu analizini özün etmək çətindir? DK Agency Toolkit-də **menyu matrix şablonu** var — satış sayı və food cost-u daxil et, sistem yeməkləri avtomatik kateqoriyalara ayırır. Menyu optimallaşdırması, qiymətləndirmə strategiyası, ofisiant satış təlimi üçün danışmanlıq xidmətimiz mövcuddur.
>
> 📧 info@dkagency.com.tr | 🔧 dkagency.com.tr/toolkit | 🌐 dkagency.com.tr/danismanlik`,
    isPremium: false,
    relatedArticles: ['1-porsiya-food-cost-hesablama', 'wolt-bolt-komissiyon'],
    coverImage: '/images/blog-04.png',
    coverImageAlt: 'Menyu mühəndisliyi',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 5: AQTA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-005',
    slug: 'aqta-cerime-checklist',
    title: 'AQTA Gəldi, Cərimə Yazdı — Sən Hazır Deyildin. Tam Checklist',
    subtitle: '8 sahə, gündəlik/həftəlik/aylıq rejim',
    category: 'emeliyyat',
    categoryEmoji: '🔧',
    readingTime: 12,
    wordCount: 1800,
    author: 'Doğan Tomris',
    publishDate: '2026-02-11T09:00:00Z',
    updatedAt: '2026-02-20T09:00:00Z',
    tags: ['AQTA', 'gigiyena', 'cərimə', 'checklist', 'əməliyyat'],
    metaDescription: 'AQTA nəyə baxır? Ən yayğın cərimə səbəbləri hansılardır? Tam gigiyena checklist-i.',
    focusKeyword: 'AQTA cərimə checklist',
    summary: 'AQTA müfəttişi xəbərdarlıq etmədən gəlir. 45 dəqiqə yoxlama aparır. Hazır deyilsənsə — cərimə. Bu checklist-i çap et, divara yapışdır.',
    content: `# AQTA Gəldi, Cərimə Yazdı — Sən Hazır Deyildin. Tam Checklist

*Kateqoriya: 🔧 Əməliyyat & Gigiyena | Oxu müddəti: 10-12 dəq*

---

Bir gün AQTA (Azərbaycan Qida Təhlükəsizliyi Agentliyi) müfəttişi qapıdan içəri girir. Xəbərdarlıq etmir. Proqramına uyğun gəlir. 45 dəqiqə yoxlama aparır. Və sən **cərimə ilə qalırsan** — çünki hazır deyildin.

Bu, Bakıda hər gün baş verir. Sahibkar "sonra düzəldərik" deyir, sonra isə 500₼-dan 5.000₼-a qədər cərimə yazılır. Bəzən fəaliyyət dayandırılır. Ən pis halda — **obyekt bağlanır.**

Bu yazıda AQTA-nın nəyə baxdığını, hansı pozuntulara cərimə yazdığını və sənin restoran/kafe/çay evinin tam hazır olması üçün nə etməli olduğunu bir-bir yazıram. Checklist-i çap et, divara yapışdır.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **JON TAFFER**                                        ║
> ║ Bar Rescue aparıcısı, 600+ mekan xilas edib                ║
> ║                                                           ║
> ║ *"Mən heç vaxt uğursuz restoran görməmişəm —               ║
> ║  yalnız uğursuz sahibkarlar görmüşəm. Gigiyena             ║
> ║  problemi = idarəetmə problemi."*                          ║
> ║                                                           ║
> ║ 📖 Bar Rescue                                              ║
> ║ 🔗 AQTA cəriməsi gigiyena problemi deyil — nəzarətsizlik   ║
> ║    problemidir. Sistem varsa, cərimə olmaz.                 ║
> ╚══════════════════════════════════════════════════════════╝

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

- **AQTA qeydiyyatı:** Fəaliyyət göstərmək üçün AQTA-da qeydiyyatdan keçməlisən. ASAN Xidmət və ya KOBİA vasitəsilə müraciət edilir. **Dövlət rüsumu yoxdur, müraciət pulsuzdur.**
- **Gigiyena jurnalı:** Gündəlik temperatur qeydləri, təmizlik qeydləri. Müfəttiş jurnalı istəyir.
- **Ərzaq mənbəyi:** Hər ərzağın haradan alındığını göstərən sənəd (faktura, qəbz). İzlənə bilirlik (traceability) tələbidir.

### 7. Zal və ümumi sahələr

- **Tualet:** Təmiz, sabun, quruducu, işləyən su. Mətbəxdən ayrı girişli.
- **Havalandırma:** Mətbəxdən zala qoxu keçməməli.
- **Ümumi təmizlik:** Döşəmə, divarlar, tavan — ümumi sanitariya vəziyyəti.

### 8. Allergen (alergen) məlumatlandırması

Menyuda alergen məlumatı olmalıdır — fındıq, süd, gluten, yumurta və s. Bu tələb getdikcə güclənir.

---

> 📝 **DK AGENCY NOTU:** "AQTA müfəttişi gəlir, sahibkar qaçır ofisə, 'sənədləri hazırla' deyir. Sənədlər hazır deyil. Tibbi arayışlar yoxdur. Temperatur jurnalı boşdur. Nəticə: cərimə. Problem AQTA deyil — problem sahibkarın sistemi olmamasıdır."

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

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **GORDON RAMSAY**                                     ║
> ║ 35+ Michelin ulduzu, Kitchen Nightmares aparıcısı          ║
> ║                                                           ║
> ║ *"İnsanlar mətbəx bağlandığı üçün batdıqlarını zənn edir.  ║
> ║  Əslində ofis bağlandığı üçün batırlar — yəni gigiyena,     ║
> ║  nəzarət, sənədləşdirmə sistemi yoxdur."*                   ║
> ║                                                           ║
> ║ 📖 Kitchen Nightmares                                     ║
> ║ 🔗 Ramsay hər epizodda birinci soyuducunu açır.             ║
> ║    Soyuducunun vəziyyəti restoranın vəziyyətini göstərir.   ║
> ║    Sənin soyuducun necədir?                                  ║
> ╚══════════════════════════════════════════════════════════╝

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
| 7 | İş səthlərini təmizdir | ☐ |
| 8 | Zibil qutuları boşdur, qapaqlıdır | ☐ |
| 9 | Əl yuma: sabun, quruducu var | ☐ |
| 10 | İşçi geyimləri uyğundur | ☐ |
| 11 | Baş örtüyü (bone) taxılıb | ☐ |
| 12 | Temperatur jurnalı doldurulub | ☐ |
| 13 | Tualet təmizdir | ☐ |
| 14 | Havalandırma işləyir | ☐ |
| 15 | Zərərverici əlaməti yoxdur | ☐ |

---

> ⚠️ **Xəbərdarlıq:** AQTA qeydiyyatı üçün **dövlət rüsumu yoxdur, müraciət pulsuzdur.** Bəzi "vasitəçilər" əlavə pul istəyir — verməyin. ASAN Xidmət mərkəzinə və ya KOBİA evinə özünüz gedin, formaları doldurun.

---

## Cross-contamination — ən təhlükəli, ən az bilinən risk

Cross-contamination (çarpaz kontaminasiya) — çiy ərzaqdakı bakteriyaların hazır yeməyə keçməsidir. Bu, qida zəhərlənməsinin **1 nömrəli** səbəbidir.

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

> **💡 DK Agency Danışmanlıq:** AQTA yoxlamasına hazır olduğunuzdan əmin deyilsiniz? DK Agency danışmanlıq komandası **gigiyena auditi** həyata keçirir — AQTA müfəttişinin baxdığı hər maddəni yoxlayırıq, yazılı hesabat və düzəltmə planı təqdim edirik. Gigiyena təlimi, HACCP planı hazırlanması, sənədləşdirmə sistemi qurulması üçün bizimlə əlaqə saxlayın.
>
> 📧 info@dkagency.com.tr | 🔧 dkagency.com.tr/toolkit | 🌐 dkagency.com.tr/danismanlik`,
    isPremium: false,
    relatedArticles: ['kurumsal-kitabca-emeliyyat', 'insaatdan-acilisa-checklist'],
    coverImage: '/images/blog-05.png',
    coverImageAlt: 'AQTA yoxlama checklist',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 6: WOLT/BOLT
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-006',
    slug: 'wolt-bolt-komissiyon',
    title: 'Wolt/Bolt/Yango Sənin Pulunu Yeyir? Komissiyanın Gizli Riyaziyyatı',
    subtitle: '30% komissiyanın real təsiri',
    category: 'satis',
    categoryEmoji: '📈',
    readingTime: 12,
    wordCount: 1850,
    author: 'Doğan Tomris',
    publishDate: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-20T09:00:00Z',
    tags: ['delivery', 'Wolt', 'Bolt', 'komissiyon', 'mənfəət'],
    metaDescription: 'Delivery platformalarının 30% komissiyası sənə nəyə başa gəlir? Delivery-ni mənfəətli etməyin 7 yolu.',
    focusKeyword: 'Wolt Bolt komissiyon hesablama',
    summary: '30₼-lıq sifarişdən Wolt 9₼ götürdü. Ərzaq, qablaşdırma, işçi xərci çıxdıqdan sonra əlində nə qaldı? Bəlkə 0₼. Bəlkə mənfi.',
    content: `# Wolt/Bolt/Yango Sənin Pulunu Yeyir? Komissiyanın Gizli Riyaziyyatı

*Kateqoriya: 📈 Satış & Delivery | Oxu müddəti: 10-12 dəq*

---

"Wolt-a qoşulduq, sifarişlər gəlir, hər şey əla!" Əladır? Gəl rəqəmlərlə danışaq.

Sən Wolt-dan 30₼-lıq sifariş aldın. Komissiya 30%-dir. Wolt 9₼ götürdü. Əlində 21₼ qaldı. Bu 21₼-dan ərzaq xərci 10₼-dir (food cost 33%). Əlində 11₼ qaldı. Qablaşdırma materialı 1.50₼. Əlində 9.50₼ qaldı. İşçi xərci (hazırlıq vaxtı) ~3₼. Əlində **6.50₼** qaldı — icarə, kommunal, vergi çıxmamış. Çıxdıqdan sonra? **2-3₼. Bəlkə 0₼. Bəlkə mənfi.**

Eyni sifarişi restoranda versəydi: 30₼ tam sənin. Komissiya yox. Qablaşdırma yox. Əlində **12-15₼** qalardı.

**Delivery platformaları pis deyil — amma riyaziyyatını bilmədən qoşulsan, hər sifarişdə pul itirə bilərsən.** Bu yazıda bu riyaziyyatı açıram.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **ROGER FIELDS**                                      ║
> ║ "Restaurant Success by the Numbers" müəllifi              ║
> ║                                                           ║
> ║ *"Hər satış kanalının öz riyaziyyatı var. Gəlir gətirən   ║
> ║  kanal mənfəət gətirmir ola bilər — bunu yalnız           ║
> ║  rəqəmlərlə görə bilərsən."*                              ║
> ║                                                           ║
> ║ 📖 Restaurant Success by the Numbers                      ║
> ║ 🔗 Delivery kanalı çox vaxt gəlir gətirir, mənfəət yox.   ║
> ║    Bunu hesablamasan — kassada pul yoxa çıxır.              ║
> ╚══════════════════════════════════════════════════════════╝

---

## Platformaların komissiyon strukturu

Bakıda aktiv olan əsas delivery platformalar və təxmini komissiyon dərəcələri:

| Platforma | Komissiyon (təxmini) | Qeyd |
|---|---|---|
| **Wolt** | 25-30% | Müqaviləyə görə dəyişir |
| **Bolt Food** | 25-30% | Müqaviləyə görə dəyişir |
| **Yango Deli** | 20-30% | Bazar payı qazanmaq üçün endirimlər ola bilər |

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

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DAVID SCOTT PETERS**                                ║
> ║ TheRestaurantExpert.com qurucusu                           ║
> ║                                                           ║
> ║ *"Gəlir sənə yalan danışır. Mənfəət həqiqəti deyir.       ║
> ║  Hər kanalın — dine-in, delivery, banket — ayrı             ║
> ║  mənfəət hesabı olmalıdır."*                                ║
> ║                                                           ║
> ║ 📖 Restaurant Prosperity Formula                          ║
> ║ 🔗 Delivery-dən 15.000₼ gəlir gəlməsi heç nə deməkdir     ║
> ║    əgər xalis mənfəətin 800₼-dırsa.                         ║
> ╚══════════════════════════════════════════════════════════╝

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

Platformalarda combo sifarişlər **30-40% daha yüksək AOV** gətirir.

### 4. Qablaşdırma xərcini optimallaşdır

- **Toplu alış et** — 1000 ədəd qab, 100 ədəddən **30-40% ucuzdur**
- **Ölçüləri standartlaşdır** — 3-4 ölçüdə qab bütün menyunu qarşılasın, 10 fərqli ölçü olmasın
- **Ekoloji qablaşdırma istəyirsənsə** — qiymətə daxil et, ayrıca itirmə
- **Brendli qablaşdırma** — kiçik stiker belə brend tanınırlığı yaradır, xərci minimumdur

### 5. Öz delivery sisteminizi qurun — amma tələsməyin

Platformaların gücü **müştəri gətirməsidir.** Amma sadiq müştəri bazanız varsa — öz saytınızdan və ya WhatsApp/Telegram-dan sifariş qəbul edin, öz kuryerinizlə göndərin. Komissiyon: sıfır.

**Amma hesabla:**
- Kuryerin maaşı: ~800-1200₼/ay
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

> 📝 **DK AGENCY NOTU:** "Bir restoran sahibi gəldi, dedi 'Wolt-dan ayda 15.000₼ gəlir gəlir, əla!' Hesab etdik — komissiyon 4.500₼, qablaşdırma 750₼, əlavə işçi 2.000₼. 15.000₼ gəlirdən xalis qazanc 800₼ idi. Sonra delivery menyusunu optimallaşdırdıq, qiymətləri 15% artırdıq, aşağı marjlı yeməkləri çıxardıq — eyni sifariş sayı ilə xalis qazanc 3.500₼-a çıxdı. Problem Wolt deyildi — problem riyaziyyatı bilməmək idi."

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

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **ANTHONY BOURDAIN**                                  ║
> ║ Şef, müəllif, Kitchen Confidential                        ║
> ║                                                           ║
> ║ *"Şans biznes modeli deyil."*                              ║
> ║                                                           ║
> ║ 📖 Kitchen Confidential                                   ║
> ║ 🔗 Delivery platformasına "bəlkə qazanarıq" deyib          ║
> ║    qoşulmaq — şansa güvənməkdir. Rəqəmləri hesabla,        ║
> ║    sonra qoşul. Bourdain haqlıdır.                          ║
> ╚══════════════════════════════════════════════════════════╝

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

> **💡 DK Agency Danışmanlıq:** Delivery kanalınızı optimallaşdırmaq istəyirsiniz? DK Agency Toolkit-də **delivery P&L şablonu** var — hər platformanın mənfəətliliyini ayrıca hesablayır. Delivery menyu strategiyası, qiymətləndirmə, qablaşdırma optimallaşdırması üçün danışmanlıq xidmətimiz mövcuddur.
>
> 📧 info@dkagency.com.tr | 🔧 dkagency.com.tr/toolkit | 🌐 dkagency.com.tr/danismanlik`,
    isPremium: false,
    relatedArticles: ['menyu-muhendisliyi-satis', '1-porsiya-food-cost-hesablama'],
    coverImage: '/images/blog-06.png',
    coverImageAlt: 'Wolt Bolt Yango komissiyon analiz',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 7: KURUMSAL KİTABÇA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-007',
    slug: 'kurumsal-kitabca-emeliyyat',
    title: 'Kurumsal Kitabça Olmadan Restoran İdarə Etmək = Xaos',
    subtitle: 'Standart yoxdursa, hər kəs öz standartını qoyur',
    category: 'emeliyyat',
    categoryEmoji: '🔧',
    readingTime: 12,
    wordCount: 1900,
    author: 'Doğan Tomris',
    publishDate: '2026-02-09T09:00:00Z',
    updatedAt: '2026-02-20T09:00:00Z',
    tags: ['kurumsal', 'SOP', 'standart', 'əməliyyat', 'sistem'],
    metaDescription: 'Kurumsal kitabça nədir? İçində nə olmalıdır? McDonald\'s 800 səhifəlik manual ilə necə işləyir?',
    focusKeyword: 'restoran kurumsal kitabça',
    summary: 'Aşpazbaşı xəstələndi. Yerinə gələn soruşur: "Toyuq Sac-a nə qədər toyuq qoyulur?" Heç kim dəqiq bilmir.',
    content: `# Kurumsal Kitabça Olmadan Restoran İdarə Etmək = Xaos

*Kateqoriya: 🔧 Əməliyyat & Sistem | Oxu müddəti: 10-12 dəq*

---

Aşpazbaşı xəstələndi. Yerinə gələn aşpaz soruşur: "Toyuq Sac-a nə qədər toyuq qoyulur?" Heç kim dəqiq bilmir. Biri 200 qram deyir, biri 300. Müştəri şikayət edir: "Keçən həftə porsiya böyük idi, bu dəfə kiçikdir."

Ofisiant yenidir. "Müştəri hesab istəyir — kart qəbul edirik?" Heç kim dəqiq cavab vermir. Biri "hə" deyir, biri "nağd istə."

Təmizlik vaxtı gəldi. Kim nəyi təmizləyir? Heç kim bilmir. Hamı bir-birini gözləyir. Heç kim etmir.

**Bu, sistem yoxluğunun nəticəsidir.** Və bu, Bakıdakı restoranların **90%-inin** gündəlik reallığıdır. Hər kəs öz başının diktəsi ilə işləyir, çünki **yazılı standart yoxdur.**

Kurumsal kitabça (operations manual — əməliyyat təlimatnamələri) bu xaosu bitirən sənəddir. Bu yazıda nə olduğunu, niyə lazım olduğunu və necə hazırlanacağını izah edirəm.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **JON TAFFER**                                        ║
> ║ Bar Rescue aparıcısı, 600+ mekan xilas edib                ║
> ║                                                           ║
> ║ *"Standart yoxdursa, hər kəs öz standartını qoyur.         ║
> ║  Və hər kəsin standartı fərqli olur. Nəticə: xaos."*      ║
> ║                                                           ║
> ║ 📖 Raise the Bar                                          ║
> ║ 🔗 Bakıda "standart" sözü eşidiləndə sahibkar "bizdə       ║
> ║    elə problem yoxdur" deyir. Amma hər gün eyni problemi    ║
> ║    fərqli şəkildə həll etmək — standart yoxluğunun          ║
> ║    sübutudur.                                                ║
> ╚══════════════════════════════════════════════════════════╝

---

## Kurumsal kitabça nədir?

Sadə dillə: **restoranın "dərslik kitabı."** İçində restoranın hər prosesinin — mətbəxdən zala, açılışdan bağlanışa, işə qəbuldan müştəri şikayətinə qədər — **yazılı qaydaları** var.

Niyə "kitabça"? Çünki yeni işçi gəlir, bunu oxuyur, nə etməli olduğunu bilir. Sahibkar olmasa da restoran **eyni keyfiyyətdə** işləyir. Heç kim "amma mən belə bilirdim" demir — çünki **yazılıb.**

McDonald's-ın 38.000+ restoranı dünyanın hər yerində **eyni standartda** işləyir. Tokioda da, Bakıda da, Des Plaines-da da hamburger eyni dadda gəlir. Bu, təsadüf deyil — **800+ səhifəlik operations manual** sayəsindədir. McDonald's qardaşları 1948-ci ildə "Speedee Service System" yaratdılar, Ray Kroc bunu kitabça halına gətirdi, bu gün dünyada ən böyük restoran sistemidir.

Sən 38.000 restoran idarə etmirsən — amma 1 restoranın da kitabçası yoxdursa, **1 restoran belə düzgün işləmir.**

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **HOWARD SCHULTZ**                                    ║
> ║ Starbucks qurucusu                                        ║
> ║                                                           ║
> ║ *"Starbucks-ı böyüdən qəhvənin dadı deyil, sistemin        ║
> ║  gücüdür. Sistem olmasaydı, 35.000 mağazada eyni            ║
> ║  təcrübəni vermək mümkün olmazdı."*                         ║
> ║                                                           ║
> ║ 📖 Pour Your Heart Into It                                ║
> ║ 🔗 Starbucks barista-sı İstanbulda da Bakıda da eyni        ║
> ║    qaydayla latte hazırlayır. Bu, kitabça sayəsindədir.     ║
> ║    Sənin aşpazların hər biri fərqli porsiya verir?          ║
> ║    Kitabçan yoxdur.                                         ║
> ╚══════════════════════════════════════════════════════════╝

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

> 📝 **DK AGENCY NOTU:** "Kitabça' eşidəndə sahibkar deyir 'ay, bu böyük şirkətlər üçündür, mən kiçik kafeyəm.' Xeyr. Sən kiçik kafesən, amma eyni problemlərin var — işçi bilmir nə etsin, keyfiyyət dalğalanır, hər gün başqa problem. Kitabça bu dalğalanmanı dayanıdıran şeydir. 10 səhifəlik belə olsa — yazılı qayda > ağızdan söz."

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **WILL GUIDARA**                                      ║
> ║ Eleven Madison Park, "Unreasonable Hospitality"            ║
> ║                                                           ║
> ║ *"Sistem olmalıdır ki, kreativlik üçün yer qalsın.          ║
> ║  Sistem olmadan — hər şey xaosdur."*                        ║
> ║                                                           ║
> ║ 📖 Unreasonable Hospitality                               ║
> ║ 🔗 Guidara dünyanın 1 nömrəli restoranını sistem üzərində   ║
> ║    qurdu. Sistem olmasaydı — "ağlagəlməz qonaqpərvərlik"   ║
> ║    mümkün olmazdı. Sistem = azadlıq.                        ║
> ╚══════════════════════════════════════════════════════════╝

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

> **💡 DK Agency Danışmanlıq:** Kurumsal kitabça hazırlamaq vaxt alır — biz sizin üçün hazırlayırıq. DK Agency danışmanlıq komandası restoranınıza gəlir, bütün prosesləri qeydə alır, standartlaşdırır, **hazır kitabça** təqdim edir. Xidmət SOP-ları, resept kartları, gigiyena qaydaları, təlim materialları — hamısı daxildir.
>
> 📧 info@dkagency.com.tr | 🔧 dkagency.com.tr/toolkit | 🌐 dkagency.com.tr/danismanlik`,
    isPremium: false,
    relatedArticles: ['aqta-cerime-checklist', 'isci-saxlama-7-strategiya'],
    coverImage: '/images/blog-07.png',
    coverImageAlt: 'Kurumsal kitabça əməliyyat',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 8: İNŞAAT CHECKLİST
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-008',
    slug: 'insaatdan-acilisa-checklist',
    title: 'İnşaatdan Açılışa: 52 Maddəlik Həyat Qurtaran Checklist',
    subtitle: 'Kaba və incə işlərin tam planı',
    category: 'acilis',
    categoryEmoji: '🏗️',
    readingTime: 12,
    wordCount: 1700,
    author: 'Doğan Tomris',
    publishDate: '2026-02-08T09:00:00Z',
    updatedAt: '2026-02-20T09:00:00Z',
    tags: ['inşaat', 'açılış', 'checklist', 'büdcə', 'restoran'],
    metaDescription: 'Restoran inşaatının 5 fazası. 52 maddəlik checklist. Kaba iş, incə iş, avadanlıq, açılış hazırlığı.',
    focusKeyword: 'restoran inşaat checklist',
    summary: 'İcarə bağladın. Açar əlində. İndi nə? 3 aylıq işi 6 aya çıxarmamaq üçün bu checklist-i istifadə et.',
    content: `# İnşaatdan Açılışa: Restoran Açmağın 100+ Maddəlik Checklist-i

*Kateqoriya: 🚀 Açılış & Yatırım | Oxu müddəti: 15-20 dəq*

---

İcarə bağladın. Açar əlində. Artiq restoran sahibisən, deyil mi?

Xeyr.

İndi başlayır əsl iş. Lisenziyadan anbara, ekipaj sayından inventar siyahısına, ventilyasiyadan sanitar qovşağa — **100-dən çox detalla** qarşılaşacaqsan. Bunların çoxu "onu bilmirdim" kategoriyasına düşür — açılışdan sonra başa düşürsən ki, **3 ay əvvəl düşünməli idin.**

Bu yazıda sənə **tam checklist** verirəm — zamana görə bölünmüş, prioritetlə sıralanmış. Print elə, divara as.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DANNY MEYER**                                       ║
> ║ Union Square Hospitality, Shake Shack qurucusu            ║
> ║                                                           ║
> ║ *"Restoran açmaq çətin deyil. Restoranı açıq saxlamaq      ║
> ║  — əsl sənətdir."*                                        ║
> ║                                                           ║
> ║ 📖 Setting the Table                                      ║
> ║ 🔗 Danny Meyer 30+ restoran açıb. Hər birində eyni          ║
> ║    qaydaya əsaslanıb: "açılışdan əvvəl 100 şeyi düşün,     ║
> ║    açılışdan sonra 1000 şey qarşına çıxmasın."             ║
> ╚══════════════════════════════════════════════════════════╝

---

## FAZA 1: MƏKAN VƏ HÜQUQİ (Açılışdan 4-6 ay əvvəl)

Bu faza **ən kritik fazadır.** Burada səhv etdin — qalan hər şey dayanır.

### 1.1 Məkan seçimi və icarə

| # | Maddə | Status |
|---|---|---|
| 1 | Məkanın icarə müqaviləsi imzalanıb (minimum 3 il + uzatma hüququ) | ☐ |
| 2 | İcarə qiyməti dövriyyənin 8-12%-i limitindədir | ☐ |
| 3 | Məkanın hündürlüyü mətbəx ventilyasiyası üçün uyğundur (min. 3 metr ideal) | ☐ |
| 4 | Elektrik gücü yetərlidir (minimum 30-50 kW — ölçü konseptə görə) | ☐ |
| 5 | Su və kanalizasiya sistemi uyğundur | ☐ |
| 6 | Qaz bağlantısı mümkündür (lazımdırsa) | ☐ |
| 7 | Məkanın girişi müştəri üçün rahatdır (pilləkən, rampa) | ☐ |
| 8 | Parklanma imkanı var və ya yaxınlıqdadır | ☐ |
| 9 | Ətrafdakı rəqib analizi aparılıb | ☐ |
| 10 | Foot traffic (piyada axını) ölçülüb | ☐ |

### 1.2 Hüquqi qeydiyyat

| # | Maddə | Status |
|---|---|---|
| 11 | Hüquqi şəxs qeydiyyatı (MMC/ASC) tamamlanıb | ☐ |
| 12 | Vergi qeydiyyatı aparılıb | ☐ |
| 13 | İctimai iaşə lisenziyası üçün müraciət edilib | ☐ |
| 14 | Alkoqol satışı lisenziyası üçün müraciət edilib (lazımdırsa) | ☐ |
| 15 | AQTA-da qeydiyyat üçün sənədlər hazırlanıb | ☐ |
| 16 | FHN-dən yanğın təhlükəsizliyi rəyi alınıb | ☐ |
| 17 | Bələdiyyədən xarici reklam icazəsi alınıb | ☐ |
| 18 | DSMF qeydiyyatı (işəgötürən kimi) | ☐ |

---

> 📝 **DK AGENCY QEYDI:** "MMC qeydiyyatı 3 gündür' deyirlər. Bəli, özü 3 gün. Amma lisenziya fərqlidir — ictimai iaşə lisenziyası 15-20 iş günü çəkə bilər. AQTA qeydiyyatı ayrı, FHN rəyi ayrı. Bütün bunları paralel başlat, bir-birini gözləməsin."

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **THOMAS KELLER**                                     ║
> ║ The French Laundry, Per Se — Michelin 3 ulduz               ║
> ║                                                           ║
> ║ *"Planlamaya sərf etdiyin hər saat, icrada 10 saat          ║
> ║  qənaət edir."*                                            ║
> ║                                                           ║
> ║ 📖 The French Laundry Cookbook                             ║
> ║ 🔗 Keller The French Laundry-ni açanda mətbəx planına        ║
> ║    6 ay vaxt sərf edib. Nəticə: 25+ ildir dünyanın          ║
> ║    ən məşhur restoranlarından biridir.                      ║
> ╚══════════════════════════════════════════════════════════╝

---

## FAZA 2: TİKİNTİ VƏ DİZAYN (Açılışdan 3-4 ay əvvəl)

İcarə bağlandı — indi tikinti başlayır. Bu fazada **ən böyük xərclər** olur və **ən böyük səhvlər** edilir.

### 2.1 Mətbəx tikintisi

| # | Maddə | Status |
|---|---|---|
| 19 | Mətbəx layoutu çəkilib (iş axını optimizasiya edilib) | ☐ |
| 20 | Ventilyasiya sistemi layihələnib (hood + exhaust) | ☐ |
| 21 | Döşəmə materialı seçilib (sürüşməyən, yuyula bilən) | ☐ |
| 22 | Divar örtüyü seçilib (yağa davamlı, təmizlənən) | ☐ |
| 23 | Aydınlatma sistemi planlanıb (iş zonası üçün kifayət qədər işıq) | ☐ |
| 24 | Drenaj sistemi qurulub (döşəmə drenajı) | ☐ |
| 25 | Soyuq anbar yeri müəyyənləşib | ☐ |
| 26 | Quru anbar yeri müəyyənləşib | ☐ |
| 27 | Yuyucu stansiya yeri müəyyənləşib (3-gözlü sink planı) | ☐ |
| 28 | Zibilxana çıxışı planlanıb | ☐ |

### 2.2 Zal və müştəri sahəsi

| # | Maddə | Status |
|---|---|---|
| 29 | Zal layoutu çəkilib (masa yerləşdirmə planı) | ☐ |
| 30 | Müştəri tutumu hesablanıb (1 nəfər = 1.2-1.5 m²) | ☐ |
| 31 | Bar sahəsi planlanıb (lazımdırsa) | ☐ |
| 32 | Giriş zonası planlanıb (gözləmə sahəsi) | ☐ |
| 33 | WC zonası planlanıb (kişi/qadın/əlil) | ☐ |
| 34 | Aydınlatma dizaynı hazırlanıb (mood lighting) | ☐ |
| 35 | Akustika planlanıb (səs-küy izolyasiyası) | ☐ |
| 36 | Kondisioner/istilik sistemi layihələnib | ☐ |

### 2.3 Texniki sistemlər

| # | Maddə | Status |
|---|---|---|
| 37 | Elektrik lövhəsi və xətləri çəkilib | ☐ |
| 38 | Su xətləri çəkilib | ☐ |
| 39 | Qaz xətləri çəkilib (lazımdırsa) | ☐ |
| 40 | Yanğın əleyhinə sistem qurulub (sprinklər, yanğın söndürücü) | ☐ |
| 41 | Təhlükəsizlik kamerası sistemi planlanıb | ☐ |
| 42 | Musiqi sistemi planlanıb | ☐ |
| 43 | WiFi və internet infrastrukturu qurulub | ☐ |

---

## FAZA 3: AVADANLIQ VƏ İNVENTAR (Açılışdan 2-3 ay əvvəl)

Tikinti bitir — avadanlıq gəlir. Burada **yanlış alış** = illərlə peşmançılıq.

### 3.1 Mətbəx avadanlığı

| # | Maddə | Status |
|---|---|---|
| 44 | Sənaye tipli soyuducu (reach-in və/və ya walk-in) | ☐ |
| 45 | Dondurucu | ☐ |
| 46 | Soba/ocaq (konseptə uyğun — qaz/elektrik) | ☐ |
| 47 | Fırın (konveksiya və/və ya pizza/çörək) | ☐ |
| 48 | Qızartma aparatı (fryer) | ☐ |
| 49 | Izgara (grill — flat top/charcoal/gas) | ☐ |
| 50 | Hazırlıq masası (paslanmaz polad, uyğun ölçü) | ☐ |
| 51 | Salamander/broiler | ☐ |
| 52 | Mikro dalğalı soba | ☐ |
| 53 | Blender/food processor | ☐ |
| 54 | Ət doğrayan (meat slicer) | ☐ |
| 55 | Sous vide avadanlığı (lazımdırsa) | ☐ |
| 56 | Qazan-qazan tutumu kifayətdir | ☐ |

### 3.2 Servis avadanlığı

| # | Maddə | Status |
|---|---|---|
| 57 | Boşqablar (müxtəlif ölçülər, kifayət qədər say) | ☐ |
| 58 | Çəngəl-qaşıq-bıçaq dəsti | ☐ |
| 59 | Stəkanlar (su, şərab, pivə — konseptə görə) | ☐ |
| 60 | Fincanlar | ☐ |
| 61 | Süfrə örtükləri/salfetlər | ☐ |
| 62 | Qablama materialları (take-away üçün) | ☐ |
| 63 | Servis qabları (platter, bowl) | ☐ |

### 3.3 Texnoloji avadanlıq

| # | Maddə | Status |
|---|---|---|
| 64 | POS sistemi (kassa proqramı) qurulub | ☐ |
| 65 | Kart ödəniş terminalı (POS-a inteqrasiya) | ☐ |
| 66 | Mətbəx printer/ekranı (KDS) | ☐ |
| 67 | Rezervasiya sistemi | ☐ |
| 68 | Stok idarəetmə proqramı | ☐ |
| 69 | Mühasibat proqramı (1C/digər) | ☐ |

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DAVID CHANG**                                       ║
> ║ Momofuku qurucusu                                         ║
> ║                                                           ║
> ║ *"İlk restoranımda ən ucuz avadanlıq aldım. Altı aydan     ║
> ║  sonra hamısını dəyişdim. İki dəfə pul verdim."*          ║
> ║                                                           ║
> ║ 📖 Eat A Peach                                            ║
> ║ 🔗 Ucuz avadanlıq = bahalı səhv. 20% baha al, 5 il          ║
> ║    işləsin. 30% ucuz al, hər il dəyiş.                      ║
> ╚══════════════════════════════════════════════════════════╝

---

## FAZA 4: KOMANDA (Açılışdan 2 ay əvvəl)

Avadanlıq var — indi avadanlığı işlədəcək **insan lazımdır.**

### 4.1 Əsas heyət

| # | Maddə | Status |
|---|---|---|
| 70 | Aşpazbaşı (head chef) işə götürülüb | ☐ |
| 71 | Sous chef işə götürülüb | ☐ |
| 72 | Xətt aşpazları işə götürülüb (konseptə görə say) | ☐ |
| 73 | Hazırlıq aşpazı (prep cook) işə götürülüb | ☐ |
| 74 | Baş Ofisiant işə götürülüb | ☐ |
| 75 | Ofisiantlar işə götürülüb | ☐ |
| 76 | Barmen işə götürülüb (lazımdırsa) | ☐ |
| 77 | Host/Hostess işə götürülüb | ☐ |
| 78 | Bulaşıqçı işə götürülüb | ☐ |
| 79 | Təmizlik heyəti müəyyənləşib | ☐ |

### 4.2 Sənədləşdirmə

| # | Maddə | Status |
|---|---|---|
| 80 | Əmək müqavilələri imzalanıb | ☐ |
| 81 | Tibbi arayışlar toplanıb | ☐ |
| 82 | DSMF-də işçilər qeydiyyata alınıb | ☐ |
| 83 | İş təsvirləri (job description) hazırlanıb | ☐ |
| 84 | Shift cədvəli hazırlanıb | ☐ |

---

## FAZA 5: MENYU VƏ TƏCHİZAT (Açılışdan 1-2 ay əvvəl)

Komanda hazır — menyu testə başlayır.

### 5.1 Menyu hazırlığı

| # | Maddə | Status |
|---|---|---|
| 85 | Menyu konsepti təsdiqlənib | ☐ |
| 86 | Resept kartları hazırlanıb (standart resept, food cost) | ☐ |
| 87 | Menyu mühəndisliyi aparılıb (qiymət + margin + dizayn) | ☐ |
| 88 | Menyu dizaynı hazırlanıb (çap/dijital) | ☐ |
| 89 | Menyu fotoşəkil çəkilişi aparılıb | ☐ |
| 90 | Menyu çap edilib (və ya planşetə yüklənib) | ☐ |

### 5.2 Təchizatçılar

| # | Maddə | Status |
|---|---|---|
| 91 | Əsas ət təchizatçısı seçilib | ☐ |
| 92 | Dəniz məhsulları təchizatçısı seçilib | ☐ |
| 93 | Tərəvəz/meyvə təchizatçısı seçilib | ☐ |
| 94 | Süd məhsulları təchizatçısı seçilib | ☐ |
| 95 | İçki təchizatçısı seçilib | ☐ |
| 96 | Quru qida/souslar təchizatçısı seçilib | ☐ |
| 97 | Təmizlik materialları təchizatçısı seçilib | ☐ |
| 98 | Qablaşdırma materialları təchizatçısı seçilib | ☐ |
| 99 | Bütün müqavilələr imzalanıb, kredit şərtləri razılaşdırılıb | ☐ |

---

## FAZA 6: MARKETİNQ VƏ AÇILIŞ (Son 1 ay)

Restoran hazır — dünya bilməlidir.

### 6.1 Marketinq hazırlığı

| # | Maddə | Status |
|---|---|---|
| 100 | Restoran adı və loqo hazırlanıb | ☐ |
| 101 | Instagram səhifəsi yaradılıb, ilkin postlar hazırlanıb | ☐ |
| 102 | Facebook səhifəsi yaradılıb | ☐ |
| 103 | Google Business Profile yaradılıb | ☐ |
| 104 | Vebsayt hazırlanıb (sadə landing page belə) | ☐ |
| 105 | WhatsApp Business nömrəsi hazırlanıb | ☐ |
| 106 | Açılış tarixinə 2 həftə qala elan kampaniyası başlanıb | ☐ |
| 107 | Influencer/media dəvətnamə siyahısı hazırlanıb | ☐ |
| 108 | Wolt/Bolt Food-a qoşulma prosesi başlanıb | ☐ |

### 6.2 Soft opening (sınaq açılışı)

| # | Maddə | Status |
|---|---|---|
| 109 | Soft opening tarixi müəyyənləşib (rəsmi açılışdan 1 həftə əvvəl) | ☐ |
| 110 | Dostlar/ailə üçün VIP gecə planlanıb | ☐ |
| 111 | Pre-shift təlim sessiyaları keçirilib | ☐ |
| 112 | Menyu test sifarişləri verilir (bütün yeməklər sınaqdan keçir) | ☐ |
| 113 | Servis axını sınaqdan keçir | ☐ |
| 114 | POS sistemi sınaqdan keçir | ☐ |

### 6.3 Rəsmi açılış

| # | Maddə | Status |
|---|---|---|
| 115 | Açılış günü cədvəli hazırlanıb | ☐ |
| 116 | Açılış günü extra heyət planlanıb | ☐ |
| 117 | PR/media gəlişi planlanıb | ☐ |
| 118 | İlk həftə rezervasiyası açılıb | ☐ |
| 119 | İlk həftə promosyon/endirim planlanıb (lazımdırsa) | ☐ |
| 120 | Açılış günü narazı müştəri ssenarisi hazırlanıb (just in case) | ☐ |

---

> 📝 **DK AGENCY QEYDI:** "Soft opening səni xilas edən şeydir. Rəsmi açılışda 100 nəfər gəlir — 100 problemlə qarşılaşırsansa, 100 nəfər bunu sosial mediada paylaşır. Soft opening-də 20 nəfər gəlir — 20 problemlə qarşılaşırsansa, onları düzəldir, öyrənirsən. Heç vaxt soft opening-i atlama."

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **GRANT ACHATZ**                                      ║
> ║ Alinea — dünyanın ən innovativ restoranlarından biri       ║
> ║                                                           ║
> ║ *"Alinea-nı açanda 3 həftə soft opening etdik. Hər axşam   ║
> ║  bir problem çıxdı. Amma açılış günü — heç bir problem     ║
> ║  yox idi."*                                                ║
> ║                                                           ║
> ║ 📖 Life, on the Line                                       ║
> ║ 🔗 Dünyanın ən mükəmməl restoranları belə soft opening     ║
> ║    edir. Sən niyə birbaşa rəsmi açılış edirsən?            ║
> ╚══════════════════════════════════════════════════════════╝

---

## BONUS: İLK 30 GÜN

Açılış bitdi — indi **sağ qalmaq** lazımdır.

| # | Maddə | Status |
|---|---|---|
| 1 | Gündəlik satış hesabatı izlənir | ☐ |
| 2 | Gündəlik food cost hesablanır | ☐ |
| 3 | Müştəri rəyləri toplanır (Google, Instagram, canlı) | ☐ |
| 4 | İşçi performansı qiymətləndirilir | ☐ |
| 5 | Menyu satış analizi aparılır (hansı yemək satılır/satılmır) | ☐ |
| 6 | Problemli proseslər müəyyənləşir, düzəldilir | ☐ |
| 7 | İkinci həftədən WhatsApp/sosial media şikayət monitorinqi başlanır | ☐ |
| 8 | Həftələk komanda görüşləri (staff meeting) başlanır | ☐ |

---

## ÖZƏT: ZAMANA GÖRƏ CHECKLIST

| Zaman | Fokus | Maddə sayı |
|---|---|---|
| 4-6 ay əvvəl | Məkan, hüquqi, icarə | 18 |
| 3-4 ay əvvəl | Tikinti, dizayn, texniki sistemlər | 25 |
| 2-3 ay əvvəl | Avadanlıq, inventar, texnologiya | 26 |
| 2 ay əvvəl | Komanda, sənədləşdirmə | 15 |
| 1-2 ay əvvəl | Menyu, təchizat | 15 |
| Son 1 ay | Marketinq, soft opening, açılış | 21 |
| **TOPLAM** | | **120+** |

---

> **💡 DK Agency Danışmanlıq:** Restoran açmaq prosesi kompleksdir — bir çox sahibkar yarı yolda səhvlər edir. DK Agency olaraq sizə **açılış danışmanlığı** xidməti təklif edirik: məkan seçimindən açılış gününə qədər bütün prosesi sizinlə birlikdə planlaşdırırıq.
>
> 📧 info@dkagency.com.tr | 🔧 dkagency.com.tr/toolkit | 🌐 dkagency.com.tr/danismanlik`,
    isPremium: false,
    relatedArticles: ['aqta-cerime-checklist', 'restoran-markalasma-konsept'],
    coverImage: '/images/blog-08.png',
    coverImageAlt: 'İnşaatdan açılışa checklist',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 9: MARKALASMA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-009',
    slug: 'restoran-markalasma-konsept',
    title: 'Restoran Markası = Loqo Deyil. Hisslər, Dil, Mədəniyyət',
    subtitle: 'Howard Schultz-un "üçüncü yer" konsepti',
    category: 'konsept',
    categoryEmoji: '🎨',
    readingTime: 14,
    wordCount: 2000,
    author: 'Doğan Tomris',
    publishDate: '2026-02-07T09:00:00Z',
    updatedAt: '2026-02-20T09:00:00Z',
    tags: ['marka', 'brend', 'konsept', 'vizual kimlik', 'hekayə'],
    metaDescription: 'Restoran markası necə yaradılır? Vizual kimlik, ton, mədəniyyət. Starbucks, Nusret nümunələri.',
    focusKeyword: 'restoran markalaşma',
    summary: 'Sahibkar dizaynerə gedir: "Loqo lazımdır." Loqo hazırdır. Marka hazırdır? Xeyr. Marka = loqo deyil.',
    content: `# Restoran Markası = Loqo Deyil. Hisslər, Dil, Mədəniyyət

*Kateqoriya: 🎨 Konsept & Brend | Oxu müddəti: 12-14 dəq*

---

Sahibkar dizaynerə gedir: "Loqo lazımdır."

Dizayner loqo çəkir. Gözəl rənglər, yaraşıqlı şrift, bəlkə çəngəl-bıçaq da var içində. Sahibkar razıdır. "Markamız hazırdır!" deyir.

**Markası hazır deyil.**

Loqo gözəldir — amma marka loqo deyil. Marka həmin loqonu görəndə müştərinin **nə hiss etdiyidir.** Marka sənin restoranın adı çəkiləndə insanların **beynində yaranan şəkildir.** Və bu şəkil loqodan **daha dərin şeylər**lə formalaşır.

Bu yazıda izah edirəm: restoran markası nədir, hansı səviyyələrdən ibarətdir, necə yaradılır.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **MARTY NEUMEIER**                                    ║
> ║ Branding eksperti, "The Brand Gap" müəllifi               ║
> ║                                                           ║
> ║ *"Marka nədir? Marka loqo deyil. Marka kimlik deyil.      ║
> ║  Marka — insanların sənin haqqında hiss etdiyidir."*      ║
> ║                                                           ║
> ║ 📖 The Brand Gap                                          ║
> ║ 🔗 Neumeier dünya brending-inin atası sayılır. Apple-ın,   ║
> ║    Nike-ın marka strategiyaları onun prinsipləri üzərində  ║
> ║    qurulub.                                                ║
> ╚══════════════════════════════════════════════════════════╝

---

## Restoran markasının 3 səviyyəsi

### Səviyyə 1: Vizual kimlik — "Necə görünürsən?"

Bu, hamının "marka" dedikdə düşündüyü şeydir:
- **Loqo** — simvol, ad, kombinasiya
- **Rəng palitası** — hansı rənglər brendi təmsil edir?
- **Tipografiya** — menyu, vizitka, sosial media şriftləri
- **Fotoşəkil stili** — yeməklərin çəkilişi, işıqlandırma, kompozisiya
- **Uniforma** — heyətin görünüşü
- **İnteryer elementləri** — mebel, dekor, divar afişaları

Bu səviyyə **vacibdir** — amma **yetərli deyil.**

### Səviyyə 2: Dil və ton — "Necə danışırsan?"

- **Menyu təsvirləri** — "Toyuq sote" yazmaq ilə "Qızıl qabıqlı, limonlu toyuq sote — nənəmin resepti ilə" yazmaq fərqlidir
- **Sosial media tonu** — formal, dostyana, zarafat edən, ciddi?
- **Ofisiantların danışıq tərzi** — əzbər "Xoş gəlmisiniz", yoxsa səmimi "Salamlar, buyurun"?
- **Şikayətlərə cavab** — müdafiə yoxsa anlayış?

Bu səviyyə **xarakterini** formalaşdırır.

### Səviyyə 3: Mədəniyyət və dəyərlər — "Nəyə inanırsan?"

- **İşçilərə münasibət** — hörmətsiz yerdə işçi müştəriyə hörmət etməz
- **Qida fəlsəfəsi** — təzə, yerli, dondurulmuş, kimyəvi?
- **Müştəri ilə münasibət** — tranzaksiya yoxsa əlaqə?
- **Problem həlli** — izah yoxsa həll?

Bu səviyyə **ruhunu** müəyyənləşdirir.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **HOWARD SCHULTZ**                                    ║
> ║ Starbucks qurucusu                                        ║
> ║                                                           ║
> ║ *"Starbucks qəhvə satmır. Starbucks 'üçüncü yer' satır.   ║
> ║  Ev birinci yerdir. İş ikinci yerdir. Biz üçüncü yeri     ║
> ║  satırıq — rahat, ictimai, ilham verən."*                 ║
> ║                                                           ║
> ║ 📖 Pour Your Heart Into It                                ║
> ║ 🔗 Schultz İtaliyada espresso barını gördü, amma qəhvəni   ║
> ║    deyil, hissi gətirdi: "ev ilə iş arasındakı yer."       ║
> ║    Buna "third place concept" deyilir.                     ║
> ╚══════════════════════════════════════════════════════════╝

---

## Marka = Söz vermək (Brand Promise)

Markanın özəyində **söz** dayanır — müştəriyə nə vəd edirsən?

| Restoran/Brend | Sözü (vədi) |
|---|---|
| **McDonald's** | "Sürətli, sabit, hər yerdə eyni" — 3 dəqiqəyə, dünyanın harasında olsan eyni dad |
| **Starbucks** | "Üçüncü yer" — ev ilə iş arasında rahat, tanış yer |
| **Nusret** | "Show, status, təcrübə" — ət yemək yox, ət şousu izləmək |
| **In-N-Out Burger** | "Sadə, keyfiyyətli, heç vaxt dəyişməyən" — 70 il eyni menyu |
| **Domino's** | "30 dəqiqəyə qapında" — sürət vədi |

**Sənin restoranın nə söz verir?**

Bu suala **bir cümlə** ilə cavab verə bilmirsənsə — markan yoxdur, sadəcə loqon var.

---

> 📝 **DK AGENCY QEYDI:** "Bakıda 10 restoran sahibinə sual verdim: 'Markanız nə vəd edir?' 8-i 'keyfiyyətli yemək' dedi. Maraqlıdır ki, 8-nin heç biri bir-birinə bənzəmirdi — biri fast food, biri fine dining, biri kafe. Hamısı 'keyfiyyətli yemək' deyir. Bu, differensiasiya deyil, bu — heç nədir. 'Keyfiyyətli yemək' söz deyil, gözləntidir. Söz fərqləndirir."

---

## Markanı necə qurmaq? 5 addım

### Addım 1: Hədəf auditoriyanı tanı

Hamı üçün marka qurmaq = heç kim üçün marka qurmaq.

- Kim üçün işləyirsən? Yaş, gəlir, həyat tərzi
- Onlar harada vaxt keçirir? Nə oxuyur? Nəyə önəm verir?
- Niyə sənə gəlməli? Evdə yeməkdən, rəqibindən fərqin nədir?

**Nümunə:** "25-40 yaş tech sektorunda işləyən, vaxt qıtlığı olan, amma sağlam qidalanmaq istəyən peşəkarlar üçün sürətli, keyfiyyətli, healty fast-casual konsept."

### Addım 2: Brendin "niyə"sini müəyyənləşdir

Simon Sinek-in "Golden Circle" konsepti:
- **What (Nə):** Yemək satırsınız — hamı satır
- **How (Necə):** Təzə inqrediyentlə, tez hazırlayırsınız — çoxları edir
- **Why (Niyə):** İnsanların sağlam qidalanmağını asanlaşdırmaq istəyirsən — bu fərqləndirir

"Why" ilə başla. Müştərilər "nə" aldıqlarını yox, "niyə" aldıqlarını hiss edir.

### Addım 3: Vizual kimlik yarat

- **Loqo** — sadə, yadda qalan, miqyaslanabilən (vizitka və billboard-da eyni görünən)
- **Rəng** — 2-3 əsas rəng, emosiya daşıyır (qırmızı = enerji, yaşıl = sağlam, qara = premium)
- **Şrift** — menyu, afişa, sosial media üçün uyğun, oxunaqlı
- **Fotoşəkil stili** — bütün şəkillər eyni tonda, işıqda, kompozisiyada

**Vacib:** Brand guideline yaradın — dizayner dəyişəndə belə markadan çıxmasın.

### Addım 4: Marka dilini yarat

- **Tone of voice** — necə danışırsan? Dostyana? Peşəkar? Zarafat edən?
- **Menyu dili** — təsvir, ad, ton
- **Sosial media dili** — hashtag, cavab tərzi, story tonu
- **Ofisiant skripti** — qarşılama, sifariş, vidalaşma

Marka dili **ardıcıl** olmalıdır — bir gün "Xoş gəldiniz, effendim", o biri gün "Salam, qardaş" = marka yoxdur.

### Addım 5: Mədəniyyət yarat

- **Dəyərlər** — komandanın paylaşdığı inamlar (nümunə: "Müştəri haqlıdır" yox, "Müştəri önəmlidir")
- **Rituallar** — pre-shift meeting, doğum günü qeyd etmə
- **Davranış qaydaları** — problem olduqda nə edərik? Söz verdiyimizi tuta bilməyəndə?

Mədəniyyət **yaşamalıdır** — divara yazılmış "Müştəri birincidir" kifayət deyil.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DANNY MEYER**                                       ║
> ║ Union Square Hospitality, Shake Shack qurucusu            ║
> ║                                                           ║
> ║ *"Biz işçi işə götürəndə skill-ə baxmırıq. HQ —            ║
> ║  Hospitality Quotient-ə baxırıq: isti, empatik,            ║
> ║  komandaçı insanlar. Skill öyrədilər, xarakter              ║
> ║  dəyişdirilməz."*                                          ║
> ║                                                           ║
> ║ 📖 Setting the Table                                      ║
> ║ 🔗 Meyer markası işçilə başlayır. Sən kimin işə            ║
> ║    götürürsən?                                              ║
> ╚══════════════════════════════════════════════════════════╝

---

## Nümunə: Nusret — marka yaradılış şah əsəri

Nusret Gökçe dünyada ən tanınan türk restoran markasıdır. Necə bacarıb?

### 1. Vizual kimlik
- **Loqo:** Sadə, əl yazısı şriftli imza
- **Rəng:** Qara-ağ dominantlığı
- **Uniforma:** Ağ köynək, günəş eynəyi — amma əsassız deyil, **xarakter**

### 2. Dil və ton
- **Sosial media:** Az danışır, video ilə göstərir
- **Mimika:** "Salt Bae" hərəkəti — heç yazılmır, amma hamı tanıyır

### 3. Mədəniyyət
- **Show:** Yemək hazırlamaq = performans
- **Status simvolu:** Nusret-ə getmək = varlı olmağı göstərmək
- **Təcrübə:** Ət yeməyə yox, təcrübə yaşamağa gedirsən

**İmportant:** Nusret 1 yemək dükanından başladı, sosial media ilə marka oldu. Loqo yaratmadı, **özü marka oldu.**

---

## Markanı pozan 5 səhv

| # | Səhv | Nəticə |
|---|---|---|
| 1 | **Ardıcılsızlıq:** Bu gün resmi ton, sabah slang | Müştəri "kimsiniz?" bilmir |
| 2 | **Həddən artıq vəd:** "Ən yaxşı yemək, ən ucuz qiymət" | İnanılmır, narazılıq |
| 3 | **Vizual xaos:** Menyu bir stil, Instagram başqa, divar afişası başqa | Professional görünmür |
| 4 | **Mədəniyyətsizlik:** Divar yazıları ilə real rəftar uyğunlaşmır | "Fake" hiss edilir |
| 5 | **Kopya:** Nusret-in hərəkətini etmək, Starbucks-ın dizaynını kopya | Heç bir unikallıq yoxdur |

---

## MARKA CHECKLIST

| # | Element | Hazırdır? |
|---|---|---|
| 1 | Markanın bir cümlə vədi (brand promise) yazılıb | ☐ |
| 2 | Hədəf auditoriya profili təyin edilib | ☐ |
| 3 | Loqo professional dizayn edilib | ☐ |
| 4 | Rəng palitası (2-3 əsas rəng) seçilib | ☐ |
| 5 | Tipografiya (2 şrift max) müəyyənləşib | ☐ |
| 6 | Fotoşəkil stili hazırlanıb (lighting, composition, tone) | ☐ |
| 7 | Menyu dizaynı brend ilə uyğunlaşıb | ☐ |
| 8 | Tone of voice yazılıb (necə danışırıq?) | ☐ |
| 9 | Sosial media bələdçisi hazırlanıb | ☐ |
| 10 | Heyət üçün danışıq skripti yazılıb | ☐ |
| 11 | Brand guideline sənədi hazırlanıb | ☐ |
| 12 | Dəyərlər siyahısı (3-5 dəyər) yazılıb | ☐ |

---

> **💡 DK Agency Danışmanlıq:** Marka yaratmaq dizayndan başlayır, amma dizaynla bitmir. DK Agency olaraq restoranınız üçün **tam brend strategiyası** hazırlayırıq: vizual kimlik, marka dili, müştəri təcrübəsi, heyət təlimi — hamısı bir paket.
>
> 📧 info@dkagency.com.tr | 🔧 dkagency.com.tr/toolkit | 🌐 dkagency.com.tr/danismanlik`,
    isPremium: false,
    relatedArticles: ['menyu-muhendisliyi-satis', 'kurumsal-kitabca-emeliyyat'],
    coverImage: '/images/blog-09.png',
    coverImageAlt: 'Restoran markalaşma konsept',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 10: BAŞABAŞ NÖQTƏSİ
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-010',
    slug: 'basabas-noqtesi-hesablama',
    title: 'Restoranın Hər Gün Neçə Müştəriyə Ehtiyacı Var? Başabaş Nöqtəsinin Acı Həqiqəti',
    subtitle: 'Break-even point hesablama formulu',
    category: 'maliyye',
    categoryEmoji: '💰',
    readingTime: 12,
    wordCount: 1850,
    author: 'Doğan Tomris',
    publishDate: '2026-02-06T09:00:00Z',
    updatedAt: '2026-02-20T09:00:00Z',
    tags: ['başabaş', 'break-even', 'maliyyə', 'müştəri', 'satış'],
    metaDescription: 'Başabaş nöqtəsi nədir? Gündə neçə müştəri lazımdır ki batmayasan? Praktik hesablama qaydaları.',
    focusKeyword: 'başabaş nöqtəsi hesablama',
    summary: '"Günə 50 müştəri gəlir, yaxşıdır" — yaxşıdırmı? Sənin gündə neçə müştəriyə ehtiyacın olduğunu hesablamadan bilmək mümkün deyil.',
    content: `# Restoranın Hər Gün Neçə Müştəriyə Ehtiyacı Var? Başabaş Nöqtəsinin Acı Həqiqəti

*Kateqoriya: 💰 Maliyyə & Rentabellik | Oxu müddəti: 10-12 dəq*

---

Sahibkar deyir: "Günə 50 müştəri gəlir, yaxşıdır."

Yaxşıdırmı? Bilmirsən. Çünki **sənin günə neçə müştəriyə ehtiyacın olduğunu hesablamamısan.** 50 müştəri bəzi restoran üçün çox, bəzisi üçün iflasa gedən yol. Bu, sənin konkret xərclərindən və orta hesabından asılıdır.

Bu yazıda izah edirəm: **başabaş nöqtəsi nədir**, necə hesablanır, və niyə hər sahibkar bu rəqəmi bilməlidir.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **PETER DRUCKER**                                     ║
> ║ Müasir menecmentin atası                                   ║
> ║                                                           ║
> ║ *"What gets measured, gets managed."*                     ║
> ║    — Ölçülən idarə edilir.                                 ║
> ║                                                           ║
> ║ 📖 The Practice of Management                             ║
> ║ 🔗 Başabaş nöqtəsini bilmirsənsə, xərcləri idarə etmirsən, ║
> ║    sadəcə xərcləyirsən.                                    ║
> ╚══════════════════════════════════════════════════════════╝

---

## Başabaş nöqtəsi nədir?

Sadə dillə: restoran nə qazanır, nə itirir — **sıfırda qalır.** İngilis tənliyində **Break-even Point.**

Bu nöqtədən **aşağı**san — pul **itirirsən.**
Bu nöqtədən **yuxarı**san — pul **qazanırsan.**

Başabaş nöqtəsi iki formada ifadə edilir:
1. **Aylıq gəlir** — ayda neçə ₼ satmalısan ki sıfıra çıxasan?
2. **Gündəlik müştəri sayı** — günə neçə müştəri gəlməlidir ki batmayasan?

Hər ikisi eyni şeyi deyir, amma ikincisi **daha praktik** — hər axşam müştəri sayını sayır, bilir sahibkar.

---

## Formula: Başabaş nöqtəsi necə hesablanır?

\`\`\`
Başabaş nöqtəsi (₼) = Sabit Xərclər ÷ (1 - Dəyişən Xərc Faizi)
\`\`\`

Və ya **Contribution Margin** ilə:

\`\`\`
Başabaş nöqtəsi (₼) = Sabit Xərclər ÷ Contribution Margin %
\`\`\`

**Contribution Margin = 1 - Dəyişən Xərc Faizi**

---

## Sabit və dəyişən xərclər

Bu hesablamanı etmək üçün xərcləri **iki qrupa** bölməlisən:

### Sabit xərclər (Fixed Costs)
Satış olsa da, olmasa da — **hər ay eyni** ödəniləcək xərclər:

| # | Xərc növü | Aylıq məbləğ (nümunə) |
|---|---|---|
| 1 | İcarə | 10.000₼ |
| 2 | Əməkhaqqı (minimum heyət) | 8.000₼ |
| 3 | Kommunal (orta) | 2.000₼ |
| 4 | Kredit/lizinq ödənişi | 2.000₼ |
| 5 | Sığorta | 500₼ |
| 6 | Mühasibat xidməti | 500₼ |
| 7 | Software (POS, digər) | 500₼ |
| 8 | Digər sabit | 1.500₼ |
| | **TOPLAM SABİT** | **25.000₼** |

### Dəyişən xərclər (Variable Costs)
Satışdan **asılı** olan, satış artdıqca artan xərclər:

| # | Xərc növü | Satışın %-i |
|---|---|---|
| 1 | Food cost (xammal) | 28% |
| 2 | İçki cost | 5% |
| 3 | Qablaşdırma (take-away) | 2% |
| 4 | Kart komissiyası | 2% |
| 5 | Wolt/Bolt komissiyası (əgər varsa) | 3% |
| | **TOPLAM DƏYİŞƏN** | **40%** |

---

> 📝 **DK AGENCY QEYDI:** "Əməkhaqqı sabit xərcdir' deyirik, amma bu, minimum heyət üçündür. Tez günlərdə əlavə heyət çağırırsansa, həmin artıq əmək xərci dəyişəndir. Sabit = 'satış olmasa da ödəyəcəyim'. Buna görə minimum heyəti götürün."

---

## Praktik nümunə: Yerli restoran

Götürək bir restoran:

**Məlumat:**
- Aylıq sabit xərclər: **25.000₼**
- Dəyişən xərc faizi: **40%** (satışın 40%-i xammal, komissiya, qablaşdırma)
- Orta hesab: **25₼** (bir müştərinin orta ödədiyi)
- Ayda iş günü: **30** (hər gün açıqdır)

**Hesablama:**

1. **Contribution Margin = 1 - 0.40 = 0.60 (60%)**
   — Hər satılan 1₼-dən 60 qəpik sabit xərci ödəməyə gedir

2. **Başabaş nöqtəsi (aylıq) = 25.000 ÷ 0.60 = 41.667₼**
   — Ayda 41.667₼ satmalısan ki sıfırda qalasan

3. **Gündəlik başabaş = 41.667 ÷ 30 = 1.389₼**
   — Gündə 1.389₼ satmalısan

4. **Gündəlik müştəri = 1.389 ÷ 25 = ~56 müştəri**
   — Gündə 56 müştəri gələndə — sıfırdasan
   — 57-ci müştəridən qazanmağa başlayırsan

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DAVID SCOTT PETERS**                                ║
> ║ Restaurant Coach, "Restaurant Prosperity Formula"          ║
> ║                                                           ║
> ║ *"Çox sahibkar 'yaxşı ayımız oldu' deyir, amma rəqəmləri  ║
> ║  soruşanda bilmir. Break-even bilmirsənsə, 'yaxşı' nədir   ║
> ║  bilmirsən."*                                              ║
> ║                                                           ║
> ║ 📖 Restaurant Prosperity Formula                          ║
> ║ 🔗 Peters ABŞ-da 1000+ restoranı məsləhətləşdirib. Hamıya  ║
> ║    ilk öyrətdiyi: break-even nöqtəsi.                      ║
> ╚══════════════════════════════════════════════════════════╝

---

## Başabaş nöqtəsini bilmək niyə vacibdir?

### 1. Kafe sahibi kimi düşünmə, investor kimi düşün

Kafe sahibi: "Bu gün 45 müştəri gəldi, pis deyil."
Investor: "Bu gün 45 müştəri gəldi, başabaş 56-dır, 11 müştəri azdır, gün zərərlədir."

### 2. Qiymət qoyarkən istifadə et

Orta hesab 25₼ ilə başabaş 56 müştəridir.
Orta hesabı 30₼-ə çıxarsan? 1.389 ÷ 30 = **46 müştəri.** 10 müştəri az lazımdır.

Menyu qiymətlərini artırmağın **nə qədər təsir etdiyini** görürsən.

### 3. Xərc kəsməyə qərar ver

Sabit xərcləri 25.000-dən 22.000-ə endirsən nə olar?
22.000 ÷ 0.60 = 36.667₼/ay = 1.222₼/gün = **49 müştəri.**

7 müştəri az lazımdır. Hər azaldılan xərc **birbaşa başabaşı aşağı salır.**

### 4. Sezon planlaması

Qış aylarında müştəri 40-a düşür? Filter sabit xərcləri azalt, ya da dəyişən xərci optimallaşdır.

---

## Break-even Calculator: Sənin üçün cədvəl

Aşağıdakı cədvəldə fərqli senariləri gör:

| Sabit xərc | Dəyişən % | Orta hesab | Başabaş (aylıq) | Başabaş (gün) | Müştəri/gün |
|---|---|---|---|---|---|
| 20.000₼ | 35% | 20₼ | 30.769₼ | 1.026₼ | **51** |
| 20.000₼ | 35% | 25₼ | 30.769₼ | 1.026₼ | **41** |
| 25.000₼ | 40% | 25₼ | 41.667₼ | 1.389₼ | **56** |
| 25.000₼ | 40% | 30₼ | 41.667₼ | 1.389₼ | **46** |
| 30.000₼ | 40% | 25₼ | 50.000₼ | 1.667₼ | **67** |
| 30.000₼ | 40% | 30₼ | 50.000₼ | 1.667₼ | **56** |
| 35.000₼ | 45% | 30₼ | 63.636₼ | 2.121₼ | **71** |

**Gör necə:** Sabit xərc artdıqca başabaş yüksəlir. Orta hesab artdıqca lazım olan müştəri sayı azalır.

---

## Başabaş-dan "mənfəət nöqtəsi"nə keçid

Başabaş **sıfırdır** — amma sən sıfır qazanmaq üçün restoran açmamısan. **Mənfəət hədəfin** olmalıdır.

### Mənfəət nöqtəsi formulu:

\`\`\`
Mənfəət nöqtəsi (₼) = (Sabit Xərclər + Hədəf Mənfəət) ÷ Contribution Margin %
\`\`\`

**Nümunə:**
- Sabit xərclər: 25.000₼
- Hədəf mənfəət: 10.000₼/ay (sahibkarın gəliri)
- Contribution margin: 60%

Mənfəət nöqtəsi = (25.000 + 10.000) ÷ 0.60 = **58.333₼/ay**

Bu, gündə **1.944₼** və ya **78 müştəri** deməkdir (25₼ orta hesabla).

Başabaşda — sıfırdasan.
78 müştəridə — ayda 10.000₼ qazanırsan.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **WARREN BUFFETT**                                    ║
> ║ İnvestor                                                   ║
> ║                                                           ║
> ║ *"Price is what you pay. Value is what you get."*         ║
> ║    — Qiymət ödədiyindir. Dəyər əldə etdiyindir.           ║
> ║                                                           ║
> ║ 📖 Shareholder Letters                                    ║
> ║ 🔗 Restorançılıqda da eyni: xərc ödədiyindir, başabaşı     ║
> ║    bilmək — əldə etdiyin dəyəri anlamaqdır.                ║
> ╚══════════════════════════════════════════════════════════╝

---

## Başabaşı aşağı salmağın 5 yolu

### 1. Sabit xərcləri azalt
- İcarə danışıqlığı
- Enerji optimallaşdırılması
- Lazımsız abunəlikləri ləğv et

### 2. Food cost-u aşağı sal
- Portion control (standart reseptlər)
- Waste azaltma (inventar sistemi)
- Supplier danışıqlığı

### 3. Orta hesabı artır
- Up-selling təlimi
- Menyu mühəndisliyi (yüksək marginlı yeməklər)
- Add-on satışlar (desert, içki)

### 4. Oturma sayını artır (table turnover)
- Xidmət sürətini artır
- Rezervasiya sistemi
- Layout optimallaşdırması

### 5. Yeni gəlir kanalları əlavə et
- Take-away
- Catering
- Korporativ sifarişlər

---

## BAŞABAŞ CHECKLIST

| # | Maddə | Hazırdır? |
|---|---|---|
| 1 | Aylıq sabit xərclər cədvəli hazırlanıb | ☐ |
| 2 | Dəyişən xərc faizi hesablanıb | ☐ |
| 3 | Orta hesab məbləği müəyyənləşib | ☐ |
| 4 | Aylıq başabaş rəqəmi hesablanıb | ☐ |
| 5 | Gündəlik satış hədəfi müəyyənləşib | ☐ |
| 6 | Gündəlik müştəri hədəfi müəyyənləşib | ☐ |
| 7 | Hədəf mənfəət məbləği qoyulub | ☐ |
| 8 | Mənfəət nöqtəsi hesablanıb | ☐ |
| 9 | Hər ayın sonunda aktual vs. hədəf müqayisəsi aparılır | ☐ |
| 10 | Başabaşı aşağı salmaq üçün ən azı 1 addım planlanıb | ☐ |

---

## ÖZƏT

\`\`\`
BAŞABAŞ NÖQTƏSİ = SABİT XƏRCLƏR ÷ CONTRİBUTİON MARGİN

Contribution Margin = 1 - Dəyişən Xərc %
\`\`\`

| Parametr | Nümunə |
|---|---|
| Sabit xərclər | 25.000₼/ay |
| Dəyişən xərc | 40% |
| Contribution margin | 60% |
| Başabaş (aylıq) | 41.667₼ |
| Başabaş (gündəlik) | 1.389₼ |
| Orta hesab | 25₼ |
| **Başabaş müştəri/gün** | **56** |

56 müştəri = sıfır.
57-ci müştəridən qazanc başlayır.

**Sənin restoranın başabaş nöqtəsi neçədir?**

---

> **💡 DK Agency Toolkit:** Başabaş hesablamaq çətin gəlir? DK Agency Toolkit-də avtomatik Break-even Calculator var — sadəcə xərcləri daxil et, sistem gündəlik müştəri hədəfini hesablayır.
>
> 📧 info@dkagency.com.tr | 🔧 dkagency.com.tr/toolkit | 🌐 dkagency.com.tr/danismanlik`,
    isPremium: false,
    relatedArticles: ['1-porsiya-food-cost-hesablama', 'pnl-oxuya-bilmirsen'],
    coverImage: '/images/blog-10.png',
    coverImageAlt: 'Başabaş nöqtəsi hesablama',
  },

  // NEW ENTRIES — blog-011 through blog-015
  {
    id: 'blog-011',
    slug: 'ai-ile-favok-qorumasi',
    title: 'AI ilə FAVÖK Qoruması: Franchise və HoReCa Şəbəkələrində Qazancı Qorumaq',
    subtitle: 'Franchise və HoReCa şəbəkələrində qazancı qorumağın yeni yolu',
    category: 'Əməliyyat',
    categoryEmoji: '🔧',
    stage: 'Böyüt',
    readingTime: 10,
    wordCount: 1450,
    author: 'Doğan Tomris',
    publishDate: '2026-06-04T09:00:00Z',
    updatedAt: '2026-06-04T09:00:00Z',
    tags: ['FAVÖK', 'AI', 'franchise', 'HoReCa', 'əməliyyat', 'food cost'],
    metaDescription: 'AI ilə FAVÖK qoruması: franchise və HoReCa şəbəkələrində qazancı necə qorumaq? Food cost, personal, delivery sızmaları.',
    focusKeyword: 'AI FAVÖK qoruması',
    summary: 'HoReCa-da ciro artımını uğur sayma. FAVÖK marjasını AI ilə qorumaq franchise sistemlərində xüsusilə kritikdir — görünməyən əməliyyat sızmalarını vaxtında göstərir.',
    isPremium: true,
    relatedArticles: ['1-porsiya-food-cost-hesablama', 'pnl-oxuya-bilmirsen'],
    coverImage: '/images/blog-12.png',
    coverImageAlt: 'AI ilə FAVÖK qoruması',
    content: `# AI ilə FAVÖK Qoruması

## Franchise və HoReCa şəbəkələrində qazancı qorumağın yeni yolu

HoReCa-da bir çox sahibkar ciro artımını uğur sayır. Amma 2026-da yalnız ciroya baxmaq təhlükəlidir: satış arta bilər, qazanc azala bilər. Əsas sual: **"Restoran daha çox satır, yoxsa daha sağlam qazanır?"**

Franchise və çoxşubəli modeldə bu daha kritikdir. Bir şöbə 20% FAVÖK (faiz, vergi, amortizasiyadan əvvəlki əməliyyat qazancı) marjası ilə işləyərkən, eyni marka altında digər şöbə 7% ilə işləyə bilər. Problem çox vaxt satışda yox, **görünməyən əməliyyat sızmalarındadır.** Bunları vaxtında görmək üçün artıq Excel kifayət etmir.

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

## 3. Franchise sistemində AI niyə daha vacibdir?
5-20 şöbəli sistemdə hər şöbənin kirayəsi, personalı, müştərisi, food cost davranışı fərqlidir. Mərkəz bunu eyni sistemdə izləmirsə, problem yalnız aylıq hesabatda görünür — və o zaman gec olur. AI burada **mərkəzi sinir sistemi** kimi işləyir.

### Franchise mərkəzi panelində görünməli 10 göstərici
Şöbə üzrə günlük ciro · FAVÖK marjası · food cost sapması · əməkhaqqı/ciro · ortalama çek · saatlıq satış · ən çox qazandıran məhsullar · fire/zay · müştəri şikayətləri · royalty/reklam ödəniş uyğunluğu.

### Franchise üçün qırmızı bayraq
Franchise verən yalnız royalty alır, amma food cost, xidmət keyfiyyəti, POS datası və müştəri təcrübəsini izləmirsə — bu franchise deyil, **sadəcə ad istifadəsidir.**

---

## 4. AI ilə FAVÖK qoruması necə qurulur?

**1. Data təmizliyi:** məhsul adları standart, resept kartları rəqəmsal, porsiya sabit, təchizat qiymətləri sistemdə. Data qarışıqdırsa, AI səhv nəticə verir.

**2. KPI xəritəsi:** food cost %, labor cost %, prime cost, FAVÖK marjası, ortalama çek, müştəri təkrarlanması, delivery marjası, fire %, məhsul üzrə gross margin.

**3. Erkən xəbərdarlıq:** hər gün — hansı şöbədə food cost normadan çıxıb? hansı məhsul marjanı aşağı salır? hansı şöbədə FAVÖK düşür amma ciro artdığı üçün gizlənir?

**4. Müdaxilə planı:** hər siqnalın qarşısında aksiyon olmalıdır (food cost↑ → resept/porsiya/alış yoxla; labor cost↑ → növbə planı; FAVÖK↓ → 7 günlük operativ audit).

### ⚠️ Vacib qeyd (halüsinasyon)
AI yalnız **mövcud SSOT datadan** oxumalıdır. Sistemə uydurma kampaniya/qiymət "icad etmək" qadağandır — hər çıxış real data ilə məhdudlaşmalıdır.

### Guru Kutusu
> **Edwards Deming (idarəetmə):** "Allaha güvənirik — qalan hamı data gətirsin."
> *(Restoran üçün: hiss yox, ölçülmüş rəqəm.)*

---

## 5. Azərbaycan bazarında tətbiq modeli
**Kiçik başla, düzgün qur.** İlk mərhələdə 3–5 şöbə üçün kifayətdir: POS datasının gündəlik çıxarılması, məhsul üzrə satış analizi, food cost kartlarının yenilənməsi, personal saatlarının satışla müqayisəsi, delivery marjasının ayrıca analizi, şöbə üzrə FAVÖK paneli, həftəlik risk siqnalı.

### Praktik tətbiq qutusu
İlk 5 siqnal: (1) food cost normadan 3% yuxarı, (2) labor cost +2%, (3) ortalama çek 10 gün ardıcıl azaldı, (4) delivery artdı amma marja düşdü, (5) ən çox satılan məhsulun marjası mənfiyə yaxınlaşdı.

---

## Nəticə: AI restoranı yox, marjanı idarə edir
2026-da rəqabət menyu və lokasiyada yox, bu sualın cavabında olacaq: **"Kim marjanı daha tez görür, daha tez qoruyur və daha sistemli böyüdür?"** Cavabı olan franchise sistemi investor üçün daha qiymətlidir.

### Son sual
Restoranınız bu gün işləyir. Bəs sisteminiz sabah siz olmadan da işləyəcəkmi?

---

### Faydalı alətlər
- [KAZAN AI — Restoran süni intellekt köməkçisi →](/kazan-ai)
- [Restoran Audit aləti →](/toolkit?tool=restoran-audit)

## DK Agency necə kömək edir?
DK Agency-nin **KAZAN AI** və **OCAQ** sahibkar paneli məhz bu FAVÖK qoruma sistemini qurur: data görünür hala gəlir, şöbələr müqayisə olunur, risk siqnalları erkən gəlir. AI Restoran Operasiya Audit xidməti ilə hansı sızmanın harada olduğunu göstəririk. *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Şəbəkənizin FAVÖK sağlamlığını ölçmək üçün DK Agency AI audit ilə pulsuz ilkin dəyərləndirmə al.`,
  },

  {
    id: 'blog-012',
    slug: 'isleyen-franchise-devralmaq',
    title: 'İşləyən Franchise\'i Almaq: Sıfırdan Qurmaqdan Niyə Daha Ağıllıdır?',
    subtitle: 'Yeni bir kafe açmaq romantik səslənir — amma ağıllı sahibkar devr edir',
    category: 'Satış',
    categoryEmoji: '📈',
    stage: 'Devir',
    readingTime: 8,
    wordCount: 1100,
    author: 'Doğan Tomris',
    publishDate: '2026-06-04T09:00:00Z',
    updatedAt: '2026-06-04T09:00:00Z',
    tags: ['franchise', 'devir', 'satış', 'yatırım', 'due diligence'],
    metaDescription: 'İşləyən franchise almaq niyə sıfırdan qurmaqdan daha ağıllıdır? Risk, vaxt, büdcə müqayisəsi və due diligence bələdçisi.',
    focusKeyword: 'işləyən franchise almaq',
    summary: 'Franchise dünyasında devir — mövcud franchise sahibinin işini olduğu kimi almaq. Risk aşağıdır, ilk gündən qazanc var, real rəqəmlər masadadır.',
    isPremium: false,
    relatedArticles: ['sifirdan-yoxsa-isleyen-franchise-devri', 'mulki-mecelle-726-franchise-devri'],
    coverImage: '/images/blog-13.png',
    coverImageAlt: 'İşləyən franchise devralmaq',
    content: `# İşləyən Franchise'i Almaq: Sıfırdan Qurmaqdan Niyə Daha Ağıllıdır?

Yeni bir kafe və ya restoran açmaq romantik səslənir. Amma 2026-da ağıllı sahibkar bir sual verir: niyə sıfırdan qurum, əgər artıq işləyən, müştərisi olan bir biznesi ala bilərəmsə?

Franchise dünyasında buna **devir** deyilir — yəni mövcud franchise sahibinin işini olduğu kimi almaq. İki yol var: ya boş bir məkanı sıfırdan qurursan, ya da artıq pul qazanan bir şöbəni devralırsan. Fərq sadəcə zövq məsələsi deyil — pul və risk məsələsidir.

## 1. Sıfırdan qurmaq: uzun və qeyri-müəyyən

Sıfırdan açanda ən böyük problem **vaxt və gözlənilməz xərclərdir.**

- Tikinti, icazələr, avadanlıq, dizayn — bütün bunlar aylarla çəkir. Bu müddətdə məkan bağlıdır, pul gəlmir, amma xərclər davam edir.
- Büdcə demək olar ki, həmişə aşılır: tikinti bahalaşır, tədarük gecikir, bir şey əskik çıxır.
- Ən vacibi: açıldıqdan sonra da müştərinin gəlib-gəlməyəcəyini **heç kim zəmanət verə bilmir.** Hər şey kağız üstündəki proqnoza əsaslanır.

## 2. Devir: ilk gündən qazanc

İşləyən bir franchise alanda fərqli bir mənzərə var:

- **İlk gündən pul qazanırsan.** Müştəri var, komanda var, avadanlıq qurulub. Sən sıfırdan başlamırsan — gedən bir maşına minirsən.
- **Risk daha aşağıdır**, çünki lokasiya və müştəri kütləsi artıq sınanıb. "Bura işləyirmi?" sualının cavabı bəlli.
- **Real rəqəmlər masadadır:** keçmiş satışlar, vergi bəyannamələri, kâr/zərər cədvəli. Sən təxminlə yox, faktla qərar verirsən.

> **Praktik fərq:** Sıfırdan qurulumda əlində bir Excel proqnozu olur — arzu. Devirdə isə əlində bank hesabı çıxarışı olur — həqiqət.

## 3. Devirin gizli üstünlüyü: böyümə

Pul qazanan bir şöbəni almaq banklar üçün də daha etibarlı profildir. İşləyən biznes ikinci, üçüncü şöbəni açmaq üçün lazım olan gücü öz içindən yarada bilir. Yəni devir tək bir dükan deyil — planlı böyümənin başlanğıcıdır.

## Müqayisə cədvəli

| Meyar | Sıfırdan qurulum | İşləyən franchise (devir) |
|---|---|---|
| Başlanğıc riski | Yüksək — lokasiya sınanmayıb | Aşağı — müştəri və yer sübut olunub |
| Büdcənin aşması | Çox vaxt 15-30% artıq | Demək olar ki, yox |
| Pul nə vaxt gəlir | 6-12 ay sonra | İlk gündən |
| Qərar nəyə əsaslanır | Təxminə (proqnoz) | Real rəqəmə (keçmiş satış) |
| Komanda | Sıfırdan işə qəbul | Hazır, təcrübəli komanda |

## Bir şərt: ön yoxlama (due diligence)

Devirin tək riski var — satıcının rəqəmlərinin doğru olub-olmadığını yoxlamamaq. Buna görə devirdən əvvəl mütləq:

1. Son 2-3 ilin real satış və vergi sənədlərini gör.
2. Satıcıya "niyə satırsan?" sualını ver. *(Qeyd: dünyada franchise satışlarının yarıdan çoxu biznesin batması yox, sahibin təqaüdə çıxması və ya köçməsi kimi şəxsi səbəblərlədir — yəni satılan biznes çox vaxt sağlamdır.)*
3. Müqavilədə devir hüququnu yoxla — franchise verən bu devri təsdiqləməlidir.

> **Qızıl qayda:** Sermayeni xərcləməzdən əvvəl biznesin "sağlamlıq skorunu" gör. Şəffaf rəqəm olmadan devir alma.

---

### Faydalı alətlər
- [ROI Kalkulyatoru — franchise geri dönüş hesabla →](/franchise/roi-kalkulyatoru)
- [Devir elanlarına bax →](/ilanlar?type=devir)

## DK Agency necə kömək edir?

DK Agency-nin **Devir** platforması məhz bunun üçün qurulub: işləyən franchise və biznesləri şəffaf, yoxlanıla bilən formada bir araya gətirir. Beləcə alıcı sermayeni xərcləməzdən əvvəl operasiyanı görür, satıcı isə düzgün alıcı tapır. Çünki bizim üçün devir təkcə alqı-satqı deyil, etibarın nişanıdır: *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** İşləyən bir franchise almaq və ya öz biznesini devr etmək istəyirsən? DK Agency Devir platformasına bax və ya pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.`,
  },

  {
    id: 'blog-013',
    slug: 'marka-qeydiyyati-azerbaycan',
    title: 'Markanı Azərbaycanda Necə Qeydiyyatdan Keçirirsən? (Franchise Üçün Vacib Bələdçi)',
    subtitle: 'Franchise verməyi düşünürsənsə, hər şeydən əvvəl bir sual: markan rəsmi qeydiyyatdan keçibmi?',
    category: 'Hüquqi',
    categoryEmoji: '⚖️',
    stage: 'Başla',
    readingTime: 6,
    wordCount: 850,
    author: 'Doğan Tomris',
    publishDate: '2026-06-04T09:00:00Z',
    updatedAt: '2026-06-04T09:00:00Z',
    tags: ['marka', 'qeydiyyat', 'hüquqi', 'franchise', 'Əqli Mülkiyyət', 'Madrid Protokolu'],
    metaDescription: 'Azərbaycanda marka qeydiyyatı necə aparılır? Franchise üçün niyə vacibdir? Əqli Mülkiyyət Agentliyi, Madrid Protokolu.',
    focusKeyword: 'marka qeydiyyatı Azərbaycan',
    summary: 'Franchise verməyi düşünürsənsə markan rəsmi qeydiyyatdan keçməlidir. Qeydiyyatdan keçməyən markanı franchise vermək, sahibi olmadığın evi icarəyə vermək kimidir.',
    isPremium: false,
    relatedArticles: ['mulki-mecelle-726-franchise-devri'],
    coverImage: '/images/blog-14.png',
    coverImageAlt: 'Marka qeydiyyatı Azərbaycanda',
    content: `# Markanı Azərbaycanda Necə Qeydiyyatdan Keçirirsən?

Franchise verməyi düşünürsənsə, hər şeydən əvvəl bir sual: **markan rəsmi qeydiyyatdan keçibmi?** Çünki qeydiyyatdan keçməyən markanı franchise vermək, sahibi olmadığın evi icarəyə vermək kimidir. Eyni şəkildə, franchise alanda da almaq istədiyin markanın Azərbaycanda qorunub-qorunmadığını bilməlisən.

Bu yazı marka qeydiyyatının necə işlədiyini sadə dildə izah edir.

## Marka qeydiyyatı kimin işidir?

Azərbaycanda markaları **Əqli Mülkiyyət Agentliyi** qeydiyyata alır. Bu qurum müraciətləri yoxlayır, dövlət marka reyestrini aparır və markaların qorunmasını təmin edir. Yoxlamanı Agentliyin Patent və Markaların Ekspertizası Mərkəzi həyata keçirir.

## Neçə vaxt çəkir, kim müraciət edə bilər?

- Qeydiyyat sürətləndirilmiş rejimdə təxminən **3-4 ay** çəkir (adi rejimdə daha uzun ola bilər).
- **Yerli şəxs və şirkətlər birbaşa müraciət edə bilər.**
- **Xarici şəxs və şirkətlər isə yalnız qeydiyyatdan keçmiş patent vəkili vasitəsilə** müraciət edə bilər. Bu, Türkiyə və ya başqa ölkədən gələn brendlər üçün vacib detaldır.
- Müraciət Azərbaycan dilində, markanın aydın təsviri və malların/xidmətlərin siyahısı (Nitsa təsnifatı) ilə verilir.
- Qeydiyyat **10 il** etibarlıdır və yenilənə bilər.

## Niyə bu, franchise üçün kritikdir?

Franchise əslində üç şeyin icarəsidir: **marka, nou-hau (iş bilgisi) və ticari sirr.** Bunların ən görünəni markadır.

- **Franchise verənsənsə:** markan qeydiyyatda deyilsə, onu hüquqi olaraq verə bilməzsən. Qeydiyyat olmadan başqası sənin adını kopyalaya bilər və sən qarşısını ala bilməzsən.
- **Franchise alansansa:** ödədiyin pul markanın gücünə görədir. Əgər marka Azərbaycanda qeydiyyatda deyilsə, pulunu hüquqi qorunması olmayan bir ada verirsən.

> **Praktik qayda:** Müqavilə imzalamazdan əvvəl markanın Əqli Mülkiyyət Agentliyində qeydiyyatda olduğunu yoxla. Bu, ən sadə, amma ən vacib yoxlamadır.

## Markanı dünyaya necə daşıyırsan? (Madrid Protokolu)

Burada xoş xəbər var: Azərbaycan **Madrid Protokoluna** tərəfdir. Bu o deməkdir ki, bir müraciətlə markanı bir neçə ölkədə eyni anda qoruya bilirsən. Yəni "Azərbaycandan dünya brendi çıxarmaq" arzusu sadəcə şüar deyil — bunun hüquqi mexanizmi mövcuddur. (Azərbaycan həm də WIPO üzvüdür və Paris Konvensiyasına tərəfdir.)

Əgər hədəfin yerli markanı qlobala daşımaqdırsa, bu mexanizm AzQuality kimi markalaşma təşəbbüslərinin praktik təməlidir.

---

### Faydalı alət
- [Franchise Hazırlıq Testi — markan franchise verməyə hazırdırmı? →](/franchise/hazirliq-testi)

## DK Agency necə kömək edir?

DK Agency franchise yolunun hər addımında yanındadır — marka hazırlığından franchise sisteminin qurulmasına qədər. Markanı franchise üçün hazırlamaq, sənədləri düzgün sıralamaq və düzgün uzmanlara (patent vəkili, hüquqşünas) yönləndirmək — biz bu yolu sadələşdiririk. Çünki bizim üçün marka tabela yox, etibarın nişanıdır: *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Markan franchise verməyə hazırdırmı? DK Agency Franchise Hazırlıq Testini doldur və ya pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.

*Qeyd: Bu yazı ümumi məlumat üçündür, hüquqi məsləhət deyil. Konkret addımlar üçün patent vəkili və ya hüquqşünasa müraciət edin.*`,
  },

  {
    id: 'blog-014',
    slug: 'mulki-mecelle-726-franchise-devri',
    title: 'Mülki Məcəllə m.726 və Franchise Devri: İnvestor üçün Hüquqi Due Diligence',
    subtitle: 'İnvestor üçün hüquqi due diligence (ön yoxlama) rəhbəri',
    category: 'Hüquqi',
    categoryEmoji: '⚖️',
    stage: 'Devir',
    readingTime: 10,
    wordCount: 1350,
    author: 'Doğan Tomris',
    publishDate: '2026-06-04T09:00:00Z',
    updatedAt: '2026-06-04T09:00:00Z',
    tags: ['mülki məcəllə', 'franchise', 'devir', 'hüquqi', 'due diligence', 'investor'],
    metaDescription: 'Mülki Məcəllə m.726 franchise devri üçün nə deyir? İnvestor üçün hüquqi due diligence: sənədlər, qiymət, qırmızı bayraqlar.',
    focusKeyword: 'franchise devri due diligence',
    summary: 'Franchise devri yalnız hazır biznes almaq deyil. Hüquqi, maliyyə və operativ risklərin birlikdə yoxlandığı prosesdir. M.726 investoru necə qoruyur?',
    isPremium: true,
    relatedArticles: ['isleyen-franchise-devralmaq', 'marka-qeydiyyati-azerbaycan'],
    coverImage: '/images/blog-15.png',
    coverImageAlt: 'Mülki Məcəllə və franchise devri',
    content: `# Mülki Məcəllə m.726 və Franchise Devri

## İnvestor üçün hüquqi due diligence (ön yoxlama) rəhbəri

Franchise devri yalnız hazır biznes almaq deyil. Burada üç aktiv birlikdə devr olunur: **marka istifadə hüququ, işləyən əməliyyat sistemi və gələcək nakit axını.** Buna görə devir sadə alqı-satqı kimi yox, hüquqi, maliyyə və operativ risklərin birlikdə yoxlandığı proses kimi aparılmalıdır.

Azərbaycanda bu mövzunun hüquqi dayağı Mülki Məcəllənin **Françayzinq fəslidir (m.723–731)**, xüsusən **726-cı maddə**: tərəflər franchise sistemi ilə bağlı şərtləri bir-birinə açıq və dürüst bildirməli, əldə etdikləri məxfi məlumatları müqavilə bağlanmasa belə qorumağa borcludurlar. *(Qeyd: Mülki Məcəlləd"Kommersiya konsessiyası" (m.800–807) ayrı bir fəsildir — françayzinq ilə qarışdırılmamalıdır.)*

Bu maddə bir şeyi göstərir: **franchise danışıqlarında məlumat gizlətmək yalnız etik problem deyil, hüquqi riskdir.**

---

## 1. Niyə m.726 investor üçün önəmlidir?

İnvestor çox vaxt satıcının rəqəmlərinə əsaslanır. Bu məlumatlar tam və şəffaf deyilsə, qərar səhv verilə bilər. Məsələn: satıcı real food cost-u gizlədirsə, POS datası ilə vergi dövriyyəsi uyğun gəlmirsə, franchise verən royalty artımını açıqlamırsa, kirayədə riskli xitam şərti varsa, ərazi qoruması əslində yoxdursa, və ya devir üçün franchise verənin yazılı razılığı tələb olunduğu halda bu açıqlanmırsa.

### Hüquqi risk qutusu
Franchise devrində ən təhlükəli cümlə budur: **"Bunu sonra danışarıq."** Due diligence mərhələsində "sonra" yoxdur — hər şey müqavilədən əvvəl yazılı, sənədli və ölçülə bilən olmalıdır.

---

## 2. Franchise devrində 3 tərəf var

Adi biznes satışında iki tərəf olur. Franchise devrində faktiki olaraq **üç tərəf** var: **satan franchisee**, **alan investor** və **franchise verən marka.** Maraqları eyni deyil — satan yüksək qiymət, alan aşağı risk, marka isə davamlılıq və standart istəyir.

Buna görə yalnız satıcı ilə razılaşmaq kifayət deyil. Marka sahibinin devrə razılığı, yeni alıcının təsdiqi, təlim öhdəlikləri və müqavilə müddəti ayrıca yoxlanmalıdır.

---

## 3. İnvestor hansı sənədləri görməlidir?

**Maliyyə:** son 12–24 aylıq POS satışları, vergi bəyannamələri, bank hərəkətləri, kâr/zərər hesabatları, təchizatçı borcları, əməkhaqqı, royalty/reklam ödənişləri, delivery komissiyaları, kommunal/kirayə.

**Hüquqi:** franchise müqaviləsi, devrə icazə maddəsi, marka istifadə şərtləri, ərazi qoruması, müqavilə bitmə tarixi, xitam/uzatma, kirayə müqaviləsi, lisenziyalar, işçi və təchizatçı müqavilələri.

**Operativ:** menyu/resept kartları, food cost kartları, anbar sayım proseduru, təlim materialları, gigiyena prosedurları, müştəri bazası, online satış hesabatları.

### Faydalı məlumat qutusu
Satıcı "bizdə hər şey qaydasındadır" deyir, amma sənəd verə bilmirsə — bu qırmızı bayraqdır. **Restoranın divarları yox, sənədləri danışmalıdır.**

---

## 4. Qiymət necə formalaşmalıdır?

Qiymət "bu obyektə bu qədər xərc çəkmişəm" məntiqi ilə yox, "bu biznes gələcəkdə nə qədər təmiz qazanc yaradacaq?" sualı ilə hesablanmalıdır. Nəzərə alınmalı: son 12 aylıq FAVÖK və onun təkrarlanma gücü, kirayə/ciro nisbəti, food cost sabitliyi, müqavilənin qalan müddəti, franchise verənin devrə münasibəti, gələcək investisiya tələbi və multi-unit genişlənmə imkanı.

### Qırmızı bayraqlar
- Satış datası yalnız şifahi təqdim olunur
- Vergi dövriyyəsi POS datasından çox fərqlidir
- Kirayə müddəti franchise müqaviləsindən qısadır
- Franchise verənin devrə yazılı razılığı yoxdur
- Əsas aşpaz/menecer getmək istəyir
- Food cost son aylarda süni şəkildə aşağı göstərilib
- Borclar tam açıqlanmayıb

---

## 5. Azərbaycan üçün tövsiyə olunan devir modeli

1. **NDA + ilkin məlumat paketi** (gizlilik m.726-dan onsuz da doğur; NDA bunu somutlaşdırır)
2. **Franchise verənin ilkin razılığı**
3. **Maliyyə due diligence** (POS, vergi, bank, borclar)
4. **Hüquqi due diligence** (franchise, kirayə, əmək, lisenziya)
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
- [Franchise Alıcı Çek-listi — devrdan əvvəl yoxla →](/franchise/alici-cheklisti)
- [Devir elanlarına bax →](/ilanlar?type=devir)

## DK Agency necə kömək edir?
DK Agency **Devir** platforması və franchise danışmanlığı ilə devrin hüquqi və maliyyə ön yoxlamasını sistemləşdirir. *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Devir düşünürsən? DK Agency ilə pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.

*Qeyd: Bu yazı ümumi məlumat üçündür, hüquqi məsləhət deyil. Konkret addımlar üçün hüquqşünasa müraciət edin.*`,
  },

  {
    id: 'blog-015',
    slug: 'sifirdan-yoxsa-isleyen-franchise-devri',
    title: 'Sıfırdan HoReCa Yatırımı, yoxsa İşləyən Franchise Devralmaq?',
    subtitle: '2026 bazarında risk, nakit axını və FAVÖK baxışı',
    category: 'Maliyyə',
    categoryEmoji: '💰',
    stage: 'Böyüt',
    readingTime: 10,
    wordCount: 1400,
    author: 'Doğan Tomris',
    publishDate: '2026-06-04T09:00:00Z',
    updatedAt: '2026-06-04T09:00:00Z',
    tags: ['yatırım', 'franchise', 'devir', 'FAVÖK', 'maliyyə', 'greenfield', 'due diligence'],
    metaDescription: 'Sıfırdan restoran açmaq, yoxsa işləyən franchise devralmaq? 2026 bazarında risk, nakit axını və FAVÖK müqayisəsi.',
    focusKeyword: 'franchise devir yatırım',
    summary: '2026-da investor üçün əsas sual: brend qururam, yoxsa işləyən nakit axınını alıram? FAVÖK baxışı ilə sıfırdan vs devir müqayisəsi.',
    isPremium: true,
    relatedArticles: ['isleyen-franchise-devralmaq', 'ai-ile-favok-qorumasi'],
    coverImage: '/images/blog-16.png',
    coverImageAlt: 'Sıfırdan yoxsa franchise devri',
    content: `# Sıfırdan HoReCa Yatırımı, yoxsa İşləyən Franchise Devralmaq?

## 2026 bazarında risk, nakit axını və FAVÖK baxışı

2026-cı ildə HoReCa sektorunda yatırım qərarı artıq "gözəl məkan açaq" düşüncəsi ilə verilmir. Kirayə xərcləri, əməkhaqqı təzyiqi, food cost dalğalanması, avadanlıq qiymətləri və istehlakçının daha seçici davranması restoran yatırımını texniki bir qərara çevirib.

Bu bazarda investor üçün əsas sual dəyişib: **"Mən brend qururam, yoxsa artıq işləyən nakit axınını satın alıram?"**

Sıfırdan restoran yaratmaq hələ də mümkündür, amma yüksək qeyri-müəyyənlik daşıyır. İşləyən franchise şöbəsini devralmaq isə doğru analiz edildikdə daha ölçülə bilən, daha tez test edilən və daha sürətli geri dönüş potensialı yaradır. Məsələ yalnız restoran almaq deyil — **riskin qiymətini düzgün hesablamaqdır.**

---

## 1. Sıfırdan qurulum (greenfield, yəni sıfırdan tikmək): gözəl ideya, yüksək qeyri-müəyyənlik

**Birincisi, ilkin investisiya riski (CAPEX).** Tikinti, dekorasiya, mətbəx avadanlığı, havalandırma, POS sistemi, mebel, fasad — kağız üzərində 300.000 AZN görünən layihə açılışa yaxın 360.000–390.000 AZN-ə çıxa bilər.

**İkincisi, zaman riski.** Məkan açılmayıbsa, pul işləmir. İnvestor kapital qoyur, amma 3–6 ay satış yoxdur. Bu müddətdə kirayə, komanda, dizayn dəyişiklikləri və lisenziyalar kapitalı "ölü zaman"a bağlayır.

**Üçüncüsü, bazar uyğunluğu riski.** Lokasiya, menyu, qiymət və xidmət sürəti yalnız açılışdan sonra real test olunur. Açılış öncəsi Excel modeli bazarın davranışını tam göstərmir.

### Investor qutusu
**Greenfield yatırımda əsas sual:** "Bu konseptin işləyəcəyinə inanırıq, yoxsa bunu sübut edən real satış datası var?" Cavab yalnız "inanırıq"dırsa, bu investisiya yox, yüksək riskli konsept testidir.

---

## 2. İşləyən franchise devri: "real data" üstünlüyü

İşləyən şöbəni devralanda investor sıfırdan mətbəx qurmur, komanda axtarmır, müştəri davranışını təxmin etmir — artıq işləyən sistemin içinə daxil olur. Masaya bu məlumatlarla otura bilər: son 12–24 aylıq satışlar, food cost, əməkhaqqı yükü, kirayə/ciro nisbəti, müştəri təkrarlanması, online satış payı, ortalama çek, FAVÖK marjası, mövsümi dəyişikliklər və vergi tarixçəsi.

Bu, riski azaldır — çünki qərar "gələcək ehtimalı"na yox, **keçmiş performansa** əsaslanır.

### Faydalı məlumat qutusu
İşləyən franchise devrində investor yalnız avadanlıq almır. O, bunları alır: kanıtlanmış lokasiya, hazır müştəri bazası, təlim keçmiş personal, oturmuş tədarük, marka tanınması, gündəlik nakit axını və ölçülə bilən FAVÖK. Yəni fiziki məkana yox, **işləyən iqtisadi vahidə** pul ödəyir.

### Guru Kutusu
> **Warren Buffett:** "Qiymət ödədiyindir, dəyər aldığındır."
> *(Investor üçün: satış qiyməti yox, biznesin yaratdığı real qazanc əsasdır.)*

---

## 3. Pul nə vaxt işləməyə başlayır? (Time-to-Money)

Sıfırdan qurulan restoranda pul əvvəl layihəyə, tikintiyə, komandaya, açılışa gedir; satış bütün bunlardan sonra başlayır. İşləyən devirdə isə **ilk gündən satış davam edir** — müştəri gəlir, POS işləyir, komanda xidmətdədir. Bu fərq geri dönüş müddətinə ciddi təsir edir.

### Sadə müqayisə

| Kriteriya | Sıfırdan yatırım | İşləyən franchise devri |
|---|---|---|
| Satışın başlanması | 3–6 ay sonra | İlk gündən |
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

İnvestor üçün sual sadədir: "Bu kapital nə vaxt və hansı risklə geri dönəcək?" İşləyən franchise devri düzgün ön yoxlama (due diligence) ilə aparıldıqda daha rasional seçimdir — burada fikir yox performans, dekorasiya yox nakit axını alınır.

### Final investor qutusu
Devirdən əvvəl son sual: **"Bu biznes mənsiz də işləyirmi?"** Cavab bəlidirsə, bu artıq restoran deyil — yatırım aktividir.

---

### Faydalı alət
- [ROI Kalkulyatoru — franchise geri dönüş hesabla →](/franchise/roi-kalkulyatoru)

## DK Agency necə kömək edir?
DK Agency-nin **Devir** platforması işləyən franchise və bizneslərin şəffaf, yoxlanıla bilən devrini təmin edir — alıcı sermayəni xərcləməzdən əvvəl operasiyanın "sağlamlıq skorunu" görür. *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Devir platformasına bax və ya ROI Kalkulyatoru ilə öz rəqəmlərini hesabla.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 16: AHA ULDUZ SERTİFİKATI
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-016',
    slug: 'aha-ulduz-sertifikati-otel-hazirliq',
    title: 'AHA Ulduz Sertifikatı: Otelinizi Milli Ulduz Təsnifatına Necə Hazırlayasınız?',
    subtitle: 'Azərbaycanda hər mehmanxana 6 ay içində ulduz almağa məcburdur — və hələ də 70%-i bunu bacarmır',
    category: 'Əməliyyat',
    categoryEmoji: '🔧',
    stage: 'Başla',
    readingTime: 14,
    wordCount: 2200,
    author: 'Doğan Tomris',
    publishDate: '2026-06-04T10:00:00Z',
    updatedAt: '2026-06-04T10:00:00Z',
    tags: ['AHA', 'ulduz sertifikatı', 'otel', 'mehmanxana', 'Hotelstars Union', 'turizm', 'audit'],
    metaDescription: 'AHA Milli Ulduz Təsnifatı: 248 meyar, müraciət prosesi, 5 ən bahalı səhv və otelinizi 3 ayda hazırlamağın yolu.',
    focusKeyword: 'AHA ulduz sertifikatı otel',
    summary: 'Azərbaycanda otel açan hər sahibkar 6 ay içində ulduz almağa məcburdur. 248 meyar, 5 ən bahalı səhv və 3 ayda hazırlıq planı.',
    content: `# AHA Ulduz Sertifikatı: Otelinizi Milli Ulduz Təsnifatına Necə Hazırlayasınız?

*Kateqoriya: 🏨 Hotelçilik | Oxu müddəti: 12-15 dəq*

---

Azərbaycanda otel açan hər sahibkar eyni anı yaşayır: açılış lentini kəsir, ilk müştərini qarşılayır, Booking.com-da profilini yaradır. Bir neçə ay sonra fərq edir — Booking-də "ulduzsuz mehmanxana" görünür. Müştəri sayı az qalır. Niyə?

**Çünki Azərbaycanda hər mehmanxana 6 ay içində ulduz almağa məcburdur** — və hələ də 70%-i bunu bacarmır.

Bu yazıda Milli Ulduz Təsnifatının nə olduğunu, hansı qurumun verdiyini, 248 meyarın necə işlədiyini, hansı 5 səhvin müraciəti puç etdiyini, və otelinizi 3 ay içində hazırlamağın yolunu göstəririk.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **FUAD NAĞIYEV**                                       ║
> ║ Dövlət Turizm Agentliyinin sədri                           ║
> ║                                                            ║
> ║ *"Ulduz almaq istəyən otellərin əksəriyyəti bunun üçün    ║
> ║  qoyulan tələbləri ödəyə bilmir. Müraciət edənlərin       ║
> ║  yalnız 30%-i sertifikat alır. Səbəb şəraitin və          ║
> ║  xidmətin keyfiyyətindəki problemlərdir."*                 ║
> ║                                                            ║
> ║ 🔗 2025-ci ildə 150 otel müraciət etdi,                   ║
> ║    yalnız 44-ü ulduz aldı.                                 ║
> ╚══════════════════════════════════════════════════════════╝

---

## Milli Ulduz Təsnifatı nədir?

**Milli Ulduz Təsnifatı (MUT)** — Azərbaycanda otellərin xidmət və infrastruktur səviyyəsinin rəsmi qiymətləndirmə sistemidir. 2021-ci ildə **Azərbaycan Hotel Assosiasiyası (AHA)** və **Azərbaycan Turizm Bürosu (ATB)** tərəfindən birgə qurulub.

Sistem **Hotelstars Union**-un (Avropa Mehmanxanalar Assosiasiyası) standartlarına əsaslanır. 17 Avropa ölkəsi eyni meyarları istifadə edir — yəni AZ-də 4 ulduz alan otel Almaniyada da 4 ulduz statusu deməkdir.

**Niyə vacibdir?**
- Booking.com, Expedia, TripAdvisor avtomatik rezervasiya sistemlərində görünmək üçün rəsmi sertifikat lazımdır
- Beynəlxalq turist 4-5 ulduz axtarır — sertifikatsız oteli süzgəcdə görmür
- "Turizm haqqında" qanuna görə hər yeni mehmanxana 6 ay ərzində müraciət etməlidir
- Sertifikatsız fəaliyyət göstərmək qanuni risk yaradır

---

## 248 Meyar — Nələri Yoxlayırlar?

AHA-nın 248 meyarı 12 əsas kateqoriyaya ayrılır:

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
- **1 ulduz:** otaq ən az 8 m², Wi-Fi məcburi deyil
- **3 ulduz:** otaq ən az 14 m², resepsiya 16 saat işləməli, Wi-Fi sürətli olmalı
- **5 ulduz:** otaq ən az 26 m², 24 saat resepsiya, multilingual personal, premium əlavə xidmətlər

---

## Müraciət Prosesi — 5 Mərhələ

### Mərhələ 1: Sənədlərin Hazırlanması (2-4 həftə)
- Vergi ödəyicisi şəhadətnaməsi
- Gigiyena və epidemiologiya arayışı
- Yanğın təhlükəsizliyi sertifikatı
- Hotelin texniki vəziyyəti və təhlükəsizliyi formu
- Personal sağlamlıq kitabçaları

### Mərhələ 2: Onlayn Müraciət
**aha.tourismboard.az** veb-saytında ərizə doldurulur. Rüsum 800 AZN-dən başlayır (otaq sayı + iddia edilən ulduz dərəcəsindən asılı).

### Mərhələ 3: Auditor Ziyarəti (1-2 həftə sonra)
AHA-nın akkreditasiyalı auditoru otelə gəlir, **248 meyarın hamısını yerində yoxlayır**. Bu sürpriz ziyarət deyil — vaxt razılaşdırılır.

### Mərhələ 4: Keyfiyyət və Qərəzsizlik Komissiyası
Auditor hesabatı komissiyaya təqdim edir. Komissiya iddia edilən ulduz dərəcəsinə uyğunluğu qiymətləndirir. Tələblər yerinə yetirilməyibsə — yazılı bildiriş.

### Mərhələ 5: Sertifikat (3 il müddətli)
Uğurlu nəticədə sertifikat verilir, 3 il etibarlıdır. Bu müddət ərzində mütəmadi nəzarət, **TrustYou** beynəlxalq qonaq rəy platforması vasitəsilə xidmət səviyyəsi izlənir.

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **GÜNAY SAĞLAM**                                       ║
> ║ Azərbaycan Hotel Assosiasiyası icraçı direktoru            ║
> ║                                                            ║
> ║ *"Hotellərin ulduz təsnifatı ilə bağlı 248 kriteriyamız   ║
> ║  var. Bəzi otellərdə qonaq qəbulunu hələ də kağızda       ║
> ║  qeyd edirlər. Belə vəziyyətdə 3 ulduz almaq mümkün       ║
> ║  deyil."*                                                  ║
> ║                                                            ║
> ║ 🔗 Sertifikat 3 il müddətinə verilir.                      ║
> ║    Bir mövsümdə tələbləri yerinə yetirməyən otelin         ║
> ║    ulduzu əlindən alına bilər.                             ║
> ╚══════════════════════════════════════════════════════════╝

---

## 5 ƏN BƏHALI SƏHV — Müraciətdən Əvvəl Bilməlisiniz

### Səhv 1: İddia Edilən Ulduzdan Yuxarı Vurmaq

Sahibkar deyir: "Otelimə 4 ulduz layiqdir." Auditor gəlir, otaq sahəsi 13 m² — 4 ulduz üçün minimum 16 m² lazımdır. Müraciət rədd edilir, **rüsum geri qaytarılmır**.

**Həll:** İddiadan əvvəl **özünüqiymətləndirmə** ilə real tier müəyyən et. [Otel Hazırlıq Testimiz](/toolkit/otel-hazirlig-testi) bu addımı sistemli edir — 12 meyar üzrə real skor göstərir.

### Səhv 2: TrustYou Reytinqini Saymamaq

AHA yalnız fiziki audit etmir — son 12 ayın **TrustYou** reytinqini də yoxlayır. Booking.com-da 6.5 reytinqi olan otel 3 ulduz iddia edə bilməz. Auditor "şərait varsa belə, qonaq təcrübəsi yoxdur" deyir.

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

> 📝 **DOĞAN NOTU:** "DK Agency-də son 6 ayda 14 otel sahibi ilə hazırlıq işi apardıq — 11-i ulduz aldı, 3-ü dayandırıldı (sənəd çatışmazlığı, sonra düzəldildi). Fərq prosesin sistemləşməsindədir. Sahibkar 'mən özüm bacararam' deyəndə adətən rüsum itər, vaxt itər, marka zədələnir. Bu, çoxlu bilik və sənayə təcrübəsi tələb edən prosesdir — amma sistemləşdirilirsə, 3-4 ayda nəticə var."

---

## Otelinizin Hansı Ulduza Hazır Olduğunu Necə Bilmək?

DK Agency-nin **Otel Hazırlıq Testi** AHA-nın 248 meyarını 12 əsas suala yığır. 4 dəqiqəlik test sonunda:

- ✅ Otelinizin real ulduz tier-i (pansiyon, 1-2, 3, 4, 5 ulduz)
- ✅ Ən zəif sahənizin təfsilatı
- ✅ AHA müraciətinə qədər 3 prioritet addım
- ✅ Şəxsi AI hesabat (PDF olaraq yüklə)
- ✅ Pulsuz fərdi məsləhət imkanı

[Otel Hazırlıq Testinə başla →](/toolkit/otel-hazirlig-testi)

---

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **HOTELSTARS UNION**                                   ║
> ║ Avropa Mehmanxanalar Assosiasiyası                         ║
> ║                                                            ║
> ║ *"Standart bir sənəd deyil — yaşayan bir tələbdir.        ║
> ║  Sertifikat alan otel hər gün eyni səviyyədə qalmağa      ║
> ║  borcludur. Müştəri tək bir gecədə yox, hər gecədə        ║
> ║  ulduz xidməti gözləyir."*                                 ║
> ║                                                            ║
> ║ 🔗 17 Avropa ölkəsi eyni Hotelstars Union sistemini       ║
> ║    istifadə edir. AZ-də alınan 4 ulduz Almaniyada,        ║
> ║    Avstriyada, Hollandiyada da eyni statusdur.            ║
> ╚══════════════════════════════════════════════════════════╝

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

70% uğursuzluq nisbəti təhdid deyil — **sistemləşmiş yanaşmaya sahib olan otel üçün rəqib boşluğudur**. AHA sertifikatlı oteliniz olduqda, Bakı və regionlarda **ilk 30%-ə daxil olursunuz**.

İlk addım: 4 dəqiqəlik testimizdə real tier-inizi müəyyən edin. Sonrası — birlikdə qurarıq.

[Otel Hazırlıq Testinə başla →](/toolkit/otel-hazirlig-testi) | [Pulsuz məsləhət istə →](/franchise/meslehet)

---

*Mənbə: AHA (Azərbaycan Hotel Assosiasiyası), Dövlət Turizm Agentliyi rəsmi açıqlamaları, Hotelstars Union 2024 standartları.*`,
    isPremium: false,
    relatedArticles: [],
    coverImage: '/images/blog-17.png',
    coverImageAlt: 'AHA Ulduz Sertifikatı otel hazırlığı',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 17: İLK 5 DƏQİQƏ — QONAQ QARŞILAMA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-017',
    slug: 'ilk-5-deqiqe-qonaq-qarsilama',
    title: 'İlk 5 Dəqiqə Hər Şeyi Həll Edir: Qonağı Kiçik Hədiyə ilə Necə Aşiq Edirsən?',
    subtitle: 'Qonaq qapıdan girəndə beynində bir hökm formalaşır — və bu hökm ilk 5 dəqiqədə verilir',
    category: 'Satış',
    categoryEmoji: '📈',
    stage: 'Başla',
    readingTime: 7,
    wordCount: 950,
    author: 'Doğan Tomris',
    publishDate: '2026-06-04T11:00:00Z',
    updatedAt: '2026-06-04T11:00:00Z',
    tags: ['qonaq təcrübəsi', 'qarşılama', 'kirayə', 'otel', 'rəy', 'marketinq'],
    metaDescription: 'Qonağı ilk 5 dəqiqədə necə aşiq edirsən? Ucuz amma güclü qarşılama jestləri, rəy strategiyası və şəxsiləşdirmə.',
    focusKeyword: 'qonaq qarşılama jest',
    summary: 'İlk 5 dəqiqədə isti, şəxsi və yerli bir qarşılama qur; kiçik jestlərlə qonağı aşiq et; məmnun anda rəy iste. Ən ucuz, amma ən güclü marketinq.',
    content: `# İlk 5 Dəqiqə Hər Şeyi Həll Edir: Qonağı Kiçik Hədiyə ilə Necə Aşiq Edirsən?

Qonaq qapıdan girəndə beynində bir hökm formalaşır — və bu hökm **ilk 5 dəqiqədə** verilir. Ev səliqəlidirmi? Səni gözləyirdilərmi? Burada özünü rahat hiss edəcəksənmi? Bu ilk təəssürat sonradan yazılacaq rəyi, veriləcəyi ulduzu və təkrar gəlib-gəlməyəcəyini müəyyən edir.

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

> **Növbəti addım:** Qonaqlarını daimi müştəriyə çevirmək istəyirsən? DK Agency ilə pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.`,
    isPremium: false,
    relatedArticles: ['bir-elan-on-platforma-ev-kirayesi', 'rayonda-ev-kirayesi-sistem'],
    coverImage: '/images/blog-18.png',
    coverImageAlt: 'İlk 5 dəqiqə qonaq qarşılama',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 18: BİR ELAN, ON PLATFORMA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-018',
    slug: 'bir-elan-on-platforma-ev-kirayesi',
    title: 'Bir Elan, On Platforma: Evini Hər Yerdə Eyni Anda Necə Kirayə Verirsən?',
    subtitle: 'Tək yerdə elan = boş günlər. Çox platformada eyni anda göstər, təqvimi sinxronla.',
    category: 'Marketinq',
    categoryEmoji: '📣',
    stage: 'Başla',
    readingTime: 8,
    wordCount: 1050,
    author: 'Doğan Tomris',
    publishDate: '2026-06-04T12:00:00Z',
    updatedAt: '2026-06-04T12:00:00Z',
    tags: ['kirayə', 'Airbnb', 'Booking', 'kanal meneceri', 'ev sahibi', 'platforma', 'marketinq'],
    metaDescription: 'Evini bir neçə platformada eyni anda necə kirayə verirsən? Kanal meneceri, təqvim sinxronu və birbaşa qonaq strategiyası.',
    focusKeyword: 'ev kirayə platforma',
    summary: 'Kiçik ev sahibi üçün qayda: bir yerdə görünmək azdır. Elanı bir neçə platformaya yay, təqvimi sinxronla, birbaşa qonağını qur.',
    content: `# Bir Elan, On Platforma: Evini Hər Yerdə Eyni Anda Necə Kirayə Verirsən?

Tutaq ki, Bakıda və ya Xınalıqda kirayə vermək istədiyin bir evin var. Onu yalnız bir saytda elan edirsən — bəlkə Airbnb-də, bəlkə bir yerli qrupda. Nəticə: ayın yarısı ev boş qalır, çünki sənin elanını görən az adam var. Halbuki eyni evi eyni anda bir neçə platformada göstərə bilsən, daha çox göz, daha çox rezervasiya deməkdir.

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

> **Növbəti addım:** Evini daha çox doldurmaq istəyirsən? DK Agency ilə pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.`,
    isPremium: false,
    relatedArticles: ['ilk-5-deqiqe-qonaq-qarsilama', 'rayonda-ev-kirayesi-sistem'],
    coverImage: '/images/blog-19.png',
    coverImageAlt: 'Bir elan on platforma ev kirayəsi',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 19: RAYONDA EV KİRAYƏSİ — SİSTEM
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-019',
    slug: 'rayonda-ev-kirayesi-sistem',
    title: 'Xınalıqda Ev Var, Sistem Yoxdur: Rayonda Ev Kirayəsini Necə Qurarsan?',
    subtitle: 'Problem evdə deyil — sistemdə. Addım-addım rayonda kirayə quruluşu.',
    category: 'Əməliyyat',
    categoryEmoji: '🔧',
    stage: 'Başla',
    readingTime: 8,
    wordCount: 1100,
    author: 'Doğan Tomris',
    publishDate: '2026-06-04T13:00:00Z',
    updatedAt: '2026-06-04T13:00:00Z',
    tags: ['kirayə', 'rayon', 'Xınalıq', 'Şəki', 'ev sahibi', 'əməliyyat', 'sistem', 'Başla seriyası'],
    metaDescription: 'Rayonda ev kirayəsini necə qurarsan? Minimum standart, qiymət, təhlükəsizlik, görünürlük — addım-addım bələdçi.',
    focusKeyword: 'rayonda ev kirayəsi',
    summary: 'Rayonda ev kirayəsi şans işi deyil — sistemdir. Evi hazırla, qiymət qoy, platformada elan et, təhlükəsiz kirayə ver. "Tanış vasitəsilə ayda 4 gün" dolan ev "sistemlə ayda 15-20 gün" dolan evə çevrilir.',
    content: `# Xınalıqda Ev Var, Sistem Yoxdur: Rayonda Ev Kirayəsini Necə Qurarsan?

Azərbaycanın rayonlarında — Xınalıqda, Şəkidə, Lənkəranda, Qəbələdə — gözəl evlər var. Mənzərə möhtəşəm, qonaqpərvərlik səmimi, təbiət bənzərsiz. Amma bir problem var: çox ev sahibi evini **yalnız yaxın çevrəsi vasitəsilə** kirayə verir. Nəticədə ev ayda cəmi bir neçə gün dolur, qalan vaxt boş qalır.

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

> 📝 **DOĞAN NOTU:** "Xınalıqda, Şəkidə, Lənkəranda onlarla belə ev gördüm — sahibi inanılmaz qonaqpərvər, amma ev yalnız 'biri yönləndirir' olduqda dolur. Bir sahibə dedim: 'Bu evi düzgün elan etsən, ayda 15 gün dolar.' İnanmadı. Amma əsl fərq texnologiyada deyil, **sistemdə**: bir dəfə qurursan, sonra ev özü işləyir. Rayon evləri Azərbaycan turizminin gizli xəzinəsidir — sadəcə düzgün qurulmağı gözləyir."

---

## Yekun

Rayonda ev kirayəsi şans işi deyil — sistemdir. Evi minimum standarta hazırla, müqayisəli qiymət qoy, platforma üzərindən təhlükəsiz kirayə ver və görünürlüyü qur. Bu dördünü edəndə ev ayda 4 gün deyil, 15-20 gün dolur.

**Bu yazı "Başla seriyası — Kirayə" silsiləsinin 3-cü hissəsidir:**
1. [İlk 5 Dəqiqə: Qonağı Kiçik Hədiyə ilə Necə Aşiq Edirsən?](/blog/ilk-5-deqiqe-qonaq-qarsilama)
2. [Bir Elan, On Platforma: Evini Hər Yerdə Eyni Anda Necə Kirayə Verirsən?](/blog/bir-elan-on-platforma-ev-kirayesi)
3. **Bu yazı** — Rayonda Ev Kirayəsini Necə Qurarsan?

---

## DK Agency necə kömək edir?

DK Agency rayon ev sahiblərinə kirayəni sistemə çevirməkdə kömək edir — hazırlıqdan qiymətə, təhlükəsizlikdən rəqəmsal görünürlüyə qədər. [DK Agency alət dəsti](/toolkit) ilə qonaq təcrübəsini ölçülə bilən hala gətir. *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Rayonda evin var, amma necə kirayə verəcəyini bilmirsən? DK Agency ilə pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.`,
    isPremium: false,
    relatedArticles: ['ilk-5-deqiqe-qonaq-qarsilama', 'bir-elan-on-platforma-ev-kirayesi'],
    coverImage: '/images/blog-20.png',
    coverImageAlt: 'Rayonda ev kirayəsi sistemi',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 20: PEŞƏ MƏKTƏBİ ÖLKƏ MƏSƏLƏSİDİR — Koç Modeli
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-020',
    slug: 'pese-mektebi-olke-meselesi',
    title: 'Peşə Məktəbi Ölkə Məsələsidir: Koç Modeli Azərbaycana Necə Tətbiq Olunar?',
    subtitle: 'Bu problemi bir restoran tək başına həll edə bilməz. Bu, bir ölkə məsələsidir.',
    category: 'Kadr',
    categoryEmoji: '👥',
    stage: 'Böyüt',
    readingTime: 10,
    wordCount: 1350,
    author: 'Doğan Tomris',
    publishDate: '2026-06-04T14:00:00Z',
    updatedAt: '2026-06-04T14:00:00Z',
    tags: ['kadr', 'peşə təhsili', 'Koç Holdinq', 'TQTA', 'qastronomiya', 'Əxilik', 'Qastro Turizm seriyası'],
    metaDescription: 'Restoran sahibi "yaxşı kadr tapmıram" deyir — çünki sistemli peşə təhsili yoxdur. Koç modelinin Azərbaycana tətbiqi və 290.000 kadr hədəfi.',
    focusKeyword: 'peşə təhsili HoReCa Azərbaycan',
    summary: 'Xidmətin pis olmasının kökü kadrdadır, kadrın kökü isə təhsildədir. Türkiyə Koç modeli ilə sübut etdi. Azərbaycan dövlət planı 290.000 kadr hədəfləyir — sahibkar gözləmədən başlaya bilər.',
    content: `# Peşə Məktəbi Ölkə Məsələsidir: Koç Modeli Azərbaycana Necə Tətbiq Olunar?

Restoran sahibindən ən çox eşitdiyim şikayət budur: "Yaxşı aşpaz, yaxşı garson tapa bilmirəm." Bu, təsadüf deyil. Çünki sektorda **sistemli peşə təhsili yoxdur** — hər işlətmə kadrı sıfırdan öyrədir, kadr gedir, keyfiyyət dəyişkən qalır.

Bu problemi bir restoran tək başına həll edə bilməz. Bu, bir **ölkə məsələsidir.** Və bu sözün arxasında güclü bir dünya nümunəsi var.

---

## 1. Problem: təlimli, sertifikatlı kadr yoxdur

Xidmət niyə pisdir? Çünki:

- Aşpaz, garson, otel personalı çox vaxt **heç bir formal təlim** almadan işə başlayır.
- Hər işlətmə öz kadrını sıfırdan öyrətməyə məcburdur — bu, vaxt və pul itkisidir.
- Öyrətdiyin kadr gedir, yenisi gəlir, keyfiyyət hər dəfə yenidən düşür.

Nəticədə qonaq dəyişkən, çox vaxt zəif xidmət görür. Problem işçidə deyil — **onu yetişdirən sistemin olmamasındadır.**

---

## 2. Türkiyə nümunəsi: «Meslek Lisesi Memleket Meselesi»

Türkiyədə bir şirkət bu problemi milli məsələyə çevirdi. Koç Holdinq 2006-cı ildə Təhsil Nazirliyi və Vehbi Koç Vəqfi ilə birgə **"Meslek Lisesi Memleket Meselesi"** (Peşə Məktəbi Ölkə Məsələsidir) proqramını başlatdı.

Rəqəmlər nəticəni göstərir:
- Proqram **264 peşə məktəbini** əhatə etdi.
- **8000-dən çox şagirdə təqaüd** və təcrübə imkanı verildi.
- Beynəlxalq Əmək Təşkilatı (ILO) tərəfindən **Avropada nümunə təcrübə** kimi seçildi.

Əsas fikir: bir şirkət dövlətlə birləşib peşə təhsilini "kiminsə problemi" olmaqdan çıxarıb **bütün ölkənin məsələsi** elan etdi — və sənayeyə təlimli kadr axını yaratdı.

### Faydalı məlumat qutusu
Koç modelinin sirri üç tərəfin birləşməsidir: **dövlət** (məktəb və proqram), **sənaye** (təcrübə yeri və iş), **vəqf/şirkət** (təqaüd və davamlılıq). Üçü ayrı işləyəndə nəticə yoxdur; birləşəndə isə milli kadr sistemi qurulur.

---

## 3. Niyə "ölkə məsələsi"?

Çünki bir restoran, bir otel, hətta bir şəbəkə tək başına kadr problemini həll edə bilməz. Lazım olan:

- Peşə **məktəbi** (təlim verir),
- **Sənaye** (təcrübə və iş yeri verir),
- **Davamlı dəstək** (təqaüd, sertifikat, karyera yolu).

Bu üçü birləşməyəndə, kadr boşluğu heç vaxt dolmur. Birləşəndə isə həm sahibkar təlimli işçi tapır, həm gənc peşə qazanır, həm də ölkə xidmət keyfiyyətini yüksəldir.

---

## 4. Azərbaycan üçün: fürsət indidir

Azərbaycanda bu boşluq açıq görünür — dövlətin Qastronomiya Turizmi Strateji Planı bunu etiraf edir və **290.000 işçinin peşə səviyyəsinin artırılmasını** hədəfləyir. Plan həmçinin Qastronomiya Akademiyasının qurulmasını və "usta-şagird" ənənəsinin canlandırılmasını nəzərdə tutur.

Yəni dövlət istiqaməti hazırdır. İndi lazım olan — bu istiqaməti **real təlim sistemlərinə** çevirmək. Bu, məhz Əxilik fəlsəfəsinin müasir tərcüməsidir: usta şagirdə peşə öyrədir, şagird öz ocağını qurub icmaya dəyər qaytarır.

---

## 5. Sahibkara nə düşür?

Dövlət sistemi qurulanadək gözləmək lazım deyil. Sahibkar bu gün:

- Kadrını **sistemli təlimə** qoşa bilər (sertifikatlı təlim mərkəzləri, akademiyalar).
- Daxili "usta-şagird" sistemi qura bilər — təcrübəli işçi yenini yetişdirir.
- Sertifikatlı kadrı üstün tutub **stabil keyfiyyət** qura bilər.

Sertifikatlı, təlimli kadr = dəyişməz keyfiyyət = məmnun qonaq = daha çox qazanc.

Konkret necə sertifikatlı komanda quracağını növbəti yazımızda izah edirik — [**"Sertifikatlı Komanda Necə Qurulur? CTH Standartı və Online Təhsil" →**](/blog/sertifikatli-komanda-cth-online-tehsil)

---

> 📝 **DOĞAN NOTU:** "40 ildir bu sektordayam və hər zaman eyni həqiqəti gördüm: marka tabela ilə yox, **insanla** qurulur. Ən gözəl menyu, ən gözəl interyer — zəif xidmətlə çökür. Türkiyə peşə təhsilini ölkə məsələsi elan edəndə sektoru dəyişdi. Bizim də vaxtımız gəlib. Kadrı 'tapmağa' çalışma — **yetişdir.** Sistemli yetişdirilmiş işçi, ən bahalı avadanlıqdan dəyərlidir."

---

## Yekun

Xidmətin pis olmasının kökü kadrdadır, kadrın kökü isə təhsildədir. Bu, bir işlətmənin yox, bütün ölkənin məsələsidir. Türkiyə bunu sübut etdi; Azərbaycanın dövlət planı da bu istiqaməti göstərir. Sahibkar isə gözləmədən başlaya bilər — kadrını sistemli yetişdirərək.

---

## DK Agency necə kömək edir?

DK Agency və TQTA (Turan Qastro Turizm Akademiyası) sektora təlimli, sertifikatlı kadr yetişdirmək üçün çalışır — aşpazdan otel personalına, garsondan menecerə qədər. Dövlətin qastronomiya kadr hədəfinin bir parçasıyıq. Çünki bizim üçün kadr xərc deyil, markanın əsl təməlidir: *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Komandanı sistemli yetişdirmək istəyirsən? [**TQTA Akademiya təlim proqramlarına bax →**](/toolkit) və ya əlaqə saxla.

*Mənbə: Koç Holdinq «Meslek Lisesi Memleket Meselesi» proqramı açıqlamaları; Beynəlxalq Əmək Təşkilatı (ILO); Azərbaycan Respublikası Qastronomiya Turizmi Strateji İnkişaf Planı (2025-2030).*`,
    isPremium: true,
    relatedArticles: ['sertifikatli-komanda-cth-online-tehsil', 'azerbaycan-qastronomiya-2030-dovlet-plani'],
    coverImage: '/images/blog-21.png',
    coverImageAlt: 'Peşə məktəbi ölkə məsələsidir',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 21: SERTİFİKATLI KOMANDA — CTH + ONLİNE TƏHSİL
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-021',
    slug: 'sertifikatli-komanda-cth-online-tehsil',
    title: 'Sertifikatlı Komanda Necə Qurulur? CTH Standartı və Online Təhsil',
    subtitle: 'Sertifikat bir kağız parçası deyil — standartın zəmanətidir',
    category: 'Kadr',
    categoryEmoji: '👥',
    stage: 'Başla',
    readingTime: 8,
    wordCount: 1100,
    author: 'Doğan Tomris',
    publishDate: '2026-06-04T15:00:00Z',
    updatedAt: '2026-06-04T15:00:00Z',
    tags: ['CTH', 'sertifikat', 'TQTA', 'kadr', 'online təhsil', 'otel', 'Qastro Turizm seriyası'],
    metaDescription: 'CTH beynəlxalq sertifikatı ilə sertifikatlı komanda necə qurulur? TQTA Akademiya, online + üz-üzə hibrid təhsil, Level 2-4 proqramlar.',
    focusKeyword: 'CTH sertifikat komanda',
    summary: 'CTH (Confederation of Tourism & Hospitality) beynəlxalq standartı + TQTA hibrid təhsili ilə işçini işindən ayırmadan sertifikatlı kadra çevir. Stabil keyfiyyət, məmnun qonaq, güclü marka.',
    content: `# Sertifikatlı Komanda Necə Qurulur? CTH Standartı və Online Təhsil

Əvvəlki yazımızda dedik: xidmətin pis olmasının kökü təlimsiz kadrdadır *(bax: [Peşə Məktəbi Ölkə Məsələsidir](/blog/pese-mektebi-olke-meselesi))*. Bəs həll? Gözləmədən, bu gün **sertifikatlı, beynəlxalq standartda kadr** yetişdirmək. Bu yazı bunun necə mümkün olduğunu göstərir.

---

## 1. Niyə sertifikat vacibdir?

Sertifikat bir kağız parçası deyil — **standartın zəmanətidir.** Sertifikatlı işçi:

- Eyni keyfiyyəti hər dəfə təkrarlayır (qonaq sürpriz görmür).
- Beynəlxalq qaydaları (gigiyena, servis, təhlükəsizlik) bilir.
- Otelin ulduz təsnifatı üçün tələb olunan kadr şərtini ödəyir *(AHA 3-5 ulduz təlimli personal istəyir)*.
- İşlətmənin "təsadüfən yaxşı" yox, **sistemli yaxşı** olmasını təmin edir.

Yəni sertifikat həm işçinin karyerası, həm də işlətmənin keyfiyyət zəmanətidir.

---

## 2. CTH nədir?

**CTH (Confederation of Tourism & Hospitality)** — Böyük Britaniya mərkəzli, turizm və qonaqpərvərlik sahəsində beynəlxalq tanınan təhsil və sertifikatlaşdırma qurumudur. Təlimlər səviyyələrə bölünür (Level 2, 3, 4) — başlanğıcdan menecer səviyyəsinə qədər.

**Azərbaycanda CTH akkreditasiyalı mərkəz mövcuddur:** TQTA (Turan Qastro Turizm Akademiyası), Sumqayıt — **CTH Approved Teaching Centre, Centre No. 2501.** Ünvan: Səməd Vurğun küç. 84, Sumqayıt. TİKA (Türk Əməkdaşlıq və Koordinasiya Agentliyi) dəstəyi ilə qurulub.

**TQTA-da CTH proqramları:**
- **Level 2 Award in Cookery Skills** — aşpaz başlanğıc
- **Level 2 Award in Barista Skills** — barista peşə
- **Level 2 Certificate in Professional Restaurant Front of House Service** — garson/ofisiant peşəkarlıq
- **Level 1 Certificate in English for Tourism and Hospitality** — turizm ingilis dili

### Faydalı məlumat qutusu
CTH səviyyələri sadə dillə: **Level 1-2** — başlanğıc/əməliyyat (yeni işçi, əsas bacarıqlar); **Level 3** — orta/məsul (təcrübəli işçi, komanda lideri); **Level 4** — idarəetmə (menecer, şöbə rəhbəri). Hər səviyyə nəzəri biliklə praktiki bacarığı birləşdirir (təxminən 40% nəzəri, 60% praktiki).

---

## 3. Online + üz-üzə: işləyən insan üçün uyğun

Ən böyük maneə adətən budur: "İşçim işləyir, təlimə vaxtı yoxdur." Həll — **hibrid təhsil:**

- **Online modullar** — nəzəri hissəni işçi öz vaxtında, telefondan və ya kompüterdən keçir.
- **Üz-üzə praktika** — bacarıq tələb edən hissə (mətbəx, servis) TQTA-nın müasir təlim mətbəxlərində öyrədilir.
- **Modullu struktur** — hər modul ayrıca, addım-addım; işçi işini buraxmadan irəliləyir.

Beləcə təlim işin yükünə çevrilmir — işin bir hissəsi olur.

---

## 4. Kimə uyğundur?

- **Aşpaz** — mətbəx standartı, resept, gigiyena, food cost (Level 2 Cookery Skills).
- **Barista** — qəhvə hazırlama, servis, standart (Level 2 Barista Skills).
- **Ofisiant** — servis, satış, qonaq təcrübəsi (Level 2 Front of House Service).
- **Otel personalı** — resepsiya, qonaqpərvərlik, beynəlxalq standart.
- **Menecer** — komanda idarəetməsi, əməliyyat, keyfiyyət nəzarəti (Level 3-4).
- **İngilis dili** — turizm sahəsində xarici qonaqla ünsiyyət (Level 1 English).

Yəni komandanın hər həlqəsi üçün uyğun səviyyə var.

---

## 5. Sahibkara faydası

- **Hazır təlimli kadr** — sıfırdan öyrətmə yükü azalır.
- **AHA ulduz uyğunluğu** — sertifikatlı personal [otel təsnifatı tələbini](/blog/aha-ulduz-sertifikati-otel-hazirliq) ödəyir.
- **Stabil keyfiyyət** — kadr dəyişsə belə, standart eyni qalır.
- **İşçi sadiqliyi** — karyera və sertifikat verən işəgötürəni işçi tərk etmir.
- **Beynəlxalq tanınma** — CTH sertifikatı yalnız Azərbaycanda yox, 60+ ölkədə dəyər.

---

> 📝 **DOĞAN NOTU:** "TQTA-nı (Turan Qastro Turizm Akademiyası) məhz bu boşluğu doldurmaq üçün qurduq — Sumqayıtda CTH Approved Centre (No. 2501), Xankəndidə yeni şöbə. 40 illik təcrübəmdə öyrəndiyim budur: sahibkar 'kadr tapmıram' deyə şikayət edir, amma kadrı yetişdirməyə vaxt ayırmır. Sertifikatlı təlim bu döngünü qırır — bir dəfə qurursan, sonra komandan özü standartı daşıyır. Kadr xərc deyil, ən böyük investisiyadır."

---

## Yekun

Sertifikatlı komanda təsadüf deyil — qərardır. CTH kimi beynəlxalq standart + online və üz-üzə hibrid təhsil ilə, işçini işindən ayırmadan, beynəlxalq səviyyədə yetişdirə bilərsən. Nəticə: stabil keyfiyyət, məmnun qonaq və güclü marka.

**Bu yazı "Qastro Turizm seriyası"nın 2-ci hissəsidir:**
1. [Peşə Məktəbi Ölkə Məsələsidir: Koç Modeli](/blog/pese-mektebi-olke-meselesi) (problem + dünya nümunəsi)
2. **Bu yazı** — Sertifikatlı Komanda Necə Qurulur (həll + CTH)

---

## DK Agency necə kömək edir?

TQTA (Turan Qastro Turizm Akademiyası) — DK Agency ekosisteminin təhsil qoludur. **CTH Approved Teaching Centre (No. 2501)**, Sumqayıt. CTH standartında, online və üz-üzə təlimlərlə aşpaz, barista, ofisiant, otel personalı və menecerləri sertifikatlı kadra çeviririk. TİKA dəstəyi ilə qurulub, Dövlət Məşğulluq Agentliyi ilə əməkdaşlıq. *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** Komandanı sertifikatlı kadra çevirmək və ya özün sertifikat almaq istəyirsən? [**TQTA təlim proqramlarına bax →**](/toolkit) və ya əlaqə saxla.

*CTH (Confederation of Tourism & Hospitality) Böyük Britaniya mərkəzli beynəlxalq qonaqpərvərlik təhsil qurumudur. TQTA — CTH Approved Teaching Centre, Sumqayıt, Azərbaycan.*`,
    isPremium: false,
    relatedArticles: ['pese-mektebi-olke-meselesi', 'aha-ulduz-sertifikati-otel-hazirliq', 'azerbaycan-qastronomiya-2030-dovlet-plani'],
    coverImage: '/images/blog-22.png',
    coverImageAlt: 'CTH sertifikatlı komanda TQTA',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 22: AZƏRBAYCAN QASTRONOMİYASI 2030 — DÖVLƏT PLANI
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-022',
    slug: 'azerbaycan-qastronomiya-2030-dovlet-plani',
    title: 'Azərbaycan Qastronomiyası 2030: Dövlət Planı Sahibkara Nə Vəd Edir?',
    subtitle: 'Qastronomiya Turizmi Strateji Planı (2025-2030) — sahibkar üçün fürsət xəritəsi',
    category: 'Marketinq',
    categoryEmoji: '📣',
    stage: 'Böyüt',
    readingTime: 10,
    wordCount: 1400,
    author: 'Doğan Tomris',
    publishDate: '2026-06-04T16:00:00Z',
    updatedAt: '2026-06-04T16:00:00Z',
    tags: ['qastronomiya', '2030', 'dövlət planı', 'Michelin', 'coğrafi işarə', 'sertifikat', 'turizm', 'Qastro Turizm seriyası'],
    metaDescription: 'Azərbaycan Qastronomiya Turizmi 2030 planı: Michelin 2028, 25 coğrafi işarə, 25.000 sertifikat, 290.000 təlimli kadr. Sahibkar üçün fürsət xəritəsi.',
    focusKeyword: 'Azərbaycan qastronomiya 2030 plan',
    summary: 'Dövlətin qastronomiya turizmi planı sahibkara 4 qapı açır: Michelin, coğrafi işarə, sertifikatlaşma, təlimli kadr. Erkən hazırlaşan qazanır.',
    content: `# Azərbaycan Qastronomiyası 2030: Dövlət Planı Sahibkara Nə Vəd Edir?

Dövlət ilk dəfə qastronomiya turizmi üçün ciddi bir yol xəritəsi açıqladı: Qastronomiya Turizmi Strateji İnkişaf Planı (2025-2030). Bu, sadəcə rəsmi sənəd deyil — HoReCa sahibkarı üçün **fürsət xəritəsidir.** Bəs bu plan sənə, restoran/otel/ev sahibinə nə vəd edir? Bu yazı planı sahibkar gözüylə açır.

---

## 1. Dövlətin hədəfləri = sənin arxandakı dəstək

Planın əsas hədəfləri belədir:

- **2028-ci ildə ilk Michelin ulduzu** — Azərbaycan dünya gastronomiya xəritəsinə girir.
- **2027-yə qədər 25-dən çox coğrafi işarə** — yerli məhsullar hüquqi qorunur.
- **25.000 işlətmənin sertifikatlaşdırılması** — keyfiyyət standartı oturur.
- **290.000 işçinin peşə səviyyəsinin artırılması** — təlimli kadr axını.

Bu rəqəmlər sənə nə deyir? Dövlət sertifikat, təlim, marka qoruması və beynəlxalq tanınma üçün **arxanda duracaq.** Erkən hərəkət edən sahibkar bu dalğanın önündə olur.

### Faydalı məlumat qutusu
Planın 4 açar rəqəmi: **2028** (ilk Michelin), **25+** (coğrafi işarə), **25.000** (sertifikatlı işlətmə), **290.000** (təlimli işçi). Bunları yadda saxla — hər biri bir fürsət qapısıdır.

---

## 2. Beş Duyu Rotası: təcrübə sat, təkcə yemək yox

Plan turist təcrübəsini beş duyu üzərində qurur — qoxu, dad, görmə, səs, toxunma. Məsələn, Lənkəran "Subtropik Simfoniya" rotası: çay plantasiyalarının ətri, təzə çayın dadı, yamyaşıl tarlaların görüntüsü, Xəzərin səsi, ipək kimi çay yarpağına toxunuş.

**Sahibkara mənası:** sən təkcə yemək satmırsan — bir təcrübə satırsan. İşlətmən bu rotaların bir hissəsi ola bilər. Təcrübə nə qədər zəngin olsa, qonaq o qədər çox ödəyir və danışır.

---

## 3. Küçə yeməkləri: kiçik satıcıya böyük qapı

Plan qutab, təndir çörəyi, dönər kimi ənənəvi küçə ləzzətlərini "Taste of Azerbaijan Street Food" adı altında beynəlxalq festivallarda tanıtmağı hədəfləyir. Bakıda və bölgələrdə (Şəki, Qəbələ, Lənkəran) gigiyena standartlı küçə yeməkləri zonaları qurulacaq.

**Sahibkara mənası:** kiçik bir küçə satıcısı belə — gigiyena sertifikatı + düzgün brend ilə — bu beynəlxalq dalğanın parçası ola bilər.

---

## 4. Yerli məhsul: coğrafi işarə + Slow Food

Plan yerli məhsulların coğrafi işarə ilə qorunmasını (Şəki halvası, Lənkəran çayı) və Slow Food fəlsəfəsi ilə agro-qastro turizmi inkişaf etdirməyi nəzərdə tutur.

**Sahibkara mənası:** yerli, orijinal, qorunan məhsul = yüksək dəyər + turizm cəlbi.

---

## 5. Sahibkar bu gün nə etməli?

Plan dövlətin işidir — amma fürsət sənin əlindədir. Hazırlanmaq üçün 5 addım:

1. **Sertifikatlaş** — işlətməni və kadrını standarta uyğunlaşdır. [CTH təlimi ilə sertifikatlı komanda qur →](/blog/sertifikatli-komanda-cth-online-tehsil)
2. **Kadrını yetişdir** — təlimli, sertifikatlı komanda qur. [Peşə Məktəbi Ölkə Məsələsidir →](/blog/pese-mektebi-olke-meselesi)
3. **Markanı qoru** — yerli məhsulunu coğrafi işarə ilə qeydiyyatdan keçir. [Marka qeydiyyatı bələdçisi →](/blog/marka-qeydiyyati-azerbaycan)
4. **Təcrübə qur** — beş duyu məntiqiylə qonağa yaddaqalan an yaşat. [İlk 5 dəqiqə strategiyası →](/blog/ilk-5-deqiqe-qonaq-qarsilama)
5. **Rəqəmsallaş** — onlayn görün, data ilə idarə et. [AI ilə FAVÖK qoruması →](/blog/ai-ile-favok-qorumasi)

Bu beşini edən sahibkar 2030-a hazır olur; etməyən geridə qalır.

---

> 📝 **DOĞAN NOTU:** "Bu plan təsadüfən yaranmadı — illərlə danışdığımız şeyin rəsmi sənədə çevrilməsidir. Ən qürurverici tərəfi: planın partnyorları arasında AFA — Azərbaycan Françayzinq Assosiasiyası — adı keçir; yəni qurucusu olduğumuz təşkilat dövlət strategiyasının bir parçasıdır. Bu o deməkdir ki, biz kənardan baxmırıq — masadayıq. Sən də bu masaya erkən otur — 2030 uzaq deyil."

---

## Yekun

Azərbaycan qastronomiyası "yerli ləzzət"dən "qlobal marka"ya doğru gedir — və dövlət bu yolu rəsmi planla dəstəkləyir. Michelin, coğrafi işarə, sertifikatlaşma, təlim — hamısı sahibkar üçün açılan qapılardır. Erkən hazırlaşan qazanır. Yol xəritəsi hazırdır; qalan — addım atmaqdır.

**Bu yazı "Qastro Turizm seriyası"nın capstone hissəsidir:**
1. [Peşə Məktəbi Ölkə Məsələsidir](/blog/pese-mektebi-olke-meselesi) — problem + dünya nümunəsi
2. [Sertifikatlı Komanda: CTH Standartı](/blog/sertifikatli-komanda-cth-online-tehsil) — həll + CTH
3. **Bu yazı** — dövlət planı + sahibkar fürsət xəritəsi

---

### Faydalı alətlər
- [Franchise Hazırlıq Testi →](/franchise/hazirliq-testi)
- [Otel Hazırlıq Testi →](/toolkit/otel-hazirlig-testi)

## DK Agency necə kömək edir?

DK Agency və AFA dövlətin qastronomiya strategiyasının bir parçasıdır — sertifikatlaşmadan marka qorumasına, kadr təlimindən franchise sisteminə qədər. Bu yolun hər addımında yanındayıq. Çünki bizim üçün qastronomiya təkcə yemək deyil, ölkənin dünyaya açılan qapısıdır: *Ustalığın Nişanı, Rəqəmsalın Şəddi.*

> **Növbəti addım:** 2030-a hazırlaşmaq istəyirsən? DK Agency ilə pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.

*Mənbə: Azərbaycan Respublikası Qastronomiya Turizmi Strateji İnkişaf Planı (2025-2030).*`,
    isPremium: true,
    relatedArticles: ['pese-mektebi-olke-meselesi', 'sertifikatli-komanda-cth-online-tehsil', 'ai-ile-favok-qorumasi'],
    coverImage: '/images/blog-23.png',
    coverImageAlt: 'Azərbaycan qastronomiyası 2030 dövlət planı',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 23: GARSON UPSELL — SALONDAKI GİZLİ GƏLİR
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-023',
    slug: 'garson-satis-upsell-salon-gelir',
    title: 'Garson Sifariş Almır, Satış Edir: Salondakı Gizli Gəlir',
    subtitle: 'Bir cümlə ilə çeki 10-15% artırmağın yolu',
    category: 'satis',
    categoryEmoji: '📈',
    stage: 'Başla',
    readingTime: 5,
    wordCount: 820,
    author: 'Doğan Tomris',
    publishDate: '2026-06-04T09:00:00Z',
    updatedAt: '2026-06-04T09:00:00Z',
    tags: ['upsell', 'garson', 'satış', 'salon', 'orta çek', 'servis'],
    metaDescription: 'Garson sifariş alan deyil, satışçıdır. Upsell texnikası ilə restoranın orta çekini 10-15% artırmağın 5 sadə yolu.',
    focusKeyword: 'garson upsell satış',
    summary: 'Çox restoran sahibi garsonu "sifariş alan" adam kimi görür. Halbuki yaxşı garson satışçıdır — bir cümlə ilə çeki 10-15% artıra bilər. Heç bir əlavə müştəri, heç bir əlavə reklam xərci olmadan.',
    content: `# Garson Sifariş Almır, Satış Edir: Salondakı Gizli Gəlir

*Kateqoriya: 📈 Satış | Oxu müddəti: 5 dəq*

---

Çox restoran sahibi garsonu "sifariş alan" adam kimi görür. Halbuki yaxşı garson **satışçıdır** — və bir cümlə ilə çeki 10-15% artıra bilər. Heç bir əlavə müştəri, heç bir əlavə reklam xərci olmadan. Bu, salonda gizlənmiş gəlirdir — sadəcə açılmağı gözləyir.

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
> ║ 1. "Yanında nə içək gətirim?"                            ║
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

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DOĞAN NOTU**                                        ║
> ║                                                           ║
> ║ *"40 ildir bu sektordayam — və ən böyük gəlir artımı     ║
> ║  çox vaxt yeni müştəridən yox, mövcud müştəriyə düzgün   ║
> ║  təklifdən gəlir. Bir garsona 'sifariş alma, qayğı       ║
> ║  göstər' deməyi öyrətdiyimdə restoranın orta çeki         ║
> ║  gözlə görünən şəkildə artdı."*                          ║
> ╚══════════════════════════════════════════════════════════╝

---

## Yekun

Garson təkcə sifariş daşıyan deyil — restoranın salondakı satış komandasıdır. Doğru anda, səmimi bir tövsiyə ilə çek böyüyür, müştəri təcrübəsi yaxşılaşır və restoran heç bir əlavə xərc olmadan daha çox qazanır. Sirr: kömək et, satma.

---

> 💡 **DK Agency:** Komandanın satış bacarığını artırmaq istəyirsən? DK Agency / TQTA təlim proqramları üçün əlaqə saxla.
>
> 📧 info@dkagency.com.tr | 🌐 dkagency.com.tr/danismanlik`,
    isPremium: false,
    relatedArticles: ['basabas-noqtesi-hesablama', 'menyu-muhendisliyi-satis'],
    coverImage: '/images/blog-24.png',
    coverImageAlt: 'Garson upsell satış salondakı gizli gəlir',
  },

  // ═══════════════════════════════════════════════════════════════
  // YAZI 24: COĞRAFİ İŞARƏ — YERLİ LƏZZƏTİ QIZILA ÇEVİRMƏK
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'blog-024',
    slug: 'cografi-isare-yerli-lezzet',
    title: 'Antep Baklavasından Şəki Halvasına: Coğrafi İşarə ilə Yerli Ləzzəti Qızıla Çevirmək',
    subtitle: 'Coğrafi işarə bir məhsulu "ucuz qida"dan "qorunan marka"ya çevirir',
    category: 'huquqi',
    categoryEmoji: '⚖️',
    stage: 'Böyüt',
    readingTime: 7,
    wordCount: 1100,
    author: 'Doğan Tomris',
    publishDate: '2026-06-04T10:00:00Z',
    updatedAt: '2026-06-04T10:00:00Z',
    tags: ['coğrafi işarə', 'hüquqi', 'marka qorunması', 'qastronomiya turizm', 'Şəki halvası', 'franchise'],
    metaDescription: 'Coğrafi işarə nədir, sahibkara nə qazandırır? Türkiyə nümunəsi, Azərbaycan strategiyası və yerli ləzzəti beynəlxalq markaya çevirmə yolu.',
    focusKeyword: 'coğrafi işarə Azərbaycan',
    summary: 'Niyə "Antep baklavası" adı bu qədər dəyərlidir? Çünki qorunur. Azərbaycanın da belə xəzinələri var — Şəki halvası, Quba alması, Lənkəran çayı. Bu yazı coğrafi işarənin sahibkara nə qazandırdığını izah edir.',
    content: `# Antep Baklavasından Şəki Halvasına: Coğrafi İşarə ilə Yerli Ləzzəti Qızıla Çevirmək

*Kateqoriya: ⚖️ Hüquqi | Oxu müddəti: 7 dəq*

---

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

Yaxşı xəbər: Azərbaycan bu istiqamətdə artıq hərəkətə keçib. Dövlətin Qastronomiya Turizmi Strateji Planı **2027-ci ilə qədər 25-dən çox məhsulun coğrafi işarə kimi qeydiyyatını** hədəfləyir. Qeydiyyatı **Əqli Mülkiyyət Agentliyi** aparır.

Hədəfdəki məhsullardan bəziləri: Şəki halvası, Quba alması, Lənkəran çayı, Abşeron zəfəranı.

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

> ╔══════════════════════════════════════════════════════════╗
> ║ 🎤 **DOĞAN NOTU**                                        ║
> ║                                                           ║
> ║ *"Bizim hər bölgəmizin bir ləzzəti var — amma çoxu       ║
> ║  qorunmadığı üçün başqaları onu istənilən yerdə,          ║
> ║  istənilən keyfiyyətdə satır. Coğrafi işarə həmin         ║
> ║  ləzzəti həm qoruyur, həm də bölgəyə pul və turist       ║
> ║  gətirir. Türkiyə bunu illərlə əvvəl başladı və          ║
> ║  qazandı. Bizim üçün gecikmiş deyil."*                    ║
> ╚══════════════════════════════════════════════════════════╝

---

## Yekun

Coğrafi işarə yerli ləzzəti qızıla çevirən mexanizmdir. Türkiyə bunu sübut etdi; Azərbaycan isə dövlət dəstəyi ilə həmin yola çıxıb. Bir bölgədə ənənəvi məhsul istehsal edirsənsə, adını qorumaq — onu beynəlxalq markaya çevirməyin ilk addımıdır.

---

> 💡 **DK Agency:** Yerli məhsulunu və ya markanı qorumağı düşünürsən? DK Agency ilə pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.
>
> 📧 info@dkagency.com.tr | 🌐 dkagency.com.tr/danismanlik

*Mənbə: T.C. coğrafi işarə qeydiyyatı statistikası; Azərbaycan Respublikası Qastronomiya Turizmi Strateji İnkişaf Planı (2025-2030); Əqli Mülkiyyət Agentliyi. Bu yazı ümumi məlumatdır, hüquqi məsləhət deyil.*`,
    isPremium: true,
    relatedArticles: ['marka-qeydiyyati-azerbaycan', 'insaatdan-acilisa-checklist'],
    coverImage: '/images/blog-25.png',
    coverImageAlt: 'Coğrafi işarə yerli ləzzət qorunması',
  },
];

// Helper functions
export function getAllBlogArticles(): BlogArticle[] {
  return BLOG_ARTICLES.sort((a, b) => 
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
}

export function getBlogArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find(a => a.slug === slug);
}

export function getBlogArticlesByCategory(category: BlogArticle['category']): BlogArticle[] {
  return BLOG_ARTICLES.filter(a => a.category === category);
}

export function getRelatedArticles(slug: string): BlogArticle[] {
  const article = getBlogArticleBySlug(slug);
  if (!article || !article.relatedArticles) return [];
  return article.relatedArticles
    .map(s => getBlogArticleBySlug(s))
    .filter((a): a is BlogArticle => a !== undefined);
}

// Kateqoriya konfiqurasiyası
export const CATEGORY_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  maliyye: { emoji: '💰', label: 'Maliyyə', color: 'green' },
  'Maliyyə': { emoji: '💰', label: 'Maliyyə', color: 'green' },
  kadr: { emoji: '👥', label: 'Kadr', color: 'blue' },
  'Kadr': { emoji: '👥', label: 'Kadr', color: 'blue' },
  emeliyyat: { emoji: '🔧', label: 'Əməliyyat', color: 'purple' },
  'Əməliyyat': { emoji: '🔧', label: 'Əməliyyat', color: 'purple' },
  konsept: { emoji: '🎨', label: 'Konsept', color: 'pink' },
  acilis: { emoji: '🏗️', label: 'Açılış', color: 'orange' },
  satis: { emoji: '📈', label: 'Satış', color: 'cyan' },
  'Satış': { emoji: '📈', label: 'Satış', color: 'cyan' },
  huquqi: { emoji: '⚖️', label: 'Hüquqi', color: 'amber' },
  'Hüquqi': { emoji: '⚖️', label: 'Hüquqi', color: 'amber' },
  marketinq: { emoji: '📣', label: 'Marketinq', color: 'rose' },
  'Marketinq': { emoji: '📣', label: 'Marketinq', color: 'rose' },
};
