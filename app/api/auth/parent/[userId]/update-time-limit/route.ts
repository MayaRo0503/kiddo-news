import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await dbConnect();

    const user = authenticateToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "parent") {
      return NextResponse.json(
        { error: "Access restricted to parents only" },
        { status: 403 }
      );
    }

    const { userId } = params;
    if (user.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { timeLimit } = await req.json();

    if (typeof timeLimit !== "number" || timeLimit < 0) {
      return NextResponse.json(
        { error: "Invalid time limit value" },
        { status: 400 }
      );
    }

    const parent = await User.findById(userId);
    if (!parent || !parent.child) {
      return NextResponse.json(
        { error: "Parent or child not found" },
        { status: 404 }
      );
    }

    // Update timeLimit
    parent.child.timeLimit = timeLimit;

    // Calculate remainingTime
    const sessionStartTime = parent.child.sessionStartTime
      ? new Date(parent.child.sessionStartTime)
      : new Date();
    const elapsedMinutes =
      (Date.now() - sessionStartTime.getTime()) / (1000 * 60); // Convert milliseconds to minutes
    const remainingTime = Math.max(0, timeLimit - elapsedMinutes); // Ensure non-negative remaining time

    parent.child.remainingTime = Math.round(remainingTime);
    parent.child.sessionStartTime = new Date(); // Reset session start time

    await parent.save();

    return NextResponse.json({
      message: "Time limit and remaining time updated successfully",
      newTimeLimit: timeLimit,
      remainingTime: parent.child.remainingTime,
    });
  } catch (error) {
    console.error("Error updating time limit:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
