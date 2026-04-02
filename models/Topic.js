import mongoose from "mongoose";

const TopicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
    },
    postsCount: {
      type: Number,
      default: 0,
    },
    followersCount: {
      type: Number,
      default: 0,
    },
    trendPercent: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

TopicSchema.index({ postsCount: -1 });
TopicSchema.index({ followersCount: -1 });
TopicSchema.index({ slug: 1 });

export default mongoose.models.Topic || mongoose.model("Topic", TopicSchema);
