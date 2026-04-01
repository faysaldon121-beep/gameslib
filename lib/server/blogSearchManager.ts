// lib/server/blogSearchManager.ts

import { connectDB } from './db';
import BlogPost, { IBlogPost } from '@/models/BlogPost';

export interface BlogSearchData {
  id: string;
  title: string;
  content: string;
  slug: string;
  excerpt?: string;
  tags?: string[];
  category?: string;
  author?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function indexBlogPost(post: Partial<IBlogPost>): Promise<void> {
  await connectDB();
  // The BlogPost model already handles indexing through MongoDB's text index
  // No separate indexing needed - it's automatic
}

export async function removeBlogPost(id: string): Promise<void> {
  await connectDB();
  await BlogPost.findByIdAndDelete(id);
}

export async function searchBlogPosts(
  query: string,
  options?: { 
    limit?: number; 
    page?: number;
    category?: string;
    tags?: string[];
    publishedOnly?: boolean;
  }
): Promise<{ results: BlogSearchData[]; total: number }> {
  await connectDB();
  
  const limit = options?.limit || 10;
  const page = options?.page || 1;
  const skip = (page - 1) * limit;
  const publishedOnly = options?.publishedOnly !== false; // default true

  // Build filter
  const filter: any = {};
  
  if (publishedOnly) {
    filter.isPublished = true;
  }
  
  if (options?.category) {
    filter.category = options.category;
  }
  
  if (options?.tags && options.tags.length > 0) {
    filter.tags = { $in: options.tags };
  }

  if (!query || query.trim() === '') {
    // No search query - return recent posts
    const [results, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title slug excerpt content tags category author createdAt updatedAt')
        .lean()
        .exec(),
      BlogPost.countDocuments(filter),
    ]);

    return { 
      results: results.map(post => ({
        id: post._id.toString(),
        title: post.title,
        content: post.content,
        slug: post.slug,
        excerpt: post.excerpt,
        tags: post.tags,
        category: post.category,
        author: post.author.name,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })), 
      total 
    };
  }

  // Text search using MongoDB's $text operator
  const searchFilter = {
    ...filter,
    $text: { $search: query }
  };

  const [results, total] = await Promise.all([
    BlogPost.find(searchFilter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug excerpt content tags category author createdAt updatedAt')
      .lean()
      .exec(),
    BlogPost.countDocuments(searchFilter),
  ]);

  return { 
    results: results.map(post => ({
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      slug: post.slug,
      excerpt: post.excerpt,
      tags: post.tags,
      category: post.category,
      author: post.author.name,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    })), 
    total 
  };
}

export async function reindexAllPosts(posts?: Partial<IBlogPost>[]): Promise<void> {
  await connectDB();
  // MongoDB text indexes are automatically maintained
  // No manual reindexing needed
  console.log('BlogPost model uses automatic text indexing - no manual reindex needed');
}

export async function clearSearchIndex(): Promise<void> {
  await connectDB();
  // This would delete all blog posts - use with caution
  await BlogPost.deleteMany({});
}

// Additional helper functions
export async function getFeaturedPosts(limit: number = 5): Promise<BlogSearchData[]> {
  await connectDB();
  
  const posts = await BlogPost.find({ 
    isPublished: true, 
    isFeatured: true 
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select('title slug excerpt content tags category author createdAt updatedAt')
    .lean()
    .exec();

  return posts.map(post => ({
    id: post._id.toString(),
    title: post.title,
    content: post.content,
    slug: post.slug,
    excerpt: post.excerpt,
    tags: post.tags,
    category: post.category,
    author: post.author.name,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }));
}

export async function getPostsByCategory(
  category: string, 
  options?: { limit?: number; page?: number }
): Promise<{ results: BlogSearchData[]; total: number }> {
  return searchBlogPosts('', { ...options, category, publishedOnly: true });
}

export async function getPostsByTag(
  tag: string, 
  options?: { limit?: number; page?: number }
): Promise<{ results: BlogSearchData[]; total: number }> {
  return searchBlogPosts('', { ...options, tags: [tag], publishedOnly: true });
}

export async function incrementViews(slug: string): Promise<void> {
  await connectDB();
  await BlogPost.findOneAndUpdate(
    { slug },
    { $inc: { views: 1 } }
  );
}

export { BlogPost };
export type { IBlogPost };
