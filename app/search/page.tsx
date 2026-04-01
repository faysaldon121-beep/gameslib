// app/search/page.tsx
import { searchGames } from "@/lib/search-helpers";
import SearchContent from "./SearchContent";
import { GENRES, PLATFORMS } from "@/lib/utils";
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
    robots: { index: !q, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const genre = typeof searchParams.genre === "string" ? searchParams.genre : undefined;
  const platform = typeof searchParams.platform === "string" ? searchParams.platform : undefined;
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "relevance";
  const page = Math.max(1, parseInt(String(searchParams.page ?? "1")));

  const hasQuery = q.length > 0 || !!genre || !!platform;

  const { games, total, totalPages } = hasQuery
    ? await searchGames({ q: q || undefined, genre, platform, page, sort: sort as any })
    : { games: [], total: 0, totalPages: 0 };

  return (
    <SearchContent
      games={JSON.parse(JSON.stringify(games))}
      total={total}
      currentPage={page}
      totalPages={totalPages}
      query={q}
      currentGenre={genre || ""}
      currentPlatform={platform || ""}
      currentSort={sort}
      genres={[...GENRES]}
      platforms={[...PLATFORMS]}
    />
  );
}
