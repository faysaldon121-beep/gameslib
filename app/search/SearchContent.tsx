// app/search/SearchContent.tsx
"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GameCard from '@/components/games/GameCard';
import SearchBar from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import { useClientSearchEnhancement } from '@/hooks/useClientSearchEnhancement';
import { GameData } from '@/lib/server/runtimeSearchManager';

interface SearchContentProps {
  fallbackGames: any[];
  allGames: GameData[];
  genres: string[];
  platforms: string[];
  searchParams: any;
}

const ITEMS_PER_PAGE = 24;

export default function SearchContent({
  fallbackGames,
  allGames,
  genres,
  platforms,
  searchParams
}: SearchContentProps) {
  const urlSearchParams = useSearchParams();
  const router = useRouter();
  const [displayedGames, setDisplayedGames] = useState(fallbackGames);
  const [isUsingClientSearch, setIsUsingClientSearch] = useState(false);

  // Use your existing hook
  const {
    searchResults,
    isLoading,
    isClientReady,
    searchTime,
    performSearch
  } = useClientSearchEnhancement(fallbackGames, allGames);

  // Perform search when URL params change
  useEffect(() => {
    const query = urlSearchParams.get('q') || '';
    const genre = urlSearchParams.get('genre') || '';
    const platform = urlSearchParams.get('platform') || '';
    const sort = urlSearchParams.get('sort') || 'relevance';

    if (isClientReady) {
      setIsUsingClientSearch(true);
      performSearch(query, {
        genre: genre || undefined,
        platform: platform || undefined,
        sortBy: sort,
        limit: 1000
      });
    }
  }, [urlSearchParams, isClientReady, performSearch]);

  // Handle pagination for client search results
  useEffect(() => {
    if (isUsingClientSearch) {
      const page = parseInt(urlSearchParams.get('page') || '1');
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setDisplayedGames(searchResults.slice(startIndex, endIndex));
    } else {
      setDisplayedGames(fallbackGames);
    }
  }, [searchResults, isUsingClientSearch, urlSearchParams, fallbackGames]);

  const updateURL = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(urlSearchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    if ('genre' in updates || 'platform' in updates || 'sort' in updates) {
      params.delete('page');
    }
    
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (key: string, value: string) => {
    updateURL({ [key]: value || null });
  };

  const clearAllFilters = () => {
    const query = urlSearchParams.get('q');
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/search');
    }
  };

  // Get pagination info
  const getPaginationInfo = () => {
    const totalResults = isUsingClientSearch ? searchResults.length : fallbackGames.length;
    const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
    const currentPage = parseInt(urlSearchParams.get('page') || '1');
    
    return { currentPage, totalPages, totalResults };
  };

  const paginationInfo = getPaginationInfo();
  const hasActiveFilters = urlSearchParams.get('genre') || urlSearchParams.get('platform');
  const searchQuery = urlSearchParams.get('q') || '';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-g-text">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Games'}
        </h1>
        
        {/* Search Bar */}
        <div className="mb-6 max-w-2xl">
          <SearchBar />
        </div>

        {/* Search Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-g-muted">
              {paginationInfo.totalResults.toLocaleString()} games found
            </span>
            
            {isClientReady && isUsingClientSearch && (
              <span className="text-green-400 text-sm">
                Enhanced search ({searchTime.toFixed(1)}ms)
              </span>
            )}
            
            {isClientReady && (
              <span className="text-purple-400 text-sm">• Fast search ready</span>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-purple-400 hover:text-purple-300 underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={urlSearchParams.get('sort') || 'relevance'}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="bg-g-secondary border border-g-border rounded px-3 py-2 text-g-text"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="rating">Sort: Rating</option>
            <option value="downloads">Sort: Downloads</option>
            <option value="newest">Sort: Newest</option>
            <option value="title">Sort: Title A-Z</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-1/4">
          <div className="space-y-6">
            {/* Genre Filter */}
            <div className="bg-g-secondary p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-g-text">Genre</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="genre"
                    checked={!urlSearchParams.get('genre')}
                    onChange={() => handleFilterChange('genre', '')}
                    className="mr-2"
                  />
                  <span className="text-g-text">All Genres</span>
                </label>
                {genres.map((genre) => (
                  <label key={genre} className="flex items-center">
                    <input
                      type="radio"
                      name="genre"
                      checked={urlSearchParams.get('genre') === genre}
                      onChange={() => handleFilterChange('genre', genre)}
                      className="mr-2"
                    />
                    <span className="text-g-text">{genre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Platform Filter */}
            <div className="bg-g-secondary p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-g-text">Platform</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="platform"
                    checked={!urlSearchParams.get('platform')}
                    onChange={() => handleFilterChange('platform', '')}
                    className="mr-2"
                  />
                  <span className="text-g-text">All Platforms</span>
                </label>
                {platforms.map((platform) => (
                  <label key={platform} className="flex items-center">
                    <input
                      type="radio"
                      name="platform"
                      checked={urlSearchParams.get('platform') === platform}
                      onChange={() => handleFilterChange('platform', platform)}
                      className="mr-2"
                    />
                    <span className="text-g-text">{platform}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:w-3/4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-g-text">Searching...</span>
            </div>
          )}

          {/* Games Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {displayedGames.map((game) => (
                <GameCard key={game.slug || game._id} game={game} />
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && displayedGames.length === 0 && (
            <div className="text-center py-12">
              <p className="text-g-muted text-lg mb-4">
                {searchQuery ? `No games found for "${searchQuery}"` : 'No games found'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && paginationInfo.totalPages > 1 && (
            <Pagination
              currentPage={paginationInfo.currentPage}
              totalPages={paginationInfo.totalPages}
            />
          )}
        </main>
      </div>
    </div>
  );
}
