import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
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
  tags: [{
    type: String,
    trim: true
  }],
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
}, {
  timestamps: true
});

// Indexes for SEO and performance
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ isPublished: 1, publishedAt: -1 });
blogPostSchema.index({ category: 1, isPublished: 1 });
blogPostSchema.index({ tags: 1, isPublished: 1 });
blogPostSchema.index({ '$**': 'text' }); // Full-text search

// Virtual for reading time calculation
blogPostSchema.virtual('estimatedReadingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Pre-save middleware to calculate reading time and set published date
blogPostSchema.pre('save', function(next) {
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(' ').length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

export default mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
