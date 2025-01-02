import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  // First, check if the environment variable exists
  console.log("MongoDB URI exists:", !!process.env.MONGODB_URI);

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined in environment variables");
    return NextResponse.json(
      { message: "MongoDB URI is not configured" },
      { status: 500 }
    );
  }

  try {
    const client = await clientPromise;
    // Attempt to fetch the list of databases
    const adminDb = client.db().admin();
    await adminDb.listDatabases();

    return NextResponse.json(
      { message: "Successfully connected to MongoDB" },
      { status: 200 }
    );
  } catch (e) {
    console.error("MongoDB connection error:", e);
    return NextResponse.json(
      { message: "Failed to connect to MongoDB" },
      { status: 500 }
    );
  }
}
