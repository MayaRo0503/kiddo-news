import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Article from "@/models/Article";
import { authenticateToken } from "@/app/api/auth/common/middleware";
import type { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await dbConnect();

    // Resolve the `params` from the Promise
    const resolvedParams = await context.params;

    // Authenticate the parent
    const user = authenticateToken(req);
    if (
      !user ||
      user.role !== "parent" ||
      user.userId !== resolvedParams.userId
    ) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Fetch parent with child data
    const parent = await User.findById(user.userId);

    if (!parent || !parent.child) {
      return NextResponse.json(
        { error: "Parent or child not found" },
        { status: 404 }
      );
    }

    const child = parent.child;

    // Fetch full article details for saved and liked articles
    const savedArticles = await Article.find({
      _id: { $in: child.savedArticles },
    }).select("_id title category");
    const likedArticles = await Article.find({
      _id: { $in: child.likedArticles },
    }).select("_id title category");

    // Calculate statistics
    const stats = {
      savedArticles,
      likedArticles,
      timeSpent: child.timeLimit - (child.remainingTime || 0),
      lastLogin: child.lastLoginDate,
      username: child.username,
    };

    return NextResponse.json({
      message: "Child statistics fetched successfully",
      stats,
    });
  } catch (error) {
    console.error("Error fetching child statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch child statistics" },
      { status: 500 }
    );
  }
}
