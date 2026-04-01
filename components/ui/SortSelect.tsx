"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
];

export default function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "relevance") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    router.push(`/games?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSort(e.target.value)}
      className="px-4 py-2.5 bg-g-card border border-g-border rounded-xl text-g-text
                 text-sm focus:outline-none focus:ring-2 focus:ring-g-accent"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
