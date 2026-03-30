// components/games/ClientSearchEnhancement.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameGrid from '@/components/games/GameGrid';
import Pagination from '@/components/ui/Pagination';
import { optimizedGameSearch } from '@/lib/clientSearchOptimized';

interface ClientSearchEnhancementProps {
  initialGames: any[];
  allGames: any[];
  searchParams: Record<string, string | string[] | undefined>;
  totalPages: number;
  currentPage: number;
  indexReady: boolean;
}

const PAGE_SIZE = 18;

export default function ClientSearchEnhancement({
  initialGames,
  allGames,
  searchParams,
  totalPages: initialTotalPages,
  currentPage: initialCurrentPage,
  indexReady
}: ClientSearchEnhancementProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  
  const [searchResults, setSearchResults] = useState(initialGames);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [clientReady, setClientReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);

  // Extract search parameters
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const genre = typeof searchParams.genre === "string" ? searchParams.genre : "";
  const platform = typeof searchParams.platform === "string" ? searchParams.platform : "";

  // Initialize client search when index is ready
  useEffect(() => {
    if (indexReady && allGames.length > 0 && !clientReady) {
      const initializeSearch = async () => {
        try {
          // Initialize the optimized search engine with our data
          await optimizedGameSearch.initializeWithData(allGames);
          setClientReady(true);
          console.log('✅ Client search enhancement ready');
        } catch (error) {
          console.error('❌ Failed to initialize client search:', error);
        }
      };

      initializeSearch();
    }
  }, [indexReady, allGames, clientReady]);

  // Perform search when parameters change
  useEffect(() => {
    if (!clientReady) {
      // Use initial server results
      setSearchResults(initialGames);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      
      try {
        const result = await optimizedGameSearch.search(query, {
          genre: genre || undefined,
          platform: platform || undefined,
          limit: 1000, // Get all results for client pagination
          sortBy: query ? 'relevance' : 'rating'
        });

        setSearchResults(result.results);
        setSearchTime(result.searchTime);
        
        // Reset page if search changed
        if (query !== (urlSearchParams.get('q') || '')) {
          setCurrentPage(1);
        }

      } catch (error) {
        console.error('Search error:', error);
        // Fallback to initial results
        setSearchResults(initialGames);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [query, genre, platform, clientReady, initialGames, urlSearchParams]);

  // Paginate results
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return searchResults.slice(startIndex, endIndex);
  }, [searchResults, currentPage]);

  const totalPages = Math.ceil(searchResults.length / PAGE_SIZE);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    // Update URL
    const params = new URLSearchParams(urlSearchParams);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* Search Status */}
      <div className="mb-4 text-sm text-g-muted flex items-center gap-2">
        <span>
          {isSearching ? 'Searching...' : `${searchResults.length} games`}
        </span>
        
        {clientReady && searchTime > 0 && (
          <span className="text-purple-400">
            ({searchTime.toFixed(1)}ms)
          </span>
        )}
        
        {clientReady && (
          <span className="text-green-400 text-xs">⚡ Enhanced</span>
        )}
        
        {!clientReady && indexReady && (
          <span className="text-yellow-400 text-xs">🔄 Loading...</span>
        )}
      </div>

      {/* Results */}
      {isSearching ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video skeleton rounded-xl" />
          ))}
        </div>
      ) : paginatedResults.length > 0 ? (
        <>
          <GameGrid games={paginatedResults} />
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-g-muted">
          <p className="text-xl mb-2">No games found</p>
          <p className="text-sm">Try adjusting your filters or search term</p>
          {query && (
            <button
              onClick={() => {
                const params = new URLSearchParams(urlSearchParams);
                params.delete('q');
                router.push(`?${params.toString()}`);
              }}
              className="mt-4 text-purple-400 hover:text-purple-300 underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </>
  );
}
