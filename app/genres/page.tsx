import connectDB from '@/lib/mongodb';
import Genre from '@/models/Genre';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';

export async function generateMetadata() {
  await connectDB();
  const genres = await Genre.find({ isActive: true }).lean();
  const totalGames = genres.reduce((sum, g: any) => sum + g.gameCount, 0);

  return {
    title: 'All Game Genres - Browse Free PC Games by Category | Gameslib',
    description: `Explore ${genres.length} game genres with ${totalGames.toLocaleString()} free PC downloads. From Action to RPG, find your favorites!`,
    keywords: 'game genres, PC games categories, free downloads by genre, action RPG horror',
    robots: { index: true, follow: true },
    alternates: {
      canonical: 'https://gameslib.net/genres',
    },
    openGraph: {
      title: 'All Game Genres - Gameslib',
      description: `Browse ${genres.length} categories for free PC games.`,
      images: [
        {
          url: '/og/all-genres.jpg',  // 1200x630 banner of genres
          width: 1200,
          height: 630,
          alt: 'All game genres collection',
        },
      ],
      url: 'https://gameslib.net/genres',
      siteName: 'Gameslib',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'All Game Genres - Gameslib',
      description: `Discover free games in every genre.`,
      images: ['/og/all-genres.jpg'],
      site: '@gameslib',
    },
  };
}

async function getAllGenres() {
  await connectDB();
  return await Genre.find({ isActive: true, gameCount: { $gt: 0 } })
    .sort({ name: 1 })
    .select('name slug description gameCount icon metaTitle metaDescription ogImage')
    .lean();
}

export default async function GenresPage() {
  const genres = await getAllGenres();

  if (genres.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0e27] py-12 text-center text-gray-400">
        <p>No genres available. Check back soon!</p>
      </div>
    );
  }

  const totalGames = genres.reduce((sum, g: any) => sum + g.gameCount, 0);

  // Schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Game Genres',
    description: `Browse ${genres.length} game categories with ${totalGames} free PC games.`,
    mainEntity: {
      '@type': 'ItemList',
      name: 'Game Genres Directory',
      numberOfItems: genres.length,
      itemListElement: genres.map((genre: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Thing',
          name: genre.name,
          url: `https://gameslib.net/genre/${genre.slug}`,
          description: genre.description,
          image: genre.ogImage || genre.icon,
        },
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="min-h-screen bg-[#0a0e27] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumbs current="All Genres" parents={[{ name: 'Home', href: '/' }]} />

          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">All Game Genres</h1>
            <p className="text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
              Browse {genres.length} categories covering {totalGames.toLocaleString()} free PC games. 
              Find action, horror, RPG, and more with direct downloads and system requirements.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm mb-8">
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full">Total Games: {totalGames.toLocaleString()}</span>
              <span className="px-3 py-1 bg-green-600 text-white rounded-full">Free Downloads</span>
              <span className="px-3 py-1 bg-purple-600 text-white rounded-full">Pre-Installed</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {genres.map((genre: any) => (
              <Link 
                key={genre.slug} 
                href={`/genre/${genre.slug}`} 
                className="group relative p-6 bg-g-card rounded-xl border border-g-border hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden"
                title={`Browse ${genre.gameCount} free ${genre.name.toLowerCase()} games`}
              >
                {/* Hover overlay for engagement */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image
                  src={genre.icon || '/icons/genres/default.svg'}
                  alt={`${genre.name} genre icon - Free PC games`}
                  width={48}
                  height={48}
                  className="mx-auto mb-4 opacity-80 group-hover:opacity-100 transition-opacity relative z-10"
                  priority={false}
                />
                <h3 className="text-lg font-semibold text-white text-center mb-2 relative z-10">{genre.name}</h3>
                <p className="text-gray-400 text-center text-sm mb-4 leading-relaxed relative z-10 line-clamp-2">
                  {genre.description}
                </p>
                <div className="flex justify-center relative z-10">
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-medium">
                    {genre.gameCount.toLocaleString()} Games
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Internal Links Section */}
          <section className="mt-12 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Popular Genres</h2>
            <p className="text-gray-400 mb-6">Start with these top categories for free PC games.</p>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
              {genres
                .sort((a: any, b: any) => b.gameCount - a.gameCount)
                .slice(0, 8)
                .map((genre: any) => (
                  <Link
                    key={genre.slug}
                    href={`/genre/${genre.slug}`}
                    className="px-4 py-2 bg-g-card/50 hover:bg-g-card text-gray-300 rounded-md text-sm transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
