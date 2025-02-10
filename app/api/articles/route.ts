import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import { authenticateToken } from "@/lib/auth";
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = await authenticateToken(req);

    const isAdmin = user?.role === "admin";
    let query = {};

    if (isAdmin) {
      // Admin can see all articles except failed ones
      query = { status: { $ne: "failed" } };
    } else {
      // Non-admin users can only see approved and processed articles
      query = {
        status: "processed",
        adminReviewStatus: "approved",
      };
    }

    const articles = await RawArticle.find(query)
      .select(
        "_id title author publishDate gptSummary gptAnalysis.summarySentences status adminReviewStatus"
      )
      .sort({ publishDate: -1 })
      .limit(20);

    const formattedArticles = articles.map((article) => ({
      _id: article._id.toString(),
      title: article.title,
      author: article.author,
      publishDate: article.publishDate.toISOString(),
      gptSummary: article.gptSummary,
      gptAnalysis: {
        summarySentences: article.gptAnalysis.summarySentences || [],
      },
      status: isAdmin ? article.status : undefined,
      adminReviewStatus: isAdmin ? article.adminReviewStatus : undefined,
    }));

    return NextResponse.json(formattedArticles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
