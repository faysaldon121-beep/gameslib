// lib/server/search-system.ts
import { Index, Document } from 'flexsearch';
import { promises as fs } from 'fs';
import { createReadStream, createWriteStream, Readable } from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import zlib from 'zlib';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import type { WithId, Document as MongooseDoc } from 'mongoose';
import connectDB from '@/lib/mongodb';
import Game from '@/models/Game';

const pipe = promisify(pipeline);

// ==================== TYPES ====================

export interface SearchableGame {
  // Core search fields
  slug: string;
  title: string;
  shortDescription?: string;
  genre?: string;
  developer?: string;
  publisher?: string;
  tags?: string[];
  platforms?: string[];
  
  // Computed/search-optimized fields
  _searchVector?: string; // Pre-combined search vector
  _systemRequirements?: string;
  _downloadInfo?: string;
  
  // Metadata
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  downloadCount: number;
  releaseDate: string;
  updatedAt: number; // Timestamp for change detection
  
  // Minimal cover for UI
  coverImage?: string;
}

export interface SearchResult {
  slug: string;
  title: string;
  shortDescription?: string;
  coverImage?: string;
  genre?: string;
  score: number;
  fields: string[]; // Which fields matched
  context?: {
    genre?: string;
    platform?: string;
  };
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  genre?: string;
  platform?: string;
  minRating?: number;
  featuredOnly?: boolean;
  enhanceWithMetadata?: boolean; // Fetch full game data for top results
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  rebuilds: number;
  lastRebuildDuration: number;
  cacheAge: number;
  size: number;
  memoryUsage: number;
}

export interface SystemMetrics {
  searchCount: number;
  avgSearchTime: number;
  cache: CacheMetrics;
  indexSize: number;
  uptime: number;
  version: string;
}

// ==================== EXCEPTIONS ====================

export class SearchError extends Error {
  constructor(
    message: string,
    public code: 'INIT_FAILED' | 'CACHE_CORRUPT' | 'DB_ERROR' | 'INDEX_ERROR',
    public cause?: Error
  ) {
    super(message);
    this.name = 'SearchError';
  }
}

// ==================== UTILITIES ====================

class MetricsCollector extends EventEmitter {
  private searchTimes: number[] = [];
  private searchCount = 0;
  private startTime = Date.now();
  
  recordSearch(timeMs: number) {
    this.searchTimes.push(timeMs);
    this.searchCount++;
    
    // Keep only last 1000 samples
    if (this.searchTimes.length > 1000) {
      this.searchTimes = this.searchTimes.slice(-500);
    }
    
    this.emit('update', this.getMetrics());
  }
  
  getMetrics() {
    const recent = this.searchTimes.slice(-100);
    const avgRecent = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
    
    return {
      totalSearches: this.searchCount,
      avgTime: this.searchTimes.length ? 
        this.searchTimes.reduce((a, b) => a + b, 0) / this.searchTimes.length : 0,
      recentAvg: avgRecent,
      p95: this.percentile(this.searchTimes, 95),
      p99: this.percentile(this.searchTimes, 99),
      uptime: Date.now() - this.startTime
    };
  }
  
  private percentile(arr: number[], p: number) {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[idx] || sorted[sorted.length - 1];
  }
}

// ==================== CACHE MANAGER ====================

class CacheManager {
  private cacheDir: string;
  private indexFile: string;
  private gamesFile: string;
  private metadataFile: string;
  private lockFile: string;
  
  // Cache metadata format
  private metadataSchema = {
    version: '1.0.0',
    indexVersion: 'flexsearch-4.0',
    createdAt: 0,
    updatedAt: 0,
    gameCount: 0,
    checksum: '',
    compression: 'gzip',
    format: 'binary',
    schema: 'searchable-game'
  };

  constructor() {
    const cacheRoot = this.getCacheRoot();
    this.cacheDir = path.join(cacheRoot, 'search-system');
    this.indexFile = path.join(this.cacheDir, 'index.bin.gz');
    this.gamesFile = path.join(this.cacheDir, 'games.json.gz');
    this.metadataFile = path.join(this.cacheDir, 'metadata.json');
    this.lockFile = path.join(this.cacheDir, '.lock');
  }

