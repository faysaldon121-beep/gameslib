// app/news/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { NewsService } from '@/lib/services/news-service';
import { NewsBase } from '@/types/news';
import { 
  NewspaperIcon, 
  FireIcon, 
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  EyeIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

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
};

interface SearchParams {
  page?: string;
  category?: string;
  platform?: string;
  q?: string;
}

// ============================================================================
// COMPONENT: NewsCard
// ============================================================================
function NewsCard({ news }: { news: NewsBase }) {
  return (
    <Link href={`/news/${news.slug}`} className="group block">
      <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all hover:scale-[1.02]">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-800">
          <Image
            src={news.featuredImage.url}
            alt={news.featuredImage.alt}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {news.isBreaking && (
            <div className="absolute top-3 left-3">
              <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                BREAKING
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category & Date */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              {news.category}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(news.publishedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {news.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-400 text-sm line-clamp-2 mb-4">
            {news.excerpt}
          </p>

          {/* Footer Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <EyeIcon className="w-3 h-3" />
                <span>{news.uniqueViews.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <ShareIcon className="w-3 h-3" />
                <span>{news.shares.total}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                <span>{news.readingTime}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// COMPONENT: TrendingNewsItem
// ============================================================================
function TrendingNewsItem({ news, index }: { news: NewsBase; index: number }) {
  return (
    <Link
      href={`/news/${news.slug}`}
      className="flex gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
    >
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-purple-300 transition-colors mb-1">
          {news.title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <EyeIcon className="w-3 h-3" />
          <span>{news.uniqueViews.toLocaleString()} views</span>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// COMPONENT: BreakingNewsBar
// ============================================================================
function BreakingNewsBar({ news }: { news: NewsBase[] }) {
  if (news.length === 0) return null;

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4">
          <span className="font-bold uppercase text-sm flex-shrink-0 flex items-center gap-2">
            <FireIcon className="w-4 h-4 animate-pulse" />
            Breaking
          </span>
          <div className="flex-1 overflow-hidden">
            <div className="animate-scroll whitespace-nowrap">
              {news.map((item, i) => (
                <Link
                  key={item._id}
                  href={`/news/${item.slug}`}
                  className="inline-block hover:underline mr-8"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: Pagination
// ============================================================================
function Pagination({
  currentPage,
  totalPages,
  baseUrl = '/news',
}: {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
}) {
  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      {currentPage > 1 && (
        <Link
          href={`${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${currentPage - 1}`}
          className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
      )}

      {/* First Page */}
      {startPage > 1 && (
        <>
          <Link
            href={`${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=1`}
            className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white transition-colors"
          >
            1
          </Link>
          {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
        </>
      )}

      {/* Page Numbers */}
      {pages.map((page) => (
        <Link
          key={page}
          href={`${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page}`}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            page === currentPage
              ? 'bg-purple-600 text-white'
              : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
          }`}
        >
          {page}
        </Link>
      ))}

      {/* Last Page */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
          <Link
            href={`${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${totalPages}`}
            className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white transition-colors"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* Next Button */}
      {currentPage < totalPages && (
        <Link
          href={`${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${currentPage + 1}`}
          className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Link>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT: SearchBar
// ============================================================================
function SearchBar() {
  return (
    <form action="/news" method="GET" className="max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          name="q"
          placeholder="Search gaming news..."
          className="w-full px-6 py-4 pr-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
        >
          <MagnifyingGlassIcon className="w-5 h-5 text-white" />
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// COMPONENT: NewsletterSignup
// ============================================================================
function NewsletterSignup() {
  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-6 rounded-xl border border-purple-500/20">
      <h3 className="text-lg font-black text-white mb-2">Stay Updated</h3>
      <p className="text-gray-400 text-sm mb-4">
        Get the latest gaming news delivered to your inbox
      </p>
      <form className="space-y-2">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const selectedCategory = params.category;
  const selectedPlatform = params.platform;
  const query = params.q;

  // Fetch news data based on filters
  let newsData;

  if (query) {
    newsData = await NewsService.searchNews(query, 24, currentPage);
  } else if (selectedCategory) {
    newsData = await NewsService.getNewsByCategory(selectedCategory, 24, currentPage);
  } else if (selectedPlatform) {
    newsData = await NewsService.getNewsByPlatform(selectedPlatform, 24, currentPage);
  } else {
    newsData = await NewsService.getLatestNews(24, currentPage);
  }

  // Fetch complementary data (only on first page without filters)
  const showFeatured = currentPage === 1 && !query && !selectedCategory && !selectedPlatform;

  const [trendingNews, featuredNews, breakingNews, categories, tags] = await Promise.all([
    NewsService.getTrendingNews(8),
    showFeatured ? NewsService.getFeaturedNews() : null,
    NewsService.getBreakingNews(3),
    NewsService.getCategories(),
    NewsService.getPopularTags(15),
  ]);

  const { news, total, pages } = newsData;

  // Build base URL for pagination
  let baseUrl = '/news';
  if (query) baseUrl += `?q=${encodeURIComponent(query)}`;
  else if (selectedCategory) baseUrl += `?category=${selectedCategory}`;
  else if (selectedPlatform) baseUrl += `?platform=${selectedPlatform}`;

  // Platform list (hardcoded or fetch from DB)
  const platforms = ['PC', 'PS5', 'Xbox', 'Switch', 'Mobile'];

  return (
    <div className="min-h-screen bg-black">
      {/* Breaking News Bar */}
      <BreakingNewsBar news={breakingNews} />

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
          
          <SearchBar />

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8 text-white/80">
            <div className="flex items-center gap-2">
              <NewspaperIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{total}+ Articles</span>
            </div>
            <div className="flex items-center gap-2">
              <FireIcon className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-medium">Updated Daily</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Featured News - Only show on main page */}
        {featuredNews && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <SparklesIcon className="w-6 h-6 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white">Featured Story</h2>
            </div>

            <Link href={`/news/${featuredNews.slug}`} className="block group">
              <div className="relative h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 hover:border-purple-500/50 transition-all">
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
                    <span className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 animate-pulse">
                      <FireIcon className="w-4 h-4" />
                      BREAKING NEWS
                    </span>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
                    <span className="px-3 py-1 bg-purple-500/30 backdrop-blur-sm rounded-full border border-purple-500/50 font-medium uppercase">
                      {featuredNews.category}
                    </span>
                    <span>{new Date(featuredNews.publishedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{featuredNews.readingTime} min read</span>
                  </div>

                  <h3 className="text-4xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors line-clamp-2">
                    {featuredNews.title}
                  </h3>

                  <p className="text-gray-300 text-lg line-clamp-2 mb-4">
                    {featuredNews.excerpt}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <EyeIcon className="w-4 h-4 text-purple-400" />
                      <span>{featuredNews.uniqueViews.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShareIcon className="w-4 h-4 text-purple-400" />
                      <span>{featuredNews.shares.total} shares</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Category & Platform Filters */}
        <div className="mb-12 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 tracking-wider">
              Filter by Category
            </h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/news"
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  !selectedCategory && !selectedPlatform
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                All
              </Link>
              {categories.map((cat: any) => (
                <Link
                  key={cat.category}
                  href={`/news?category=${cat.category}`}
                  className={`px-4 py-2 rounded-full font-medium transition-all capitalize ${
                    selectedCategory === cat.category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {cat.category} ({cat.count})
                </Link>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 tracking-wider">
              Filter by Platform
            </h3>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform: string) => (
                <Link
                  key={platform}
                  href={`/news?platform=${platform}`}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedPlatform === platform
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {platform}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Latest News */}
          <main className="lg:w-2/3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white flex items-center gap-3">
                <NewspaperIcon className="w-8 h-8 text-purple-500" />
                {query
                  ? `Search: "${query}"`
                  : selectedCategory
                  ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                  : selectedPlatform
                  ? selectedPlatform
                  : 'Latest News'}
              </h2>
              <span className="text-gray-400 text-sm font-medium">
                {total} {total === 1 ? 'article' : 'articles'}
              </span>
            </div>

            {news.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {news.map((newsItem: NewsBase) => (
                    <NewsCard key={newsItem._id} news={newsItem} />
                  ))}
                </div>

                {pages > 1 && (
                  <Pagination currentPage={currentPage} totalPages={pages} baseUrl={baseUrl} />
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800">
                <NewspaperIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No news found</p>
                {(query || selectedCategory || selectedPlatform) && (
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
              {trendingNews.length > 0 && (
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <FireIcon className="w-5 h-5 text-orange-500" />
                    Trending Now
                  </h3>
                  <div className="space-y-2">
                    {trendingNews.map((item, index) => (
                      <TrendingNewsItem key={item._id} news={item} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Tags */}
              {tags.length > 0 && (
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-black text-white mb-4">Popular Tags</h3>
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
            </div>
          </aside>
        </div>
      </div>

      {/* Add scroll animation for breaking news */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
