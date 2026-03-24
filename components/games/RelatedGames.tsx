import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";

export default async function RelatedGames({ genre, currentSlug }: { genre: string; currentSlug: string }) {
  await connectDB();
  const games = await Game.find({ genre, slug: { $ne: currentSlug } })
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(5)
    .select("title slug averageRating")
    .lean();

  if (!games.length) return null;

  return (
    <div className="card p-5">
      <h3 className="font-bold text-g-text mb-4">More {genre} games</h3>
      <div className="space-y-3">
        {games.map((game: any) => (
          <Link key={game.slug} href={`/games/${game.slug}`} className="block rounded-lg border border-g-border px-4 py-3 hover:border-g-purple">
            <div className="font-medium text-g-text">{game.title}</div>
            <div className="text-xs text-g-muted mt-1">Rating: {game.averageRating?.toFixed?.(1) || "0.0"}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
