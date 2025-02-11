import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "../common/utils"; // adjust import path if needed

// Example POST route to generate a token
export async function POST(req: NextRequest) {
  // 1. Parse the request body to get user info or roles
  //    For a simple test, let’s assume we accept some JSON with an "isAdmin" flag
  //    or you can hardcode a payload.

  // Example: Hardcode an admin token
  const payload = {
    isAdmin: true,
    email: "admin@example.com",
    // ...any other fields you want
  };

  // 2. Generate the token
  const token = generateToken(payload);

  // 3. Return the token
  return NextResponse.json({ token });
}
