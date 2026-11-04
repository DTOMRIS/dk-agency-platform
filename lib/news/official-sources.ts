/** TASK-0554: verified public press-list templates; no generic web crawler. */
export type OfficialSource = {
  name: string;
  url: string;
  articlePath: string;
  cardClass: string;
  titleClass: string;
  dateClass: string;
  summaryClass?: string;
  detailClass?: string;
  topic: 'tourism' | 'food-safety' | 'business-rules';
};

export const OFFICIAL_SOURCES: OfficialSource[] = [
  { name: 'Dövlət Turizm Agentliyi', url: 'https://tourism.gov.az/news', articlePath: '/news/',
    cardClass: 'news__box', titleClass: 'news__box__info__title', dateClass: '_date', detailClass: 'news-single__article', topic: 'tourism' },
  { name: 'Azərbaycan Turizm Bürosu', url: 'https://www.tourismboard.az/news', articlePath: '/news/',
    cardClass: 'new-component-box', titleClass: 'card-title-v2', dateClass: 'date-badge',
    summaryClass: 'card-desc-v2', topic: 'tourism' },
  { name: 'AQTA', url: 'https://afsa.gov.az/az/xeberler', articlePath: '/az/xeberler/',
    cardClass: 'news__item', titleClass: 'news__title', dateClass: 'content__date',
    summaryClass: 'news__desc', topic: 'food-safety' },
  { name: 'KOBİA', url: 'https://smb.gov.az/az/all-news', articlePath: '/az/all-news/',
    cardClass: 'col-md-4', titleClass: 'news-title', dateClass: 'date', detailClass: 'single-news', topic: 'business-rules' },
  { name: 'Dövlət Vergi Xidməti', url: 'https://www.taxes.gov.az/az/page/xeberler', articlePath: '/az/post/',
    cardClass: 'news-card', titleClass: 'news-card-title', dateClass: 'news-card-date', detailClass: 'pdf-body', topic: 'business-rules' },
];
