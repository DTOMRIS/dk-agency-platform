export type NewsRouteMethod = 'POST';

export interface NewsRouteEntry {
  path: string;
}

export interface NewsApiRouteEntry extends NewsRouteEntry {
  method: NewsRouteMethod;
}

export interface NewsRouteMap {
  public: NewsRouteEntry[];
  admin: NewsRouteEntry[];
  api: NewsApiRouteEntry[];
}

export const newsRouteMap: NewsRouteMap = {
  public: [
    { path: '/haberler' },
    { path: '/haberler/[slug]' },
  ],
  admin: [
    { path: '/dashboard/xeberler' },
    { path: '/dashboard/xeberler/rss' },
    { path: '/dashboard/xeberler/yeni' },
  ],
  api: [
    { method: 'POST', path: '/api/news/fetch' },
    { method: 'POST', path: '/api/news/translate' },
  ],
};

export const publicNewsRoutes = newsRouteMap.public;
export const adminNewsRoutes = newsRouteMap.admin;
export const apiNewsRoutes = newsRouteMap.api;
