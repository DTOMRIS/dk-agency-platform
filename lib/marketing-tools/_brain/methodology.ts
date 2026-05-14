export const METHODOLOGY = {
  sevenPillars: [
    { level: 1, name: 'KST-D', description: 'Keyfiyyet, Servis, Temizlik, Deyer temeli' },
    { level: 2, name: 'Gorunerlik', description: 'Xerite, sosial, review ve AI search gorunurluyu' },
    { level: 3, name: 'Heveslendirme', description: 'Acilis kampaniyasi, loyalty, day-part teklifleri' },
    { level: 4, name: 'Ticaret Bolgesi', description: '500m radius audit, demoqrafiya, reqib xeritesi' },
    { level: 5, name: 'Satis Esaslari', description: 'Hostess, ad gunu, VIP, qrup rezervasiya, upsell' },
    { level: 6, name: 'Cemiyyet', description: 'Yerli icma, sponsorluq, cross-promo' },
    { level: 7, name: 'Regional Satis', description: 'Geo-targeting, qonsu magaza partnership, turist axini' },
  ],
  bcgMatrix: {
    star: { popularity: 'yuksek', profit: 'yuksek', target: '30-40%', action: 'Ofisiant proaktiv teklif' },
    plowhorse: { popularity: 'yuksek', profit: 'asagi', target: '20-30%', action: 'Food cost azalt' },
    puzzle: { popularity: 'asagi', profit: 'yuksek', target: '15-25%', action: 'Marketing destekleyir' },
    dog: { popularity: 'asagi', profit: 'asagi', target: '<=15%', action: 'Refresh ve ya remove' },
  },
  tierPricing: {
    entry: 'Musteri secimi baslangici, en asagi qiymet',
    mid: 'Anchor item, en satilan, hedef qiymet',
    premium: 'Qiymet ankoru; orta qiymeti celbedici gosterir',
  },
  bundleStrategy: {
    businessLunch: 'salat + icki + desert = ferdi qiymetden 15% asagi',
    family: '2 esas yemek + 2 icki + 1 desert = ferdi qiymetden 18% asagi',
  },
  roiRules: {
    minimumROI: 20,
    maxDiscount: 25,
    coverIncreaseMinimum: 30,
  },
};
