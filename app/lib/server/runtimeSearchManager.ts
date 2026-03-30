// lib/server/runtimeSearchManager.ts
import { Index, Document } from 'flexsearch';
import { promises as fs } from 'fs';
import path from 'path';
import connectDB from '@/lib/mongodb';
import Game from '@/models/Game';
import { GameData } from '@/lib/clientSearch';

interface IndexCache {
  serializedIndex: any;
  gamesData: GameData[];
  metadata: {
    totalGames: number;
    lastUpdated: number;
    version: string;
    dataChecksum: string;
    nextCheckTime: number;
  };
}

class RuntimeSearchManager {
  private static instance: RuntimeSearchManager;
  private indexCache: IndexCache | null = null;
  private isBuilding = false;
  private buildPromise: Promise<void> | null = null;
  
  // Configuration
  private readonly CACHE_DIR = path.join(process.cwd(), '.cache', 'search');
  private readonly CACHE_FILE = path.join(this.CACHE_DIR, 'runtime-index.json');
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
  private readonly INDEX_VERSION = '1.0.0';
  private checkTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.ensureCacheDir();
    this.startPeriodicChecks();
  }

  static getInstance(): RuntimeSearchManager {
    if (!RuntimeSearchManager.instance) {
      RuntimeSearchManager.instance = new RuntimeSearchManager();
    }
    return RuntimeSearchManager.instance;
  }

  private async ensureCacheDir() {
    try {
      await fs.mkdir(this.CACHE_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create cache directory:', error);
    }
  }

  // Start periodic change detection
  private startPeriodicChecks() {
    this.checkTimer = setInterval(async () => {
      try {
        await this.checkForChanges();
      } catch (error) {
        console.error('Error during periodic check:', error);
      }
    }, this.CHECK_INTERVAL);

    // Also check on process exit
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }

  private cleanup() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
  }

  // Initialize the search system
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Runtime Search Manager...');

    try {
      // Try to load from cache first
      const cachedData = await this.loadFromCache();
      
      if (cachedData && await this.validateCache(cachedData)) {
        console.log('✅ Using cached search index');
        this.indexCache = cachedData;
        return;
      }

      // Build new index
      await this.buildIndex();
      
    } catch (error) {
      console.error('❌ Failed to initialize search manager:', error);
      throw error;
    }
  }

  // Build the search index
  private async buildIndex(): Promise<void> {
    if (this.isBuilding) {
      // If already building, wait for it to complete
      if (this.buildPromise) {
        await this.buildPromise;
      }
      return;
    }

    this.isBuilding = true;
    this.buildPromise = this._buildIndexInternal();
    
    try {
      await this.buildPromise;
    } finally {
      this.isBuilding = false;
      this.buildPromise = null;
    }
  }

  private async _buildIndexInternal(): Promise<void> {
    console.log('🔄 Building search index...');
    const startTime = Date.now();

    try {
      await connectDB();
      
      // Fetch all games with change tracking
      const games = await Game.find({})
        .select({
          title: 1,
          slug: 1,
          description: 1,
          shortDescription: 1,
          coverImage: 1,
          genre: 1,
          platforms: 1,
          version: 1,
          developer: 1,
          publisher: 1,
          releaseDate: 1,
          requirements: 1,
          downloadLinks: 1,
          fileSize: 1,
          isFeatured: 1,
          averageRating: 1,
          reviewCount: 1,
          downloadCount: 1,
          tags: 1,
          changelog: 1,
          createdAt: 1,
          updatedAt: 1
        })
        .lean();

      // Create optimized FlexSearch index
      const index = new Document<GameData>({
        preset: "memory",
        tokenize: "reverse",
        resolution: 7,
        minlength: 2,
        optimize: true,
        fastupdate: false, // Disable for better memory usage
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
              optimize: true,
              resolution: 9
            },
            {
              field: "shortDescription",
              tokenize: "forward",
              optimize: true,
              resolution: 7
            },
            {
              field: "description",
              tokenize: "strict",
              optimize: true,
              resolution: 5,
              minlength: 3
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
              minlength: 3,
              resolution: 5
            },
            {
              field: "downloadInfo",
              tokenize: "strict",
              minlength: 2,
              resolution: 5
            }
          ]
        }
      });

      // Process and index games
      const processedGames: GameData[] = [];
      
      for (const game of games) {
        const processedGame = this.processGameData(game);
        await index.add(processedGame);
        processedGames.push(processedGame);
      }

      // Serialize the index
      const serializedIndex = await index.export();
      
      // Create cache data
      this.indexCache = {
        serializedIndex,
        gamesData: processedGames,
        metadata: {
          totalGames: games.length,
          lastUpdated: Date.now(),
          version: this.INDEX_VERSION,
          dataChecksum: this.generateChecksum(games),
          nextCheckTime: Date.now() + this.CHECK_INTERVAL
        }
      };

      // Save to cache file
      await this.saveToCache(this.indexCache);

      const buildTime = Date.now() - startTime;
      console.log(`✅ Search index built: ${games.length} games in ${buildTime}ms`);
      console.log(`📦 Memory usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`);

    } catch (error) {
      console.error('❌ Failed to build search index:', error);
      throw error;
    }
  }

  // Process game data for indexing
  private processGameData(game: any): GameData & { 
    systemRequirements: string;
    downloadInfo: string;
  } {
    const systemRequirements = [
      game.requirements?.minimum?.os,
      game.requirements?.minimum?.cpu,
      game.requirements?.minimum?.ram,
      game.requirements?.minimum?.gpu,
      game.requirements?.minimum?.storage,
      game.requirements?.minimum?.directx,
      game.requirements?.recommended?.os,
      game.requirements?.recommended?.cpu,
      game.requirements?.recommended?.ram,
      game.requirements?.recommended?.gpu,
      game.requirements?.recommended?.storage,
      game.requirements?.recommended?.directx
    ].filter(Boolean).join(' ').toLowerCase();

    const downloadInfo = game.downloadLinks?.map((link: any) => 
      `${link.label} ${link.host || ''} ${link.size || ''}`
    ).join(' ').toLowerCase() || '';

    return {
      ...game,
      systemRequirements,
      downloadInfo
    };
  }

  // Check for data changes
  private async checkForChanges(): Promise<void> {
    if (!this.indexCache || this.isBuilding) return;

    try {
      await connectDB();
      
      // Get latest update timestamps
      const latestUpdates = await Game.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            lastUpdated: { $max: "$updatedAt" },
            checksum: { 
              $push: { 
                $concat: [
                  { $toString: "$_id" }, 
                  ":", 
                  { $toString: "$updatedAt" }
                ] 
              }
            }
          }
        }
      ]);

      if (latestUpdates.length === 0) return;

      const currentData = latestUpdates[0];
      const currentChecksum = Buffer.from(currentData.checksum.join('')).toString('base64');
      
      // Check if rebuild is needed
      const needsRebuild = 
        currentData.count !== this.indexCache.metadata.totalGames ||
        currentChecksum !== this.indexCache.metadata.dataChecksum;

      if (needsRebuild) {
        console.log('🔄 Data changes detected, rebuilding search index...');
        await this.buildIndex();
      } else {
        console.log('✅ No changes detected, index is up to date');
      }

    } catch (error) {
      console.error('Error checking for changes:', error);
    }
  }

  // Validate cached data
  private async validateCache(cachedData: IndexCache): Promise<boolean> {
    if (cachedData.metadata.version !== this.INDEX_VERSION) {
      console.log('🔄 Cache version mismatch, rebuilding...');
      return false;
    }

    try {
      await connectDB();
      const gameCount = await Game.countDocuments();
      
      if (gameCount !== cachedData.metadata.totalGames) {
        console.log('🔄 Game count changed, rebuilding...');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating cache:', error);
      return false;
    }
  }

  // Load from cache file
  private async loadFromCache(): Promise<IndexCache | null> {
    try {
      const data = await fs.readFile(this.CACHE_FILE, 'utf-8');
      const cachedData: IndexCache = JSON.parse(data);
      console.log(`📂 Loaded cached index: ${cachedData.metadata.totalGames} games`);
      return cachedData;
    } catch (error) {
      console.log('📂 No cached index found');
      return null;
    }
  }

  // Save to cache file
  private async saveToCache(data: IndexCache): Promise<void> {
    try {
      await fs.writeFile(this.CACHE_FILE, JSON.stringify(data, null, 0));
      console.log('💾 Search index cached to disk');
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  // Generate checksum for change detection
  private generateChecksum(games: any[]): string {
    const data = games
      .map(g => `${g._id}:${g.updatedAt}`)
      .sort()
      .join('');
    return Buffer.from(data).toString('base64');
  }

  // Get current index data
  async getIndexData(): Promise<{
    index: any;
    games: GameData[];
    metadata: any;
  } | null> {
    if (!this.indexCache) {
      await this.initialize();
    }

    if (!this.indexCache) {
      return null;
    }

    return {
      index: this.indexCache.serializedIndex,
      games: this.indexCache.gamesData,
      metadata: this.indexCache.metadata
    };
  }

  // Force rebuild
  async forceRebuild(): Promise<void> {
    console.log('🔄 Force rebuilding search index...');
    await this.buildIndex();
  }

  // Get status
  getStatus() {
    return {
      isReady: !!this.indexCache,
      isBuilding: this.isBuilding,
      totalGames: this.indexCache?.metadata.totalGames || 0,
      lastUpdated: this.indexCache?.metadata.lastUpdated || 0,
      nextCheck: this.indexCache?.metadata.nextCheckTime || 0,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
    };
  }
}

export const runtimeSearchManager = RuntimeSearchManager.getInstance();
