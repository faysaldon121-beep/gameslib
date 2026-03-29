import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

// Explicit type for the cached connection object
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  clientPromise: Promise<MongoClient> | null;
}

// Extend NodeJS global with our custom property
declare global {
  var mongooseConnection: CachedConnection | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

// Get cached connection or initialize
let cached: CachedConnection = global.mongooseConnection || {
  conn: null,
  promise: null,
  clientPromise: null,
};

if (!global.mongooseConnection) {
  global.mongooseConnection = cached;
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

export const getMongoClient = async () => {
  const mongooseConnection = await connectToDatabase();
  return mongooseConnection.connection.getClient();
};

export const clientPromise = getMongoClient();
