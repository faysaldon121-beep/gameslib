import { Suspense } from 'react';
import connectDB from '@/lib/mongodb';
import Genre from '@/models/Genre';
import Game from '@/models/Game';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

// Define the Genre type
interface IGenre {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  isActive?: boolean;
  gameCount?: number;
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: { page?: string };
}

async function getGenreData({ genreSlug, page }: { genreSlug: string; page?: number }) {
  await connectDB();

  // Cast the result to IGenre | null
  const genre = (await Genre.findOne({ slug: genreSlug, isActive: true }).lean()) as IGenre | null;
  if (!genre) return null;

  const total = await Game.countDocuments({ genre: { $regex: genre.name, $options: 'i' } });

  let games: any[] = [];
  let hasMore = false;

  if (page !== undefined) {
    const limit = 24;
    const skip = (page - 1) * limit;
    games = await Game.find({ genre: { $regex: genre.name, $options: 'i' } })
      .sort({ averageRating: -1 })
      .select('title slug coverImage genre averageRating reviewCount year size shortDescription')
      .limit(limit)
      .skip(skip)
      .lean();

    hasMore = skip + games.length < total;
  }

  const ogImage = games[0]?.coverImage || genre.ogImage;

  return { genre, games, total, ogImage, page, hasMore };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getGenreData({ genreSlug: slug }); // only fetch genre data, not games
  if (!data?.genre) {
    return {
      title: 'Genre Not Found - Gameslib',
      description: 'Page not found. Explore our free PC games library.',
    };
  }

  const { genre, total, ogImage } = data;
  const keyword = `${genre.name.toLowerCase()} games`;
  const countStr = total > 0 ? `${total.toLocaleString()}+ ` : '';

  return {
    title: genre.metaTitle || `${genre.name} Games - Free PC Downloads | Gameslib`,
    description: genre.metaDescription || `${countStr}free ${keyword} for PC. Pre-installed downloads with system requirements. Play top titles now!`,
    keywords: `${keyword}, free PC games, ${genre.name} download, portable games`,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://gameslib.net/genre/${slug}`,
    },
    openGraph: {
      title: genre.metaTitle || `${genre.name} Games - Gameslib`,
      description: genre.metaDescription || `Free ${keyword} downloads. ${total} titles available.`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${genre.name} games collection`,
        },
      ],
      url: `https://gameslib.net/genre/${slug}`,
      siteName: 'Gameslib',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: genre.metaTitle || `${genre.name} Games - Gameslib`,
      description: genre.metaDescription || `Free ${keyword} downloads.`,
      images: [ogImage],
      site: '@gameslib', // Replace with your actual handle
    },
  };
}

export async function generateStaticParams() {
  await connectDB();
  const genres = (await Genre.find({ isActive: true, gameCount: { $gt: 0 } })
    .select('slug')
    .lean()) as { slug: string }[];
  return genres.map((genre) => ({ slug: genre.slug }));
}

export const revalidate = 3600; // ISR

export default async function GenrePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const page = parseInt(searchParams?.page || '1', 10);
  const data = await getGenreData({ genreSlug: slug, page });

  if (!data?.genre) notFound();

  const { genre, games, total, ogImage, hasMore } = data;

  // Fetch related genres (top 6 by gameCount, excluding current)
  const relatedGenres = (await Genre.find({
    isActive: true,
    slug: { $ne: slug },
    gameCount: { $gt: 0 },
  })
    .sort({ gameCount: -1 })
    .limit(6)
    .select('slug name gameCount')
    .lean()) as { slug: string; name: string; gameCount: number }[];

  // Enhanced Schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${genre.name} Games`,
    description: genre.description,
    mainEntity: {
      '@type': 'ItemList',
      name: `${genre.name} Games Collection`,
      numberOfItems: total,
      itemListElement: games.map((game: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: game.title,
          url: `https://gameslib.net/game/${game.slug}`,
          image: game.coverImage,
          description: game.shortDescription,
          genre: game.genre,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="min-h-screen bg-[#0a0e27] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumbs
            current={genre.name}
            parents={[
              { name: 'Genres', href: '/genres' },
              { name: 'Home', href: '/' },
            ]}
          />

          {/* Hero Section */}
          <div className="text-center mb-12">
            <Image
              src={genre.icon || '/icons/genres/default.svg'}
              alt={`${genre.name} genre icon`}
              width={64}
              height={64}
              className="mx-auto mb-4 opacity-80"
              priority
            />
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 capitalize">
              {genre.name}
            </h1>
            <p className="text-gray-400 max-w-3xl mx-auto mb-6 leading-relaxed">
              {genre.description}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Showing {games.length} of {total.toLocaleString()} {genre.name.toLowerCase()} games • Page{' '}
              {page}
            </p>
            <Link
              href={`/genre/${slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
            >
              Download Top {genre.name} Games
            </Link>
          </div>

          {/* Games Grid */}
          <Suspense
            fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 h-96">
                <div className="aspect-[2/3] bg-g-card rounded-lg skeleton" />
              </div>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {games.map((game: any) => (
                <Link
                  key={game.slug}
                  href={`/game/${game.slug}`}
                  className="group relative block"
                  title={`Download ${game.title} - Free ${genre.name} PC Game`}
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-g-card">
                    <Image
                      src={game.coverImage}
                      alt={`${game.title} poster - ${genre.name} game`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16.67vw"
                    />
                    <div className="absolute top-2 right-2 bg-yellow-500 px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {game.averageRating.toFixed(1)}★
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-sm font-medium text-white line-clamp-2">{game.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{game.year} • {game.size}</p>
                    <div className="flex items-center gap-1 text-xs text-yellow-400 mt-1">
                      <span>{game.averageRating.toFixed(1)}</span>
                      <span className="text-gray-500">({game.reviewCount} reviews)</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Suspense>

          {/* Pagination */}
          {hasMore && (
            <div className="text-center mb-8">
              <Link
                href={`/genre/${slug}?page=${page + 1}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
              >
                Load More ({total - page * 24} more {genre.name.toLowerCase()} games)
              </Link>
            </div>
          )}

          {/* Related Genres */}
          {relatedGenres.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-white mb-4">Related Genres</h2>
              <div className="flex flex-wrap gap-3">
                {relatedGenres.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/genre/${related.slug}`}
                    className="px-3 py-2 bg-g-card/50 hover:bg-g-card text-gray-300 rounded-md text-sm transition-colors"
                  >
                    {related.name} ({related.gameCount})
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
