import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
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
};

if (!global.mongooseConnection) {
  global.mongooseConnection = cached;
}

async function connectToDatabase(): Promise<typeof mongoose> {
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

  if (!cached.conn) {
    throw new Error('Failed to connect to database');
  }

  return cached.conn;
}

// 👇 Lazy initialisation – creates the promise only when called
let clientPromise: Promise<MongoClient> | null = null;

export default async function getClientPromise(): Promise<MongoClient> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const mongooseConnection = await connectToDatabase();
      return mongooseConnection.connection.getClient();
    })();
  }
  return clientPromise;
}
