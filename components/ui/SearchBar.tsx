// components/ui/SearchBar.tsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-g-muted" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search games..."
          className="w-full pl-10 pr-4 py-3 bg-g-secondary border border-g-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-g-text placeholder-g-muted"
        />
      </div>
    </form>
  );
}
