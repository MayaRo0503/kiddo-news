import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";

export async function GET() {
  try {
    await dbConnect();
    const articles = await RawArticle.find({ status: "gpt_filtered" })
      .select("_id title author publishDate gptSummary gptAnalysis status")
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
