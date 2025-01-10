import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { username } = await req.json();

    const parent = await User.findOne({ "child.username": username });
    if (!parent) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const child = parent.child;
    if (!child) {
      return NextResponse.json({ error: "Invalid username" }, { status: 401 });
    }

    const now = new Date();
    const sessionStartTime = child.sessionStartTime;

    if (!sessionStartTime) {
      return NextResponse.json(
        { error: "Session not started" },
        { status: 400 }
      );
    }

    const elapsedMinutes = Math.floor(
      (now.getTime() - sessionStartTime.getTime()) / 60000
    );
    const remainingTime = child.timeLimit - elapsedMinutes;

    if (remainingTime <= 0) {
      child.sessionStartTime = null; // End session
      await parent.save();
      return NextResponse.json(
        { message: "Session expired", remainingTime: 0 },
        { status: 200 }
      );
    }

    return NextResponse.json({ remainingTime });
  } catch (error) {
    console.error("Error tracking time:", error);
    return NextResponse.json(
      { error: "Failed to track time" },
      { status: 500 }
    );
  }
}
