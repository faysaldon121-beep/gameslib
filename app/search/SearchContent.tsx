// app/search/SearchContent.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import GameCard from "@/components/games/GameCard";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";

interface SearchContentProps {
  games: any[];
  total: number;
  currentPage: number;
  totalPages: number;
  query: string;
  currentGenre: string;
  currentPlatform: string;
  currentSort: string;
  genres: string[];
  platforms: string[];
}

export default function SearchContent({
  games,
  total,
  currentPage,
  totalPages,
  query,
  currentGenre,
  currentPlatform,
  currentSort,
  genres,
  platforms,
}: SearchContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── URL Update Helper ──
  const updateURL = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset page when filters change
    if ("genre" in updates || "platform" in updates || "sort" in updates) {
      params.delete("page");
    }

    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (key: string, value: string) => {
    updateURL({ [key]: value || null });
  };

  const clearAllFilters = () => {
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/search");
    }
  };

  const hasActiveFilters = !!currentGenre || !!currentPlatform;
  const hasQuery = query.length > 0;
  const hasResults = games.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-g-text">
          {hasQuery ? `Search Results for "${query}"` : "Search Games"}
        </h1>

        {/* Search Bar */}
        <div className="mb-6 max-w-2xl">
          <SearchBar defaultValue={query} />
        </div>

        {/* Stats + Sort Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {(hasQuery || hasActiveFilters) && (
              <span className="text-g-muted">
                {total.toLocaleString()} game{total !== 1 ? "s" : ""} found
              </span>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-purple-400 hover:text-purple-300 underline"
              >
                Clear filters
              </button>
            )}

            {/* Active filter badges */}
            {currentGenre && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                {currentGenre}
                <button
                  onClick={() => handleFilterChange("genre", "")}
                  className="hover:text-white ml-1"
                >
                  ✕
                </button>
              </span>
            )}
            {currentPlatform && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                {currentPlatform}
                <button
                  onClick={() => handleFilterChange("platform", "")}
                  className="hover:text-white ml-1"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={currentSort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
            className="bg-g-secondary border border-g-border rounded px-3 py-2 text-g-text text-sm"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="rating">Sort: Top Rated</option>
            <option value="popular">Sort: Most Popular</option>
            <option value="newest">Sort: Newest</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Sidebar Filters ── */}
        <aside className="lg:w-1/4">
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Genre Filter */}
            <div className="bg-g-secondary p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-g-text">Genre</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="genre"
                    checked={!currentGenre}
                    onChange={() => handleFilterChange("genre", "")}
                    className="mr-2 accent-purple-500"
                  />
                  <span className="text-g-text group-hover:text-purple-400 transition-colors">
                    All Genres
                  </span>
                </label>
                {genres.map((genre) => (
                  <label key={genre} className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="genre"
                      checked={currentGenre === genre}
                      onChange={() => handleFilterChange("genre", genre)}
                      className="mr-2 accent-purple-500"
                    />
                    <span className="text-g-text group-hover:text-purple-400 transition-colors">
                      {genre}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Platform Filter */}
            <div className="bg-g-secondary p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-g-text">Platform</h3>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="platform"
                    checked={!currentPlatform}
                    onChange={() => handleFilterChange("platform", "")}
                    className="mr-2 accent-purple-500"
                  />
                  <span className="text-g-text group-hover:text-purple-400 transition-colors">
                    All Platforms
                  </span>
                </label>
                {platforms.map((platform) => (
                  <label key={platform} className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="platform"
                      checked={currentPlatform === platform}
                      onChange={() => handleFilterChange("platform", platform)}
                      className="mr-2 accent-purple-500"
                    />
                    <span className="text-g-text group-hover:text-purple-400 transition-colors">
                      {platform}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="lg:w-3/4">
          {/* Games Grid */}
          {hasResults && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {games.map((game: any) => (
                  <GameCard key={game.slug || game._id} game={game} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              )}
            </>
          )}

          {/* No Results */}
          {!hasResults && hasQuery && <NoResults query={query} />}

          {/* Empty State — no query entered */}
          {!hasResults && !hasQuery && !hasActiveFilters && <EmptyState />}
        </main>
      </div>
    </div>
  );
}

// ── No Results ──
function NoResults({ query }: { query: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="text-xl font-semibold text-g-text mb-2">
        No games found for &quot;{query}&quot;
      </h2>
      <p className="text-g-muted mb-6 max-w-md mx-auto">
        Try checking your spelling, using different keywords, or browsing by genre.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/games"
          className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Browse All Games
        </Link>
        <Link
          href="/games?genre=Action"
          className="px-5 py-2.5 bg-g-secondary border border-g-border text-g-text rounded-lg hover:bg-g-border/50 transition-colors"
        >
          Action Games
        </Link>
        <Link
          href="/games?genre=RPG"
          className="px-5 py-2.5 bg-g-secondary border border-g-border text-g-text rounded-lg hover:bg-g-border/50 transition-colors"
        >
          RPG Games
        </Link>
      </div>
    </div>
  );
}

// ── Empty State ──
function EmptyState() {
  const popularSearches = [
    "GTA",
    "Minecraft",
    "Action",
    "Racing",
    "RPG",
    "Simulation",
    "Horror",
    "Open World",
  ];

  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🎮</div>
      <h2 className="text-xl font-semibold text-g-text mb-2">
        What are you looking for?
      </h2>
      <p className="text-g-muted mb-8">
        Type a game name, genre, or developer to start searching.
      </p>
      <div className="max-w-lg mx-auto">
        <p className="text-sm text-g-muted mb-3">Popular searches:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {popularSearches.map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="px-4 py-2 bg-g-secondary border border-g-border text-g-text text-sm
                         rounded-full hover:bg-g-border/50 hover:border-purple-500 transition-all"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
