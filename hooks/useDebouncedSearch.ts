// hooks/useDebouncedSearch.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";

interface Suggestion {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  genre: string;
  averageRating: number;
}

export function useDebouncedSearch(delay = 400) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchResults = useCallback(
    debounce(async (q: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay),
    [delay]
  );

  // Cancel debounce on unmount
  useEffect(() => {
    return () => {
      fetchResults.cancel();
    };
  }, [fetchResults]);

  const search = (q: string) => {
    setQuery(q);
    setLoading(true);
    fetchResults(q);
  };

  const clear = () => {
    fetchResults.cancel();
    setQuery("");
    setResults([]);
    setLoading(false);
  };

  return { query, results, loading, search, clear };
}
