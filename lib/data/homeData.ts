export interface NewsItem {
  id: string;
  title: string;
  category: string;
  type: 'News' | 'Opinion' | 'Appointment' | 'Announcement' | 'Report';
  date: string;
  image: string;
  excerpt: string;
  author?: { name: string; role: string; avatar?: string };
  source?: string;
}

export interface AdItem {
  id: string;
  title: string;
  type: string;
  category: string;
  price?: string;
  location: string;
  date: string;
  image: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  category: string;
  description: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  date: string;
  image: string;
}

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    title: 'Will Google\'s new Universal Commerce Protocol (UCP) turn hotel distribution upside down?',
    category: 'Revenue Optimization',
    type: 'Opinion',
    date: '02 March 2026',
    image: 'https://picsum.photos/seed/google/800/600',
    excerpt: 'Google is testing a new protocol that could fundamentally change how hotels distribute their inventory online.',
    author: { name: 'John Doe', role: 'Distribution Expert' },
    source: 'Hospitality Net',
  },
  {
    id: '2',
    title: '37% of Travelers Now Use AI, Hotels Face 65% Staffing Crisis',
    category: 'Technology',
    type: 'Report',
    date: '01 March 2026',
    image: 'https://picsum.photos/seed/ai-staff/800/600',
    excerpt: 'A new report highlights the growing gap between traveler expectations and hotel staffing capabilities.',
    author: { name: 'Jane Smith', role: 'Industry Analyst' },
    source: 'DK Editorial',
  },
  {
    id: '3',
    title: 'NH Collection to Debut in Tanzania with Pemba Island Resort',
    category: 'Development',
    type: 'Announcement',
    date: '28 February 2026',
    image: 'https://picsum.photos/seed/tanzania/800/600',
    excerpt: 'Minor Hotels announces the expansion of its NH Collection brand into East Africa.',
    source: 'Minor Hotels',
  },
  {
    id: '4',
    title: 'Registration opens for Cruise Ship Interiors Design Expo Americas 2026',
    category: 'Events',
    type: 'Announcement',
    date: '27 February 2026',
    image: 'https://picsum.photos/seed/cruise/800/600',
    excerpt: 'The premier event for the cruise ship interior design industry is now open for registration.',
    source: 'CSI Expo',
  },
  {
    id: '5',
    title: 'Apaleo strengthens French expansion with appointment of Nicolas Suissa as Country Lead',
    category: 'Appointments',
    type: 'Appointment',
    date: '26 February 2026',
    image: 'https://picsum.photos/seed/nicolas/400/400',
    excerpt: 'Nicolas Suissa joins Apaleo to lead the company\'s growth in the French market.',
    author: { name: 'Nicolas Suissa', role: 'Country Lead France', avatar: 'https://picsum.photos/seed/avatar1/100/100' },
    source: 'Apaleo',
  },
  {
    id: '6',
    title: 'Global Hotel Market Forecast Assumptions - February 2026',
    category: 'Market Intelligence',
    type: 'Report',
    date: '25 February 2026',
    image: 'https://picsum.photos/seed/forecast/800/600',
    excerpt: 'Key assumptions for the global hotel market performance in the coming year.',
    source: 'STR',
  },
  {
    id: '7',
    title: 'Helping or hindering? AI and technological advances in the hospitality sector',
    category: 'Technology',
    type: 'Opinion',
    date: '24 February 2026',
    image: 'https://picsum.photos/seed/ai-tech/800/600',
    excerpt: 'An in-depth look at how AI is reshaping the guest experience and operational efficiency.',
    author: { name: 'Robert Brown', role: 'Tech Consultant' },
    source: 'Hospitality Net',
  },
  {
    id: '8',
    title: 'The Hidden Cost of OTAs: Chargebacks Hotels Didn\'t Sign Up For',
    category: 'Finance',
    type: 'Opinion',
    date: '23 February 2026',
    image: 'https://picsum.photos/seed/finance/800/600',
    excerpt: 'Why hoteliers need to be more vigilant about OTA chargeback policies.',
    author: { name: 'Sarah Wilson', role: 'Finance Director' },
    source: 'DK Agency',
  },
];

