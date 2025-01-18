import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const user = authenticateToken(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const articles = await Article.find({ status: "simplified" });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles for admin:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const user = authenticateToken(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { articleId, action, rejectionReason, adminInstructions, ageRange } =
      await req.json();

    const article = await Article.findById(articleId);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (action === "approve") {
      article.status = "approved";
      article.ageRange = ageRange;
    } else if (action === "reject") {
      article.status = "rejected";
      article.rejectionReason = rejectionReason;
      article.adminInstructions = adminInstructions;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await article.save();

    return NextResponse.json({ message: "Article updated successfully" });
  } catch (error) {
    console.error("Error updating article status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
