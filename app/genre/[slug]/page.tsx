import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Game from '@/models/Game';
import GameCard from '@/components/GameCard';
import Pagination from '@/components/ui/Pagination';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
  }>;
}

const GAMES_PER_PAGE = 24;

// Genre mapping
const genreMap: Record<string, string> = {
  'rpg': 'RPG',
  'action': 'Action',
  'adventure': 'Adventure',
  'strategy': 'Strategy',
  'shooter': 'Shooter',
  'sports': 'Sports',
  'racing': 'Racing',
  'simulation': 'Simulation',
  'puzzle': 'Puzzle',
  'platformer': 'Platformer',
  'fighting': 'Fighting',
  'horror': 'Horror',
  'mmorpg': 'MMORPG',
  'moba': 'MOBA',
  'battle-royale': 'Battle Royale',
};

async function getGenreGames(genre: string, page: number = 1, sort: string = 'popular') {
  try {
    await connectDB();
    
    const skip = (page - 1) * GAMES_PER_PAGE;
    
    // Build sort criteria
    let sortCriteria: any = {};
    switch (sort) {
      case 'newest':
        sortCriteria = { releaseDate: -1 };
        break;
      case 'rating':
        sortCriteria = { rating: -1 };
        break;
      case 'name':
        sortCriteria = { title: 1 };
        break;
      default: // popular
        sortCriteria = { downloads: -1, rating: -1 };
    }

    const genreName = genreMap[genre];
    if (!genreName) {
      return null;
    }

    const query = {
      genres: { $in: [genreName] },
      isPublished: true
    };

    const [games, totalGames] = await Promise.all([
      Game.find(query)
        .sort(sortCriteria)
        .skip(skip)
        .limit(GAMES_PER_PAGE)
        .lean(),
      Game.countDocuments(query)
    ]);

    return {
      games: JSON.parse(JSON.stringify(games)),
      totalGames,
      currentPage: page,
      totalPages: Math.ceil(totalGames / GAMES_PER_PAGE),
      genre: genreName
    };
  } catch (error) {
    console.error('Error fetching genre games:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const genreName = genreMap[slug];

  if (!genreName) {
    return {
      title: 'Genre Not Found',
      description: 'The requested genre could not be found.'
    };
  }

  return {
    title: `${genreName} Games - Free Download | GameHub`,
    description: `Browse and download the best ${genreName} games for PC. Explore our collection of ${genreName.toLowerCase()} games with direct download links.`,
    keywords: `${genreName} games, ${genreName.toLowerCase()} PC games, download ${genreName.toLowerCase()} games, free ${genreName.toLowerCase()} games`,
    openGraph: {
      title: `${genreName} Games | GameHub`,
      description: `Browse and download the best ${genreName} games for PC`,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gameslib.vercel.app'}/genre/${slug}`
    },
    twitter: {
      card: 'summary_large_image',
      title: `${genreName} Games | GameHub`,
      description: `Browse and download the best ${genreName} games for PC`
    }
  };
}

export default async function GenrePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page, sort } = await searchParams;

  const currentPage = parseInt(page || '1');
  const currentSort = sort || 'popular';

  const data = await getGenreGames(slug, currentPage, currentSort);

  if (!data) {
    notFound();
  }

  const { games, totalGames, totalPages, genre } = data;

  return (
    <div className="min-h-screen bg-g-bg">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-900 to-blue-900 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {genre} Games
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl">
            Browse {totalGames} {genre.toLowerCase()} games available for download
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="text-g-muted">
            Showing {games.length} of {totalGames} games
          </div>

          <div className="flex items-center gap-4">
            <label htmlFor="sort" className="text-g-muted">
              Sort by:
            </label>
            <select
              id="sort"
              value={currentSort}
              onChange={(e) => {
                const url = new URL(window.location.href);
                url.searchParams.set('sort', e.target.value);
                url.searchParams.set('page', '1');
                window.location.href = url.toString();
              }}
              className="bg-g-secondary border border-g-border rounded px-4 py-2 text-g-text focus:outline-none focus:border-purple-500"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Games Grid */}
        {games.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
              {games.map((game: any) => (
                <GameCard key={game._id} game={game} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-g-muted text-lg">No games found in this genre</p>
          </div>
        )}
      </div>
    </div>
  );
}

export const revalidate = 300;
