// app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Ensure the id is a valid MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid article ID" },
        { status: 400 }
      );
    }

    // Fetch the article with the correct status
    const article = await RawArticle.findOne({
      _id: new ObjectId(id),
      status: "processed",
      adminReviewStatus: "approved",
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Return all necessary fields including likes, saves, and comments.
    const responseData = {
      _id: article._id.toString(),
      title: article.title,
      author: article.author,
      publishDate: article.publishDate,
      gptAnalysis: {
        summarySentences: article.gptAnalysis?.summarySentences || [],
      },
      gptSummary: article.gptSummary,
      likes: article.likes || 0,
      saves: article.saves || 0,
      comments: article.comments || [],
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
