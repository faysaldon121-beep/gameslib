import { Suspense } from "react";
import { searchGames } from "@/lib/search-helpers";
import GameGrid from "@/components/games/GameGrid";
import GameFilter from "@/components/games/GameFilter";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import SortSelect from "@/components/ui/SortSelect";
import { GENRES, PLATFORMS } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Games | GamesLib",
  description:
    "Browse our complete library of free PC games. Filter by genre, platform, and more.",
  alternates: { canonical: "https://gameslib.net/games" },
};

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function GamesPage({ searchParams }: PageProps) {
  const q =
    typeof searchParams.q === "string" ? searchParams.q.trim() : undefined;
  const genre =
    typeof searchParams.genre === "string" ? searchParams.genre : undefined;
  const platform =
    typeof searchParams.platform === "string"
      ? searchParams.platform
      : undefined;
  const page = Math.max(1, parseInt(String(searchParams.page ?? "1")));
  const sort = (searchParams.sort as any) || "relevance";

  const { games, total, totalPages } = await searchGames({
    q,
    genre,
    platform,
    page,
    sort,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-g-text">Game Library</h1>
        <p className="text-g-muted mt-1">
          {total} game{total !== 1 ? "s" : ""}{" "}
          {q ? `found for "${q}"` : "available for free download"}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-60 shrink-0">
          <GameFilter genres={[...GENRES]} platforms={[...PLATFORMS]} />
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Search + Sort Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar defaultValue={q} />
            </div>
            <SortSelect currentSort={sort} />
          </div>

          {/* Results */}
          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-video skeleton rounded-xl" />
                ))}
              </div>
            }
          >
            {games.length > 0 ? (
              <>
                <GameGrid games={games as any[]} />
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination currentPage={page} totalPages={totalPages} />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-g-muted">
                <p className="text-xl mb-2">No games found</p>
                <p className="text-sm">
                  Try adjusting your filters or search term
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
