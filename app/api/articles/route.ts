import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import { authenticateToken } from "../auth/common/middleware";

export async function GET(req: NextRequest) {
  try {
    const startTime = Date.now(); // Track start time

    await dbConnect();
    const user = authenticateToken(req);

    const isAdmin = user?.role === "admin";
    const isChildOrParent = user?.role === "child" || user?.role === "parent";

    const adminParams = {
      $or: [{ status: "processed" }, { status: "gpt_filtered" }],
      adminReviewStatus: { $ne: "approved" },
    };
    const defaultParams = {
      adminReviewStatus: "approved",
    };
    const childOrParentParams = {
      adminReviewStatus: "approved",
    };

    let queryParams;
    if (isAdmin) {
      queryParams = adminParams;
    } else if (isChildOrParent) {
      queryParams = childOrParentParams;
    } else {
      queryParams = defaultParams;
    }

    const articles = await RawArticle.find(queryParams)
      .select(
        "_id title author publishDate gptSummary gptAnalysis status adminReviewStatus"
      )
      .sort({ publishDate: -1 })
      .limit(20);

    const endTime = Date.now(); // Track end time
    console.log(`Fetching articles took ${endTime - startTime}ms`); // Log time taken
    const formattedArticles = articles.map((article) => ({
      _id: article._id.toString(),
      title: article.gptAnalysis?.summarySentences[0] || article.title,
      author: article.author,
      publishDate: article.publishDate.toISOString(),
      content: article.gptSummary,
      keyPhrases: article.gptAnalysis?.keyPhrases || [],
      sentiment: article.gptAnalysis?.sentiment,
      relevance: article.gptAnalysis?.relevance,
      entities: article.gptAnalysis?.entities || [],
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
