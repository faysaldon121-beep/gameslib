import { Suspense } from 'react';
import connectDB from '@/lib/mongodb';
import Genre from '@/models/Genre';
import Link from 'next/link';
import Image from 'next/image';

// Define types
interface GenreDoc {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  gameCount: number;
}

interface GroupedGenre {
  letter: string;
  genres: GenreDoc[];
}

// Fetch data on the server
async function getGroupedGenres(): Promise<GroupedGenre[]> {
  await connectDB();

   const genres = (await Genre.find({ isActive: true, gameCount: { $gt: 0 } })
    .select('name slug description icon gameCount')
    .sort({ name: 1 })
    .lean()) as unknown as GenreDoc[];
  // Group by first letter
  const letterMap = new Map<string, GenreDoc[]>();

  for (const genre of genres) {
    const letter = genre.name.charAt(0).toUpperCase();
    if (!letterMap.has(letter)) {
      letterMap.set(letter, []);
    }
    letterMap.get(letter)!.push(genre);
  }

  return Array.from(letterMap.entries()).map(([letter, genres]) => ({
    letter,
    genres,
  }));
}

// Get total genre count
async function getGenreStats() {
  await connectDB();
  const count = await Genre.countDocuments({ isActive: true, gameCount: { $gt: 0 } });
  return { totalGenres: count };
}

