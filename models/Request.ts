import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRequest extends Document {
  gameName: string;
  userEmail: string;
  message: string;
  status: "Pending" | "Fulfilled" | "Rejected";
  createdAt: Date;
}

const RequestSchema = new Schema<IRequest>({
  gameName: { type: String, required: true, trim: true, maxlength: 200 },
  userEmail: { type: String, required: true, lowercase: true },
  message: { type: String, default: "", maxlength: 500 },
  status: { type: String, enum: ["Pending", "Fulfilled", "Rejected"], default: "Pending" },
}, { timestamps: true });

const RequestModel: Model<IRequest> = mongoose.models.Request ?? mongoose.model<IRequest>("Request", RequestSchema);

export default RequestModel;
