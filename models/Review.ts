import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  gameSlug: string;
  gameId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  body: string;
  helpfulVotes: number;
  isApproved: boolean;
  ipAddress: string;
  honeypot: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  gameSlug: { type: String, required: true, index: true },
  gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true },
  userName: { type: String, required: true, trim: true, maxlength: 60 },
  userEmail: { type: String, required: true, lowercase: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  body: { type: String, required: true, trim: true, minlength: 20, maxlength: 2000 },
  helpfulVotes: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false, index: true },
  ipAddress: { type: String, default: "" },
  honeypot: { type: String, default: "" },
}, { timestamps: true });

ReviewSchema.index({ gameSlug: 1, isApproved: 1, createdAt: -1 });
ReviewSchema.index({ body: "text", title: "text" });

const Review: Model<IReview> = mongoose.models.Review ?? mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
