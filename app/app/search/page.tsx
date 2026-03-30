// app/search/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import SearchContent from './SearchContent';
import connectDB from '@/lib/mongodb';
import Game from '@/models/Game';

export const metadata: Metadata = {
  title: 'Search Games | GameHub',
  description: 'Search and find your favorite free PC games'
};

interface SearchParams {
  q?: string;
  genre?: string;
  platform?: string;
  page?: string;
  sort?: string;
}

async function getSearchData(searchParams: SearchParams) {
  try {
    await connectDB();
    
    // Get basic fallback results for server-side rendering
    const query: any = {};
    if (searchParams.q) query.$text = { $search: searchParams.q };
    if (searchParams.genre) query.genre = searchParams.genre;
    if (searchParams.platform) query.platforms = { $in: [searchParams.platform] };
    
    const fallbackGames = await Game.find(query)
      .sort({ isFeatured: -1, averageRating: -1 })
      .limit(24)
      .lean();

    // Get ALL games for client-side search enhancement
    const allGames = await Game.find({})
      .select({
        title: 1,
        slug: 1,
        description: 1,
        shortDescription: 1,
        coverImage: 1,
        genre: 1,
        platforms: 1,
        version: 1,
        developer: 1,
        publisher: 1,
        releaseDate: 1,
        requirements: 1,
        downloadLinks: 1,
        fileSize: 1,
        isFeatured: 1,
        averageRating: 1,
        reviewCount: 1,
        downloadCount: 1,
        tags: 1,
        changelog: 1,
        createdAt: 1,
        updatedAt: 1
      })
      .lean();

    // Get filter options
    const [genres, platforms] = await Promise.all([
      Game.distinct('genre').then(results => results.filter(Boolean).sort()),
      Game.aggregate([
        { $unwind: '$platforms' },
        { $group: { _id: '$platforms' } },
        { $sort: { _id: 1 } }
      ]).then(results => results.map(r => r._id).filter(Boolean))
    ]);

    // Process games for GameData format (for your hook)
    const processedGames = allGames.map(game => ({
      ...game,
      systemRequirements: [
        game.requirements?.minimum?.os,
        game.requirements?.minimum?.cpu,
        game.requirements?.minimum?.ram,
        game.requirements?.minimum?.gpu,
        game.requirements?.minimum?.storage,
        game.requirements?.recommended?.os,
        game.requirements?.recommended?.cpu,
        game.requirements?.recommended?.ram,
        game.requirements?.recommended?.gpu,
        game.requirements?.recommended?.storage
      ].filter(Boolean).join(' ').toLowerCase(),
      downloadInfo: game.downloadLinks?.map((link: any) => 
        `${link.label} ${link.host || ''} ${link.size || ''}`
      ).join(' ').toLowerCase() || ''
    }));

    return {
      fallbackGames: JSON.parse(JSON.stringify(fallbackGames)),
      allGames: JSON.parse(JSON.stringify(processedGames)),
      genres,
      platforms
    };
    
  } catch (error) {
    console.error('Error fetching search data:', error);
    return {
      fallbackGames: [],
      allGames: [],
      genres: [],
      platforms: []
    };
  }
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const data = await getSearchData(searchParams);
  
  return (
    <div className="min-h-screen bg-g-bg">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      }>
        <SearchContent 
          {...data}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  );
}
