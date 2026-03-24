import { Suspense } from 'react';
import connectDB from '@/lib/mongodb';
import Genre from '@/models/Genre';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';

async function getGenres() {
  await connectDB();
  return await Genre.find({ isActive: true })
    .sort({ name: 1 })
    .select('name slug description gameCount icon metaTitle metaDescription')
    .lean();
}

export default async function FeaturedGenres() {
  const genres = await getGenres();
  const genreGroups = genres.reduce((acc, genre) => {
    const letter = genre.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(genre);
    return acc;
  }, {} as Record<string, any[]>);

  const grouped = Object.entries(genreGroups).map(([letter, items]) => ({ letter, genres: items }));

  // Schema for homepage genres section
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Featured Game Genres',
    numberOfItems: genres.length,
    itemListElement: genres.slice(0, 20).map((genre: any, index: number) => ({  // Top 20 for schema
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Thing',
        name: genre.name,
        url: `https://gameslib.net/genre/${genre.slug}`,
        description: genre.description,
        image: genre.icon,
      },
    })),
  };

  if (grouped.length === 0) {
    return <div className="py-12 text-center text-gray-400">No genres available.</div>;
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="py-12 bg-g-card/30">
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumbs current="Genres" parents={[{ name: 'Home', href: '/' }]} />
          <div className="text-center mb-8">
            <h2 className="section-title">Featured Genres</h2>
            <p className="section-sub">
              Explore {genres.length} categories with {genres.reduce((sum, g: any) => sum + g.gameCount, 0)} free PC games.
              <Link href="/genres" className="text-blue-400 hover:text-blue-300 ml-2">View All Genres →</Link>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {grouped.map(([letter, genres]) => (
              <div key={letter} className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {letter}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-gray-400">
                    ({genres.reduce((sum: number, g: any) => sum + g.gameCount, 0)} games)
                  </span>
                </div>
                <div className="space-y-2">
                  {genres.slice(0, 5).map((genre: any) => (
                    <Link
                      key={genre.slug}
                      href={`/genre/${genre.slug}`}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-g-card rounded-md transition-colors"
                      title={`${genre.gameCount} ${genre.name.toLowerCase()} games`}
                    >
                      <Image
                        src={genre.icon}
                        alt={`${genre.name} genre icon`}
                        width={16}
                        height={16}
                        className="flex-shrink-0"
                      />
                      <span className="flex-1">{genre.name}</span>
                      <span className="text-xs text-gray-500">({genre.gameCount})</span>
                    </Link>
                  ))}
                  {genres.length > 5 && (
                    <Link href={`/genres?letter=${letter}`} className="block px-3 py-2 text-sm text-blue-400 hover:text-blue-300">
                      +{genres.length - 5} more
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
