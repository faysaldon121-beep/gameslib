import TrendingClient from "./TrendingClient";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import Blog from "@/models/Blog";
import Topic from "@/models/Topic";

export const metadata = {
  title: "Trending | GamesLib",
  description: "Discover what's trending — top games, blogs, and topics.",
};

async function getTrendingData() {
  await connectDB();

  const [trendingGames, trendingBlogs, trendingTopics] = await Promise.all([
    Game.find({})
      .sort({ views: -1, rating: -1 })
      .limit(12)
      .lean(),
    Blog.find({})
      .sort({ views: -1, likes: -1 })
      .limit(12)
      .lean(),
    Topic.find({})
      .sort({ postsCount: -1, followersCount: -1 })
      .limit(20)
      .lean(),
  ]);

  // Serialize MongoDB _id and dates
  const serialize = (items) =>
    items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt?.toISOString?.() || null,
      updatedAt: item.updatedAt?.toISOString?.() || null,
    }));

  return {
    games: serialize(trendingGames),
    blogs: serialize(trendingBlogs),
    topics: serialize(trendingTopics),
  };
}

export default async function TrendingPage() {
  const { games, blogs, topics } = await getTrendingData();

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-6">
              <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                  clipRule="evenodd"
                />
              </svg>
              Trending Now
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
              What's{" "}
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Hot
              </span>{" "}
              Right Now
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Discover the most popular games, trending blog posts, and hottest
              topics the community is buzzing about.
            </p>
          </div>
        </div>
      </section>

      {/* Trending Content */}
      <TrendingClient games={games} blogs={blogs} topics={topics} />
    </main>
  );
}
