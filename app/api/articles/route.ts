import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import { authenticateToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = await authenticateToken(req);

    const isAdmin = user?.role === "admin";
    const adminParams = {
      status: isAdmin ? "gpt_filtered" : "processed",
    }
    const defaultParams = {
      adminReviewStatus: "approved",
    }
    const articles = await RawArticle.find({
      ...(isAdmin ? adminParams : defaultParams),
      })
      .select("_id title author publishDate gptSummary gptAnalysis status adminReviewStatus")
      .sort({ publishDate: -1 })
      .limit(20);

    const formattedArticles = articles.map((article) => ({
      _id: article._id.toString(),
      title: article.gptAnalysis.summarySentences[0] || article.title,
      author: article.author,
      publishDate: article.publishDate.toISOString(),
      content: article.gptSummary,
      keyPhrases: article.gptAnalysis.keyPhrases,
      sentiment: article.gptAnalysis.sentiment,
      relevance: article.gptAnalysis.relevance,
      status: article.status,
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
