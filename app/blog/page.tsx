import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import BlogSearchBar from '@/components/blog/BlogSearchBar';
import BlogCategories from '@/components/blog/BlogCategories';
import Pagination from '@/components/ui/Pagination';
import { CalendarDaysIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Gaming Blog | Latest Gaming News, Reviews & Tutorials | Gameslib',
  description: 'Stay updated with the latest gaming news, in-depth game reviews, tutorials, and industry insights. Your ultimate source for gaming content.',
  keywords: 'gaming blog, game reviews, gaming bible, game news, gaming news, gaming tutorials, PC games, game guides',
  openGraph: {
    title: 'Gaming Blog | GameHub',
    description: 'Latest gaming news, reviews, and tutorials',
    type: 'website',
    url: 'https://gameslib.vercel.app/blog'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gaming Blog | GameHub',
    description: 'Latest gaming news, reviews, and tutorials'
  },
  alternates: {
    types: {
      'application/rss+xml': [
        {
          title: 'GameHub Blog RSS Feed',
          url: '/blog/rss.xml'
        }
      ]
    }
  }
};

type BlogPostSummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  readingTime: number;
  views: number; // Added views
  publishedAt?: Date | string;
  author: {
    name: string;
    avatar?: string;
  };
  tags: string[];
};

interface SearchParams {
  category?: string;
  tag?: string;
  page?: string;
  q?: string;
}

const POSTS_PER_PAGE = 12;

async function getBlogData(searchParams: SearchParams) {
  try {
    await connectDB();
    
    const page = parseInt(searchParams.page || '1');
    const skip = (page - 1) * POSTS_PER_PAGE;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isPublished: true };
    
    if (searchParams.category) {
      query.category = searchParams.category;
    }
    
    if (searchParams.tag) {
      query.tags = { $in: [searchParams.tag] };
    }
    
    if (searchParams.q) {
      query.$text = { $search: searchParams.q };
    }
    
    const [posts, totalPosts, categories, popularTags, featuredPost] = await Promise.all([
      BlogPost.find(query)
        .sort({ isFeatured: -1, publishedAt: -1 })
        .skip(skip)
        .limit(POSTS_PER_PAGE)
        .lean<BlogPostSummary[]>(),
      
      BlogPost.countDocuments(query),
      
      BlogPost.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      BlogPost.aggregate([
        { $match: { isPublished: true } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      BlogPost.findOne({ isPublished: true, isFeatured: true })
        .sort({ publishedAt: -1 })
        .lean<BlogPostSummary | null>()
    ]);
    
    return {
      // Lean documents can be cleanly passed to Client Components, 
      // but wrapping in JSON parse/stringify guarantees no raw MongoDB objects slip through
      posts: JSON.parse(JSON.stringify(posts || [])) as BlogPostSummary[],
      featuredPost: featuredPost ? (JSON.parse(JSON.stringify(featuredPost)) as BlogPostSummary) : null,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / POSTS_PER_PAGE),
      categories: categories.map(cat => ({ name: String(cat._id), count: Number(cat.count) })),
      popularTags: popularTags.map(tag => ({ name: String(tag._id), count: Number(tag.count) }))
    };
    
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return {
      posts: [] as BlogPostSummary[],
      featuredPost: null,
      totalPosts: 0,
      currentPage: 1,
      totalPages: 0,
      categories: [],
      popularTags: []
    };
  }
}

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const {
    posts,
    featuredPost,
    totalPosts,
    currentPage,
    totalPages,
    categories,
    popularTags
  } = await getBlogData(searchParams);

  return (
    <div className="min-h-screen bg-g-bg">
      <section className="bg-gradient-to-r from-purple-900 to-blue-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Gaming Blog
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Latest gaming news, reviews, and insights from the world of PC gaming
          </p>
          <BlogSearchBar />
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {featuredPost && !searchParams.q && !searchParams.category && currentPage === 1 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-g-text">Featured Post</h2>
            <div className="bg-g-secondary rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <Image
                    src={featuredPost.featuredImage}
                    alt={featuredPost.title}
                    width={600}
                    height={400}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <span className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {featuredPost.category}
                  </span>
                  <h3 className="text-2xl font-bold mb-4 text-g-text">
                    <Link 
                      href={`/blog/${featuredPost.slug}`}
                      className="hover:text-purple-400 transition-colors"
                    >
                      {featuredPost.title}
                    </Link>
                  </h3>
                  <p className="text-g-muted mb-6">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-g-muted">
                    <div className="flex items-center gap-1">
                      <CalendarDaysIcon className="w-4 h-4" />
                      {/* Fixed: Provide fallback date to prevent undefined error */}
                      {new Date(featuredPost.publishedAt || Date.now()).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {featuredPost.readingTime} min read
                    </div>
                    <div className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      {featuredPost.views || 0} views
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          <main className="lg:w-2/3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-g-text">
                {searchParams.q
                  ? `Search Results for "${searchParams.q}"`
                  : searchParams.category
                  ? `Category: ${searchParams.category}`
                  : searchParams.tag
                  ? `Tag: ${searchParams.tag}`
                  : 'Latest Posts'}
              </h2>
              <span className="text-g-muted">
                {totalPosts} posts found
              </span>
            </div>

            {posts.length > 0 ? (
              <>
                <div className="grid gap-8 mb-12">
                  {posts.map((post: BlogPostSummary) => (
                    <article key={post._id} className="bg-g-secondary rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            width={300}
                            height={200}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                              {post.category}
                            </span>
                            {post.tags.slice(0, 2).map((tag: string) => (
                              <Link
                                key={tag}
                                href={`/blog?tag=${encodeURIComponent(tag)}`}
                                className="text-purple-400 hover:text-purple-300 text-xs"
                              >
                                #{tag}
                              </Link>
                            ))}
                          </div>
                          
                          <h3 className="text-xl font-bold mb-3 text-g-text">
                            <Link 
                              href={`/blog/${post.slug}`}
                              className="hover:text-purple-400 transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h3>
                          
                          <p className="text-g-muted mb-4 line-clamp-2">{post.excerpt}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-g-muted">
                              <div className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-4 h-4" />
                                {/* Fixed: Provide fallback date to prevent undefined error */}
                                {new Date(post.publishedAt || Date.now()).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {post.readingTime} min read
                              </div>
                              <div className="flex items-center gap-1">
                                <EyeIcon className="w-4 h-4" />
                                {post.views || 0} views
                              </div>
                            </div>
                            
                            <Link
                              href={`/blog/${post.slug}`}
                              className="text-purple-400 hover:text-purple-300 font-medium text-sm"
                            >
                              Read More →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-g-muted text-lg">No blog posts found</p>
              </div>
            )}
          </main>

          <aside className="lg:w-1/3">
            <div className="space-y-8">
              <BlogCategories categories={categories} />
              
              <div className="bg-g-secondary p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4 text-g-text">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Link
                      key={tag.name}
                      href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                      className="bg-g-border hover:bg-purple-600 hover:text-white px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      #{tag.name} ({tag.count})
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-lg text-white">
                <h3 className="text-lg font-bold mb-3">Stay Updated</h3>
                <p className="text-purple-100 mb-4 text-sm">
                  Get the latest gaming news and reviews delivered to your inbox.
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-3 py-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:bg-white/30"
                  />
                  <button
                    type="submit"
                    className="w-full bg-white text-purple-600 font-medium py-2 px-4 rounded hover:bg-purple-50 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 300;
