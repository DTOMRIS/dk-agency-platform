export const KAZAN_KNOWLEDGE = {
  foodCost: {
    definition:
      'Food cost bir porsiya yeməyin hazırlanması üçün sərf olunan ərzaq xərcidir. İşçi maaşı, icarə və kommunal ayrıca xərc qruplarıdır.',
    formula: 'Food Cost % = (Ərzaq xərci / Satış qiyməti) x 100',
    cogsFormula: 'COGS = Açılış inventarı + Alışlar - İadə - Bağlanış inventarı',
    pricingFormula: 'Satış qiyməti = Ərzaq xərci / Hədəf food cost faizi',
    idealRange: {
      fastFood: '25-30%',
      casualDining: '28-35%',
      fineDining: '30-40%',
      cafe: '25-35%',
      pizza: '20-28%',
      azerbaijanReality: 'Bir çox restoran 35-45% aralığında işləyir',
    },
    fourFactors: ['Alış qiyməti', 'Satış qiyməti', 'Məhsul dağılımı', 'Restoran nəzarəti'],
    trimLoss: {
      toyuq: '15-20%',
      malEti: '15-25%',
      baliq: '40-55%',
      kartof: '10%',
      biber: '15%',
      terevez: '10-20%',
    },
    actionSteps: [
      'Hər yemək üçün resept kartı yarat',
      'Trim loss-u reseptə daxil et',
      'FIFO və prep sheet tətbiq et',
      'Gündəlik waste log apar',
      'Aylıq 3 təchizatçı qiymət müqayisəsi et',
      'Həftəlik inventar sayımı apar',
      'Actual və theoretical food cost fərqini izləməyə başla',
      'Qiymətləri hədəf food cost faizinə görə yenilə',
    ],
    commonMistakes: [
      'Rəqibə baxıb qiymət qoymaq',
      'Resept kartı olmadan işləmək',
      'Trim loss-u hesablamamaq',
      'Waste və over-prep izləməmək',
      'Tək təchizatçıya bağlanmaq',
      'Mövsümi qiymət dəyişikliklərinə menyunu uyğunlaşdırmamaq',
    ],
    guruQuotes: [
      {
        author: 'David Scott Peters',
        book: 'Restaurant Prosperity Formula',
        quote: 'Food cost-u bilməmək gözüyumulu maşın sürmək kimidir.',
      },
      {
        author: 'Roger Fields',
        book: 'Restaurant Success by the Numbers',
        quote: 'Restoranlar çox vaxt yeməyə görə deyil, pul idarəetməsinə görə batır.',
      },
      {
        author: 'Anthony Bourdain',
        book: 'Kitchen Confidential',
        quote: 'Şans biznes modeli deyil.',
      },
    ],
    blogSlug: '1-porsiya-food-cost-hesablama',
    toolkitLink: '/toolkit/food-cost',
  },
  pnl: {
    definition:
      'P&L bir ay ərzində gəlir, xərclər və xalis mənfəəti göstərən əsas maliyyə hesabatıdır.',
    structure: ['Gəlir', 'COGS', 'Ümumi mənfəət', 'Əməliyyat xərcləri', 'Xalis mənfəət'],
    idealRanges: {
      foodCost: '28-33%',
      labor: '25-30%',
      rent: '6-10%',
      utilities: '3-5%',
      netProfit: '8-15%',
      primeCost: '55-65%',
    },
    dangerRanges: {
      foodCost: '38%+',
      labor: '35%+',
      rent: '12%+',
      netProfit: '5%-dən aşağı',
    },
    fiveMinuteAnalysis: [
      'Food cost faizinə bax',
      'İşçi xərci faizini yoxla',
      'Prime cost-u hesabla',
      'İcarə faizini ölç',
      'Net profit trendini qiymətləndir',
    ],
    actionSteps: [
      'Son 3 ayın P&L-ni yanaşı müqayisə et',
      'Aylıq deyil, həftəlik mini P&L yarat',
      'Prime cost 65%-i keçirsə dərhal mətbəx və kadr auditinə gir',
      'Gəlir deyil, net profit trendini əsas KPI et',
    ],
    commonMistakes: [
      'Kassanı mənfəət saymaq',
      'P&L-ə yalnız mühasibin işi kimi baxmaq',
      'Trend yox, tək ay oxumaq',
      'Prime cost-u ayrıca izləməmək',
    ],
    guruQuotes: [
      {
        author: 'Roger Fields',
        book: 'Restaurant Success by the Numbers',
        quote: 'Restoranların çoxu pis yeməyə görə deyil, pul idarəetməsinə görə batır.',
      },
      {
        author: 'Donald Burns',
        book: 'Your Restaurant Sucks!',
        quote: 'Menyu dizayn etməyi sevib P&L oxumaqdan qaçmaq bahalı səhvdir.',
      },
      {
        author: 'Danny Meyer',
        book: 'Setting the Table',
        quote: 'Liderlik rəqəmlərə baxmaqla başlayır.',
      },
    ],
    blogSlug: 'pnl-oxuya-bilmirsen',
    toolkitLink: '/toolkit/pnl',
  },
  menuEngineering: {
    definition:
      'Menyu mühəndisliyi hər yeməyi populyarlıq və contribution margin üzrə ölçüb Ulduz, At, Puzzle və İt kimi kateqoriyalara ayıran qərar sistemidir.',
    formula: 'Contribution Margin = Satış qiyməti - Food cost',
    categories: {
      star: { name: 'Ulduz', desc: 'Yüksək satış + yüksək mənfəət, qoru və görünən yerdə saxla', emoji: '⭐' },
      plowHorse: { name: 'At', desc: 'Yüksək satış + aşağı mənfəət, food cost azalt və ya qiyməti tənzimlə', emoji: '🐴' },
      puzzle: { name: 'Puzzle', desc: 'Aşağı satış + yüksək mənfəət, tanıtımı və ofisiant tövsiyəsini artır', emoji: '🧩' },
      dog: { name: 'İt', desc: 'Aşağı satış + aşağı mənfəət, menyudan çıxar', emoji: '🐶' },
    },
    idealMenuSize: {
      fastCasual: '15-20',
      casualDining: '25-35',
      fineDining: '12-20',
      cafe: '15-25',
      conceptDriven: '10-15',
    },
    goldenTriangle:
      'Bifold menyuda göz ilk olaraq sağ yuxarı və orta-yuxarı zonaya baxır; ən yüksək marjlı yeməklər burada yerləşdirilməlidir.',
    checklist: [
      'Son 3 ayın satış datasını çıxar',
      'Hər yeməyin contribution margin-ni hesabla',
      'Orta satış və orta CM həddini tap',
      'İtləri çıxar, puzzle-ları ön plana daşı',
      'Ofisiantlara satılacaq yeməklər siyahısı ver',
    ],
    commonMistakes: [
      'Menyuya yemək siyahısı kimi baxmaq',
      'Həddindən artıq şişkin menyu saxlamaq',
      'Qiymətləri sütun şəklində yazmaq',
      'Puzzle yeməkləri tanıtmamaq',
    ],
    guruQuotes: [
      {
        author: 'Gregg Rapp',
        book: 'The Menu Engineer',
        quote: 'Menyu restoranın ən güclü satış alətidir.',
      },
      {
        author: 'Jim Sullivan',
        book: 'Multiunit Leadership',
        quote: 'Hər ofisiant satıcıdır, ya şüurlu satır, ya da itirir.',
      },
      {
        author: 'Donald Burns',
        book: 'Your Restaurant Sucks!',
        quote: 'Menyu analizi etmədən atəş açmaq gözüyumulu işləməkdir.',
      },
    ],
    blogSlug: 'menyu-muhendisliyi-satis',
    toolkitLink: '/toolkit/menu-matrix',
  },
  staffRetention: {
    definition:
      'İşçi saxlama sisteminin məqsədi dövriyyəni azaltmaq, onboarding-i sabitləşdirmək və komandanı yalnız maaşla deyil, inkişaf və rəhbərlik keyfiyyəti ilə bağlamaqdır.',
    topReasons: ['Pis rəhbərlik', 'İnkişaf yoxluğu', 'Tanınmamaq', 'Maaş narazılığı', 'İş-həyat balansı'],
    turnoverBenchmarks: {
      globalRestaurant: '60-80%',
      bakuHighRisk: '100-150%',
    },
    sevenStrategies: [
      'Münasibətə görə işə götür, bacarığı sonradan öyrət',
      'İlk 2 həftə üçün struktur onboarding və mentor sistemi qur',
      'Staff meal, elastik qrafik və təlim kimi maaşdan əlavə dəyər ver',
      'Hər shift-dən əvvəl 10 dəqiqəlik pre-shift meeting et',
      'Tip siyasətini yazılı və şəffaf et',
      'Karyera yolu göstər: ofisiantdan managerə qədər pillə planı qur',
      'Gedən hər işçi ilə exit interview apar və pattern topla',
    ],
    actionSteps: [
      'Sınaq günü və reference yoxlaması tətbiq et',
      '2-ci həftə geribildirim görüşünü standartlaşdır',
      'Turnover rate-i rüblük KPI et',
      'Manager davranışını ayrıca ölç',
    ],
    commonMistakes: [
      'Təcili adam lazımdır deyə ilk gələni işə almaq',
      'Yeni işçini izahsız canlı shift-ə atmaq',
      'Tip siyasətini qapalı saxlamaq',
      'Karyera perspektivi göstərməmək',
    ],
    guruQuotes: [
      {
        author: 'Danny Meyer',
        book: 'Setting the Table',
        quote: 'Əvvəl komandana bax; məmnun işçi məmnun müştəri deməkdir.',
      },
      {
        author: 'Anthony Bourdain',
        book: 'Kitchen Confidential',
        quote: 'Bacarıq öyrədilər, xarakter ya var, ya yoxdur.',
      },
      {
        author: 'Horst Schulze',
        book: 'Excellence Wins',
        quote: 'İşçiyə peşəkar kimi yanaşanda onun səviyyəsi də dəyişir.',
      },
    ],
    blogSlug: 'isci-saxlama-7-strategiya',
  },
  aqta: {
    definition:
      'AQTA qida təhlükəsizliyi yoxlamalarında saxlama, gigiyena, sənədləşdirmə və allergen nəzarətini ölçən əsas tənzimləyici qurumdur.',
    registrationFee: 'Məqalə konteksti: qeydiyyat pulsuzdur, vasitəçiyə ödəniş vermə.',
    hotline: '1003',
    website: 'aqta.gov.az',
    eightAreas: ['Ərzaq saxlama', 'Şəxsi gigiyena', 'Mətbəx gigiyenası', 'Su keyfiyyəti', 'Yemək hazırlama', 'Sənədləşdirmə', 'Zal və ümumi sahələr', 'Allergen'],
    keyNumbers: {
      fridge: '+2°C - +6°C',
      freezer: '-18°C və aşağı',
      cookedChicken: '74°C',
      wellDoneBeef: '71°C',
      roomTempLimit: '2 saat',
      storageHeight: 'Yerdən 15-20 sm yuxarı',
      handWash: '20 saniyə',
    },
    topViolations: [
      'Tibbi arayışların olmaması',
      'Vaxtı keçmiş ərzaq',
      'Soyuducunun norma xaricində olması',
      'Çiy və hazır ərzağın birlikdə saxlanması',
      'Əl yuma stansiyasının uyğunsuzluğu',
      'Gigiyena jurnalının olmaması',
      'Zərərverici izi',
      'Ərzaq mənşə sənədlərinin olmaması',
      'Uyğunsuz iş geyimi',
      'Tualet sanitariyasının zəifliyi',
    ],
    crossContamination: {
      definition: 'Çiy ərzaqdakı bakteriyanın hazır yeməyə keçməsidir və qida zəhərlənməsinin əsas səbəblərindəndir.',
      boardColors: { qirmizi: 'Çiy ət', yasil: 'Tərəvəz', sari: 'Toyuq', mavi: 'Balıq' },
      prevention: ['Rəng kodlu taxtalar istifadə et', 'Əlləri hər məhsul dəyişiklikində 20 saniyə yu', 'Çiy ərzağı soyuducuda aşağı rəfdə saxla', 'Hər məhsul qrupu üçün əlcək dəyişdir'],
    },
    actionSteps: [
      'Gündəlik temperatur jurnalını doldur',
      'FIFO və tarix etiketi tətbiq et',
      'Həftəlik zərərverici yoxlaması et',
      'Aylıq qısa gigiyena təlimi keç',
      'Təchizat və faktura izlənməsini arxivlə',
    ],
    guruQuotes: [
      { author: 'Jon Taffer', book: 'Bar Rescue', quote: 'Gigiyena problemi əslində idarəetmə problemidir.' },
      { author: 'Gordon Ramsay', book: 'Kitchen Nightmares', quote: 'Mətbəxin vəziyyəti restoranın həqiqi vəziyyətini göstərir.' },
    ],
    blogSlug: 'aqta-cerime-checklist',
    toolkitLink: '/toolkit/aqta-checklist',
  },
  delivery: {
    definition:
      'Delivery kanalı gəlir gətirə bilər, amma komissiya, packaging və əlavə əmək xərci düzgün hesablanmasa sifariş başına mənfi nəticə yarada bilər.',
    platforms: {
      wolt: '25-30%',
      boltFood: '25-30%',
      yango: '20-30%',
      note: 'Komissiya müqavilə, promo və xidmət modelinə görə dəyişir.',
    },
    formulas: {
      orderMargin: 'Net qalan = Sifariş məbləği - platforma komissiyası - food cost - qablaşdırma - əlavə işçi xərci',
      monthlyPnL: 'Aylıq nəticə = Gündəlik netto nəticə x gündəlik sifariş sayı x ay günləri',
    },
    sevenWays: [
      'Ayrı delivery menyusu qur və daşınmaya uyğun olmayan yeməkləri çıxar',
      'Delivery qiymətini dine-in qiymətindən 10-20% yuxarı qur',
      'Combo və set menyu ilə AOV artır',
      'Qablaşdırma ölçülərini standartlaşdır və toplu alış et',
      'Sadiq müştərini tədricən öz kanalına yönləndir',
      'Promosyon şərtlərində endirimi kimin daşıdığını yoxla',
      'Delivery P&L-ni ayrıca izləyib hər ay müqayisə et',
    ],
    contractQuestions: [
      'Komissiya sabitdirmi, yoxsa dəyişkəndir?',
      'Ödəniş dövrü nədir?',
      'Promosyon xərcini kim daşıyır?',
      'Çıxış şərtləri və cərimə varmı?',
      'Delivery üçün fərqli qiymət qoya bilirəmmi?',
      'Reytinq sistemi necə işləyir?',
      'Platformada reklam və vurğulama ayrıca ödənişlidirmi?',
    ],
    commonMistakes: [
      'Bütün menyunu delivery-yə açmaq',
      'Komissiyanı sabit zənn etmək',
      'Packaging xərcini hesablamamaq',
      'Delivery gəlirini ümumi kassayla qarışdırmaq',
    ],
    guruQuotes: [
      { author: 'Roger Fields', book: 'Restaurant Success by the Numbers', quote: 'Hər satış kanalının öz riyaziyyatı var.' },
      { author: 'David Scott Peters', book: 'Restaurant Prosperity Formula', quote: 'Gəlir yalan danışa bilər, mənfəət həqiqəti deyir.' },
      { author: 'Anthony Bourdain', book: 'Kitchen Confidential', quote: 'Şans biznes modeli deyil.' },
    ],
    blogSlug: 'wolt-bolt-komissiyon',
    toolkitLink: '/toolkit/delivery-calc',
  },
  breakEven: {
    definition:
      'Başabaş nöqtəsi restoranın nə qazandığı, nə də itirdiyi minimum satış həddidir. Bu həddin altı zərər, üstü mənfəətdir.',
    formula: 'Başabaş satış = Sabit xərclər / (1 - Dəyişən xərc faizi)',
    targetSalesFormula: 'Hədəf satış = (Sabit xərclər + Hədəf mənfəət) / Contribution margin',
    practicalBenchmarks: {
      primeQuestion: 'Gündə neçə müştəri lazımdır ki batmayasan?',
      seasonalView: 'Yüksək, normal və aşağı mövsüm ayrıca hesablanmalıdır.',
    },
    actionSteps: [
      'Sabit xərcləri tam siyahıla',
      'Dəyişən xərc faizini hesabla',
      'Aylıq və günlük başabaşı çıxar',
      'Orta çeki ölç və lazım olan müştəri sayını tap',
      'Başabaşdan sonra hədəf mənfəət satışını ayrıca hesabla',
    ],
    commonMistakes: [
      'Müştəri sayını yaxşı zənn edib başabaşı hesablamamaq',
      'Mövsümi dəyişkənliyi nəzərə almamaq',
      'Orta çek artımının təsirini ölçməmək',
    ],
    guruQuotes: [
      { author: 'Roger Fields', book: 'Restaurant Success by the Numbers', quote: 'Başabaşı bilməmək özünü aldatmaqdır.' },
      { author: 'Donald Burns', book: 'Your Restaurant Sucks!', quote: 'Rəqəmləri bilmədən restoran idarə etmək gözüyumulu sürməkdir.' },
      { author: 'Anthony Bourdain', book: 'Kitchen Confidential', quote: 'Şans biznes modeli deyil.' },
    ],
    blogSlug: 'basabas-noqtesi-hesablama',
    toolkitLink: '/toolkit/basabas',
  },
  operationsManual: {
    definition:
      'Kurumsal kitabça restoranın yazılı əməliyyat sistemi, yəni mətbəxdən zala qədər bütün standartların bir sənəddə toplandığı manualdır.',
    eightSections: ['Missiya və dəyərlər', 'İş təsvirləri', 'Resept və porsiya standartları', 'Xidmət SOP-ları', 'Açılış və bağlanış prosedurları', 'Gigiyena qaydaları', 'Böhran idarəetməsi', 'Maliyyə qaydaları'],
    buildPlan: ['Mövcud prosesləri yazıya tök', 'Onları standartlaşdır', 'Vizual nümunələrlə dəstəklə', 'Yeni işçi onboarding-inə daxil et və 6 ayda yenilə'],
    commonMistakes: [
      'Kitabçanı yalnız böyük şirkət işi zənn etmək',
      'SOP-ları yazılı etmədən sözlə idarə etmək',
      'Kitabçanı hazırlayıb təlim verməmək',
    ],
    guruQuotes: [
      { author: 'Jon Taffer', book: 'Raise the Bar', quote: 'Standart yoxdursa, hər kəs öz standartını qoyur.' },
      { author: 'Howard Schultz', book: 'Pour Your Heart Into It', quote: 'Sistem gücü olmadan eyni təcrübəni təkrar etmək mümkün deyil.' },
      { author: 'Will Guidara', book: 'Unreasonable Hospitality', quote: 'Sistem yaradıcılığı məhdudlaşdırmır, ona yer açır.' },
    ],
    blogSlug: 'kurumsal-kitabca-emeliyyat',
  },
  construction: {
    definition:
      'İnşaatdan açılışa checklist restoran tikintisini 5 fazaya bölərək vaxt, büdcə və əməliyyat riskini nəzarətdə saxlamaq üçündür.',
    fivePhases: ['Ön hazırlıq', 'Kaba işlər', 'İncə işlər', 'Avadanlıq və texnologiya', 'Açılış hazırlığı'],
    budgetGuide: 'Kiçik-orta restoran üçün təxmini toplam büdcə 75.000-150.000 ₼, ehtiyat fond minimum 15%-dir.',
    actionSteps: [
      'Elektrik, qaz və baca riskini tikintidən əvvəl bağla',
      'Podratçı ilə yazılı müqavilə bağla',
      'Mətbəx planına aşpazı erkən daxil et',
      'Avadanlığı test etmədən təhvil alma',
      'Soft opening ilə real əməliyyat testi et',
    ],
    commonMistakes: [
      '3 faza yoxlamadan başlamaq',
      'Ucuz usta ilə sonra yenidən xərc çəkmək',
      'Ehtiyat fond ayırmamaq',
      'Tabela və baca riskini gec düşünmək',
    ],
    guruQuotes: [
      { author: 'Danny Meyer', book: 'Setting the Table', quote: 'Restoranlar çox vaxt pis planlaşdırmaya görə bağlanır.' },
      { author: 'Anthony Bourdain', book: 'Kitchen Confidential', quote: 'Riskli işdə hər maddə yoxlanmadan şansa buraxılmamalıdır.' },
    ],
    blogSlug: 'insaatdan-acilisa-checklist',
    toolkitLink: '/toolkit/insaat-checklist',
  },
  branding: {
    definition:
      'Restoran markası loqo deyil; hiss, dil və mədəniyyətin birlikdə müştəriyə verdiyi sözdür.',
    threeLevels: ['Vizual kimlik', 'Dil və ton', 'Mədəniyyət və dəyərlər'],
    visualElements: ['Loqo', 'Rəng paleti', 'Tipografiya', 'Fotoqrafiya stili', 'Menyu dizaynı', 'Sosial media şablonları', 'Qablaşdırma dizaynı'],
    actionSteps: [
      'Marka sözünü 1 cümlədə yaz',
      'Hədəf kütləni dəqiqləşdir',
      'Vizual dil üçün 3-4 əsas rəng seç',
      'Brend tonunu menyuda, telefonda və sosial mediada eyniləşdir',
      'Google Business və ağızdan-ağıza strategiyanı idarə et',
    ],
    commonMistakes: [
      'Markanı loqoya endirmək',
      'Dizaynerə yalnız “gözəl bir şey et” demək',
      'Komanda dili ilə sosial media dilini fərqli saxlamaq',
    ],
    guruQuotes: [
      { author: 'Howard Schultz', book: 'Pour Your Heart Into It', quote: 'Biz qəhvə satmırıq, üçüncü yer yaradırıq.' },
      { author: 'Simon Sinek', book: 'Start With Why', quote: 'İnsanlar nə etdiyini deyil, niyə etdiyini alır.' },
      { author: 'Seth Godin', book: 'All Marketers Are Liars', quote: 'İnsanlar məhsul deyil, hekayə alır.' },
    ],
    blogSlug: 'restoran-markalasma-konsept',
  },
} as const;

export function serializeKazanKnowledge(): string {
  return JSON.stringify(KAZAN_KNOWLEDGE, null, 2);
}
