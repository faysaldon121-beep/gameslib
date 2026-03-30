// components/games/GameFilter.tsx
"use client";
import { useRouter, useSearchParams } from 'next/navigation';

interface GameFilterProps {
  genres: string[];
  platforms: string[];
}

export default function GameFilter({ genres, platforms }: GameFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedGenre = searchParams.get('genre') || '';
  const selectedPlatform = searchParams.get('platform') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset page when filtering
    params.delete('page');
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Genre Filter */}
      <div className="bg-g-secondary p-4 rounded-lg">
        <h3 className="font-semibold mb-3 text-g-text">Genre</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="genre"
              value=""
              checked={selectedGenre === ''}
              onChange={(e) => updateFilter('genre', e.target.value)}
              className="mr-2"
            />
            <span className="text-g-text">All Genres</span>
          </label>
          {genres.map((genre) => (
            <label key={genre} className="flex items-center">
              <input
                type="radio"
                name="genre"
                value={genre}
                checked={selectedGenre === genre}
                onChange={(e) => updateFilter('genre', e.target.value)}
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
              value=""
              checked={selectedPlatform === ''}
              onChange={(e) => updateFilter('platform', e.target.value)}
              className="mr-2"
            />
            <span className="text-g-text">All Platforms</span>
          </label>
          {platforms.map((platform) => (
            <label key={platform} className="flex items-center">
              <input
                type="radio"
                name="platform"
                value={platform}
                checked={selectedPlatform === platform}
                onChange={(e) => updateFilter('platform', e.target.value)}
                className="mr-2"
              />
              <span className="text-g-text">{platform}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
