// my-app/app/api/articles/gpt-filter-batch/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import { processArticleWithGPT } from "@/lib/gptProcessor";
import { authenticateToken } from "@/app/api/auth/common/middleware";

/**
 * POST /api/articles/gpt-filter-batch
 *
 * Processes ALL articles in kiddo-news.rawarticles whose status = "pre_filtered".
 * After GPT filtering, they become "gpt_filtered" (handled in your gptProcessor.ts).
 * Logs results in the terminal and returns JSON with counts & IDs.
 */
export async function POST(req: Request) {
  try {
    // 1. Connect to MongoDB
    await dbConnect();

    // 2. Auth check for admin
    const user = await authenticateToken(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Find all articles whose status is "pre_filtered"
    const articles = await RawArticle.find({ status: "pre_filtered" });

    if (articles.length === 0) {
      console.log("No pre_filtered articles found.");
      return NextResponse.json({ message: "No pre_filtered articles found." });
    }

    console.log(
      `Found ${articles.length} pre_filtered articles. Starting batch GPT filtering...`
    );

    // 4. Process each article via processArticleWithGPT, gather results
    const results = await Promise.allSettled(
      articles.map((article) => processArticleWithGPT(article._id.toString()))
    );

    // 5. Separate successful vs failed
    const processedIds: string[] = [];
    const failedIds: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        processedIds.push(articles[index]._id.toString());
      } else {
        failedIds.push(articles[index]._id.toString());
      }
    });

    // 6. Log the final outcome in the terminal
    console.log(
      `\nFiltered ${
        processedIds.length
      } article(s) successfully. IDs:\n  ${processedIds.join(", ")}`
    );
    if (failedIds.length > 0) {
      console.log(
        `\nFailed to process ${
          failedIds.length
        } article(s). IDs:\n  ${failedIds.join(", ")}`
      );
    }

    // 7. Return JSON response
    return NextResponse.json({
      message: "Batch processing completed",
      processedCount: processedIds.length,
      failedCount: failedIds.length,
      totalProcessed: articles.length,
      processedIds,
      failedIds,
    });
  } catch (error) {
    console.error("Error in batch processing:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
