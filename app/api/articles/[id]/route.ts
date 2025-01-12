import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // First, wait for the params to arrive
    const { id } = await params;

    // Then connect to the database
    await dbConnect();

    // Validate the ID format (MongoDB ObjectId) using a regex
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(id)) {
      return NextResponse.json(
        { error: "Invalid article ID format." },
        { status: 400 }
      );
    }

    // Fetch the article by ID
    const article = await Article.findById(id);

    if (!article) {
      return NextResponse.json(
        { error: "Article not found." },
        { status: 404 }
      );
    }

    // Return the article
    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
