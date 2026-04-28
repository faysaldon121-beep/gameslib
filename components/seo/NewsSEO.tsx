// components/seo/NewsSEO.tsx
import { Metadata } from 'next';
import { NewsDetail } from '@/types/news';

export function generateNewsMetadata(news: NewsDetail): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  const newsUrl = `${siteUrl}/news/${news.slug}`;
  
  const title = news.seo?.metaTitle || news.title;
  const description = news.seo?.metaDescription || news.excerpt;
  const ogImage = news.seo?.ogImage || news.featuredImage.url;
  const ogTitle = news.seo?.ogTitle || title;
  const ogDescription = news.seo?.ogDescription || description;

  return {
    title,
    description,
    keywords: news.seo?.metaKeywords || news.tags,
    authors: [{ name: news.author.name }],
    creator: news.author.name,
    publisher: 'Your Site Name',
    
    robots: {
      index: !news.seo?.noIndex,
      follow: !news.seo?.noFollow,
      googleBot: {
        index: !news.seo?.noIndex,
        follow: !news.seo?.noFollow,
      },
    },

    alternates: {
      canonical: news.seo?.canonicalUrl || newsUrl,
    },

    openGraph: {
      type: 'article',
      url: newsUrl,
      title: ogTitle,
      description: ogDescription,
      siteName: 'Your Site Name',
      publishedTime: news.publishedAt,
      authors: [news.author.name],
      tags: news.tags,
      images: [
        {
          url: ogImage,
          width: news.featuredImage.width || 1200,
          height: news.featuredImage.height || 630,
          alt: news.featuredImage.alt,
        },
      ],
    },

    twitter: {
      card: news.seo?.twitterCard || 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
      creator: '@yourhandle',
      site: '@yourhandle',
    },

    other: {
      'article:published_time': news.publishedAt,
      'article:author': news.author.name,
      'article:section': news.category,
      'article:tag': news.tags.join(', '),
    },
  };
}
