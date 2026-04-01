import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGame extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  screenshots: string[];
  genre: string;
  tags: string[];
  developer: string;
  publisher: string;
  releaseDate: Date;
  version: string;
  platforms: string[];
  systemRequirements: {
    minimum: {
      os: string;
      processor: string;
      memory: string;
      graphics: string;
      storage: string;
    };
    recommended: {
      os: string;
      processor: string;
      memory: string;
      graphics: string;
      storage: string;
    };
  };
  downloadLinks: {
    label: string;
    url: string;
  }[];
  fileSize: string;
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
  viewCount: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema = new Schema<IGame>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    coverImage: { type: String, required: true },
    screenshots: [String],
    genre: { type: String, required: true },
    tags: [String],
    developer: { type: String, default: "" },
    publisher: { type: String, default: "" },
    releaseDate: { type: Date },
    version: { type: String, default: "1.0" },
    platforms: [String],
    systemRequirements: {
      minimum: {
        os: String,
        processor: String,
        memory: String,
        graphics: String,
        storage: String,
      },
      recommended: {
        os: String,
        processor: String,
        memory: String,
        graphics: String,
        storage: String,
      },
    },
    downloadLinks: [{ label: String, url: String }],
    fileSize: String,
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ WEIGHTED TEXT INDEX — this is the key
GameSchema.index(
  {
    title: "text",
    tags: "text",
    developer: "text",
    shortDescription: "text",
  },
  {
    weights: {
      title: 10,
      tags: 5,
      developer: 3,
      shortDescription: 1,
    },
    name: "game_search_index",
  }
);

// Other useful indexes
GameSchema.index({ slug: 1 });
GameSchema.index({ genre: 1 });
GameSchema.index({ platforms: 1 });
GameSchema.index({ isFeatured: -1, averageRating: -1 });

const Game: Model<IGame> =
  mongoose.models.Game || mongoose.model<IGame>("Game", GameSchema);

export default Game;
