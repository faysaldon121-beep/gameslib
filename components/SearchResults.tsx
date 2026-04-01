// components/SearchResults.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";
import GameCard from "@/components/games/GameCard";

interface Filters {
  genre: string;
  platform: string;
  minRating: number;
}

interface SearchResultsProps {
  initialQuery?: string;
  initialFilters?: Partial<Filters>;
}

export default function SearchResults({
  initialQuery = "",
  initialFilters = {},
}: SearchResultsProps) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<Filters>({
    genre: initialFilters.genre || "",
    platform: initialFilters.platform || "",
    minRating: initialFilters.minRating || 0,
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // ✅ FIX: Convert all values to strings for URLSearchParams
  const fetchResults = useCallback(
    async (searchQuery: string, searchFilters: Filters) => {
      setLoading(true);

      try {
        // Build params — only add non-empty values
        const params = new URLSearchParams();

        if (searchQuery.trim()) {
          params.set("q", searchQuery.trim());
        }
        if (searchFilters.genre) {
          params.set("genre", searchFilters.genre);
        }
        if (searchFilters.platform) {
          params.set("platform", searchFilters.platform);
        }
        if (searchFilters.minRating > 0) {
          params.set("minRating", String(searchFilters.minRating));
        }

        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();

        setResults(data.results || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((q: string, f: Filters) => {
      fetchResults(q, f);
    }, 400),
    [fetchResults]
  );

  // Cleanup
  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  // Search on query/filter change
  useEffect(() => {
    if (query.trim().length >= 2 || filters.genre || filters.platform) {
      debouncedSearch(query, filters);
    } else {
      setResults([]);
      setTotal(0);
    }
  }, [query, filters, debouncedSearch]);

  return (
    <div>
      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search games..."
          className="w-full px-4 py-2.5 bg-g-card border border-g-border rounded-xl
                     text-g-text placeholder:text-g-muted
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filters.genre}
          onChange={(e) => setFilters((f) => ({ ...f, genre: e.target.value }))}
          className="px-3 py-2 bg-g-card border border-g-border rounded-lg text-g-text text-sm"
        >
          <option value="">All Genres</option>
          <option value="Action">Action</option>
          <option value="RPG">RPG</option>
          <option value="Racing">Racing</option>
          <option value="Simulation">Simulation</option>
          <option value="Strategy">Strategy</option>
          <option value="Horror">Horror</option>
          <option value="Adventure">Adventure</option>
        </select>

        <select
          value={filters.platform}
          onChange={(e) => setFilters((f) => ({ ...f, platform: e.target.value }))}
          className="px-3 py-2 bg-g-card border border-g-border rounded-lg text-g-text text-sm"
        >
          <option value="">All Platforms</option>
          <option value="Windows">Windows</option>
          <option value="Mac">Mac</option>
          <option value="Linux">Linux</option>
        </select>

        <select
          value={String(filters.minRating)}
          onChange={(e) =>
            setFilters((f) => ({ ...f, minRating: Number(e.target.value) }))
          }
          className="px-3 py-2 bg-g-card border border-g-border rounded-lg text-g-text text-sm"
        >
          <option value="0">Any Rating</option>
          <option value="3">3+ Stars</option>
          <option value="4">4+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
        </select>
      </div>

      {/* Stats */}
      {(query || filters.genre || filters.platform) && (
        <p className="text-g-muted text-sm mb-4">
          {total} game{total !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-g-muted border-t-purple-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Results Grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((game: any) => (
            <GameCard key={game.slug || game._id} game={game} />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && query.length >= 2 && (
        <div className="text-center py-12 text-g-muted">
          <p className="text-lg mb-2">No games found</p>
          <p className="text-sm">Try different keywords or filters</p>
        </div>
      )}
    </div>
  );
}
