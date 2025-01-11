import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function authenticateToken(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication token is missing or invalid" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallbackSecret"
    );

    return decoded; // Return the decoded token to be used in subsequent logic
  } catch (error) {
    // Safely access the error message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("JWT verification error:", errorMessage);

    return NextResponse.json(
      { error: "Authentication token is invalid" },
      { status: 401 }
    );
  }
}
