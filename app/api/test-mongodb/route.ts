import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("KIDDO-NEWS");

    // Just ping the database to check the connection
    await db.command({ ping: 1 });

    return NextResponse.json({ message: "Successfully connected to MongoDB" });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Error connecting to MongoDB" },
      { status: 500 }
    );
  }
}
