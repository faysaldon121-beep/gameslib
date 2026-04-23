import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { NewsService } from '@/lib/services/news-service';
import NewsViewTracker from '@/components/news/NewsViewTracker';
import ShareButtons from '@/components/news/ShareButtons';
import RelatedNews from '@/components/news/RelatedNews';
import NewsStructuredData from '@/components/news/NewsStructuredData';
import PortableTextContent from '@/components/news/PortableTextContent';
import {
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
  UserIcon,
  ShareIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await NewsService.getNewsBySlug(slug);

  if (!news) {
    return {
      title: 'News Not Found',
      description: 'The requested news article could not be found.',
    };
  }

  const seoTitle = news.seo?.metaTitle || news.title;
  const seoDescription = news.seo?.metaDescription || news.excerpt;

  return {
    title: `${seoTitle} | GamesLib News`,
    description: seoDescription,
    keywords: news.tags?.join(', '),
    authors: [{ name: news.author.name }],
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'article',
      publishedTime: news.publishedAt,
      modifiedTime: news._updatedAt,
      authors: [news.author.name],
      tags: news.tags,
      images:[
        {
          url: news.featuredImage,
          width: 1200,
          height: 630,
          alt: news.title,
        },
      ],
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gameslib.vercel.app'}/news/${news.slug.current}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [news.featuredImage],
    },
    alternates: {
      canonical:
        news.seo?.canonicalUrl ||
        `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gameslib.vercel.app'}/news/${news.slug.current}`,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const news = await NewsService.getNewsBySlug(slug);

  if (!news) {
    notFound();
  }

  const relatedNews = await NewsService.getRelatedNews(news._id, news.category, 4);

  return (
    <>
      <NewsStructuredData news={news} />
      <NewsViewTracker newsId={news._id} />

      <article className="min-h-screen bg-black">
        <div className="bg-g-bg border-b border-purple-500/20">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="font-medium">Back to News</span>
            </Link>
          </div>
        </div>

        <header className="relative h-[600px]">
          <Image
            src={news.featuredImage}
            alt={news.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                {news.isBreaking && (
                  <span className="px-4 py-1.5 bg-red-600 text-white text-sm font-black rounded-full uppercase animate-pulse flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                    Breaking News
                  </span>
                )}
                <span className="px-4 py-1.5 bg-purple-600 text-white text-sm font-bold rounded-full uppercase">
                  {news.category}
                </span>
                {news.platforms?.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase"
                  >
                    {p}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                {news.title}
              </h1>

              <p className="text-xl text-gray-200 mb-6 max-w-3xl leading-relaxed">
                {news.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm md:text-base">
                <div className="flex items-center gap-3">
                  {news.author.avatar && (
                    <Image
                      src={news.author.avatar}
                      alt={news.author.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span className="font-medium">{news.author.name}</span>
                    </div>
                  </div>
                </div>

                <span className="hidden md:inline">•</span>

                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-5 h-5" />
                  <time dateTime={news.publishedAt}>
                    {formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true })}
                  </time>
                </div>

                <span className="hidden md:inline">•</span>

                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  <span>{news.readingTime} min read</span>
                </div>

                <span className="hidden md:inline">•</span>

                <div className="flex items-center gap-2">
                  <EyeIcon className="w-5 h-5" />
                  <span>{news.views?.toLocaleString() || 0} views</span>
                </div>

                <span className="hidden md:inline">•</span>

                <div className="flex items-center gap-2">
                  <ShareIcon className="w-5 h-5" />
                  <span>{news.shares?.total || 0} shares</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <ShareButtons news={news} position="top" />

          {news.videoEmbed && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-2xl">
              <div
                className="aspect-video bg-black"
                dangerouslySetInnerHTML={{ __html: news.videoEmbed }}
              />
            </div>
          )}

          <div className="mb-12">
            <PortableTextContent content={news.content} />
          </div>

          {news.sourceUrl && (
            <div className="mb-8 p-4 bg-g-secondary border border-purple-500/20 rounded-lg">
              <p className="text-sm text-gray-400">
                Source:{' '}
                <a
                  href={news.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  {new URL(news.sourceUrl).hostname}
                </a>
              </p>
            </div>
          )}

          {news.tags && news.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 pt-8 border-t border-purple-500/20">
              {news.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/news?q=${encodeURIComponent(tag)}`}
                  className="px-4 py-2 bg-purple-900/30 hover:bg-purple-600 text-purple-300 hover:text-white rounded-full text-sm font-medium transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {news.author.bio && (
            <div className="mb-8 p-6 bg-g-secondary border border-purple-500/20 rounded-xl">
              <div className="flex items-start gap-4">
                {news.author.avatar && (
                  <Image
                    src={news.author.avatar}
                    alt={news.author.name}
                    width={80}
                    height={80}
                    className="rounded-full flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    About {news.author.name}
                  </h3>
                  <p className="text-gray-400 mb-4">{news.author.bio}</p>
                  {news.author.social && (
                    <div className="flex gap-4">
                      {news.author.social.twitter && (
                        <a
                          href={news.author.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                        >
                          Twitter
                        </a>
                      )}
                      {news.author.social.linkedin && (
                        <a
                          href={news.author.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <ShareButtons news={news} position="bottom" />

          {relatedNews.length > 0 && <RelatedNews news={relatedNews} />}
        </div>
      </article>
    </>
  );
}
