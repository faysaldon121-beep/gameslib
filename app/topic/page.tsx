// app/topic/page.tsx
import { Metadata } from "next";
import connectDB from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import Game from "@/models/Game"; // Ensure you have your Game model path correct
import Link from "next/link";
import Image from "next/image";

interface Props {
  searchParams: { s?: string };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const topic = searchParams.s || "all";
  return {
    title: `Topic: ${topic.replace(/-/g, " ").toUpperCase()} | Gameslib`,
    description: `Explore the latest news, games, and updates about ${topic.replace(/-/g, " ")} on Gameslib.`,
  };
}

export default async function TopicPage({ searchParams }: Props) {
  const topicSlug = searchParams.s || "";
  
  await connectDB();

  // Create a case-insensitive regex to match the topic slug across categories and tags
  const topicRegex = new RegExp(topicSlug.replace(/-/g, " "), "i");

  // Fetch related blog posts
  const posts = await BlogPost.find({
    isPublished: true,
    $or: [
      { tags: { $in: [topicRegex] } },
      { category: topicRegex },
      { title: topicRegex },
      { "seo.focusKeyword": topicRegex }
    ]
  })
  .sort({ publishedAt: -1 })
  .limit(20)
  .lean();

  // Fetch related games
  const games = await Game.find({
    $or:[
      { title: topicRegex },
      { genres: { $in: [topicRegex] } }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-g-bg">
      <header className="mb-12 border-b border-g-border pb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 capitalize">
          {topicSlug ? topicSlug.replace(/-/g, " ") : "All Topics"}
        </h1>
        <p className="text-g-muted text-lg">
          Discover all the latest news, articles, and games related to {topicSlug.replace(/-/g, " ")}.
        </p>
      </header>

      <div className="space-y-16">
        {/* Blog Posts Section */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="bg-purple-600 w-2 h-6 rounded"></span>
            Latest News & Articles
          </h2>
          {posts.length === 0 ? (
            <p className="text-g-muted bg-g-secondary p-6 rounded-lg border border-g-border">
              No articles found for this topic.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: any) => (
                <Link href={`/blog/${post.slug}`} key={post._id} className="bg-g-secondary rounded-lg overflow-hidden border border-g-border hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all block group">
                  <div className="relative h-48 w-full overflow-hidden bg-black">
                    <Image 
                      src={post.featuredImage || "/placeholder.jpg"} 
                      alt={post.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 block">
                      {post.category}
                    </span>
                    <h3 className="text-lg font-bold text-g-text mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-g-muted text-sm line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Games Section */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="bg-blue-500 w-2 h-6 rounded"></span>
            Related Games
          </h2>
          {games.length === 0 ? (
            <p className="text-g-muted bg-g-secondary p-6 rounded-lg border border-g-border">
              No games found for this topic.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {games.map((game: any) => (
                <Link href={`/games/${game.slug}`} key={game._id} className="bg-g-secondary rounded-lg overflow-hidden border border-g-border hover:border-blue-500 transition-all block group">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                    <Image 
                      src={game.coverImage || "/placeholder.jpg"} 
                      alt={game.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-g-text truncate group-hover:text-blue-400">
                      {game.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
