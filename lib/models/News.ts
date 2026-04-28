// lib/models/News.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INews extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  platforms: string[];
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  featuredImage: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  gallery?: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  status: 'draft' | 'published' | 'archived';
  isBreaking: boolean;
  isFeatured: boolean;
  readingTime: number;
  views: number;
  uniqueViews: number;
  viewedBy: string[]; // Store hashed IPs
  shares: {
    total: number;
    twitter: number;
    facebook: number;
    reddit: number;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    twitterCard?: 'summary' | 'summary_large_image';
    canonicalUrl?: string;
    noIndex?: boolean;
    noFollow?: boolean;
  };
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    platforms: {
      type: [String],
      default: [],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    author: {
      name: { type: String, required: true },
      avatar: String,
    },
    featuredImage: {
      url: { type: String, required: true },
      alt: { type: String, required: true },
      width: Number,
      height: Number,
    },
    gallery: [
      {
        url: String,
        alt: String,
        caption: String,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    isBreaking: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    readingTime: {
      type: Number,
      default: 5,
    },
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    uniqueViews: {
      type: Number,
      default: 0,
      index: true,
    },
    viewedBy: {
      type: [String],
      default: [],
      select: false, // Don't return in queries by default
    },
    shares: {
      total: { type: Number, default: 0 },
      twitter: { type: Number, default: 0 },
      facebook: { type: Number, default: 0 },
      reddit: { type: Number, default: 0 },
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      ogImage: String,
      ogTitle: String,
      ogDescription: String,
      twitterCard: {
        type: String,
        enum: ['summary', 'summary_large_image'],
        default: 'summary_large_image',
      },
      canonicalUrl: String,
      noIndex: { type: Boolean, default: false },
      noFollow: { type: Boolean, default: false },
    },
    publishedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
NewsSchema.index({ status: 1, publishedAt: -1 });
NewsSchema.index({ status: 1, category: 1, publishedAt: -1 });
NewsSchema.index({ status: 1, platforms: 1, publishedAt: -1 });
NewsSchema.index({ status: 1, views: -1 });
NewsSchema.index({ status: 1, uniqueViews: -1 });
NewsSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

// Auto-set publishedAt when status changes to published
NewsSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const News: Model<INews> = mongoose.models.News || mongoose.model<INews>('News', NewsSchema);

export default News;
