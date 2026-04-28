// app/news/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NewsService } from '@/lib/services/news-service';
import { generateNewsMetadata } from '@/components/seo/NewsSEO';
import { NewsJsonLd } from '@/components/seo/NewsJsonLd';
import NewsDetailClient from '@/components/news/NewsDetailClient';

interface PageProps {
  params: {
    slug: string;
  };
}

// ✅ Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const news = await NewsService.getNewsBySlug(params.slug);

  if (!news) {
    return {
      title: 'News Not Found',
    };
  }

  return generateNewsMetadata(news);
}

// Static generation for better performance
export async function generateStaticParams() {
  // You can generate static paths here or leave empty for dynamic
  return [];
}

// ✅ Revalidate every hour for ISR
export const revalidate = 3600;

export default async function NewsDetailPage({ params }: PageProps) {
  const news = await NewsService.getNewsBySlug(params.slug);

  if (!news) {
    notFound();
  }

  // Get related news
  const relatedNews = await NewsService.getRelatedNews(
    news._id,
    news.category,
    news.tags,
    4
  );

  return (
    <>
      <NewsJsonLd news={news} />
      <NewsDetailClient news={news} relatedNews={relatedNews} />
    </>
  );
}
