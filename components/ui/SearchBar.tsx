"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Suggestion {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  genre: string;
  averageRating: number;
}

interface SearchBarProps {
  defaultValue?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 400);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const controller = new AbortController();

    async function fetchSuggestions() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setSuggestions(data.results || []);
        setShowDropdown(true);
        setSelectedIndex(-1);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Search error:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();

    return () => controller.abort();
  }, [debouncedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigate to search results
  const submitSearch = useCallback(
    (searchQuery: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      } else {
        params.delete("q");
      }
      params.delete("page"); // Reset pagination
      router.push(`/games?${params.toString()}`);
      setShowDropdown(false);
    },
    [router, searchParams]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          router.push(`/games/${suggestions[selectedIndex].slug}`);
          setShowDropdown(false);
        } else {
          submitSearch(query);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative w-full">
      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch(query);
        }}
      >
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-g-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search games..."
            className="w-full pl-10 pr-10 py-2.5 bg-g-card border border-g-border rounded-xl
                       text-g-text placeholder:text-g-muted
                       focus:outline-none focus:ring-2 focus:ring-g-accent focus:border-transparent
                       transition-all"
          />
          {/* Loading spinner */}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-g-muted border-t-g-accent rounded-full animate-spin" />
            </div>
          )}
          {/* Clear button */}
          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setShowDropdown(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-g-muted hover:text-g-text"
            >
              ✕
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 top-full mt-2 w-full bg-g-card border border-g-border
                     rounded-xl shadow-2xl overflow-hidden"
        >
          {suggestions.map((game, i) => (
            <Link
              key={game._id}
              href={`/games/${game.slug}`}
              onClick={() => setShowDropdown(false)}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-g-border/50 transition-colors
                ${i === selectedIndex ? "bg-g-border/50" : ""}`}
            >
              <div className="relative w-12 h-8 rounded overflow-hidden shrink-0">
                <Image
                  src={game.coverImage}
                  alt={game.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-g-text truncate">
                  {game.title}
                </p>
                <p className="text-xs text-g-muted">{game.genre}</p>
              </div>
              {game.averageRating > 0 && (
                <span className="text-xs text-yellow-500">
                  ⭐ {game.averageRating.toFixed(1)}
                </span>
              )}
            </Link>
          ))}

          {/* View all results */}
          <button
            onClick={() => submitSearch(query)}
            className="w-full px-4 py-3 text-sm text-g-accent hover:bg-g-border/50
                       transition-colors border-t border-g-border text-center"
          >
            View all results for &quot;{query}&quot;
          </button>
        </div>
      )}

      {/* No results */}
      {showDropdown && suggestions.length === 0 && !loading && debouncedQuery.length >= 2 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 top-full mt-2 w-full bg-g-card border border-g-border
                     rounded-xl shadow-2xl p-4 text-center text-g-muted text-sm"
        >
          No games found for &quot;{debouncedQuery}&quot;
        </div>
      )}
    </div>
  );
}
