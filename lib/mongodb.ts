import mongoose from "mongoose";

// Retrieve MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Throw an error if the URI is not set
if (!MONGODB_URI) {
  throw new Error("Invalid/Missing environment variable: 'MONGODB_URI'");
}

// Interface to store the connection cache
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use global scope to persist the cache across hot reloads in development
let cached: MongooseCache = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

// Function to establish or retrieve a MongoDB connection
async function dbConnect() {
  // If connection already exists, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection exists, create one and cache it
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI as string) // No need for deprecated options
      .then((mongooseInstance) => {
        console.log("Successfully connected to MongoDB!");
        return mongooseInstance;
      })
      .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
        throw new Error("Failed to connect to MongoDB");
      });
  }
  // Wait for the connection to be established and cache it

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
