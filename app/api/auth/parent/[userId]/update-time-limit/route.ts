import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId } = await params;
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
    // Calculate the time already spent using the previous values.
    // If these values are undefined, default to 0.
    const previousTimeLimit = parent.child.timeLimit || 0;
    const previousRemainingTime = parent.child.remainingTime || 0;
    const timeSpent = previousTimeLimit - previousRemainingTime;

    // Update the timeLimit to the new value.
    parent.child.timeLimit = timeLimit;

    // Recalculate the remainingTime based on the new timeLimit and the previously spent time.
    parent.child.remainingTime = Math.max(0, timeLimit - timeSpent);

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
