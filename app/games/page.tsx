import { Suspense } from "react";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import GameGrid from "@/components/games/GameGrid";
import GameFilter from "@/components/games/GameFilter";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import { GENRES, PLATFORMS } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Games",
  description: "Browse our complete library of free PC games. Filter by genre, platform, and more.",
  alternates: { canonical: "https://gameslib.net/games" },
};

const PAGE_SIZE = 18;

async function getGames(searchParams: Record<string, string | string[] | undefined>) {
  await connectDB();
  const page = Math.max(1, parseInt(String(searchParams.page ?? "1")));
  const skip = (page - 1) * PAGE_SIZE;
  const filter: Record<string, any> = {};
  const genre = typeof searchParams.genre === "string" ? searchParams.genre : undefined;
  const platform = typeof searchParams.platform === "string" ? searchParams.platform : undefined;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  if (genre) filter.genre = genre;
  if (platform) filter.platforms = platform;
  if (q) filter.$text = { $search: q };

  const [games, total] = await Promise.all([
    Game.find(filter)
      .sort(q ? { score: { $meta: "textScore" } } : { isFeatured: -1, averageRating: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .select("title slug shortDescription coverImage genre averageRating reviewCount version platforms isFeatured")
      .lean(),
    Game.countDocuments(filter),
  ]);

  return { games, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export default async function GamesPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { games, total, page, totalPages } = await getGames(searchParams);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-g-text">Game Library</h1>
        <p className="text-g-muted mt-1">{total} games available for free download</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-60 shrink-0">
          <GameFilter genres={[...GENRES]} platforms={[...PLATFORMS]} />
        </aside>
        <div className="flex-1 min-w-0">
          <div className="mb-6"><SearchBar /></div>
          <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-video skeleton rounded-xl" />)}</div>}>
            {games.length > 0 ? (
              <>
                <GameGrid games={games as any[]} />
                {totalPages > 1 && <div className="mt-8"><Pagination currentPage={page} totalPages={totalPages} /></div>}
              </>
            ) : (
              <div className="text-center py-20 text-g-muted">
                <p className="text-xl mb-2">No games found</p>
                <p className="text-sm">Try adjusting your filters or search term</p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
