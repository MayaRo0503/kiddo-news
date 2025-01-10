import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
export function authenticateToken(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authentication token is missing or invalid" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded; // Pass the decoded token to the next handler
  } catch (error) {
    console.error("JWT verification error:", error); // Log the error for debugging
    return NextResponse.json(
      { error: "Authentication token is invalid" },
      { status: 401 }
    );
  }
}
