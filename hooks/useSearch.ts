"use client";

import { useEffect, useState } from "react";
import useDebounce from "@/hooks/useDebounce";

export interface SearchResultItem {
  _id: string;
  title: string;
  slug: string;
  genre: string;
  coverImage: string;
}

export default function useSearch(query: string) {
  const debounced = useDebounce(query, 250);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(debounced)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setResults(data.games || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debounced]);

  return { results, loading };
}
