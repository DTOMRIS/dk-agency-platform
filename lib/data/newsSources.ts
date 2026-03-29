export type NewsSourceSeed = {
  name: string;
  url: string;
  rssUrl: string;
  language: 'en' | 'tr' | 'az';
  category: 'operations' | 'finance' | 'growth' | 'market' | 'technology';
  isActive: boolean;
};

export const defaultNewsSources: NewsSourceSeed[] = [
  {
    name: 'Hospitality Net',
    url: 'https://www.hospitalitynet.org',
    rssUrl: 'https://www.hospitalitynet.org/rss/',
    language: 'en',
    category: 'operations',
    isActive: true,
  },
  {
    name: 'Restaurant Business',
    url: 'https://www.restaurantbusinessonline.com',
    rssUrl: 'https://www.restaurantbusinessonline.com/rss.xml',
    language: 'en',
    category: 'finance',
    isActive: true,
  },
  {
    name: "Nation's Restaurant News",
    url: 'https://www.nrn.com',
    rssUrl: 'https://www.nrn.com/rss.xml',
    language: 'en',
    category: 'growth',
    isActive: true,
  },
  {
    name: 'The Caterer',
    url: 'https://www.thecaterer.com',
    rssUrl: 'https://www.thecaterer.com/rss',
    language: 'en',
    category: 'operations',
    isActive: true,
  },
  {
    name: 'HotelNewsNow',
    url: 'https://www.hotelnewsnow.com',
    rssUrl: 'https://www.hotelnewsnow.com/rss',
    language: 'en',
    category: 'market',
    isActive: true,
  },
  {
    name: 'QSR Magazine',
    url: 'https://www.qsrmagazine.com',
    rssUrl: 'https://www.qsrmagazine.com/rss.xml',
    language: 'en',
    category: 'technology',
    isActive: true,
  },
];
