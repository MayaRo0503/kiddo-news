import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    console.log("🔹 Child login route hit");
    await dbConnect();

    const { username, password } = await req.json();
    console.log("🛂 Checking username:", username);

    const parent = await User.findOne({ "child.username": username });
    if (!parent) {
      console.log("❌ Child not found in database");
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const child = parent.child;
    if (!child || child.username !== username) {
      console.log("❌ Invalid username");
      return NextResponse.json({ error: "Invalid username" }, { status: 401 });
    }

    // Authenticate using either access_code or parent's password
    let isAuthenticated = false;

    if (child.access_code) {
      console.log("🔑 Checking access code authentication...");
      if (child.access_code === password.trim()) {
        isAuthenticated = true;
      }
    } else {
      console.log("🔑 Checking password authentication...");
      isAuthenticated = bcrypt.compareSync(password.trim(), parent.password);
    }

    if (!isAuthenticated) {
      console.log("❌ Invalid access code or password");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!child.approvedByParent) {
      console.log("🚫 Parent has not approved child access yet");
      return NextResponse.json(
        { error: "Access not approved by parent" },
        { status: 403 }
      );
    }

    // Reset remaining time if it’s a new day
    const currentDate = new Date().toISOString().split("T")[0];
    const childLastLoginDate = child.lastLoginDate
      ? new Date(child.lastLoginDate).toISOString().split("T")[0]
      : null;
    if (childLastLoginDate !== currentDate) {
      console.log("🔄 Resetting daily time limit...");
      child.lastLoginDate = currentDate;
      child.remainingTime = child.timeLimit; // Reset full daily limit
      child.timeSpent = 0; // Reset time spent
      child.sessionStartTime = null; // Reset session start time
    }

    // Determine if the child can access articles
    const canAccessArticles = child.remainingTime > 0;

    // Update session start time
    child.sessionStartTime = new Date();
    await parent.save();

    console.log("✅ Login successful");

    const token = jwt.sign(
      { userId: parent._id, role: "child", username: child.username },
      process.env.JWT_SECRET || "fallbackSecret",
      { expiresIn: "24h" }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
      child: {
        name: child.name,
        username: child.username,
        timeLimit: child.timeLimit,
        remainingTime: child.remainingTime,
        canAccessArticles, // New flag to restrict article access
      },
    });
  } catch (error) {
    console.error("🔥 Child login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
