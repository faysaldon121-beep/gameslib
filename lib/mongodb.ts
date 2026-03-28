// lib/mongodb.ts (full replacement)
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

// --- START FIX for "Element implicitly has an 'any' type" error ---
// Declare types for global variables to safely cache database connections
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
  var mongo: {
    conn: MongoClient | null;
    promise: Promise<MongoClient> | null;
  };
}
// --- END FIX ---

// Mongoose connection caching
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

export async function connectDB() {
  // If connection is already established, return
  if (global.mongoose?.conn?.connections[0]?.readyState === 1) {
    console.log("Using existing Mongoose connection.");
    return global.mongoose.conn;
  }

  // If no connection or previous promise, create a new one
  if (!global.mongoose.promise) {
    global.mongoose.promise = mongoose.connect(MONGODB_URI);
  }

  try {
    global.mongoose.conn = await global.mongoose.promise;
    console.log("New Mongoose connection established.");
  } catch (error) {
    // If connection fails, reset the promise to retry next time
    global.mongoose.promise = null;
    console.error("Mongoose connection failed:", error);
    throw error;
  }
  return global.mongoose.conn;
}

// MongoDB Client connection caching for Auth.js Adapter
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
      bufferCommands: false, // Disables Mongoose's buffering
    };
    cached.promise = new MongoClient(MONGODB_URI, opts).connect();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Clear promise on error to retry
    console.error("MongoDB Client connection failed:", e);
    throw e;
  }

  return cached.conn;
}

export default clientPromise;
