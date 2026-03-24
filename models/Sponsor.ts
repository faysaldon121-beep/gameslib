import mongoose, { Schema, Document, Model } from "mongoose";

export type SponsorTier = "gold" | "silver" | "bronze";

export interface ISponsor extends Document {
  name: string;
  logoUrl: string;
  tier: SponsorTier;
  amount: number;
  websiteUrl: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  isActive: boolean;
  expiryDate: Date;
  createdAt: Date;
}

const SponsorSchema = new Schema<ISponsor>({
  name: { type: String, required: true, trim: true },
  logoUrl: { type: String, default: "" },
  tier: { type: String, enum: ["gold", "silver", "bronze"], required: true },
  amount: { type: Number, required: true },
  websiteUrl: { type: String, default: "#" },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  isActive: { type: Boolean, default: true, index: true },
  expiryDate: { type: Date, required: true },
}, { timestamps: true });

const Sponsor: Model<ISponsor> = mongoose.models.Sponsor ?? mongoose.model<ISponsor>("Sponsor", SponsorSchema);

export default Sponsor;
