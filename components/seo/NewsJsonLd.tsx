// components/seo/NewsJsonLd.tsx
import Script from 'next/script';

interface NewsJsonLdProps {
  news: {
    title: string;
    slug: string;
    excerpt: string;
    author: {
      name: string;
      avatar?: string;
    };
    featuredImage: {
      url: string;
      alt: string;
      width?: number;
      height?: number;
    };
    publishedAt: string;
    category: string;
  };
}

export function NewsJsonLd({ news }: NewsJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  const newsUrl = `${siteUrl}/news/${news.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    description: news.excerpt,
    image: {
      '@type': 'ImageObject',
      url: news.featuredImage.url,
      width: news.featuredImage.width || 1200,
      height: news.featuredImage.height || 630,
      caption: news.featuredImage.alt,
    },
    datePublished: news.publishedAt,
    dateModified: news.publishedAt,
    author: {
      '@type': 'Person',
      name: news.author.name,
      url: `${siteUrl}/author/${news.author.name.toLowerCase().replace(/\s+/g, '-')}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your Site Name',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 600,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': newsUrl,
    },
    articleSection: news.category,
    url: newsUrl,
  };

  return (
    <Script
      id="news-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
