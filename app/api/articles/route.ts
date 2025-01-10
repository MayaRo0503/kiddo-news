import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";

export async function GET(req: Request) {
  try {
    // Ensure the MongoDB connection is established
    await dbConnect();

    // Parse the query parameters for category filtering
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    let query = {};
    if (category) {
      query = { category }; // Filter by category if specified
    }

    // Fetch articles from the database
    const articles = await Article.find(query);

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
