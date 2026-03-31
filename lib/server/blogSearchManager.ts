import { Document } from 'flexsearch';
import { promises as fs } from 'fs';
import path from 'path';
import connectDB from '@/lib/mongodb';
import BlogPost, { IBlogPost } from '@/models/BlogPost';

export interface BlogSearchData {
  [key: string]: any;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category?: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
}

interface BlogIndexCache {
  serializedIndex: Record<string, any>;
  posts: BlogSearchData[];
  metadata: {
    totalPosts: number;
    lastUpdated: number;
    version: string;
    dataChecksum: string;
  };
}

class BlogRuntimeSearchManager {
  private static instance: BlogRuntimeSearchManager;
  private indexCache: BlogIndexCache | null = null;
  private isBuilding = false;
  private buildPromise: Promise<void> | null = null;

  private readonly CACHE_DIR = path.join(process.cwd(), '.cache', 'blog-search');
  private readonly CACHE_FILE = path.join(this.CACHE_DIR, 'blog-index.json');
  private readonly INDEX_VERSION = '1.0.0';

  private constructor() {
    this.ensureCacheDir();
  }

  static getInstance(): BlogRuntimeSearchManager {
    if (!BlogRuntimeSearchManager.instance) {
      BlogRuntimeSearchManager.instance = new BlogRuntimeSearchManager();
    }
    return BlogRuntimeSearchManager.instance;
  }

  private async ensureCacheDir() {
    try {
      await fs.mkdir(this.CACHE_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create blog cache directory:', error);
    }
  }

  async initialize(): Promise<void> {
    if (this.indexCache) return;

    const cached = await this.loadFromCache();
    if (cached && (await this.validateCache(cached))) {
      this.indexCache = cached;
      return;
    }

    await this.buildIndex();
  }

  private async buildIndex(): Promise<void> {
    if (this.isBuilding) {
      if (this.buildPromise) await this.buildPromise;
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
    console.log('🔄 Building blog search index...');

    await connectDB();

    const posts = await BlogPost.find({})
      .select({
        title: 1,
        slug: 1,
        content: 1,
        excerpt: 1,
        coverImage: 1,
        category: 1,
        tags: 1,
        publishedAt: 1,
        updatedAt: 1,
      })
      .lean<IBlogPost[]>();

    const index = new Document<BlogSearchData>({
      preset: 'memory',
      tokenize: 'forward',
      resolution: 7,
      document: {
        id: 'slug',
        index: [
          { field: 'title', tokenize: 'forward', resolution: 9 },
          { field: 'excerpt', tokenize: 'forward', resolution: 7 },
          { field: 'content', tokenize: 'strict', resolution: 5 },
          { field: 'category', tokenize: 'strict' },
          { field: 'tags', tokenize: 'strict' },
        ],
      },
    });

    const processed: BlogSearchData[] = posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.featuredImage,
      category: post.category,
      tags: post.tags || [],
      publishedAt: post.publishedAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));

    for (const p of processed) {
      await index.add(p);
    }

    const serializedIndex: Record<string, any> = {};
    await index.export((key: string, data: any) => {
      serializedIndex[key] = data;
    });

    this.indexCache = {
      serializedIndex,
      posts: processed,
      metadata: {
        totalPosts: processed.length,
        lastUpdated: Date.now(),
        version: this.INDEX_VERSION,
        dataChecksum: this.generateChecksum(processed),
      },
    };

    await this.saveToCache(this.indexCache);

    console.log(`✅ Blog search index built: ${processed.length} posts`);
  }

  private generateChecksum(posts: BlogSearchData[]): string {
    const str = posts
      .map((p) => `${p.slug}:${p.updatedAt}`)
      .sort()
      .join('');
    return Buffer.from(str).toString('base64');
  }

  private async loadFromCache(): Promise<BlogIndexCache | null> {
    try {
      const raw = await fs.readFile(this.CACHE_FILE, 'utf-8');
      return JSON.parse(raw) as BlogIndexCache;
    } catch {
      return null;
    }
  }

  private async saveToCache(data: BlogIndexCache): Promise<void> {
    try {
      await fs.writeFile(this.CACHE_FILE, JSON.stringify(data, null, 0));
    } catch (error) {
      console.error('Failed to save blog search cache:', error);
    }
  }

  private async validateCache(cached: BlogIndexCache): Promise<boolean> {
    if (cached.metadata.version !== this.INDEX_VERSION) return false;

    try {
      await connectDB();
      const count = await BlogPost.countDocuments();
      return count === cached.metadata.totalPosts;
    } catch {
      return false;
    }
  }

  async getIndexData(): Promise<{
    index: Record<string, any>;
    posts: BlogSearchData[];
    metadata: BlogIndexCache['metadata'];
  } | null> {
    if (!this.indexCache) {
      await this.initialize();
    }
    if (!this.indexCache) return null;

    return {
      index: this.indexCache.serializedIndex,
      posts: this.indexCache.posts,
      metadata: this.indexCache.metadata,
    };
  }
}

export const blogSearchManager = BlogRuntimeSearchManager.getInstance();
