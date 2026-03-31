// lib/clientSearchEngine.ts
"use client";

import { Document } from "flexsearch";

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
    stats: {
      totalGames: 0,
      indexSize: 0,
      loadTime: 0,
    },
  };

  /* ------------------------------------------------------------------ */
  /*  INITIALISE WITH DATA (used by your hook)                          */
  /* ------------------------------------------------------------------ */
  async initializeWithData(gamesData: any[]): Promise<void> {
    if (this.engine.isReady) return;

    const start = Date.now();

    try {
      console.log("🔍 Initialising client search with pre-loaded data…");

      const index = new Document({
        preset: "memory",
        tokenize: "reverse",
        resolution: 7,
        minlength: 2,
        context: {
          resolution: 3,
          depth: 2,
          bidirectional: true,
        },
        document: {
          id: "slug",
          index: [
            {
              field: "title",
              tokenize: "forward",
              resolution: 9,
            },
            {
              field: "shortDescription",
              tokenize: "forward",
              resolution: 7,
            },
            {
              field: "description",
              tokenize: "strict",
              resolution: 5,
              
            },
            { field: "genre", tokenize: "strict" },
            { field: "developer", tokenize: "forward" },
            { field: "publisher", tokenize: "forward" },
            { field: "tags", tokenize: "strict" },
            { field: "platforms", tokenize: "strict" },
            {
              field: "systemRequirements",
              tokenize: "strict",
              
              resolution: 5,
            },
          ],
        },
      });

      this.engine.games.clear();
      for (const game of gamesData) {
        await index.add(game);
        this.engine.games.set(game.slug, game);
      }

      this.engine.index = index;
      this.engine.isReady = true;

      this.engine.stats = {
        totalGames: gamesData.length,
        indexSize: 0,
        loadTime: Date.now() - start,
      };

      console.log(
        `✅ Client search ready: ${gamesData.length} games indexed in ${this.engine.stats.loadTime}ms`
      );
    } catch (err) {
      console.error("❌ Failed to initialise client search:", err);
      throw err;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  SEARCH (used by your hook)                                        */
  /* ------------------------------------------------------------------ */
  async search(query: string, options: any = {}) {
    if (!this.engine.isReady) {
      throw new Error("Search engine not initialised");
    }

    const start = performance.now();

    try {
      // Empty query - return filtered/sorted games
      if (!query?.trim()) {
        const results = Array.from(this.engine.games.values())
          .filter((g) => this.applyFilters(g, options))
          .sort((a, b) => this.compareGames(a, b, options))
          .slice(0, options.limit ?? 100);

        return {
          results,
          total: results.length,
          searchTime: performance.now() - start,
          fromCache: true,
        };
      }

      // FlexSearch lookup
      const raw = await this.engine.index!.search(query.trim(), {
        limit: options.limit ?? 100,
        enrich: true,
        suggest: true,
      });

      const ids = this.extractGameIds(raw);
      const results = ids
        .map((id) => this.engine.games.get(id))
        .filter((g) => g && this.applyFilters(g, options))
        .sort((a, b) => this.compareGames(a, b, options));

      return {
        results,
        total: results.length,
        searchTime: performance.now() - start,
        fromCache: false,
      };
    } catch (err) {
      console.error("Search error:", err);
      return {
        results: [],
        total: 0,
        searchTime: performance.now() - start,
        error: err instanceof Error ? err.message : "Search failed",
      };
    }
  }

  /* ------------------------------------------------------------------ */
  /*  HELPER METHODS                                                    */
  /* ------------------------------------------------------------------ */
  private extractGameIds(raw: any): string[] {
    const ids = new Set<string>();
    if (!Array.isArray(raw)) return [];

    for (const result of raw) {
      if (result.result && Array.isArray(result.result)) {
        result.result.forEach((item: any) => {
          const id = typeof item === "string" ? item : item?.id || item?.doc?.slug;
          if (id) ids.add(id);
        });
      }
    }
    return Array.from(ids);
  }

  private applyFilters(game: any, options: any): boolean {
    if (options.genre && game.genre !== options.genre) return false;
    if (options.platform && !game.platforms?.includes(options.platform)) return false;
    if (options.minRating && (game.rating || 0) < options.minRating) return false;
    return true;
  }

  private compareGames(a: any, b: any, options: any): number {
    const sortBy = options.sortBy || "relevance";
    
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "releaseDate":
        return new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime();
      case "title":
        return (a.title || "").localeCompare(b.title || "");
      default:
        return 0;
    }
  }

  getStats() {
    return this.engine.stats;
  }

  isInitialized(): boolean {
    return this.engine.isReady;
  }
}

// Export a single instance
export const optimizedGameSearch = new OptimizedGameSearch();
export const clientSearchEngine = optimizedGameSearch;
