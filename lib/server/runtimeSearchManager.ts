// lib/server/runtimeSearchManager.ts
import { Index, Document } from 'flexsearch';
import { promises as fs } from 'fs';
import path from 'path';
import connectDB from '@/lib/mongodb';
import Game from '@/models/Game';

export interface GameData {
  // ADDED INDEX SIGNATURE to satisfy FlexSearch's DocumentData constraint
  [key: string]: any;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  coverImage: string;
  genre: string;
  platforms: string[];
  version: string;
  developer: string;
  publisher: string;
  releaseDate: string;
  requirements: {
    minimum: {
      os: string;
      cpu: string;
      ram: string;
      gpu: string;
      storage: string;
      directx?: string;
    };
    recommended: {
      os: string;
      cpu: string;
      ram: string;
      gpu: string;
      storage: string;
      directx?: string;
    };
  };
  downloadLinks: Array<{
    label: string;
    url: string;
    size?: string;
    host?: string;
  }>;
  fileSize: string;
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  downloadCount: number;
  tags: string[];
  changelog: string;
  createdAt: string;
  updatedAt: string;
  // Flattened fields for search
  systemRequirements: string;
  downloadInfo: string;
}

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
  
  private readonly CACHE_DIR = path.join(process.cwd(), '.cache', 'search');
  private readonly CACHE_FILE = path.join(this.CACHE_DIR, 'runtime-index.json');
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
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

  private startPeriodicChecks() {
    this.checkTimer = setInterval(async () => {
      try {
        await this.checkForChanges();
      } catch (error) {
        console.error('Error during periodic check:', error);
      }
    }, this.CHECK_INTERVAL);

    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }

  private cleanup() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Runtime Search Manager...');

    try {
      const cachedData = await this.loadFromCache();
      
      if (cachedData && await this.validateCache(cachedData)) {
        console.log('✅ Using cached search index');
        this.indexCache = cachedData;
        return;
      }

      await this.buildIndex();
      
    } catch (error) {
      console.error('❌ Failed to initialize search manager:', error);
      throw error;
    }
  }

  private async buildIndex(): Promise<void> {
    if (this.isBuilding) {
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

      // ALL optimize: true REMOVED to satisfy DocumentOptions typings
      const index = new Document<GameData>({
        preset: "memory",
        tokenize: "reverse",
        resolution: 7,
        minlength: 2,
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

      const processedGames: GameData[] = [];
      
      for (const game of games) {
        const processedGame = this.processGameData(game);
        await index.add(processedGame);
        processedGames.push(processedGame);
      }

      const serializedIndex = await index.export();
      
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

      await this.saveToCache(this.indexCache);

      const buildTime = Date.now() - startTime;
      console.log(`✅ Search index built: ${games.length} games in ${buildTime}ms`);

    } catch (error) {
      console.error('❌ Failed to build search index:', error);
      throw error;
    }
  }

  private processGameData(game: any): GameData {
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

  private async checkForChanges(): Promise<void> {
    if (!this.indexCache || this.isBuilding) return;

    try {
      await connectDB();
      
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
      
      const needsRebuild = 
        currentData.count !== this.indexCache.metadata.totalGames ||
        currentChecksum !== this.indexCache.metadata.dataChecksum;

      if (needsRebuild) {
        console.log('🔄 Data changes detected, rebuilding search index...');
        await this.buildIndex();
      }

    } catch (error) {
      console.error('Error checking for changes:', error);
    }
  }

  private async validateCache(cachedData: IndexCache): Promise<boolean> {
    if (cachedData.metadata.version !== this.INDEX_VERSION) {
      return false;
    }

    try {
      await connectDB();
      const gameCount = await Game.countDocuments();
      return gameCount === cachedData.metadata.totalGames;
    } catch (error) {
      return false;
    }
  }

  private async loadFromCache(): Promise<IndexCache | null> {
    try {
      const data = await fs.readFile(this.CACHE_FILE, 'utf-8');
      const cachedData: IndexCache = JSON.parse(data);
      console.log(`📂 Loaded cached index: ${cachedData.metadata.totalGames} games`);
      return cachedData;
    } catch (error) {
      return null;
    }
  }

  private async saveToCache(data: IndexCache): Promise<void> {
    try {
      await fs.writeFile(this.CACHE_FILE, JSON.stringify(data, null, 0));
      console.log('💾 Search index cached to disk');
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  private generateChecksum(games: any[]): string {
    const data = games
      .map(g => `${g._id}:${g.updatedAt}`)
      .sort()
      .join('');
    return Buffer.from(data).toString('base64');
  }

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
