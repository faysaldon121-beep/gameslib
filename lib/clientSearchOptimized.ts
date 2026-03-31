// lib/clientSearchOptimized.ts (Updated)
"use client";
import { Index, Document } from 'flexsearch';

interface OptimizedSearchEngine {
  index: Document<any> | null;
  games: Map<string, any>;
  isReady: boolean;
  stats: {
    totalGames: number;
    indexSize: number;
    loadTime: number;
  };
}

class OptimizedGameSearch {
  private engine: OptimizedSearchEngine = {
    index: null,
    games: new Map(),
    isReady: false,
    stats: { totalGames: 0, indexSize: 0, loadTime: 0 }
  };

  // Initialize with pre-loaded data (from our runtime manager)
  async initializeWithData(gamesData: any[]): Promise<void> {
    if (this.engine.isReady) return;

    const startTime = Date.now();
    
    try {
      console.log('🔄 Initializing client search with pre-loaded data...');

      // Create FlexSearch Document instance
      const index = new Document<any>({
        preset: "memory",
        tokenize: "reverse",
        resolution: 7,
    
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
        
            },
            {
              field: "genre",
              tokenize: "strict",
              optimize: true
            },
            {
              field: "developer",
              tokenize: "forward",
              optimize: true
            },
            {
              field: "publisher",
              tokenize: "forward",
              optimize: true
            },
            {
              field: "tags",
              tokenize: "strict",
              optimize: true
            },
            {
              field: "platforms",
              tokenize: "strict"
            },
            {
              field: "systemRequirements",
              tokenize: "strict",
            
              resolution: 5
            }
          ]
        }
      });

      // Index all games
      this.engine.games.clear();
      for (const game of gamesData) {
        await index.add(game);
        this.engine.games.set(game.slug, game);
      }

      this.engine.index = index;
      this.engine.isReady = true;
      
      const loadTime = Date.now() - startTime;
      this.engine.stats = {
        totalGames: gamesData.length,
        indexSize: 0, // We don't need to calculate this for pre-loaded data
        loadTime
      };

      console.log(`✅ Client search ready: ${gamesData.length} games indexed in ${loadTime}ms`);

    } catch (error) {
      console.error('❌ Failed to initialize client search:', error);
      throw error;
    }
  }

  // Original initialize method (fallback to API)
  async initialize(): Promise<void> {
    if (this.engine.isReady) return;

    const startTime = Date.now();
    
    try {
      console.log('🔄 Loading search index from API...');

      const response = await fetch('/api/search/index', {
        next: { revalidate: 3600 }
      });

      if (!response.ok) {
        throw new Error(`Failed to load index: ${response.statusText}`);
      }

      const { index: serializedIndex, games, metadata } = await response.json();

      // Create FlexSearch Document instance  
      const index = new Document<any>({
        preset: "memory",
        tokenize: "reverse", 
        resolution: 7,
        context: {
          resolution: 3,
          depth: 2,
          bidirectional: true
        },
        document: {
          id: "slug",
          index: [
            "title", "shortDescription", "description", 
            "genre", "developer", "publisher", "tags", 
            "platforms", "systemRequirements", "downloadInfo"
          ]
        }
      });

      // Import the pre-built index
      await index.import(serializedIndex);

      // Store games data
      this.engine.games.clear();
      games.forEach((game: any) => {
        this.engine.games.set(game.slug, game);
      });

      this.engine.index = index;
      this.engine.isReady = true;
      
      const loadTime = Date.now() - startTime;
      this.engine.stats = {
        totalGames: games.length,
        indexSize: JSON.stringify(serializedIndex).length,
        loadTime
      };

      console.log(`✅ Search engine ready: ${games.length} games loaded in ${loadTime}ms`);

    } catch (error) {
      console.error('❌ Failed to initialize search engine:', error);
      throw error;
    }
  }

  async search(query: string, options: any = {}): Promise<any> {
    if (!this.engine.isReady) {
      throw new Error('Search engine not initialized');
    }

    const startTime = performance.now();

    try {
      if (!query || query.trim().length === 0) {
        // Return filtered games without search
        const results = Array.from(this.engine.games.values())
          .filter(game => this.applyFilters(game, options))
          .sort((a, b) => this.compareGames(a, b, options))
          .slice(0, options.limit || 100);

        return {
          results,
          total: results.length,
          searchTime: performance.now() - startTime,
          fromCache: true
        };
      }

      // Perform search
      const searchResults = await this.engine.index!.search(query.trim(), {
        limit: options.limit || 100,
        enrich: true,
        suggest: true
      });

      // Process results
      const gameIds = this.extractGameIds(searchResults);
      const results = gameIds
        .map(slug => this.engine.games.get(slug))
        .filter(game => game && this.applyFilters(game, options))
        .sort((a, b) => this.compareGames(a, b, options));

      return {
        results,
        total: results.length,
        searchTime: performance.now() - startTime,
        fromCache: false
      };

    } catch (error) {
      console.error('Search error:', error);
      return {
        results: [],
        total: 0,
        searchTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Search failed'
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

  private applyFilters(game: any, options: any): boolean {
    if (options.genre && game.genre !== options.genre) return false;
    if (options.platform && !game.platforms?.includes(options.platform)) return false;
    if (options.minRating && game.averageRating < options.minRating) return false;
    return true;
  }

  private compareGames(a: any, b: any, options: any): number {
    const sortBy = options.sortBy || 'relevance';
    
    switch (sortBy) {
      case 'relevance':
        // Featured games first
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        // Then by rating
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
    return { ...this.engine.stats, isReady: this.engine.isReady };
  }
}

// Export singleton
export const optimizedGameSearch = new OptimizedGameSearch();
