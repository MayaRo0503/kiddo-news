import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article"; // Import the Article model

export async function GET() {
  try {
    // Ensure the MongoDB connection is established
    await dbConnect();

    // Fetch all articles from the database
    const articles = await Article.find({});

    if (articles.length === 0) {
      return NextResponse.json(
        { message: "No articles found" },
        { status: 404 }
      );
    }

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
