import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import Link from "next/link";

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export default async function GenresIndexPage() {
  await connectDB();

  // If genre is an array of strings, distinct('genre') works well.
  const genres = (await Game.distinct("genre")).filter(Boolean).sort();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold">Genres</h1>
      <p className="text-muted-foreground mt-2">Browse games by genre.</p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {genres.map((g: string) => (
          <Link
            key={g}
            href={`/genre/${slugify(g)}`}
            className="rounded-lg border border-g-border bg-g-card/40 hover:bg-g-card/70 px-3 py-2 text-sm"
          >
            {g}
          </Link>
        ))}
      </div>
    </main>
  );
}
