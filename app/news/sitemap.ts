// app/news/sitemap.ts
import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db/mongodb';
import News from '@/lib/models/News';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameslib.vercel.app';

  try {
    await dbConnect();

    // Fetch only necessary fields for better performance
    const newsArticles = await News.find({ status: 'published' })
      .select('slug publishedAt isFeatured isBreaking')
      .sort({ publishedAt: -1 })
      .limit(5000) // Google's limit per sitemap
      .lean()
      .exec();

    const newsEntries: MetadataRoute.Sitemap = newsArticles.map((item: any) => ({
      url: `${baseUrl}/news/${item.slug}`,
      lastModified: new Date(item.publishedAt),
      changeFrequency: 'daily' as const,
      priority: item.isFeatured ? 1.0 : item.isBreaking ? 0.9 : 0.8,
    }));

    // Add main news page
    return [
      {
        url: `${baseUrl}/news`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 1.0,
      },
      ...newsEntries,
    ];
  } catch (error) {
    console.error('Error generating news sitemap:', error);
    return [
      {
        url: `${baseUrl}/news`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 1.0,
      },
    ];
  }
}

// Revalidate every hour
export const revalidate = 3600;
