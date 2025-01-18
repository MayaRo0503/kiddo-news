import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("Initiating MongoDB connection...");
    const mongoose = await dbConnect(); // Connect to MongoDB using Mongoose

    console.log("Executing MongoDB ping command...");
    // Verify the MongoDB connection by executing a simple ping command
    const result = await mongoose.connection.db.command({ ping: 1 });

    console.log("MongoDB connection successful.");
    return NextResponse.json(
      {
        message: "Successfully connected to MongoDB.",
        pingResult: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during MongoDB connection:", error);

    // Check if error is an instance of Error
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred.";

    return NextResponse.json(
      {
        message: "Error connecting to MongoDB.",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
