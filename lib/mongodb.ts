import mongoose from "mongoose";

// Ensure that MONGODB_URI is set
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Invalid/Missing environment variable: 'MONGODB_URI'");
}

// Interface to store the cache of the connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Initialize cache if it's not yet initialized
let cached: MongooseCache = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // If connection already exists, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection exists, create one
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI as string)
      .then((mongooseInstance) => {
        console.log("Successfully connected to MongoDB!"); // Log connection success
        return mongooseInstance;
      })
      .catch((error) => {
        console.error("Error connecting to MongoDB:", error); // Log any connection error
        throw new Error("Failed to connect to MongoDB");
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
