import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import GameGrid from "@/components/games/GameGrid";
import { GENRES } from "@/lib/utils";

export async function generateStaticParams() {
  return GENRES.map((genre) => ({ genre: genre.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: { genre: string } }): Promise<Metadata> {
  const genre = GENRES.find((g) => g.toLowerCase() === params.genre);
  if (!genre) return { title: "Genre Not Found" };
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.net";
  return {
    title: `Free ${genre} Games Download`,
    description: `Download the best free ${genre} games for PC. Browse our collection with direct links, system requirements, and installation guides.`,
    alternates: { canonical: `${base}/games/genre/${params.genre}` },
    openGraph: { title: `Free ${genre} Games | Gameslib`, description: `Download the best free ${genre} games for PC.`, url: `${base}/games/genre/${params.genre}` },
  };
}

const GENRE_DESCRIPTIONS: Record<string, string> = {
  action: "High-octane action games that demand quick reflexes and split-second decisions.",
  rpg: "Role-playing games with deep storylines and character progression systems.",
  strategy: "Strategy games that challenge your tactical thinking.",
  sports: "Sports simulations and arcade titles covering football, basketball, racing, and more.",
  horror: "Survival horror, psychological thrillers, and atmospheric terror.",
  simulation: "Life simulators, city builders, flight sims, and farming games.",
  adventure: "Story-driven adventure games with exploration and rich narrative worlds.",
  puzzle: "Brain-teasing puzzle games that reward logical thinking.",
  racing: "High-speed racing titles from realistic simulators to arcade-style kart racers.",
  shooter: "First and third-person shooters across all settings.",
};

export default async function GenrePage({ params }: { params: { genre: string } }) {
  const genre = GENRES.find((g) => g.toLowerCase() === params.genre);
  if (!genre) notFound();
  await connectDB();
  const games = await Game.find({ genre }).sort({ isFeatured: -1, averageRating: -1 }).limit(30).select("title slug shortDescription coverImage genre averageRating reviewCount version platforms isFeatured").lean();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.net";
  const collectionSchema = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: `Free ${genre} Games`, description: GENRE_DESCRIPTIONS[params.genre] ?? `Free ${genre} games download.`, url: `${base}/games/genre/${params.genre}`, numberOfItems: games.length,
    hasPart: games.slice(0, 10).map((g: any) => ({ '@type': 'SoftwareApplication', name: g.title, url: `${base}/games/${g.slug}`, applicationCategory: 'Game' }))
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-2 text-sm text-g-muted mb-6"><Link href="/" className="hover:text-g-purple">Home</Link><span>/</span><Link href="/games" className="hover:text-g-purple">Games</Link><span>/</span><span className="text-g-text">{genre}</span></nav>
        <h1 className="text-3xl font-bold text-g-text mb-2">Free {genre} Games</h1>
        <p className="text-g-muted max-w-2xl mb-8 leading-relaxed">{GENRE_DESCRIPTIONS[params.genre] ?? `Browse and download free ${genre} games.`}</p>
        {games.length > 0 ? <GameGrid games={games as any[]} /> : <p className="text-g-muted text-center py-20">No {genre} games yet. Check back soon!</p>}
      </div>
    </>
  );
}
