// components/SearchBox.tsx (continued)
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import Link from 'next/link';

interface SearchResult {
  slug: string;
  title: string;
  shortDescription?: string;
  coverImage?: string;
  genre?: string;
  score: number;
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery,
            limit: 8,
            minRating: 3.0,
            enhanceWithMetadata: true
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Search failed');
        }

        setResults(data.results);
        setIsOpen(data.results.length > 0);
      } catch (err: any) {
        setError(err.message);
        setResults([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      performSearch(value);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    if (results.length > 0 && query.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
    
    if (e.key === 'Enter' && results.length > 0) {
      window.location.href = `/games/${results[0].slug}`;
    }
  };

  return (
    <div ref={containerRef} className="search-box relative w-full max-w-2xl">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search for games, genres, developers..."
          className="search-input w-full px-4 py-3 pl-12 pr-10 text-gray-900 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          aria-label="Search games"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={isOpen}
        />
        
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div 
          id="search-results"
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-96 overflow-y-auto"
          role="listbox"
        >
          <ul className="divide-y divide-gray-100">
            {results.map((result, index) => (
              <li key={result.slug} role="option" aria-selected={index === 0}>
                <Link
                  href={`/games/${result.slug}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Cover Image */}
                    {result.coverImage && (
                      <div className="flex-shrink-0">
                        <img
                          src={result.coverImage}
                          alt={result.title}
                          className="w-16 h-16 object-cover rounded-md shadow-sm"
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {result.title}
                        </h3>
                        <div className="flex items-center ml-2">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="text-sm text-gray-600">
                            {result.averageRating?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      {result.genre && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {result.genre}
                        </span>
                      )}
                      
                      {result.shortDescription && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {result.shortDescription}
                        </p>
                      )}
                      
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>Score: {result.score.toFixed(2)}</span>
                        {result.downloadCount && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{result.downloadCount.toLocaleString()} downloads</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          
          {/* View All Link */}
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
              onClick={() => setIsOpen(false)}
            >
              View all results for "{query}"
            </Link>
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}
