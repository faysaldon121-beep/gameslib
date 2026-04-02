"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Icons ───────────────────────────────────────────
function FireIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EyeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function HeartIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StarIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function HashIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  );
}

function ArrowUpIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  );
}

// ─── Tab Definitions ─────────────────────────────────
const TABS = [
  { key: "games", label: "Games", icon: "🎮" },
  { key: "blogs", label: "Blogs", icon: "📝" },
  { key: "topics", label: "Topics", icon: "🔥" },
];

const TIME_FILTERS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
];

// ─── Helper ──────────────────────────────────────────
function formatCount(num) {
  if (!num) return "0";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
  if (seconds < 604800) return Math.floor(seconds / 86400) + "d ago";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getRankBadge(index) {
  if (index === 0) return { text: "#1", bg: "bg-yellow-500", shadow: "shadow-yellow-500/30" };
  if (index === 1) return { text: "#2", bg: "bg-gray-300", shadow: "shadow-gray-300/30" };
  if (index === 2) return { text: "#3", bg: "bg-amber-700", shadow: "shadow-amber-700/30" };
  return { text: `#${index + 1}`, bg: "bg-white/10", shadow: "" };
}

// ─── Game Card ───────────────────────────────────────
function GameCard({ game, index }) {
  const rank = getRankBadge(index);
  const imageUrl = game.image || game.thumbnail || game.coverImage || "/placeholder-game.jpg";

  return (
    <Link
      href={`/games/${game.slug || game._id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1"
    >
      {/* Rank badge */}
      <div className={`absolute top-3 left-3 z-10 ${rank.bg} ${rank.shadow} shadow-lg text-black font-black text-xs px-2.5 py-1 rounded-lg`}>
        {rank.text}
      </div>

      {/* Trending indicator */}
      {index < 3 && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-orange-500/90 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-lg">
          <FireIcon className="w-3 h-3" />
          HOT
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
        <Image
          src={imageUrl}
          alt={game.title || "Game"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-60" />
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-bold text-sm sm:text-base line-clamp-1 group-hover:text-purple-300 transition-colors">
            {game.title}
          </h3>
          {game.rating != null && (
            <span className="flex items-center gap-0.5 text-yellow-400 text-xs font-semibold shrink-0">
              <StarIcon className="w-3.5 h-3.5" />
              {Number(game.rating).toFixed(1)}
            </span>
          )}
        </div>

        {game.genre && (
          <span className="inline-block self-start text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-3">
            {Array.isArray(game.genre) ? game.genre[0] : game.genre}
          </span>
        )}

        <p className="text-gray-500 text-xs line-clamp-2 mb-3 flex-1">
          {game.description || "No description available."}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3">
          <span className="flex items-center gap-1">
            <EyeIcon className="w-3.5 h-3.5" />
            {formatCount(game.views)}
          </span>
          {game.platform && (
            <span className="text-gray-600">
              {Array.isArray(game.platform) ? game.platform.join(", ") : game.platform}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Blog Card ───────────────────────────────────────
function BlogCard({ blog, index }) {
  const rank = getRankBadge(index);
  const imageUrl = blog.image || blog.thumbnail || blog.coverImage || "/placeholder-blog.jpg";

  return (
    <Link
      href={`/blogs/${blog.slug || blog._id}`}
      className="group relative flex flex-col sm:flex-row rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5"
    >
      {/* Rank */}
      <div className={`absolute top-3 left-3 z-10 ${rank.bg} ${rank.shadow} shadow-lg text-black font-black text-xs px-2.5 py-1 rounded-lg`}>
        {rank.text}
      </div>

      {/* Image */}
      <div className="relative w-full sm:w-56 lg:w-64 aspect-[16/10] sm:aspect-auto shrink-0 overflow-hidden bg-white/5">
        <Image
          src={imageUrl}
          alt={blog.title || "Blog post"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 256px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0f]/40 hidden sm:block" />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {blog.category && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {blog.category}
              </span>
            )}
            <span className="text-gray-600 text-[11px]">{timeAgo(blog.createdAt)}</span>
          </div>

          <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg line-clamp-2 group-hover:text-cyan-300 transition-colors mb-2">
            {blog.title}
          </h3>

          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2">
            {blog.excerpt || blog.description || blog.content?.substring(0, 150) || "No preview available."}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-3">
            {blog.author && (
              <span className="text-xs text-gray-400 font-medium">
                By{" "}
                <span className="text-gray-300">
                  {typeof blog.author === "string" ? blog.author : blog.author.name || "Unknown"}
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <EyeIcon className="w-3.5 h-3.5" />
              {formatCount(blog.views)}
            </span>
            <span className="flex items-center gap-1 text-red-400/60">
              <HeartIcon className="w-3.5 h-3.5" />
              {formatCount(blog.likes)}
            </span>
          </div>
        </div>
      </div>

      {/* Hot strip for top 3 */}
      {index < 3 && (
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-orange-500 via-red-500 to-pink-500 sm:block hidden" />
      )}
    </Link>
  );
}

// ─── Topic Pill / Row ────────────────────────────────
function TopicCard({ topic, index }) {
  const rank = getRankBadge(index);
  const trendPercent = topic.trendPercent || Math.floor(Math.random() * 80 + 20);

  return (
    <Link
      href={`/topics/${topic.slug || topic._id}`}
      className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-orange-500/30 hover:bg-white/[0.05] transition-all duration-200"
    >
      {/* Rank */}
      <div className={`${rank.bg} ${rank.shadow} shadow-md text-black font-black text-xs w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
        {rank.text}
      </div>

      {/* Hash icon */}
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/10 flex items-center justify-center shrink-0">
        <HashIcon className="w-5 h-5 text-orange-400" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-sm group-hover:text-orange-300 transition-colors truncate">
          {topic.name || topic.title}
        </h3>
        <p className="text-gray-500 text-xs mt-0.5">
          {formatCount(topic.postsCount || topic.posts)} posts ·{" "}
          {formatCount(topic.followersCount || topic.followers)} followers
        </p>
      </div>

      {/* Trend indicator */}
      <div className="flex items-center gap-1 text-green-400 text-xs font-bold shrink-0">
        <ArrowUpIcon className="w-3.5 h-3.5" />
        {trendPercent}%
      </div>
    </Link>
  );
}

// ─── Empty State ─────────────────────────────────────
function EmptyState({ tab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <span className="text-3xl">{tab === "games" ? "🎮" : tab === "blogs" ? "📝" : "🔥"}</span>
      </div>
      <h3 className="text-white font-semibold text-lg mb-1">
        No trending {tab} yet
      </h3>
      <p className="text-gray-500 text-sm max-w-sm">
        Check back soon — we're always tracking what's popular in the community.
      </p>
    </div>
  );
}

// ─── Stats Banner ────────────────────────────────────
function StatsBanner({ games, blogs, topics }) {
  const stats = [
    { label: "Trending Games", value: games.length, icon: "🎮", color: "text-purple-400" },
    { label: "Hot Blogs", value: blogs.length, icon: "📝", color: "text-cyan-400" },
    { label: "Active Topics", value: topics.length, icon: "🔥", color: "text-orange-400" },
    {
      label: "Total Views",
      value: formatCount(
        [...games, ...blogs].reduce((sum, i) => sum + (i.views || 0), 0)
      ),
      icon: "👁",
      color: "text-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
        >
          <span className="text-2xl">{s.icon}</span>
          <div>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Main Client Component
// ═══════════════════════════════════════════════════════
export default function TrendingClient({ games = [], blogs = [], topics = [] }) {
  const [activeTab, setActiveTab] = useState("games");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter data by search
  const filteredGames = useMemo(
    () =>
      games.filter((g) =>
        (g.title || "").toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [games, searchQuery]
  );

  const filteredBlogs = useMemo(
    () =>
      blogs.filter((b) =>
        (b.title || "").toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [blogs, searchQuery]
  );

  const filteredTopics = useMemo(
    () =>
      topics.filter((t) =>
        ((t.name || t.title) || "").toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [topics, searchQuery]
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Stats */}
      <StatsBanner games={games} blogs={blogs} topics={topics} />

      {/* Tabs + Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        {/* Tab buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-white/10 text-white shadow-lg shadow-white/5"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search + time filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Time filter dropdown */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500/50 appearance-none cursor-pointer"
          >
            {TIME_FILTERS.map((t) => (
              <option key={t.key} value={t.key} className="bg-[#1a1a2e]">
                {t.label}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-lg pl-10 pr-4 py-2.5 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
          </div>
        </div>
      </div>

      {/* ─── GAMES TAB ─────────────────────── */}
      {activeTab === "games" && (
        <>
          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredGames.map((game, i) => (
                <GameCard key={game._id} game={game} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState tab="games" />
          )}
        </>
      )}

      {/* ─── BLOGS TAB ─────────────────────── */}
      {activeTab === "blogs" && (
        <>
          {filteredBlogs.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredBlogs.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState tab="blogs" />
          )}
        </>
      )}

      {/* ─── TOPICS TAB ────────────────────── */}
      {activeTab === "topics" && (
        <>
          {filteredTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTopics.map((topic, i) => (
                <TopicCard key={topic._id} topic={topic} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState tab="topics" />
          )}
        </>
      )}

      {/* Load more */}
      <div className="flex justify-center mt-12">
        <button className="group flex items-center gap-2 px-8 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-sm font-medium hover:text-white hover:border-purple-500/30 hover:bg-white/[0.06] transition-all duration-200">
          Load More
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-y-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
