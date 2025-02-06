// fullApp/app/api/articles/[id]/admin-review/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import { authenticateToken } from "@/app/api/auth/common/middleware";
import { refilterArticle } from "@/lib/gptProcessor";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const user = await authenticateToken(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { action, adminComments, targetAgeRange } = await req.json();

    const article = await RawArticle.findById(id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (action === "approve") {
      article.status = "processed";
      article.adminReviewStatus = "approved";
    } else if (action === "reject") {
      article.status = "failed";
      article.adminReviewStatus = "rejected";
      article.processingError = "Rejected by admin";
    } else if (action === "refilter") {
      article.status = "pending";
      article.adminReviewStatus = "pending";
      await refilterArticle(article, adminComments, targetAgeRange);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    article.adminComments = adminComments;

    if (targetAgeRange) {
      article.ageRange = targetAgeRange;
    }

    await article.save();

    return NextResponse.json({
      success: true,
      message: "Article review completed",
    });
  } catch (error) {
    console.error("Error reviewing article:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
