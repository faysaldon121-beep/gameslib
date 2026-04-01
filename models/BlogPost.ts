// models/BlogPost.ts
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: {
    name: string;
    avatar?: string;
    bio?: string;
    social?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
  category: 'Gaming News' | 'Game Reviews' | 'Tutorials' | 'Industry Updates' | 'Tips & Tricks';
  tags: string[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
  };
  readingTime: number;
  views: number;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
}

// Simple custom slug function – no external libs
function toSlug(input: string): string {
  return input
    .toString()
    .trim()
    .toLowerCase()
    // replace non‑alphanumeric with spaces
    .replace(/[^a-z0-9]+/g, ' ')
    // collapse multiple spaces to single hyphen
    .replace(/\s+/g, '-')
    // trim hyphens
    .replace(/^-+|-+$/g, '');
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 160
    },
    content: {
      type: String,
      required: true
    },
    featuredImage: {
      type: String,
      required: true
    },
    author: {
      name: {
        type: String,
        required: true
      },
      avatar: String,
      bio: String,
      social: {
        twitter: String,
        linkedin: String,
        github: String
      }
    },
    category: {
      type: String,
      required: true,
      enum: ['Gaming News', 'Game Reviews', 'Tutorials', 'Industry Updates', 'Tips & Tricks']
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    seo: {
      metaTitle: {
        type: String,
        maxlength: 60
      },
      metaDescription: {
        type: String,
        maxlength: 160
      },
      focusKeyword: String,
      canonicalUrl: String
    },
    readingTime: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    publishedAt: Date,
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// AUTO-GENERATE / NORMALIZE SLUG (no external dependency)
blogPostSchema.pre('validate', function (next) {
  const doc = this as IBlogPost;

  if (!doc.slug && doc.title) {
    doc.slug = toSlug(doc.title);
  } else if (doc.slug) {
    doc.slug = toSlug(doc.slug);
  }

  next();
});
blogPostSchema.index(
  { 
    title: 'text', 
    content: 'text', 
    excerpt: 'text', 
    tags: 'text',
    'author.name': 'text'
  },
  { 
    weights: { 
      title: 10, 
      excerpt: 5, 
      tags: 5,
      'author.name': 3,
      content: 1 
    },
    name: 'blog_text_search'
  }
);
// Indexes for SEO and performance
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ isPublished: 1, publishedAt: -1 });
blogPostSchema.index({ category: 1, isPublished: 1 });
blogPostSchema.index({ tags: 1, isPublished: 1 });
blogPostSchema.index({ '$**': 'text' }); // Full-text search

// Virtual for reading time calculation
blogPostSchema.virtual('estimatedReadingTime').get(function (this: IBlogPost) {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Pre-save middleware to calculate reading time and set published date
blogPostSchema.pre('save', function (next) {
  const doc = this as IBlogPost;

  if (doc.content) {
    const wordsPerMinute = 200;
    const wordCount = doc.content.split(' ').length;
    doc.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }

  if (doc.isPublished && !doc.publishedAt) {
    doc.publishedAt = new Date();
  }

  next();
});

const BlogPost =
  (models.BlogPost as mongoose.Model<IBlogPost>) ||
  model<IBlogPost>('BlogPost', blogPostSchema);

export default BlogPost;
