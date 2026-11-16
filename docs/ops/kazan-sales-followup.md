# DK Agency — satış izləməsi (TASK-0560)

Ünvan: **Panel → KAZAN Leads** (`/dashboard/kazan-leads`, locale güzgüsü saxlanılır).

## Gündəlik istifadə
1. «Planı tamamlanmayıb», «Gecikib» və «Bu gün» növbələrinə baxın. Axtarış bütün bazada ad, telefon, e-poçt və məsul şəxsdə işləyir. 25-lik səhifələmə köhnə açıq işləri son 100 qeyddən kənarda gizlətmir.
2. Məsul şəxsi, növbəti konkret addımı və günü yazın. Açıq müraciəti plansız saxlamaq olmaz. İlkin keçmiş qeydlər avtomatik olaraq «plansız» görünür; onlara məsul/tarix uydurulmur.
3. Görüşdən sonra uyğunluq, təklif, müştəri oldu / itirildi mərhələsini seçin. İtirilmə səbəbi məcburidir. Köhnə lead statusları uyğunlaşdırılır; «təklif» köhnə enumda «qualified» ilə uyğun saxlanır.
4. Təklif məbləği ilə faktiki tahsilatı ayrı yazın. Tahsilat və vaxt sahələri artım deyil, həmin müraciət üzrə **yığılmış cəmdir**. Müştəri oldu = ödənildi deyil. Bu ekran bank/kassa uçotu, faktura və ya mənfəət hesabı deyil.
5. WhatsApp bölməsində ilk əlaqə, təklif və ya geri dönüş layihəsini seçin. Mətnə baxıb düzəldin; düymə **müştərinin** nömrəsinə açır. WhatsApp-da «Göndər»i özünüz basırsınız. Açılma mərhələni dəyişmir və mesajın göndərildiyini sübut etmir.
6. Görüş / təklif qeydi əlavə edin. Saxla uğursuz olarsa mətn qalır və qırmızı xəta görünür. Eyni qeydi başqa operator dəyişibsə 409 konflikt gəlir; yeniləyib son vəziyyətlə işləyin.

Üst göstəricilər bütün qeydlərin hazırkı vəziyyətidir; filtrlər yalnız siyahını dəyişir. Unikal insan və ya müəyyən həftənin gəliri deyil. Açıq təklif cəmi yalnız «təklif verildi» mərhələsidir. Tahsilat müştəriyə çevrilmə sayından müstəqildir. Gün Bakı vaxtı ilə hesablanır. Gündəlik Telegram xülasəsində gecikmiş və plansız qeydlərin cari sayı ayrıca verilir; mövcud son 24 saat yeni müraciət/klik sayları qorunur.

## Görüş və xidmət çərçivəsi
- İlkin tanışlıq: problem, uyğunluq, məlumatın mövcudluğu və növbəti addım.
- Ödənişli diaqnostika: təqdim olunan real məlumatlar, prioritetlər və razılaşdırılmış fəaliyyət planı.
- Aylıq izləmə: fəaliyyət planı, məsullar və nəticələr üzrə müntəzəm nəzarət.

Müddət, qiymət, vergi/ödəniş şərtləri və dəqiq əhatə müştəri ilə ayrıca razılaşdırılır. Avtomatik qiymət və ya qənaət zəmanəti yoxdur. Standart suallar və redaktə edilən mesajlar ekranın özündə dörd dildədir.

## Saxlama və giriş
- `lib/sales/schema.ts` — əlavə `kazan_sales_followups` cədvəlinin typed Drizzle təsviri. Qorunan core schema faylı dəyişmir.
- `drizzle/0024_kazan_sales_followups.sql` — idempotent yeni cədvəl. Mövcud lead, telefon və qeydlər dəyişdirilmir; yeni qeydlərə mərhələ köhnə statusdan oxunur.
- Admin GET/PATCH `/api/dashboard/kazan-sales`. Versiyalı SQL bir statement-də satış, köhnə status/tarix və not əlavəsini birlikdə saxlayır. Səhv və ya köhnə versiya heç nəyi qismən dəyişmir.
- Köhnə public PATCH yalnız handoff/meeting siqnalları üçün qalır; private sahələr anonimdə 401/403, admində yeni versiyalı axına keçid üçün 409 verir. Public analytics cavabında şəxsi lead/notes qaytarılmır.

## Owner-controlled rollout
Production miqrasiyası bu iş zamanı icra edilməyib. `scripts/ops/run-sql.mjs` qaydası: «Claude does not run this against production (owner rule) — Doğan runs it.»

1. PR diff və validator nəticəsini yoxlayın. Qorunan schema/config/auth faylları dəyişməyib.
2. Production məlumatları ilə eyni mühitdə `npm run db:migrate:status` işlədin. Bütün pending faylları yoxlayın; bu task üçün yeni fayl yalnız `0024_kazan_sales_followups.sql`-dır. `npm run db:migrate` runner pending migration-ları tətbiq edir. Yeni cədvəl köhnə kodla uyğundur, deploy-dan əvvəl tətbiq edilə bilər.
3. Owner merge → Hostinger rebuild + restart. Migration olmadan yeni ekran 503/oxunmadı göstərir, boş uğur və ya uydurma göstərici göstərmir; mövcud Telegram xülasəsi yenə işləyir, izləmə oxunmadığı ayrıca yazılır.
4. Admin kimi real bir müraciətin planını saxlayıb yeniləyin. Notlar, tarix, məbləğlər və mərhələ qalmalıdır. WhatsApp-a yalnız nömrə/mətn yoxlaması edin; test mesajını müştəriyə göndərməyin.

Rollback: kod dəyişikliyini geri alın; əlavə cədvəli silməyin. Artıq daxil edilən satış məlumatı saxlanılır və köhnə statuslarla uyğunluq qorunur. Heç bir DROP/DELETE bu task-a daxil deyil.

## Lokal yoxlama
`node --import tsx e2e/sales-followup.test.ts`

PostgreSQL WASM mühərriki production dependency deyil. Ayrı test qovluğuna `@electric-sql/pglite` quraşdırıldıqdan sonra:
`PGLITE_MODULE=/absolute/path/to/pglite/dist/index.js node --import tsx e2e/sales-followup-db.test.ts`

UI/API: `JWT_SECRET` yalnız throwaway lokal dəyər, eyni dəyərlə dev server + Playwright. `e2e/sales-followup.spec.ts` admin/anon/member qorumasını real API-da, uğurlu UI saxlamasını intercepted response ilə yoxlayır. Həqiqi SQL saxlaması ayrıca PostgreSQL engine testindədir; production DB/WhatsApp-a test yazılmır.
