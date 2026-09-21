import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from 'react-use-flexsearch';
import { useGameData } from '../context/GameDataContext';
import { Game } from '../types';

export const Search: React.FC = () => {
  // Get the pre-built index and the store from our context
  const { searchIndex, games } = useGameData();
  const [query, setQuery] = useState('');

  // The magic hook!
  // It takes the query, the index, and the store and returns the filtered results.
  const results = useSearch(query, searchIndex, games);

  // This state is just for managing the dropdown visibility
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    if (newQuery.length > 1) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Effect to close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={searchContainerRef}>
      <input
        type="text"
        value={query}
        onChange={handleQueryChange}
        onFocus={() => query.length > 1 && setIsOpen(true)}
        placeholder="Search for games..."
        className="w-full md:w-64 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
      />
      {isOpen && (
        <div className="absolute top-full mt-2 w-full md:w-96 max-h-96 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50">
          {results.length > 0 ? (
            <ul>
              {results.map((game: Game) => (
                <li key={game.title_as_slug}>
                  <a
                    href={`/games/${game.title_as_slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center p-3 hover:bg-gray-700 transition-colors"
                  >
                    <img src={game.image_links.poster} alt={game.game_title} className="w-12 h-16 object-cover rounded-md mr-4" />
                    <div>
                      <p className="font-bold text-white">{game.game_title}</p>
                      <p className="text-sm text-gray-400 line-clamp-2">{game.game_description.short}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-gray-400">No results found for "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
};