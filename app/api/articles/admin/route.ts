// fullApp/app/api/articles/[id]/admin-review/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import { authenticateToken } from "@/app/api/auth/common/middleware";

// Todo: Check if this is needed, if not remove the endpoint
export async function GET(
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

    const article = await RawArticle.findById(id).select(
      "title gptSummary ageRange relevanceScore status"
    );

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article for review:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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
    const { action, adminNotes } = await req.json();

    const article = await RawArticle.findById(id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (action === "approve") {
      article.status = "processed";
    } else if (action === "reject") {
      article.status = "failed";
      article.processingError = "Rejected by admin";
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    article.adminNotes = adminNotes;
    await article.save();

    return NextResponse.json({ message: "Article review completed" });
  } catch (error) {
    console.error("Error reviewing article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
