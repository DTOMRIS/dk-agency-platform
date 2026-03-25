import type { BlogPost } from './editorialTypes';

export const BLOG_ARTICLES: BlogPost[] = [
  {
    id: 'b3',
    slug: 'pl-hesablama',
    title: 'P&L Hesabatı nədir və niyə vacibdir?',
    category: 'Böyüt',
    author: 'Doğan',
    date: '5 Fevral 2026',
    image: 'https://picsum.photos/seed/blog3/1200/800',
    content: `
# P&L Hesabatı: Restoranın Maliyyə Sağlamlığı

Mənfəət və Zərər (P&L) hesabatı hər bir restoran sahibi üçün ən vacib sənəddir. Bu məqalədə biz P&L hesabatının necə oxunmalı olduğunu və hansı göstəricilərə diqqət yetirilməli olduğunu izah edəcəyik.

## Nümunə P&L Cədvəli

Aşağıda bir restoranın aylıq P&L nümunəsi verilmişdir:

| Kateqoriya | Məbləğ (AZN) | Faiz (%) |
|:---|:---|:---|
| Ümumi Satış | 50,000 | 100% |
| Food Cost | 15,000 | 30% |
| İşçi Xərcləri | 12,500 | 25% |
| İcarə | 5,000 | 10% |
| Kommunal | 2,500 | 5% |
| **Xalis Mənfəət** | **15,000** | **30%** |

## Code Blokunda P&L Nümunəsi (Düzəldilməli olan format)

Bəzən sistemlərdən çıxan məlumatlar belə görünür:

\`\`\`text
║ Kateqoriya     ║ Məbləğ ║ Faiz ║
╠════════════════╬════════╬══════╣
║ Ümumi Satış    ║ 50,000 ║ 100% ║
║ Food Cost      ║ 15,000 ║ 30%  ║
║ İşçi Xərcləri  ║ 12,500 ║ 25%  ║
╚════════════════╩════════╩══════╝
\`\`\`

> || Bu bölmədəki məlumatlar || çox vacibdir. ||
> ||| Diqqətli olun! |||

## Niyə P&L vacibdir?

1. **Xərclərə nəzarət:** Harada çox pul xərclədiyinizi görürsünüz.
2. **Qiymət siyasəti:** Food cost yüksəkdirsə, menyu qiymətlərinə baxmalısınız.
3. **İnvestisiya qərarları:** Yeni avadanlıq alıb-almamaq qərarını rəqəmlərə əsasən verirsiniz.

\`inline_code_nümunəsi\` ilə bəzi terminləri qeyd edək: \`EBITDA\`, \`Prime Cost\`.
    `,
  },
  {
    id: 'b1',
    slug: 'food-cost-hesablama',
    title: 'Food Cost necə hesablanır? (Addım-addım bələdçi)',
    category: 'Toolkit',
    author: 'Doğan',
    date: '15 Fevral 2026',
    image: 'https://picsum.photos/seed/blog1/1200/800',
    content: '# Food Cost Hesablama\n\nFood cost restoranın ən böyük xərc maddələrindən biridir...'
  },
  {
    id: 'b2',
    slug: 'restoran-acarken-sehvler',
    title: 'Restoran açarkən edilən 12 böyük səhv',
    category: 'Başla',
    author: 'Doğan',
    date: '10 Fevral 2026',
    image: 'https://picsum.photos/seed/blog2/1200/800',
    content: '# Restoran Açarkən Səhvlər\n\nBir çox yeni restoran sahibi eyni səhvləri təkrar edir...'
  },
];
