import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Bookmark, Calendar, ChevronLeft, Clock, Share2, Tag, User } from 'lucide-react';

import { MarkdownRenderer } from '@/components/blog';
import BlogContentWrapper from '@/components/news/BlogContentWrapper';
import { CATEGORY_CONFIG, getRelatedArticles } from '@/lib/data/blogArticles';
import { getBlogPostDetail } from '@/lib/db/blog-repository';
import { getProtectedArticleContent } from '@/lib/members/article-access';
import { getServerMemberSession } from '@/lib/members/server-session';

const BLOG_OVERRIDES = {
  'wolt-bolt-komissiyon': {
    title: 'Wolt, Bolt, Yango sənin pulunu yeyir? Komissiyanın gizli riyaziyyatı',
    subtitle: 'Delivery gəlir gətirə bilər, amma yanlış hesablananda mənfəəti də yeyir',
    summary:
      '30% komissiya, 33% food cost, qablaşdırma və əlavə əməliyyat xərcləri birlikdə delivery satışını asanlıqla mənfisə sala bilər. Bu yazı delivery kanalını ayrıca P&L kimi düşünməyi öyrədir.',
    content: `# Wolt, Bolt, Yango sənin pulunu yeyir? Komissiyanın gizli riyaziyyatı

*Kateqoriya: 📈 Satış & Delivery | Oxu müddəti: 10-12 dəq*

---

"Wolt-a qoşulduq, sifariş gəlir, hər şey əladır" demək asandır. Amma delivery gəliri ilə delivery mənfəəti eyni şey deyil.

Sən 30₼-lıq sifariş alırsan. Komissiya 30%-dirsə, platforma 9₼ götürür. Əlində 21₼ qalır. Bunun içindən food cost 33%dirsə, 9.9₼ gedir. Qablaşdırma 1.5₼, əlavə hazırlıq əməliyyatı 2-3₼ gedir. Sonda icarə, vergi, kommunal çıxmadan belə marja təhlükəli dərəcədə daralır.

## Delivery riyaziyyatı nədən ibarətdir?

Ən sadə model:

\`\`\`
Net gəlir = Sifariş dəyəri - platforma komissiyası
Contribution margin = Net gəlir - food cost - qablaşdırma - əlavə əməliyyat xərcləri
\`\`\`

### Nümunə

| Maddə | Restoranda | Delivery |
|---|---|---|
| Satış | 30₼ | 30₼ |
| Platforma komissiyası | 0₼ | -9₼ |
| Netto gəlir | 30₼ | 21₼ |
| Food cost (33%) | -9.9₼ | -9.9₼ |
| Qablaşdırma | 0₼ | -1.5₼ |
| Əlavə əməliyyat xərci | - | -2₼ |
| Qalan marja | 20.1₼ | 7.6₼ |

Bu 7.6₼ hələ son mənfəət deyil. Buradan icarə, əməkhaqqı, vergi və digər sabit xərclər də ödənməlidir.

## Bakı üçün praktik komissiya çərçivəsi

- Wolt: adətən 25-30%
- Bolt Food: adətən 25-30%
- Yango: adətən 20-30%

Rəqəm müqaviləyə, kampaniyaya və əlavə reklam paketlərinə görə dəyişir. Hər sahibkar öz müqaviləsində 3 şeyi ayrıca oxumalıdır:

1. Komissiya neçə faizdir?
2. Promosyon endiriminin neçə faizini sən qarşılaya bilərsən?
3. Ödəniş nə vaxt və hansı kəsintilərlə köçürülür?

## Delivery-ni mənfəətli etməyin 7 yolu

1. Delivery üçün ayrıca menyu qur. Hər yemək delivery-ə uyğun deyil.
2. Qiymətləri delivery kanalı üçün 10-20% yenidən hesabla.
3. Combo və set menyularla orta çek artır.
4. Qablaşdırma xərcini standartlaşdır və toplu al.
5. Ən zəif marjlı yeməkləri platformadan çıxar.
6. Delivery P&L-ni əsas restoran P&L-dən ayrı izləyin.
7. Sadiq müştəriləri zamanla öz kanallarına yönəlt.

## Müqavilə bağlayarkən verəcəyin 7 sual

1. Komissiya sabitdir, yoxsa kateqoriyaya görə dəyişir?
2. Endirim kampaniyasında pay bölgüsü necədir?
3. Ödənişlər həftəlikdir, aylıqdır?
4. Müqavilədən çıxış şərti nədir?
5. Delivery menyusunda fərqli qiymət qoya bilirəm?
6. Reytinq və görünürlük necə hesablanır?
7. Reklam və sponsorlu yerləşdirmə ayrıca ödənişlidirmi?

## Nəticə

Delivery pis kanal deyil. Sadəcə onu "əlavə satış" yox, ayrıca biznes xətti kimi idarə etmək lazımdır. Əgər hər sifarişin contribution margin-ni bilmirsənsə, həcmin artması mənfəət yox, itki böyüdə bilər.

> **DK Agency qeydi:** Delivery kanalında ən böyük səhv "sifariş var, deməli yaxşıdır" düşüncəsidir. Doğru sual budur: bu sifarişdən nə qədər qalır?

> **Toolkit tövsiyəsi:** Delivery Komissiya Kalkulyatorunda sifariş dəyəri, komissiya, food cost və qablaşdırmanı daxil edib real nəticəni yoxla.
`,
  },
  'restoran-markalasma-konsept': {
    title: 'Restoran markası loqo deyil: hiss, dil, mədəniyyət',
    subtitle: 'Marka sadəcə dizayn deyil, müştərinin səndən aldığı ümumi hissdir',
    summary:
      'Loqo, rəng və şrift markanın yalnız görünən hissəsidir. Güclü restoran markası dil, xidmət tərzi, sosial media tonu və komanda mədəniyyəti ilə qurulur.',
    content: `# Restoran markası loqo deyil: hiss, dil, mədəniyyət

*Kateqoriya: 🎨 Konsept & Brend | Oxu müddəti: 10-12 dəq*

---

Sahibkar dizaynerə gedib loqo sifariş edir və düşünür ki marka hazır oldu. Hazır olmadı.

Loqo markanın üzü ola bilər, amma markanın özü deyil. Marka müştərinin sənin restoranını xatırlayanda hiss etdiyi şeydir. Sənin məkanın onun ağlına nə ilə gəlir: rahatlıq, sürət, ailə hissi, premium xidmət, yoxsa sadəcə "bir restoran"?

## Marka nədir? 3 səviyyə

### 1. Vizual kimlik

- Loqo
- Rəng palitrası
- Şrift sistemi
- Menyu dizaynı
- İnteryer və dekor
- Uniforma
- Qablaşdırma

Bu qat görünəndir. Amma təkbaşına kifayət deyil.

### 2. Dil və ton

- Telefona necə cavab verirsən?
- Menyuda yeməkləri necə təsvir edirsən?
- Sosial mediada rəsmi danışırsan, yoxsa isti?
- Ofisiant müştəriyə hansı sözlərlə yaxınlaşır?

Bir restoranın dili də onun brendidir. "Salam, buyurun" ilə "Xoş gəldiniz, sizə nə tövsiyə edək?" eyni təsir yaratmır.

### 3. Mədəniyyət və dəyərlər

- Problemi necə həll edirsiniz?
- Komanda müştəriyə necə yanaşır?
- Gərgin anda ton dəyişirmi?
- Müştəri çıxanda nə hiss edir?

Ən çətin, amma ən güclü qat budur. Marka burada gerçək olur.

## Marka sözü nədir?

Güclü restoran markası bir cümləlik vəd verir. Məsələn:

- "Bakıda rahat ailə axşamı üçün ən isti məkan"
- "Sürətli, doyurucu və sabit nahar təcrübəsi"
- "Azərbaycan mətbəxinin modern, premium təqdimatı"

Bu cümlə yalnız şüar deyil. Menyu, dekor, musiqi, foto üslubu, komanda dili və xidmət səviyyəsi bu vədi dəstəkləməlidir.

## Vizual kimliyin 7 elementi

1. Sadə və tanınan loqo
2. 3-4 əsas rəngdən ibarət palitra
3. Maksimum 2 əsas şrift
4. Sabit foto və video stili
5. Brendə uyğun menyu dizaynı
6. Sosial media şablonları
7. Qablaşdırma və touchpoint dizaynı

## Sosial media strategiyası

Sosial media "hər gün nəsə paylaş" oyunu deyil. Məqsəd aydındır: brend hissini ekrana daşımaq.

### Qısa çərçivə

- Instagram: vizual atmosfer, yemək və məkan hissi
- TikTok: ritm, mətbəx anları, arxa səhnə
- Google Business: axtarış görünürlüğü və rəylər
- Facebook: kampaniya, tədbir, daha geniş yaş qrupu

### 80/20 qaydası

- 80% dəyər verən məzmun
- 20% birbaşa satış və kampaniya

## Ən yayğın branding səhvləri

1. Bir gün premium, o biri gün küçə dili
2. Menyu, interyer və Instagram-ın bir-birinə bənzəməməsi
3. Hamıya bənzəməyə çalışmaq
4. Söz verdiyini xidmətdə tutmamaq
5. Komandanı marka dilinə öyrətməmək

## Nəticə

Marka dizayndan başlayır, amma yalnız dizaynla yaşamır. Əgər restoranın niyə mövcud olduğunu, kimə xidmət etdiyini və hansı hissi satdığını bir cümlə ilə izah edə bilmirsənsə, hələ marka qurmamısan.

> **DK Agency qeydi:** Ən yaxşı marka sistemi olandır. Loqo, menecerin dili, ofisiantın davranışı və Instagram paylaşımı eyni restoranı göstərməlidir.

> **Toolkit tövsiyəsi:** Branding Guide səhifəsində 12 maddəlik checklist və vizual kimliyin 7 elementini addım-addım doldur.
`,
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getBlogPostDetail(slug);

  if (!article) {
    return {
      title: 'Blog yazısı tapılmadı',
      description: 'Axtardığınız yazı tapılmadı.',
    };
  }

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.summary,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getBlogPostDetail(slug);
  const session = await getServerMemberSession();

  if (!article) {
    notFound();
  }

  const articleWithOverrides = BLOG_OVERRIDES[slug as keyof typeof BLOG_OVERRIDES]
    ? { ...article, ...BLOG_OVERRIDES[slug as keyof typeof BLOG_OVERRIDES] }
    : article;

  const cat = CATEGORY_CONFIG[articleWithOverrides.category];
  const related = getRelatedArticles(slug);
  const renderedContent = getProtectedArticleContent(
    articleWithOverrides.content || '',
    session,
    articleWithOverrides.isPremium
  );

  return (
    <BlogContentWrapper articleTitle={articleWithOverrides.title} isPremium={articleWithOverrides.isPremium}>
      <div className="min-h-screen bg-[var(--dk-paper)] pb-20 text-slate-900">
        <div className="relative h-[420px] w-full overflow-hidden">
          <img
            src={articleWithOverrides.coverImage}
            alt={articleWithOverrides.coverImageAlt || articleWithOverrides.title}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          <Link
            href="/blog"
            className="absolute left-6 top-6 z-10 flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ChevronLeft size={18} /> Bloga qayıt
          </Link>

          <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16">
            <div className="mx-auto max-w-4xl">
              <div className="space-y-4">
                <span className="rounded-full bg-brand-red px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-brand-red/20">
                  {cat?.emoji} {cat?.label}
                </span>
                <h1 className="text-3xl font-display font-black leading-tight tracking-tighter text-white lg:text-5xl">
                  {articleWithOverrides.title}
                </h1>
                {articleWithOverrides.subtitle && (
                  <p className="max-w-2xl text-lg text-white/70">{articleWithOverrides.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            <article className="text-slate-900 lg:col-span-8">
              <div className="mb-10 flex flex-wrap items-center gap-6 border-b border-slate-200 pb-8 text-xs font-bold uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-brand-red" />
                  {articleWithOverrides.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-brand-red" />
                  {new Date(articleWithOverrides.publishDate).toLocaleDateString('az-AZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-brand-red" />
                  {articleWithOverrides.readingTime} dəq oxu
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-brand-red" />
                  {cat?.label}
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <button className="transition-colors hover:text-brand-red">
                    <Share2 size={18} />
                  </button>
                  <button className="transition-colors hover:text-brand-red">
                    <Bookmark size={18} />
                  </button>
                </div>
              </div>

              {articleWithOverrides.tags && articleWithOverrides.tags.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                  {articleWithOverrides.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <MarkdownRenderer content={renderedContent} />
            </article>

            <aside className="space-y-8 lg:col-span-4">
              <div className="sticky top-32 space-y-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">Xülasə</h3>
                  <p className="text-sm leading-relaxed text-slate-700">{articleWithOverrides.summary}</p>
                </div>

                {related.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">Əlaqəli yazılar</h3>
                    <div className="space-y-4">
                      {related.map((rel) => (
                        <Link key={rel.slug} href={`/blog/${rel.slug}`} className="group block">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 text-lg">{CATEGORY_CONFIG[rel.category]?.emoji}</div>
                            <div>
                              <h4 className="text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-brand-red">
                                {rel.title}
                              </h4>
                              <p className="mt-1 text-xs text-slate-400">{rel.readingTime} dəq oxu</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-brand-red p-8 text-white shadow-2xl shadow-brand-red/20">
                  <h3 className="mb-3 text-xl font-display font-black leading-tight">Pulsuz Toolkit</h3>
                  <p className="mb-6 text-sm leading-relaxed text-white/80">
                    Food cost, P&amp;L, menyu matrisi və digər alətlərlə restoranını optimallaşdır.
                  </p>
                  <Link
                    href="/toolkit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-black uppercase tracking-widest text-brand-red transition-all hover:bg-slate-50"
                  >
                    Alətlərə bax <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </BlogContentWrapper>
  );
}
