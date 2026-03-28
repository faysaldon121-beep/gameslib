// models/User.ts
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  image: { type: String },
  password: { type: String }, // Hashed for credentials
  emailVerified: { type: Date },
  downloads: [{ type: Schema.Types.ObjectId, ref: 'Game' }], // Optional tracking
});

export default mongoose.models.User || mongoose.model('User', userSchema);
