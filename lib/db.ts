// lib/db.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

// Global cache to preserve connection across hot reloads in development
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, clientPromise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      cached.conn = mongoose;
      return mongoose;
    });
  }

  await cached.promise;
  return cached.conn;
}

// This is what the adapter needs: a Promise<MongoClient>
export const getMongoClient = async () => {
  const mongooseConnection = await connectToDatabase();
  return mongooseConnection.connection.getClient(); // returns the native MongoClient
};

// Optionally, you can export a promise that resolves to the client directly
export const clientPromise = getMongoClient();
