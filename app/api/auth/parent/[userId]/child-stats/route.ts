// app/api/auth/parent/[userId]/child-stats/route.ts
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Article from "@/models/Article";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Connect to the database
    await dbConnect();

    // Extract the userId from the route parameters
    const { userId } = params;

    // Authenticate the parent (using the same pattern as in your working POST endpoint)
    const user = await authenticateToken(req);
    if (!user || user.role !== "parent" || user.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Fetch the parent's document (which holds the embedded child)
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

    // Calculate additional statistics
    const stats = {
      savedArticles,
      likedArticles,
      timeSpent: child.timeLimit - (child.remainingTime || 0),
      lastLogin: child.lastLoginDate,
      username: child.username,
      access_code: child.access_code, // Include if needed
      timeLimit: child.timeLimit, // Include if needed
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
