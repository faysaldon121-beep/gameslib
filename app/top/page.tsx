// app/top/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';

import connectDB from '@/lib/mongodb';
import Game from '@/models/Game';
import GameGrid from '@/components/games/GameGrid';

export const metadata: Metadata = {
  title: 'Top-Rated Games',
  description:
    'Highest-rated free PC games on Gameslib, ranked by user reviews.',
  alternates: { canonical: 'https://gameslib.net/top' }
};

// revalidate once an hour (same as home page)
export const revalidate = 3600;

// How many games per page you want to show
const PAGE_SIZE = 18;

async function getTopGames(page = 1) {
  await connectDB();
  const skip = (page - 1) * PAGE_SIZE;

  const [games, total] = await Promise.all([
    Game.find()
      .sort({ averageRating: -1, reviewCount: -1 }) // primary & tie-breaker
      .skip(skip)
      .limit(PAGE_SIZE)
      .select(
        'title slug shortDescription coverImage genre averageRating reviewCount version platforms'
      )
      .lean(),
    Game.countDocuments()
  ]);

  return { games, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export default async function TopPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const page = Math.max(1, parseInt(String(searchParams.page ?? '1')));
  const { games, total, totalPages } = await getTopGames(page);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-g-text">Top Games</h1>
        <p className="text-g-muted mt-1">
          {total} titles sorted by rating
        </p>
      </header>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video skeleton rounded-xl" />
            ))}
          </div>
        }
      >
        {games.length ? (
          <GameGrid games={games as any[]} />
        ) : (
          <p className="text-center text-g-muted py-20">
            No games found
          </p>
        )}
      </Suspense>

      {/* (optional) add your Pagination component exactly like /games */}
      {/* {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} />} */}
    </div>
  );
}
