import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
    clientPromise: Promise<mongoose.mongo.MongoClient> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
    clientPromise: null,
  };
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

export default  async function getMongoClient () {
  const mongooseConnection = await connectToDatabase();
  return mongooseConnection.connection.getClient();
};

export const clientPromise = getMongoClient();
