import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  console.log("Checking MongoDB URI...");

  // Validate MongoDB URI from environment variables
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined in environment variables.");
    return NextResponse.json(
      { message: "MongoDB URI is not configured." },
      { status: 500 }
    );
  }

  try {
    console.log("Connecting to MongoDB...");
    const mongoose = await dbConnect(); // Connect using Mongoose

    console.log("Fetching MongoDB status...");
    // Get the list of collections in the database
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    console.log("Successfully connected to MongoDB.");
    return NextResponse.json(
      {
        message: "Successfully connected to MongoDB.",
        collections: collections.map(
          (collection: { name: string }) => collection.name
        ), // Explicit type for collections
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);

    // Check if error is an instance of Error
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred.";

    return NextResponse.json(
      { message: "Failed to connect to MongoDB.", error: errorMessage },
      { status: 500 }
    );
  }
}
