// app/api/auth/parent/[userId]/child-stats/route.ts
import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import RawArticle from "@/models/RawArticle";
import { authenticateToken } from "@/app/api/auth/common/middleware";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Connect to the database
    await dbConnect();

    // Extract the userId from the route parameters
    const { userId } = await params;

    // Authenticate the parent (using the same pattern as in your working POST endpoint)
    const user = authenticateToken(req);
    if (!user || user.role !== "parent" || user.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Fetch parent document including the child's embedded data
    const parent = await User.findById(userId).lean();
    if (!parent || !parent.child) {
      return NextResponse.json(
        { error: "Child profile not found" },
        { status: 404 }
      );
    }

    const child = parent.child;

    // Convert article IDs to ObjectId (only if they are stored as strings)
    const savedArticleObjectIds =
      child.savedArticles?.map((id) => new mongoose.Types.ObjectId(id)) || [];
    const likedArticleObjectIds =
      child.likedArticles?.map((id) => new mongoose.Types.ObjectId(id)) || [];

    // Fetch articles from the correct collection (rawarticles)
    const savedArticles = savedArticleObjectIds.length
      ? await RawArticle.find({ _id: { $in: savedArticleObjectIds } })
          .select("_id title")
          .lean()
      : [];

    const likedArticles = likedArticleObjectIds.length
      ? await RawArticle.find({ _id: { $in: likedArticleObjectIds } })
          .select("_id title")
          .lean()
      : [];

    return NextResponse.json({
      message: "Child statistics fetched successfully",
      stats: {
        username: child.username,
        lastLogin: child.lastLoginDate,
        timeSpent: child.timeLimit - (child.remainingTime || 0),
        timeLimit: child.timeLimit,
        access_code: child.access_code,
        likedArticles,
        savedArticles,
      },
    });
  } catch (error) {
    console.error("Error fetching child statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch child statistics" },
      { status: 500 }
    );
  }
}
