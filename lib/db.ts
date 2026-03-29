import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  clientPromise: Promise<MongoClient> | null;
}

declare global {
  var mongooseConnection: CachedConnection | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

let cached: CachedConnection = global.mongooseConnection || {
  conn: null,
  promise: null,
  clientPromise: null,
};

if (!global.mongooseConnection) {
  global.mongooseConnection = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
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

  // After awaiting, `cached.conn` must be set. If not, something went wrong.
  if (!cached.conn) {
    throw new Error('Failed to connect to database');
  }

  return cached.conn;
}

export const getMongoClient = async (): Promise<MongoClient> => {
  const mongooseConnection = await connectToDatabase();
  return mongooseConnection.connection.getClient();
};

export const clientPromise: Promise<MongoClient> = getMongoClient();

export default clientPromise;
