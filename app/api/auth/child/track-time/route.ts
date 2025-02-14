import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateToken } from "../../common/middleware";
import { isSameDay } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = authenticateToken(req);

    const username = user?.username as string;
    if (!username) {
      return NextResponse.json(
        { error: "Username not found" },
        { status: 404 }
      );
    }

    const parent = await User.findOne({ "child.username": username });

    if (!parent) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const child = parent.child;
    if (!child) {
      return NextResponse.json({ error: "Invalid username" }, { status: 401 });
    }

    const now = new Date();

    // If it's a new day, reset timeSpent
    if (!isSameDay(now, child.lastLoginDate)) {
      child.timeSpent = 0;
      child.sessionStartTime = null;
      child.lastLoginDate = now;
    }

    // Start a new session if necessary
    if (!child.sessionStartTime) {
      child.sessionStartTime = now;
    } else {
      // Calculate elapsed time
      const elapsed = Math.floor(
        (now.getTime() - child.sessionStartTime.getTime()) / (1000 * 60)
      );
      child.timeSpent = Math.min(child.timeSpent + elapsed, child.timeLimit);
    }

    // If time is up, reset sessionStartTime
    if (child.timeSpent >= child.timeLimit) {
      child.sessionStartTime = null;
    }

    await parent.save();

    return NextResponse.json({
      remainingTime: Math.max(0, child.timeLimit - child.timeSpent),
    });
  } catch (error) {
    console.error("Error tracking time:", error);
    return NextResponse.json(
      { error: "Failed to track time" },
      { status: 500 }
    );
  }
}
