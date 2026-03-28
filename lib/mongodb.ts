// lib/mongodb.ts (full replacement)
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const MONGODB_URI = process.env.MONGODB_URI!;

export async function connectDB() {
  if (global.mongoose?.conn?.readyState === 1) return;
  if (!global.mongoose.promise) {
    global.mongoose.promise = mongoose.connect(MONGODB_URI);
  }
  await global.mongoose.promise;
}

// For Auth.js MongoDBAdapter
let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

async function clientPromise() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = new MongoClient(MONGODB_URI, opts).connect();
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default clientPromise;
