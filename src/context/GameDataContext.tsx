import React, { createContext, useContext, ReactNode } from 'react';
import { Game, Software } from '../types';

// The exported index from flexsearch is an object.
// We can use a simple type for it.
type ExportedIndex = object;

interface GameContextType {
  games: Game[]; // This is the "store"
  searchIndex: ExportedIndex; // This is the pre-built index
}

interface SoftwareContextType {
  softwares: Software[]; // This is the "store"
  searchIndex: ExportedIndex; // This is the pre-built index
}

export const GameDataContext = createContext<GameContextType | undefined>(undefined);
export const SoftwareDataContext = createContext<SoftwareContextType | undefined>(undefined);

interface GameDataProviderProps {
  games: Game[];
  searchIndex: ExportedIndex;
  children: ReactNode;
  softwares: Software
}

// The provider is now very simple. It just takes the props and provides them.
export const GameDataProvider: React.FC<GameDataProviderProps> = ({ games, softwares, searchIndex, children }) => {
  const value = { games, searchIndex, softwares };
  return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
};

export const useGameData = (): GameContextType => {
  const context = useContext(GameDataContext);
  if (context === undefined) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  return context;
};

export const useSoftData = (): SoftwareContextType => {
  const context = useContext(SoftwareDataContext);
  if (context === undefined) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  return context;
};