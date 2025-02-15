// File path: app/api/auth/parent/child-stats/route.ts

import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Authenticate the parent
    const user = authenticateToken(req);
    if (!user || user.role !== "parent") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Fetch parent with child data
    const parent = await User.findById(user.userId)
      .populate("child.savedArticles")
      .populate("child.likedArticles");

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    const child = parent.child;

    // Calculate statistics
    const stats = {
      savedArticles: child.savedArticles || [],
      likedArticles: child.likedArticles || [],
      timeSpent: child.timeLimit - (child.remainingTime || 0),
      lastLogin: child.lastLoginDate,
      username: child.username,
      access_code: child.access_code || null,
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
