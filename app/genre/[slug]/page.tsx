import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import Link from "next/link";

function unslug(slug: string) {
  return slug.replace(/-/g, " ");
}
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();

  const genreGuess = unslug(decodeURIComponent(slug));

  // genre: string[]  (array)
  const games = await Game.find({
    genre: { $elemMatch: { $regex: new RegExp(`^${escapeRegex(genreGuess)}$`, "i") } },
  })
    .sort({ createdAt: -1 })
    .limit(48)
    .select("title slug shortDescription coverImage averageRating reviewCount version platforms genre")
    .lean();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold capitalize">{genreGuess}</h1>
          <p className="text-muted-foreground mt-2">{games.length} games</p>
        </div>
        <Link href="/genre" className="text-sm text-blue-400 hover:text-blue-300">All genres →</Link>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {games.map((g: any) => (
          <Link key={g.slug} href={`/games/${g.slug}`} className="group">
            <div className="aspect-[2/3] rounded-xl bg-g-card/40 border border-g-border overflow-hidden" />
            <div className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-blue-400">{g.title}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
