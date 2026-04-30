// app/news/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { NewsService } from '@/lib/services/news-service';
import { NewsDetail, NewsBase } from '@/types/news';
import {
  ArrowLeftIcon,
  EyeIcon,
  ShareIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface PageProps {
  params: {
    slug: string;
  };
}

// ============================================================================
// MARKDOWN PARSER
// ============================================================================
async function parseMarkdown(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm) // GitHub Flavored Markdown (tables, strikethrough, etc.)
    .use(remarkBreaks) // Convert line breaks to <br>
    .use(html, { sanitize: false }) // Convert to HTML
    .process(markdown);

  return result.toString();
}

// ============================================================================
// SEO METADATA GENERATION
// ============================================================================
function generateNewsMetadata(news: NewsDetail): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameslib.vercel.app';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'GamesLib';
  const newsUrl = `${siteUrl}/news/${news.slug}`;

  const title = news.seo?.metaTitle || `${news.title} | ${siteName}`;
  const description = news.seo?.metaDescription || news.excerpt;
  const keywords = news.seo?.metaKeywords || news.tags;
  const ogImage = news.seo?.ogImage || news.featuredImage.url;
  const ogTitle = news.seo?.ogTitle || news.title;
  const ogDescription = news.seo?.ogDescription || news.excerpt;
  const twitterCard = news.seo?.twitterCard || 'summary_large_image';
  const canonicalUrl = news.seo?.canonicalUrl || newsUrl;

  return {
    title,
    description,
    keywords: keywords,
    authors: [{ name: news.author.name }],
    creator: news.author.name,
    publisher: siteName,

    robots: {
      index: !news.seo?.noIndex,
      follow: !news.seo?.noFollow,
      nocache: false,
      googleBot: {
        index: !news.seo?.noIndex,
        follow: !news.seo?.noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: 'article',
      url: newsUrl,
      title: ogTitle,
      description: ogDescription,
      siteName: siteName,
      publishedTime: news.publishedAt,
      modifiedTime: news.publishedAt,
      authors: [news.author.name],
      section: news.category,
      tags: news.tags,
      images: [
        {
          url: ogImage,
          width: news.featuredImage.width || 1200,
          height: news.featuredImage.height || 630,
          alt: news.featuredImage.alt,
          type: 'image/jpeg',
        },
      ],
      locale: 'en_US',
    },

    twitter: {
      card: twitterCard,
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
      creator: '@gameslib',
      site: '@gameslib',
    },

    category: news.category,

    other: {
      'article:published_time': news.publishedAt,
      'article:modified_time': news.publishedAt,
      'article:author': news.author.name,
      'article:section': news.category,
      'article:tag': news.tags.join(', '),
      'twitter:label1': 'Reading time',
      'twitter:data1': `${news.readingTime} min read`,
      'twitter:label2': 'Views',
      'twitter:data2': news.uniqueViews.toLocaleString(),
    },
  };
}

