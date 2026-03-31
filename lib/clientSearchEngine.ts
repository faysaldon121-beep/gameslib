// lib/clientSearchOptimized.ts
"use client";

import { Document } from "flexsearch";

interface OptimizedSearchEngine {
  index: Document | null;
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
  /*  INITIALISE WITH DATA (runs in the browser when you already have   */
  /*  the games array in memory – e.g. injected by next-server props)   */
  /* ------------------------------------------------------------------ */
  async initializeWithData(gamesData: any[]): Promise<void> {
    if (this.engine.isReady) return;

    const start = Date.now();

    try {
      console.log("🔍  Initialising client search with pre-loaded data…");

      // -------  CREATE THE FLEXSEARCH DOCUMENT INDEX  ------- //
      const index = new Document({
        /* index-wide options */
        preset: "memory",
        tokenize: "reverse",
        resolution: 7,
        minlength: 2,
        optimize: true,               // <-- stays here
        context: {
          resolution: 3,
          depth: 2,
          bidirectional: true,
        },

        /* document/field options */
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
              minlength: 3,
            },
            { field: "genre", tokenize: "strict" },
            { field: "developer", tokenize: "forward" },
            { field: "publisher", tokenize: "forward" },
            { field: "tags", tokenize: "strict" },
            { field: "platforms", tokenize: "strict" },
            {
              field: "systemRequirements",
              tokenize: "strict",
              minlength: 3,
              resolution: 5,
            },
          ],
        },
      });

      // -------  ADD GAMES TO THE INDEX  ------- //
      this.engine.games.clear();
      for (const game of gamesData) {
        await index.add(game);
        this.engine.games.set(game.slug, game);
      }

      this.engine.index = index;
      this.engine.isReady = true;

      this.engine.stats = {
        totalGames: gamesData.length,
        indexSize: 0, // not measured for in-memory init
        loadTime: Date.now() - start,
      };

      console.log(
        `✅  Client search ready: ${gamesData.length} games indexed in ${
          this.engine.stats.loadTime
        } ms`,
      );
    } catch (err) {
      console.error("❌  Failed to initialise client search:", err);
      throw err;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  FALLBACK INITIALISER (downloads a pre-built index from /api)      */
  /* ------------------------------------------------------------------ */
  async initialize(): Promise<void> {
    if (this.engine.isReady) return;

    const start = Date.now();

    try {
      console.log("⬇️  Loading search index from API…");
      const res = await fetch("/api/search/index", {
        next: { revalidate: 3600 },
      });
      if (!res.ok) throw new Error(`Failed to load index: ${res.statusText}`);

      const { index: serialized, games } = await res.json();

      const index = new Document({
        preset: "memory",
        tokenize: "reverse",
        resolution: 7,
        minlength: 2,
        optimize: true, // root-level
        context: { resolution: 3, depth: 2, bidirectional: true },
        document: {
          id: "slug",
          /* simple form because the index is already built */
          index: [
            "title",
            "shortDescription",
            "description",
            "genre",
            "developer",
            "publisher",
            "tags",
            "platforms",
            "systemRequirements",
            "downloadInfo",
          ],
        },
      });

      await index.import(serialized);

      this.engine.games.clear();
      games.forEach((g: any) => this.engine.games.set(g.slug, g));

      this.engine.index = index;
      this.engine.isReady = true;

      this.engine.stats = {
        totalGames: games.length,
        indexSize: JSON.stringify(serialized).length,
        loadTime: Date.now() - start,
      };

      console.log(
        `✅  Search engine ready: ${games.length} games loaded in ${
          this.engine.stats.loadTime
        } ms`,
      );
    } catch (err) {
      console.error("❌  Failed to initialise search engine:", err);
      throw err;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  SEARCH, HELPERS, ETC.  (unchanged)                                */
  /* ------------------------------------------------------------------ */

  async search(query: string, options: any = {}) {
    if (!this.engine.isReady) throw new Error("Search engine not initialised");

    const start = performance.now();

    try {
      // empty query – just apply filters/sorting
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

  /* --- helper methods below are unchanged and omitted for brevity --- */
  /* extractGameIds, applyFilters, compareGames, getStats … */
}

export const clientSearchEngine = optimizedGameSearch;
