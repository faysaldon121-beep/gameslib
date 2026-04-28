// lib/services/news-service.ts
import dbConnect from '@/lib/db/mongodb';
import News, { INews } from '@/lib/models/News';
import { NewsBase } from '@/types/news';
import { hashIP } from '@/lib/utils/hash';

export class NewsService {
  // Get latest news with pagination
  static async getLatestNews(limit = 24, page = 1) {
    await dbConnect();

    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      News.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      News.countDocuments({ status: 'published' }),
    ]);

    return {
      news: news.map(this.formatNews),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // Get news by category
  static async getNewsByCategory(category: string, limit = 24, page = 1) {
    await dbConnect();

    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      News.find({ status: 'published', category: category.toLowerCase() })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      News.countDocuments({ status: 'published', category: category.toLowerCase() }),
    ]);

    return {
      news: news.map(this.formatNews),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // Get news by platform
  static async getNewsByPlatform(platform: string, limit = 24, page = 1) {
    await dbConnect();

    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      News.find({ status: 'published', platforms: platform })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      News.countDocuments({ status: 'published', platforms: platform }),
    ]);

    return {
      news: news.map(this.formatNews),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // Search news
  static async searchNews(query: string, limit = 24, page = 1) {
    await dbConnect();

    const skip = (page - 1) * limit;

    const searchQuery = {
      status: 'published',
      $text: { $search: query },
    };

    const [news, total] = await Promise.all([
      News.find(searchQuery)
        .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      News.countDocuments(searchQuery),
    ]);

    return {
      news: news.map(this.formatNews),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // Get trending news (by unique views)
  static async getTrendingNews(limit = 10) {
    await dbConnect();

    const news = await News.find({ status: 'published' })
      .sort({ uniqueViews: -1, publishedAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return news.map(this.formatNews);
  }

  // Get featured news
  static async getFeaturedNews() {
    await dbConnect();

    const news = await News.findOne({
      status: 'published',
      isFeatured: true,
    })
      .sort({ publishedAt: -1 })
      .lean()
      .exec();

    return news ? this.formatNews(news) : null;
  }

  // Get breaking news
  static async getBreakingNews(limit = 3) {
    await dbConnect();

    const news = await News.find({
      status: 'published',
      isBreaking: true,
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return news.map(this.formatNews);
  }

  // Get news by slug with full content
  static async getNewsBySlug(slug: string) {
    await dbConnect();

    const news = await News.findOne({ slug, status: 'published' })
      .lean()
      .exec();

    if (!news) return null;

    return this.formatNewsDetail(news);
  }

  // ✅ INCREMENT VIEWS (IP-based, one view per IP)
  static async incrementViews(newsId: string, clientIP: string) {
    await dbConnect();

    try {
      const hashedIP = hashIP(clientIP);

      // Check if this IP has already viewed this article
      const news = await News.findById(newsId).select('viewedBy').lean();
      
      if (!news) {
        throw new Error('News not found');
      }

      const hasViewed = news.viewedBy?.includes(hashedIP);

      if (hasViewed) {
        // Already viewed, don't increment
        return { alreadyViewed: true };
      }

      // Increment both views and uniqueViews, add IP to viewedBy
      const result = await News.findByIdAndUpdate(
        newsId,
        {
          $inc: { views: 1, uniqueViews: 1 },
          $addToSet: { viewedBy: hashedIP },
        },
        { new: true }
      );

      return { alreadyViewed: false, views: result?.views, uniqueViews: result?.uniqueViews };
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }

  // ✅ INCREMENT VIEWS BY SLUG
  static async incrementViewsBySlug(slug: string, clientIP: string) {
    await dbConnect();

    try {
      const hashedIP = hashIP(clientIP);

      // Check if this IP has already viewed this article
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

      return { alreadyViewed: false, views: result?.views, uniqueViews: result?.uniqueViews };
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }

  // ✅ INCREMENT SHARES
  static async incrementShares(newsId: string, platform?: string) {
    await dbConnect();

    try {
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

  // ✅ INCREMENT SHARES BY SLUG
  static async incrementSharesBySlug(slug: string, platform?: string) {
    await dbConnect();

    try {
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

  // Get related news
  static async getRelatedNews(newsId: string, category: string, tags: string[], limit = 4) {
    await dbConnect();

    const news = await News.find({
      _id: { $ne: newsId },
      status: 'published',
      $or: [{ category }, { tags: { $in: tags } }],
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return news.map(this.formatNews);
  }

  // Get categories with count
  static async getCategories() {
    await dbConnect();

    const categories = await News.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ]);

    return categories;
  }

  // Get popular tags
  static async getPopularTags(limit = 20) {
    await dbConnect();

    const tags = await News.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { tag: '$_id', _id: 0 } },
    ]);

    return tags.map((t: any) => t.tag);
  }

  // Format news for list view
  private static formatNews(news: any): NewsBase {
    return {
      _id: news._id.toString(),
      title: news.title,
      slug: news.slug,
      excerpt: news.excerpt,
      category: news.category,
      platforms: news.platforms || [],
      tags: news.tags || [],
      author: news.author,
      featuredImage: news.featuredImage,
      isBreaking: news.isBreaking || false,
      isFeatured: news.isFeatured || false,
      readingTime: news.readingTime,
      views: news.views || 0,
      uniqueViews: news.uniqueViews || 0,
      shares: news.shares || { total: 0, twitter: 0, facebook: 0, reddit: 0 },
      publishedAt: news.publishedAt?.toISOString() || news.createdAt?.toISOString(),
    };
  }

  // Format news for detail view (includes content and SEO)
  private static formatNewsDetail(news: any) {
    return {
      ...this.formatNews(news),
      content: news.content,
      gallery: news.gallery || [],
      seo: news.seo || {},
    };
  }
}
