// lib/clientSearchEngine.ts
"use client";
import { Document as FlexDocument } from 'flexsearch';
import { GameData } from '@/lib/server/runtimeSearchManager';

interface SearchOptions {
  genre?: string;
  platform?: string;
  minRating?: number;
  limit?: number;
  sortBy?: 'relevance' | 'rating' | 'downloads' | 'newest' | 'title';
}

interface SearchResult {
  results: GameData[];
  total: number;
  searchTime: number;
}

class ClientSearchEngine {
  private index: FlexDocument<any> | null = null;
  private games: Map<string, GameData> = new Map();
  private isReady = false;

  async initializeWithData(gamesData: GameData[]): Promise<void> {
    if (this.isReady) return;

    const startTime = Date.now();
    
    try {
      console.log('🔄 Initializing client search...');

      const index = new FlexDocument<any>({
        preset: "memory",
        tokenize: "reverse",
        resolution: 7,
        minlength: 2,
        optimize: true,
        context: {
          resolution: 3,
          depth: 2,
          bidirectional: true
        },
        document: {
          id: "slug",
          index: [
            {
              field: "title",
              tokenize: "forward",
              resolution: 9
            },
            {
              field: "shortDescription",
              tokenize: "forward",
              resolution: 7
            },
            {
              field: "description",
              tokenize: "strict",
              resolution: 5,
              minlength: 3
            },
            {
              field: "genre",
              tokenize: "strict"
            },
            {
              field: "developer",
              tokenize: "forward"
            },
            {
              field: "publisher",
              tokenize: "forward"
            },
            {
              field: "tags",
              tokenize: "strict"
            },
            {
              field: "platforms",
              tokenize: "strict"
            },
            {
              field: "systemRequirements",
              tokenize: "strict",
              minlength: 3,
              resolution: 5
            }
          ]
        }
      });

      this.games.clear();
      for (const game of gamesData) {
        await index.add(game);
        this.games.set(game.slug, game);
      }

      this.index = index;
      this.isReady = true;
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ Client search ready: ${gamesData.length} games in ${loadTime}ms`);

    } catch (error) {
      console.error('❌ Failed to initialize client search:', error);
      throw error;
    }
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    if (!this.isReady || !this.index) {
      throw new Error('Search engine not initialized');
    }

    const startTime = performance.now();

    try {
      if (!query || query.trim().length === 0) {
        const results = Array.from(this.games.values())
          .filter(game => this.applyFilters(game, options))
          .sort((a, b) => this.compareGames(a, b, options.sortBy || 'rating'))
          .slice(0, options.limit || 1000);

        return {
          results,
          total: results.length,
          searchTime: performance.now() - startTime
        };
      }

      const searchResults = await this.index.search(query.trim(), {
        limit: options.limit || 1000,
        enrich: true,
        suggest: true
      });

      const gameIds = this.extractGameIds(searchResults);
      const results = gameIds
        .map(slug => this.games.get(slug))
        .filter((game): game is GameData => game !== undefined && this.applyFilters(game, options))
        .sort((a, b) => this.compareGames(a, b, options.sortBy || 'relevance'));

      return {
        results,
        total: results.length,
        searchTime: performance.now() - startTime
      };

    } catch (error) {
      console.error('Search error:', error);
      return {
        results: [],
        total: 0,
        searchTime: performance.now() - startTime
      };
    }
  }

  private extractGameIds(searchResults: any): string[] {
    const gameIds = new Set<string>();
    
    if (Array.isArray(searchResults)) {
      searchResults.forEach((fieldResult: any) => {
        if (fieldResult.result) {
          fieldResult.result.forEach((item: any) => {
            const slug = typeof item === 'string' ? item : item.id;
            if (slug) gameIds.add(slug);
          });
        }
      });
    }

    return Array.from(gameIds);
  }

  private applyFilters(game: GameData, options: SearchOptions): boolean {
    if (options.genre && game.genre !== options.genre) return false;
    if (options.platform && !game.platforms?.includes(options.platform)) return false;
    if (options.minRating && game.averageRating < options.minRating) return false;
    return true;
  }

  private compareGames(a: GameData, b: GameData, sortBy: string): number {
    switch (sortBy) {
      case 'relevance':
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.averageRating - a.averageRating;
        
      case 'rating':
        return b.averageRating - a.averageRating;
        
      case 'downloads':
        return b.downloadCount - a.downloadCount;
        
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
      case 'title':
        return a.title.localeCompare(b.title);
        
      default:
        return 0;
    }
  }

  getStats() {
    return {
      isReady: this.isReady,
      totalGames: this.games.size
    };
  }
}

export const clientSearchEngine = new ClientSearchEngine();
