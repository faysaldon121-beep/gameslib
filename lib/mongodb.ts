// lib/mongodb.ts
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error('MONGODB_URI not set');

// --- Type Declarations for Global Object ---
// This ensures TypeScript knows about the properties we're adding to the global scope.
declare global {
  namespace NodeJS {
    interface Global {
      _cachedMongoose: typeof mongoose | null;
      _cachedClientPromise: Promise<MongoClient> | null;
    }
  }
}
// --- End Type Declarations ---

let cachedMongoose: typeof mongoose | null = global._cachedMongoose || null;
let cachedClientPromise: Promise<MongoClient> | null = global._cachedClientPromise || null;

export async function connectMongoose() {
  if (cachedMongoose) return cachedMongoose;
  
  // Connect to MongoDB using Mongoose
  const conn = await mongoose.connect(MONGODB_URI);
  cachedMongoose = conn;
  // Cache the connection on the global object
  global._cachedMongoose = cachedMongoose;
  return cachedMongoose;
}

// Setup for the native MongoDB driver client promise for Auth.js adapter
if (!cachedClientPromise) {
  const client = new MongoClient(MONGODB_URI);
  cachedClientPromise = client.connect();
  // Cache the client promise on the global object
  global._cachedClientPromise = cachedClientPromise;
}

const clientPromise = cachedClientPromise!;
export default clientPromise;
