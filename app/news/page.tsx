import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { NewsService } from '@/lib/services/news-service';
import NewsCard from '@/components/news/NewsCard';
import BreakingNewsBar from '@/components/news/BreakingNewsBar';
import TrendingNews from '@/components/news/TrendingNews';
import NewsSearchBar from '@/components/news/NewsSearchBar';
import NewsCategoryNav from '@/components/news/NewsCategoryNav';
import NewsletterSignup from '@/components/news/NewsletterSignup';
import Pagination from '@/components/ui/Pagination';
import { ClockIcon, FireIcon, NewspaperIcon, EyeIcon, ShareIcon } from '@heroicons/react/24/outline';
import { NewsBase } from '@/types/news';
import { FaEye, FaCalendarAlt, FaUser, FaTag } from 'react-icons/fa';

export const dynamic = 'force-dynamic';
export const revalidate = 60;


export const metadata: Metadata = {
  title: 'Gaming News - Latest Game Updates, Trailers & Reviews | GamesLib',
  description: 'Stay updated with the latest gaming news, breaking updates, game trailers, reviews, and industry insights. Your ultimate source for gaming content.',
  keywords: 'gaming news, game updates, game trailers, gaming reviews, esports news, gaming industry, PC gaming news, PS5 news, Xbox news',
  openGraph: {
    title: 'Gaming News | GamesLib',
    description: 'Latest gaming news, breaking updates, and reviews',
    type: 'website',
    url: 'https://gameslib.vercel.app/news',
    images: [
      {
        url: 'https://gameslib.vercel.app/og-news.jpg',
        width: 1200,
        height: 630,
        alt: 'GamesLib Gaming News',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gaming News | GamesLib',
    description: 'Latest gaming news, breaking updates, and reviews',
  },
  alternates: {
    types: {
      'application/rss+xml': [
        {
          title: 'GamesLib News RSS Feed',
          url: '/news/rss.xml',
        },
      ],
    },
  },
};

interface SearchParams {
  page?: string;
  category?: string;
  platform?: string;
  q?: string;
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const category = params.category;
  const platform = params.platform;
  const query = params.q;

  // Fetch all data in parallel
  const [latestNews, trendingNews, featuredNews, breakingNews, categories, tags] =
    await Promise.all([
      query
        ? NewsService.searchNews(query, 24, currentPage)
        : category
        ? NewsService.getNewsByCategory(category, 24, currentPage)
        : platform
        ? NewsService.getNewsByPlatform(platform, 24, currentPage)
        : NewsService.getLatestNews(24, currentPage),
      NewsService.getTrendingNews(10),
      currentPage === 1 && !query && !category && !platform
        ? NewsService.getFeaturedNews()
        : null,
      NewsService.getBreakingNews(3),
      NewsService.getCategories(),
      NewsService.getPopularTags(),
    ]);

  return (
    <div className="min-h-screen bg-black">
      {/* Breaking News Bar */}
      {breakingNews.length > 0 && <BreakingNewsBar news={breakingNews} />}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <NewspaperIcon className="w-12 h-12 text-white animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
              GAMING NEWS
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto font-medium">
            Breaking news, reviews, trailers & everything gaming
          </p>
          <NewsSearchBar />
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8 text-white/80">
            <div className="flex items-center gap-2">
              <NewspaperIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{latestNews.total}+ Articles</span>
            </div>
            <div className="flex items-center gap-2">
              <FireIcon className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-medium">Updated Daily</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Category Navigation */}
        <div className="mb-8">
          <NewsCategoryNav />
        </div>

{/* Featured News */}
{featuredNews && (
  <section className="mb-16">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Featured Story
      </h2>
    </div>
    
    <Link href={`/news/${featuredNews.slug}`} className="block group">
      <div className="relative h-[500px] rounded-2xl overflow-hidden bg-g-secondary border border-purple-500/20 hover:border-purple-500/50 transition-all">
        <Image
          src={featuredNews.featuredImage.url}
          alt={featuredNews.featuredImage.alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          {featuredNews.isBreaking && (
            <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-4 animate-pulse">
              BREAKING NEWS
            </span>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
            <span className="px-3 py-1 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-500/30">
              {featuredNews.category}
            </span>
            <span>{new Date(featuredNews.publishedAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{featuredNews.readingTime} min read</span>
          </div>
          
          <h3 className="text-4xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
            {featuredNews.title}
          </h3>
          
          <p className="text-gray-300 text-lg line-clamp-2 mb-4">
            {featuredNews.excerpt}
          </p>
          
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <FaEye className="text-purple-400" />
              <span>{featuredNews.uniqueViews.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-2">
              <FaShareAlt className="text-purple-400" />
              <span>{featuredNews.shares.total} shares</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  </section>
)}

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Latest News */}
          <main className="lg:w-2/3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white flex items-center gap-3">
                <NewspaperIcon className="w-8 h-8 text-purple-500" />
                {query
                  ? `Search: "${query}"`
                  : category
                  ? `${category.charAt(0).toUpperCase() + category.slice(1)} News`
                  : platform
                  ? `${platform} News`
                  : 'Latest News'}
              </h2>
              <span className="text-gray-400 text-sm">
                {latestNews.total} {latestNews.total === 1 ? 'article' : 'articles'}
              </span>
            </div>

            {latestNews.news.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {latestNews.news.map((newsItem: NewsBase) => (
                    <NewsCard key={newsItem._id} news={newsItem} />
                  ))}
                </div>

                {latestNews.pages > 1 && (
                  <Pagination currentPage={currentPage} totalPages={latestNews.pages} />
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-g-secondary rounded-xl border border-purple-500/20">
                <NewspaperIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No news found</p>
                {query && (
                  <Link
                    href="/news"
                    className="text-purple-400 hover:text-purple-300 underline text-sm"
                  >
                    ← Back to all news
                  </Link>
                )}
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:w-1/3">
            <div className="sticky top-24 space-y-8">
              {/* Trending News */}
              {trendingNews.length > 0 && <TrendingNews news={trendingNews} />}

              {/* Categories */}
              {categories.length > 0 && (
                <div className="bg-g-secondary p-6 rounded-xl border border-purple-500/20">
                  <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                    <FireIcon className="w-6 h-6 text-orange-500" />
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.slice(0, 7).map((cat: { category: string; count: number }) => (
                      <Link
                        key={cat.category}
                        href={`/news?category=${cat.category}`}
                        className="flex items-center justify-between px-4 py-2 bg-g-bg hover:bg-purple-600 text-gray-300 hover:text-white rounded-lg transition-all font-medium group"
                      >
                        <span className="capitalize">{cat.category}</span>
                        <span className="text-xs bg-purple-600/20 group-hover:bg-white/20 px-2 py-1 rounded-full">
                          {cat.count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Tags */}
              {tags.length > 0 && (
                <div className="bg-g-secondary p-6 rounded-xl border border-purple-500/20">
                  <h3 className="text-xl font-black text-white mb-4">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/news?q=${encodeURIComponent(tag)}`}
                        className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-full text-sm font-medium transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <NewsletterSignup />

              {/* Platform Filter */}
              <div className="bg-g-secondary p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-xl font-black text-white mb-4">Platforms</h3>
                <div className="space-y-2">
                  {['PC', 'PS5', 'Xbox', 'Switch', 'Mobile'].map((p: string) => (
                    <Link
                      key={p}
                      href={`/news?platform=${p}`}
                      className="block px-4 py-2 bg-g-bg hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg transition-all font-medium"
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
  
