"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState } from "react";

export default function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    params.delete("page");
    router.push(`/games?${params.toString()}`);
  };

  const clear = () => {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`/games?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-g-muted" size={18} />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search games, genres, tags..."
        className="input pl-11 pr-12"
      />
      {value && (
        <button type="button" onClick={clear} className="absolute right-4 top-1/2 -translate-y-1/2 text-g-muted hover:text-g-text">
          <X size={18} />
        </button>
      )}
    </form>
  );
}
