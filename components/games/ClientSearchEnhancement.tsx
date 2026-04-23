'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Pagination from '@/components/ui/Pagination';

interface ClientSearchEnhancementProps {
  initialResults: any[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

export default function ClientSearchEnhancement({
  initialResults,
  totalResults,
  currentPage,
  totalPages,
}: ClientSearchEnhancementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
  const [selectedPlatform, setSelectedPlatform] = useState(searchParams.get('platform') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
  const [showFilters, setShowFilters] = useState(false);

  const genres = [
    'All',
    'Action',
    'Adventure',
    'RPG',
    'Strategy',
    'Shooter',
    'Sports',
    'Racing',
    'Simulation',
    'Puzzle',
    'Horror',
  ];

  const platforms = ['All', 'PC', 'PS5', 'Xbox', 'Switch', 'Mobile'];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name', label: 'Name (A-Z)' },
  ];

  const updateURL = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== 'All' && value !== '') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change
      if ('page' in updates === false) {
        params.set('page', '1');
      }

      startTransition(() => {
        router.push(`/games?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ q: searchQuery });
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    updateURL({ genre: genre === 'All' ? '' : genre });
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    updateURL({ platform: platform === 'All' ? '' : platform });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateURL({ sort });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedPlatform('');
    setSortBy('popular');
    router.push('/games');
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games..."
            className="w-full px-6 py-4 pr-14 rounded-full bg-g-card border-2 border-g-border text-g-text placeholder-g-muted focus:outline-none focus:border-purple-500 transition-colors text-lg"
          />
          <button
            type="submit"
            disabled={isPending}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors disabled:opacity-50"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>

      {/* Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-g-card border border-g-border hover:border-purple-500 text-g-text rounded-lg transition-colors"
        >
          <FunnelIcon className="w-5 h-5" />
          <span>Filters</span>
          {(selectedGenre || selectedPlatform || searchQuery) && (
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          )}
        </button>

        <div className="flex items-center gap-4">
          <span className="text-g-muted text-sm">
            {totalResults} {totalResults === 1 ? 'game' : 'games'} found
          </span>
          
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            disabled={isPending}
            className="bg-g-card border border-g-border rounded-lg px-4 py-2 text-g-text focus:outline-none focus:border-purple-500 disabled:opacity-50"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-g-card border border-g-border rounded-xl p-6 space-y-6">
          {/* Genre Filter */}
          <div>
            <h3 className="text-g-text font-semibold mb-3">Genre</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreChange(genre)}
                  disabled={isPending}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    (selectedGenre === genre || (genre === 'All' && !selectedGenre))
                      ? 'bg-purple-600 text-white'
                      : 'bg-g-bg text-g-muted hover:bg-g-border hover:text-g-text'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Filter */}
          <div>
            <h3 className="text-g-text font-semibold mb-3">Platform</h3>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => handlePlatformChange(platform)}
                  disabled={isPending}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    (selectedPlatform === platform || (platform === 'All' && !selectedPlatform))
                      ? 'bg-purple-600 text-white'
                      : 'bg-g-bg text-g-muted hover:bg-g-border hover:text-g-text'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(selectedGenre || selectedPlatform || searchQuery) && (
            <button
              onClick={clearFilters}
              disabled={isPending}
              className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {isPending && (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      )}

      {/* Pagination - No onPageChange needed, uses URL routing */}
      {!isPending && totalPages > 1 && (
        <div className="mt-12">
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