// ============================================================================
// JSON-LD STRUCTURED DATA
// ============================================================================
function NewsJsonLd({ news }: { news: NewsDetail }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameslib.vercel.app';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'GamesLib';
  const newsUrl = `${siteUrl}/news/${news.slug}`;

  const newsArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': newsUrl,
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
      url: news.author.avatar
        ? `${siteUrl}/author/${news.author.name.toLowerCase().replace(/\s+/g, '-')}`
        : undefined,
      image: news.author.avatar || undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
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
    keywords: news.tags.join(', '),
    url: newsUrl,
    isAccessibleForFree: true,
    inLanguage: 'en-US',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'News',
        item: `${siteUrl}/news`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: news.category,
        item: `${siteUrl}/news/category/${news.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: news.title,
        item: newsUrl,
      },
    ],
  };

  return (
    <>
      <Script
        id="news-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
        strategy="beforeInteractive"
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="beforeInteractive"
      />
    </>
  );
}

// ============================================================================
// SHARE BUTTON COMPONENT
// ============================================================================
function ShareButtons({ news }: { news: NewsDetail }) {
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(news.title)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(news.title)}`,
  };

  return (
    <div className="flex flex-wrap gap-3 p-6 bg-gray-900/50 rounded-xl border border-gray-800">
      <span className="text-gray-400 font-medium text-sm">Share this article:</span>
      <div className="flex gap-2">
        <a
          href={shareUrls.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Twitter
        </a>
        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Facebook
        </a>
        <a
          href={shareUrls.reddit}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Reddit
        </a>
        <a
          href={shareUrls.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition-colors text-sm font-medium"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
}

// ============================================================================
// RELATED NEWS CARD
// ============================================================================
function RelatedNewsCard({ news }: { news: NewsBase }) {
  return (
    <Link
      href={`/news/${news.slug}`}
      className="group bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all"
    >
      <div className="relative h-40 overflow-hidden">
        <Image
          src={news.featuredImage.url}
          alt={news.featuredImage.alt}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <h4 className="font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
          {news.title}
        </h4>
        <p className="text-sm text-gray-400 line-clamp-2">{news.excerpt}</p>
      </div>
    </Link>
  );
}

// ============================================================================
// METADATA GENERATION
// ============================================================================
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const news = await NewsService.getNewsBySlug(params.slug);

  if (!news) {
    return {
      title: 'News Not Found',
      description: 'The requested news article could not be found.',
    };
  }

  return generateNewsMetadata(news);
}

// ============================================================================
// STATIC PARAMS GENERATION
// ============================================================================
export async function generateStaticParams() {
  return [];
}

// ============================================================================
// REVALIDATION
// ============================================================================
export const revalidate = 3600;

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default async function NewsDetailPage({ params }: PageProps) {
  const news = await NewsService.getNewsBySlug(params.slug);

  if (!news) {
    notFound();
  }

  // Parse markdown content to HTML
  const contentHtml = await parseMarkdown(news.content);

  // Get related news
  const relatedNews = await NewsService.getRelatedNews(news._id, news.category, news.tags, 4);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <NewsJsonLd news={news} />

      <div className="min-h-screen bg-black">
        <article className="max-w-4xl mx-auto px-4 py-12">
          {/* Back Button */}
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to News
          </Link>

          {/* Header */}
          <header className="mb-8">
            {news.isBreaking && (
              <span className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 animate-pulse">
                🔥 BREAKING NEWS
              </span>
            )}

            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">{news.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                {news.author.avatar && (
                  <Image
                    src={news.author.avatar}
                    alt={news.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <div className="flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  <span className="font-medium text-white">{news.author.name}</span>
                </div>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <time dateTime={news.publishedAt}>
                  {new Date(news.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>{news.readingTime} min read</span>
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <Link
                href={`/news/category/${news.category}`}
                className="inline-block px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors uppercase text-sm font-bold"
              >
                {news.category}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-400 pb-6 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <EyeIcon className="w-4 h-4 text-purple-400" />
                <span>{news.uniqueViews.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <ShareIcon className="w-4 h-4 text-purple-400" />
                <span>{news.shares.total} shares</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="relative w-full h-96 mb-8 rounded-2xl overflow-hidden border border-purple-500/20">
            <Image
              src={news.featuredImage.url}
              alt={news.featuredImage.alt}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Share Buttons */}
          <ShareButtons news={news} />

          {/* Markdown Content */}
          <div
            className="prose prose-lg prose-invert max-w-none my-12
              prose-headings:text-white prose-headings:font-bold
              prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-purple-400 prose-a:no-underline hover:prose-a:text-purple-300
              prose-strong:text-white prose-strong:font-bold
              prose-code:text-purple-400 prose-code:bg-gray-900 prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800
              prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-4 prose-blockquote:italic
              prose-ul:text-gray-300 prose-ol:text-gray-300
              prose-li:text-gray-300
              prose-img:rounded-xl prose-img:border prose-img:border-gray-800
              prose-table:border prose-table:border-gray-800
              prose-th:bg-gray-900 prose-th:text-white
              prose-td:border prose-td:border-gray-800"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Gallery */}
          {news.gallery && news.gallery.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-white mb-6">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {news.gallery.map((image, index) => (
                  <div key={index} className="relative h-48 rounded-lg overflow-hidden border border-gray-800">
                    <Image src={image.url} alt={image.alt} fill className="object-cover" />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-sm text-white">
                        {image.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {news.tags.length > 0 && (
            <div className="mb-12 p-6 bg-gray-900/50 rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <TagIcon className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {news.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/news?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-purple-500/20 rounded-full text-sm border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related News */}
          {relatedNews.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShareIcon className="w-6 h-6 text-purple-500" />
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedNews.map((related) => (
                  <RelatedNewsCard key={related._id} news={related} />
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
