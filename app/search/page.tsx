// app/search/page.tsx (Next.js App Router)
import SearchResults from '@/components/SearchResults';
import { searchSystem } from '@/lib/server/search-system';

// Enable static generation with revalidation
export const revalidate = 3600; // Revalidate every hour

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || '';
  
  return {
    title: query ? `Search results for "${query}"` : 'Game Search',
    description: `Find and download ${query} games. Browse our collection of free games with direct download links.`,
    openGraph: {
      title: query ? `Search: ${query}` : 'GamesLib',
      description: `Search our free games for ${query}`,
      type: 'website'
    }
  };
}

// This runs on the server for initial load
export async function getServerSideProps({ searchParams }: { searchParams: { q?: string; genre?: string; platform?: string; minRating?: string } }) {
  const query = searchParams.q || '';
  
  if (!query) {
    return {
      props: {
        initialQuery: '',
        initialResults: []
      }
    };
  }

  try {
    // Ensure search system is initialized
    await searchSystem.initialize();
    
    // Perform search
    const results = await searchSystem.search(query, {
      limit: 50,
      genre: searchParams.genre || undefined,
      platform: searchParams.platform || undefined,
      minRating: parseFloat(searchParams.minRating) || undefined
    });

    return {
      props: {
        initialQuery: query,
        initialResults: results
      }
    };
  } catch (error) {
    console.error('Server-side search failed:', error);
    return {
      props: {
        initialQuery: query,
        initialResults: [],
        error: 'Search failed. Please try again.'
      }
    };
  }
}

export default function SearchPage({ initialQuery, initialResults }: { 
  initialQuery: string; 
  initialResults: any[];
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {initialQuery ? `Search Results for "${initialQuery}"` : 'Search Games'}
          </h1>
          <p className="mt-2 text-gray-600">
            Find and download your favorite games from our collection.
          </p>
        </div>

        <SearchResults 
          initialQuery={initialQuery}
          initialResults={initialResults}
        />
      </div>
    </div>
  );
}
