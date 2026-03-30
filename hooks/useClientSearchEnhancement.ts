// hooks/useClientSearchEnhancement.ts (continued)
"use client";
import { useState, useEffect, useCallback } from 'react';
import { clientSearchEngine } from '@/lib/clientSearchEngine';
import { GameData } from '@/lib/server/runtimeSearchManager';

interface UseClientSearchResult {
  searchResults: any[];
  isLoading: boolean;
  isClientReady: boolean;
  searchTime: number;
  performSearch: (query: string, options?: any) => Promise<void>;
}

export function useClientSearchEnhancement(
  initialGames: any[],
  allGames: GameData[]
): UseClientSearchResult {
  const [searchResults, setSearchResults] = useState(initialGames);
  const [isLoading, setIsLoading] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  // Initialize client search when data is available
  useEffect(() => {
    if (allGames.length > 0 && !isClientReady) {
      const initializeClient = async () => {
        try {
          await clientSearchEngine.initializeWithData(allGames);
          setIsClientReady(true);
        } catch (error) {
          console.error('Failed to initialize client search:', error);
        }
      };
      
      initializeClient();
    }
  }, [allGames, isClientReady]);

  const performSearch = useCallback(async (query: string, options: any = {}) => {
    if (!isClientReady) return;
    
    setIsLoading(true);
    try {
      const result = await clientSearchEngine.search(query, options);
      setSearchResults(result.results);
      setSearchTime(result.searchTime);
    } catch (error) {
      console.error('Client search error:', error);
      setSearchResults(initialGames);
    } finally {
      setIsLoading(false);
    }
  }, [isClientReady, initialGames]);

  return {
    searchResults,
    isLoading,
    isClientReady,
    searchTime,
    performSearch
  };
}
