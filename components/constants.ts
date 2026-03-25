import { NewsItem, AdItem, Partner, BlogPost } from './types';

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    slug: 'holdinq-daxili-emeliyyatlarin-reqemsallasdirilmasi',
    title: 'Holdinq daxili əməliyyatların rəqəmsallaşdırılması: Yeni standartlar',
    category: 'Strateji',
    type: 'Opinion',
    date: '02 March 2026',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80',
    excerpt: 'DK Agency yeni Universal Əməliyyat Protokolu ilə bütün lahiyələrin idarəetməsini tək mərkəzə toplayır.',
    author: { name: 'Doğan', role: 'Təsisçi' },
    source: 'DK Agency'
  },
  {
    id: '2',
    slug: 'b2b-sektorunda-ai-nin-rolu-2026',
    title: 'B2B Sektorunda AI-nın rolu: 2026 Trendləri',
    category: 'Texnologiya',
    type: 'Report',
    date: '01 March 2026',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80',
    excerpt: 'Süni intellekt lahiyə idarəetməsində və risk analizində necə inqilab edir?',
    author: { name: 'Jane Smith', role: 'Analitik' },
    source: 'DK Editorial'
  },
  {
    id: '3',
    slug: 'yeni-investisiya-fondu-azerbaycanin-kadr-bazarina-daxil-olur',
    title: 'Yeni İnvestisiya Fondu Azərbaycanın kadr bazarına daxil olur',
    category: 'İnvestisiya',
    type: 'Announcement',
    date: '28 February 2026',
    image: 'https://images.unsplash.com/photo-1454165833267-024f0c90432c?auto=format&fit=crop&q=80',
    excerpt: 'TQTA ekosistemi daxilində yeni kadr pipeline-ı üçün 5 milyon AZN yatırılacaq.',
    source: 'DK Agency'
  },
  {
    id: '4',
    slug: 'baki-beynelxalq-forumu-strateji-terefdashlar',
    title: 'Bakı Beynəlxalq Forumu: Strateji Tərəfdaşlıqlar',
    category: 'Tədbirlər',
    type: 'Announcement',
    date: '27 February 2026',
    image: 'https://images.unsplash.com/photo-1540575861501-7ad05823123d?auto=format&fit=crop&q=80',
    excerpt: 'Sentyabr ayında Bakıda keçiriləcək forumda regional əməkdaşlıqlar müzakirə olunacaq.',
    source: 'DK Events'
  }
];

export const AD_ITEMS: AdItem[] = [
  {
    id: 'a1',
    title: 'Bakı mərkəzində hazır ofis və agentlik devri',
    type: 'Lahiyə',
    category: 'Lahiyə',
    price: '125,000 AZN',
    location: 'Bakı, Nərimanov',
    date: '28 Fevral 2026',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80'
  },
  {
    id: 'a2',
    title: 'Professional IT Hub üçün server avadanlığı',
    type: 'Avadanlıq',
    category: 'Avadanlıq',
    price: '45,000 AZN',
    location: 'Bakı, Yasamal',
    date: '27 Fevral 2026',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80'
  },
  {
    id: 'a3',
    title: 'Yeni FinTech lahiyəsi üçün B2B tərəfdaş / investor axtarılır',
    type: 'İnvestisiya',
    category: 'İnvestisiya',
    location: 'Bakı, Mərkəz',
    date: '26 Fevral 2026',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80'
  },
  {
    id: 'a4',
    title: 'Yeni loqistika mərkəzi üçün anbar sahəsi icarəyə verilir',
    type: 'İcarə',
    category: 'İcarə',
    price: '15,000 AZN/ay',
    location: 'Bakı, Binəqədi',
    date: '25 Fevral 2026',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80'
  }
];

export const PARTNERS: Partner[] = [
  {
    id: 'p1',
    name: 'Wolt',
    logo: 'https://ui-avatars.com/api/?name=Wolt&background=009de0&color=fff&bold=true&size=100',
    category: 'Çatdırılma',
    description: 'Qida çatdırılma platforması.'
  },
  {
    id: 'p2',
    name: 'Bolt Food',
    logo: 'https://ui-avatars.com/api/?name=BF&background=34d186&color=fff&bold=true&size=100',
    category: 'Çatdırılma',
    description: 'Sürətli qida çatdırılma xidməti.'
  },
  {
    id: 'p3',
    name: 'iLoyal POS',
    logo: 'https://ui-avatars.com/api/?name=iL&background=6366f1&color=fff&bold=true&size=100',
    category: 'POS Sistemi',
    description: 'Restoran idarəetmə və kassa proqramı.'
  },
  {
    id: 'p4',
    name: 'Bravo',
    logo: 'https://ui-avatars.com/api/?name=Bravo&background=e11d48&color=fff&bold=true&size=100',
    category: 'Tədarük',
    description: 'Ərzaq və içki tədarükçüsü.'
  },
  {
    id: 'p5',
    name: 'AQTA',
    logo: 'https://ui-avatars.com/api/?name=AQTA&background=0d9488&color=fff&bold=true&size=100',
    category: 'Qida Təhlükəsizliyi',
    description: 'Azərbaycan Qida Təhlükəsizliyi Agentliyi.'
  },
  {
    id: 'p6',
    name: 'Rahat Market',
    logo: 'https://ui-avatars.com/api/?name=RM&background=f59e0b&color=fff&bold=true&size=100',
    category: 'Tədarük',
    description: 'Topdan ərzaq tədarükü.'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    slug: 'agentlik-pl-idarəetmə',
    title: 'Agentlik üçün düzgün P&L necə qurulmalıdır?',
    category: 'Strateji',
    author: 'Doğan',
    date: '15 Fevral 2026',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80'
  },
  {
    id: 'b2',
    slug: 'yeni-lahiya-sehvler',
    title: 'Yeni lahiyə başladarkən edilən 10 kritik səhv',
    category: 'Lahiyə',
    author: 'Doğan',
    date: '10 Fevral 2026',
    image: 'https://images.unsplash.com/photo-1454165833267-024f0c90432c?auto=format&fit=crop&q=80'
  },
  {
    id: 'b3',
    slug: 'b2b-ekosistem',
    title: 'Niyə B2B ekosistemi lahiyələrinizi 3 qat daha sürətli böyüdür?',
    category: 'Ekosistem',
    author: 'Doğan',
    date: '5 Fevral 2026',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80'
  }
];
