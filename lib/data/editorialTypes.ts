export interface NewsItem {
  id: string;
  title: string;
  category: string;
  type: 'News' | 'Opinion' | 'Appointment' | 'Announcement' | 'Report';
  date: string;
  image: string;
  excerpt: string;
  author?: {
    name: string;
    role: string;
    avatar?: string;
  };
  source?: string;
  sourceUrl?: string;
  readTime?: string;
  location?: string;
}

export interface AdItem {
  id: string;
  title: string;
  type: 'Devir' | 'Ekipman' | 'Ortaqlıq' | 'İşletmeci' | 'İcarə';
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
  content?: string;
}
