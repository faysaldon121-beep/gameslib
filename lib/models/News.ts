import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INews extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: any[]; // For rich text/blocks
  category: string;
  platforms: string[];
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  featuredImage: string;
  images?: string[];
  isBreaking: boolean;
  isFeatured: boolean;
  readingTime: number;
  views: number;
  shares: {
    total: number;
    twitter?: number;
    facebook?: number;
    reddit?: number;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  status: 'draft' | 'published' | 'archived';
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
      index: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 500,
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['breaking', 'reviews', 'previews', 'guides', 'industry', 'esports', 'updates', 'trailers'],
      index: true,
    },
    platforms: [{
      type: String,
      enum: ['PC', 'PS5', 'PS4', 'Xbox Series X', 'Xbox One', 'Switch', 'Mobile', 'VR'],
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    author: {
      name: {
        type: String,
        required: true,
      },
      avatar: String,
      bio: String,
    },
    featuredImage: {
      type: String,
      required: true,
    },
    images: [String],
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
      required: true,
      min: 1,
    },
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    shares: {
      total: {
        type: Number,
        default: 0,
      },
      twitter: {
        type: Number,
        default: 0,
      },
      facebook: {
        type: Number,
        default: 0,
      },
      reddit: {
        type: Number,
        default: 0,
      },
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
NewsSchema.index({ publishedAt: -1, status: 1 });
NewsSchema.index({ views: -1 });
NewsSchema.index({ 'shares.total': -1 });
NewsSchema.index({ category: 1, publishedAt: -1 });
NewsSchema.index({ platforms: 1, publishedAt: -1 });
NewsSchema.index({ tags: 1 });
NewsSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });

// Virtual for URL
NewsSchema.virtual('url').get(function() {
  return `/news/${this.slug}`;
});

// Method to increment views
NewsSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Method to increment shares
NewsSchema.methods.incrementShares = async function(platform?: string) {
  this.shares.total += 1;
  if (platform && ['twitter', 'facebook', 'reddit'].includes(platform)) {
    this.shares[platform as 'twitter' | 'facebook' | 'reddit'] += 1;
  }
  await this.save();
};

// Pre-save middleware to set publishedAt
NewsSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const News: Model<INews> = mongoose.models.News || mongoose.model<INews>('News', NewsSchema);

export default News;
