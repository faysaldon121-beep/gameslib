// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  image?: string;
  password?: string;
  emailVerified?: Date;
  downloads?: Schema.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  image: { type: String },
  password: { type: String },
  emailVerified: { type: Date },
  downloads: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
});

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