  private getCacheRoot(): string {
    // Priority 1: Explicit config
    if (process.env.SEARCH_CACHE_DIR) {
      return process.env.SEARCH_CACHE_DIR;
    }

    // Priority 2: Serverless (use /tmp)
    const isServerless = 
      process.env.AWS_REGION || 
      process.env.VERCEL || 
      process.env.NODE_ENV === 'production' && !process.env.DOCKER;
    
    if (isServerless) {
      return process.env.TMPDIR || '/tmp';
    }

    // Priority 3: Local project directory
    return path.join(process.cwd(), '.cache');
  }

  async acquireLock(timeoutMs = 30000): Promise<boolean> {
    const start = Date.now();
    
    while (Date.now() - start < timeoutMs) {
      try {
        await fs.mkdir(this.lockFile, { recursive: true });
        return true;
      } catch (error: any) {
        if (error.code === 'EEXIST') {
          await this.sleep(100);
          continue;
        }
        throw error;
      }
    }
    
    return false;
  }

  async releaseLock(): Promise<void> {
    try {
      await fs.rm(this.lockFile, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  }

  async save(
    index: Record<string, any>,
    games: SearchableGame[],
    metadata: Partial<typeof this.metadataSchema>
  ): Promise<void> {
    const fullMetadata = { ...this.metadataSchema, ...metadata };
    fullMetadata.updatedAt = Date.now();
    fullMetadata.gameCount = games.length;
    fullMetadata.checksum = this.checksum(games);

    try {
      await this.acquireLock();
      
      // Save metadata first (small, atomic)
      await fs.writeFile(
        this.metadataFile, 
        JSON.stringify(fullMetadata, null, 2)
      );

      // Save games (compressed)
      const gamesJson = JSON.stringify(games);
      await pipe(
        Readable.from([gamesJson]),
        zlib.createGzip({ level: zlib.constants.Z_BEST_COMPRESSION }),
        createWriteStream(this.gamesFile)
      );

      // Save index (compressed binary)
      const indexJson = JSON.stringify(index);
      await pipe(
        Readable.from([indexJson]),
        zlib.createGzip({ level: zlib.constants.Z_BEST_SPEED }),
        createWriteStream(this.indexFile)
      );

      // Atomic update: write a marker file when complete
      await fs.writeFile(
        path.join(this.cacheDir, '.complete'),
        fullMetadata.updatedAt.toString()
      );
    } finally {
      await this.releaseLock();
    }
  }

  async load(): Promise<{
    index: Record<string, any>;
    games: SearchableGame[];
    metadata: typeof this.metadataSchema;
  } | null> {
    try {
      // Check if complete marker exists
      const markerPath = path.join(this.cacheDir, '.complete');
      try {
        await fs.access(markerPath);
      } catch {
        return null; // Incomplete write
      }

      // Load metadata
      const metadataJson = await fs.readFile(this.metadataFile, 'utf-8');
      const metadata = JSON.parse(metadataJson) as typeof this.metadataSchema;

      // Validate metadata
      if (metadata.version !== this.metadataSchema.version) {
        throw new Error('Metadata version mismatch');
      }

      // Validate cache age (optional)
      const maxAge = process.env.SEARCH_CACHE_MAX_AGE 
        ? parseInt(process.env.SEARCH_CACHE_MAX_AGE) * 60 * 60 * 1000 
        : 24 * 60 * 60 * 1000; // 24 hours default
      
      if (Date.now() - metadata.updatedAt > maxAge) {
        return null; // Cache too old
      }

      // Load games
      const gamesStream = createReadStream(this.gamesFile).pipe(zlib.createGunzip());
      const gamesChunks: Buffer[] = [];
      for await (const chunk of gamesStream) {
        gamesChunks.push(chunk);
      }
      const games = JSON.parse(Buffer.concat(gamesChunks).toString()) as SearchableGame[];

      // Load index
      const indexStream = createReadStream(this.indexFile).pipe(zlib.createGunzip());
      const indexChunks: Buffer[] = [];
      for await (const chunk of indexStream) {
        indexChunks.push(chunk);
      }
      const index = JSON.parse(Buffer.concat(indexChunks).toString()) as Record<string, any>;

      return { index, games, metadata };
    } catch (error: any) {
      if (error.code === 'ENOENT') return null;
      
      console.warn('Cache load failed:', error.message);
      
      // Try to recover by deleting corrupt cache
      try {
        await fs.rm(this.cacheDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
      
      return null;
    }
  }

  async clear(): Promise<void> {
    try {
      await fs.rm(this.cacheDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Cache clear failed:', error.message);
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const stats = await fs.stat(this.cacheDir);
      return stats.size;
    } catch {
      return 0;
    }
  }

  private checksum(games: SearchableGame[]): string {
    const hash = crypto.createHash('sha256');
    const data = games
      .map(g => `${g.slug}:${g.updatedAt}`)
      .sort()
      .join('\n');
    hash.update(data);
    return hash.digest('hex');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ==================== SEARCH INDEX BUILDER ====================

class IndexBuilder {
  private readonly BATCH_SIZE = 500;
  private readonly WORKER_ENABLED = process.env.USE_INDEX_WORKER === 'true';
  
  // Field-specific tokenization strategies
  private readonly FIELD_CONFIG = {
    title: { tokenize: 'forward', resolution: 9, weight: 1.5 },
    shortDescription: { tokenize: 'forward', resolution: 7, weight: 1.2 },
    genre: { tokenize: false, weight: 1.3 },
    tags: { tokenize: false, weight: 1.1 },
    developer: { tokenize: 'forward', resolution: 5, weight: 0.9 },
    publisher: { tokenize: 'forward', resolution: 5, weight: 0.9 },
    platforms: { tokenize: false, weight: 1.0 },
    systemRequirements: { tokenize: 'strict', resolution: 3, weight: 0.7 },
    downloadInfo: { tokenize: 'strict', resolution: 3, weight: 0.5 }
  };

  async build(games: WithId<MongooseDoc<Game>>[]): Promise<{
    index: Record<string, any>;
    searchable: SearchableGame[];
  }> {
    if (this.WORKER_ENABLED && games.length > 1000) {
      return this.buildInWorker(games);
    }
    
    return this.buildInProcess(games);
  }

  private async buildInProcess(games: WithId<MongooseDoc<Game>>[]): Promise<{
    index: Record<string, any>;
    searchable: SearchableGame[];
  }> {
    const index = new Document<SearchableGame>({
      preset: 'memory',
      tokenize: 'reverse',
      resolution: 7,
      context: {
        resolution: 3,
        depth: 2,
        bidirectional: true
      },
      document: {
        id: 'slug',
        index: this.getFieldConfigurations()
      }
    });

    const searchableGames: SearchableGame[] = [];
    const batchCount = Math.ceil(games.length / this.BATCH_SIZE);

    for (let batch = 0; batch < batchCount; batch++) {
      const start = batch * this.BATCH_SIZE;
      const end = Math.min(start + this.BATCH_SIZE, games.length);
      const batchGames = games.slice(start, end);
      
      const processed = batchGames.map(game => this.processGame(game));
      searchableGames.push(...processed);
      
      // Add batch to index
      await index.add(processed);
      
      // Yield to event loop periodically
      if (batch % 10 === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }

    // Export index
    const serialized: Record<string, any> = {};
    await new Promise<void>((resolve, reject) => {
      index.export((key, data) => {
        serialized[key] = data;
      });
      
      // Small delay to ensure export completes
      setImmediate(() => {
        try {
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });

    return { index: serialized, searchable: searchableGames };
  }

  private async buildInWorker(games: WithId<MongooseDoc<Game>>[]): Promise<{
    index: Record<string, any>;
    searchable: SearchableGame[];
  }> {
    // Worker implementation would go here
    // For now, fallback to in-process
    return this.buildInProcess(games);
  }

  private getFieldConfigurations() {
    return Object.entries(this.FIELD_CONFIG).map(([field, config]) => ({
      field,
      tokenize: config.tokenize as any,
      resolution: config.resolution,
      weight: config.weight
    }));
  }

  private processGame(game: WithId<MongooseDoc<Game>>): SearchableGame {
    const gameData = game.toJSON ? game.toJSON() : game;
    
    // Pre-combine search vectors for faster indexing
    const searchVector = [
      gameData.title,
      gameData.shortDescription,
      gameData.genre,
      ...(gameData.tags || []),
      gameData.developer,
      gameData.publisher
    ].filter(Boolean).join(' ').toLowerCase();

    const systemRequirements = this.extractSystemRequirements(gameData.requirements);
    const downloadInfo = this.extractDownloadInfo(gameData.downloadLinks);

    return {
      slug: gameData.slug,
      title: gameData.title,
      shortDescription: gameData.shortDescription,
      genre: gameData.genre,
      developer: gameData.developer,
      publisher: gameData.publisher,
      tags: gameData.tags,
      platforms: gameData.platforms,
      _searchVector: searchVector,
      _systemRequirements: systemRequirements,
      _downloadInfo: downloadInfo,
      isFeatured: gameData.isFeatured,
      averageRating: gameData.averageRating,
      reviewCount: gameData.reviewCount,
      downloadCount: gameData.downloadCount,
      releaseDate: gameData.releaseDate,
      updatedAt: new Date(gameData.updatedAt).getTime(),
      coverImage: gameData.coverImage
    };
  }

  private extractSystemRequirements(requirements: any): string {
    if (!requirements) return '';
    
    const parts = [
      requirements.minimum?.os,
      requirements.minimum?.cpu,
      requirements.minimum?.ram,
      requirements.minimum?.gpu,
      requirements.minimum?.storage,
      requirements.recommended?.os,
      requirements.recommended?.cpu,
      requirements.recommended?.ram,
      requirements.recommended?.gpu,
      requirements.recommended?.storage
    ].filter(Boolean);
    
    return parts.join(' ').toLowerCase();
  }

  private extractDownloadInfo(downloadLinks: any[]): string {
    if (!downloadLinks?.length) return '';
    
    return downloadLinks
      .map(link => `${link.label} ${link.host || ''} ${link.size || ''}`.toLowerCase())
      .join(' ');
  }
}

// ==================== SEARCH EXECUTOR ====================

class SearchExecutor {
  private index: Document<SearchableGame>;
  private games: Map<string, SearchableGame>;

  constructor(
    serializedIndex: Record<string, any>,
    games: SearchableGame[]
  ) {
    this.games = new Map(games.map(g => [g.slug, g]));
    this.index = new Document<SearchableGame>({ preset: 'memory' });
    
    // Import serialized index
    Object.entries(serializedIndex).forEach(([key, value]) => {
      this.index.add(value);
    });
  }

  async search(
    query: string, 
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const startTime = Date.now();
    
    try {
      // Normalize query
      const normalizedQuery = this.normalizeQuery(query);
      
      // Perform search
      const results = await this.index.search(normalizedQuery, {
        limit: options.limit || 20,
        enrich: true
      }) as Array<{ id: string; result: SearchableGame; score: number }>;

      // Filter and enhance results
      let filtered = this.filterResults(results, options);
      
      // Apply pagination
      const offset = options.offset || 0;
      filtered = filtered.slice(offset, offset + (options.limit || 20));

      // Format results
      const formatted = filtered.map(r => this.formatResult(r));
      
      const duration = Date.now() - startTime;
      this.emit('search', { query, duration, count: formatted.length });
      
      return formatted;
    } catch (error) {
      console.error('Search failed:', error);
      throw new SearchError(
        `Search failed for query: ${query}`,
        'INDEX_ERROR',
        error
      );
    }
  }

  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ');
  }

  private filterResults(
    results: Array<{ id: string; result: SearchableGame; score: number }>,
    options: SearchOptions
  ): Array<{ result: SearchableGame; score: number }> {
    return results.filter(item => {
      const game = item.result;
      
      // Genre filter
      if (options.genre && game.genre !== options.genre) {
        return false;
      }
      
      // Platform filter
      if (options.platform && !game.platforms?.includes(options.platform)) {
        return false;
      }
      
      // Rating filter
      if (options.minRating && game.averageRating < options.minRating) {
        return false;
      }
      
      // Featured only
      if (options.featuredOnly && !game.isFeatured) {
        return false;
      }
      
      return true;
    });
  }

  private formatResult(
    item: { result: SearchableGame; score: number }
  ): SearchResult {
    const game = item.result;
    
    return {
      slug: game.slug,
      title: game.title,
      shortDescription: game.shortDescription,
      coverImage: game.coverImage,
      genre: game.genre,
      score: item.score,
      fields: this.getMatchedFields(game), // Would need to track which fields matched
      context: {
        genre: game.genre,
        platform: game.platforms?.[0]
      }
    };
  }

  private getMatchedFields(game: SearchableGame): string[] {
    // This would require tracking which fields contributed to the score
    // FlexSearch doesn't expose this directly, so we'd need to enhance
    return []; // Placeholder
  }

  getGame(slug: string): SearchableGame | undefined {
    return this.games.get(slug);
  }

  getAllGames(): SearchableGame[] {
    return Array.from(this.games.values());
  }

  getSize(): number {
    return this.games.size;
  }
}

// ==================== CHANGE DETECTOR ====================

class ChangeDetector {
  private lastCheck = 0;
  private gameCount = 0;
  private checksumMap = new Map<string, string>();
  private checkInterval: NodeJS.Timeout | null = null;
  
  constructor(
    private onChangesDetected: (changes: Change[]) => Promise<void>,
    private checkIntervalMs = 5 * 60 * 1000
  ) {}

  async initialize(): Promise<void> {
    await this.refreshBaseline();
    this.startPeriodicChecks();
  }

  private async refreshBaseline(): Promise<void> {
    try {
      await connectDB();
      const games = await Game.find({}, { slug: 1, updatedAt: 1 }).lean();
      
      this.gameCount = games.length;
      this.checksumMap.clear();
      
      for (const game of games) {
        this.checksumMap.set(
          game.slug,
          new Date(game.updatedAt).getTime().toString()
        );
      }
      
      this.lastCheck = Date.now();
    } catch (error) {
      console.error('Failed to refresh baseline:', error);
      throw error;
    }
  }

  private startPeriodicChecks() {
    this.checkInterval = setInterval(async () => {
      await this.checkForChanges();
    }, this.checkIntervalMs);
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkForChanges(): Promise<void> {
    try {
      await connectDB();
      
      // Get current state
      const current = await Game.find({}, { 
        slug: 1, 
        updatedAt: 1,
        __v: 1 
      }).lean();
      
      const currentCount = current.length;
      const currentMap = new Map<string, string>();
      
      for (const game of current) {
        currentMap.set(
          game.slug,
          new Date(game.updatedAt).getTime().toString()
        );
      }
      
      // Detect changes
      const changes: Change[] = [];
      
      // Check for updates and new games
      for (const [slug, timestamp] of currentMap) {
        const oldTimestamp = this.checksumMap.get(slug);
        
        if (!oldTimestamp) {
          changes.push({ type: 'created', slug, timestamp });
        } else if (oldTimestamp !== timestamp) {
          changes.push({ type: 'updated', slug, timestamp });
        }
      }
      
      // Check for deletions
      for (const [slug] of this.checksumMap) {
        if (!currentMap.has(slug)) {
          changes.push({ type: 'deleted', slug, timestamp: Date.now().toString() });
        }
      }
      
      // Update baseline if changes detected
      if (changes.length > 0 || currentCount !== this.gameCount) {
        console.log(`Detected ${changes.length} changes in games collection`);
        await this.onChangesDetected(changes);
        await this.refreshBaseline();
      }
    } catch (error) {
      console.error('Change detection failed:', error);
    }
  }
}

interface Change {
  type: 'created' | 'updated' | 'deleted';
  slug: string;
  timestamp: string;
}

// ==================== MAIN SEARCH SYSTEM ====================

export class SearchSystem {
  private static instance: SearchSystem;
  private executor: SearchExecutor | null = null;
  private cacheManager: CacheManager;
  private indexBuilder: IndexBuilder;
  private metrics: MetricsCollector;
  private changeDetector: ChangeDetector | null = null;
  private isInitialized = false;
  private isBuilding = false;
  private buildStartTime = 0;
  
  // Configuration
  private readonly config = {
    cacheEnabled: process.env.SEARCH_CACHE_ENABLED !== 'false',
    autoRefresh: process.env.SEARCH_AUTO_REFRESH !== 'false',
    changeDetection: process.env.SEARCH_CHANGE_DETECTION || 'polling', // 'polling' | 'change-streams' | 'none'
    warmupOnStart: process.env.SEARCH_WARMUP === 'true',
    maxCacheAge: process.env.SEARCH_CACHE_MAX_AGE 
      ? parseInt(process.env.SEARCH_CACHE_MAX_AGE) * 60 * 60 * 1000 
      : 24 * 60 * 60 * 1000
  };

  private constructor() {
    this.cacheManager = new CacheManager();
    this.indexBuilder = new IndexBuilder();
    this.metrics = new MetricsCollector();
    this.setupProcessHandlers();
  }

  static getInstance(): SearchSystem {
    if (!SearchSystem.instance) {
      SearchSystem.instance = new SearchSystem();
    }
    return SearchSystem.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('🚀 Initializing Search System v1.0.0...');
    const startTime = Date.now();

    try {
      // Step 1: Try to load from cache
      if (this.config.cacheEnabled) {
        const cached = await this.tryLoadFromCache();
        if (cached) {
          this.executor = new SearchExecutor(
            cached.index,
            cached.games
          );
          this.isInitialized = true;
          console.log(`✅ Loaded from cache: ${cached.games.length} games`);
          
          // Start change detection
          if (this.config.autoRefresh) {
            this.startChangeDetection();
          }
          
          return;
        }
      }

      // Step 2: Build from scratch
      await this.rebuildIndex();
      
      // Step 3: Start change detection
      if (this.config.autoRefresh) {
        this.startChangeDetection();
      }
      
      const initTime = Date.now() - startTime;
      console.log(`✅ Search System initialized in ${initTime}ms`);
      this.isInitialized = true;
      
    } catch (error) {
      console.error('❌ Search System initialization failed:', error);
      throw new SearchError(
        'Failed to initialize search system',
        'INIT_FAILED',
        error as Error
      );
    }
  }

  private async tryLoadFromCache() {
    try {
      const cached = await this.cacheManager.load();
      if (!cached) return null;
      
      // Validate
      if (cached.games.length === 0) return null;
      if (!cached.index || Object.keys(cached.index).length === 0) return null;
      
      return cached;
    } catch (error) {
      console.warn('Cache load failed:', error);
      return null;
    }
  }

  async rebuildIndex(): Promise<void> {
    if (this.isBuilding) {
      throw new SearchError(
        'Index build already in progress',
        'INDEX_ERROR'
      );
    }

    this.isBuilding = true;
    this.buildStartTime = Date.now();
    
    try {
      console.log('🔄 Rebuilding search index...');
      
      // Step 1: Fetch all games
      await connectDB();
      const games = await Game.find({}).lean();
      
      if (games.length === 0) {
        throw new SearchError(
          'No games found in database',
          'DB_ERROR'
        );
      }
      
      // Step 2: Build index
      const { index, searchable } = await this.indexBuilder.build(games);
      
      // Step 3: Save to cache
      if (this.config.cacheEnabled) {
        await this.cacheManager.save(index, searchable, {
          version: '1.0.0',
          indexVersion: 'flexsearch-4.0'
        });
      }
      
      // Step 4: Create executor
      this.executor = new SearchExecutor(index, searchable);
      
      const buildTime = Date.now() - this.buildStartTime;
      console.log(`✅ Index built: ${games.length} games in ${buildTime}ms`);
      
      this.metrics.emit('rebuild', {
        duration: buildTime,
        gameCount: games.length,
        cacheSize: await this.cacheManager.getCacheSize()
      });
      
    } catch (error) {
      console.error('❌ Index build failed:', error);
      throw error;
    } finally {
      this.isBuilding = false;
      this.buildStartTime = 0;
    }
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!this.isInitialized || !this.executor) {
      await this.initialize();
    }

    if (!query.trim()) {
      return [];
    }

    const startTime = Date.now();
    
    try {
      const results = await this.executor.search(query, options);
      const duration = Date.now() - startTime;
      
      this.metrics.recordSearch(duration);
      
      // Optional: Enhance top results with full metadata
      if (options.enhanceWithMetadata && results.length > 0) {
        await this.enhanceResults(results.slice(0, 3));
      }
      
      return results;
    } catch (error) {
      if (error instanceof SearchError) {
        throw error;
      }
      
      throw new SearchError(
        `Search failed: ${query}`,
        'INDEX_ERROR',
        error as Error
      );
    }
  }

  private async enhanceResults(results: SearchResult[]): Promise<void> {
    // Fetch full game data from DB for top results
    // This is useful for detailed UI rendering
    try {
      await connectDB();
      const slugs = results.map(r => r.slug);
      const games = await Game.find({ slug: { $in: slugs } }).lean();
      
      const gameMap = new Map(games.map(g => [g.slug, g]));
      
      // Could enhance results with more fields here
      // For now, just validate they exist
    } catch (error) {
      console.warn('Failed to enhance search results:', error);
    }
  }

  getGame(slug: string): SearchableGame | undefined {
    if (!this.executor) return undefined;
    return this.executor.getGame(slug);
  }

  getAllGames(): SearchableGame[] {
    if (!this.executor) return [];
    return this.executor.getAllGames();
  }

  getMetrics(): SystemMetrics {
    const cacheMetrics = this.cacheManager.getCacheSize();
    
    return {
      version: '1.0.0',
      uptime: this.metrics['uptime'] || 0,
      searchCount: this.metrics['totalSearches'] || 0,
      avgSearchTime: this.metrics['avgTime'] || 0,
      cache: {
        hits: 0, // Would need to instrument cache access
        misses: 0,
        rebuilds: 0, // Would need to count rebuilds
        lastRebuildDuration: 0,
        cacheAge: Date.now() - (this.cacheManager as any).lastUpdated || 0,
        size: cacheMetrics,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
      },
      indexSize: this.executor?.getSize() || 0
    };
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      building: this.isBuilding,
      gamesIndexed: this.executor?.getSize() || 0,
      cacheEnabled: this.config.cacheEnabled,
      autoRefresh: this.config.autoRefresh,
      metrics: this.metrics.getMetrics()
    };
  }

  // ==================== CHANGE DETECTION ====================

  private startChangeDetection() {
    if (this.changeDetector) {
      this.changeDetector.stop();
    }

    this.changeDetector = new ChangeDetector(
      async (changes) => await this.handleChanges(changes),
      this.config.changeDetection === 'polling' ? 5 * 60 * 1000 : 60 * 1000
    );

    this.changeDetector.initialize().catch(console.error);
  }

  private async handleChanges(changes: Change[]): Promise<void> {
    if (this.isBuilding) {
      console.log('⚠️ Changes detected but rebuild in progress, skipping...');
      return;
    }

    // For now, do a full rebuild on any change
    // Could optimize to incremental updates
    console.log(`🔄 Rebuilding index due to ${changes.length} changes...`);
    await this.rebuildIndex();
  }

  private setupProcessHandlers() {
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception in Search System:', error);
      this.shutdown(1);
    });
  }

  async shutdown(exitCode = 0): Promise<void> {
    console.log('🛑 Shutting down Search System...');
    
    if (this.changeDetector) {
      this.changeDetector.stop();
    }
    
    // Give metrics time to flush
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (exitCode >= 0) {
      process.exit(exitCode);
    }
  }

  // Health check for load balancers
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: SystemMetrics;
    config: typeof this.config;
  }> {
    try {
      const metrics = this.getMetrics();
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      // Check if index is loaded
      if (!this.executor) {
        status = 'unhealthy';
      }
      
      // Check if rebuild is stuck
      if (this.isBuilding && Date.now() - this.buildStartTime > 300000) {
        status = 'degraded';
      }
      
      // Check memory usage
      if (metrics.cache.memoryUsage > 500) { // 500MB
        status = 'degraded';
      }
      
      return { status, metrics, config: this.config };
    } catch (error) {
      return {
        status: 'unhealthy',
        metrics: this.getMetrics(),
        config: this.config
      };
    }
  }
}

export const searchSystem = SearchSystem.getInstance();
