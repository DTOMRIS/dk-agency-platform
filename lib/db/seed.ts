import { hash } from 'bcryptjs';
import { db, dbAvailable } from './index';
import { blogPosts, listingMedia, listings, newsSources, users } from './schema';
import { MOCK_LISTINGS } from '../data/mockListings';
import { defaultNewsSources } from '../data/newsSources';
import { BLOG_ARTICLES } from '../data/editorialBlogArticles';

async function seed() {
  if (!dbAvailable || !db) {
    console.error('DATABASE_URL tapılmadı. Seed dayandırıldı.');
    process.exitCode = 1;
    return;
  }

  console.log('Seeding database...');

  const adminPassword = await hash('admin123', 12);
  const memberPassword = await hash('member123', 12);

  await db
    .insert(users)
    .values({
      name: 'Doğan Tomris',
      email: 'admin@dkagency.az',
      passwordHash: adminPassword,
      role: 'admin',
      emailVerified: true,
    })
    .onConflictDoNothing();

  await db
    .insert(users)
    .values({
      name: 'Test İstifadəçi',
      email: 'test@test.com',
      passwordHash: memberPassword,
      role: 'member',
      emailVerified: true,
    })
    .onConflictDoNothing();

  for (const listing of MOCK_LISTINGS) {
    await db
      .insert(listings)
      .values({
        trackingCode: listing.trackingCode,
        type: listing.type,
        status: listing.status,
        isShowcase: listing.isShowcase,
        isFeatured: listing.isFeatured,
        slug: listing.slug,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        currency: listing.currency || 'AZN',
        city: listing.city,
        district: listing.district,
        ownerName: listing.ownerName,
        phone: listing.phone,
        email: listing.email,
        typeSpecificData: listing.typeSpecificData,
        aiAnalysis: null,
        createdAt: new Date(listing.createdAt),
        updatedAt: new Date(listing.updatedAt),
        publishedAt: listing.isShowcase ? new Date(listing.updatedAt) : null,
      })
      .onConflictDoNothing();
  }

  const insertedListings = await db.select().from(listings);

  for (const listing of MOCK_LISTINGS) {
    const dbListing = insertedListings.find((item) => item.trackingCode === listing.trackingCode);
    if (!dbListing) continue;

    for (const [index, image] of listing.images.entries()) {
      await db
        .insert(listingMedia)
        .values({
          listingId: dbListing.id,
          url: image.url,
          type: 'image',
          isShowcase: index === 0,
          sortOrder: index,
        })
        .onConflictDoNothing();
    }
  }

  for (const source of defaultNewsSources) {
    await db
      .insert(newsSources)
      .values({
        name: source.name,
        url: source.url,
        rssUrl: source.rssUrl,
        language: source.language,
        category: source.category,
        isActive: source.isActive,
      })
      .onConflictDoNothing();
  }

  for (const article of BLOG_ARTICLES) {
    if (!article.slug || !article.title || !article.content) {
      continue;
    }

    await db
      .insert(blogPosts)
      .values({
        slug: article.slug,
        title_az: article.title,
        summary_az: article.content.slice(0, 180),
        content_az: article.content,
        category: article.category,
        author: article.author,
        readTime: 6,
        featuredImage: article.image,
        status: 'published',
        publishedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  console.log('Seed tamamlandı!');
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
