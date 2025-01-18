import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import User from "@/models/User";
import { authenticateToken } from "@/app/api/auth/common/middleware";

interface ArticleQuery {
  status: "approved";
  category?: string;
  isSimplified?: boolean;
  $or: Array<{
    "ageRange.min"?: { $lte: number } | { $exists: boolean };
    "ageRange.max"?: { $gte: number } | { $exists: boolean };
  }>;
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const simplified = url.searchParams.get("simplified");

    const user = authenticateToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parentUser = await User.findById(user.userId);
    if (!parentUser || !parentUser.child) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const childAge = parentUser.child.age;

    const query: ArticleQuery = {
      status: "approved",
      $or: [
        { "ageRange.min": { $lte: childAge } },
        { "ageRange.max": { $gte: childAge } },
        { "ageRange.min": { $exists: false } },
        { "ageRange.max": { $exists: false } },
      ],
    };

    if (category) {
      query.category = category;
    }
    if (simplified === "true") {
      query.isSimplified = true;
    }

    const articles = await Article.find(query);

    if (articles.length === 0) {
      return NextResponse.json(
        { message: "No articles found" },
        { status: 404 }
      );
    }

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
