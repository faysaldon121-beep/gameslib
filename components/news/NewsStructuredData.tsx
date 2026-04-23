import Script from 'next/script';
import { NewsDetail } from '@/types/news';

interface NewsStructuredDataProps {
  news: NewsDetail;
}

export default function NewsStructuredData({ news }: NewsStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.seo?.metaTitle || news.title,
    description: news.seo?.metaDescription || news.excerpt,
    image:[news.featuredImage],
    datePublished: news.publishedAt,
    dateModified: news._updatedAt,
    author: {
      '@type': 'Person',
      name: news.author.name,
      ...(news.author.bio && { description: news.author.bio }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'GamesLib',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gameslib.vercel.app'}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gameslib.vercel.app'}/news/${news.slug.current}`,
    },
    ...(news.tags && news.tags.length > 0 && { keywords: news.tags.join(', ') }),
    ...(news.videoEmbed && { video: { '@type': 'VideoObject' } }),
  };

  return (
    <Script
      id={`news-structured-data-${news._id}`}
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