// Loading skeleton
function FeaturedGenresSkeleton() {
  return (
    <section className="py-16 bg-[#0a0e27]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-700 rounded w-80 mx-auto mb-4 animate-pulse" />
          <div className="h-4 bg-gray-700 rounded w-[500px] max-w-full mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-g-card rounded-xl p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Complete SEO Metadata
export async function generateMetadata() {
  const { totalGenres } = await getGenreStats();

  return {
    // Title & Description
    title: 'Browse Free PC Games by Genre | Gameslib',
    description: `Explore ${totalGenres} free PC game genres. Download pre-installed action, RPG, strategy, adventure, and more. No signup required.`,
    
    // Keywords (Google ignores this but some tools still use it)
    keywords: [
      'free PC games',
      'free PC game genres',
      'download PC games',
      'free action games',
      'free RPG games',
      'free strategy games',
      'free adventure games',
      'PC game categories',
      'Gameslib genres',
    ],

    // Canonical & Alternates
    alternates: {
      canonical: 'https://gameslib.net/genres',
      languages: {
        'en-US': 'https://gameslib.net/genres',
      },
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Open Graph
    openGraph: {
      type: 'website',
      url: 'https://gameslib.net/genres',
      siteName: 'Gameslib',
      title: 'Browse Free PC Games by Genre | Gameslib',
      description: `Explore ${totalGenres} free PC game genres. Download pre-installed action, RPG, strategy, and more.`,
      images: [
        {
          url: 'https://gameslib.net/og-genres.png',
          width: 1200,
          height: 630,
          alt: 'Browse Free PC Games by Genre - Gameslib',
          type: 'image/png',
        },
      ],
      locale: 'en_US',
    },

    // Twitter / X
    twitter: {
      card: 'summary_large_image',
      site: '@gameslib',
      creator: '@gameslib',
      title: 'Browse Free PC Games by Genre | Gameslib',
      description: `Explore ${totalGenres} free PC game genres. Download pre-installed games for free.`,
      images: ['https://gameslib.net/og-genres.png'],
    },

    // Verification (add your own)
    verification: {
      google: 'your-google-verification-token',
    },

    // Category & Age
    category: 'Gaming',
    classification: 'Free PC Games Library',
  };
}

// JSON-LD Structured Data
function FeaturedGenresJsonLd({ grouped }: { grouped: GroupedGenre[] }) {
  const allGenres = grouped.flatMap(({ genres }) => genres);

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://gameslib.net',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Genres',
        item: 'https://gameslib.net/genres',
      },
    ],
  };

  // Collection Page Schema
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free PC Games by Genre - Gameslib',
    description: 'Browse and download free PC games organized by genre. Pre-installed games with system requirements.',
    url: 'https://gameslib.net/genres',
    about: {
      '@type': 'Thing',
      name: 'Video Games',
      description: 'Free PC game downloads organized by genre',
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Game Genres',
      description: 'List of all available game genres on Gameslib',
      numberOfItems: allGenres.length,
      itemListElement: allGenres.map((genre, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Thing',
          '@id': `https://gameslib.net/genre/${genre.slug}`,
          name: genre.name,
          description: genre.description,
          url: `https://gameslib.net/genre/${genre.slug}`,
          additionalProperty: {
            '@type': 'PropertyValue',
            name: 'gameCount',
            value: genre.gameCount,
          },
        },
      })),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Gameslib',
      url: 'https://gameslib.net',
      logo: {
        '@type': 'ImageObject',
        url: 'https://gameslib.net/logo.png',
      },
      sameAs: [
        'https://twitter.com/gameslib',
        'https://facebook.com/gameslib',
        'https://instagram.com/gameslib',
      ],
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://gameslib.net/genres',
    },
  };

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Are all games on Gameslib free to download?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, all games on Gameslib are completely free to download. We offer pre-installed PC games with no hidden fees or subscriptions required.',
        },
      },
      {
        '@type': 'Question',
        name: 'What genres of games are available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Gameslib offers ${allGenres.length} different game genres including action, RPG, strategy, adventure, simulation, sports, puzzle, racing, horror, and many more.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to create an account to download games?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, you do not need to create an account. All games can be downloaded directly without registration.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are the downloaded games pre-installed and ready to play?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, all games are pre-installed and ready to play. Simply download and run the executable file.',
        },
      },
    ],
  };

  // WebSite Schema for Site Search
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Gameslib',
    url: 'https://gameslib.net',
    description: 'Free PC games download library organized by genre',
    publisher: {
      '@type': 'Organization',
      name: 'Gameslib',
      url: 'https://gameslib.net',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://gameslib.net/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

// Main Component
export default async function FeaturedGenres() {
  const grouped = await getGroupedGenres();

  if (!grouped.length) {
    return null;
  }

  return (
    <>
      <FeaturedGenresJsonLd grouped={grouped} />

      <section
        className="py-16 bg-[#0a0e27]"
        itemScope
        itemType="https://schema.org/CollectionPage"
      >
        <meta itemProp="name" content="Free PC Games by Genre - Gameslib" />
        <meta
          itemProp="description"
          content="Browse and download free PC games organized by genre."
        />
        <meta itemProp="url" content="https://gameslib.net/genres" />

        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8"
          >
            <ol className="flex items-center gap-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </li>
              <li>
                <span className="text-white font-medium" aria-current="page">
                  Genres
                </span>
              </li>
            </ol>
          </nav>

          {/* Section Header */}
          <header className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Browse Free PC Games by Genre
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explore our extensive collection of free PC games organized by genre.
              Find your favorite category and discover new titles to download.
            </p>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mt-6" />
          </header>

          {/* Alphabet Navigation */}
          <nav
            aria-label="Genre alphabet navigation"
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {grouped.map(({ letter }) => (
              <a
                key={letter}
                href={`#genre-${letter.toLowerCase()}`}
                className="w-10 h-10 flex items-center justify-center bg-g-card hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200"
                aria-label={`Jump to ${letter} genres`}
              >
                {letter}
              </a>
            ))}
          </nav>

          {/* Genre Grid by Letter */}
          <div className="space-y-12">
            {grouped.map(({ letter, genres }) => (
              <article
                key={letter}
                id={`genre-${letter.toLowerCase()}`}
                className="scroll-mt-24"
              >
                {/* Letter Header */}
                <header className="flex items-center gap-4 mb-6">
                  <span
                    className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white"
                    aria-hidden="true"
                  >
                    {letter}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-600/50 to-transparent" />
                  <span className="text-sm text-gray-500">
                    {genres.length} {genres.length === 1 ? 'genre' : 'genres'}
                  </span>
                </header>

                {/* Genre Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {genres.map((genre) => (
                    <Link
                      key={genre._id}
                      href={`/genre/${genre.slug}`}
                      className="group relative bg-g-card hover:bg-g-card/80 rounded-xl p-5 transition-all duration-300 border border-transparent hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
                      title={`${genre.name} - Free PC Games Download`}
                      aria-label={`Explore ${genre.name} games (${genre.gameCount} titles)`}
                    >
                      {/* Icon & Info */}
                      <div className="flex items-start gap-4">
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <Image
                            src={genre.icon || '/icons/genres/default.svg'}
                            alt={`${genre.name} genre icon`}
                            fill
                            className="object-contain"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2
                            className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate"
                            itemProp="name"
                          >
                            {genre.name}
                          </h2>
                          <div
                            className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium"
                            itemProp="additionalProperty"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-11v6h2V7h-2zm0-4v2h2V3h-2z" />
                            </svg>
                            {genre.gameCount.toLocaleString()} games
                          </div>
                        </div>
                      </div>

                      {/* Hover Arrow */}
                      <div
                        className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-hidden="true"
                      >
                        <svg
                          className="w-5 h-5 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>

                      {/* Description Preview */}
                      <p className="text-gray-500 text-xs mt-3 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {genre.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {/* View All Link */}
          <footer className="text-center mt-12">
            <Link
              href="/genres"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
            >
              View All Genres
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </footer>
        </div>
      </section>
    </>
  );
}
