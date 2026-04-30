// lib/services/news-service.ts
import dbConnect from '@/lib/db/mongodb';
import News, { INews } from '@/lib/models/News';
import { NewsBase, NewsDetail } from '@/types/news';
import { hashIP } from '@/lib/utils/hash';

export class NewsService {
  // Helper function to safely convert date to ISO string
  private static toISOString(date: any): string {
    if (!date) return new Date().toISOString();
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString();
    if (date.toISOString && typeof date.toISOString === 'function') return date.toISOString();
    return new Date(date).toISOString();
  }

  // Get latest news with pagination
  static async getLatestNews(limit = 24, page = 1) {
    try {
      await dbConnect();

      const skip = (page - 1) * limit;

      console.log('📰 Fetching latest news...', { limit, page, skip });

      const [news, total] = await Promise.all([
        News.find({ status: 'published' })
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        News.countDocuments({ status: 'published' }),
      ]);

      console.log(`✅ Found ${news.length} news items, ${total} total`);

      return {
        news: news.map(this.formatNews.bind(this)),
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('❌ Error fetching latest news:', error);
      return {
        news: [],
        total: 0,
        pages: 0,
        currentPage: page,
      };
    }
  }

  // Get news by category
  static async getNewsByCategory(category: string, limit = 24, page = 1) {
    try {
      await dbConnect();

      const skip = (page - 1) * limit;

      console.log('📂 Fetching news by category:', { category, limit, page });

      const [news, total] = await Promise.all([
        News.find({ status: 'published', category: category.toLowerCase() })
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        News.countDocuments({ status: 'published', category: category.toLowerCase() }),
      ]);

      console.log(`✅ Found ${news.length} news items in category ${category}`);

      return {
        news: news.map(this.formatNews.bind(this)),
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('❌ Error fetching news by category:', error);
      return {
        news: [],
        total: 0,
        pages: 0,
        currentPage: page,
      };
    }
  }

  // Get news by platform
  static async getNewsByPlatform(platform: string, limit = 24, page = 1) {
    try {
      await dbConnect();

      const skip = (page - 1) * limit;

      console.log('🎮 Fetching news by platform:', { platform, limit, page });

      const [news, total] = await Promise.all([
        News.find({ status: 'published', platforms: platform })
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        News.countDocuments({ status: 'published', platforms: platform }),
      ]);

      console.log(`✅ Found ${news.length} news items for platform ${platform}`);

      return {
        news: news.map(this.formatNews.bind(this)),
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('❌ Error fetching news by platform:', error);
      return {
        news: [],
        total: 0,
        pages: 0,
        currentPage: page,
      };
    }
  }

  // Search news
  static async searchNews(query: string, limit = 24, page = 1) {
    try {
      await dbConnect();

      const skip = (page - 1) * limit;

      console.log('🔍 Searching news:', { query, limit, page });

      // Search in title, excerpt, and tags
      const searchQuery = {
        status: 'published',
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { excerpt: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
      };

      const [news, total] = await Promise.all([
        News.find(searchQuery)
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        News.countDocuments(searchQuery),
      ]);

      console.log(`✅ Found ${news.length} news items for query "${query}"`);

      return {
        news: news.map(this.formatNews.bind(this)),
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('❌ Error searching news:', error);
      return {
        news: [],
        total: 0,
        pages: 0,
        currentPage: page,
      };
    }
  }

  // Get trending news (by unique views)
  static async getTrendingNews(limit = 10): Promise<NewsBase[]> {
    try {
      await dbConnect();

      console.log('📈 Fetching trending news...');

      const news = await News.find({ status: 'published' })
        .sort({ uniqueViews: -1, publishedAt: -1 })
        .limit(limit)
        .lean()
        .exec();

      console.log(`✅ Found ${news.length} trending news items`);

      return news.map(this.formatNews.bind(this));
    } catch (error) {
      console.error('❌ Error fetching trending news:', error);
      return [];
    }
  }

  // Get featured news
  static async getFeaturedNews(): Promise<NewsBase | null> {
    try {
      await dbConnect();

      console.log('⭐ Fetching featured news...');

      const news = await News.findOne({
        status: 'published',
        isFeatured: true,
      })
        .sort({ publishedAt: -1 })
        .lean()
        .exec();

      if (news) {
        console.log('✅ Found featured news');
        return this.formatNews(news);
      }

      console.log('ℹ️ No featured news found');
      return null;
    } catch (error) {
      console.error('❌ Error fetching featured news:', error);
      return null;
    }
  }

  // Get breaking news
  static async getBreakingNews(limit = 3): Promise<NewsBase[]> {
    try {
      await dbConnect();

      console.log('🔥 Fetching breaking news...');

      const news = await News.find({
        status: 'published',
        isBreaking: true,
      })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .lean()
        .exec();

      console.log(`✅ Found ${news.length} breaking news items`);

      return news.map(this.formatNews.bind(this));
    } catch (error) {
      console.error('❌ Error fetching breaking news:', error);
      return [];
    }
  }

  // Get news by slug with full content
  static async getNewsBySlug(slug: string): Promise<NewsDetail | null> {
    try {
      await dbConnect();

      console.log('📄 Fetching news by slug:', slug);

      const news = await News.findOne({ slug, status: 'published' })
        .lean()
        .exec();

      if (!news) {
        console.log('❌ News not found for slug:', slug);
        return null;
      }

      console.log('✅ News found:', news.title);

      return this.formatNewsDetail(news);
    } catch (error) {
      console.error('❌ Error fetching news by slug:', error);
      return null;
    }
  }

  // Get categories with count
  static async getCategories() {
    try {
      await dbConnect();

      console.log('📁 Fetching categories...');

      const categories = await News.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { category: '$_id', count: 1, _id: 0 } },
      ]);

      console.log(`✅ Found ${categories.length} categories`);

      return categories;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return [];
    }
  }

  // Get popular tags
  static async getPopularTags(limit = 20): Promise<string[]> {
    try {
      await dbConnect();

      console.log('🏷️ Fetching popular tags...');

      const tags = await News.aggregate([
        { $match: { status: 'published' } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { tag: '$_id', _id: 0 } },
      ]);

      console.log(`✅ Found ${tags.length} tags`);

      return tags.map((t: any) => t.tag);
    } catch (error) {
      console.error('❌ Error fetching tags:', error);
      return [];
    }
  }

  // Get related news
  static async getRelatedNews(
    newsId: string,
    category: string,
    tags: string[],
    limit = 4
  ): Promise<NewsBase[]> {
    try {
      await dbConnect();

      console.log('🔗 Fetching related news...');

      const news = await News.find({
        _id: { $ne: newsId },
        status: 'published',
        $or: [{ category }, { tags: { $in: tags } }],
      })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .lean()
        .exec();

      console.log(`✅ Found ${news.length} related news items`);

      return news.map(this.formatNews.bind(this));
    } catch (error) {
      console.error('❌ Error fetching related news:', error);
      return [];
    }
  }

  // INCREMENT VIEWS (IP-based, one view per IP)
  static async incrementViews(newsId: string, clientIP: string) {
    try {
      await dbConnect();

      const hashedIP = hashIP(clientIP);

      const news = await News.findById(newsId).select('viewedBy').lean();

      if (!news) {
        throw new Error('News not found');
      }

      const hasViewed = news.viewedBy?.includes(hashedIP);

      if (hasViewed) {
        return { alreadyViewed: true };
      }

      const result = await News.findByIdAndUpdate(
        newsId,
        {
          $inc: { views: 1, uniqueViews: 1 },
          $addToSet: { viewedBy: hashedIP },
        },
        { new: true }
      );

      return {
        alreadyViewed: false,
        views: result?.views || 0,
        uniqueViews: result?.uniqueViews || 0,
      };
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }

  // INCREMENT VIEWS BY SLUG
  static async incrementViewsBySlug(slug: string, clientIP: string) {
    try {
      await dbConnect();

      const hashedIP = hashIP(clientIP);

      const news = await News.findOne({ slug }).select('viewedBy').lean();

      if (!news) {
        throw new Error('News not found');
      }

      const hasViewed = news.viewedBy?.includes(hashedIP);

      if (hasViewed) {
        return { alreadyViewed: true };
      }

      const result = await News.findOneAndUpdate(
        { slug },
        {
          $inc: { views: 1, uniqueViews: 1 },
          $addToSet: { viewedBy: hashedIP },
        },
        { new: true }
      );

      return {
        alreadyViewed: false,
        views: result?.views || 0,
        uniqueViews: result?.uniqueViews || 0,
      };
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }

  // INCREMENT SHARES
  static async incrementShares(newsId: string, platform?: string) {
    try {
      await dbConnect();

      const updateQuery: any = { $inc: { 'shares.total': 1 } };

      if (platform && ['twitter', 'facebook', 'reddit'].includes(platform)) {
        updateQuery.$inc[`shares.${platform}`] = 1;
      }

      const result = await News.findByIdAndUpdate(newsId, updateQuery, {
        new: true,
      });

      return result;
    } catch (error) {
      console.error('Error incrementing shares:', error);
      throw error;
    }
  }

  // INCREMENT SHARES BY SLUG
  static async incrementSharesBySlug(slug: string, platform?: string) {
    try {
      await dbConnect();

      const updateQuery: any = { $inc: { 'shares.total': 1 } };

      if (platform && ['twitter', 'facebook', 'reddit'].includes(platform)) {
        updateQuery.$inc[`shares.${platform}`] = 1;
      }

      const result = await News.findOneAndUpdate({ slug }, updateQuery, {
        new: true,
      });

      return result;
    } catch (error) {
      console.error('Error incrementing shares:', error);
      throw error;
    }
  }

  // ✅ Format news for list view (FIXED - handles date properly)
  private static formatNews(news: any): NewsBase {
    return {
      _id: news._id.toString(),
      title: news.title,
      slug: news.slug,
      excerpt: news.excerpt,
      category: news.category,
      platforms: news.platforms || [],
      tags: news.tags || [],
      author: {
        name: news.author.name,
        avatar: news.author.avatar,
      },
      featuredImage: {
        url: news.featuredImage.url,
        alt: news.featuredImage.alt,
        width: news.featuredImage.width,
        height: news.featuredImage.height,
      },
      isBreaking: news.isBreaking || false,
      isFeatured: news.isFeatured || false,
      readingTime: news.readingTime,
      views: news.views || 0,
      uniqueViews: news.uniqueViews || 0,
      shares: news.shares || { total: 0, twitter: 0, facebook: 0, reddit: 0 },
      publishedAt: this.toISOString(news.publishedAt || news.createdAt),
    };
  }

  // ✅ Format news for detail view (FIXED)
  private static formatNewsDetail(news: any): NewsDetail {
    return {
      ...this.formatNews(news),
      content: news.content,
      gallery: news.gallery || [],
      seo: news.seo || {},
    };
  }
}
