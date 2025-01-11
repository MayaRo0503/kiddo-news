import jwt from "jsonwebtoken";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";

// Step 1: Add the JwtPayload interface
interface JwtPayload {
  userId: string;
}

export async function GET(req: Request) {
  try {
    // Parse the token from the query string
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is missing" },
        { status: 400 }
      );
    }

    // Step 2: Update the jwt.verify call
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Connect to the database
    await dbConnect();

    // Find the user and update `verified` to true
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.verified) {
      return NextResponse.json({
        message: "Email is already verified",
      });
    }

    user.verified = true;
    await user.save();

    return NextResponse.json({
      message: "Email verification successful. You can now log in.",
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { error: "Invalid or expired verification token" },
      { status: 400 }
    );
  }
}
