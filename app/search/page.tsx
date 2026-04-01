// app/search/page.tsx
import { searchGames } from "@/lib/search-helpers";
import GameGrid from "@/components/games/GameGrid";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";

  return {
    title: q ? `Search results for "${q}" | GamesLib` : "Search Games | GamesLib",
    description: q
      ? `Find free PC games matching "${q}". Download and play for free.`
      : "Search our complete library of free PC games.",
    alternates: {
      canonical: `https://gameslib.net/search${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    },
    robots: {
      index: !q, // Don't index search result pages with queries
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = Math.max(1, parseInt(String(searchParams.page ?? "1")));
  const genre = typeof searchParams.genre === "string" ? searchParams.genre : undefined;
  const platform = typeof searchParams.platform === "string" ? searchParams.platform : undefined;

  // Only search if there's a query
  const hasQuery = q.length > 0;

  const { games, total, totalPages } = hasQuery
    ? await searchGames({ q, page, genre, platform, sort: "relevance" })
    : { games: [], total: 0, totalPages: 0 };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-g-text">Search Games</h1>
        {hasQuery && (
          <p className="text-g-muted mt-1">
            {total} result{total !== 1 ? "s" : ""} for &quot;{q}&quot;
          </p>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-xl">
        <SearchBar defaultValue={q} />
      </div>

      {/* Results */}
      {hasQuery ? (
        games.length > 0 ? (
          <>
            <GameGrid games={games as any[]} />
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination currentPage={page} totalPages={totalPages} />
              </div>
            )}
          </>
        ) : (
          <NoResults query={q} />
        )
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

// ── No Results Component ──
function NoResults({ query }: { query: string }) {
  return (
    <div className="text-center py-20">
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
          className="px-5 py-2.5 bg-g-accent text-white rounded-lg hover:bg-g-accent/90 transition-colors"
        >
          Browse All Games
        </Link>
        <Link
          href="/games?genre=Action"
          className="px-5 py-2.5 bg-g-card border border-g-border text-g-text rounded-lg hover:bg-g-border/50 transition-colors"
        >
          Action Games
        </Link>
        <Link
          href="/games?genre=RPG"
          className="px-5 py-2.5 bg-g-card border border-g-border text-g-text rounded-lg hover:bg-g-border/50 transition-colors"
        >
          RPG Games
        </Link>
      </div>
    </div>
  );
}

// ── Empty State (no query entered) ──
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

      {/* Popular searches */}
      <div className="max-w-lg mx-auto">
        <p className="text-sm text-g-muted mb-3">Popular searches:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {popularSearches.map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="px-4 py-2 bg-g-card border border-g-border text-g-text text-sm
                         rounded-full hover:bg-g-border/50 hover:border-g-accent transition-all"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
