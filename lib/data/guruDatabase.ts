// lib/data/guruDatabase.ts
// DK Agency Blog v4 — Guru Sitat Bankası
// 15+ dünya çapında HoReCa lideri

export interface Guru {
  id: string;
  name: string;
  title: string;
  category: 'finance' | 'operations' | 'hr' | 'concept' | 'sales' | 'opening';
  quotes: {
    quote: string;
    source: string;
    context: string; // DK Agency konteksti
  }[];
  image?: string;
}

export const GURUS: Guru[] = [
  // ═══════════════════════════════════════════════════════════════
  // 💰 MALİYYƏ KATEQORIYASI
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'roger-fields',
    name: 'Roger Fields',
    title: '"Restaurant Success by the Numbers" müəllifi',
    category: 'finance',
    quotes: [
      {
        quote: 'Restoranların 90%-i batır, amma batanların əksəriyyəti pis yemək üzündən yox, pul idarəetməsi üzündən batır.',
        source: 'Restaurant Success by the Numbers',
        context: 'P&L bu "pul idarəetməsi"nin ən əsas alətidir. Bunu oxumursan — gözübağlı idarə edirsən.',
      },
      {
        quote: 'Hər satış kanalının öz riyaziyyatı var. Gəlir gətirən kanal mənfəət gətirmir ola bilər.',
        source: 'Restaurant Success by the Numbers',
        context: 'Delivery kanalı çox vaxt gəlir gətirir, mənfəət yox. Bunu hesablamasan — kassada pul yoxa çıxır.',
      },
      {
        quote: 'Başabaş nöqtəsini bilməmək — qazanıb-qazanmadığını bilmədən işləməkdir.',
        source: 'Restaurant Success by the Numbers',
        context: 'Bakıda sahibkarların 95%-i başabaş nöqtəsini bilmir. "Günə 50 müştəri gəlir" deyir — amma kifayətdirmi?',
      },
    ],
  },
  {
    id: 'david-scott-peters',
    name: 'David Scott Peters',
    title: 'TheRestaurantExpert.com qurucusu, food cost ustası',
    category: 'finance',
    quotes: [
      {
        quote: 'Food cost-u bilməmək — gözübağlı avtomobil sürmək kimidir. Hara getdiyini bilmirsən, nə vaxt qəza olacağını da bilmirsən.',
        source: 'Restaurant Prosperity Formula',
        context: 'Bakıda da eynidir — hər gün gözübağlı sürənlər var.',
      },
      {
        quote: 'Gəlir sənə yalan danışır. Mənfəət həqiqəti deyir.',
        source: 'Restaurant Prosperity Formula',
        context: 'Delivery-dən 15.000₼ gəlir gəlməsi heç nə deməkdir əgər xalis mənfəətin 800₼-dırsa.',
      },
    ],
  },
  {
    id: 'donald-burns',
    name: 'Donald Burns',
    title: '"The Restaurant Coach"',
    category: 'finance',
    quotes: [
      {
        quote: 'Restoran sahibləri menyu dizayn etməyə aşiqdir, amma menyunun hansı yeməyinin pul qazandırdığını bilmir.',
        source: 'Your Restaurant Sucks!',
        context: 'Menyu analizi et. Ulduzlarını qoru, itləri öldür.',
      },
      {
        quote: 'Rəqəmləri bilmədən restoran idarə etmək, gözübağlı avtomobil sürməklə eynidir.',
        source: 'Your Restaurant Sucks!',
        context: 'Başabaş nöqtəsini bilmək — gözünü açmaqdır.',
      },
    ],
  },
  {
    id: 'wolfgang-puck',
    name: 'Wolfgang Puck',
    title: 'Celebrity şef, restoran imperiyası qurucusu',
    category: 'finance',
    quotes: [
      {
        quote: 'Bu gün əla aşpaz olmaq kifayət deyil — əla iş adamı da olmalısan.',
        source: 'Müsahibə',
        context: 'Yemək bacarığı lazımdır, amma biznes bacarığı olmadan restoran yaşamır.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 🏗️ YER AÇILIŞ KATEQORIYASI
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'anthony-bourdain',
    name: 'Anthony Bourdain',
    title: 'Şef, müəllif, Kitchen Confidential',
    category: 'opening',
    quotes: [
      {
        quote: 'Restoran açmaq istəyi qəribə və dəhşətli bir xəstəlikdir. İnvestisiyanın geri dönmə ehtimalı beşdə birdir.',
        source: 'Kitchen Confidential',
        context: 'Bakıda da eynidir — amma bu yazılar o beşdə birdən sənin tərəfində olmağın üçündür.',
      },
      {
        quote: 'Şans biznes modeli deyil.',
        source: 'Kitchen Confidential',
        context: 'Sistemsiz restoran şansa güvənir. Sistemli restoran planla işləyir.',
      },
      {
        quote: 'Bacarıqları öyrətmək olar. Xarakter ya var, ya yoxdur.',
        source: 'Kitchen Confidential',
        context: 'İşə götürərkən xaraktere bax, bacarıq öyrədilər.',
      },
      {
        quote: 'Restoran biznesi insana daim təvazökarlıq aşılayır.',
        source: 'Kitchen Confidential',
        context: 'Hər gün yeni problem, hər gün yeni dərs. Təvazökar ol, öyrən.',
      },
    ],
  },
  {
    id: 'danny-meyer',
    name: 'Danny Meyer',
    title: 'Union Square Hospitality Group qurucusu, NYC',
    category: 'hr',
    quotes: [
      {
        quote: 'Restoranlar pis yemək üzündən bağlanmır. Pis planlaşdırma üzündən bağlanır.',
        source: 'Setting the Table',
        context: 'İnşaat — planlaşdırmanın ən kritik hissəsidir. Burada edilən səhv, açılışdan sonra düzəlməz.',
      },
      {
        quote: 'Əvvəlcə komandana bax. Məmnun işçi məmnun müştəri deməkdir.',
        source: 'Setting the Table — Enlightened Hospitality',
        context: 'Meyer prioritet sırasını belə qoyur: 1) İşçilər 2) Müştərilər 3) İcma 4) Təchizatçılar 5) İnvestorlar.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 👥 KADR KATEQORIYASI
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'horst-schulze',
    name: 'Horst Schulze',
    title: 'Ritz-Carlton qurucusu',
    category: 'hr',
    quotes: [
      {
        quote: 'Biz xanımlar və cənablarıq, xanımlara və cənablara xidmət edirik.',
        source: 'Ritz-Carlton Gold Standards',
        context: 'İşçiyə hörmət — müştəriyə hörmətin əsasıdır. Özünü sayğılı hiss edən insan başqalarına sayğılı davranır.',
      },
    ],
  },
  {
    id: 'will-guidara',
    name: 'Will Guidara',
    title: 'Eleven Madison Park, "Unreasonable Hospitality" müəllifi',
    category: 'hr',
    quotes: [
      {
        quote: 'Qonaqpərvərlik qaydası: gözləntini aş, yalnız standartı yox.',
        source: 'Unreasonable Hospitality',
        context: 'Standart minimum, gözləntini aşmaq isə fərqi yaradan şeydir.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 🔧 ƏMƏLİYYAT KATEQORIYASI
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'jon-taffer',
    name: 'Jon Taffer',
    title: 'Bar Rescue aparıcısı, 600+ mekan xilas edib',
    category: 'operations',
    quotes: [
      {
        quote: 'Mən heç vaxt uğursuz restoran görməmişəm — yalnız uğursuz sahibkarlar görmüşəm.',
        source: 'Bar Rescue',
        context: 'Bakıda "kresloya yapışan sahibkar" sindromu bunun tam təsdiqidir.',
      },
      {
        quote: 'Standart yoxdursa, hər kəs öz standartını qoyur. Nəticə: xaos.',
        source: 'Raise the Bar',
        context: 'Bakıda hər gün eyni problemi fərqli şəkildə həll etmək — standart yoxluğunun sübutudur.',
      },
      {
        quote: 'Gigiyena problemi = idarəetmə problemi.',
        source: 'Bar Rescue',
        context: 'AQTA cəriməsi gigiyena problemi deyil — nəzarətsizlik problemidir. Sistem varsa, cərimə olmaz.',
      },
    ],
  },
  {
    id: 'gordon-ramsay',
    name: 'Gordon Ramsay',
    title: '35+ Michelin ulduzu, Kitchen Nightmares aparıcısı',
    category: 'operations',
    quotes: [
      {
        quote: 'İnsanlar mətbəx bağlandığı üçün batdıqlarını zənn edir. Əslində ofis bağlandığı üçün batırlar.',
        source: 'Kitchen Nightmares',
        context: 'Ramsay hər epizodda birinci soyuducunu açır. Soyuducunun vəziyyəti restoranın vəziyyətini göstərir.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 🎨 KONSEPT & BREND KATEQORIYASI
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'howard-schultz',
    name: 'Howard Schultz',
    title: 'Starbucks qurucusu',
    category: 'concept',
    quotes: [
      {
        quote: 'Biz qəhvə satmırıq. Ev ilə iş arasında üçüncü yer yaradırıq.',
        source: 'Pour Your Heart Into It',
        context: 'Sənin restoranın nə satır? Yemək? Hər kəs yemək satır. Fərqi yaradan — yaratdığın hissdir.',
      },
      {
        quote: 'Starbucks-ı böyüdən qəhvənin dadı deyil, sistemin gücüdür.',
        source: 'Pour Your Heart Into It',
        context: '35.000 mağazada eyni təcrübəni vermək sistem sayəsindədir.',
      },
    ],
  },
  {
    id: 'simon-sinek',
    name: 'Simon Sinek',
    title: '"Start With Why" müəllifi',
    category: 'concept',
    quotes: [
      {
        quote: 'İnsanlar NƏ etdiyini almır, NİYƏ etdiyini alır.',
        source: 'Start With Why',
        context: 'Restoran açırsan — NİYƏ? "Pul qazanmaq üçün" deyilsə — markan olmayacaq.',
      },
    ],
  },
  {
    id: 'seth-godin',
    name: 'Seth Godin',
    title: 'Marketinq filosofu, "Purple Cow" müəllifi',
    category: 'concept',
    quotes: [
      {
        quote: 'İnsanlar məhsul almır, hekayə alır.',
        source: 'All Marketers Are Liars',
        context: 'Sənin restoranın hekayəsi nədir? Hekayən yoxdursa — loqon var, markan yox.',
      },
    ],
  },
  {
    id: 'philip-kotler',
    name: 'Philip Kotler',
    title: 'Marketinq atası',
    category: 'concept',
    quotes: [
      {
        quote: 'Atmosfer — alıcıda müəyyən emosional təsirlər yaratmaq üçün satış mühitini dizayn etmə cəhdidir.',
        source: 'Marketing Management',
        context: 'Atmosfer satır. İşıq, musiqi, qoxu — hamısı satış alətidir.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 📈 SATIŞ KATEQORIYASI
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'jim-sullivan',
    name: 'Jim Sullivan',
    title: 'Sullivision.com qurucusu, restoran satış ustası',
    category: 'sales',
    quotes: [
      {
        quote: 'Hər ofisiant satıcıdır — ya bilinçli satır, ya bilinçsiz itirdir.',
        source: 'Multiunit Leadership',
        context: 'Menyu mühəndisliyi ofisiantın nəyi satacağını da müəyyən edir.',
      },
    ],
  },
  {
    id: 'gregg-rapp',
    name: 'Gregg Rapp',
    title: 'Menyu mühəndisi, "Menu Engineer"',
    category: 'sales',
    quotes: [
      {
        quote: 'Menyu restoranın ən güclü satış alətidir — amma əksər sahibkarlar onu yemək siyahısı kimi istifadə edir.',
        source: 'Menu Engineering',
        context: 'Bakıda menyuya saatlarla dizayn verilir — amma yeməklərin hansının qazandırdığını heç kim bilmir.',
      },
    ],
  },
  {
    id: 'ray-kroc',
    name: 'Ray Kroc',
    title: 'McDonald\'s qurucusu',
    category: 'sales',
    quotes: [
      {
        quote: 'Müştəri bir dəfə gəlsə yaxşıdır, iki dəfə gəlsə əladır, üç dəfə gəlsə artıq sənin müştərindir.',
        source: 'Grinding It Out',
        context: 'Sadiq müştəri yaratmaq — hər restoranın əsas məqsədi olmalıdır.',
      },
    ],
  },
];

// Kateqoriyaya görə guru tap
export function getGurusByCategory(category: Guru['category']): Guru[] {
  return GURUS.filter(g => g.category === category);
}

// ID ilə guru tap
export function getGuruById(id: string): Guru | undefined {
  return GURUS.find(g => g.id === id);
}

// İsim ilə guru tap
export function getGuruByName(name: string): Guru | undefined {
  return GURUS.find(g => g.name.toLowerCase() === name.toLowerCase());
}

// Random sitat al
export function getRandomQuote(): { guru: Guru; quote: Guru['quotes'][0] } {
  const guru = GURUS[Math.floor(Math.random() * GURUS.length)];
  const quote = guru.quotes[Math.floor(Math.random() * guru.quotes.length)];
  return { guru, quote };
}

// Bütün sitatları düz siyahı kimi al
export function getAllQuotes(): Array<{ guru: Guru; quote: Guru['quotes'][0] }> {
  const all: Array<{ guru: Guru; quote: Guru['quotes'][0] }> = [];
  GURUS.forEach(guru => {
    guru.quotes.forEach(quote => {
      all.push({ guru, quote });
    });
  });
  return all;
}
