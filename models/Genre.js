import mongoose from 'mongoose';

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '/icons/genres/default.svg',
  },
  gameCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // SEO fields
  metaTitle: {
    type: String,
    default: function() { return `${this.name} Games - Free PC Downloads | Gameslib`; },
  },
  metaDescription: {
    type: String,
    default: function() { return `Discover free ${this.name.toLowerCase()} games for PC. Pre-installed downloads with system requirements and guides.`; },
  },
  ogImage: {
    type: String,
    default: '/og/default-genre.jpg',  // 1200x630 placeholder
  },
}, {
  timestamps: true,
});

export default mongoose.models.Genre || mongoose.model('Genre', genreSchema);