export const AD_ITEMS: AdItem[] = [
  {
    id: 'a1',
    title: 'Nərimanovda hazır dönər evi devir edilir',
    type: 'Devir',
    category: 'Devir',
    price: '25,000 AZN',
    location: 'Bakı, Nərimanov',
    date: '28 Fevral 2026',
    image: 'https://picsum.photos/seed/doner/400/300',
  },
  {
    id: 'a2',
    title: 'İtalyan istehsalı peşəkar pizza sobası',
    type: 'Ekipman',
    category: 'Ekipman',
    price: '4,500 AZN',
    location: 'Bakı, Yasamal',
    date: '27 Fevral 2026',
    image: 'https://picsum.photos/seed/oven/400/300',
  },
  {
    id: 'a3',
    title: 'Yeni açılacaq steakhouse üçün ortaq axtarılır',
    type: 'Ortaqlıq',
    category: 'Ortaqlıq',
    location: 'Bakı, Mərkəz',
    date: '26 Fevral 2026',
    image: 'https://picsum.photos/seed/steak/400/300',
  },
  {
    id: 'a4',
    title: 'Sahil qəsəbəsində dəniz mənzərəli restoran icarəyə verilir',
    type: 'İcarə',
    category: 'İcarə',
    price: '8,000 AZN/ay',
    location: 'Bakı, Sahil',
    date: '25 Fevral 2026',
    image: 'https://picsum.photos/seed/beach/400/300',
  },
  {
    id: 'a5',
    title: 'İşlənmiş, lakin ideal vəziyyətdə qabyuyan maşın',
    type: 'Ekipman',
    category: 'Ekipman',
    price: '1,200 AZN',
    location: 'Bakı, Binəqədi',
    date: '24 Fevral 2026',
    image: 'https://picsum.photos/seed/dishwasher/400/300',
  },
];

export const PARTNERS: Partner[] = [
  { id: 'p1', name: 'AzərƏt', logo: 'https://picsum.photos/seed/meat/100/100', category: 'Ət Tədarükü', description: 'Yüksək keyfiyyətli yerli ət məhsulları.' },
  { id: 'p2', name: 'SüdDünyası', logo: 'https://picsum.photos/seed/dairy/100/100', category: 'Süd/Pendir', description: 'Təbii süd və pendir məhsullarının tədarükü.' },
  { id: 'p3', name: 'HorecaPOS', logo: 'https://picsum.photos/seed/pos/100/100', category: 'POS/Texnologiya', description: 'Restoran idarəetmə sistemləri.' },
  { id: 'p4', name: 'Wolt', logo: 'https://picsum.photos/seed/wolt/100/100', category: 'Çatdırılma', description: 'Logistika və çatdırılma tərəfdaşı.' },
  { id: 'p5', name: 'Bolt Food', logo: 'https://picsum.photos/seed/bolt/100/100', category: 'Çatdırılma', description: 'Sürətli çatdırılma xidməti.' },
];

export const BLOG_POSTS: BlogPost[] = [
  { id: 'b1', slug: 'food-cost-hesablama', title: 'Food Cost necə hesablanır? (Addım-addım bələdçi)', category: 'Toolkit', author: 'Doğan', date: '15 Fevral 2026', image: 'https://picsum.photos/seed/blog1/800/600' },
  { id: 'b2', slug: 'restoran-acarken-sehvler', title: 'Restoran açarkən edilən 12 böyük səhv', category: 'Başla', author: 'Doğan', date: '10 Fevral 2026', image: 'https://picsum.photos/seed/blog2/800/600' },
  { id: 'b3', slug: 'pl-hesablama', title: 'P&L Hesabatı nədir və niyə vacibdir?', category: 'Böyüt', author: 'Doğan', date: '5 Fevral 2026', image: 'https://picsum.photos/seed/blog3/800/600' },
  { id: 'b4', slug: 'menyu-dizayni', title: 'Menyu dizaynı: Müştəriləri necə cəlb etməli?', category: 'Marketinq', author: 'Doğan', date: '1 Fevral 2026', image: 'https://picsum.photos/seed/blog4/800/600' },
  { id: 'b5', slug: 'vergi-guzestleri', title: 'Restoranlar üçün vergi güzəştləri (2026 yenilikləri)', category: 'Hüquq', author: 'Doğan', date: '28 Yanvar 2026', image: 'https://picsum.photos/seed/blog5/800/600' },
];
