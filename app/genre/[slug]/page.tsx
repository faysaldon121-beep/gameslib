import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GameCard from '@/components/GameCard';
import Pagination from '@/components/ui/Pagination';
import { client } from '@/sanity/lib/client';
import { groq } from 'next-sanity';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
  }>;
}

const GAMES_PER_PAGE = 24;

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
  const genreName = genreMap[genre];
  if (!genreName) return null;

  const start = (page - 1) * GAMES_PER_PAGE;
  const end = start + GAMES_PER_PAGE;

  let sortCriteria = '';
  switch (sort) {
    case 'newest': sortCriteria = 'releaseDate desc'; break;
    case 'rating': sortCriteria = 'rating desc'; break;
    case 'name': sortCriteria = 'title asc'; break;
    default: sortCriteria = 'downloads desc';
  }

  try {
    const query = groq`{
      "games": *[_type == "game" && $genre in genres && isPublished == true] | order(${sortCriteria}) [$start...$end] {
        _id,
        title,
        "slug": slug.current,
        "coverImage": coverImage.asset->url,
        rating,
        downloads,
        releaseDate,
        genres,
        platforms,
        size
      },
      "total": count(*[_type == "game" && $genre in genres && isPublished == true])
    }`;

    const result = await client.fetch(query, { genre: genreName, start, end });

    return {
      games: result.games || [],
      totalGames: result.total || 0,
      currentPage: page,
      totalPages: Math.ceil((result.total || 0) / GAMES_PER_PAGE),
      genre: genreName,
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
    return { title: 'Genre Not Found' };
  }

  return {
    title: `${genreName} Games - Free Download | GamesLib`,
    description: `Browse and download the best ${genreName} games for PC.`,
    openGraph: {
      title: `${genreName} Games | GamesLib`,
      description: `Browse and download the best ${genreName} games for PC`,
    },
  };
}

export default async function GenrePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page, sort } = await searchParams;

  const currentPage = parseInt(page || '1');
  const currentSort = sort || 'popular';

  const data = await getGenreGames(slug, currentPage, currentSort);

  if (!data) notFound();

  const { games, totalGames, totalPages, genre } = data;

  return (
    <div className="min-h-screen bg-g-bg">
      <section className="bg-gradient-to-r from-purple-900 to-blue-900 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-4">{genre} Games</h1>
          <p className="text-xl text-purple-100">Showing {totalGames} games</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>Showing {games.length} of {totalGames} games</div>
          <select
            defaultValue={currentSort}
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set('sort', e.target.value);
              url.searchParams.set('page', '1');
              window.location.href = url.toString();
            }}
            className="bg-g-secondary border border-g-border rounded px-4 py-2 text-white"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
          {games.map((game: any) => (
            <GameCard key={game._id} game={game} />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
}
