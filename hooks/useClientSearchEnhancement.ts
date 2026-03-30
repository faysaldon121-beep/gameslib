// hooks/useClientSearchEnhancement.ts
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
\<Streaming stoppped because the conversation grew too long for this model\>
